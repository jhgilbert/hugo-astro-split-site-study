---
title: "ReviewBot — Setup"
---

ReviewBot is an automated code review assistant that integrates with your Git hosting platform to provide instant feedback on pull requests.

## Prerequisites

- A GitHub, GitLab, or Bitbucket account with admin access to the repository
- Node.js 18 or later (for the local CLI)
- A ReviewBot API key (sign up at reviewbot.dev)

## Installing the GitHub App

1. Visit the ReviewBot GitHub App page and click **Install**.
2. Select the repositories you want ReviewBot to monitor.
3. Authorize with your ReviewBot API key when prompted.

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
