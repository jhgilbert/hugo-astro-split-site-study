---
title: "ReviewBot — Key Features"
---

# ReviewBot — Key Features

ReviewBot combines static analysis with pattern-based heuristics to catch issues that linters miss.

## Contextual Suggestions

ReviewBot understands the intent behind your changes. If you rename a function, it checks that all call sites were updated. If you add a new API endpoint, it verifies that authentication middleware is applied.

## Style Consistency

Beyond formatting (which your linter handles), ReviewBot checks for higher-level style consistency — naming conventions, error handling patterns, import ordering preferences specific to your codebase. It learns your team's patterns from merged PRs over time.

## Security Scanning

Every review includes a security pass that checks for common vulnerabilities:

- Hardcoded secrets and API keys
- SQL injection and XSS vectors
- Insecure dependency versions
- Overly permissive file permissions

## Review Summaries

For large PRs, ReviewBot generates a structured summary that groups changes by concern (e.g., "database migrations", "API contract changes", "test updates"). Reviewers can use this summary to plan their review order.

## Team Analytics

The ReviewBot dashboard tracks review velocity, common finding categories, and resolution rates. Use these metrics to identify areas where your team could benefit from documentation or training.
