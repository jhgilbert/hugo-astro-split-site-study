---
title: "DiffLens — Setup"
---

DiffLens is a visual diff and code review tool that renders side-by-side comparisons with semantic highlighting — showing you *what changed* and *why it matters*.

## Installation

Install DiffLens as a dev dependency:

```bash
yarn add -D @difflens/cli
```

## Initializing a Project

Run the init command to create a configuration file:

```bash
npx difflens init
```

This generates a `difflens.config.json` with defaults appropriate for your project's detected language and framework.

## Git Hook Integration

DiffLens can run automatically before each commit to show you a visual summary of your staged changes:

```bash
npx difflens hook install --pre-commit
```

The hook opens a browser tab with the rendered diff. Close the tab or press `q` in the terminal to proceed with the commit.

## Editor Extension

DiffLens offers extensions for VS Code and Neovim. After installing, you can trigger a visual diff for the current file with the command palette: **DiffLens: Show Diff Against Base Branch**.
