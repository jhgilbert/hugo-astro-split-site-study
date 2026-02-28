---
layout: ../../../layouts/Layout.astro
title: "MemoryGuard — Configuration"
---

# MemoryGuard — Configuration

MemoryGuard is configured through the options object passed to `startMemoryGuard()` or via a `memoryguard.config.json` file in your project root.

## Sample Interval

Controls how often heap snapshots are taken. Lower values give more granularity but increase overhead.

```json
"sampleInterval": 5000
```

## Heap Limit

When heap usage exceeds this threshold, MemoryGuard emits a warning event and writes an immediate snapshot. Accepts values like `"256mb"`, `"1gb"`, or a raw byte count.

```json
"heapLimit": "512mb"
```

## Retention Tracking

By default, MemoryGuard tracks the top 50 retained object types. Increase this if you need deeper analysis:

```json
"retentionDepth": 100
```

## Alerts

MemoryGuard can send alerts when thresholds are crossed. Supported channels:

- **Console** — prints a warning to stderr (default)
- **Webhook** — POSTs a JSON payload to a URL you configure
- **File** — appends to a log file

```json
{
  "alerts": {
    "channels": ["console", "webhook"],
    "webhookUrl": "https://hooks.example.com/memoryguard"
  }
}
```

## Excluding Modules

If certain modules produce noise (e.g., large caches you manage yourself), exclude them from tracking:

```json
{
  "exclude": ["node_modules/some-cache-lib/**"]
}
```
