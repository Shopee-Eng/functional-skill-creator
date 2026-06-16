---
name: fskill-creator-create
description: Create lane for fskill-creator; normalizes user briefs into create_context for the main skill to generate functional skills.
---

# fskill-creator-create

## Goal

Normalize user requests for creating or enhancing functional skills into a `create_context`. This sub-skill only performs create/enhance pre-analysis and does not directly write target skill files.

## External Inputs

| Field | Source | Description |
|---|---|---|
| `skill_request` | user | User-provided target skill description. |
| `target_skill_path` | user or repository | Directory where the functional skill should be created or updated. |
| `skill_name` | user or derived | Optional target skill name. |
| `include_viewers` | user | Whether to generate `tools/log_viewer.mjs` and `tools/tester_viewer.mjs`. |

## Execution Pipeline

| Step | Function | Purpose | Input | Output |
|---:|---|---|---|---|
| 1 | `collect_create_brief` | Normalize user request and identify missing decisions. | `skill_request`<br>`target_skill_path`<br>`skill_name`<br>`include_viewers` | `create_context` |

## Output Scope

Only output `create_context`; must not directly write target skill files.
