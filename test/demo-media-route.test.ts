// `node --test`: demo images answer by their media URL without a session (demo-media-route.ts).
import assert from "node:assert/strict";
import { test } from "node:test";
import { DEMO_MEDIA } from "../src/playground/demo-media.ts";
import { demoMediaFile, serveDemoMedia } from "../src/playground/demo-media-route.ts";

const forest = DEMO_MEDIA.find((m) => m.slug === "forest-light");
const url = (path: string) => `https://try.cloudhal.com${path}`;
const mediaPath = `/media/${forest?.sha256.slice(0, 16)}/forest-light.png`;

test("maps a demo image's media URL to its static file, and nothing else", () => {
  assert.equal(demoMediaFile(mediaPath), `/demo/media/site_playgrounddemo/${forest?.sha256}`);
  assert.equal(demoMediaFile("/media/0000000000000000/other.png"), undefined);
  assert.equal(demoMediaFile(`/media/${forest?.sha256.slice(0, 16)}/x.png.sha256`), undefined);
  assert.equal(demoMediaFile("/s/01ABC/media/x.png"), undefined);
});

test("serves the file as an inert PNG to a request without a session cookie", async () => {
  const asked: string[] = [];
  const assets = {
    async fetch(req: Request) {
      asked.push(new URL(req.url).pathname);
      return new Response(new Uint8Array([137, 80, 78, 71]));
    },
  };
  const res = await serveDemoMedia(new Request(url(mediaPath)), assets);
  assert.equal(res?.status, 200);
  assert.equal(res?.headers.get("content-type"), "image/png");
  assert.equal(res?.headers.get("x-content-type-options"), "nosniff");
  assert.deepEqual(asked, [`/demo/media/site_playgrounddemo/${forest?.sha256}`]);
  assert.equal(
    await serveDemoMedia(new Request(url("/media/0000000000000000/a.png")), assets),
    undefined,
  );
  assert.equal(
    await serveDemoMedia(new Request(url(mediaPath), { method: "POST" }), assets),
    undefined,
  );
  const missing = { fetch: async () => new Response(null, { status: 404 }) };
  assert.equal(await serveDemoMedia(new Request(url(mediaPath)), missing), undefined);
});
