import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { contactLetter, parseContact, type ContactInput } from "./contact-fields.ts";

function input(overrides: Partial<ContactInput> = {}): ContactInput {
  return {
    name: "Ayşe Yılmaz",
    email: "ayse@example.com",
    phone: "+90 532 000 00 00",
    holding: "dikili",
    holdingLabel: "Kabakum arsası",
    message: "Tapu cetvelini rica ederim.",
    website: "",
    ...overrides,
  };
}

describe("parseContact", () => {
  it("accepts a complete inquiry", () => {
    const parsed = parseContact(input());
    assert.equal(parsed.ok, true);
    if (!parsed.ok || parsed.ignored) return;
    assert.equal(parsed.fields.email, "ayse@example.com");
    assert.equal(parsed.fields.holdingLabel, "Kabakum arsası");
  });

  it("rejects a missing name, a bad email, or an empty message", () => {
    assert.equal(parseContact(input({ name: "  " })).ok, false);
    assert.equal(parseContact(input({ email: "not-an-email" })).ok, false);
    assert.equal(parseContact(input({ message: "" })).ok, false);
  });

  it("allows an empty phone and strips control characters", () => {
    const parsed = parseContact(input({ phone: "", name: "Ada\nLovelace" }));
    assert.equal(parsed.ok, true);
    if (!parsed.ok || parsed.ignored) return;
    assert.equal(parsed.fields.phone, "");
    assert.equal(parsed.fields.name, "AdaLovelace");
  });

  it("pretends a filled honeypot succeeded", () => {
    const parsed = parseContact(input({ website: "https://spam.test", name: "" }));
    assert.deepEqual(parsed, { ok: true, ignored: true });
  });

  it("rejects a message over the limit", () => {
    const parsed = parseContact(input({ message: "a".repeat(5001) }));
    assert.deepEqual(parsed, { ok: false, code: "invalid" });
  });
});

describe("contactLetter", () => {
  it("includes every submitted field", () => {
    const parsed = parseContact(input());
    if (!parsed.ok || parsed.ignored) throw new Error("expected fields");
    const letter = contactLetter(parsed.fields);
    assert.match(letter.subject, /Ayşe Yılmaz/);
    assert.match(letter.subject, /Kabakum arsası/);
    for (const value of [
      "Ayşe Yılmaz",
      "ayse@example.com",
      "+90 532 000 00 00",
      "Kabakum arsası",
      "dikili",
      "Tapu cetvelini rica ederim.",
    ]) {
      assert.match(letter.text, new RegExp(value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
      assert.match(letter.html, new RegExp(value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
    }
  });
});
