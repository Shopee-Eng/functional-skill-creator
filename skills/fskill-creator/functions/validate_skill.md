# validate_skill

## Purpose

Validate that the created, enhanced, or migrated skill conforms to the functional-skill structure and is ready for review.

## Input

| Field | Required | Description |
|---|---:|---|
| `target_skill_path` | yes | Directory containing the generated skill. |
| `file_plan` | yes | File operations from `assemble_skill_files`. |
| `skill_blueprint` | no | Used to differentiate check focus for create / migrate / enhance / validate. |
| `report_mode` | no | `off`, `local`, or `remote`; defaults to `off`. |

## Output

| Field | Description |
|---|---|
| `validation_result.ok` | Whether validation passed. |
| `validation_result.errors` | Blocking validation errors. |
| `validation_result.warnings` | Non-blocking review warnings. |
| `validation_result.commands_run` | Scripts or manual validation commands that were executed. |
| `validation_result.script_results` | Script test results or script validation warnings. |
| `validation_result.behavior_gaps` | Legacy behaviors not covered by artifacts in migration mode. |
| `validation_result.runtime_gaps` | Missing report, runtime, testcase runner, or viewer capabilities. |
| `validation_result.next_steps` | Suggested follow-up actions. |

## Logic

1. When script runtime is available, run `scripts/lint_skill.mjs <target_skill_path>`.
2. Check that `SKILL.md` has a clear goal, inputs, pipeline, references, and output scope.
3. Check each function contract has Purpose, Input, Output, Logic, Errors, and Observability.
4. Check that deterministic logic suitable for scripting is represented as `scripts/` helpers.
5. If `scripts/*.test.mjs` exist, run script tests; otherwise explain why script tests are deferred.
6. Confirm functional testcases exist, or explain why tests are deferred.
7. If `skill_blueprint.mode=migrate`, verify every `required_behavior` is covered by a function, reference, script, or testcase.
8. If `include_report` / `include_unittest` flags are true, verify the corresponding runtime and viewer files exist.
9. Return concrete next steps; do not use vague quality descriptions.

## Errors

| Code | When |
|---|---|
| `[MISSING_TARGET_SKILL]` | Missing target skill directory or `SKILL.md`. |
| `[LINT_FAILED]` | Structure lint failed. |
| `[SCRIPT_TEST_FAILED]` | Deterministic helper script test failed. |
| `[BEHAVIOR_GAP]` | Required legacy behavior is not represented in migration mode. |
| `[RUNTIME_GAP]` | Required runtime capability is missing. |

## Observability

Record validation status, command outputs, script test status, and unresolved warning count.
