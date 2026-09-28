import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { tx, useLang } from "@/lib/lang";
import { ui, useSite } from "@/lib/site-content";
import { SITE_DOMAIN, SITE_URL } from "@/lib/site";

type Search = { holding?: string };

export const Route = createFileRoute("/contact")({
  validateSearch: (search: Record<string, unknown>): Search => ({
    holding: typeof search.holding === "string" ? search.holding : undefined,
  }),
  component: ContactPage,
});

function ContactPage() {
  const { holding: preset } = Route.useSearch();
  const { content } = useSite();
  const { lang } = useLang();
  const [name, setName] = useState("");
  const [from, setFrom] = useState("");
  const [phone, setPhone] = useState("");
  const [holding, setHolding] = useState(preset ?? "");
  const [message, setMessage] = useState("");
  const [notice, setNotice] = useState("");

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const to = content.contact.email.trim();
    if (!to) {
      setNotice(tx(ui.noEmail, lang));
      return;
    }
    const picked = content.holdings.find((h) => h.slug === holding);
    const subject = `Inquiry · ${picked ? tx(picked.name, lang) : tx(content.welcome.siteName, lang)}`;
    const body = [
      `${tx(ui.name, lang)}: ${name}`,
      `${tx(ui.email, lang)}: ${from}`,
      `${tx(ui.phone, lang)}: ${phone}`,
      `${tx(ui.holding, lang)}: ${picked ? tx(picked.name, lang) : "—"}`,
      "",
      message,
    ].join("\n");
    window.location.href = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setNotice(tx(ui.opened, lang));
  }

  const field = "mt-1 w-full rounded-xl border border-line bg-paper px-3 py-3 text-ink outline-none";

  return (
    <div>
      <SiteHeader />
      <main className="mx-auto max-w-xl px-4 py-12">
        <p className="text-xs font-semibold tracking-widest text-gold uppercase">{tx(ui.writeOffice, lang)}</p>
        <h1 className="mt-2 text-5xl">{tx(content.contact.title, lang)}</h1>
        <p className="mt-4 leading-7 text-muted">{tx(content.contact.lede, lang)}</p>
        <a href={SITE_URL} className="mt-3 inline-block text-sm text-olive">
          {SITE_DOMAIN}
        </a>
        <form onSubmit={onSubmit} className="mt-8 rounded-card border border-line bg-card p-5">
          <label className="block text-sm font-medium">
            {tx(ui.name, lang)}
            <input required value={name} onChange={(e) => setName(e.target.value)} className={field} />
          </label>
          <label className="mt-3 block text-sm font-medium">
            {tx(ui.email, lang)}
            <input required type="email" value={from} onChange={(e) => setFrom(e.target.value)} className={field} />
          </label>
          <label className="mt-3 block text-sm font-medium">
            {tx(ui.phone, lang)}
            <input value={phone} onChange={(e) => setPhone(e.target.value)} className={field} />
          </label>
          <label className="mt-3 block text-sm font-medium">
            {tx(ui.holding, lang)}
            <select value={holding} onChange={(e) => setHolding(e.target.value)} className={field}>
              <option value="">{tx(ui.general, lang)}</option>
              {content.holdings.map((h) => (
                <option key={h.slug} value={h.slug}>
                  {tx(h.name, lang)}
                </option>
              ))}
            </select>
          </label>
          <label className="mt-3 block text-sm font-medium">
            {tx(ui.message, lang)}
            <textarea required rows={5} value={message} onChange={(e) => setMessage(e.target.value)} className={field} />
          </label>
          <button type="submit" className="mt-5 rounded-full bg-olive-deep px-5 py-3 text-sm font-medium text-paper">
            {tx(ui.send, lang)}
          </button>
          {notice ? <p className="mt-3 text-sm text-olive">{notice}</p> : null}
        </form>
      </main>
    </div>
  );
}
