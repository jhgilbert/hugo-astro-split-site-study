# Hugo/Astro Split Site Study

A study of how to gracefully combine Hugo and Astro into one site, for the purpose of eventually migrating from Hugo to Astro.

## Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- [Yarn](https://yarnpkg.com/) (v1)
- [Caddy](https://caddyserver.com/) — install with `brew install caddy` on macOS

## Getting Started

```bash
yarn install
yarn dev
```

This starts Hugo, Astro, and a Caddy reverse proxy concurrently. Visit:

- `http://localhost:3000/hugo/` — Hugo pages
- `http://localhost:3000/astro/` — Astro pages

## Project Structure

```
├── astro/          # Astro site (SSR with Preact components)
├── hugo/           # Hugo site (legacy mock)
├── shared/         # Shared theme, nav config, and scripts
│   ├── theme/      # CSS tokens, reset, base styles, component styles
│   ├── nav.yaml    # Shared navigation definition
│   └── scripts/    # Build/generation scripts
├── tests/          # Playwright e2e tests
├── docs/           # Documentation and user stories
├── CLAUDE.md       # AI assistant instructions
├── design.md       # Design document
└── plan.md         # Implementation plan
```

## Testing

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
