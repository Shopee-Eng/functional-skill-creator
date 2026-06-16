# Changelog

This file records notable project changes.

Format follows Keep a Changelog; the project will follow semantic versioning once the public API stabilizes.

## Unreleased

### Added

- Open source project documentation and contribution guides.
- `SECURITY.md` vulnerability reporting policy.
- `.gitignore` for local logs, traces, and environment files.
- GitHub Actions CI covering install, tests, example lint, and skill lint.
- Runtime-agnostic testcase assertions for functional skill outputs.
- Default trace redaction for common sensitive fields.
- Functional `fskill-creator` agent skill with create / migrate sub-skill lanes.
- Script planning rules in `fskill-creator` main skill and sub-skills.
- Skill-first usage; deterministic helpers are self-contained within each skill.
- Removed npm workspace/packages scaffolding in favor of self-contained `skills/*/scripts` helpers.

## 0.1.0

### Added

- Initial release: creator/migrator skills, deterministic scripts, templates, docs, and example skill.
