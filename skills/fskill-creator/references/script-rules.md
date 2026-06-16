# Script Rules

`scripts/` is for deterministic work that does not require model judgment and is repeatable.

## Suitable for Scripts

- Parsing structured files;
- Normalizing whitespace, paths, or frontmatter;
- Validating JSON-like objects;
- Converting trace records into testcase files;
- Rendering predictable reports;
- Applying mechanical file transforms.

## Keep in Function Contracts

- Judging whether requirements are ambiguous;
- Choosing function boundaries;
- Interpreting user intent;
- Writing user-facing prose that requires judgment;
- Resolving domain tradeoffs.

## Contract Requirements

When a function uses a script, the contract must state:

- Script path;
- Script input;
- Script output;
- Failure behavior;
- Whether the script may read or write files.

Scripts with branching behavior should have `.test.mjs` tests in the same directory.

## Viewer Tools

`tools/` is for optional local viewers and does not carry workflow-essential logic.

- `tools/log_viewer.mjs` reads `logs/runs/*.jsonl` and summarizes function traces.
- `tools/tester_viewer.mjs` reads `testcases/**/*.case.json` and summarizes regression coverage.
- If the user has not explicitly passed `include_viewers`, explain the purpose and ask before generating; do not generate by default.
