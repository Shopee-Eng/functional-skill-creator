# load_legacy_skill

## Purpose

Load and normalize monolithic skill markdown for migration analysis.

## Input

| Field | Required | Description |
|---|---:|---|
| `legacy_skill_path` | no | Path to existing `SKILL.md`. |
| `legacy_skill_content` | no | Raw markdown content provided when path is unavailable. |

## Output

| Field | Description |
|---|---|
| `legacy_skill.source` | `path` or `content`. |
| `legacy_skill.path` | Source path when path was provided. |
| `legacy_skill.markdown` | Normalized markdown content. |
| `legacy_skill.sections` | Parsed markdown sections and heading levels. |
| `legacy_skill.metadata` | Frontmatter or inferred name/description. |
| `legacy_skill.warnings` | Loading or normalization warnings. |

## Logic

1. When both path and content are provided, prioritize `legacy_skill_path`.
2. Preserve original markdown wording.
3. Parse headings and frontmatter, but do not rewrite content.
4. Return warnings for content that is too short, lacks a title, or lacks a goal.

## Errors

| Code | When |
|---|---|
| `[MISSING_LEGACY_SKILL]` | Neither path nor content provided. |
| `[READ_FAILED]` | Unable to read source path. |

## Observability

Record source type, section count, markdown length, and load warnings.
