# normalize_skill_blueprint

## Purpose

Converge create / migrate / enhance pre-analysis results into a unified `skill_blueprint` for the shared artifact pipeline.

## Input

| Field | Required | Description |
|---|---:|---|
| `task_context` | yes | Task mode and lane requirements from `resolve_task_mode`. |
| `create_context` | conditional | Create/enhance lane output. |
| `migration_context` | conditional | Migrate lane output, including behavior map, proposal, and source evidence. |
| `target_skill_path` | no | User-specified or lane-output-derived target path. |
| `include_report` | no | Whether to generate report log runtime; defaults to `true`. |
| `include_unittest` | no | Whether to generate unittest / testcase runner; defaults to `true`. |

## Output

| Field | Description |
|---|---|
| `skill_blueprint.mode` | `create`, `migrate`, `enhance`, or `validate`. |
| `skill_blueprint.name` | Target skill name. |
| `skill_blueprint.goal` | Core goal of the target skill. |
| `skill_blueprint.target_path` | Target skill directory. |
| `skill_blueprint.external_inputs` | External inputs for the target skill. |
| `skill_blueprint.expected_outputs` | Output or file scope of the target skill. |
| `skill_blueprint.required_behaviors` | Behaviors that must be preserved or implemented. |
| `skill_blueprint.constraints` | User constraints, non-goals, and platform constraints. |
| `skill_blueprint.source_evidence` | Migration source or requirement source evidence. |
| `skill_blueprint.include_report` | Whether to generate report log runtime. |
| `skill_blueprint.include_unittest` | Whether to generate unittest / testcase runner. |
| `skill_blueprint.open_questions` | Questions still needing user confirmation. |

## Logic

1. Create/enhance lane reads goal, inputs, outputs, constraints, and open questions from `create_context`.
2. Migrate lane reads must-preserve behaviors, source evidence, and target structure from `migration_context.behavior_map`, `migration_context.migration_proposal`, and `migration_context.reference_plan`.
3. Explicit `target_skill_path` input takes highest priority; otherwise use the suggested path from lane output.
4. Include flag defaults:
   - `include_report=true`
   - `include_unittest=true`
5. Migration mode must preserve `source_evidence`; add `[MIGRATION_EVIDENCE_MISSING]` warning when evidence is absent.
6. Do not stuff raw PRD, raw legacy markdown, or full source code into the blueprint; keep only reviewable summaries and references.

## Errors

| Code | When |
|---|---|
| `[MISSING_LANE_CONTEXT]` | Required lane output is missing for the current mode. |
| `[BLUEPRINT_TARGET_UNRESOLVED]` | Target skill path cannot be determined. |
| `[BLUEPRINT_GOAL_UNRESOLVED]` | Target skill goal cannot be determined. |

## Observability

Record mode, target path, required behavior count, source evidence count, include choices, and open question count.
