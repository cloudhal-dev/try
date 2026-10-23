/**
 * Demo images by their media URL, without a session (`/media/<sha16>/<slug>.png`).
 *
 * Studio's article preview is a sandboxed document (its CSP carries `sandbox`), so its image
 * requests are cross-site and leave out the session cookie (`SameSite=Lax`). Without a session
 * the playground answers `/media/…` with a redirect to the landing page, and the preview showed a
 * broken image for every cover. Uploads are refused in the playground, so its only media are the
 * demo images, whose bytes are public static files already (`public/demo/`): answer those here.
 */
import { DEMO_MEDIA, DEMO_SITE_ID } from "./demo-media.ts";

const BY_PREFIX = new Map(DEMO_MEDIA.map((m) => [m.sha256.slice(0, 16), m]));
const MEDIA_PATH = /^\/media\/([0-9a-f]{16})\/[^/]+\.png$/;

/** The static file behind a demo image's media URL (`/demo/media/<site>/<sha256>`), if it is one. */
export function demoMediaFile(pathname: string): string | undefined {
  const prefix = MEDIA_PATH.exec(pathname)?.[1];
  const media = prefix ? BY_PREFIX.get(prefix) : undefined;
  return media ? `/demo/media/${DEMO_SITE_ID}/${media.sha256}` : undefined;
}

/** A demo image's media response from the static assets, or undefined for any other request. */
export async function serveDemoMedia(
  request: Request,
  assets: { fetch(request: Request): Promise<Response> },
): Promise<Response | undefined> {
  if (request.method !== "GET" && request.method !== "HEAD") return undefined;
  const url = new URL(request.url);
  const file = demoMediaFile(url.pathname);
  if (!file) return undefined;
  const res = await assets.fetch(new Request(new URL(file, url), { method: request.method }));
  if (!res.ok) return undefined;
  return new Response(request.method === "HEAD" ? null : res.body, {
    headers: {
      "content-type": "image/png",
      "content-disposition": "inline",
      "content-security-policy": "default-src 'none'",
      "x-content-type-options": "nosniff",
      "cache-control": "public, max-age=3600",
    },
  });
}
