---
title: "DiffLens — Configuration"
---

DiffLens is configured through `difflens.config.json` in your project root.

{{< alert type="info" >}}
Run `npx difflens validate` to check your configuration for errors and deprecated options.
{{< /alert >}}

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

{{< tabs id="highlight-comparison" >}}
  {{< tab label="Token Level" >}}
Token-level highlighting is ideal for reviewing small, precise changes like renamed variables or updated constants. Each changed token gets its own highlight.

Best for: small PRs, variable renames, constant updates.
  {{< /tab >}}
  {{< tab label="Statement Level" >}}
Statement-level highlighting groups related token changes into a single highlighted region at the statement boundary. This is the default and works well for most reviews.

Best for: general-purpose code review, moderate-sized PRs.
  {{< /tab >}}
  {{< tab label="Block Level" >}}
Block-level highlighting marks entire functions or blocks that contain changes. This reduces visual noise in large diffs where many small changes occur within the same function.

Best for: large refactors, bulk changes, reviewing unfamiliar codebases.
  {{< /tab >}}
{{< /tabs >}}

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

{{< collapsible title="Custom theme colors" id="custom-theme" >}}
You can override individual colors in your config:

```json
{
  "theme": "custom",
  "colors": {
    "added": "#d4edda",
    "removed": "#f8d7da",
    "modified": "#fff3cd",
    "background": "#ffffff",
    "text": "#212529"
  }
}
```

All color values accept any valid CSS color string (hex, rgb, hsl).
{{< /collapsible >}}

## Max File Size

Files larger than this limit (in bytes) are skipped to keep diffs fast:

```json
{
  "maxFileSize": 500000
}
```

{{< alert type="warning" >}}
Setting `maxFileSize` too high can cause the viewer to lag on machines with limited memory. The default of 500 KB works well for most projects.
{{< /alert >}}
