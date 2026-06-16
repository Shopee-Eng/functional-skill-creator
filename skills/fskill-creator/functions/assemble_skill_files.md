# assemble_skill_files

## Purpose

Create or update the target functional skill directory based on confirmed artifacts.

## Input

| Field | Required | Description |
|---|---:|---|
| `target_skill_path` | yes | Directory where skill files should be written. |
| `skill_structure` | yes | File layout and pipeline metadata. |
| `skill_artifacts` | yes | `SKILL.md`, function files, reference files, script files, and testcase files. |
| `runtime_artifacts` | no | Self-contained runtime files such as report/runtime/test/viewer. |
| `script_runtime` | no | Whether this skill's own Node.js scripts can be run. |

## Output

| Field | Description |
|---|---|
| `file_plan` | Planned create/update operations. |
| `created_files` | Newly created files. |
| `updated_files` | Modified files. |
| `skipped_files` | Existing files intentionally left untouched. |

## Logic

1. If the directory does not exist and script runtime is available, run `scripts/init_skill.mjs` as a deterministic helper for the basic skeleton; pass `--include-report` / `--include-unittest` according to `include_report` / `include_unittest`.
2. Write `SKILL.md`, `functions/*.md`, and `references/*.md` from confirmed content.
3. When deterministic helpers are confirmed, write `scripts/*.mjs` and `scripts/*.test.mjs`.
4. Write `runtime_artifacts.script_files`, `runtime_artifacts.tool_files`, and `runtime_artifacts.testcase_files`.
5. Add `.gitkeep` for unused empty directories `scripts`, `testcases/unit`, and `logs/runs`.
6. Do not overwrite user-edited files unless the user explicitly asks or the diff has been reviewed.
7. All file paths must be within `target_skill_path`.

## Errors

| Code | When |
|---|---|
| `[MISSING_TARGET_PATH]` | Missing `target_skill_path`. |
| `[PATH_OUT_OF_SCOPE]` | A planned file path escapes the target directory. |
| `[WRITE_CONFLICT]` | Existing content cannot be safely merged. |
| `[SCRIPT_WRITE_CONFLICT]` | Script file already exists and cannot be safely merged. |
| `[TOOL_WRITE_CONFLICT]` | Viewer tool already exists and cannot be safely merged. |
| `[RUNTIME_WRITE_CONFLICT]` | Runtime file already exists and cannot be safely merged. |

## Observability

Record counts of created, updated, skipped, conflicted, script files, runtime files, and viewer tool files.
