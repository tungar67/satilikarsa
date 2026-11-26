import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import {
  forgetPublishedMemory,
  publicContentUrl,
  readPublished,
  resetPublishedCache,
} from "./published.server.ts";

const TOKEN = "vercel_blob_rw_qOXo5mPvxrcvUZsR_secret";
const URL = "https://qOXo5mPvxrcvUZsR.public.blob.vercel-storage.com/site-content.json";

const saved = {
  welcome: { title: { en: "Hello", tr: "Merhaba" } },
  contact: { email: "tungar@nestatellc.com" },
  holdings: [],
};

const originalFetch = globalThis.fetch;

afterEach(async () => {
  globalThis.fetch = originalFetch;
  delete process.env.BLOB_READ_WRITE_TOKEN;
  await resetPublishedCache();
});

describe("publicContentUrl", () => {
  it("builds the public file address from the token without calling Blob", () => {
    assert.equal(publicContentUrl(TOKEN), URL);
    assert.equal(publicContentUrl(undefined), null);
    assert.equal(publicContentUrl("not-a-token"), null);
  });
});

describe("readPublished", () => {
  it("does not look the file up when storage is not configured", async () => {
    let called = false;
    globalThis.fetch = (async () => {
      called = true;
      return new Response("no", { status: 500 });
    }) as typeof fetch;
    assert.equal(await readPublished(), null);
    assert.equal(called, false);
  });

  it("reads the public address once and then reuses the copy", async () => {
    process.env.BLOB_READ_WRITE_TOKEN = TOKEN;
    const seen: string[] = [];
    globalThis.fetch = (async (input) => {
      seen.push(String(input));
      return new Response(JSON.stringify(saved), { status: 200 });
    }) as typeof fetch;

    const first = await readPublished();
    forgetPublishedMemory();
    const second = await readPublished();

    assert.equal(first?.welcome.title.en, "Hello");
    assert.equal(second?.welcome.title.en, "Hello");
    assert.deepEqual(seen, [URL]);
  });

  it("falls back to the built-in pages when Blob is paused, and does not retry immediately", async () => {
    process.env.BLOB_READ_WRITE_TOKEN = TOKEN;
    let calls = 0;
    globalThis.fetch = (async () => {
      calls += 1;
      return new Response("suspended", { status: 403 });
    }) as typeof fetch;

    assert.equal(await readPublished(), null);
    forgetPublishedMemory();
    assert.equal(await readPublished(), null);
    assert.equal(calls, 1);
  });
});
