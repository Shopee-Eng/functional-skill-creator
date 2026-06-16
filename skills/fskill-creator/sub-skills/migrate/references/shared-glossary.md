# Shared Glossary

| Term | Definition | Notes |
|---|---|---|
| `legacy_skill` | The original legacy skill package being migrated. | Includes `SKILL.md` plus companion files such as `references/`, `scripts/`, and `tools/`. |
| `behavior_map` | A structured inventory of legacy behaviors that must be preserved. | Contains goals, inputs, outputs, rules, side effects, assumptions, and risks. |
| `migration_proposal` | A reviewable plan of function boundaries and target layout. | Should be confirmed before writing files. |
| `reference_plan` | A plan for moving shared terms, policies, and schemas into references. | Keeps function contracts smaller. |
| `script_plan` | A plan for deterministic helpers to preserve, create, or refactor in the migration. | Script candidates should be traceable to legacy behavior. |
| `tool_plan` | A plan for generating optional viewer tools after migration. | Currently used for `tools/log_viewer.mjs` and `tools/tester_viewer.mjs`. |
| `artifact_plan` | Drafted files and testcase suggestions for the migration. | Should include unresolved migration notes. |
| `script_gap` | Deterministic legacy behavior not represented as script code or lacking script tests. | Should be reviewed before accepting migration. |
| `log_viewer` | A local trace summary tool that reads `logs/runs/*.jsonl`. | Only reads local logs; does not upload data. |
| `tester_viewer` | A local regression coverage tool that reads `testcases/**/*.case.json`. | For test asset maintenance; does not execute agents. |
| `behavior_gap` | Legacy behavior not covered by migrated artifacts. | A blocking issue unless explicitly accepted by the user. |
