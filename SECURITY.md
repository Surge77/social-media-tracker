# Security Policy

## Supported Versions

This project is currently maintained on the default branch only. Security fixes are applied to the latest codebase rather than backported to older snapshots or local forks.

| Version | Supported |
| --- | --- |
| `main` / latest | Yes |
| Older commits, forks, and stale deployments | No |

## Reporting a Vulnerability

Do not open a public issue, discussion, or pull request for a suspected security problem.

Use one of these private paths instead:

1. GitHub private vulnerability reporting for this repository, if it is enabled.
2. Private contact through the repository owner account linked from the project README: `https://github.com/Surge77`.

Include enough detail to reproduce and assess the issue:

- A short summary of the problem and why it matters
- The affected route, page, script, dependency, or environment
- Reproduction steps or a proof of concept
- Expected impact
- Any suggested mitigation or fix, if you have one

An initial acknowledgment target is within 5 business days. After triage, the maintainer can decide whether the report is valid, how severe it is, and when a fix can be released.

## Handling Secrets

This repository uses environment variables and external provider credentials. Treat the following as sensitive:

- `SUPABASE_SERVICE_ROLE_KEY`
- `ADMIN_API_SECRET`
- `CRON_SECRET`
- API provider keys in `.env.local`
- Files such as `API_keys.txt`, `*.secret`, and `*.key`

Rules for contributors:

- Never commit real secrets, tokens, private keys, or populated local env files.
- Keep server-only secrets out of client code and browser-exposed variables.
- If a credential is exposed, rotate it immediately and remove it from the codebase and deployment settings.
- Use `.env.example` as the public template for required configuration.

## Scope

Security reports are especially useful for issues involving:

- Authentication or authorization bypass
- Exposed secrets or unsafe secret handling
- Supabase access control or data exposure
- Admin or cron route protection
- Dependency vulnerabilities with a practical impact
- Remote code execution, SSRF, injection, or stored XSS

General bugs, data quality problems, UI defects, and feature requests should go through the normal issue or pull request workflow.
