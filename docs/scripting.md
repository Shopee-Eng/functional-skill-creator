# Scripting in Functional Skills

A functional skill should not write every operation as a prompt. Whenever a step is deterministic, put it in `scripts/`, and have the function contract describe when and how to invoke it.

## When to Use Scripts

Work suitable for scripts is typically:

- Deterministic and repeatable;
- Easier to verify through code tests;
- Sensitive to formatting or escaping nuances;
- Reusable across multiple functions;
- Mechanical rather than judgment-driven.

Good examples:

- Parsing or normalizing markdown frontmatter;
- Validating testcase JSON shape;
- Converting JSONL traces into testcase files;
- Normalizing meeting notes whitespace before extraction;
- Generating summary tables from structured data;
- Performing mechanical renames or file layout transformations.

Not suitable:

- Judging whether requirements are ambiguous;
- Choosing function boundaries for complex migrations;
- Inferring missing business context;
- Writing user-facing prose that requires judgment.

## Contract Pattern

When a function uses a script, write it clearly in the function contract:

```text
## Logic

1. Run `scripts/normalize_input.mjs` with `raw_input`.
2. Use the script output as `normalized_input`.
3. If the script cannot run, return `[SCRIPT_FAILED]` with the error message.
4. Continue model-dependent reasoning only after deterministic normalization is complete.
```

The contract should state:

- Script path;
- Input object or arguments;
- Output object;
- Failure behavior;
- Whether the script may read or write files.

## Script Requirements

- Stay deterministic by default.
- Avoid hidden network calls.
- Do not write outside the skill directory unless explicitly allowed by the function contract.
- Keep script input/output JSON-serializable when possible.
- Scripts with branching logic must have `.test.mjs` tests.
- Do not put secrets in script arguments or logs.

## Relationship with Functions

The function contract owns the workflow responsibility. The script owns the deterministic mechanics.

For example, `load_meeting_notes` is responsible for the decision "normalize meeting notes before extraction"; `scripts/normalize_meeting_notes.mjs` is responsible for the specific whitespace normalization behavior.

`tools/` differs from `scripts/`: `scripts/` are deterministic helpers that the function workflow invokes; `tools/` are optional local viewers, such as `log_viewer` and `tester_viewer`, used to inspect traces or regression coverage, and should not carry workflow-essential logic.
