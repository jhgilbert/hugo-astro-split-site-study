Additional operating instructions can be found in [CLAUDE.md](./CLAUDE.md).

# Hugo/Astro split site design

This is a study of how to gracefully combine Hugo and Astro into one site, for the purpose of eventually migrating from Hugo to Astro.

We want to explore all aspects of delivering a good user experience during the migration, such as

- Seamless navigation between sites
- A shared CSS theme between sites

## Astro content rendering

The Astro site should use SSR on Node for all pages for now. Later we might add an SSG section, so don't implement an architecture that would make the addition difficult later.

## Deployment target

This is a local study that will not be deployed anywhere. As long as it works locally, that's all that matters at this stage.

## Repo structure

The site lives in a monorepo, with the Astro site and the Hugo site side by side in top-level folders, and any shared code in a `shared` top-level folder.

## "Legacy" Hugo site

I don't actually have a legacy Hugo site we can use, so we will mock one from scratch. Use Hugo version 0.148.0, installed with `hugo-bin` as a dev dependency.

## Dev experience

If possible, the developer should be able to start and test the entire site with a single `yarn` command.

## Architecture and routing rules

Use a simple reverse proxy like Caddy to combine the Astro and Hugo sites into one domain.

Use a simple shared 404 page to handle bad requests.

## Content

The content is in Markdown, but with component tags in them (such as tabs). In Hugo, components are implemented with shortcodes. In Astro, components are implemented with Preact if they involve client-side interactivity, to keep the bundle size low.

## Site theme

Astro and Hugo should share one theme (CSS tokens and style rules). Components like tabs, syntax-highlighted code blocks, etc., should all visually appear the same to the extent possible. For code blocks, this will likely involve separate CSS for Hugo and Astro that normalize Chroma and Shiki to look as similar as possible.

When this is not possible (for example, due to differences between Astro syntax highlighters and Hugo syntax highlighters), notify me and offer alternative options if there are any, along with the pros and cons of all options.

## Navigation

The nav should be defined in YAML and shared between the two sites. The nav should allow three levels of nested section definition. The only nav entries at the top level should be "Hugo" and "Astro" to make it clear which pages live where in testing. A section at any level can be marked as living in Hugo or Astro. In this case, we would just mark the top sections as living in Hugo and Astro, respectively. Automatically derive the routing rules from this YAML, and generate a Caddy file accordingly. We do not want to manually maintain both a Caddy file and the nav YAML.

When the user navigates between pages (regardless of whether they are navigating between two Astro pages, an Astro and a Hugo page, etc.), use view transitions to make the site nav, header, footer, and any other "shell" elements persistent from the user's point of view. Hugo should opt into the view transitions API however you deem most reasonable.

Astro and Hugo do not share JS, so we cannot use shared JS state between pages to manage the nav state. The nav should use details/summary tags to correctly render each page up front with the nav open to the correct page. If the user has opened any other details sections in the nav that are unrelated to this page, those will be closed due to the page reload.

## Components

For the initial site components, create

- Syntax-highlighted code blocks
- Alerts (info, warning, etc.)
- Tabs
- Collapsible content sections that slide up/down, defaulting to closed but with the option to force the content open on page load
