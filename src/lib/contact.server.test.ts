import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import type { ContactInput } from "./contact-fields.ts";
import { deliverContact } from "./contact.server.ts";

const base: ContactInput = {
  name: "Ayşe Yılmaz",
  email: "ayse@example.com",
  phone: "+90 532 000 00 00",
  holding: "dikili",
  holdingLabel: "Kabakum arsası",
  message: "Tapu cetvelini rica ederim.",
  website: "",
};

const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
  delete process.env.RESEND_API_KEY;
  delete process.env.CONTACT_TO_EMAIL;
  delete process.env.CONTACT_FROM_EMAIL;
});

describe("deliverContact", () => {
  it("does not call the provider when the mailbox is not configured", async () => {
    let called = false;
    globalThis.fetch = (async () => {
      called = true;
      return new Response("{}", { status: 200 });
    }) as typeof fetch;
    assert.deepEqual(await deliverContact(base), { ok: false, code: "unavailable" });
    assert.equal(called, false);
  });

  it("sends every field to the office inbox and replies to the visitor", async () => {
    process.env.RESEND_API_KEY = "re_test";
    let body: Record<string, unknown> | undefined;
    let auth = "";
    globalThis.fetch = (async (input, init) => {
      const headers = init?.headers as Record<string, string>;
      auth = headers.Authorization;
      body = JSON.parse(String(init?.body)) as Record<string, unknown>;
      assert.equal(String(input), "https://api.resend.com/emails");
      return new Response(JSON.stringify({ id: "email_1" }), { status: 200 });
    }) as typeof fetch;

    assert.deepEqual(await deliverContact(base), { ok: true });
    assert.equal(auth, "Bearer re_test");
    assert.equal(body?.from, "Satilik Arsa <onboarding@resend.dev>");
    assert.deepEqual(body?.to, ["nestatellc@gmail.com"]);
    assert.equal(body?.cc, undefined);
    assert.equal(body?.bcc, undefined);
    assert.equal(body?.reply_to, "ayse@example.com");
    const text = String(body?.text);
    for (const value of [
      "Ayşe Yılmaz",
      "ayse@example.com",
      "+90 532 000 00 00",
      "Kabakum arsası",
      "dikili",
      "Tapu cetvelini rica ederim.",
    ]) {
      assert.match(text, new RegExp(value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
    }
  });

  it("uses only the lowercase account inbox while the sender is unverified", async () => {
    process.env.RESEND_API_KEY = "re_test";
    process.env.CONTACT_TO_EMAIL = "Tungar@NestateLLC.com";
    let body: Record<string, unknown> | undefined;
    globalThis.fetch = (async (_input, init) => {
      body = JSON.parse(String(init?.body)) as Record<string, unknown>;
      return new Response(JSON.stringify({ id: "email_1" }), { status: 200 });
    }) as typeof fetch;

    assert.deepEqual(await deliverContact({ ...base, email: "Visitor@Example.com" }), { ok: true });
    assert.deepEqual(body?.to, ["nestatellc@gmail.com"]);
    assert.equal(body?.reply_to, "Visitor@Example.com");
    assert.equal(body?.cc, undefined);
    assert.equal(body?.bcc, undefined);
    assert.equal(JSON.stringify(body).includes("tungar@nestatellc.com"), false);
  });

  it("sends to a configured inbox once the from-address is on a verified domain", async () => {
    process.env.RESEND_API_KEY = "re_test";
    process.env.CONTACT_FROM_EMAIL = "Satilik Arsa <iletisim@satilikarsa.win>";
    process.env.CONTACT_TO_EMAIL = "Office@Example.com";
    let body: Record<string, unknown> | undefined;
    globalThis.fetch = (async (_input, init) => {
      body = JSON.parse(String(init?.body)) as Record<string, unknown>;
      return new Response(JSON.stringify({ id: "email_1" }), { status: 200 });
    }) as typeof fetch;

    assert.deepEqual(await deliverContact(base), { ok: true });
    assert.equal(body?.from, "Satilik Arsa <iletisim@satilikarsa.win>");
    assert.deepEqual(body?.to, ["office@example.com"]);
    assert.equal(body?.reply_to, "ayse@example.com");
  });

  it("does not call the provider when the honeypot is filled", async () => {
    process.env.RESEND_API_KEY = "re_test";
    let called = false;
    globalThis.fetch = (async () => {
      called = true;
      return new Response("{}", { status: 200 });
    }) as typeof fetch;
    assert.deepEqual(await deliverContact({ ...base, website: "https://spam.test", name: "" }), {
      ok: true,
    });
    assert.equal(called, false);
  });

  it("tells the visitor when the provider rejects the message", async () => {
    process.env.RESEND_API_KEY = "re_test";
    globalThis.fetch = (async () =>
      new Response("domain is not verified", { status: 403 })) as typeof fetch;
    assert.deepEqual(await deliverContact(base), { ok: false, code: "failed" });
  });
});
