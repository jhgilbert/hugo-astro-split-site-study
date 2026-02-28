---
layout: ../../../layouts/Layout.astro
title: "BugHunter Pro — Setup"
---

# BugHunter Pro — Setup

Get BugHunter Pro running in your project in a few minutes.

## Prerequisites

- Node.js 18 or later
- A supported package manager (npm, yarn, or pnpm)
- A BugHunter Pro license key (available from your team admin)

## Installation

Install the CLI globally:

```bash
npm install -g @bughunter/cli
```

Then initialize it in your project root:

```bash
bughunter init --key YOUR_LICENSE_KEY
```

This creates a `.bughunterrc` configuration file with sensible defaults.

## IDE Integration

BugHunter Pro ships with extensions for VS Code and JetBrains IDEs. Install the extension from your IDE's marketplace, then restart. The extension automatically picks up the `.bughunterrc` file from your workspace root.

## Verifying the Installation

Run the built-in diagnostic command to confirm everything is wired up:

```bash
bughunter doctor
```

You should see green checkmarks for license, runtime, and project configuration.
