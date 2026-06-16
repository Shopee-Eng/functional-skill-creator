# extract_shared_references

## Purpose

Identify duplicated rules, glossary terms, schemas, and policies that should go into references.

## Input

| Field | Required | Description |
|---|---:|---|
| `legacy_skill` | yes | Loaded source skill data. |
| `migration_proposal` | yes | Proposed function split and orchestration. |
| `script_plan` | no | Proposed deterministic helpers and script tests. |

## Output

| Field | Description |
|---|---|
| `reference_plan.references` | Reference files to create or update. |
| `reference_plan.glossary_terms` | Shared terms and stable field definitions. |
| `reference_plan.policies` | Shared policies or constraints. |
| `reference_plan.schemas` | Reusable input or output schemas. |
| `reference_plan.script_rules` | Shared script usage rules or script I/O contracts. |
| `reference_plan.source_links` | Source sections for each reference item. |

## Logic

1. Extract terms and rules used by multiple proposed functions.
2. Move stable schemas into references; do not duplicate them across functions.
3. Keep function-local edge cases in the owning function contract.
4. Preserve original wording for critical policies where possible.
5. When multiple functions call scripts, put reusable script I/O conventions into references.

## Errors

| Code | When |
|---|---|
| `[MISSING_MIGRATION_PROPOSAL]` | Missing `migration_proposal`. |
| `[REFERENCE_CONFLICT]` | Shared rules conflict across source sections. |

## Observability

Record glossary term count, policy count, schema count, script rule count, and conflicts.
