---
title: "DiffLens — Configuration"
---

# DiffLens — Configuration

DiffLens is configured through `difflens.config.json` in your project root.

## Base Branch

The branch DiffLens compares against when generating diffs. Defaults to `main`:

```json
{
  "baseBranch": "main"
}
```

## Semantic Highlighting

DiffLens goes beyond line-level diffs by parsing your code's AST. You can control the granularity:

- `"token"` — highlights individual changed tokens (most detailed)
- `"statement"` — highlights changed statements (default)
- `"block"` — highlights changed blocks/functions (least noisy)

```json
{
  "highlightLevel": "statement"
}
```

## Ignore Patterns

Exclude files that produce noisy diffs (lock files, generated code, etc.):

```json
{
  "ignore": [
    "yarn.lock",
    "**/*.generated.ts",
    "dist/**"
  ]
}
```

## Theme

DiffLens supports light and dark themes for the visual diff viewer. Set it to match your preference, or use `"system"` to follow OS settings:

```json
{
  "theme": "system"
}
```

## Max File Size

Files larger than this limit (in bytes) are skipped to keep diffs fast:

```json
{
  "maxFileSize": 500000
}
```
