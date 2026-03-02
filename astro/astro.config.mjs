import { defineConfig } from 'astro/config';
import node from '@astrojs/node';
import preact from '@astrojs/preact';
import yaml from '@rollup/plugin-yaml';

export default defineConfig({
  output: 'server',
  base: '/astro',
  adapter: node({
    mode: 'standalone',
  }),
  integrations: [preact()],
  markdown: {
    shikiConfig: {
      theme: 'css-variables',
    },
  },
  vite: {
    plugins: [yaml()],
    server: {
      hmr: {
        clientPort: 3000,
        path: '/_vite_hmr',
      },
    },
  },
});
