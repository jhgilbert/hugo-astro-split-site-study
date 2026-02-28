---
title: "DiffLens — Troubleshooting"
---

# DiffLens — Troubleshooting

Solutions to common issues with DiffLens.

## Semantic highlighting shows no colors

Semantic highlighting requires a language parser for your file type. DiffLens ships with parsers for JavaScript, TypeScript, Python, Go, and Rust. If your language isn't supported, diffs fall back to line-level highlighting. Check supported languages with:

```bash
npx difflens languages
```

## Pre-commit hook doesn't open a browser

The hook uses `open` (macOS), `xdg-open` (Linux), or `start` (Windows) to launch your default browser. In headless environments (CI, SSH sessions), this will fail silently. Set the `--no-browser` flag to print a URL instead:

```bash
npx difflens hook install --pre-commit --no-browser
```

## Diffs are slow on large repositories

DiffLens clones a shallow copy of your base branch for comparison. On repositories with very large histories, this can be slow on the first run. Subsequent runs use a cache. If the first run is too slow, try:

```bash
npx difflens cache warm
```

This pre-builds the cache in the background.

## Config file not detected

DiffLens looks for `difflens.config.json` in the current working directory and up to three parent directories. If your config is elsewhere, pass it explicitly:

```bash
npx difflens diff --config /path/to/difflens.config.json
```
