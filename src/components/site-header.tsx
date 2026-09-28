import { Link } from "@tanstack/react-router";
import { tx, useLang } from "@/lib/lang";
import { ui, useSite } from "@/lib/site-content";
import { SITE_DOMAIN, SITE_URL } from "@/lib/site";

const tabClass = "shrink-0 rounded-full px-3 py-2 text-sm text-muted hover:bg-olive hover:text-paper";
const tabOn = "shrink-0 rounded-full bg-olive px-3 py-2 text-sm text-paper";

export function SiteHeader() {
  const { content } = useSite();
  const { lang, setLang } = useLang();
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-paper/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl min-w-0 flex-col gap-2 px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <div className="leading-tight">
            <Link to="/" className="block">
              <span className="block font-sans text-xs font-semibold tracking-widest text-olive-deep uppercase">
                {tx(content.welcome.siteName, lang)}
              </span>
              <span className="text-sm text-muted">{tx(content.welcome.tagline, lang)}</span>
            </Link>
            <a href={SITE_URL} className="mt-0.5 block text-xs tracking-wide text-olive">
              {SITE_DOMAIN}
            </a>
          </div>
          <div className="flex rounded-full border border-line">
            <button type="button" onClick={() => setLang("tr")} className={lang === "tr" ? tabOn : tabClass}>
              TR
            </button>
            <button type="button" onClick={() => setLang("en")} className={lang === "en" ? tabOn : tabClass}>
              EN
            </button>
          </div>
        </div>
        <nav className="flex min-w-0 gap-1 overflow-x-auto">
          <Link to="/" activeOptions={{ exact: true }} className={tabClass} activeProps={{ className: tabOn }}>
            {tx(ui.welcome, lang)}
          </Link>
          {content.holdings.map((h) => (
            <Link
              key={h.slug}
              to="/holdings/$slug"
              params={{ slug: h.slug }}
              className={tabClass}
              activeProps={{ className: tabOn }}
            >
              {tx(h.name, lang).split(" ")[0]}
            </Link>
          ))}
          <Link to="/contact" className={tabClass} activeProps={{ className: tabOn }}>
            {tx(ui.contact, lang)}
          </Link>
          <Link to="/maintenance" className={tabClass} activeProps={{ className: tabOn }}>
            {tx(ui.maintenance, lang)}
          </Link>
        </nav>
      </div>
    </header>
  );
}
