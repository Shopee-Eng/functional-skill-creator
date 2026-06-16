# Contributing Guide

Thanks for helping improve Functional Skill Creator.

## Quick Start

```bash
git clone https://github.com/Shopee-Eng/functional-skill-creator.git
cd functional-skill-creator
npm install
npm run check
```

Then let your agent use the built-in skill:

```text
Use skills/fskill-creator to create a functional skill for <workflow>
Use skills/fskill-creator to migrate <path-to-existing-SKILL.md>
```

## Built-in Script Helpers

```bash
# Create a basic functional skill skeleton
node skills/fskill-creator/scripts/init_skill.mjs skills/<name>

# Validate functional skill structure integrity
node skills/fskill-creator/scripts/lint_skill.mjs skills/<name>

# Run JSON testcase assertions
node skills/fskill-creator/scripts/test_cases.mjs examples/meeting-notes-to-actions

# Generate migration proposal
node skills/fskill-creator/sub-skills/migrate/scripts/migrate_proposal.mjs path/to/SKILL.md
```

## Development

```bash
npm run test:skill-scripts
npm run test:example-scripts
npm run test:cases
npm run lint:examples
npm run lint:skills
npm run check
```

This project has zero third-party runtime dependencies. Everything uses Node.js built-in modules and `node --test`.

## Pull Request Checklist

- Each change should focus on one behavior or one type of documentation improvement.
- Code changes must add or update tests.
- Run `npm run check` before submitting a PR.
- When user-visible behavior changes, update `README.md` or `docs/` accordingly.
- Do not commit generated traces, local logs, credentials, or customer data.

## Design Principles

- Toolkit stays runtime-agnostic.
- Prefer explicit data contracts over hidden conventions.
- Trace and testcase behavior must be auditable.
- Do not introduce model vendor dependencies.
- High-level judgment and orchestration live in `skills/`; deterministic actions are pushed down to the corresponding skill's `scripts/`.

## Release Notes

User-visible changes should be recorded under `Unreleased` in `CHANGELOG.md`.
