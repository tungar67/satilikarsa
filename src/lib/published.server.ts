import { BlobNotFoundError, head, put } from "@vercel/blob";
import { MAINTENANCE_PASSWORD } from "@/lib/gate";
import type { SiteContent } from "@/lib/site-content";

const PATH = "site-content.json";

function valid(value: unknown): value is SiteContent {
  if (!value || typeof value !== "object") return false;
  const content = value as SiteContent;
  const title = content.welcome?.title;
  return !!title && typeof title === "object" && "en" in title && "tr" in title && Array.isArray(content.holdings);
}

export async function readPublished(): Promise<SiteContent | null> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return null;
  try {
    const blob = await head(PATH);
    const res = await fetch(blob.url, { cache: "no-store" });
    if (!res.ok) return null;
    const json: unknown = await res.json();
    return valid(json) ? json : null;
  } catch (error) {
    if (error instanceof BlobNotFoundError) return null;
    throw error;
  }
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
    cacheControlMaxAge: 0,
  });
  return content;
}
