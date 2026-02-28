---
title: "ReviewBot — Troubleshooting"
---

Common issues and their resolutions.

## ReviewBot doesn't comment on new PRs

Check that the GitHub App is still installed and has access to the repository. Go to your repository's **Settings > Integrations** and verify ReviewBot is listed. If it was recently reinstalled, you may need to re-authorize with your API key.

## "Rate limit exceeded" errors

ReviewBot makes API calls to your Git platform to post comments. If you have many PRs opening simultaneously, you may hit platform rate limits. ReviewBot automatically retries with exponential backoff, but comments may be delayed by several minutes during bursts.

## False positives on security findings

If ReviewBot flags code that is intentionally handling raw input (e.g., a sanitization library), add an inline suppression:

```javascript
// reviewbot-ignore: xss-vector
const sanitized = processRawHTML(input);
```

You can also suppress entire categories in `.reviewbotrc.json`:

```json
{
  "suppressions": ["xss-vector"]
}
```

## CLI review hangs on large diffs

The CLI streams diffs to the ReviewBot API. For very large changesets (over 10,000 lines), processing can take several minutes. If it exceeds five minutes, check your network connection and try again. You can also limit the scope:

```bash
reviewbot review --base main --path src/
```
