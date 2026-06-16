# map_existing_behavior

## Purpose

Identify legacy behaviors that must be preserved during migration.

## Input

| Field | Required | Description |
|---|---:|---|
| `legacy_skill` | yes | Loaded source skill data. |
| `migration_constraints` | no | User-provided behavior preservation or refactoring constraints. |

## Output

| Field | Description |
|---|---|
| `behavior_map.goals` | Existing skill goals and non-goals. |
| `behavior_map.external_inputs` | Expected inputs of the legacy skill. |
| `behavior_map.outputs` | Outputs, file writes, or side effects. |
| `behavior_map.rules` | Rules that must be preserved. |
| `behavior_map.platform_assumptions` | Runtime, tool, or environment assumptions. |
| `behavior_map.risks` | Behavior preservation risks and ambiguous areas. |

## Logic

1. Extract goals, commands, decision rules, file scopes, tool assumptions, and output requirements.
2. Preserve explicit ordering constraints from the legacy skill.
3. Distinguish behavior from wording/style.
4. Put unclear or conflicting rules into `risks`; do not silently resolve.

## Errors

| Code | When |
|---|---|
| `[MISSING_LEGACY_SKILL]` | Missing `legacy_skill.markdown`. |
| `[NO_BEHAVIOR_FOUND]` | Not enough behavior in source to migrate. |

## Observability

Record counts of goals, inputs, outputs, rules, assumptions, and risks.
