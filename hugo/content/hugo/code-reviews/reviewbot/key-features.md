---
title: "ReviewBot — Key Features"
---

ReviewBot combines static analysis with pattern-based heuristics to catch issues that linters miss.

## Contextual Suggestions

ReviewBot understands the intent behind your changes. If you rename a function, it checks that all call sites were updated. If you add a new API endpoint, it verifies that authentication middleware is applied.

## Style Consistency

Beyond formatting (which your linter handles), ReviewBot checks for higher-level style consistency — naming conventions, error handling patterns, import ordering preferences specific to your codebase. It learns your team's patterns from merged PRs over time.

{{< alert type="success" >}}
ReviewBot's style learning engine improves accuracy over time. After 50 merged PRs, most teams see a 40% reduction in false positives.
{{< /alert >}}

## Security Scanning

Every review includes a security pass that checks for common vulnerabilities:

- Hardcoded secrets and API keys
- SQL injection and XSS vectors
- Insecure dependency versions
- Overly permissive file permissions

{{< tabs id="security-examples" >}}
  {{< tab label="Secrets Detection" >}}
ReviewBot scans for patterns that look like API keys, tokens, and passwords. It recognizes formats for AWS, Stripe, GitHub, and 30+ other providers.

```javascript
// ReviewBot will flag this line
const API_KEY = "sk_live_abc123def456";
```
  {{< /tab >}}
  {{< tab label="Injection Prevention" >}}
SQL queries built with string concatenation are flagged with a suggested parameterized alternative.

```javascript
// Flagged: possible SQL injection
const query = `SELECT * FROM users WHERE id = ${userId}`;

// Suggested fix
const query = `SELECT * FROM users WHERE id = $1`;
```
  {{< /tab >}}
{{< /tabs >}}

## Review Summaries

For large PRs, ReviewBot generates a structured summary that groups changes by concern (e.g., "database migrations", "API contract changes", "test updates"). Reviewers can use this summary to plan their review order.

{{< collapsible title="Example review summary output" id="summary-example" >}}
**PR #482: Add user preferences API**

| Area | Files Changed | Risk |
|------|--------------|------|
| Database migrations | 2 | Medium |
| API endpoints | 3 | Low |
| Test updates | 4 | Low |
| Type definitions | 1 | Low |

**Key observations:**
- New `preferences` table adds a foreign key to `users` — migration is reversible.
- All new endpoints include auth middleware.
- Test coverage for new code: 94%.
{{< /collapsible >}}

## Team Analytics

The ReviewBot dashboard tracks review velocity, common finding categories, and resolution rates. Use these metrics to identify areas where your team could benefit from documentation or training.
