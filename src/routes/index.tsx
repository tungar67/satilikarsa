import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { tx, useLang } from "@/lib/lang";
import { useSite } from "@/lib/site-content";
import { SITE_DOMAIN, SITE_URL } from "@/lib/site";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const { content } = useSite();
  const { lang } = useLang();
  const { welcome, holdings } = content;
  const ordered = [...holdings].sort((a, b) => a.index.localeCompare(b.index, undefined, { numeric: true }));
  const heroHolding = ordered[0];
  const hero = heroHolding?.gallery.some((shot) => shot.src === heroHolding.hero)
    ? heroHolding.hero
    : (heroHolding?.gallery[0]?.src ?? "");
  return (
    <div>
      <SiteHeader />
      <section className="relative min-h-[70vh]">
        <img src={hero} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-olive-deep/55" />
        <div className="relative mx-auto flex min-h-[70vh] max-w-6xl flex-col justify-end px-4 py-16 text-paper">
          <p className="text-xs font-semibold tracking-widest text-gold uppercase">{tx(welcome.kicker, lang)}</p>
          <h1 className="mt-3 max-w-3xl text-5xl leading-tight sm:text-7xl">{tx(welcome.title, lang)}</h1>
          <p className="mt-4 max-w-xl text-lg leading-7 text-paper/90">{tx(welcome.lede, lang)}</p>
        </div>
      </section>
      <main className="mx-auto max-w-6xl px-4 py-14">
        <h2 className="text-4xl">{tx(welcome.portfolioTitle, lang)}</h2>
        <p className="mt-3 max-w-2xl leading-7 text-muted">{tx(welcome.portfolioLede, lang)}</p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {ordered.map((h) => {
            const photo = h.gallery.some((shot) => shot.src === h.hero) ? h.hero : (h.gallery[0]?.src ?? "");
            return (
            <Link
              key={h.slug}
              to="/holdings/$slug"
              params={{ slug: h.slug }}
              className="overflow-hidden rounded-card border border-line bg-card"
            >
              {photo ? <img src={photo} alt="" className="h-48 w-full object-cover" /> : null}
              <div className="p-5">
                <p className="text-xs font-semibold tracking-widest text-gold uppercase">
                  {h.index} · {tx(h.region, lang)}
                </p>
                <h3 className="mt-2 text-3xl">{tx(h.name, lang)}</h3>
                <p className="mt-2 leading-6 text-muted">{tx(h.blurb, lang)}</p>
              </div>
            </Link>
            );
          })}
        </div>
      </main>
      <footer className="border-t border-line px-4 py-8 text-center text-sm text-muted">
        <p>{tx(welcome.footer, lang)}</p>
        <a href={SITE_URL} className="mt-2 inline-block text-olive">
          {SITE_DOMAIN}
        </a>
      </footer>
    </div>
  );
}
