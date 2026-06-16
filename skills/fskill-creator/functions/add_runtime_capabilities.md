# add_runtime_capabilities

## Purpose

Provision self-contained report log, runtime wrapper, unit testcase runner, corresponding viewer, and smoke tests for the target functional skill.

## Input

| Field | Required | Description |
|---|---:|---|
| `skill_blueprint.include_report` | yes | Whether to generate report log runtime. |
| `skill_blueprint.include_unittest` | yes | Whether to generate unittest / testcase runner. |
| `skill_artifacts` | yes | The drafted skill artifacts. |

## Output

| Field | Description |
|---|---|
| `runtime_artifacts.script_files` | Report/runtime/test helper files to write into `scripts/`. |
| `runtime_artifacts.tool_files` | Viewer files to write into `tools/`. |
| `runtime_artifacts.testcase_files` | Runtime smoke testcases or report tests. |
| `runtime_artifacts.warnings` | Runtime warnings that cannot be resolved or need review. |
| `skill_artifacts` | Artifacts merged with runtime guidance. |

## Logic

1. When `include_report=true`, generate or preserve `scripts/report.mjs` and `scripts/runtime.mjs`:
   - `report.mjs` handles `off` / `local` / `remote` report mode, redaction, JSONL writing, and token estimate.
   - `runtime.mjs` binds the current skill name and exports `runStep`, `writeStepReport`, and `applyReportMode`.
2. When `include_report=true`, generate or preserve `scripts/test_report.mjs` smoke test.
3. When `include_unittest=true`, generate or preserve `scripts/test_cases.mjs`, ensure `testcases/unit/` exists, and suggest `.case.json` for high-risk functions.
4. When `include_report=true`, generate `tools/log_viewer.mjs`.
5. When `include_unittest=true`, generate `tools/tester_viewer.mjs`.
6. All runtime files must be vendored into the target skill; the uploaded skill must not depend on external toolkit paths.
7. If the target skill already has runtime files with the same names, prefer preserving the user's version and emit a review warning rather than silently overwriting.

## Errors

| Code | When |
|---|---|
| `[RUNTIME_CAPABILITY_CONFLICT]` | Target runtime file conflicts with the standard template and cannot be safely merged. |
| `[REPORT_RUNTIME_MISSING]` | `include_report=true` but report runtime could not be generated or preserved. |
| `[TEST_RUNTIME_MISSING]` | `include_unittest=true` but testcase runner could not be generated or preserved. |

## Observability

Record report runtime file count, test runner file count, viewer file count, runtime conflicts, and warning count.
