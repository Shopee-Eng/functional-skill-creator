# extract_action_items

## Purpose

Extract explicit action items, decisions, and open questions from normalized meeting notes.

## Input

| Field | Required | Description |
|---|---:|---|
| `notes_context.text` | yes | Normalized meeting notes. |
| `default_due_date` | no | Optional fallback due date label. |

## Output

| Field | Description |
|---|---|
| `action_items` | List of action items, each containing `owner`, `task`, and `due_date`. |
| `decisions` | Decisions explicitly stated in the notes. |
| `open_questions` | Questions or unresolved items. |

## Logic

1. Only extract facts that are grounded in the notes.
2. Only use `default_due_date` when an action has no explicit due date.
3. Mark unknown owners as `unassigned`; do not invent names.

## Errors

| Code | When |
|---|---|
| `[MISSING_NOTES_CONTEXT]` | Missing `notes_context.text`. |

## Observability

Record extraction counts and warnings in the function trace.
