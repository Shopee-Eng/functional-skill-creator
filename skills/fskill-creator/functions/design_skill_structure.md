# design_skill_structure

## Purpose

Design the functional skill structure based on the unified `skill_blueprint`, including pipeline steps, function names, references, deterministic script helpers, optional viewer tools, and testcase targets.

## Input

| Field | Required | Description |
|---|---:|---|
| `skill_blueprint` | yes | Unified target skill blueprint from `normalize_skill_blueprint`. |
| `existing_skill_files` | no | Existing files when updating an existing functional skill. |
| `script_rules` | no | Rules for deciding whether deterministic work belongs in `scripts/`. |

## Output

| Field | Description |
|---|---|
| `skill_structure.pipeline` | Ordered function pipeline with purpose, input, and output. |
| `skill_structure.functions` | Function names and responsibilities. |
| `skill_structure.references` | Shared reference docs to create or update. |
| `skill_structure.testcases` | Suggested unit or regression testcase coverage. |
| `skill_structure.file_layout` | Relative file paths within the skill directory. |
| `script_plan.scripts` | Deterministic helper scripts to create or update. |
| `script_plan.tests` | Script tests to create for deterministic helpers. |
| `script_plan.rationale` | Why each helper should be script code rather than prompt instructions. |
| `tool_plan` | Deprecated; viewers are no longer planned separately, but generated along with `include_report` / `include_unittest`. |

## Logic

1. Break the workflow into reviewable, single-responsibility functions.
2. Prefer 3--7 functions for a normal skill; fewer for simple workflows.
3. Put shared vocabulary and policies in references, not duplicated into multiple functions.
4. Keep compatible existing function names unless renaming reduces ambiguity.
5. Identify deterministic parsing, formatting, validation, and mechanical transforms as script candidates.
6. Only suggest scripts for repeatable logic that needs no model judgment and is testable.
7. Add script test targets for every script with branching behavior.
8. When `skill_blueprint.mode=migrate`, every `required_behavior` must be mapped to a target function, reference, script, or testcase.
9. When `skill_blueprint.include_report` is `true`, include `tools/log_viewer.mjs` in the file layout.
10. When `skill_blueprint.include_unittest` is `true`, include `tools/tester_viewer.mjs` in the file layout.

## Errors

| Code | When |
|---|---|
| `[MISSING_SKILL_BLUEPRINT]` | Missing `skill_blueprint`. |
| `[NO_REVIEWABLE_STRUCTURE]` | The request is too vague to split into functions. |
| `[BEHAVIOR_MAPPING_INCOMPLETE]` | Legacy behaviors are unmapped in migration mode. |

## Observability

Record function count, reference count, script candidate count, viewer tool count, and structure tradeoffs.
