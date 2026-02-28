# Internationalization (i18n) Plan

This document outlines a strategy for adding multi-language support to the Hugo/Astro split site. It uses Spanish (`es`) as the first additional language for all examples, but the approach generalizes to any number of languages. The plan follows the established industry patterns for each framework (Hugo's built-in i18n system and Astro's official i18n routing) and addresses the Caddy reverse proxy, shared navigation, and cross-platform concerns unique to this architecture.

---

## Table of contents

1. [URL strategy](#1-url-strategy)
2. [Hugo i18n](#2-hugo-i18n)
3. [Astro i18n](#3-astro-i18n)
4. [Caddy routing changes](#4-caddy-routing-changes)
5. [Navigation](#5-navigation)
6. [Language switcher UI](#6-language-switcher-ui)
7. [Shared theme and layout](#7-shared-theme-and-layout)
8. [Translation workflow](#8-translation-workflow)
9. [Component and shortcode text](#9-component-and-shortcode-text)
10. [Settings persistence across languages](#10-settings-persistence-across-languages)
11. [SEO and accessibility](#11-seo-and-accessibility)
12. [Testing](#12-testing)
13. [Open questions and tradeoffs](#13-open-questions-and-tradeoffs)

---

## 1. URL strategy

### Pattern: language prefix in the path

Use a **path prefix** for all non-default languages. English is the default language and keeps its existing URLs unchanged (no `/en/` prefix). Spanish content lives under an `/es/` prefix.

| Language | Hugo page             | Astro page               | Product docs (Hugo)              | Product docs (Astro)                        |
|----------|-----------------------|--------------------------|----------------------------------|---------------------------------------------|
| English  | `/hugo/alerts/`       | `/astro/alerts/`         | `/code-reviews/reviewbot/setup/` | `/debugging-tools/bughunter-pro/setup/`     |
| Spanish  | `/es/hugo/alerts/`    | `/es/astro/alerts/`      | `/es/code-reviews/reviewbot/setup/` | `/es/debugging-tools/bughunter-pro/setup/` |

**Why path prefix (not subdomain or query parameter):**
- Industry standard for multilingual sites (used by MDN, React docs, Vue docs, Hugo docs)
- Works naturally with Caddy's path-based routing
- Shareable, bookmarkable URLs
- Good for SEO (each language has its own crawlable URL space)
- Hugo's built-in i18n system is designed around this pattern
- Astro's official i18n routing uses this pattern

**Why no prefix for English:**
- Avoids breaking all existing URLs (no redirect storm)
- English is the default/fallback language
- Hugo convention: `defaultContentLanguage` can be configured to omit the prefix

---

## 2. Hugo i18n

Hugo has a **first-class i18n system** built in. This plan uses Hugo's recommended patterns throughout.

### 2.1 Configuration changes (`hugo.toml`)

```toml
defaultContentLanguage = "en"
defaultContentLanguageInSubdirectory = false  # no /en/ prefix

[languages]
  [languages.en]
    languageCode = "en-us"
    languageName = "English"
    weight = 1

  [languages.es]
    languageCode = "es"
    languageName = "Español"
    weight = 2
```

This tells Hugo to:
- Serve English content at its current paths (no prefix)
- Serve Spanish content at `/es/...` paths
- Make English the default fallback

### 2.2 Content organization

Use Hugo's **directory-based** approach for translated content. Each language gets a parallel directory tree under a language folder:

```
hugo/content/
├── en/                                  # English content (new location)
│   └── hugo/
│       ├── _index.md
│       ├── alerts.md
│       ├── tabs.md
│       └── ...
│   └── code-reviews/
│       └── reviewbot/
│           ├── setup.md
│           └── ...
└── es/                                  # Spanish content
    └── hugo/
        ├── _index.md                    # Translated
        ├── alerts.md                    # Translated
        ├── tabs.md                      # Translated
        └── ...
    └── code-reviews/
        └── reviewbot/
            ├── setup.md                 # Translated
            └── ...
```

Hugo will automatically mount `content/en/` at root paths and `content/es/` at `/es/...` paths. This requires updating the module mount:

```toml
[[module.mounts]]
  source = "content/en"
  target = "content"
  lang = "en"

[[module.mounts]]
  source = "content/es"
  target = "content"
  lang = "es"
```

**Alternative considered — filename-based:** Hugo also supports `alerts.es.md` alongside `alerts.md`. This is simpler for small sites but doesn't scale well when content trees diverge or when sending folders to translators. The directory approach makes it easy to export an entire `es/` folder for translation.

### 2.3 String translations (`i18n/` files)

For UI strings in templates (button labels, nav titles, footer text, ARIA labels), Hugo uses translation files:

```
hugo/i18n/
├── en.yaml
└── es.yaml
```

**`en.yaml`:**
```yaml
skip_to_content: "Skip to content"
switch_to_dark: "Switch to dark mode"
switch_to_light: "Switch to light mode"
switch_to_compact: "Switch to compact spacing"
switch_to_standard: "Switch to standard spacing"
open_token_editor: "Open token editor"
site_navigation: "Site navigation"
site_title: "Hugo/Astro Split Site: Hugo"
footer_text: "Hugo/Astro Split Site Study"
```

**`es.yaml`:**
```yaml
skip_to_content: "Saltar al contenido"
switch_to_dark: "Cambiar a modo oscuro"
switch_to_light: "Cambiar a modo claro"
switch_to_compact: "Cambiar a espaciado compacto"
switch_to_standard: "Cambiar a espaciado estándar"
open_token_editor: "Abrir editor de tokens"
site_navigation: "Navegación del sitio"
site_title: "Sitio Hugo/Astro: Hugo"
footer_text: "Estudio de sitio Hugo/Astro dividido"
```

**Usage in templates** (`baseof.html`):
```html
<html lang="{{ .Lang }}">
  ...
  <a href="#main-content" class="skip-link">{{ i18n "skip_to_content" }}</a>
  ...
  <nav aria-label="{{ i18n "site_navigation" }}">
  ...
  <footer>{{ i18n "footer_text" }}</footer>
```

### 2.4 Template changes

**`baseof.html` changes:**
- Change `lang="en"` to `lang="{{ .Lang }}"` on `<html>`
- Replace all hardcoded UI strings with `{{ i18n "key" }}` calls
- Update the header home link to use the correct language prefix:
  ```html
  <a href="{{ .Lang | lang.FormatPrefix }}hugo/" class="layout__header-title">
    {{ i18n "site_title" }}
  </a>
  ```
- Add `<link rel="alternate" hreflang="..." href="...">` tags (see [SEO section](#11-seo-and-accessibility))

---

## 3. Astro i18n

Astro's official i18n support (added in v4) uses a routing configuration and helper functions.

### 3.1 Configuration changes (`astro.config.mjs`)

```javascript
export default defineConfig({
  output: 'server',
  base: '/astro',
  adapter: node({ mode: 'standalone' }),
  integrations: [preact()],
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'es'],
    routing: {
      prefixDefaultLocale: false, // no /en/ prefix
    },
  },
  // ... rest of config
});
```

### 3.2 Page organization

Create a parallel `es/` folder inside `src/pages/`:

```
astro/src/pages/
├── index.astro                          # English /astro/
├── alerts.astro                         # English /astro/alerts/
├── tabs.astro                           # English /astro/tabs/
├── debugging-tools/                     # English product docs
│   └── bughunter-pro/
│       └── setup.astro
├── es/                                  # Spanish pages
│   ├── index.astro                      # /astro/es/ (→ served as /es/astro/)
│   ├── alerts.astro                     # /astro/es/alerts/
│   ├── tabs.astro
│   └── debugging-tools/
│       └── bughunter-pro/
│           └── setup.astro
```

**Important routing note:** Astro's `base: '/astro'` means the actual URL served by the Astro dev server will be `/astro/es/alerts/`. Caddy needs to route incoming `/es/astro/*` requests to the Astro server at `/astro/es/*` (see [Caddy section](#4-caddy-routing-changes) for details on how this rewrite works).

### 3.3 String translations

Create a translation utility module:

**`astro/src/i18n/translations.ts`:**
```typescript
export const translations = {
  en: {
    skip_to_content: "Skip to content",
    switch_to_dark: "Switch to dark mode",
    switch_to_light: "Switch to light mode",
    switch_to_compact: "Switch to compact spacing",
    switch_to_standard: "Switch to standard spacing",
    open_token_editor: "Open token editor",
    site_navigation: "Site navigation",
    site_title: "Hugo/Astro Split Site: Astro",
    footer_text: "Hugo/Astro Split Site Study",
  },
  es: {
    skip_to_content: "Saltar al contenido",
    switch_to_dark: "Cambiar a modo oscuro",
    switch_to_light: "Cambiar a modo claro",
    switch_to_compact: "Cambiar a espaciado compacto",
    switch_to_standard: "Cambiar a espaciado estándar",
    open_token_editor: "Abrir editor de tokens",
    site_navigation: "Navegación del sitio",
    site_title: "Sitio Hugo/Astro: Astro",
    footer_text: "Estudio de sitio Hugo/Astro dividido",
  },
} as const;

export type Locale = keyof typeof translations;
export type TranslationKey = keyof typeof translations["en"];

export function t(locale: Locale, key: TranslationKey): string {
  return translations[locale][key] ?? translations.en[key];
}

export function getLocaleFromPath(pathname: string): Locale {
  // Strip the /astro base prefix, then check for /es/ prefix
  const withoutBase = pathname.replace(/^\/astro/, "");
  if (withoutBase.startsWith("/es/") || withoutBase === "/es") return "es";
  return "en";
}
```

### 3.4 Layout changes

**`Layout.astro` changes:**
```astro
---
import { t, getLocaleFromPath, type Locale } from "../i18n/translations";

const locale = getLocaleFromPath(Astro.url.pathname);
---

<html lang={locale}>
  ...
  <a href="#main-content" class="skip-link">{t(locale, "skip_to_content")}</a>
  ...
  <nav aria-label={t(locale, "site_navigation")}>
  ...
  <footer>{t(locale, "footer_text")}</footer>
```

### 3.5 Shared translation keys

To avoid drift between Hugo and Astro UI string translations, store the canonical translation keys in a shared file:

**`shared/i18n/ui-strings.en.yaml`:**
```yaml
skip_to_content: "Skip to content"
switch_to_dark: "Switch to dark mode"
# ... etc.
```

**`shared/i18n/ui-strings.es.yaml`:**
```yaml
skip_to_content: "Saltar al contenido"
switch_to_dark: "Cambiar a modo oscuro"
# ... etc.
```

A build script (or direct import) would feed these into both Hugo's `i18n/` directory and Astro's TypeScript translations module. This ensures the same translation keys and values are used across both frameworks.

---

## 4. Caddy routing changes

This is the most architecturally significant change. The Caddy reverse proxy must now route language-prefixed paths to the correct backend.

### 4.1 Routing rules

The current routing model:
```
/hugo/*                → Hugo (:1313)
/astro/*               → Astro (:4321)
/code-reviews/*        → Hugo (rewrite to /hugo/code-reviews/*)
/debugging-tools/*     → Astro (rewrite to /astro/debugging-tools/*)
```

With i18n, add rules for `/es/` prefixed paths:

```
/es/hugo/*             → Hugo (:1313)  — Hugo serves at /es/hugo/* natively
/es/astro/*            → Astro (:4321) — rewrite to /astro/es/*
/es/code-reviews/*     → Hugo (:1313)  — Hugo serves at /es/code-reviews/* natively (with internal /hugo prefix via existing rewrite)
/es/debugging-tools/*  → Astro (:4321) — rewrite to /astro/es/debugging-tools/*
```

**Key insight:** Hugo's built-in i18n handles the `/es/` prefix natively at the server level — it knows to serve Spanish content when it sees `/es/` in the path. Astro's `base: '/astro'` means Astro expects all requests to start with `/astro/`, so the language prefix goes *after* the base: `/astro/es/alerts/`.

### 4.2 Updated Caddyfile generation

The `generate-caddyfile.js` script needs to be extended. For each supported non-default language, it should generate a parallel set of route handlers with the language prefix.

**Pseudocode for the generation logic:**

```javascript
const LANGUAGES = ['es']; // non-default languages

for (const lang of LANGUAGES) {
  for (const [topPath, { platform, needsRewrite }] of routeMap) {
    // For Hugo: route /{lang}{topPath}* to Hugo
    // Hugo handles the /es/ prefix natively since it's configured with [languages.es]
    if (platform === 'hugo') {
      if (needsRewrite) {
        // e.g., /es/code-reviews/* → rewrite to /hugo/es/code-reviews/* → Hugo
        // Actually, Hugo with i18n serves /es/code-reviews/* directly when content
        // is mounted correctly, but we still need the /hugo prefix rewrite.
        caddyfile += `handle /${lang}${topPath}* {
          rewrite * /hugo/${lang}{uri_without_lang_prefix}
          reverse_proxy localhost:1313
        }`;
      } else {
        // e.g., /es/hugo/* → Hugo serves it directly
        caddyfile += `handle /${lang}${topPath}* {
          reverse_proxy localhost:1313
        }`;
      }
    }

    // For Astro: route /{lang}{topPath}* to Astro with rewrite
    if (platform === 'astro') {
      // Astro expects /astro/es/... so rewrite /{lang}{topPath}* → /astro/{lang}{topPath}*
      // (or /astro/{lang}/* for direct astro paths)
      caddyfile += `handle /${lang}${topPath}* {
        rewrite * /astro/${lang}{remaining_path}
        reverse_proxy localhost:4321
      }`;
    }
  }
}
```

The exact rewrite logic will need careful implementation. The key constraints:
1. Hugo expects paths like `/es/hugo/alerts/` or `/hugo/es/code-reviews/setup/` depending on how content is mounted — this needs testing to confirm Hugo's exact path expectations with language subdir + module mounts.
2. Astro expects paths like `/astro/es/alerts/` (base prefix first, then language, then page path).

### 4.3 Updated `nav.yaml` for language-aware path generation

The `nav.yaml` itself does not need language-specific paths — the paths in `nav.yaml` remain language-neutral (e.g., `/hugo/alerts`), and the rendering layer (Hugo template, Astro layout) prepends the language prefix when generating links for non-default languages. The Caddyfile generator reads the supported languages from a config and generates routes for each.

Add a languages section to `nav.yaml` (or a separate `shared/i18n/config.yaml`):

```yaml
languages:
  - code: en
    name: English
    default: true
  - code: es
    name: Español
```

The Caddyfile generator reads this to know which language prefixes to generate routes for.

---

## 5. Navigation

### 5.1 Nav title translations

The nav item titles ("Alerts", "Tabs", "Setup", etc.) need translations. There are two approaches:

**Option A — Translation keys in `nav.yaml` (recommended):**

```yaml
nav:
  - titleKey: nav_site_components    # instead of "title: Site Components"
    path: /site-components
    children:
      - titleKey: nav_hugo
        platform: hugo
        path: /hugo
        children:
          - titleKey: nav_home
            path: /hugo
          - titleKey: nav_alerts
            path: /hugo/alerts
```

With corresponding translation files:
```yaml
# shared/i18n/nav.en.yaml
nav_site_components: "Site Components"
nav_hugo: "Hugo"
nav_home: "Home"
nav_alerts: "Alerts"
# ...

# shared/i18n/nav.es.yaml
nav_site_components: "Componentes del sitio"
nav_hugo: "Hugo"
nav_home: "Inicio"
nav_alerts: "Alertas"
# ...
```

**Option B — Inline per-language titles in `nav.yaml`:**

```yaml
nav:
  - title:
      en: "Site Components"
      es: "Componentes del sitio"
    path: /site-components
```

**Recommendation:** Option A (translation keys) is cleaner and follows the established pattern used by Hugo's `i18n` system. It also means `nav.yaml` doesn't grow with each new language.

### 5.2 Nav link rendering with language prefix

Both Hugo and Astro nav rendering need to prepend the language prefix to all nav links when displaying the Spanish version:

**Hugo (`baseof.html`):**
```html
{{ $langPrefix := "" }}
{{ if ne .Lang "en" }}
  {{ $langPrefix = printf "/%s" .Lang }}
{{ end }}

<!-- When rendering a nav link: -->
<a href="{{ $langPrefix }}{{ .path }}/">{{ i18n .titleKey }}</a>
```

**Astro (`Layout.astro`):**
```typescript
const langPrefix = locale === "en" ? "" : `/${locale}`;

// When rendering a nav link:
<a href={`${langPrefix}${item.path}/`}>{navTranslations[locale][item.titleKey]}</a>
```

### 5.3 Cross-platform links

When a Hugo page links to an Astro page (or vice versa), the language prefix must be preserved. If you're on `/es/hugo/alerts/` and click a link to Astro's "Alerts" page, it should go to `/es/astro/alerts/`, not `/astro/alerts/`.

This is handled naturally by the nav rendering logic above — all links use `langPrefix + path`, regardless of which platform they point to.

---

## 6. Language switcher UI

### 6.1 Placement

Add a language switcher to the header, alongside the existing settings toggles (theme, density, token editor). Use a `<select>` element or a simple link-based toggle.

**Recommended: link-based toggle** (since there are only 2 languages initially):

```html
<a href="/es/hugo/alerts/" lang="es" hreflang="es">Español</a>
```

The switcher link should point to the **equivalent page** in the other language. For example, if you're on `/hugo/alerts/`, the Spanish link should go to `/es/hugo/alerts/`.

For more than 3-4 languages, switch to a `<select>` dropdown.

### 6.2 Determining the equivalent page URL

**Hugo:** Use Hugo's `.Translations` variable, which automatically provides links to the same page in other languages:

```html
{{ range .Translations }}
  <a href="{{ .RelPermalink }}" lang="{{ .Lang }}" hreflang="{{ .Lang }}">
    {{ .Language.LanguageName }}
  </a>
{{ end }}
```

**Astro:** Compute the alternate URL by manipulating the current path:

```typescript
function getAlternateUrl(currentPath: string, targetLocale: Locale): string {
  const withoutBase = currentPath.replace(/^\/astro/, "");
  const withoutLang = withoutBase.replace(/^\/es/, "");
  const prefix = targetLocale === "en" ? "" : `/${targetLocale}`;
  return `${prefix}${withoutLang || "/"}`;
}
```

### 6.3 Persisting language preference

Store the user's language preference in `localStorage` (key: `"lang"`). This does **not** auto-redirect — it just pre-selects the language in the switcher and could be used to suggest switching. Auto-redirecting based on a cookie or `Accept-Language` header is an anti-pattern for static/SSR sites because it breaks cacheability and can confuse search engines.

---

## 7. Shared theme and layout

### 7.1 CSS — no changes needed

The shared CSS theme (`shared/theme/`) is language-agnostic. CSS custom properties, BEM class names, component styles — none of these change per language.

**Exception for RTL:** If a right-to-left language (Arabic, Hebrew) is ever added, the layout CSS would need `[dir="rtl"]` overrides. This is out of scope for Spanish but worth noting in the architecture for future extensibility. Use CSS logical properties (`margin-inline-start` instead of `margin-left`) proactively if desired.

### 7.2 Shared layout strings

The shared JavaScript files (`settings-toggle.js`, `token-editor.js`) contain ARIA labels and button text. These are currently hardcoded in English. Two options:

1. **Keep JS language-agnostic** — have the ARIA labels set in the HTML templates (Hugo/Astro), not in JS. The JS would use `data-label-dark`, `data-label-light` attributes, and the templates would set these with translated values.

2. **Pass translations to JS** — inject a `window.__i18n = { ... }` object in the template, and have the shared JS read from it.

**Recommendation:** Option 1 (data attributes) is simpler and doesn't require JS changes. Example:

```html
<button
  id="theme-toggle"
  data-label-dark="{{ i18n "switch_to_dark" }}"
  data-label-light="{{ i18n "switch_to_light" }}"
  aria-label="{{ i18n "switch_to_dark" }}"
>🌙</button>
```

The shared JS reads `dataset.labelDark` / `dataset.labelLight` instead of hardcoded strings.

---

## 8. Translation workflow

### 8.1 What gets translated

| Content type | Location | Sent to translator? |
|---|---|---|
| Hugo page content (Markdown) | `hugo/content/es/.../*.md` | Yes — entire folder |
| Astro page content (`.astro` files) | `astro/src/pages/es/.../*.astro` | Yes, with instructions on what to translate (text between tags, not code) |
| Hugo UI strings | `hugo/i18n/es.yaml` | Yes — YAML file |
| Astro UI strings | `shared/i18n/ui-strings.es.yaml` | Yes — YAML file |
| Nav titles | `shared/i18n/nav.es.yaml` | Yes — YAML file |
| Component demo text | Embedded in page content | Translated as part of page content |

### 8.2 Translator handoff process

1. **Initial setup:** Create the full directory tree for the new language by copying the English content:
   ```bash
   # Hugo
   cp -r hugo/content/en hugo/content/es

   # Astro
   cp -r astro/src/pages/*.astro astro/src/pages/es/
   cp -r astro/src/pages/debugging-tools astro/src/pages/es/debugging-tools
   ```

2. **Export for translation:** Zip the following and send to translator:
   - `hugo/content/es/` (Markdown files — translator-friendly format)
   - `astro/src/pages/es/` (Astro files — provide guidance on translating only text content)
   - `shared/i18n/ui-strings.es.yaml`
   - `shared/i18n/nav.es.yaml`

3. **Import translated files:** Drop the returned files back into their original locations. Run `yarn dev` and verify.

4. **Incremental updates:** When English content changes, use a diffing workflow to identify which Spanish files need re-translation. Tools like `i18n-tasks` or simple `git diff` can help.

### 8.3 Markdown is translator-friendly

Hugo Markdown content is ideal for translation workflows because:
- Translators can work in plain text editors
- Front matter is clearly separated from body content
- Code blocks (fenced with ```) should be left untranslated
- Links and image paths generally don't change

Astro `.astro` files are less translator-friendly. Consider extracting translatable content into Markdown content collections for Astro pages that have significant prose, and using Astro's content collections API to load them. For component demo pages where the content is primarily component examples, inline translation is manageable.

---

## 9. Component and shortcode text

### 9.1 Content within components

Component demo pages embed text directly. For translated pages, the translated Markdown (Hugo) or `.astro` file already contains the translated text:

**Hugo (`hugo/content/es/hugo/alerts.md`):**
```markdown
---
title: "Alertas"
---

# Alertas

{{< alert type="info" >}}
Este es un mensaje informativo.
{{< /alert >}}
```

**Astro (`astro/src/pages/es/alerts.astro`):**
```astro
<Alert type="info">
  Este es un mensaje informativo.
</Alert>
```

### 9.2 Component ARIA labels

Components like Tabs and Collapsible have ARIA labels ("Tab 1", "Tab panel 1"). These are generated from the content (tab labels, collapsible titles), so they translate naturally with the content. No additional i18n work is needed for these — the translated page content drives the ARIA attributes.

### 9.3 Shortcode hardcoded text

If any shortcode (e.g., `alert.html`) renders hardcoded text (like "Note:" or "Warning:"), those strings need to use Hugo's `i18n` function:

```html
<!-- Instead of: -->
<span class="alert__title">Warning</span>

<!-- Use: -->
<span class="alert__title">{{ i18n (printf "alert_%s" (.Get "type")) }}</span>
```

With `i18n/es.yaml` containing:
```yaml
alert_info: "Información"
alert_warning: "Advertencia"
alert_error: "Error"
alert_success: "Éxito"
```

---

## 10. Settings persistence across languages

The current settings system (theme, density, token editor) uses `localStorage`, which is scoped by origin. Since all languages are served from the same origin (`localhost:3000`), settings persist automatically across language switches. No changes needed.

---

## 11. SEO and accessibility

### 11.1 `lang` attribute

Both Hugo and Astro already set `lang` on `<html>`. After i18n:
- Hugo: `<html lang="{{ .Lang }}">` outputs `lang="en"` or `lang="es"`
- Astro: `<html lang={locale}>` outputs the same

### 11.2 `hreflang` alternate links

Add `<link rel="alternate">` tags in `<head>` so search engines know about all language versions:

```html
<link rel="alternate" hreflang="en" href="https://example.com/hugo/alerts/" />
<link rel="alternate" hreflang="es" href="https://example.com/es/hugo/alerts/" />
<link rel="alternate" hreflang="x-default" href="https://example.com/hugo/alerts/" />
```

**Hugo:** Use `.Translations` and `.Permalink` to generate these automatically.

**Astro:** Compute from the current path, similar to the language switcher logic.

### 11.3 `dir` attribute

Spanish is LTR, so no change. If RTL languages are added later, add `dir="rtl"` to `<html>`:

```html
<html lang="{{ .Lang }}" dir="{{ if eq .Lang "ar" }}rtl{{ else }}ltr{{ end }}">
```

### 11.4 Accessible language switcher

The language switcher should:
- Use `lang` and `hreflang` attributes on each language link (so screen readers announce "Español" correctly)
- Be wrapped in a `<nav aria-label="Language">` landmark
- Be keyboard navigable

---

## 12. Testing

### 12.1 Playwright e2e tests

**New test file:** `tests/e2e/i18n.spec.ts`

Test cases:
- Spanish pages render at `/es/hugo/...` and `/es/astro/...` URLs
- Navigation shows translated titles when viewing Spanish pages
- Language switcher navigates to the equivalent page in the other language
- Settings (theme, density) persist across language switches
- `lang` attribute on `<html>` matches the current language
- `hreflang` alternate links are present and correct
- Cross-platform navigation preserves language (Spanish Hugo page → Spanish Astro page)
- View transitions work across language-switched pages
- Keyboard navigation through the language switcher

**Update existing tests:**
- Navigation tests should verify Spanish nav items load correctly
- Alert/tab/collapsible tests could optionally run on both `/hugo/alerts/` and `/es/hugo/alerts/` to verify component rendering in translated pages

### 12.2 Visual regression

Add screenshot baselines for Spanish pages:
- `alerts-hugo-es.png`, `alerts-astro-es.png`
- Language switcher in header (both states)

### 12.3 Unit tests

The Astro `getLocaleFromPath()` and `getAlternateUrl()` helper functions should have Vitest unit tests covering edge cases (root paths, trailing slashes, paths with and without the Astro base prefix).

---

## 13. Open questions and tradeoffs

### 13.1 Should Astro use content collections for translated content?

**Current plan:** Translated Astro pages are full `.astro` files in `src/pages/es/`.

**Alternative:** Use Astro's content collections with Markdown files per language, and a single `.astro` page template that loads the correct language's content. This would make Astro content as translator-friendly as Hugo's Markdown, at the cost of refactoring existing pages.

**Recommendation:** Start with the simpler approach (translated `.astro` files) for component demo pages, since they contain mostly component examples, not prose. For the product documentation pages (Debugging Tools), consider content collections since those are prose-heavy and benefit from Markdown translator workflows.

### 13.2 Caddy rewrite complexity

The language-prefixed Caddy rewrites add significant routing complexity. The `generate-caddyfile.js` script will need thorough testing to ensure:
- `/es/astro/alerts/` correctly rewrites to `/astro/es/alerts/` for the Astro server
- `/es/code-reviews/reviewbot/setup/` correctly rewrites for Hugo
- Vite dev server paths still work (`/@vite/*`, `/@fs/*`, etc.)
- The 404 fallback still works for unknown language-prefixed paths

**Mitigation:** Add a test suite for the Caddyfile generator itself (Node.js unit tests) that validates the generated routing rules against expected inputs.

### 13.3 Hugo's language prefix vs. Caddy's routing prefix

Hugo with `defaultContentLanguageInSubdirectory = false` serves Spanish content at `/es/...`. But Hugo also has the internal `/hugo` path prefix from Caddy's rewrite. The interaction between these two prefix layers needs careful testing:

- Does Hugo serve Spanish content at `/es/hugo/alerts/` or `/hugo/es/alerts/`?
- Does the Caddy rewrite for product docs (`/code-reviews/* → /hugo/code-reviews/*`) interact correctly with the language prefix?

These questions should be answered by setting up a minimal Hugo i18n config and testing with Caddy before full implementation.

### 13.4 Fallback behavior for missing translations

When a Spanish translation doesn't exist for a page, two options:
1. **Show the English version** (Hugo's default behavior via `enableMissingTranslationPlaceholders`)
2. **Show a 404** for the Spanish URL

**Recommendation:** Show the English version with a visible banner: "This page is not yet available in Español. Showing the English version." This is user-friendly and avoids dead links.

### 13.5 Nav YAML: to translate or not?

Product names like "BugHunter Pro", "ReviewBot", "DiffLens" are proper nouns and shouldn't be translated. Generic terms like "Setup", "Home", "Alerts" should be. The `titleKey` approach (Option A in section 5.1) handles this cleanly — product names use the same key across languages:

```yaml
# en
nav_bughunter_pro: "BugHunter Pro"

# es
nav_bughunter_pro: "BugHunter Pro"  # Proper noun, not translated
```

### 13.6 Adding a third language later

The architecture should scale to N languages without structural changes:
1. Add the language to Hugo's `[languages]` config
2. Add the language to Astro's `i18n.locales` array
3. Add a translation file set (`*.fr.yaml`)
4. Copy and translate the content directory
5. Add the language to the Caddyfile generator's language list
6. The Caddyfile, nav rendering, and language switcher all pick it up automatically

---

## Implementation order

If this plan is approved, the recommended implementation sequence:

1. **Shared i18n config and translation files** — set up `shared/i18n/` with language config, UI string translations, and nav translations
2. **Hugo i18n** — configure `hugo.toml`, restructure content into `en/`/`es/` folders, update templates with `i18n` calls
3. **Caddy routing** — update `generate-caddyfile.js` to emit language-prefixed routes, test the rewrites
4. **Astro i18n** — configure `astro.config.mjs`, create `es/` page folder, update Layout with translation helpers
5. **Navigation translation** — update both Hugo and Astro nav rendering to use translated titles and language-prefixed links
6. **Language switcher** — add the UI element to the header in both frameworks
7. **SEO tags** — add `hreflang` alternates
8. **Testing** — Playwright e2e tests for all i18n functionality
9. **Documentation** — update user stories, README

---

## References

- [Hugo Multilingual Mode](https://gohugo.io/content-management/multilingual/) — Hugo's official i18n documentation
- [Astro Internationalization (i18n) Routing](https://docs.astro.build/en/guides/internationalization/) — Astro's official i18n guide
- [Google: Managing Multi-Regional and Multilingual Sites](https://developers.google.com/search/docs/specialty/international) — SEO best practices for `hreflang`
- [W3C: Language Tags](https://www.w3.org/International/articles/language-tags/) — proper `lang` attribute values
