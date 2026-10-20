// @ts-check
// The playground's site is this Astro project (the blog starter's theme), built as a Cloudflare
// Worker whose entry (wrangler.jsonc `main`) is the playground Worker: each session renders its
// own site from its Durable Object through `withRequestStore` (RFC-0036 §4).
import cloudflare from "@astrojs/cloudflare";
import { cloudhal } from "@cloudhal/astro-renderer/integration";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";

export default defineConfig({
  output: "static",
  session: false,
  adapter: cloudflare({ imageService: "passthrough" }),
  integrations: [
    cloudhal({
      siteId: "site_playgrounddemo",
      dataDir: ".cloudhal",
      target: "cloudflare",
      // No reader comments in a playground (RFC-0036 §5, "outbound").
      comments: { available: false },
    }),
  ],
  vite: { plugins: [tailwindcss()] },
});
