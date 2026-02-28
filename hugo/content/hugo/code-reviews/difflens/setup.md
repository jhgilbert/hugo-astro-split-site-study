---
title: "DiffLens — Setup"
---

DiffLens is a visual diff and code review tool that renders side-by-side comparisons with semantic highlighting — showing you *what changed* and *why it matters*.

{{< alert type="info" >}}
DiffLens works best with projects that have source maps enabled. Without them, semantic highlighting falls back to line-level diffs.
{{< /alert >}}

## Installation

{{< tabs id="install-method" >}}
  {{< tab label="Yarn" >}}
```bash
yarn add -D @difflens/cli
```
  {{< /tab >}}
  {{< tab label="npm" >}}
```bash
npm install -D @difflens/cli
```
  {{< /tab >}}
  {{< tab label="pnpm" >}}
```bash
pnpm add -D @difflens/cli
```
  {{< /tab >}}
{{< /tabs >}}

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

{{< collapsible title="Supported git hooks" id="git-hooks" >}}
DiffLens supports the following git hooks:

- **pre-commit** — Shows a visual diff of staged changes before committing
- **pre-push** — Shows all commits that will be pushed, with a combined diff view
- **post-merge** — Shows what changed after pulling or merging a branch
- **post-checkout** — Shows what differs between the previous and current branch

Install any hook with `npx difflens hook install --<hook-name>`.
{{< /collapsible >}}

## Editor Extension

DiffLens offers extensions for VS Code and Neovim. After installing, you can trigger a visual diff for the current file with the command palette: **DiffLens: Show Diff Against Base Branch**.

Key extension features:

- Inline gutter decorations showing changed lines
- Side-by-side split view within the editor
- One-click navigation to the next changed block
- Integration with your editor's source control panel
