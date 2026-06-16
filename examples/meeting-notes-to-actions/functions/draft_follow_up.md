# draft_follow_up

## Purpose

Draft a concise follow-up message from the extracted actions, decisions, and open questions.

## Input

| Field | Required | Description |
|---|---:|---|
| `action_items` | yes | The extracted action items. |
| `decisions` | yes | The extracted decisions. |
| `open_questions` | yes | The extracted open questions. |

## Output

| Field | Description |
|---|---|
| `follow_up_message` | Human-readable follow-up message. |

## Logic

1. Organize the message by grouping: decisions, action items, and open questions.
2. Keep it concise.
3. Do not add promises that are not in the notes.

## Errors

| Code | When |
|---|---|
| `[MISSING_EXTRACTED_ITEMS]` | Missing required extracted lists. |

## Observability

Record output length and missing-section warnings.
