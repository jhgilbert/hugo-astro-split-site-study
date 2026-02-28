---
layout: ../../../layouts/Layout.astro
title: "StackTrace Wizard — Troubleshooting"
---

# StackTrace Wizard — Troubleshooting

Solutions to frequently encountered issues.

## Source maps not found

If deobfuscation returns the original minified frames, double-check that your source maps are in the configured directory and that file names match (including hashes). Run `stacktrace-wizard validate` to get a diagnostic report on source map coverage.

## Trace parsing fails for non-V8 runtimes

By default, StackTrace Wizard expects V8-style traces. For other runtimes (SpiderMonkey, JavaScriptCore), set the `runtime` option:

```json
{
  "runtime": "spidermonkey"
}
```

## Dashboard won't start

The dashboard binds to port 9800. If that port is in use, specify an alternative:

```bash
npx stacktrace-wizard serve --port 9801
```

Also ensure no firewall rules are blocking localhost connections on the chosen port.
