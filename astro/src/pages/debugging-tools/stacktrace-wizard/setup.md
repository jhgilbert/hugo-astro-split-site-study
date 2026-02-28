---
layout: ../../../layouts/Layout.astro
title: "StackTrace Wizard — Setup"
---

# StackTrace Wizard — Setup

StackTrace Wizard parses, deobfuscates, and visualizes stack traces from any JavaScript or TypeScript runtime.

## Installation

Add it as a dev dependency:

```bash
yarn add -D @stacktrace-wizard/core
```

## Source Map Configuration

For deobfuscation to work, StackTrace Wizard needs access to your source maps. Point it to your build output:

```json
{
  "sourceMaps": {
    "dir": "./dist",
    "include": ["**/*.map"]
  }
}
```

## CI Integration

StackTrace Wizard can run as a post-test step to automatically annotate any failing test output with enriched stack traces. Add the reporter to your test runner config:

```ts
// vitest.config.ts
reporters: ['default', '@stacktrace-wizard/vitest-reporter']
```

## Web Dashboard

Start the local dashboard to paste and analyze stack traces interactively:

```bash
npx stacktrace-wizard serve
```

The dashboard opens at `http://localhost:9800` and provides a searchable history of every trace you've analyzed.
