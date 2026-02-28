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

// Extract unique top-level path segments for routing, tracking which need rewrites
const PLATFORM_PORT = { hugo: 1313, astro: 4321 };
const PLATFORM_PREFIX = { hugo: '/hugo', astro: '/astro' };

const routeMap = new Map(); // topPath → { platform, needsRewrite }

for (const [platform, platformPaths] of Object.entries(paths)) {
  for (const p of platformPaths) {
    const topPath = '/' + p.split('/').filter(Boolean)[0];
    if (routeMap.has(topPath)) continue;
    const needsRewrite = !p.startsWith(PLATFORM_PREFIX[platform]);
    routeMap.set(topPath, { platform, needsRewrite });
  }
}

// Generate Caddyfile.
// Routes whose public path differs from the backend path (e.g.
// /debugging-tools/* is served by Astro at /astro/debugging-tools/*) use
// rewrite inside their handle block to prepend the platform prefix before
// proxying.  Direct platform routes (/hugo/*, /astro/*) proxy as-is.
let caddyfile = `# Auto-generated Caddyfile — do not edit manually.
# Regenerate with: yarn generate:caddy

:3000 {
\tredir / /astro/ permanent
`;

for (const [topPath, { platform, needsRewrite }] of routeMap) {
  const port = PLATFORM_PORT[platform];
  if (needsRewrite) {
    const prefix = PLATFORM_PREFIX[platform];
    caddyfile += `\thandle ${topPath}* {
\t\trewrite * ${prefix}{uri}
\t\treverse_proxy localhost:${port}
\t}
`;
  } else {
    caddyfile += `\thandle ${topPath}* {
\t\treverse_proxy localhost:${port}
\t}
`;
  }
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
for (const [topPath, { platform, needsRewrite }] of routeMap) {
  const rewriteNote = needsRewrite ? ` (rewrite → ${PLATFORM_PREFIX[platform]})` : '';
  console.log(`  ${topPath} → ${platform}${rewriteNote}`);
}
