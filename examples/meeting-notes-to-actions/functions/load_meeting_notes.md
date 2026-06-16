# load_meeting_notes

## Purpose

Normalize raw meeting notes into a structured context object.

## Input

| Field | Required | Description |
|---|---:|---|
| `meeting_notes` | yes | Raw meeting notes text provided by the user. |

## Output

| Field | Description |
|---|---|
| `notes_context.text` | Normalized note text. |
| `notes_context.has_content` | Whether the input contains meaningful content. |
| `notes_context.line_count` | Number of non-empty lines after normalization. |
| `notes_context.warnings` | Warnings for missing or low-quality input. |

## Logic

1. Call `scripts/normalize_meeting_notes.mjs` with `meeting_notes`.
2. Use the script output as `notes_context`.
3. If `notes_context.has_content` is false, return `[MISSING_MEETING_NOTES]`.
4. Only do deterministic whitespace normalization; preserve the original wording. This function does not summarize.

## Errors

| Code | When |
|---|---|
| `[MISSING_MEETING_NOTES]` | `meeting_notes` is empty. |
| `[SCRIPT_FAILED]` | `scripts/normalize_meeting_notes.mjs` cannot run or returns invalid output. |

## Observability

When reporting is enabled, record real input/output snapshots, script path, line count, and warnings.
