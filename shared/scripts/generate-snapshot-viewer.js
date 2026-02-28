import { readFileSync, writeFileSync, mkdirSync, readdirSync, statSync } from 'node:fs';
import { resolve, dirname, basename, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '../..');
const SNAPSHOTS_DIR = resolve(ROOT, 'astro/tests/__snapshots__');
const OUTPUT_DIR = resolve(ROOT, 'snapshot-viewer');
const THEME_DIR = resolve(ROOT, 'shared/theme');

// Collect all CSS files in order (matching index.css import order)
function collectCSS() {
  const indexCSS = readFileSync(resolve(THEME_DIR, 'index.css'), 'utf8');
  const imports = [...indexCSS.matchAll(/@import\s+['"](.+?)['"]/g)].map(m => m[1]);

  let css = '';
  for (const importPath of imports) {
    const filePath = resolve(THEME_DIR, importPath);
    try {
      css += readFileSync(filePath, 'utf8') + '\n';
    } catch {
      console.warn(`  Warning: could not read ${importPath}`);
    }
  }
  return css;
}

// Recursively find all .html files in the snapshots directory
function findSnapshots(dir) {
  const results = [];
  try {
    const entries = readdirSync(dir);
    for (const entry of entries) {
      const fullPath = resolve(dir, entry);
      const stat = statSync(fullPath);
      if (stat.isDirectory()) {
        results.push(...findSnapshots(fullPath));
      } else if (entry.endsWith('.html')) {
        results.push(fullPath);
      }
    }
  } catch {
    // Directory doesn't exist
  }
  return results;
}

// Generate snapshot viewer
const snapshots = findSnapshots(SNAPSHOTS_DIR);
if (snapshots.length === 0) {
  console.log('No snapshots found. Run `yarn test:unit` first to generate snapshots.');
  process.exit(0);
}

const css = collectCSS();
mkdirSync(OUTPUT_DIR, { recursive: true });

// Collect entries grouped by component
const entries = [];
const groupedByComponent = {};
for (const snapshotPath of snapshots) {
  const relPath = relative(SNAPSHOTS_DIR, snapshotPath);
  const parts = relPath.split('/');
  const component = parts.length > 1 ? parts[0] : 'unknown';
  const name = basename(relPath, '.html');
  const slug = relPath.replace(/\//g, '-').replace('.html', '');
  const html = readFileSync(snapshotPath, 'utf8');

  const entry = { component, name, slug, html };
  entries.push(entry);
  if (!groupedByComponent[component]) {
    groupedByComponent[component] = [];
  }
  groupedByComponent[component].push(entry);
}

// Build the nav HTML
const navHTML = Object.entries(groupedByComponent).map(([component, items]) => `
      <li class="sv-nav__group">
        <span class="sv-nav__group-title">${component}</span>
        <ul class="sv-nav__items">
          ${items.map((s, i) => `<li><a href="#" class="sv-nav__link${i === 0 && component === entries[0].component ? ' sv-nav__link--active' : ''}" data-slug="${s.slug}">${s.name}</a></li>`).join('\n          ')}
        </ul>
      </li>`).join('\n');

// Build the snapshot content sections (hidden by default, first one visible)
const contentHTML = entries.map((s, i) => `
    <div class="sv-content__section${i === 0 ? ' sv-content__section--active' : ''}" data-slug="${s.slug}">
      <h2 class="sv-content__title">${s.component} / ${s.name}</h2>
      <span class="sv-content__label">Light</span>
      <div class="sv-content__frame">${s.html}</div>
      <span class="sv-content__label">Dark</span>
      <div class="sv-content__frame sv-content__frame--dark" data-theme="dark">${s.html}</div>
    </div>`).join('\n');

const page = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Snapshot Viewer</title>
  <style>${css}</style>
  <style>
    /* Snapshot viewer shell — overrides the site layout */
    body { margin: 0; display: flex; height: 100vh; overflow: hidden; }

    .sv-sidebar {
      width: 220px;
      flex-shrink: 0;
      border-right: 1px solid var(--color-border);
      background: var(--color-bg-subtle);
      overflow-y: auto;
      padding: 1rem 0;
      font-family: var(--font-family-base);
      font-size: var(--font-size-sm);
    }
    .sv-sidebar__header {
      padding: 0 1rem 0.75rem;
      font-weight: var(--font-weight-semibold);
      font-size: var(--font-size-base);
      border-bottom: 1px solid var(--color-border);
      margin-bottom: 0.75rem;
    }
    .sv-sidebar__actions {
      padding: 0 1rem;
      margin-bottom: 0.75rem;
      display: flex;
      gap: 0.25rem;
    }
    .sv-sidebar__actions button {
      flex: 1;
      padding: 0.25rem 0.5rem;
      border: 1px solid var(--color-border);
      border-radius: var(--radius-sm);
      background: var(--color-bg);
      cursor: pointer;
      font-size: var(--font-size-xs);
      font-family: var(--font-family-base);
      color: var(--color-text);
    }
    .sv-sidebar__actions button:hover { background: var(--color-gray-100); }

    .sv-nav__group { list-style: none; margin-bottom: 0.5rem; }
    .sv-nav__group-title {
      display: block;
      padding: 0.25rem 1rem;
      font-weight: var(--font-weight-medium);
      color: var(--color-text-muted);
      font-size: var(--font-size-xs);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .sv-nav__items { list-style: none; padding: 0; }
    .sv-nav__link {
      display: block;
      padding: 0.25rem 1rem 0.25rem 1.5rem;
      color: var(--color-text);
      text-decoration: none;
      border-left: 2px solid transparent;
    }
    .sv-nav__link:hover { background: var(--color-gray-100); }
    .sv-nav__link--active {
      color: var(--color-primary);
      border-left-color: var(--color-primary);
      background: var(--color-primary-light);
      font-weight: var(--font-weight-medium);
    }

    .sv-main {
      flex: 1;
      overflow-y: auto;
      padding: 2rem;
    }
    .sv-content__section { display: none; }
    .sv-content__section--active { display: block; }
    .sv-content__title {
      font-family: var(--font-family-base);
      font-size: var(--font-size-xl);
      font-weight: var(--font-weight-semibold);
      margin-bottom: 1.5rem;
    }
    .sv-content__label {
      display: block;
      margin-bottom: 0.5rem;
      font-family: var(--font-family-mono);
      font-size: var(--font-size-xs);
      color: var(--color-text-muted);
    }
    .sv-content__frame {
      border: 1px dashed var(--color-border);
      border-radius: var(--radius-md);
      padding: 1.5rem;
      margin-bottom: 2rem;
    }
    .sv-content__frame--dark {
      background: var(--color-bg);
      color: var(--color-text);
    }
  </style>
</head>
<body>
  <aside class="sv-sidebar">
    <div class="sv-sidebar__header">Snapshots</div>
    <div class="sv-sidebar__actions">
      <button onclick="document.documentElement.removeAttribute('data-theme')">Light</button>
      <button onclick="document.documentElement.setAttribute('data-theme','dark')">Dark</button>
    </div>
    <ul>
      ${navHTML}
    </ul>
  </aside>
  <main class="sv-main">
    ${contentHTML}
  </main>
  <script>
    document.querySelector('.sv-sidebar').addEventListener('click', function(e) {
      var link = e.target.closest('.sv-nav__link');
      if (!link) return;
      e.preventDefault();
      var slug = link.dataset.slug;

      document.querySelectorAll('.sv-nav__link--active').forEach(function(el) {
        el.classList.remove('sv-nav__link--active');
      });
      link.classList.add('sv-nav__link--active');

      document.querySelectorAll('.sv-content__section--active').forEach(function(el) {
        el.classList.remove('sv-content__section--active');
      });
      var section = document.querySelector('.sv-content__section[data-slug="' + slug + '"]');
      if (section) section.classList.add('sv-content__section--active');
    });
  </script>
</body>
</html>`;

writeFileSync(resolve(OUTPUT_DIR, 'index.html'), page);

console.log(`Generated snapshot viewer in ${OUTPUT_DIR}/`);
console.log(`  ${entries.length} snapshots across ${Object.keys(groupedByComponent).length} components`);
