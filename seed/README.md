# Demo content pack

What every playground session starts with (RFC-0036 §3). Nothing is here yet; the pack lands with
phase 4.

## Shape
- `demo-pack.json`: plain data, bundled into the Worker and applied by `seedPlayground(store)`
  (from `@cloudhal/cloudflare/playground`) after `seedStarterSite`. It goes through the store's
  normal writes, never hand-written SQL, so it cannot drift from the migrations.
- Media live in `public/demo/` and are served read-only through `ASSETS`; the session's
  `LayeredBlobStore` reads them as its base layer (RFC-0036 §2, invariant 5).

## Contents (target)
- About 10 blog posts that show what Cloudhal does: sections, generative UI surfaces, snapshots
  and rollback, search, menus, design.
- An About page, a main menu, a few tags and categories, one author.
- The blog starter's theme and design settings.
- Three demo images, each under 1 MiB.

## Rules
- **English by default** (the global default language). A Turkish (`tr`) edition is a later option,
  as a separate pack; never mixed into the English one.
- Small: the whole pack well under 1 MB, so seeding a session stays at tens of milliseconds
  (RFC-0036 open question 2).
- Nothing personal or real: no real people, emails, addresses or third-party trademarks.
- Licensed for redistribution: text written for this repo, images we own or CC0, credited here.
