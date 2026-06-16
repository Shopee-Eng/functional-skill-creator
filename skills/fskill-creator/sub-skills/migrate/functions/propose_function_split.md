# propose_function_split

## Purpose

Propose function boundaries, deterministic script opportunities, optional viewer tools, and target file layout for the migrated functional skill.

## Input

| Field | Required | Description |
|---|---:|---|
| `legacy_skill` | yes | Loaded source skill data. |
| `behavior_map` | yes | Behavior map to preserve. |
| `script_rules` | no | Rules for deciding what belongs in `scripts/`. |
| `include_viewers` | no | Whether to suggest generating `tools/log_viewer.mjs` and `tools/tester_viewer.mjs`. |
| `script_runtime` | no | Whether `scripts/migrate_proposal.mjs` can be run to generate a first-pass proposal. |

## Output

| Field | Description |
|---|---|
| `migration_proposal.summary` | Section count, candidate count, and migration risk summary. |
| `migration_proposal.functions` | Suggested function names, sources, and responsibilities. |
| `migration_proposal.orchestration` | Outline for the new `SKILL.md`. |
| `migration_proposal.file_layout` | Target files to create or update. |
| `migration_proposal.review_notes` | Items needing human confirmation before writing files. |
| `script_plan.scripts` | Deterministic helper scripts to create, preserve, or refactor. |
| `script_plan.tests` | Script tests needed for deterministic helpers. |
| `script_plan.rationale` | Source behavior rationale for each script. |
| `tool_plan.viewers` | Viewer tools to suggest generating when `include_viewers` is `true`. |

## Logic

1. When available, use `scripts/migrate_proposal.mjs <legacy_skill_dir>` as a first-pass helper; pass `--include-viewers true` when `include_viewers` is `true`.
2. Treat existing `scripts/` files as preserve-or-refactor candidates before proposing new helpers.
3. Treat existing `references/*.md` as shared-policy sources before splitting rules into new function contracts.
3. Group action-oriented sections into function candidates.
4. Each function has exactly one reviewable responsibility.
5. Preserve source section and companion file references so reviewers can trace migrated content.
6. Avoid splitting shared policy into function-local rules.
7. Identify deterministic legacy logic that should become, or remain as, script code.
8. Add script test targets for helpers that preserve branching legacy behavior.
9. When `include_viewers` is `true`, add `tools/log_viewer.mjs` and `tools/tester_viewer.mjs` to the target layout; when `false`, do not generate; when not provided, ask the user to confirm first.

## Errors

| Code | When |
|---|---|
| `[MISSING_BEHAVIOR_MAP]` | Missing `behavior_map`. |
| `[NO_FUNCTION_CANDIDATES]` | Cannot safely propose function boundaries. |
| `[SCRIPT_BOUNDARY_CONFLICT]` | Deterministic script logic and function responsibilities cannot be safely split. |

## Observability

Record whether script assistance was used, candidate count, script candidate count, viewer tool count, and review note count.
