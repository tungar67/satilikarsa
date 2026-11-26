import { env } from "./env.server.ts";
import {
  contactLetter,
  isPlainEmail,
  parseContact,
  type ContactInput,
  type ContactResult,
} from "./contact-fields.ts";

/** Bare address on the Resend account. The test sender compares this string exactly. */
const OFFICE_INBOX = "nestatellc@gmail.com";
/** Works before a domain is verified, and only delivers to the account inbox above. */
const DEFAULT_FROM = "Satilik Arsa <onboarding@resend.dev>";

function senderAddress(from: string): string | undefined {
  const wrapped = from.match(/<([^<>]+)>/);
  const email = (wrapped ? wrapped[1] : from).trim().toLowerCase();
  return isPlainEmail(email) ? email : undefined;
}

function testingSender(from: string): boolean {
  const sender = senderAddress(from);
  return !sender || sender.endsWith("@resend.dev");
}

/**
 * Resend's shared onboarding sender accepts only the account address, and it
 * compares that address as written. A capital letter, a display name, or any
 * other recipient (including the Maintenance office address) is rejected.
 * The visitor is never a recipient; they are Reply-To only.
 */
export function deliveryAddress(from: string, configuredTo: string | undefined): string {
  if (testingSender(from)) return OFFICE_INBOX;
  const configured = configuredTo?.trim().toLowerCase() ?? "";
  return isPlainEmail(configured) ? configured : OFFICE_INBOX;
}

export async function deliverContact(input: ContactInput): Promise<ContactResult> {
  const parsed = parseContact(input);
  if (!parsed.ok) return parsed;
  if (parsed.ignored) return { ok: true };

  const apiKey = env("RESEND_API_KEY");
  const from = env("CONTACT_FROM_EMAIL") ?? DEFAULT_FROM;
  const to = deliveryAddress(from, env("CONTACT_TO_EMAIL"));
  if (!apiKey || !senderAddress(from) || !isPlainEmail(to)) {
    console.error(
      "Contact email is not configured. Set RESEND_API_KEY, and check CONTACT_TO_EMAIL / CONTACT_FROM_EMAIL.",
    );
    return { ok: false, code: "unavailable" };
  }

  const letter = contactLetter(parsed.fields);
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: parsed.fields.email,
        subject: letter.subject,
        text: letter.text,
        html: letter.html,
      }),
      signal: AbortSignal.timeout(12_000),
    });
    if (!res.ok) {
      const detail = await res.text();
      console.error("Contact email failed", res.status, detail.slice(0, 500));
      return { ok: false, code: "failed" };
    }
    return { ok: true };
  } catch (error) {
    console.error("Contact email failed", error);
    return { ok: false, code: "failed" };
  }
}
