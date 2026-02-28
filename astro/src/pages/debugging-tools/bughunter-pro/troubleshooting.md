---
layout: ../../../layouts/Layout.astro
title: "BugHunter Pro — Troubleshooting"
---

# BugHunter Pro — Troubleshooting

Common issues and how to resolve them.

## "License expired" error on startup

Your license key is validated against the BugHunter license server on first run each day. If your system clock is skewed or the server is unreachable, you may see a false expiration error. Check your clock with `date` and verify network connectivity to `license.bughunter.dev`.

## IDE extension not detecting .bughunterrc

The extension searches the workspace root and up to two parent directories. If your config file is outside that range, set the path explicitly in the extension settings under **BugHunter > Config Path**.

## High CPU usage during anomaly detection

Anomaly detection instruments every variable assignment. In very hot loops (millions of iterations), this can cause noticeable overhead. You can scope detection to specific files or functions in your `.bughunterrc`:

```json
{
  "anomalyDetection": {
    "include": ["src/services/**"]
  }
}
```

## Session replay files are too large

By default, sessions capture full snapshots every 500 mutations. Lower the frequency with `"snapshotInterval": 2000` in your config to reduce file size at the cost of replay granularity.
