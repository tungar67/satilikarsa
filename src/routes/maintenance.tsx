import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { ClipPlayer } from "@/components/clip-player";
import { defaultContent, ui, useSite, type PublicHolding, type PublicParcel, type SiteContent } from "@/lib/site-content";
import { deleteClip } from "@/lib/media-store";
import { uploadPublic } from "@/lib/upload-media";
import { tx, useLang, type Text } from "@/lib/lang";

const GATE = "gencel";

export const Route = createFileRoute("/maintenance")({
  component: MaintenancePage,
});

function MaintenancePage() {
  const { content, ready, save, reset } = useSite();
  const { lang } = useLang();
  const [password, setPassword] = useState("");
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [draft, setDraft] = useState<SiteContent>(content);
  const [saved, setSaved] = useState(false);
  const [problem, setProblem] = useState("");
  const draftRef = useRef(draft);
  draftRef.current = draft;

  useEffect(() => {
    if (open && ready) setDraft(content);
  }, [open, ready]);

  function unlock(e: React.FormEvent) {
    e.preventDefault();
    if (password === GATE) {
      setOpen(true);
      setError("");
      setDraft(content);
    } else {
      setError(tx(ui.badPassword, lang));
    }
  }

  function commit() {
    setProblem("");
    void save(draftRef.current)
      .then(() => setSaved(true))
      .catch(() => {
        setSaved(false);
        setProblem(tx(ui.saveFailed, lang));
      });
  }

  function applyHolding(index: number, next: PublicHolding) {
    const current = draftRef.current.holdings[index];
    const updated = {
      ...draftRef.current,
      holdings: draftRef.current.holdings.map((item, idx) => (idx === index ? next : item)),
    };
    draftRef.current = updated;
    setDraft(updated);
    const pictures =
      current != null && (next.gallery !== current.gallery || next.hero !== current.hero || next.videos !== current.videos);
    if (pictures) {
      setProblem("");
      void save(updated)
        .then(() => setSaved(true))
        .catch(() => {
          setSaved(false);
          setProblem(tx(ui.saveFailed, lang));
        });
    }
  }

  return (
    <div>
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-4 py-10">
        {open ? null : (
        <form onSubmit={unlock} className="rounded-card border border-line bg-card p-4">
          <label className="block text-sm font-medium">
            {tx(ui.password, lang)}
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              className="mt-1 w-full rounded-xl border border-line bg-paper px-3 py-3 outline-none"
            />
          </label>
          <button type="submit" className="mt-3 rounded-full bg-olive-deep px-5 py-3 text-sm font-medium text-paper">
            {tx(ui.unlock, lang)}
          </button>
          {error ? <p className="mt-2 text-sm text-gold">{error}</p> : null}
        </form>
        )}

        {open ? (
          <div className="mt-8 flex flex-col gap-4">
            <Section title={tx(ui.welcome, lang)}>
              <BiField label="Site name" value={draft.welcome.siteName} onChange={(v) => patchWelcome(setDraft, "siteName", v)} />
              <BiField label="Tagline" value={draft.welcome.tagline} onChange={(v) => patchWelcome(setDraft, "tagline", v)} />
              <BiField label="Kicker" value={draft.welcome.kicker} onChange={(v) => patchWelcome(setDraft, "kicker", v)} />
              <BiField label="Headline" value={draft.welcome.title} onChange={(v) => patchWelcome(setDraft, "title", v)} rows={2} />
              <BiField label="Introduction" value={draft.welcome.lede} onChange={(v) => patchWelcome(setDraft, "lede", v)} rows={3} />
              <BiField label="Portfolio heading" value={draft.welcome.portfolioTitle} onChange={(v) => patchWelcome(setDraft, "portfolioTitle", v)} />
              <BiField label="Portfolio text" value={draft.welcome.portfolioLede} onChange={(v) => patchWelcome(setDraft, "portfolioLede", v)} rows={3} />
              <BiField label="Footer" value={draft.welcome.footer} onChange={(v) => patchWelcome(setDraft, "footer", v)} rows={2} />
            </Section>

            {draft.holdings.map((h, i) => (
              <Section key={h.slug} title={h.name.en}>
                <HoldingEditor holding={h} onChange={(next) => applyHolding(i, next)} />
              </Section>
            ))}

            <Section title={tx(ui.contact, lang)}>
              <BiField label="Heading" value={draft.contact.title} onChange={(v) => setDraft((d) => ({ ...d, contact: { ...d.contact, title: v } }))} />
              <BiField label="Introduction" value={draft.contact.lede} onChange={(v) => setDraft((d) => ({ ...d, contact: { ...d.contact, lede: v } }))} rows={3} />
              <Field label="Office email" value={draft.contact.email} onChange={(v) => setDraft((d) => ({ ...d, contact: { ...d.contact, email: v } }))} />
            </Section>

            <div className="flex flex-wrap gap-3">
              <button type="button" onClick={commit} className="rounded-full bg-olive-deep px-5 py-3 text-sm font-medium text-paper">
                {tx(ui.save, lang)}
              </button>
              <button
                type="button"
                onClick={() => {
                  setProblem("");
                  void reset()
                    .then(() => {
                      setDraft(structuredClone(defaultContent));
                      setSaved(true);
                    })
                    .catch(() => {
                      setSaved(false);
                      setProblem(tx(ui.saveFailed, lang));
                    });
                }}
                className="rounded-full border border-line px-5 py-3 text-sm"
              >
                {tx(ui.restore, lang)}
              </button>
            </div>
            {saved ? <p className="text-sm text-olive">{tx(ui.saved, lang)}</p> : null}
            {problem ? <p className="text-sm text-red-800">{problem}</p> : null}
          </div>
        ) : null}
      </main>
    </div>
  );
}

function patchWelcome(setDraft: React.Dispatch<React.SetStateAction<SiteContent>>, key: keyof SiteContent["welcome"], value: Text) {
  setDraft((d) => ({ ...d, welcome: { ...d.welcome, [key]: value } }));
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <details className="rounded-card border border-line bg-card p-4">
      <summary className="cursor-pointer text-2xl">{title}</summary>
      <div className="mt-4 flex flex-col gap-3">{children}</div>
    </details>
  );
}

function Field({
  label,
  value,
  onChange,
  rows,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
}) {
  const cls = "mt-1 w-full rounded-xl border border-line bg-paper px-3 py-2 outline-none";
  return (
    <label className="block text-sm font-medium">
      {label}
      {rows ? (
        <textarea rows={rows} value={value} onChange={(e) => onChange(e.target.value)} className={cls} />
      ) : (
        <input value={value} onChange={(e) => onChange(e.target.value)} className={cls} />
      )}
    </label>
  );
}

function BiField({
  label,
  value,
  onChange,
  rows,
}: {
  label: string;
  value: Text;
  onChange: (value: Text) => void;
  rows?: number;
}) {
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      <Field label={`${label} · EN`} value={value.en} onChange={(en) => onChange({ ...value, en })} rows={rows} />
      <Field label={`${label} · TR`} value={value.tr} onChange={(tr) => onChange({ ...value, tr })} rows={rows} />
    </div>
  );
}

function HoldingEditor({ holding, onChange }: { holding: PublicHolding; onChange: (next: PublicHolding) => void }) {
  const [drag, setDrag] = useState<number | null>(null);
  const [videoUrl, setVideoUrl] = useState("");
  const videos = holding.videos ?? [];
  const set = <K extends keyof PublicHolding>(key: K, value: PublicHolding[K]) => onChange({ ...holding, [key]: value });
  const shift = (index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (target < 0 || target >= holding.gallery.length) return;
    const next = moveItem(holding.gallery, index, target);
    onChange({ ...holding, gallery: next, hero: next[0]?.src ?? "" });
  };
  return (
    <>
      <BiField label="Name" value={holding.name} onChange={(v) => set("name", v)} />
      <Field label="Index" value={holding.index} onChange={(v) => set("index", v)} />
      <Field label="Slug" value={holding.slug} onChange={(v) => set("slug", v)} />
      <BiField label="Region" value={holding.region} onChange={(v) => set("region", v)} />
      <BiField label="Kind" value={holding.kind} onChange={(v) => set("kind", v)} />
      <BiField label="Card summary" value={holding.blurb} onChange={(v) => set("blurb", v)} rows={2} />
      <BiField label="Story" value={holding.story} onChange={(v) => set("story", v)} rows={5} />
      <BiField label="Note" value={holding.note} onChange={(v) => set("note", v)} rows={2} />
      <Field label="Hero image path" value={holding.hero} onChange={(v) => set("hero", v)} />
      <Field label="Latitude" value={String(holding.lat)} onChange={(v) => set("lat", Number(v) || 0)} />
      <Field label="Longitude" value={String(holding.lng)} onChange={(v) => set("lng", Number(v) || 0)} />
      <Field label="Map zoom" value={String(holding.zoom)} onChange={(v) => set("zoom", Number(v) || 0)} />
      <p className="text-sm font-medium">Facts</p>
      {holding.facts.map((fact, i) => (
        <div key={i} className="grid gap-2 sm:grid-cols-2">
          <BiField label="Label" value={fact.label} onChange={(label) => set("facts", replaceAt(holding.facts, i, { ...fact, label }))} />
          <BiField label="Value" value={fact.value} onChange={(value) => set("facts", replaceAt(holding.facts, i, { ...fact, value }))} />
        </div>
      ))}
      <button
        type="button"
        className="text-sm text-olive underline"
        onClick={() => set("facts", [...holding.facts, { label: { en: "Label", tr: "Etiket" }, value: { en: "", tr: "" } }])}
      >
        Add fact
      </button>
      <p className="text-sm font-medium">Pictures — drag, or use the arrows. The first picture is the cover. A removal is kept in this browser.</p>
      <div className="flex flex-col gap-3">
        {holding.gallery.map((shot, i) => (
          <div
            key={shot.src + i}
            draggable
            onDragStart={() => setDrag(i)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => {
              if (drag == null || drag === i) return;
              const next = moveItem(holding.gallery, drag, i);
              onChange({ ...holding, gallery: next, hero: next[0]?.src ?? "" });
              setDrag(null);
            }}
            className="grid items-center gap-3 rounded-xl border border-line bg-paper p-2 sm:grid-cols-[7rem_1fr_auto]"
          >
            <img src={shot.src} alt="" className="h-24 w-full rounded-lg object-cover" />
            <BiField label="Description" value={shot.alt} onChange={(alt) => set("gallery", replaceAt(holding.gallery, i, { ...shot, alt }))} />
            <div className="flex flex-wrap gap-2">
              <button type="button" className="rounded-full border border-line px-3 py-2 text-sm" onClick={() => shift(i, -1)} disabled={i === 0}>
                Up
              </button>
              <button type="button" className="rounded-full border border-line px-3 py-2 text-sm" onClick={() => shift(i, 1)} disabled={i === holding.gallery.length - 1}>
                Down
              </button>
              <button
                type="button"
                className="rounded-full border border-line px-3 py-2 text-sm"
                onClick={() => {
                  const next = moveItem(holding.gallery, i, 0);
                  onChange({ ...holding, gallery: next, hero: next[0]?.src ?? "" });
                }}
              >
                Cover
              </button>
              <button
                type="button"
                className="rounded-full border border-line px-3 py-2 text-sm"
                onClick={() => {
                  const next = holding.gallery.filter((_, idx) => idx !== i);
                  onChange({ ...holding, gallery: next, hero: next[0]?.src ?? "" });
                }}
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
      <label className="text-sm font-medium">
        Add pictures
        <input
          type="file"
          accept="image/*"
          multiple
          className="mt-1 block w-full text-sm"
          onChange={(e) => {
            const files = Array.from(e.target.files ?? []);
            e.target.value = "";
            void (async () => {
              const added = [];
              for (const file of files) {
                const name = file.name.replace(/\.[^.]+$/, "");
                const src = await uploadPublic(file, "photos");
                added.push({ src, alt: { en: name, tr: name } });
              }
              const next = [...holding.gallery, ...added];
              onChange({ ...holding, gallery: next, hero: holding.hero || next[0]?.src || "" });
            })().catch((error: unknown) => {
              const message = error instanceof Error ? error.message : "";
              window.alert(
                message.toLowerCase().includes("suspended")
                  ? "Picture storage is paused on the hosting account, so the picture was not saved."
                  : "Could not upload that picture.",
              );
            });
          }}
        />
      </label>
      <p className="text-sm font-medium">Videos — the first is not the cover. MP4 plays in every browser.</p>
      <div className="flex flex-col gap-3">
        {videos.map((clip, i) => (
          <div key={clip.src + i} className="grid items-center gap-3 rounded-xl border border-line bg-paper p-2 sm:grid-cols-[10rem_1fr_auto]">
            <ClipPlayer src={clip.src} />
            <BiField label="Description" value={clip.alt} onChange={(alt) => set("videos", replaceAt(videos, i, { ...clip, alt }))} />
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className="rounded-full border border-line px-3 py-2 text-sm"
                disabled={i === 0}
                onClick={() => set("videos", moveItem(videos, i, i - 1))}
              >
                Up
              </button>
              <button
                type="button"
                className="rounded-full border border-line px-3 py-2 text-sm"
                disabled={i === videos.length - 1}
                onClick={() => set("videos", moveItem(videos, i, i + 1))}
              >
                Down
              </button>
              <button
                type="button"
                className="rounded-full border border-line px-3 py-2 text-sm"
                onClick={() => {
                  if (clip.src.startsWith("idb:")) void deleteClip(clip.src.slice(4));
                  set("videos", videos.filter((_, idx) => idx !== i));
                }}
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
      <label className="text-sm font-medium">
        Add videos
        <input
          type="file"
          accept="video/mp4,video/webm,video/quicktime,video/*"
          multiple
          className="mt-1 block w-full text-sm"
          onChange={(e) => {
            const files = Array.from(e.target.files ?? []);
            e.target.value = "";
            void (async () => {
              const added = [];
              for (const file of files) {
                const name = file.name.replace(/\.[^.]+$/, "");
                const src = await uploadPublic(file, "videos");
                added.push({ src, alt: { en: name, tr: name } });
              }
              onChange({ ...holding, videos: [...videos, ...added] });
            })().catch(() => window.alert("Could not upload that video."));
          }}
        />
      </label>
      <div className="flex flex-wrap items-end gap-2">
        <label className="min-w-0 flex-1 text-sm font-medium">
          Or paste a video address
          <input
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            placeholder="https://…/film.mp4"
            className="mt-1 w-full rounded-xl border border-line bg-paper px-3 py-2 outline-none"
          />
        </label>
        <button
          type="button"
          className="rounded-full border border-line px-4 py-2 text-sm"
          onClick={() => {
            const src = videoUrl.trim();
            if (!src) return;
            onChange({ ...holding, videos: [...videos, { src, alt: { en: "Video", tr: "Video" } }] });
            setVideoUrl("");
          }}
        >
          Add address
        </button>
      </div>
      {holding.groups ? (
        <>
          <p className="text-sm font-medium">Village groups</p>
          {holding.groups.map((g, i) => (
            <div key={i} className="grid gap-2">
              <BiField label="Group" value={g.name} onChange={(name) => set("groups", replaceAt(holding.groups!, i, { ...g, name }))} />
              <div className="grid grid-cols-3 gap-2">
                <Field label="Deeds" value={String(g.parcels)} onChange={(v) => set("groups", replaceAt(holding.groups!, i, { ...g, parcels: Number(v) || 0 }))} />
                <Field label="Gross" value={g.gross} onChange={(gross) => set("groups", replaceAt(holding.groups!, i, { ...g, gross }))} />
                <Field label="Share" value={g.share} onChange={(share) => set("groups", replaceAt(holding.groups!, i, { ...g, share }))} />
              </div>
            </div>
          ))}
        </>
      ) : null}
      {holding.parcels ? (
        <>
          <p className="text-sm font-medium">Parcels</p>
          {holding.parcels.map((p, i) => (
            <ParcelRow key={`${p.ada}-${p.parsel}-${i}`} parcel={p} onChange={(next) => set("parcels", replaceAt(holding.parcels!, i, next))} />
          ))}
        </>
      ) : null}
    </>
  );
}

function ParcelRow({ parcel, onChange }: { parcel: PublicParcel; onChange: (next: PublicParcel) => void }) {
  return (
    <div className="rounded-xl border border-line p-3">
      {parcel.image ? <img src={parcel.image} alt="" className="mb-2 h-28 w-full rounded-xl object-cover" /> : null}
      <div className="grid grid-cols-3 gap-2">
        <Field label="Village" value={parcel.village} onChange={(village) => onChange({ ...parcel, village })} />
        <Field label="Ada" value={parcel.ada} onChange={(ada) => onChange({ ...parcel, ada })} />
        <Field label="Parsel" value={parcel.parsel} onChange={(parsel) => onChange({ ...parcel, parsel })} />
        <Field label="m²" value={parcel.area} onChange={(area) => onChange({ ...parcel, area })} />
        <Field label="Share m²" value={parcel.share} onChange={(share) => onChange({ ...parcel, share })} />
        <Field label="Card image" value={parcel.image ?? ""} onChange={(image) => onChange({ ...parcel, image })} />
      </div>
      <BiField label="Nitelik" value={parcel.nitelik} onChange={(nitelik) => onChange({ ...parcel, nitelik })} />
    </div>
  );
}

function moveItem<T>(list: T[], from: number, to: number): T[] {
  const next = [...list];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

function replaceAt<T>(list: T[], index: number, next: T): T[] {
  return list.map((item, i) => (i === index ? next : item));
}