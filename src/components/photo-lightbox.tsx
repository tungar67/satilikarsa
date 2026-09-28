import { useEffect, useState } from "react";

export type Frame = { src: string; alt: string };

export function PhotoGrid({
  shots,
  closeLabel = "Close",
  prevLabel = "Prev",
  nextLabel = "Next",
}: {
  shots: Frame[];
  closeLabel?: string;
  prevLabel?: string;
  nextLabel?: string;
}) {
  const [index, setIndex] = useState<number | null>(null);
  return (
    <>
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {shots.map((shot, i) => (
          <button
            key={shot.src + i}
            type="button"
            onClick={() => setIndex(i)}
            className="overflow-hidden rounded-card text-left"
          >
            <img src={shot.src} alt={shot.alt} className="h-40 w-full object-cover sm:h-48" />
          </button>
        ))}
      </div>
      {index != null ? (
        <Lightbox
          shots={shots}
          index={index}
          onIndex={setIndex}
          onClose={() => setIndex(null)}
          closeLabel={closeLabel}
          prevLabel={prevLabel}
          nextLabel={nextLabel}
        />
      ) : null}
    </>
  );
}

export function Lightbox({
  shots,
  index,
  onIndex,
  onClose,
  closeLabel = "Close",
  prevLabel = "Prev",
  nextLabel = "Next",
}: {
  shots: Frame[];
  index: number;
  onIndex: (index: number) => void;
  onClose: () => void;
  closeLabel?: string;
  prevLabel?: string;
  nextLabel?: string;
}) {
  const shot = shots[index];
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onIndex((index + 1) % shots.length);
      if (e.key === "ArrowLeft") onIndex((index - 1 + shots.length) % shots.length);
    };
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [index, onClose, onIndex, shots.length]);

  if (!shot) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-olive-deep/92 p-4" onClick={onClose} role="dialog" aria-modal="true">
      <button type="button" onClick={onClose} className="absolute top-4 right-4 rounded-full bg-paper px-4 py-2 text-sm text-ink">
        {closeLabel}
      </button>
      {shots.length > 1 ? (
        <button
          type="button"
          aria-label={prevLabel}
          onClick={(e) => {
            e.stopPropagation();
            onIndex((index - 1 + shots.length) % shots.length);
          }}
          className="absolute top-1/2 left-3 -translate-y-1/2 rounded-full bg-paper px-3 py-2 text-sm text-ink"
        >
          {prevLabel}
        </button>
      ) : null}
      <figure onClick={(e) => e.stopPropagation()} className="flex max-h-full max-w-full flex-col items-center">
        <img src={shot.src} alt={shot.alt} className="max-h-[86vh] max-w-[92vw] object-contain" />
        {shot.alt ? <figcaption className="mt-3 text-sm text-paper">{shot.alt}</figcaption> : null}
      </figure>
      {shots.length > 1 ? (
        <button
          type="button"
          aria-label={nextLabel}
          onClick={(e) => {
            e.stopPropagation();
            onIndex((index + 1) % shots.length);
          }}
          className="absolute top-1/2 right-3 -translate-y-1/2 rounded-full bg-paper px-3 py-2 text-sm text-ink"
        >
          {nextLabel}
        </button>
      ) : null}
    </div>
  );
}
