import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import yaml from 'js-yaml';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '../..');
const NAV_PATH = resolve(__dirname, '../nav.yaml');
const CADDY_PATH = resolve(ROOT, 'Caddyfile');

const navData = yaml.load(readFileSync(NAV_PATH, 'utf8'));

function collectPaths(nodes, inheritedPlatform = null) {
  const paths = { hugo: [], astro: [] };

  for (const node of nodes) {
    const platform = node.platform || inheritedPlatform;

    if (platform && node.path) {
      paths[platform].push(node.path);
    }

    if (node.children) {
      const childPaths = collectPaths(node.children, platform);
      paths.hugo.push(...childPaths.hugo);
      paths.astro.push(...childPaths.astro);
    }
  }

  return paths;
}

const paths = collectPaths(navData.nav);

// Extract unique top-level path segments for routing
const hugoTopPaths = [...new Set(
  paths.hugo.map(p => '/' + p.split('/').filter(Boolean)[0])
)];
const astroTopPaths = [...new Set(
  paths.astro.map(p => '/' + p.split('/').filter(Boolean)[0])
)];

// Use handle (not handle_path) to preserve the full path when proxying.
// Hugo serves content at /hugo/*, Astro serves at /astro/*.
let caddyfile = `# Auto-generated Caddyfile — do not edit manually.
# Regenerate with: yarn generate:caddy

:3000 {
`;

for (const prefix of hugoTopPaths) {
  caddyfile += `\thandle ${prefix}* {
\t\treverse_proxy localhost:1313
\t}
`;
}

for (const prefix of astroTopPaths) {
  caddyfile += `\thandle ${prefix}* {
\t\treverse_proxy localhost:4321
\t}
`;
}

// Proxy Vite dev server paths to Astro (needed for client-side hydration in dev)
caddyfile += `\thandle /@id/* {
\t\treverse_proxy localhost:4321
\t}
\thandle /@vite/* {
\t\treverse_proxy localhost:4321
\t}
\thandle /@fs/* {
\t\treverse_proxy localhost:4321
\t}
\thandle /node_modules/* {
\t\treverse_proxy localhost:4321
\t}
\thandle /src/* {
\t\treverse_proxy localhost:4321
\t}
`;

const sharedDir = resolve(ROOT, 'shared');
caddyfile += `\thandle {
\t\troot * ${sharedDir}
\t\trewrite * /404.html
\t\tfile_server
\t}
}
`;

writeFileSync(CADDY_PATH, caddyfile);
console.log(`Generated ${CADDY_PATH}`);
console.log(`  Hugo paths: ${hugoTopPaths.join(', ')}`);
console.log(`  Astro paths: ${astroTopPaths.join(', ')}`);
