# Shared Glossary

| Term | Definition | Notes |
|---|---|---|
| `meeting_notes` | The raw meeting notes text provided by the user. | This is the single source of truth for meeting facts. |
| `action_items` | Follow-up tasks extracted from the notes. | Each item should contain owner, task, and due date when available. |
| `decisions` | Decisions explicitly written in the notes. | Do not infer decisions that were not written. |
| `open_questions` | Unresolved questions from the meeting. | Preserve the original uncertainty. |
