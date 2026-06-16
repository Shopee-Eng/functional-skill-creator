---
name: fskill-creator-migrate
description: Migrate lane for fskill-creator; analyzes legacy SKILL.md into behavior map, function split proposal, and source evidence.
---

# fskill-creator-migrate

## Goal

Analyze a large or hard-to-maintain legacy `SKILL.md` into structured migration context while preserving behavior. This sub-skill only performs migration pre-analysis and does not directly write final functional skill files; final artifact generation, runtime capability provisioning, file writing, and validation are handled by the main `fskill-creator`.

Invoked by the main skill when the user has an existing monolithic skill and wants to "refactor into functional", "migrate to functional skill", or "restructure into functions/references/scripts".

## Principles

- Preserve existing behavior first, then optimize structure.
- Keep source section evidence so reviewers can trace migrated content.
- Only output `migration_context`; must not directly write target skill files.
- Duplicated rules, schemas, and vocabulary move to `reference_plan`.
- Deterministic parsing, formatting, validation, or mechanical transforms are identified as `script_plan`, to be generated or preserved later by the main skill.
- Optional viewers only enter `tool_plan`; final files are generated uniformly by the main skill's `add_runtime_capabilities`.

## References

| Resource | Load Timing | Purpose |
|---|---|---|
| `shared_glossary` | On demand | Stable migration terminology and output fields. |
| `script_rules` | Before proposing scripts | Rules for deciding what belongs in `scripts/`. |

## External Inputs

| Field | Source | Description |
|---|---|---|
| `legacy_skill_path` | user or repository | Path to existing monolithic `SKILL.md`. |
| `legacy_skill_content` | user or repository | Existing skill markdown content when path is inaccessible. |
| `migration_constraints` | user | Constraints such as preserving file names, tone, or platform rules. |
| `known_testcases` | user or repository | Existing examples, traces, or expected behaviors. |
| `existing_scripts` | repository | Existing helper scripts associated with the legacy skill. |
| `include_viewers` | user | Whether to suggest generating `tools/log_viewer.mjs` and `tools/tester_viewer.mjs`. |
| `script_runtime` | environment | Whether this sub-skill's own Node.js scripts can be run. |

## Execution Pipeline

| Step | Function | Purpose | Input | Output |
|---:|---|---|---|---|
| 1 | `load_legacy_skill` | Load and normalize source skill markdown. | `legacy_skill_path`<br>`legacy_skill_content` | `legacy_skill` |
| 2 | `map_existing_behavior` | Identify goals, rules, inputs, outputs, and behaviors that must be preserved. | `legacy_skill`<br>`migration_constraints` | `behavior_map` |
| 3 | `propose_function_split` | Propose function boundaries, script opportunities, optional viewer tools, and target file layout. | `legacy_skill`<br>`behavior_map`<br>`script_rules`<br>`include_viewers`<br>`script_runtime` | `migration_proposal`<br>`script_plan`<br>`tool_plan` |
| 4 | `extract_shared_references` | Move duplicated or shared rules into references. | `legacy_skill`<br>`migration_proposal`<br>`script_plan` | `reference_plan` |

## Output

The main skill combines the above outputs into:

| Field | Description |
|---|---|
| `migration_context.legacy_skill` | Loaded source skill data. |
| `migration_context.behavior_map` | Behaviors that must be preserved. |
| `migration_context.migration_proposal` | Function split and target structure proposal. |
| `migration_context.reference_plan` | Terms, rules, and schemas that should go into shared references. |
| `migration_context.script_plan` | Deterministic helpers to generate, preserve, or refactor. |
| `migration_context.tool_plan` | Optional viewer choices. |
| `migration_context.source_evidence` | Legacy source sections and behavior preservation evidence. |

## Output Scope

Only output migration context; must not directly write target skill files or delete the legacy skill.
