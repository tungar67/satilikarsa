import { upload } from "@vercel/blob/client";
import { MAINTENANCE_PASSWORD } from "@/lib/gate";
import { getClip } from "@/lib/media-store";
import type { SiteContent } from "@/lib/site-content";

export async function uploadPublic(file: File, folder: "photos" | "videos") {
  const safe = file.name.replace(/[^\w.]+/g, "-").replace(/^-|-$/g, "") || "file";
  const blob = await upload(`${folder}/${crypto.randomUUID()}-${safe}`, file, {
    access: "public",
    handleUploadUrl: "/api/blob",
    clientPayload: JSON.stringify({ password: MAINTENANCE_PASSWORD }),
  });
  return blob.url;
}

async function toPublicUrl(src: string) {
  if (!src.startsWith("data:") && !src.startsWith("idb:")) return src;
  if (src.startsWith("idb:")) {
    const stored = await getClip(src.slice(4));
    if (!stored) throw new Error("A video saved only in this browser could not be found.");
    return uploadPublic(new File([stored], "clip.mp4", { type: stored.type || "video/mp4" }), "videos");
  }
  const res = await fetch(src);
  const blob = await res.blob();
  const ext = blob.type.includes("png") ? "png" : "jpg";
  return uploadPublic(new File([blob], `photo.${ext}`, { type: blob.type || "image/jpeg" }), "photos");
}

export async function publishable(content: SiteContent): Promise<SiteContent> {
  const cache = new Map<string, Promise<string>>();
  const once = (src: string) => {
    const pending = cache.get(src);
    if (pending) return pending;
    const next = toPublicUrl(src);
    cache.set(src, next);
    return next;
  };
  const holdings = [];
  for (const holding of content.holdings) {
    const heroSrc = holding.hero ? await once(holding.hero) : "";
    const gallery = [];
    for (const shot of holding.gallery) gallery.push({ ...shot, src: await once(shot.src) });
    const videos = [];
    for (const clip of holding.videos ?? []) videos.push({ ...clip, src: await once(clip.src) });
    const hero = gallery.some((shot) => shot.src === heroSrc) ? heroSrc : (gallery[0]?.src ?? "");
    holdings.push({ ...holding, gallery, videos, hero });
  }
  return { ...content, holdings };
}
