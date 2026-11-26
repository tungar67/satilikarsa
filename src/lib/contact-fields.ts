/** Plain-text limits and checks for the public contact form. */

export const CONTACT_LIMITS = {
  name: 120,
  email: 200,
  phone: 40,
  holding: 80,
  holdingLabel: 160,
  message: 5000,
} as const;

export type ContactInput = {
  name: string;
  email: string;
  phone: string;
  holding: string;
  holdingLabel: string;
  message: string;
  /** Honeypot. Real visitors leave this empty. */
  website: string;
};

export type ContactFields = {
  name: string;
  email: string;
  phone: string;
  holding: string;
  holdingLabel: string;
  message: string;
};

export type ContactFailure = "invalid" | "unavailable" | "failed";

export type ContactResult = { ok: true } | { ok: false; code: ContactFailure };

export type ParsedContact =
  | { ok: true; ignored: true }
  | { ok: true; ignored: false; fields: ContactFields }
  | { ok: false; code: "invalid" };

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isPlainEmail(value: string): boolean {
  return EMAIL.test(value);
}

function stripControls(value: string): string {
  let out = "";
  for (const char of value) {
    const code = char.codePointAt(0) ?? 0;
    if (code < 32 || code === 127) continue;
    out += char;
  }
  return out;
}

function field(value: unknown, max: number): { value: string; tooLong: boolean } {
  if (typeof value !== "string") return { value: "", tooLong: false };
  const cleaned = stripControls(value).trim();
  if (cleaned.length > max) return { value: "", tooLong: true };
  return { value: cleaned, tooLong: false };
}

export function parseContact(input: ContactInput): ParsedContact {
  const website = field(input?.website, 500);
  if (website.value) return { ok: true, ignored: true };

  const name = field(input?.name, CONTACT_LIMITS.name);
  const email = field(input?.email, CONTACT_LIMITS.email);
  const phone = field(input?.phone, CONTACT_LIMITS.phone);
  const holding = field(input?.holding, CONTACT_LIMITS.holding);
  const holdingLabel = field(input?.holdingLabel, CONTACT_LIMITS.holdingLabel);
  const message = field(input?.message, CONTACT_LIMITS.message);
  const tooLong = [name, email, phone, holding, holdingLabel, message].some((item) => item.tooLong);

  if (tooLong || !name.value || !message.value || !isPlainEmail(email.value)) {
    return { ok: false, code: "invalid" };
  }

  return {
    ok: true,
    ignored: false,
    fields: {
      name: name.value,
      email: email.value,
      phone: phone.value,
      holding: holding.value,
      holdingLabel: holdingLabel.value,
      message: message.value,
    },
  };
}

export function holdingAbout(fields: ContactFields): string {
  return fields.holdingLabel || fields.holding || "Genel";
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export type ContactLetter = {
  subject: string;
  text: string;
  html: string;
};

/** Inbox copy for the office. Labels are bilingual so nothing depends on the visitor's language. */
export function contactLetter(fields: ContactFields): ContactLetter {
  const about = holdingAbout(fields);
  const phone = fields.phone || "—";
  const subject = `İletişim · ${fields.name} · ${about}`.replace(/\s+/g, " ").slice(0, 180);
  const rows: Array<[string, string]> = [
    ["Ad / Name", fields.name],
    ["E-posta / Email", fields.email],
    ["Telefon / Phone", phone],
    ["Varlık / Holding", about],
  ];
  if (fields.holding && fields.holding !== about) rows.push(["Kod / Code", fields.holding]);

  const text = [
    "satilikarsa.win iletişim formu",
    "",
    ...rows.map(([label, value]) => `${label}: ${value}`),
    "",
    "Mesaj / Message:",
    fields.message,
    "",
    "Yanıtla / Reply goes to the visitor's email.",
  ].join("\n");

  const htmlRows = rows
    .map(
      ([label, value]) =>
        `<tr><th align="left" style="padding:4px 12px 4px 0;vertical-align:top">${escapeHtml(label)}</th><td style="padding:4px 0">${escapeHtml(value)}</td></tr>`,
    )
    .join("");
  const html = `<!DOCTYPE html><html><body style="font-family:sans-serif;color:#1c1914"><p>satilikarsa.win iletişim formu</p><table>${htmlRows}</table><p style="white-space:pre-wrap">${escapeHtml(fields.message)}</p><p>Yanıtla / Reply goes to the visitor's email.</p></body></html>`;

  return { subject, text, html };
}
