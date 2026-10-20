/**
 * The try.cloudhal.com Worker (RFC-0036): `@cloudhal/cloudflare/playground` with this repo's demo
 * pack, the blog theme (this Astro project) as the session's site, and the landing page.
 *
 * Static files are served without SPA fallback (`not_found_handling: "none"` in wrangler.jsonc):
 * the session's blob store reads demo media from them and must see a real 404 for anything else.
 * Studio's client routes get its `index.html` here instead.
 */
import "@cloudhal/cloudflare/workerd-prelude";
import { handle } from "@astrojs/cloudflare/handler";
import { serveMedia, withRequestStore } from "@cloudhal/astro-renderer/runtime";
import { createPlaygroundWorker, type PlaygroundEnv } from "@cloudhal/cloudflare/playground";
import { DEMO_MEDIA_KEYS, seedDemo } from "./demo-pack.ts";
import { LANDING_PATH, landingPage } from "./landing.ts";

/** Where "Deploy to Cloudflare" leads: the monorepo's deploy guide. */
const DEPLOY_URL = "https://github.com/cloudhal-dev/cloudhal#deploy-to-cloudflare";

const playground = createPlaygroundWorker({
  deployUrl: DEPLOY_URL,
  landingPath: LANDING_PATH,
  seed: seedDemo,
  demoMedia: { prefix: "demo/", keys: DEMO_MEDIA_KEYS },
  render: (request, { store, siteId, env, ctx }) =>
    withRequestStore(store, siteId, async () => {
      const media = await serveMedia(request, { siteId });
      return media ?? ((await handle(request, env as never, ctx)) as unknown as Response);
    }),
});

export const PlaygroundSite = playground.PlaygroundSite;

const HTML = {
  "content-type": "text/html; charset=utf-8",
  "cache-control": "no-store",
  "x-robots-tag": "noindex",
  "x-content-type-options": "nosniff",
  "referrer-policy": "strict-origin-when-cross-origin",
};

/** Client routes of the Studio SPA: no file extension, not an API or site path. */
const isStudioRoute = (path: string) => !/\.[a-z0-9]+$/i.test(path) && !path.startsWith("/assets/");

export default {
  async fetch(request: Request, env: PlaygroundEnv): Promise<Response> {
    // Fail closed: only "true" opens the playground.
    const enabled = env.PLAYGROUND_ENABLED === "true" && Boolean(env.PLAYGROUND_SECRET);
    const assets = {
      async fetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
        const req = new Request(input, init);
        const url = new URL(req.url);
        if (url.pathname === LANDING_PATH)
          return new Response(landingPage({ enabled, deployUrl: DEPLOY_URL }), { headers: HTML });
        const res = await env.ASSETS.fetch(req);
        if (res.status !== 404 || req.method !== "GET" || !isStudioRoute(url.pathname)) return res;
        return env.ASSETS.fetch(new Request(new URL("/index.html", url), { headers: req.headers }));
      },
    } as unknown as Fetcher;
    return playground.worker.fetch(request, {
      ...env,
      ASSETS: assets,
      PLAYGROUND_ENABLED: enabled ? "true" : "false",
    });
  },
};
