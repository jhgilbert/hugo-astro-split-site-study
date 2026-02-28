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

// Generate individual snapshot pages
const entries = [];
for (const snapshotPath of snapshots) {
  const relPath = relative(SNAPSHOTS_DIR, snapshotPath);
  const parts = relPath.split('/');
  const component = parts.length > 1 ? parts[0] : 'unknown';
  const name = basename(relPath, '.html');
  const slug = relPath.replace(/\//g, '-').replace('.html', '');
  const html = readFileSync(snapshotPath, 'utf8');

  entries.push({ component, name, slug, relPath });

  const page = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${component} / ${name} — Snapshot Viewer</title>
  <style>${css}</style>
  <style>
    .snapshot-viewer__controls {
      position: fixed; top: 0; left: 0; right: 0;
      display: flex; gap: 1rem; align-items: center;
      padding: 0.75rem 1.5rem;
      background: var(--color-bg);
      border-bottom: 1px solid var(--color-border);
      z-index: 100;
      font-family: var(--font-family-base);
      font-size: var(--font-size-sm);
    }
    .snapshot-viewer__controls a { color: var(--color-primary); text-decoration: none; }
    .snapshot-viewer__controls a:hover { text-decoration: underline; }
    .snapshot-viewer__controls button {
      padding: 0.25rem 0.75rem;
      border: 1px solid var(--color-border);
      border-radius: var(--radius-sm);
      background: var(--color-bg-subtle);
      cursor: pointer;
      font-size: var(--font-size-sm);
    }
    .snapshot-viewer__render {
      margin-top: 4rem;
      padding: 2rem;
    }
    .snapshot-viewer__label {
      display: block;
      margin-bottom: 0.5rem;
      font-family: var(--font-family-mono);
      font-size: var(--font-size-xs);
      color: var(--color-text-muted);
    }
    .snapshot-viewer__frame {
      border: 1px dashed var(--color-border);
      border-radius: var(--radius-md);
      padding: 1.5rem;
      margin-bottom: 2rem;
    }
  </style>
</head>
<body>
  <div class="snapshot-viewer__controls">
    <a href="index.html">← Back to index</a>
    <strong>${component} / ${name}</strong>
    <button onclick="document.documentElement.removeAttribute('data-theme')">Light</button>
    <button onclick="document.documentElement.setAttribute('data-theme','dark')">Dark</button>
  </div>
  <div class="snapshot-viewer__render">
    <span class="snapshot-viewer__label">Light mode</span>
    <div class="snapshot-viewer__frame">${html}</div>

    <span class="snapshot-viewer__label">Dark mode</span>
    <div class="snapshot-viewer__frame" data-theme="dark" style="background: var(--color-bg); color: var(--color-text); padding: 1.5rem; border-radius: var(--radius-md);">${html}</div>
  </div>
</body>
</html>`;

  writeFileSync(resolve(OUTPUT_DIR, `${slug}.html`), page);
}

// Generate index page
const groupedByComponent = {};
for (const entry of entries) {
  if (!groupedByComponent[entry.component]) {
    groupedByComponent[entry.component] = [];
  }
  groupedByComponent[entry.component].push(entry);
}

const indexPage = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Snapshot Viewer</title>
  <style>
    :root {
      --color-primary: #2563eb;
      --font-family-base: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: var(--font-family-base);
      max-width: 640px;
      margin: 0 auto;
      padding: 2rem;
      color: #111827;
    }
    h1 { font-size: 1.5rem; margin-bottom: 0.5rem; }
    p { color: #6b7280; margin-bottom: 2rem; line-height: 1.5; }
    h2 { font-size: 1.125rem; margin: 1.5rem 0 0.5rem; color: #374151; }
    ul { list-style: none; }
    li { margin-bottom: 0.25rem; }
    a { color: var(--color-primary); text-decoration: none; }
    a:hover { text-decoration: underline; }
  </style>
</head>
<body>
  <h1>Snapshot Viewer</h1>
  <p>Visual preview of Vitest component snapshots rendered with the site's shared theme.</p>
  ${Object.entries(groupedByComponent).map(([component, snapshots]) => `
  <h2>${component}</h2>
  <ul>
    ${snapshots.map(s => `<li><a href="${s.slug}.html">${s.name}</a></li>`).join('\n    ')}
  </ul>`).join('\n')}
</body>
</html>`;

writeFileSync(resolve(OUTPUT_DIR, 'index.html'), indexPage);

console.log(`Generated snapshot viewer in ${OUTPUT_DIR}/`);
console.log(`  ${entries.length} snapshots across ${Object.keys(groupedByComponent).length} components`);
