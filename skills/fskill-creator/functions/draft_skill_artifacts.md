# draft_skill_artifacts

## Purpose

Draft `SKILL.md`, function contracts, shared reference content, script specifications, and testcase suggestions for the proposed skill structure.

## Input

| Field | Required | Description |
|---|---:|---|
| `skill_blueprint` | yes | Unified target skill blueprint. |
| `skill_structure` | yes | Proposed functional structure. |
| `script_plan` | no | Proposed deterministic helpers and script tests. |

## Output

| Field | Description |
|---|---|
| `skill_artifacts.skill_file` | Target `SKILL.md` content. |
| `skill_artifacts.function_files` | Mapping of function file paths to markdown contract content. |
| `skill_artifacts.reference_files` | Mapping of reference file paths to markdown reference content. |
| `skill_artifacts.script_files` | Mapping of script file paths to deterministic helper specifications or file drafts. |
| `skill_artifacts.testcase_files` | Suggested testcase files and assertion focus. |
| `skill_artifacts.notes` | Migration behavior preservation notes, runtime choices, and unresolved risks. |

## Logic

1. Each function includes Purpose, Input, Output, Logic, Errors, and Observability sections.
2. Ensure every input is traceable to user, environment, preceding function output, or a declared reference.
3. Use explicit object fields for outputs, not broad prose.
4. Keep glossary entries stable and reusable.
5. When a function depends on deterministic logic, write the script path, expected input, expected output, and failure behavior in the contract.
6. Draft script specs for deterministic helpers; do not repeat mechanical details as prompt prose.
7. In migration mode, every `required_behavior` must land in a function, reference, script, or testcase, with source evidence preserved in notes.
8. Suggest at least one testcase for the highest-risk function, and script tests for every script with branching.

## Errors

| Code | When |
|---|---|
| `[MISSING_STRUCTURE]` | `skill_structure` is missing or has no functions. |
| `[CONTRACT_CONFLICT]` | A function consumes an input that is not an external input, preceding output, or reference. |
| `[SCRIPT_CONTRACT_MISMATCH]` | A function references a script whose input/output does not match the declared contract. |
| `[BEHAVIOR_EVIDENCE_DROPPED]` | Source evidence did not make it into artifacts in migration mode. |

## Observability

Record drafted function names, script names, contract completeness checks, and unresolved field/script conflicts.
