import { useEffect, useState } from "react";
import { getClip } from "@/lib/media-store";

export function ClipPlayer({ src }: { src: string }) {
  const [url, setUrl] = useState(src.startsWith("idb:") ? "" : src);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!src.startsWith("idb:")) {
      setUrl(src);
      setFailed(false);
      return;
    }
    let revoke = "";
    let dead = false;
    setUrl("");
    setFailed(false);
    getClip(src.slice(4))
      .then((blob) => {
        if (dead) return;
        if (!blob) {
          setFailed(true);
          return;
        }
        revoke = URL.createObjectURL(blob);
        setUrl(revoke);
      })
      .catch(() => {
        if (!dead) setFailed(true);
      });
    return () => {
      dead = true;
      if (revoke) URL.revokeObjectURL(revoke);
    };
  }, [src]);

  if (failed) {
    return <p className="rounded-card bg-olive-deep px-4 py-8 text-sm text-paper">This browser cannot play that video. An MP4 file works best.</p>;
  }
  if (!url) {
    return <p className="rounded-card bg-olive-deep px-4 py-8 text-sm text-paper">Loading video…</p>;
  }
  return (
    <video
      key={url}
      src={url}
      controls
      playsInline
      preload="metadata"
      className="mx-auto block max-h-[36rem] w-auto max-w-full rounded-card bg-olive-deep"
      onError={() => setFailed(true)}
    />
  );
}
