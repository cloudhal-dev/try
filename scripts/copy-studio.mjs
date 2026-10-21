// Copies the built Studio that @cloudhal/cli ships into public/ (served at the root, RFC-0036
// notes 2), before `astro build` copies public/ into dist/client. The copy is not committed.
import { cp, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";

// The CLI exports no subpaths; its package directory is a direct dependency of this project.
const cli = new URL("../node_modules/@cloudhal/cli/", import.meta.url).pathname;
const from = path.join(cli, "dist/assets/studio");
const pub = new URL("../public/", import.meta.url).pathname;
await rm(path.join(pub, "assets"), { recursive: true, force: true });
await cp(from, pub, { recursive: true, filter: (src) => !src.endsWith(".map") });
// Studio's own headers (CSP etc.) for its files; the site's pages set their own. The theme's
// fonts never change under a path (a new set gets /fonts/v2/): cached for a year, so a reload
// draws the text in its font from the first paint instead of swapping it in later.
const studio = await readFile(path.join(from, "_headers"), "utf8").catch(() => "");
const fonts = "/fonts/v1/*\n  Cache-Control: public, max-age=31536000, immutable\n";
await writeFile(path.join(pub, "_headers"), `${studio.trimEnd()}\n\n${fonts}`.trimStart());
console.log(`Studio copied from ${from}`);
