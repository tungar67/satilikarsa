import { put } from "@vercel/blob";
import { getCache } from "@vercel/functions";
import { MAINTENANCE_PASSWORD } from "./gate.ts";
import type { SiteContent } from "./site-content.tsx";

const PATH = "site-content.json";
const CACHE_KEY = "gencel-site-content";
/** How long one server keeps a copy before it checks the shared cache again. */
const MEMORY_MS = 5_000;
/** Shared cache lifetime after a successful read or save. */
const FRESH_SECONDS = 60 * 60 * 24;
/** While Blob is paused, don't ask again on every page view. */
const PAUSED_SECONDS = 10 * 60;

type Stored = { found: true; content: SiteContent } | { found: false };

let memory: { until: number; content: SiteContent | null } | null = null;
let pending: Promise<SiteContent | null> | null = null;

function valid(value: unknown): value is SiteContent {
  if (!value || typeof value !== "object") return false;
  const content = value as SiteContent;
  const title = content.welcome?.title;
  return !!title && typeof title === "object" && "en" in title && "tr" in title && Array.isArray(content.holdings);
}

function isStored(value: unknown): value is Stored {
  if (!value || typeof value !== "object") return false;
  const stored = value as Stored;
  if (stored.found === false) return true;
  return stored.found === true && valid(stored.content);
}

/**
 * Public files live at https://<storeId>.public.blob.vercel-storage.com/<path>.
 * The store id is the fourth piece of the read-write token, so this needs no Blob API call.
 * Same split the Blob SDK uses.
 */
export function publicContentUrl(token: string | undefined): string | null {
  const storeId = token?.split("_")[3]?.trim();
  if (!storeId) return null;
  return `https://${storeId}.public.blob.vercel-storage.com/${PATH}`;
}

function remember(content: SiteContent | null): SiteContent | null {
  memory = { until: Date.now() + MEMORY_MS, content };
  return content;
}

async function readRuntime(): Promise<Stored | null> {
  try {
    const value = await getCache().get(CACHE_KEY);
    return isStored(value) ? value : null;
  } catch {
    return null;
  }
}

async function writeRuntime(content: SiteContent | null): Promise<void> {
  const stored: Stored = content ? { found: true, content } : { found: false };
  try {
    await getCache().set(CACHE_KEY, stored, {
      ttl: content ? FRESH_SECONDS : PAUSED_SECONDS,
      name: "site-content",
    });
  } catch {
    /* The in-memory copy still serves this server. */
  }
}

async function fetchPublic(): Promise<SiteContent | null> {
  const url = publicContentUrl(process.env.BLOB_READ_WRITE_TOKEN);
  if (!url) return null;
  try {
    // A normal fetch can be a CDN hit. cache: "no-store" would make every read a paid Blob miss.
    const res = await fetch(url);
    if (!res.ok) return null;
    const json: unknown = await res.json();
    return valid(json) ? json : null;
  } catch {
    return null;
  }
}

async function load(): Promise<SiteContent | null> {
  const cached = await readRuntime();
  if (cached) return remember(cached.found ? cached.content : null);
  const content = await fetchPublic();
  await writeRuntime(content);
  return remember(content);
}

export async function readPublished(): Promise<SiteContent | null> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return null;
  if (memory && memory.until > Date.now()) return memory.content;
  if (!pending) {
    pending = load().finally(() => {
      pending = null;
    });
  }
  return pending;
}

export async function writePublished(password: string, content: SiteContent): Promise<SiteContent> {
  if (password !== MAINTENANCE_PASSWORD) throw new Error("That password is not correct.");
  if (!valid(content)) throw new Error("The page content is not valid.");
  if (!process.env.BLOB_READ_WRITE_TOKEN) throw new Error("Storage is not configured on the server.");
  await put(PATH, JSON.stringify(content), {
    access: "public",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/json",
    cacheControlMaxAge: 60,
  });
  await writeRuntime(content);
  remember(content);
  return content;
}

/** Test helper. Drops this process's copy but leaves the shared cache. */
export function forgetPublishedMemory(): void {
  memory = null;
}

/** Test helper. Clears this process's copy and the shared cache. */
export async function resetPublishedCache(): Promise<void> {
  memory = null;
  pending = null;
  try {
    await getCache().delete(CACHE_KEY);
  } catch {
    /* ignore */
  }
}
