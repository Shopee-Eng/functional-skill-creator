---
name: meeting-notes-to-actions
description: Convert meeting notes into owners, action items, decisions, and follow-up messages.
---

# meeting-notes-to-actions

## Goal

Convert raw meeting notes into a structured follow-up plan. This example demonstrates a functional skill that is not tied to any specific agent runtime or business domain.

## Principles

- Orchestration stays in `SKILL.md`.
- Function behavior lives in `functions/*.md`.
- Do not fabricate owners, due dates, or decisions that are missing from the meeting notes.
- Only use trace logs when the caller enables reporting.
- Deterministic input normalization belongs in `scripts/`, not in prompt judgment.

## References

| Resource | Load Timing | Purpose |
|---|---|---|
| `shared_glossary` | On demand | Shared terminology for this example. |

## External Inputs

| Field | Source | Description |
|---|---|---|
| `meeting_notes` | user | Raw meeting notes text. |
| `default_due_date` | user | Optional fallback due date label. |
| `report_mode` | user | `off`, `local`, or `remote`; defaults to `off`. |

## Execution Pipeline

| Step | Function | Purpose | Input | Output |
|---:|---|---|---|---|
| 1 | `load_meeting_notes` | Normalize raw notes and source metadata. | `meeting_notes` | `notes_context` |
| 2 | `extract_action_items` | Extract owners, actions, decisions, and open questions. | `notes_context`<br>`default_due_date` | `action_items`<br>`decisions`<br>`open_questions` |
| 3 | `draft_follow_up` | Draft a concise follow-up message. | `action_items`<br>`decisions`<br>`open_questions` | `follow_up_message` |

## Output Scope

This example returns structured data and does not write project files.
