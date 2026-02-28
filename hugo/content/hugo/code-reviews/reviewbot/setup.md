---
title: "ReviewBot — Setup"
---

ReviewBot is an automated code review assistant that integrates with your Git hosting platform to provide instant feedback on pull requests.

{{< alert type="info" >}}
ReviewBot requires admin access to install the GitHub/GitLab App. If you don't have admin access, ask a repository owner to install it for you.
{{< /alert >}}

## Prerequisites

- A GitHub, GitLab, or Bitbucket account with admin access to the repository
- Node.js 18 or later (for the local CLI)
- A ReviewBot API key (sign up at reviewbot.dev)

## Installing the GitHub App

{{< tabs id="platform-install" >}}
  {{< tab label="GitHub" >}}
1. Visit the ReviewBot GitHub App page and click **Install**.
2. Select the repositories you want ReviewBot to monitor.
3. Authorize with your ReviewBot API key when prompted.
  {{< /tab >}}
  {{< tab label="GitLab" >}}
1. Navigate to **Settings > Integrations** in your GitLab project.
2. Search for ReviewBot and click **Configure**.
3. Paste your API key and select the target branches.
  {{< /tab >}}
  {{< tab label="Bitbucket" >}}
1. Go to **Repository settings > Apps** in Bitbucket.
2. Find ReviewBot in the marketplace and click **Install**.
3. Grant repository read/write permissions when prompted.
  {{< /tab >}}
{{< /tabs >}}

ReviewBot will begin reviewing new pull requests automatically within a few minutes.

## Local CLI

For pre-push reviews, install the CLI:

```bash
npm install -g @reviewbot/cli
reviewbot auth --key YOUR_API_KEY
```

Run a local review on your current branch:

```bash
reviewbot review --base main
```

This prints findings to your terminal without creating comments on the remote.

## Configuration File

Create a `.reviewbotrc.json` in your repository root to customize behavior:

```json
{
  "language": "auto",
  "severity": "warning",
  "ignore": ["docs/**", "*.test.ts"]
}
```

{{< collapsible title="Full list of configuration options" id="config-options" >}}
- **language** — Language for analysis rules. Use `"auto"` to detect from file extensions.
- **severity** — Minimum severity level to report: `"info"`, `"warning"`, or `"error"`.
- **ignore** — Glob patterns for files to skip during review.
- **maxComments** — Maximum number of inline comments per PR (default: 25).
- **suppressions** — Array of rule IDs to suppress globally.
- **teamId** — Your team identifier for analytics aggregation.
{{< /collapsible >}}
