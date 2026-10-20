# try.cloudhal.com

The public Cloudhal playground: every visitor gets their own disposable Cloudhal (Studio, API and
the rendered site) with no account, deleted after an hour.

> **Not live yet.** This repo is the deployable shell. Today it serves a landing page and a
> "coming soon" page; the playground itself arrives once the monorepo pieces below exist.

## What it is
- One Worker, `cloudhal-playground`, on `try.cloudhal.com` (ADR-0037).
- Each visitor gets a SQLite-backed Durable Object (`PLAYGROUND_DB`) that runs Cloudhal's store,
  API and site renderer, seeded with a demo pack ([seed/](seed/README.md)), with a 1-hour TTL.
- Auth, uploads, MCP, keys, outbound calls and agents are blocked; the design is
  [RFC-0036](https://github.com/cloudhal-dev/cloudhal/blob/main/docs/rfcs/0036-public-playground.md)
  in the [Cloudhal monorepo](https://github.com/cloudhal-dev/cloudhal).
- Shape borrowed from EmDash's [playground demo](https://github.com/emdash-cms/emdash/tree/main/demos/playground).

## Run it locally
Needs Node 24 and pnpm 12. Until `@cloudhal/*` is on npm, check the monorepo out next to this repo,
as `../cloudhal-dev` (the dependencies are `link:` paths; nothing imports them yet, so a missing
sibling only matters once the TODO in `src/worker.ts` is done).

```bash
pnpm install
cp .env.example .dev.vars   # optional; wrangler.jsonc has safe defaults
pnpm dev                    # wrangler dev → http://localhost:8787
pnpm check                  # Biome + TypeScript
```

## How this repo maps to RFC-0036
| RFC-0036 | Here | State |
|---|---|---|
| §1 one Worker, static landing and demo media | `src/worker.ts`, `src/pages.ts`, `public/` (`ASSETS`) | landing works; `/playground`, `/s/*`, `/api/*`, `/_playground/*` return 503 |
| §2 SQLite DO per session | `wrangler.jsonc`: `PLAYGROUND_DB` → `PlaygroundSite`, `new_sqlite_classes` | binding and migration set; the class is a placeholder |
| §3 demo content pack | `seed/` | described, not written |
| §7 rate limits | `SESSION_RATE_LIMIT` (5/min per IP), `WRITE_RATE_LIMIT` (120/min per session) | bound, unused |
| §7 kill switch, §9 daily cap | `PLAYGROUND_ENABLED`, `PLAYGROUND_DAILY_SESSIONS` vars | declared; the playground is off |
| Phase 4 custom domain | `routes` in `wrangler.jsonc` | commented out until launch |

### Waiting on the monorepo
- `@cloudhal/storage/do-sqlite` (`DoSqliteDriver`) and `SqlBlobStore`, `LayeredBlobStore`,
  `FetcherBlobStore` (RFC-0036 phase 1).
- Playground mode in `@cloudhal/api`: `isBlockedInPlayground`, `PLAYGROUND_PRINCIPAL`,
  `features.playground` and Studio's session bar (phase 2).
- `@cloudhal/cloudflare/playground`: `createPlaygroundWorker` and the `PlaygroundSite` class, and
  `withRequestStore` in `@cloudhal/astro-renderer` (phase 3).
- `@cloudhal/*` published to npm, so `package.json` can pin versions instead of `link:` paths.

## Contributing and licence
See [CONTRIBUTING.md](CONTRIBUTING.md). Apache-2.0, see [LICENSE](LICENSE).
