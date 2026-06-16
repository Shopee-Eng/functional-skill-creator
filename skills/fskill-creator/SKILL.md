---
name: fskill-creator
description: Create, maintain, or migrate functional skills; supports creating from a requirement brief and migrating existing SKILL.md into a functional skill structure.
---

# fskill-creator

## Goal

Unify the create and migrate lanes to produce a self-contained, reviewable, testable functional agent skill directory. The main skill handles routing, blueprint normalization, shared artifact generation, runtime capability provisioning, file writing, and validation; sub-skills only handle pre-analysis for their respective input forms.

Use this skill when the user wants to "generate a functional skill", "create a functional skill", "add functions to an existing functional skill", or "migrate an existing SKILL.md into a functional skill".

## Principles

- The main `SKILL.md` only orchestrates the shared create / migrate / enhance / validate workflow.
- Create and migrate are two pre-lanes; they must first converge into a unified `skill_blueprint`.
- Function-specific behavior lives in `functions/*.md`; create / migrate specific pre-behavior lives in `sub-skills/*/functions/*.md`.
- Shared vocabulary, policies, and schemas live in `references/*.md`.
- Deterministic parsing, formatting, validation, and mechanical transforms live in `scripts/`.
- Report, unit test, viewer, and testcase capabilities are maintained only once in the main skill, and vendored into the target skill by `add_runtime_capabilities`.
- Preserve user-provided domain constraints; the migrate lane must also preserve legacy behavior evidence.
- When the user has not approved direct modification, generated files should be treated as proposals.

## Sub-Skills

| Sub-skill | When | Responsibility | Output |
|---|---|---|---|
| `sub-skills/create` | User provides a new skill brief or wants to enhance an existing functional skill | Normalize requirements, target path, inputs/outputs, constraints, and viewer choices | `create_context` |
| `sub-skills/migrate` | User provides a legacy `SKILL.md`, monolithic skill content, or a migration request | Load legacy skill, identify behaviors that must be preserved, propose function boundaries and evidence | `migration_context` |

Sub-skills do not directly write final target skill files. Their output must go through `normalize_skill_blueprint` before entering the shared artifact pipeline.

## References

| Resource | Load Timing | Purpose |
|---|---|---|
| `shared_glossary` | On demand | Stable terminology and cross-lane field semantics. |
| `script_rules` | Before designing or drafting scripts | Rules for deciding whether deterministic work belongs in `scripts/`. |
| `sub-skills/create` | Create lane | Form `create_context` from user brief. |
| `sub-skills/migrate` | Migrate lane | Form `migration_context` from legacy skill. |

## External Inputs

| Field | Source | Description |
|---|---|---|
| `task_mode` | user or derived | `create`, `migrate`, `enhance`, or `validate`; inferred by `resolve_task_mode` when absent. |
| `skill_request` | user | Requirement description for creating or enhancing a skill. |
| `legacy_skill_path` | user or repository | Path to an existing monolithic `SKILL.md`. |
| `legacy_skill_content` | user | Legacy skill markdown provided when the path is inaccessible. |
| `target_skill_path` | user or derived | Directory where the functional skill should live. |
| `skill_name` | user or derived | Optional target skill name. |
| `existing_skill_files` | repository | Optional existing functional skill files. |
| `migration_constraints` | user | File names, tone, platform rules, or behaviors that must be preserved during migration. |
| `known_testcases` | user or repository | Existing examples, traces, or expected behaviors. |
| `existing_scripts` | repository | Helper scripts associated with the legacy skill. |
| `include_report` | user | Whether to generate report log runtime in the target skill; defaults to `true`. |
| `include_unittest` | user | Whether to generate unittest / testcase runner in the target skill; defaults to `true`. |
| `script_runtime` | environment | Whether this skill's own Node.js scripts can be run. |
| `report_mode` | user | `off`, `local`, or `remote`; defaults to `off`. |

Viewers are generated following the capability flags: `tools/log_viewer.mjs` when `include_report=true`; `tools/tester_viewer.mjs` when `include_unittest=true`.

## Execution Pipeline

| Step | Function | Purpose | Input | Output |
|---:|---|---|---|---|
| 1 | `resolve_task_mode` | Determine whether this request should go through create, migrate, enhance, or validate. | `task_mode`<br>`skill_request`<br>`legacy_skill_path`<br>`legacy_skill_content`<br>`existing_skill_files` | `task_context` |
| 2A | `sub-skills/create::collect_create_brief` | Create/enhance lane: normalize user brief. | `skill_request`<br>`target_skill_path`<br>`skill_name` | `create_context` |
| 2B | `sub-skills/migrate::load_legacy_skill` + `map_existing_behavior` + `propose_function_split` + `extract_shared_references` | Migrate lane: read legacy skill, extract behaviors and migration evidence. | `legacy_skill_path`<br>`legacy_skill_content`<br>`migration_constraints`<br>`include_report`<br>`include_unittest`<br>`script_runtime` | `migration_context` |
| 3 | `normalize_skill_blueprint` | Converge create / migrate / enhance inputs into a unified blueprint. | `task_context`<br>`create_context`<br>`migration_context`<br>`target_skill_path`<br>`include_report`<br>`include_unittest` | `skill_blueprint` |
| 4 | `design_skill_structure` | Design function pipeline, references, scripts, testcases, and file layout based on blueprint. | `skill_blueprint`<br>`existing_skill_files`<br>`script_rules` | `skill_structure`<br>`script_plan`<br>`tool_plan` |
| 5 | `draft_skill_artifacts` | Draft `SKILL.md`, function contracts, references, script specs, and testcase suggestions. | `skill_blueprint`<br>`skill_structure`<br>`script_plan` | `skill_artifacts` |
| 6 | `add_runtime_capabilities` | Provision report log, runtime wrapper, unit testcase runner, viewer, and smoke tests according to include flags. | `skill_blueprint.include_report`<br>`skill_blueprint.include_unittest`<br>`skill_artifacts` | `runtime_artifacts`<br>`skill_artifacts` |
| 7 | `assemble_skill_files` | Generate or update target skill directory files. | `target_skill_path`<br>`skill_structure`<br>`skill_artifacts`<br>`runtime_artifacts`<br>`script_runtime` | `file_plan`<br>`created_files`<br>`updated_files` |
| 8 | `validate_skill` | Validate functional-skill structure, runtime capabilities, testcases, and migration behavior preservation. | `target_skill_path`<br>`file_plan`<br>`skill_blueprint`<br>`report_mode` | `validation_result` |

## Output Scope

This skill may read legacy skills and create or modify functional skill files under `target_skill_path`. Do not delete the original legacy skill unless the user explicitly requests deletion; do not modify unrelated repository files unless the user explicitly requests project-level integration.
