# collect_create_brief

## Purpose

Normalize user requests into a `create_context` for creating or enhancing a functional skill.

## Input

| Field | Required | Description |
|---|---:|---|
| `skill_request` | yes | User-provided target skill description. |
| `target_skill_path` | no | Directory where the skill should be created or updated. |
| `skill_name` | no | User-explicit skill name. |
| `include_viewers` | no | Whether to generate `tools/log_viewer.mjs` and `tools/tester_viewer.mjs`. |

## Output

| Field | Description |
|---|---|
| `create_context.name` | Normalized skill name. |
| `create_context.goal` | One-paragraph description of the skill's goal. |
| `create_context.target_path` | Suggested target directory. |
| `create_context.external_inputs` | External inputs the skill should consume. |
| `create_context.expected_outputs` | Expected outputs or files. |
| `create_context.constraints` | User-stated constraints and non-goals. |
| `create_context.include_viewers` | `true`, `false`, or `unknown`. |
| `create_context.open_questions` | Blocking questions that cannot be safely inferred. |

## Logic

1. Extract the request's workflow, target user, expected outputs, and repo location.
2. If `skill_name` is missing, derive a lowercase kebab-case name.
3. If `include_viewers` is not provided, add an open question asking whether to generate viewer tools, briefly explaining that `log_viewer` views `logs/runs/*.jsonl` trace summaries and `tester_viewer` views `testcases/**/*.case.json` regression coverage.
4. Put uncertainty into `open_questions`; do not silently invent domain rules.
5. If target path is missing, suggest `skills/<skill_name>`.

## Errors

| Code | When |
|---|---|
| `[MISSING_SKILL_REQUEST]` | `skill_request` is empty. |
| `[AMBIGUOUS_GOAL]` | User request has no clear workflow or outcome. |

## Observability

Record normalized skill name, target path, open question count, and assumptions.
