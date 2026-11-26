import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { submitContact, type ContactFailure } from "@/lib/contact";
import { CONTACT_LIMITS, isPlainEmail } from "@/lib/contact-fields";
import { tx, useLang } from "@/lib/lang";
import { ui, useSite } from "@/lib/site-content";
import { SITE_DOMAIN, SITE_URL } from "@/lib/site";

type Search = { holding?: string };
type Status = "idle" | "sending" | ContactFailure | "sent";

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
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [holding, setHolding] = useState(preset ?? "");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const sending = useRef(false);

  const office = content.contact.email.trim();
  const officeShown = isPlainEmail(office) ? office : "";
  const field =
    "mt-1 w-full rounded-xl border border-line bg-paper px-3 py-3 text-ink outline-none";
  const notice =
    status === "sent"
      ? tx(ui.sent, lang)
      : status === "invalid"
        ? tx(ui.invalidContact, lang)
        : status === "unavailable"
          ? tx(ui.mailboxUnavailable, lang)
          : status === "failed"
            ? tx(ui.sendFailed, lang)
            : "";

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (sending.current) return;
    const form = e.currentTarget;
    const website = String(new FormData(form).get("website") ?? "");
    const nameOk = name.trim().length > 0;
    const emailOk = isPlainEmail(email.trim());
    const messageOk = message.trim().length > 0;
    if (!website && (!nameOk || !emailOk || !messageOk)) {
      setStatus("invalid");
      return;
    }

    const picked = content.holdings.find((item) => item.slug === holding);
    sending.current = true;
    setStatus("sending");
    try {
      const result = await submitContact({
        data: {
          name,
          email,
          phone,
          holding,
          holdingLabel: picked ? tx(picked.name, lang) : "",
          message,
          website,
        },
      });
      if (!result.ok) {
        setStatus(result.code);
        return;
      }
      setName("");
      setEmail("");
      setPhone("");
      setMessage("");
      setHolding(preset ?? "");
      form.reset();
      setStatus("sent");
    } catch {
      setStatus("failed");
    } finally {
      sending.current = false;
    }
  }

  return (
    <div>
      <SiteHeader />
      <main className="mx-auto max-w-xl px-4 py-12">
        <p className="text-xs font-semibold tracking-widest text-gold uppercase">
          {tx(ui.writeOffice, lang)}
        </p>
        <h1 className="mt-2 text-5xl">{tx(content.contact.title, lang)}</h1>
        <p className="mt-4 leading-7 text-muted">{tx(content.contact.lede, lang)}</p>
        <a href={SITE_URL} className="mt-3 inline-block text-sm text-olive">
          {SITE_DOMAIN}
        </a>
        {officeShown ? (
          <a href={`mailto:${officeShown}`} className="mt-1 block text-sm text-olive">
            {officeShown}
          </a>
        ) : null}
        <form
          onSubmit={onSubmit}
          className="relative mt-8 rounded-card border border-line bg-card p-5"
          noValidate
        >
          <label className="block text-sm font-medium">
            {tx(ui.name, lang)}
            <input
              name="name"
              required
              aria-required="true"
              aria-invalid={status === "invalid" && !name.trim()}
              autoComplete="name"
              maxLength={CONTACT_LIMITS.name}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={field}
            />
          </label>
          <label className="mt-3 block text-sm font-medium">
            {tx(ui.email, lang)}
            <input
              name="email"
              required
              aria-required="true"
              aria-invalid={status === "invalid" && !isPlainEmail(email.trim())}
              type="email"
              autoComplete="email"
              maxLength={CONTACT_LIMITS.email}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={field}
            />
          </label>
          <label className="mt-3 block text-sm font-medium">
            {tx(ui.phone, lang)}{" "}
            <span className="font-normal text-muted">({tx(ui.optional, lang)})</span>
            <input
              name="phone"
              type="tel"
              autoComplete="tel"
              maxLength={CONTACT_LIMITS.phone}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className={field}
            />
          </label>
          <label className="mt-3 block text-sm font-medium">
            {tx(ui.holding, lang)}
            <select
              name="holding"
              value={holding}
              onChange={(e) => setHolding(e.target.value)}
              className={field}
            >
              <option value="">{tx(ui.general, lang)}</option>
              {content.holdings.map((item) => (
                <option key={item.slug} value={item.slug}>
                  {tx(item.name, lang)}
                </option>
              ))}
            </select>
          </label>
          <label className="mt-3 block text-sm font-medium">
            {tx(ui.message, lang)}
            <textarea
              name="message"
              required
              aria-required="true"
              aria-invalid={status === "invalid" && !message.trim()}
              rows={5}
              maxLength={CONTACT_LIMITS.message}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className={field}
            />
          </label>
          <div className="absolute -left-[10000px] h-px w-px overflow-hidden" aria-hidden="true">
            <label>
              Website
              <input type="text" name="website" tabIndex={-1} autoComplete="off" defaultValue="" />
            </label>
          </div>
          <button
            type="submit"
            disabled={status === "sending"}
            className="mt-5 rounded-full bg-olive-deep px-5 py-3 text-sm font-medium text-paper disabled:opacity-60"
          >
            {status === "sending" ? tx(ui.sending, lang) : tx(ui.send, lang)}
          </button>
          {notice ? (
            <p
              id="contact-status"
              role="status"
              aria-live="polite"
              className={`mt-3 text-sm ${status === "sent" ? "text-olive" : "text-gold"}`}
            >
              {notice}
            </p>
          ) : null}
        </form>
      </main>
    </div>
  );
}
