# Implementation Notes

Notes organized by plan step, capturing decisions, issues, and things worth knowing.

---

## Step 1: Monorepo scaffolding

- **hugo-bin version mismatch**: `hugo-bin@0.148.0` npm package installs Hugo v0.151.0, not v0.148.0. The `hugo-bin.version` field in `package.json` is supposed to control the downloaded binary version but didn't pin as expected. Not a blocker since the version is close enough.

## Step 2: Shared CSS theme and design tokens

- **CSS `@import` in inline `<style>` blocks doesn't work**: Hugo's `resources.Get "theme/index.css"` would inline the file content including `@import` directives, but `@import` inside `<style>` blocks is invalid. Fixed by reading each CSS file individually via separate `resources.Get` calls in `baseof.html`.
- **Dark mode implementation**: Used `data-theme="dark"` attribute on `<html>` rather than `prefers-color-scheme` media query. This allows programmatic toggling with localStorage persistence.

## Step 3: Nav YAML and Caddyfile generation

- **`handle` vs `handle_path`**: Initially used `handle_path` (which strips the matched prefix from the proxied URL). Since Hugo serves at `/hugo/` and Astro at `/astro/`, the path must be preserved. Switched to `handle` which forwards the full path.
- The Caddyfile generator extracts unique top-level path segments from nav.yaml, so adding new pages only requires editing `nav.yaml`.

## Step 4: Dev environment — single command startup

- Used `concurrently` with labels (`-n hugo,astro,caddy -c blue,magenta,green`) for clear terminal output.
- Hugo content lives under `content/hugo/` so it serves at `/hugo/` matching the nav paths.
- Astro uses `base: '/astro'` in its config to prefix all routes.

## Step 5: Testing infrastructure

- **Vitest**: Uses `happy-dom` (faster than jsdom), `@preact/preset-vite` for JSX transform, and `@testing-library/preact` for component testing. Added `passWithNoTests: true` to avoid failures when no test files exist yet.
- **Playwright**: Chromium only, `baseURL: 'http://localhost:3000'`, `webServer` config starts `yarn dev` automatically with 30s timeout.

## Step 6: Site shell, navigation, and settings toggles

- **Skip-to-content link**: `<main>` needed `tabindex="-1"` to receive programmatic focus from the skip link. Without it, focus wouldn't move.
- **Settings persistence**: An IIFE runs before paint to restore theme/density from localStorage, preventing flash of unstyled content. Click handlers are attached on `DOMContentLoaded`.
- **`data-astro-reload`**: Astro renders this as `data-astro-reload="true"` (not `data-astro-reload=""`). Tests should use `toHaveAttribute('data-astro-reload')` without checking value.

## Step 7: View transitions

- **Astro**: Uses `<ClientRouter />` (the current API name, replacing the deprecated `<ViewTransitions />` from Astro 3.x) plus `transition:name` and `transition:animate` attributes.
- **Hugo**: Uses the native View Transitions API via `<meta name="view-transition" content="same-origin">` with inline `style="view-transition-name: ..."` on shell elements.
- Since both sites are behind the same Caddy proxy (same origin), cross-platform MPA transitions work natively in Chrome.

## Step 8: Alert component

- Static component (no JS needed). Astro uses `Alert.astro`, Hugo uses a shortcode.
- Used `role="alert"` for error/warning (urgent) and `role="status"` for info/success (polite).
- Emoji prefixes (ℹ️, ⚠️, ❌, ✅) provide visual cues without requiring icon assets.

## Step 9: Tabs component

- **Preact hydration through Caddy**: This was the biggest issue. Preact islands couldn't hydrate because Vite dev server module paths (`/@id/*`, `/@vite/*`, `/@fs/*`, `/node_modules/*`, `/src/*`) were returning 404 from Caddy's catch-all handler. Fixed by adding these paths to the Caddyfile generator, proxying them to the Astro dev server on `:4321`.
- **Hugo tabs shortcode**: Used a JS-based DOM transformation approach — render raw `<div data-tab-label="...">` elements from the shortcode, then an inline `<script>` restructures them into a proper WAI-ARIA tablist + panels structure.
- **Hydration race condition**: Used Playwright's `toPass({ timeout: 5000 })` retry pattern to handle Preact hydration timing in e2e tests.

## Step 10: Syntax-highlighted code blocks

- **Hugo Chroma**: Configured with `noClasses = false` in `hugo.toml` so Chroma outputs CSS classes instead of inline styles. The `code-chroma.css` file maps Chroma class names to shared color tokens.
- **Astro Shiki**: Used the `css-variables` theme which outputs CSS custom properties instead of hardcoded colors. The `code-shiki.css` file maps Shiki's `--astro-code-*` variables to shared tokens.
- **Testing approach**: Hugo Chroma uses CSS classes on spans; Astro Shiki uses inline `style="color:..."`. The e2e test checks for either approach to confirm highlighting is active.
- Astro's `<Code />` component was used in the `.astro` page (Shiki only auto-highlights in `.md` files).

## Step 11: Collapsible sections component

- **CSS animation technique**: Used `grid-template-rows` transitioning between `0fr` and `1fr`. This provides smooth slide animations without needing to know or measure the content height — a modern CSS technique that avoids the `max-height` hack.
- The Preact component uses `useId()` for generating unique IDs for ARIA relationships.
- Hugo shortcode uses inline JS per instance (self-initializing with `_collapsibleInit` guard to prevent double-binding).

## Step 12: Shared 404 page

- Created a standalone `shared/404.html` with inlined CSS (no external dependencies) so it works without build tools.
- Updated the Caddyfile generator's catch-all `handle` to serve `404.html` via Caddy's `file_server` instead of a plain text `respond` directive.

## Step 13: Snapshot viewer

- The generator script (`generate-snapshot-viewer.js`) reads `index.css` import order, concatenates all CSS files, and wraps each Vitest file snapshot in a full HTML page with both light and dark theme renderings.
- Output goes to `snapshot-viewer/` (gitignored). Run with `yarn view-snapshots`.

## Step 14: User story documentation

- Created 6 user story files in `docs/user_stories/`, each referencing Playwright screenshots from `tests/e2e/screenshots/`.
- Screenshots are auto-generated by e2e tests, so they stay up to date as the site evolves.
- The index file (`docs/user_stories.md`) links to all individual stories.

---

## Test Summary

- **Vitest unit tests**: 14 tests across 2 components (Tabs: 7 tests + 2 snapshots, Collapsible: 7 tests + 2 snapshots)
- **Playwright e2e tests**: 51 tests across 8 spec files (navigation, settings-toggles, view-transitions, alerts, tabs, code-blocks, collapsible, 404)
- All tests pass on Chrome/Chromium
