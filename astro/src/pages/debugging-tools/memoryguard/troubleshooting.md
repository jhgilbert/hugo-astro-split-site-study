---
layout: ../../../layouts/Layout.astro
title: "MemoryGuard — Troubleshooting"
---

# MemoryGuard — Troubleshooting

Common problems and their solutions.

## Agent fails to start with "Worker not supported"

MemoryGuard requires Node.js 18+ for worker thread support. Check your version with `node -v`. If you're running an older version in CI, update your CI image or use a version manager like `nvm`.

## Reports directory grows too large

By default, MemoryGuard retains the last 100 reports. Lower this with:

```json
"maxReports": 20
```

You can also add `.memoryguard/` to your `.gitignore` to keep reports out of version control.

## False positive leak warnings

Some patterns — like growing caches or connection pools that haven't reached steady state — can trigger false warnings during startup. Set a warm-up period to delay monitoring:

```json
"warmupPeriod": 30000
```

## Viewer shows empty timeline

This usually means the report file is from an incompatible version. Re-run your application with the latest agent to regenerate reports, or update the viewer: `npx memoryguard@latest view`.
