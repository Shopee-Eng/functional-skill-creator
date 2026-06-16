# resolve_task_mode

## Purpose

Determine whether this `fskill-creator` invocation should go through the create, migrate, enhance, or validate lane based on user input.

## Input

| Field | Required | Description |
|---|---:|---|
| `task_mode` | no | User-explicit `create`, `migrate`, `enhance`, or `validate`. |
| `skill_request` | no | User's natural language request for the target skill. |
| `legacy_skill_path` | no | Path to a legacy `SKILL.md`. |
| `legacy_skill_content` | no | Legacy skill markdown content. |
| `existing_skill_files` | no | Existing functional skill files. |

## Output

| Field | Description |
|---|---|
| `task_context.mode` | Normalized `create`, `migrate`, `enhance`, or `validate`. |
| `task_context.reason` | Rationale for the decision. |
| `task_context.required_lane_outputs` | Lane outputs that must be provided subsequently, e.g. `create_context` or `migration_context`. |
| `task_context.open_questions` | Questions needing user clarification when safe judgment is not possible. |

## Logic

1. If the user explicitly passed a valid `task_mode`, use it.
2. If `legacy_skill_path` or `legacy_skill_content` is present, choose `migrate`.
3. If `existing_skill_files` is present and the request involves completion, enhancement, adding functions, or adding report/tests, choose `enhance`.
4. If the request only asks to check or validate an existing skill, choose `validate`.
5. Otherwise, choose `create`.
6. If `migrate` lacks a legacy source, or `create` lacks an understandable skill request, return an open question.

## Errors

| Code | When |
|---|---|
| `[UNKNOWN_TASK_MODE]` | `task_mode` is not a supported enum value. |
| `[INSUFFICIENT_TASK_INPUT]` | Cannot determine task type from the input. |

## Observability

Record resolved mode, reason, open question count, and required lane outputs.
