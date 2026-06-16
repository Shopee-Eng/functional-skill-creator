# Security Policy

## Supported Versions

| Version | Supported |
| ------- | --------- |
| 0.1.x   | Yes       |

## Reporting a Vulnerability

If you discover a security vulnerability, please report it responsibly.

**Do not** open a public GitHub issue for security-sensitive findings.

Instead, use one of these channels:

1. **GitHub Security Advisories** (preferred): open a [private vulnerability report](https://github.com/Shopee-Eng/functional-skill-creator/security/advisories/new) on this repository.
2. **Email**: contact the repository maintainers through your organization's security contact if you already have an established channel.

Please include:

- A description of the issue and potential impact
- Steps to reproduce, if applicable
- Affected files, scripts, or documentation paths

We aim to acknowledge reports within **5 business days** and will work with you on validation and remediation.

## What Not to Commit

This project generates local trace logs under `logs/runs/` that may contain user input or project output. Never commit:

- Generated JSONL traces
- Local log files
- Credentials, API keys, or tokens
- Customer or internal business data

The built-in report runtime redacts common sensitive fields by default, but you should still treat traces as potentially sensitive and keep them local.

## Scope

This policy covers the repository's documentation, scripts, templates, and example skills. It does not cover third-party agent platforms, model providers, or observability backends you configure separately (for example, when using `report_mode=remote`).
