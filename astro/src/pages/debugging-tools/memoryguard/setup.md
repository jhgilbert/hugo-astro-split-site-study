---
layout: ../../../layouts/Layout.astro
title: "MemoryGuard — Setup"
---

# MemoryGuard — Setup

MemoryGuard monitors heap usage in Node.js applications and alerts you to potential memory leaks in real time.

## Installation

```bash
yarn add -D @memoryguard/agent
```

## Adding the Agent

Import and start the agent at the top of your application entry point:

```ts
import { startMemoryGuard } from '@memoryguard/agent';

startMemoryGuard({
  sampleInterval: 5000,  // milliseconds
  heapLimit: '512mb',
});
```

The agent runs in a worker thread and has negligible impact on event loop latency.

## Viewing Reports

MemoryGuard writes periodic reports to `.memoryguard/reports/`. Open any report in the companion viewer:

```bash
npx memoryguard view .memoryguard/reports/latest.json
```

The viewer shows a timeline of heap snapshots with object-level retention breakdowns.
