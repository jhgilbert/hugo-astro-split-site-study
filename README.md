# Hugo/Astro split site study

A study of how to gracefully combine Hugo and Astro into one site, for the purpose of eventually migrating from Hugo to Astro.

## Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- [Yarn](https://yarnpkg.com/) (v1)
- [Caddy](https://caddyserver.com/) — install with `brew install caddy` on macOS

## Getting started

```bash
yarn install
yarn dev
```

This starts Hugo, Astro, and a Caddy reverse proxy concurrently. Visit `http://localhost:3000` to view the integrated site. As you navigate, the header at the top of the page will indicate whether you are on Hugo or Astro.


## Testing

After running `yarn install`, install Playwright browser binaries before running e2e tests:

```bash
yarn playwright install chromium
```

Then:

```bash
yarn test:unit     # Vitest component tests (in astro/)
yarn test:e2e      # Playwright e2e tests (requires dev servers)
yarn test          # Run both
```

## Snapshot Viewer

View rendered component snapshots outside the running site:

```bash
yarn view-snapshots
```

This generates static HTML pages wrapping Vitest file snapshots in the site's shared CSS, with both light and dark theme previews.

## Documentation

- [User Stories](./docs/user_stories.md) — Feature demonstrations with Playwright screenshots
- [Design Document](./design.md) — Architecture and design decisions
- [Implementation Plan](./plan.md) — Step-by-step build plan
