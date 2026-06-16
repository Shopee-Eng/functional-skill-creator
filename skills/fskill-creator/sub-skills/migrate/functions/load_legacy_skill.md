# load_legacy_skill

## Purpose

Load and normalize a legacy skill directory for migration analysis.

## Input

| Field | Required | Description |
|---|---:|---|
| `legacy_skill_dir` | no | Path to the legacy skill directory containing `SKILL.md`. |
| `legacy_skill_path` | no | Deprecated alias for `legacy_skill_dir`; may also be a direct path to `SKILL.md`. |
| `legacy_skill_content` | no | Raw markdown content provided when the directory is unavailable. |

## Output

| Field | Description |
|---|---|
| `legacy_skill.source` | `directory`, `path`, or `content`. |
| `legacy_skill.skill_root` | Resolved legacy skill directory when available. |
| `legacy_skill.path` | Path to `SKILL.md` when loaded from disk. |
| `legacy_skill.markdown` | Normalized `SKILL.md` content. |
| `legacy_skill.sections` | Parsed markdown sections and heading levels from `SKILL.md`. |
| `legacy_skill.metadata` | Frontmatter or inferred name/description. |
| `legacy_skill.companion_files` | Inventory of `references/`, `scripts/`, `tools/`, and `testcases/` under the skill root. |
| `legacy_skill.companion_contents` | Loaded markdown from `references/*.md` when available. |
| `legacy_skill.warnings` | Loading or normalization warnings. |

## Logic

1. Resolve `legacy_skill_dir` from `legacy_skill_dir`, `legacy_skill_path`, or the parent directory of a direct `SKILL.md` path.
2. When both directory and `legacy_skill_content` are provided, prioritize the directory and load `SKILL.md` from disk.
3. Read `SKILL.md` from the resolved skill root; inventory companion files under `references/`, `scripts/`, `tools/`, and `testcases/`.
4. Preserve original markdown wording and existing script filenames.
5. Parse headings and frontmatter, but do not rewrite content.
6. Return warnings for missing `SKILL.md`, content that is too short, lacks a title, or lacks a goal.

## Errors

| Code | When |
|---|---|
| `[MISSING_LEGACY_SKILL]` | Neither skill directory nor content provided. |
| `[READ_FAILED]` | Unable to read source directory or `SKILL.md`. |
| `[MISSING_SKILL_MD]` | Skill directory exists but lacks `SKILL.md`. |

## Observability

Record source type, skill root, section count, markdown length, companion file counts, and load warnings.
