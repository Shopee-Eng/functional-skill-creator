# Shared Glossary

| Term | Definition | Notes |
|---|---|---|
| `functional_skill` | A skill organized as `SKILL.md`, `functions/*.md`, `references/*.md`, optional scripts, tests, and traces. | `SKILL.md` handles orchestration; function files own the behavior. |
| `function_contract` | A markdown file defining a function's purpose, inputs, outputs, logic, errors, and observability. | Should be locally reviewable. |
| `create_context` | A normalized representation of the user's skill creation request from the create lane. | Captures goals, inputs, outputs, constraints, and open questions. |
| `migration_context` | A structured analysis of a legacy skill from the migrate lane. | Contains behavior_map, function split proposal, reference_plan, companion file inventory, and source_evidence. |
| `skill_blueprint` | The unified target skill blueprint after create / migrate / enhance convergence. | The latter half of the main skill only consumes the blueprint, not raw briefs or raw legacy markdown. |
| `file_plan` | Planned file create, update, skip, or conflict operations. | Must stay within `target_skill_path`. |
| `script_plan` | Proposed deterministic helpers and script tests. | Only for repeatable mechanics that need no model judgment. |
| `script_specs` | Drafted script files, test files, inputs, outputs, and failure behavior. | Function contracts should explicitly reference these scripts. |
| `tool_plan` | Generation plan for optional viewer tools. | Currently used for `tools/log_viewer.mjs` and `tools/tester_viewer.mjs`. |
| `log_viewer` | A local trace summary tool that reads `logs/runs/*.jsonl`. | Only reads local logs; does not upload data. |
| `tester_viewer` | A local regression coverage tool that reads `testcases/**/*.case.json`. | For test asset maintenance; does not execute agents. |
| `validation_result` | Final structure and quality validation result for the generated skill. | Should include actionable next steps. |
