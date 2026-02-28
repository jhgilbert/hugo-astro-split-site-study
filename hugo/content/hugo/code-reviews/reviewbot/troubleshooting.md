---
title: "ReviewBot — Troubleshooting"
---

Common issues and their resolutions.

{{< alert type="warning" >}}
Before troubleshooting, make sure you're running the latest version of ReviewBot. Many issues are resolved by updating: `npm update -g @reviewbot/cli`.
{{< /alert >}}

## ReviewBot doesn't comment on new PRs

Check that the GitHub App is still installed and has access to the repository. Go to your repository's **Settings > Integrations** and verify ReviewBot is listed. If it was recently reinstalled, you may need to re-authorize with your API key.

Things to verify:

- The App has read/write access to pull requests
- Your API key hasn't been rotated since installation
- The repository is not excluded in your organization's ReviewBot settings
- Webhooks are being delivered (check **Settings > Webhooks** for recent deliveries)

## "Rate limit exceeded" errors

ReviewBot makes API calls to your Git platform to post comments. If you have many PRs opening simultaneously, you may hit platform rate limits. ReviewBot automatically retries with exponential backoff, but comments may be delayed by several minutes during bursts.

{{< tabs id="rate-limits" >}}
  {{< tab label="GitHub" >}}
GitHub allows 5,000 API requests per hour for authenticated apps. ReviewBot uses approximately 10–20 requests per PR review. If you're hitting limits, consider staggering PR creation or upgrading your GitHub plan.
  {{< /tab >}}
  {{< tab label="GitLab" >}}
GitLab's default rate limit is 300 requests per minute. Self-hosted GitLab instances may have different limits configured by your admin.
  {{< /tab >}}
{{< /tabs >}}

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

{{< collapsible title="All suppressible rule categories" id="suppression-rules" >}}
- **xss-vector** — Cross-site scripting patterns
- **sql-injection** — SQL query construction from user input
- **hardcoded-secret** — Strings that match secret/key patterns
- **insecure-dep** — Known vulnerable dependency versions
- **file-permissions** — Overly permissive file access modes
- **open-redirect** — Unvalidated URL redirects
- **path-traversal** — File paths constructed from user input
{{< /collapsible >}}

## CLI review hangs on large diffs

The CLI streams diffs to the ReviewBot API. For very large changesets (over 10,000 lines), processing can take several minutes. If it exceeds five minutes, check your network connection and try again. You can also limit the scope:

```bash
reviewbot review --base main --path src/
```

{{< alert type="error" >}}
Do not interrupt a running review with Ctrl+C during the upload phase. This can leave a partial review in a locked state. If this happens, run `reviewbot unlock` to clear the lock.
{{< /alert >}}
