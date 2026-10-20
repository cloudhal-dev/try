# Contributing

This repo only composes Cloudhal for `try.cloudhal.com`: wrangler config, landing page, demo
content and deploy. The playground code itself (the Durable Object driver, the route guard, the
session entry) lives in the Cloudhal monorepo and is changed there, through RFC-0036.

- Code of conduct, DCO (`git commit -s`), conventional commits and the licence follow the monorepo's
  [CONTRIBUTING.md](https://github.com/cloudhal-dev/cloudhal/blob/main/CONTRIBUTING.md).
- Here: `pnpm check` (Biome and TypeScript) must pass. Demo content follows [seed/README.md](seed/README.md).
- Never commit secrets; `.env.example` lists the names only.
- Security issues: see the monorepo's SECURITY.md, not a public issue.
