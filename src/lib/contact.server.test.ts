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
    assert.deepEqual(body?.to, ["Nestatellc@gmail.com"]);
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
