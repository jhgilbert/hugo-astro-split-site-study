---
title: "DiffLens — Troubleshooting"
---

Solutions to common issues with DiffLens.

## Semantic highlighting shows no colors

Semantic highlighting requires a language parser for your file type. DiffLens ships with parsers for JavaScript, TypeScript, Python, Go, and Rust. If your language isn't supported, diffs fall back to line-level highlighting. Check supported languages with:

```bash
npx difflens languages
```

Currently supported parsers:

- JavaScript / TypeScript (including JSX/TSX)
- Python
- Go
- Rust
- Ruby
- Java

{{< alert type="info" >}}
Community parsers are available for additional languages. Install them with `npx difflens parser add <language>`.
{{< /alert >}}

## Pre-commit hook doesn't open a browser

The hook uses `open` (macOS), `xdg-open` (Linux), or `start` (Windows) to launch your default browser. In headless environments (CI, SSH sessions), this will fail silently. Set the `--no-browser` flag to print a URL instead:

```bash
npx difflens hook install --pre-commit --no-browser
```

{{< tabs id="headless-options" >}}
  {{< tab label="SSH Session" >}}
When connected via SSH, use port forwarding to view diffs locally:

```bash
ssh -L 9900:localhost:9900 your-server
npx difflens diff --port 9900 --no-browser
```

Then open `http://localhost:9900` in your local browser.
  {{< /tab >}}
  {{< tab label="Docker / CI" >}}
In containerized environments, export the diff as a static HTML file instead:

```bash
npx difflens diff --output diff-report.html
```

This generates a self-contained HTML file you can download and view anywhere.
  {{< /tab >}}
{{< /tabs >}}

## Diffs are slow on large repositories

DiffLens clones a shallow copy of your base branch for comparison. On repositories with very large histories, this can be slow on the first run. Subsequent runs use a cache. If the first run is too slow, try:

```bash
npx difflens cache warm
```

This pre-builds the cache in the background.

{{< collapsible title="Performance tuning tips" id="perf-tips" >}}
- **Use ignore patterns** to skip lock files, generated code, and vendor directories
- **Increase maxFileSize cautiously** — files over 1 MB are rarely useful to diff visually
- **Set highlightLevel to "block"** for large repositories to reduce AST parsing time
- **Run `cache warm` in CI** as a setup step so developer machines hit the cache
- **Upgrade to SSD storage** — DiffLens is I/O-intensive during initial cache builds
{{< /collapsible >}}

## Config file not detected

DiffLens looks for `difflens.config.json` in the current working directory and up to three parent directories. If your config is elsewhere, pass it explicitly:

```bash
npx difflens diff --config /path/to/difflens.config.json
```

{{< alert type="error" >}}
Do not place config files inside `node_modules` or other ignored directories — DiffLens will not search those paths.
{{< /alert >}}
