# Implementation plan

This plan is divided into steps that each produce a verifiable, working increment of the site. Later steps build on earlier ones. Each component step includes its own tests (per CLAUDE.md: add tests alongside features).

---

## Step 1: Monorepo scaffolding

Set up the directory structure, package manager, and minimal configs for Hugo and Astro so that both sites can build independently (even if they serve blank pages).

### Implementation

1. Initialize a root `package.json` with yarn workspaces pointing to `astro/`, `hugo/`, and `shared/`.
2. Create the `shared/` directory with a `theme/` subfolder (empty for now) and a `package.json`.
3. Scaffold the Astro site in `astro/`:
   - `yarn create astro` or manual setup with `astro`, `@astrojs/node`, and `@astrojs/preact` as dependencies.
   - Configure `astro.config.mjs` for SSR with the Node adapter. Keep the config flexible so SSG can be added later (avoid hard-coding `output: 'server'` in a way that would be difficult to make hybrid).
   - Add a single placeholder index page (`src/pages/index.astro`) that renders "Astro is running."
4. Scaffold the Hugo site in `hugo/`:
   - Add `hugo-bin` as a devDependency in `hugo/package.json`. Pin the Hugo version to 0.148.0 by adding a `"hugo-bin"` config block in `hugo/package.json`:
     ```json
     "hugo-bin": {
       "buildTags": "extended",
       "version": "0.148.0"
     }
     ```
   - Create the minimal Hugo directory structure: `hugo.toml`, `layouts/_default/baseof.html`, `layouts/index.html`, `content/_index.md`.
   - The index page should render "Hugo is running."
5. Add scripts to each sub-package:
   - `hugo/package.json`: `"dev": "hugo server --port 1313"`
   - `astro/package.json`: `"dev": "astro dev --port 4321"`
6. Run `yarn install` at the root to link workspaces.
7. Create a `README.md` at the repo root with the project name, a brief description, prerequisites (Node, Yarn, Caddy), and a link to `docs/` for further documentation.

### Status

TODO

### Verification

- Run `cd hugo && yarn dev` — visit `http://localhost:1313` and confirm "Hugo is running." appears.
- Run `cd astro && yarn dev` — visit `http://localhost:4321` and confirm "Astro is running." appears.
- Confirm the directory structure looks like:
  ```
  ├── astro/
  ├── hugo/
  ├── shared/
  │   └── theme/
  ├── package.json
  ├── README.md
  ├── CLAUDE.md
  ├── design.md
  └── plan.md
  ```

---

## Step 2: Shared CSS theme and design tokens

Create the shared design token system that both Hugo and Astro will consume. This establishes the visual foundation before any components exist.

### Implementation

1. In `shared/theme/`, create:
   - `tokens.css` — CSS custom properties for colors (primary, secondary, grays), typography (font family, sizes, weights, line heights), spacing scale (with both "standard" and "compact" values), border radii, and transitions. Include both light and dark mode values. Dark mode should be toggled via a `data-theme="dark"` attribute on `<html>` (not `prefers-color-scheme`), so it can be controlled by a user toggle. Compact whitespace should be toggled via a `data-density="compact"` attribute on `<html>`, overriding spacing tokens with tighter values.
   - `reset.css` — Minimal CSS reset (box-sizing, margin reset, etc.).
   - `base.css` — Base element styles (body, headings, links, paragraphs) using the tokens. Keep it minimal.
   - `layout.css` — Shell layout styles (sidebar + main content area, header, footer) using BEM naming that maps cleanly to future CSS modules (e.g., `.layout__sidebar`, `.layout__main`).
2. Create an `index.css` that imports all the above in the correct order.
3. Wire up Hugo to consume the shared CSS using Hugo's module mounts in `hugo.toml`:
   ```toml
   [[module.mounts]]
     source = "../shared/theme"
     target = "assets/theme"
   ```
   Import `index.css` in `baseof.html` via Hugo's asset pipeline (`resources.Get "theme/index.css"`).
4. Wire up Astro to consume the shared CSS:
   - Import `../../shared/theme/index.css` in the Astro layout (or configure a path alias in `astro.config.mjs`).
5. Update both placeholder index pages to use a heading and paragraph so the base styles are visible.

### Status

TODO

### Verification

- Run Hugo dev — confirm the page has visible styling (correct font, colors, spacing).
- Run Astro dev — confirm the page has the same visual styling as Hugo.
- Inspect the page in devtools — confirm CSS custom properties like `--color-primary`, `--space-md`, `--font-size-base` etc. are present on `:root`.
- In devtools, manually add `data-theme="dark"` to the `<html>` element — confirm both sites switch to dark theme colors. (The toggle UI will be added in a later step.)
- In devtools, manually add `data-density="compact"` to the `<html>` element — confirm spacing tightens across the page.

---

## Step 3: Nav YAML and Caddyfile generation

Define the shared navigation structure and write a script that generates the Caddyfile from it. This is the routing backbone of the split site.

### Implementation

1. Create `shared/nav.yaml` with a structure like:
   ```yaml
   nav:
     - title: Hugo
       platform: hugo
       path: /hugo
       children:
         - title: Home
           path: /hugo
         # Component demo pages will be added in later steps
     - title: Astro
       platform: astro
       path: /astro
       children:
         - title: Home
           path: /astro
         # Component demo pages will be added in later steps
   ```
   Support up to 3 levels of nesting. Each node has `title`, `path`, and optionally `platform` (hugo|astro) and `children`.
2. Write a generation script (`shared/scripts/generate-caddyfile.js`) that:
   - Reads `nav.yaml`.
   - Collects all paths marked as `hugo` and all paths marked as `astro` (inheriting platform from parent if not specified).
   - Generates a `Caddyfile` at the repo root that:
     - Listens on `:3000`.
     - Routes Hugo paths to `localhost:1313`.
     - Routes Astro paths to `localhost:4321`.
     - Falls back to a 404 handler for unmatched routes.
   - The Caddyfile is generated, **not hand-maintained**.
3. Add a root-level script: `"generate:caddy": "node shared/scripts/generate-caddyfile.js"`.
4. Add a `.gitignore` entry or a comment in the generated Caddyfile indicating it's auto-generated.

### Status

TODO

### Verification

- Run `yarn generate:caddy` and inspect the generated `Caddyfile` — confirm it contains reverse proxy rules routing `/hugo/*` to `:1313` and `/astro/*` to `:4321`.
- Modify `nav.yaml` to add a test entry, re-run the script, and confirm the Caddyfile updates accordingly. Then revert the test entry.

---

## Step 4: Dev environment — single command startup

Wire up Hugo, Astro, and Caddy to all start with a single `yarn dev` at the repo root.

### Implementation

1. Add `concurrently` as a root devDependency.
2. Write a nav data generation script (`shared/scripts/generate-nav-data.js`) that converts `shared/nav.yaml` into a Hugo data file (`hugo/data/nav.json`) so Hugo templates can access the nav tree. This script is also needed by Astro (which can import the YAML directly or use the generated JSON).
3. Add a root-level `"dev"` script that:
   - Runs `generate:caddy` and `generate:nav` first (sequentially, before the servers start).
   - Then concurrently starts Hugo dev, Astro dev, and Caddy.
   - Use `concurrently` with labels (e.g., `[hugo]`, `[astro]`, `[caddy]`) for clear terminal output.
4. Caddy should be started with `caddy run --config Caddyfile`. Caddy is a system prerequisite — document installation instructions in the README (e.g., `brew install caddy` on macOS).
5. Ensure Hugo serves content at paths that match the nav YAML. Hugo content under `content/` will be served at `localhost:1313/`. If the nav defines Hugo pages at `/hugo/...`, then content should be structured as `content/hugo/...` so Hugo serves them at `/hugo/...`. Caddy proxies `/hugo/*` to `localhost:1313/hugo/*` without path rewriting.
6. Configure Astro's `base` option to `/astro` so its routes align with the nav YAML paths (e.g., `src/pages/index.astro` becomes `/astro/`). Caddy proxies `/astro/*` to `localhost:4321/astro/*` without path rewriting.

### Status

TODO

### Verification

- Run `yarn dev` from the repo root — confirm Hugo, Astro, and Caddy all start without errors.
- Visit `http://localhost:3000/hugo/` — confirm "Hugo is running." appears (proxied through Caddy from Hugo on :1313).
- Visit `http://localhost:3000/astro/` — confirm "Astro is running." appears (proxied through Caddy from Astro on :4321).
- Visit `http://localhost:3000/nonexistent` — confirm a 404 response is returned.

---

## Step 5: Testing infrastructure

Set up Vitest for Preact component unit tests and Playwright for e2e tests. No tests yet — just the configuration and helpers. This is done early so that all subsequent component steps include tests alongside the implementation.

### Implementation

1. **Vitest (in `astro/`):**
   - Add `vitest`, `@testing-library/preact`, `jsdom` (or `happy-dom`) as devDependencies.
   - Create `astro/vitest.config.ts` configured for Preact JSX and the shared theme path.
   - Create a test helper file if needed for common setup.
   - Add a `"test"` script to `astro/package.json`.
   - Create `astro/tests/__snapshots__/` directory structure.
   - Configure Vitest file snapshots to use `.html` extension (via `toMatchFileSnapshot()`) so the snapshot viewer (Step 13) can wrap them in the site's styles.
2. **Playwright (at repo root):**
   - Add `@playwright/test` as a root devDependency.
   - Create `playwright.config.ts` at the repo root:
     - Configure for Chromium only.
     - Set base URL to `http://localhost:3000` (the Caddy proxy).
     - Configure screenshot comparison settings.
     - Set up a `webServer` config that runs `yarn dev` before tests (needs to wait for all three services: Hugo on :1313, Astro on :4321, Caddy on :3000).
   - Create a `tests/e2e/` directory for e2e test files.
   - Create a `tests/e2e/screenshots/` directory for screenshot baselines.
   - Add root scripts: `"test:unit": "yarn workspace astro test"`, `"test:e2e": "playwright test"`, `"test": "yarn test:unit && yarn test:e2e"`.
3. Run `npx playwright install chromium` to install the browser.

### Status

TODO

### Verification

- Run `yarn test:unit` — confirm Vitest starts and reports "no tests found" (or runs a trivial placeholder test) without errors.
- Run `yarn test:e2e` — confirm Playwright starts, launches Chromium, and reports "no tests found" without errors. Confirm it starts the dev server automatically via `webServer`.

---

## Step 6: Site shell, navigation, and settings toggles

Build the shared layout shell (header, sidebar nav, main content area, footer) in both Hugo and Astro, driven by the shared `nav.yaml`. Include a dark mode toggle and a whitespace density toggle in the header. This is the first step where the two sites start to feel like one.

### Implementation

1. **Hugo nav integration:**
   - The nav data was generated in Step 4 (`hugo/data/nav.json`). Use it in Hugo templates.
   - In `baseof.html`, build the shell: header with site title, sidebar nav using `<details>`/`<summary>` tags for collapsible sections, main content area, footer.
   - The nav should render all 3 levels from the YAML. The `<details>` section containing the current page should have the `open` attribute set. Links to Astro pages should be full hrefs (they'll go through Caddy).
2. **Astro nav integration:**
   - Create a `Layout.astro` component that reads `nav.yaml` (via a JS/TS import of the parsed YAML, e.g., using a YAML loader or the generated JSON).
   - Render the same shell structure: header, sidebar nav with `<details>`/`<summary>`, main content, footer.
   - The current page's `<details>` ancestor should be `open`. Links to Hugo pages should use full hrefs **and** include `data-astro-reload` to prevent Astro's client router from intercepting them (since Hugo pages can't be SPA-navigated).
3. Both should use the shared `layout.css` BEM classes for the shell structure so they look identical.
4. Add the `shared/nav.yaml` home pages as actual content pages in both sites.
5. **Settings toggles (in the header, both Hugo and Astro):**
   - Add a dark mode toggle button that sets `data-theme="dark"` on `<html>` (and removes it for light mode). These toggles only impact CSS tokens — no other logic changes are needed.
   - Add a whitespace density toggle (standard/compact) that sets `data-density="compact"` on `<html>`.
   - Both toggles should use a small inline `<script>` (shared between Hugo and Astro via a file in `shared/`) that persists the user's choice to `localStorage` and restores it on page load (including across Hugo/Astro navigation).
   - Use emoji for the toggle icons (e.g., sun/moon for theme, expand/collapse for density).
6. **Accessibility:**
   - Use semantic landmark elements: `<header>`, `<nav>`, `<main>`, `<footer>`.
   - Add `aria-label="Site navigation"` to the `<nav>` element.
   - Mark the current page link with `aria-current="page"`.
   - Ensure all nav links and `<details>`/`<summary>` toggles are keyboard-focusable and operable with Enter/Space.
   - Use a skip-to-content link as the first focusable element in the shell.
   - Settings toggle buttons should have accessible labels (e.g., `aria-label="Switch to dark mode"`).

### Tests

**Playwright e2e** (`tests/e2e/navigation.spec.ts`):
- Test navigating between Hugo pages.
- Test navigating between Astro pages.
- Test navigating from Hugo to Astro and back.
- Verify the nav sidebar correctly reflects the current page (check `aria-current="page"` on the active link).
- Test keyboard navigation through the sidebar nav (Tab key, Enter to follow links).
- Verify the skip-to-content link works (Tab to it, press Enter, confirm focus moves to main content).

**Playwright e2e** (`tests/e2e/settings-toggles.spec.ts`):
- Click the dark mode toggle — verify `data-theme="dark"` is set on `<html>`.
- Reload the page — verify the setting persists (via localStorage).
- Navigate from Hugo to Astro — verify the setting persists across platforms.
- Click the whitespace density toggle — verify `data-density="compact"` is set on `<html>`.
- Verify both toggles are keyboard-accessible (Tab, Enter/Space).
- Take light vs dark and standard vs compact screenshots.

### Status

TODO

### Verification

- Run `yarn dev` and visit `http://localhost:3000/hugo/` — confirm the sidebar nav appears with "Hugo" and "Astro" top-level sections, the Hugo section is open, and "Home" is highlighted or visually indicated as the current page.
- Visit `http://localhost:3000/astro/` — confirm the same nav appears with the Astro section open.
- Click a link in the Hugo nav that points to an Astro page — confirm it navigates to the Astro site through Caddy, and the nav updates to reflect the new location.
- Click a link in the Astro nav that points to a Hugo page — confirm the reverse works too.
- Confirm the header, footer, and overall layout look visually identical between the two sites.
- Click the dark mode toggle — confirm the site switches to dark theme. Refresh the page — confirm the setting persists. Navigate to the other platform (Hugo to Astro or vice versa) — confirm the setting persists across the boundary.
- Click the whitespace density toggle — confirm spacing tightens. Refresh — confirm it persists.
- Tab through the page with the keyboard — confirm you can reach all nav links, the settings toggles, the skip-to-content link moves focus to the main content area, and the current page link is distinguishable.
- Inspect the HTML — confirm `<header>`, `<nav>`, `<main>`, `<footer>` landmarks are used and the current page has `aria-current="page"`.
- Run `yarn test:e2e` — confirm navigation and settings e2e tests pass.

---

## Step 7: View transitions

Add view transitions so that navigating between pages (including cross-platform Hugo/Astro navigation) feels seamless, with the shell elements (header, nav, footer) persisting visually.

### Implementation

1. **Astro side:**
   - Add Astro's `<ClientRouter />` component (from `astro:transitions/ClientRouter`) to the `<head>` in `Layout.astro`. (Note: this was previously called `<ViewTransitions />` in Astro 3.x — use the current API name.)
   - Add `transition:name` attributes to the shell elements (header, sidebar, footer, main content area) so they are matched across navigations.
   - Add `transition:animate` directives — use `"none"` for the shell elements (they should persist) and a subtle fade or slide for the main content.
   - Ensure all links to Hugo pages have `data-astro-reload` (from Step 6) so `<ClientRouter />` does not attempt SPA navigation to non-Astro pages.
2. **Hugo side:**
   - Add the View Transitions API meta tag to `baseof.html`: `<meta name="view-transition" content="same-origin" />`.
   - Add matching `view-transition-name` CSS properties to the shell elements in Hugo's layout, using the same names as Astro's `transition:name` values.
   - This relies on the browser's native View Transitions API (Chrome supports it). Since Hugo and Astro are behind the same Caddy proxy (same origin), cross-platform MPA transitions will work.
3. Add a small shared CSS snippet for the view transition animations (e.g., `::view-transition-old(main-content)` and `::view-transition-new(main-content)` with a fade).

### Tests

**Playwright e2e** (`tests/e2e/view-transitions.spec.ts`):
- Verify that `view-transition-name` CSS properties are present on shell elements on both Hugo and Astro pages.
- Take before/after screenshots of cross-platform navigation (Hugo → Astro and Astro → Hugo).
- Verify that Astro-to-Hugo links have `data-astro-reload`.

### Status

TODO

### Verification

- Run `yarn dev` and navigate between two Hugo pages — confirm the shell stays in place and the content area transitions smoothly.
- Navigate between two Astro pages — confirm the same smooth transition.
- Navigate from a Hugo page to an Astro page — confirm the transition works (the shell should visually persist since the layout and transition names match).
- Navigate from an Astro page to a Hugo page — confirm the reverse.
- Open Chrome DevTools and enable "slow animations" to clearly see the transitions.
- Run `yarn test:e2e` — confirm view transition tests pass.

---

## Step 8: Alert component

Build the first shared component — alerts — in both Hugo and Astro. Alerts are static (no client-side interactivity), making them a good starting point.

### Implementation

1. **Shared CSS:**
   - Create `shared/theme/components/alert.css` with BEM classes: `.alert`, `.alert--info`, `.alert--warning`, `.alert--error`, `.alert--success`. Use emoji prefixes for the alert levels (e.g., `ℹ️` for info, `⚠️` for warning).
   - Import this file in the shared `index.css`.
2. **Astro component:**
   - Create `astro/src/components/Alert.astro` — a static Astro component that accepts `type` (info/warning/error/success) and renders a slot for content.
   - Since this is static (no Preact needed), it renders to plain HTML with BEM classes.
   - Use `role="alert"` for urgent alerts (error/warning) and `role="status"` for informational ones (info/success). Add `aria-label` with the alert type (e.g., `aria-label="Warning"`).
3. **Hugo shortcode:**
   - Create `hugo/layouts/shortcodes/alert.html` — a Hugo shortcode that accepts a `type` parameter and renders the inner content.
   - Use the same HTML structure, BEM classes, and ARIA attributes as the Astro component.
4. **Demo pages:**
   - Create `astro/src/pages/astro/alerts.astro` — shows all alert variants (info, warning, error, success) with example content.
   - Create `hugo/content/hugo/alerts.md` — uses the `{{< alert >}}` shortcode to show all variants.
5. **Update `shared/nav.yaml`** to add "Alerts" under both Hugo and Astro sections.
6. **Regenerate the Caddyfile** (`yarn generate:caddy`).

### Tests

**Playwright e2e** (`tests/e2e/alerts.spec.ts`):
- Verify all alert types render on both `/hugo/alerts` and `/astro/alerts`.
- Verify correct ARIA roles (`role="alert"` for error/warning, `role="status"` for info/success).
- Screenshot test for visual comparison between Hugo and Astro.
- Toggle dark mode — confirm alerts render correctly in both themes (screenshot).

### Status

TODO

### Verification

- Run `yarn dev`.
- Visit `http://localhost:3000/hugo/alerts` — confirm all four alert types render with distinct colors and emoji icons.
- Visit `http://localhost:3000/astro/alerts` — confirm the same four alert types render, visually matching the Hugo versions.
- Compare the two pages side by side — the alerts should be visually indistinguishable.
- Toggle dark mode — confirm alerts look correct in both themes.
- Check the sidebar nav — confirm "Alerts" appears under both Hugo and Astro sections.
- Run `yarn test:e2e` — confirm alert tests pass.

---

## Step 9: Tabs component

Build the tabs component, which requires client-side interactivity (Preact on Astro, vanilla JS on Hugo).

### Implementation

1. **Shared CSS:**
   - Create `shared/theme/components/tabs.css` with BEM classes: `.tabs`, `.tabs__nav`, `.tabs__tab`, `.tabs__tab--active`, `.tabs__panel`. Style the active tab with the primary color token.
2. **Astro component (Preact):**
   - Create `astro/src/components/Tabs.tsx` — a Preact component with `client:load` hydration.
   - Accept tabs as props (array of `{ label, content }` or similar).
   - Manage active tab state in Preact. Render tab navigation and panels. Only show the active panel.
   - Use `data-testid` attributes for test targeting.
   - **Accessibility:** Use WAI-ARIA tabs pattern — `role="tablist"` on the nav, `role="tab"` on each tab button, `role="tabpanel"` on each panel. Set `aria-selected="true"` on the active tab, `aria-controls` linking tabs to panels, and `tabindex` management. Support arrow key navigation between tabs (Left/Right arrows move focus between tabs, Home/End jump to first/last).
3. **Hugo shortcode:**
   - Create `hugo/layouts/shortcodes/tabs.html` and `hugo/layouts/shortcodes/tab.html` shortcodes.
   - Render the same HTML structure, BEM classes, and ARIA attributes.
   - Add a small inline `<script>` (or a JS file in Hugo's `static/js/`) for tab switching behavior, including the same arrow key navigation.
4. **Demo pages:**
   - Create `astro/src/pages/astro/tabs.astro` — shows tabs with 2 tabs, 3 tabs, and tabs with rich content (code blocks, paragraphs).
   - Create `hugo/content/hugo/tabs.md` — same permutations using shortcodes.
5. **Update `shared/nav.yaml`** and regenerate Caddyfile.

### Tests

**Vitest unit tests** (`astro/tests/Tabs.test.tsx`):
- Render Tabs with 2 and 3 tabs, verify correct initial render.
- Verify tab switching updates the active panel.
- Verify ARIA attributes: `role="tablist"`, `role="tab"`, `role="tabpanel"`, `aria-selected`, `aria-controls`.
- Test arrow key navigation between tabs (Left/Right, Home/End).
- Include file snapshots (`.html` via `toMatchFileSnapshot()`) in `__snapshots__/Tabs/`.

**Playwright e2e** (`tests/e2e/tabs.spec.ts`):
- Verify tab switching on both `/hugo/tabs` and `/astro/tabs`.
- Test keyboard interaction: arrow keys to navigate tabs, Enter/Space to activate, Home/End to jump to first/last tab.
- Verify ARIA attributes update correctly on tab switch.
- Take before (first tab active) and after (second tab active) screenshots.

### Status

TODO

### Verification

- Visit `http://localhost:3000/hugo/tabs` — click each tab and confirm the panel content switches. Confirm the active tab is visually highlighted.
- Visit `http://localhost:3000/astro/tabs` — confirm the same behavior.
- Compare visually — tab nav and panels should look the same on both sites.
- Confirm that the first tab is active by default on page load.
- Use keyboard only: Tab to the tab nav, use Left/Right arrow keys to move between tabs, press Enter/Space to activate. Confirm focus stays within the tab list and the correct panel shows.
- Toggle dark mode — confirm tabs render correctly.
- Run `yarn test:unit` — confirm Vitest Tabs tests pass.
- Run `yarn test:e2e` — confirm Playwright tabs tests pass.

---

## Step 10: Syntax-highlighted code blocks

Set up syntax highlighting with Chroma (Hugo) and Shiki (Astro), with shared CSS tokens to normalize their appearance.

### Implementation

1. **Hugo (Chroma):**
   - In `hugo.toml`, configure Chroma to use CSS classes (`markup.highlight.noClasses = false`) so we can control colors via CSS.
   - Generate a base Chroma CSS file and customize it to use the shared color tokens.
2. **Astro (Shiki):**
   - Configure Shiki in `astro.config.mjs` to use the CSS variables theme (`css-variables`), which outputs CSS custom properties instead of inline styles.
   - Map Shiki's CSS variable names to the shared color tokens.
3. **Shared CSS:**
   - Create `shared/theme/components/code.css` with shared styles for the code block container (`.code-block` BEM class): background, border-radius, padding, font, scrolling.
   - Create `shared/theme/components/code-chroma.css` for Chroma-specific token-to-CSS-variable mappings.
   - Create `shared/theme/components/code-shiki.css` for Shiki-specific CSS variable overrides.
   - Both should reference the same color tokens so the overall look is consistent, even if individual token mappings differ slightly.
4. **Demo pages:**
   - Create `astro/src/pages/astro/code-blocks.astro` — show code blocks in multiple languages (JavaScript, Python, HTML, Go, bash).
   - Create `hugo/content/hugo/code-blocks.md` — same languages using fenced code blocks.
5. **Update `shared/nav.yaml`** and regenerate Caddyfile.

### Tests

**Playwright e2e** (`tests/e2e/code-blocks.spec.ts`):
- Verify code blocks render with syntax highlighting on both sites.
- Screenshot test comparing Hugo (Chroma) and Astro (Shiki) rendering.
- Toggle dark mode — confirm code blocks switch to dark theme colors on both sites.

### Status

TODO

### Verification

- Visit `http://localhost:3000/hugo/code-blocks` — confirm syntax-highlighted code blocks render for all languages with visible color differentiation.
- Visit `http://localhost:3000/astro/code-blocks` — confirm the same.
- Compare them side by side — the background, font, padding, and general color palette should match. Individual token colors may differ slightly (document any significant differences).
- Toggle dark mode — confirm code blocks switch to dark theme colors on both sites.
- Run `yarn test:e2e` — confirm code-blocks tests pass.

---

## Step 11: Collapsible sections component

Build collapsible content sections with slide up/down animation, defaulting to closed with an option to force open.

### Implementation

1. **Shared CSS:**
   - Create `shared/theme/components/collapsible.css` with BEM classes: `.collapsible`, `.collapsible__header`, `.collapsible__content`, `.collapsible--open`. Include CSS transitions for the slide animation (use `max-height` or `grid-template-rows` trick for smooth animation).
2. **Astro component (Preact):**
   - Create `astro/src/components/Collapsible.tsx` — a Preact component with `client:load`.
   - Accept `title` and `defaultOpen` (boolean) props.
   - Manage open/closed state. Animate content reveal with CSS transitions.
   - Use `data-testid` attributes.
   - **Accessibility:** Use a `<button>` for the toggle header with `aria-expanded="true|false"` and `aria-controls` pointing to the content panel's `id`. The content panel should have `role="region"` and `aria-labelledby` referencing the button. Ensure the button is keyboard-operable (Enter/Space to toggle).
3. **Hugo shortcode:**
   - Create `hugo/layouts/shortcodes/collapsible.html`.
   - Same HTML structure, BEM classes, and ARIA attributes.
   - Add vanilla JS for toggle behavior and animation (including updating `aria-expanded`).
   - Support a `defaultOpen` parameter.
4. **Demo pages:**
   - Create `astro/src/pages/astro/collapsible.astro` — show: a closed collapsible, a default-open collapsible, multiple collapsibles in sequence, a collapsible with rich content inside.
   - Create `hugo/content/hugo/collapsible.md` — same permutations.
5. **Update `shared/nav.yaml`** and regenerate Caddyfile.

### Tests

**Vitest unit tests** (`astro/tests/Collapsible.test.tsx`):
- Render Collapsible closed and open (via `defaultOpen`), verify toggle behavior.
- Verify `aria-expanded` toggles correctly and `aria-controls`/`aria-labelledby` are wired up.
- Test keyboard toggle (Enter/Space on the button).
- Include file snapshots (`.html` via `toMatchFileSnapshot()`) in `__snapshots__/Collapsible/`.

**Playwright e2e** (`tests/e2e/collapsible.spec.ts`):
- Verify open/close behavior on both `/hugo/collapsible` and `/astro/collapsible`.
- Verify `defaultOpen` behavior — section is open on page load.
- Test keyboard toggle (Tab to header, Enter/Space to toggle).
- Verify `aria-expanded` updates on toggle.
- Take before (closed) and after (open) screenshots.

### Status

TODO

### Verification

- Visit `http://localhost:3000/hugo/collapsible` — click a closed section header and confirm it slides open smoothly. Click again to close.
- Confirm the "default open" section is already open on page load.
- Visit `http://localhost:3000/astro/collapsible` — confirm the same behavior and visuals.
- Use keyboard only: Tab to a collapsible header, press Enter or Space to toggle. Confirm `aria-expanded` updates in devtools.
- Toggle dark mode — confirm collapsible sections render correctly.
- Run `yarn test:unit` — confirm Vitest Collapsible tests pass.
- Run `yarn test:e2e` — confirm Playwright collapsible tests pass.

---

## Step 12: Shared 404 page

Add a 404 page that Caddy serves for unmatched routes.

### Implementation

1. Create a static `shared/404.html` page that:
   - Uses the shared CSS (linked via a relative path or inlined).
   - Shows a friendly 404 message with a link back to the home page (`/hugo/` or `/astro/`).
   - Matches the site's visual style (uses the same tokens and typography).
2. Update the Caddyfile generation script to serve this file for unmatched routes using Caddy's `handle_errors` or a fallback `respond` directive.
3. Regenerate the Caddyfile.

### Tests

**Playwright e2e** (`tests/e2e/404.spec.ts`):
- Verify 404 page renders for unknown routes (e.g., `/this-does-not-exist`).
- Verify the page includes a link back to a home page.
- Verify the 404 page uses the site's styling.

### Status

TODO

### Verification

- Run `yarn dev` and visit `http://localhost:3000/this-does-not-exist` — confirm the 404 page renders with the site's styling and a link back to the home page.
- Click the home link on the 404 page — confirm it navigates to a working page.
- Run `yarn test:e2e` — confirm 404 tests pass.

---

## Step 13: Snapshot viewer

Build a generated HTML page that wraps Vitest component snapshots in the site's styles, so you can visually verify what components look like without running the full site.

### Implementation

1. Create a script (`shared/scripts/generate-snapshot-viewer.js`) that:
   - Scans the `astro/tests/__snapshots__/` directory for all `.html` snapshot files (generated by `toMatchFileSnapshot()` in Vitest).
   - For each snapshot, wraps it in a minimal HTML page that imports the shared `index.css` (tokens, reset, base, component styles).
   - Generates an index page listing all component snapshots with links.
   - Includes both a light and dark theme rendering for each snapshot (via `data-theme` attribute).
   - Outputs the viewer to a `snapshot-viewer/` directory at the repo root.
2. Add a root-level script: `"view-snapshots": "node shared/scripts/generate-snapshot-viewer.js && open snapshot-viewer/index.html"` (or use a simple local server).
3. Add `snapshot-viewer/` to `.gitignore` (it's generated output).

### Status

TODO

### Verification

- Run `yarn test:unit` first (to generate snapshots), then run `yarn view-snapshots`.
- Confirm a browser window opens showing an index of all component snapshots.
- Click into a snapshot — confirm the component HTML renders with the site's full styling (tokens, colors, typography, component CSS).
- Verify that both light and dark theme variants are visible.

---

## Step 14: User story documentation

Create the user story documentation with Playwright screenshots, linking everything together in an index file.

### Implementation

1. Create `docs/user_stories.md` as the index file linking to individual stories.
2. Create individual user story files:
   - `docs/user_stories/seamless-navigation.md` — "The user can seamlessly navigate between Hugo and Astro pages." Include Playwright screenshots showing the nav state before and after cross-platform navigation.
   - `docs/user_stories/tabs.md` — "The user can switch tabs with the tab nav." Include before/after screenshots.
   - `docs/user_stories/alerts.md` — "The user can see contextual alert messages." Include screenshots of all alert types on both platforms.
   - `docs/user_stories/code-blocks.md` — "The user can view syntax-highlighted code." Include screenshots comparing Hugo and Astro rendering.
   - `docs/user_stories/collapsible.md` — "The user can expand and collapse content sections." Include before/after screenshots.
   - `docs/user_stories/settings-toggles.md` — "The user can toggle dark mode and whitespace density." Include light/dark and standard/compact comparison screenshots. Note that settings persist across Hugo/Astro navigation via localStorage.
3. Each story file should:
   - State the user story clearly.
   - Embed the relevant Playwright screenshots (reference them from the test output directory).
   - Note any caveats or differences between Hugo and Astro implementations.
4. Update `docs/user_stories.md` to link to all individual story files.
5. **Update README** with a link to the user story documentation and any other information that has accumulated during implementation.

### Status

TODO

### Verification

- Review `docs/user_stories.md` — confirm it links to all individual story files.
- Review `docs/user_stories/seamless-navigation.md` — confirm it clearly describes the feature, includes working screenshot references, and notes any limitations.
- Review `docs/user_stories/tabs.md` — confirm the before/after screenshots are referenced and the story is clear.
- Spot-check the remaining story files for completeness.
- Confirm all referenced screenshot files exist.
- Confirm the README is up to date with links to docs.
