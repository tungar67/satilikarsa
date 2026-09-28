import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ParcelMap } from "@/components/parcel-map";
import { ClipPlayer } from "@/components/clip-player";
import { Lightbox, PhotoGrid } from "@/components/photo-lightbox";
import { SiteHeader } from "@/components/site-header";
import { tx, useLang } from "@/lib/lang";
import { ui, useSite } from "@/lib/site-content";

export const Route = createFileRoute("/holdings/$slug")({
  component: HoldingPage,
});

function HoldingPage() {
  const { slug } = Route.useParams();
  const { content } = useSite();
  const { lang } = useLang();
  const [parcelIndex, setParcelIndex] = useState<number | null>(null);
  const holding = content.holdings.find((h) => h.slug === slug);

  if (!holding) {
    return (
      <div>
        <SiteHeader />
        <main className="mx-auto max-w-3xl px-4 py-20">
          <h1 className="text-4xl">{tx(ui.missing, lang)}</h1>
          <Link to="/" className="mt-6 inline-block text-olive underline">
            {tx(ui.back, lang)}
          </Link>
        </main>
      </div>
    );
  }

  const pins =
    holding.parcels?.filter((p) => p.lat != null && p.lng != null).map((p) => ({
      lat: p.lat as number,
      lng: p.lng as number,
      label: `${p.village} · ada ${p.ada} / parsel ${p.parsel}`,
    })) ?? [];
  const mapPins = pins.length > 0 ? pins : [{ lat: holding.lat, lng: holding.lng, label: tx(holding.name, lang) }];

  return (
    <div>
      <SiteHeader />
      <div className="relative h-80 sm:h-[28rem]">
        <img src={holding.hero} alt="" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-olive-deep/40" />
        <div className="absolute bottom-0 mx-auto w-full max-w-6xl px-4 pb-8 text-paper">
          <p className="text-xs font-semibold tracking-widest text-gold uppercase">
            {holding.index} · {tx(holding.region, lang)}
          </p>
          <h1 className="mt-2 text-5xl">{tx(holding.name, lang)}</h1>
          <p className="mt-2 max-w-xl">{tx(holding.kind, lang)}</p>
        </div>
      </div>
      <main className="mx-auto grid max-w-6xl gap-8 px-4 py-10 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <p className="text-lg leading-8">{tx(holding.story, lang)}</p>
          <dl className="mt-6 grid grid-cols-2 gap-3">
            {holding.facts.map((f) => (
              <div key={f.label.en} className="rounded-xl border border-line bg-card px-4 py-3">
                <dt className="text-xs font-semibold tracking-wide text-muted uppercase">{tx(f.label, lang)}</dt>
                <dd className="mt-1 text-lg">{tx(f.value, lang)}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-4 text-sm leading-6 text-muted">{tx(holding.note, lang)}</p>
          <PhotoGrid
            shots={holding.gallery.map((shot) => ({ src: shot.src, alt: tx(shot.alt, lang) }))}
            closeLabel={lang === "tr" ? "Kapat" : "Close"}
            prevLabel={lang === "tr" ? "Önceki" : "Prev"}
            nextLabel={lang === "tr" ? "Sonraki" : "Next"}
          />
          {holding.videos.length > 0 ? (
            <div className="mt-8 flex flex-col gap-4">
              <h2 className="text-2xl">{lang === "tr" ? "Video" : "Video"}</h2>
              {holding.videos.map((clip) => (
                <figure key={clip.src}>
                  <ClipPlayer src={clip.src} />
                  {tx(clip.alt, lang) ? <figcaption className="mt-2 text-sm text-muted">{tx(clip.alt, lang)}</figcaption> : null}
                </figure>
              ))}
            </div>
          ) : null}
          {holding.groups && holding.groups.length > 0 ? (
            <div className="mt-8 overflow-x-auto rounded-card border border-line">
              <table className="w-full min-w-[32rem] text-left text-sm">
                <thead className="bg-line text-xs tracking-wide text-muted uppercase">
                  <tr>
                    <th className="px-3 py-3 font-semibold">{lang === "tr" ? "Set" : "Set"}</th>
                    <th className="px-3 py-3 font-semibold">{lang === "tr" ? "Tapu" : "Deeds"}</th>
                    <th className="px-3 py-3 font-semibold">{lang === "tr" ? "Brüt" : "Gross"}</th>
                    <th className="px-3 py-3 font-semibold">{lang === "tr" ? "Hisse" : "Share"}</th>
                  </tr>
                </thead>
                <tbody>
                  {holding.groups.map((g) => (
                    <tr key={g.name.en} className="border-t border-line">
                      <td className="px-3 py-3">{tx(g.name, lang)}</td>
                      <td className="px-3 py-3">{g.parcels}</td>
                      <td className="px-3 py-3">{g.gross}</td>
                      <td className="px-3 py-3">{g.share}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
          {holding.parcels && holding.parcels.length > 0 ? (
            <div className="mt-6 flex flex-col gap-4">
              {holding.parcels.map((p) => {
                const frames = holding.parcels!.filter((item) => item.image).map((item) => ({
                  src: item.image as string,
                  alt: `${item.village} ${item.ada}/${item.parsel}`,
                }));
                const frameIndex = frames.findIndex((frame) => frame.src === p.image);
                return (
                <article key={`${p.village}-${p.ada}-${p.parsel}`} className="overflow-hidden rounded-card border border-line bg-card sm:grid sm:grid-cols-2">
                  {p.image ? (
                    <button type="button" onClick={() => setParcelIndex(frameIndex)} className="text-left">
                      <img src={p.image} alt={`${p.village} ${p.ada}/${p.parsel}`} className="h-52 w-full object-cover sm:h-full" />
                    </button>
                  ) : null}
                  <div className="p-4">
                    <p className="text-xs font-semibold tracking-widest text-gold uppercase">{p.village}</p>
                    <h3 className="mt-1 text-2xl">
                      Ada {p.ada} · Parsel {p.parsel}
                    </h3>
                    <p className="mt-2 text-muted">{tx(p.nitelik, lang)}</p>
                    <p className="mt-2 text-sm">
                      {p.area} m² · {lang === "tr" ? "hisse" : "share"} {p.share} m²
                    </p>
                  </div>
                </article>
                );
              })}
              {parcelIndex != null ? (
                <Lightbox
                  shots={holding.parcels.filter((item) => item.image).map((item) => ({
                    src: item.image as string,
                    alt: `${item.village} ${item.ada}/${item.parsel}`,
                  }))}
                  index={parcelIndex}
                  onIndex={setParcelIndex}
                  onClose={() => setParcelIndex(null)}
                  closeLabel={lang === "tr" ? "Kapat" : "Close"}
                  prevLabel={lang === "tr" ? "Önceki" : "Prev"}
                  nextLabel={lang === "tr" ? "Sonraki" : "Next"}
                />
              ) : null}
            </div>
          ) : null}
        </div>
        <aside className="lg:col-span-2">
          <ParcelMap pins={mapPins} zoom={holding.zoom} />
        </aside>
      </main>
    </div>
  );
}
