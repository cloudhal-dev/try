// The try.cloudhal.com Worker (RFC-0036). Today it serves the landing page and a 503 for the
// playground routes, so `wrangler dev` runs before the monorepo pieces exist.
//
// TODO(RFC-0036 phase 3): replace the placeholder below with the monorepo entry, roughly
//   import { createPlaygroundWorker, PlaygroundSite } from "@cloudhal/cloudflare/playground";
//   import demoPack from "../seed/demo-pack.json";
//   export { PlaygroundSite };
//   export default createPlaygroundWorker({ seed: demoPack, limits: { ... } });
// It sets the session cookie, applies isBlockedInPlayground, rate limits and the TTL, and
// forwards to the session's Durable Object. Keep the landing page and kill switch here.

import { DurableObject } from "cloudflare:workers";
import type { Env } from "./env.ts";
import { comingSoonPage, landingPage } from "./pages.ts";

const HTML_HEADERS = {
  "content-type": "text/html; charset=utf-8",
  "cache-control": "no-store",
  "x-robots-tag": "noindex",
  "x-content-type-options": "nosniff",
  "referrer-policy": "strict-origin-when-cross-origin",
};

/** Routes the playground entry will own (RFC-0036 §1, §4, §6). */
const PLAYGROUND_ROUTES = /^\/(playground|_playground|s|api|studio)(\/|$)/;

/** Placeholder for the session Durable Object; the real class comes from the monorepo. */
export class PlaygroundSite extends DurableObject<Env> {
  override async fetch(): Promise<Response> {
    return new Response("Not implemented", { status: 501 });
  }
}

export default {
  async fetch(request, env): Promise<Response> {
    const { pathname } = new URL(request.url);
    if (pathname === "/" || pathname === "/index.html") {
      return new Response(landingPage(env.DEPLOY_URL), { headers: HTML_HEADERS });
    }
    if (PLAYGROUND_ROUTES.test(pathname)) {
      // Both the kill switch and the missing entry end here for now.
      return pathname.startsWith("/api/") || pathname.startsWith("/_playground/")
        ? Response.json(
            { error: "playground_unavailable" },
            { status: 503, headers: { "retry-after": "86400" } },
          )
        : new Response(comingSoonPage(), {
            status: 503,
            headers: { ...HTML_HEADERS, "retry-after": "86400" },
          });
    }
    return env.ASSETS.fetch(request);
  },
} satisfies ExportedHandler<Env>;
