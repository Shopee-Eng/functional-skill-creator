# Script Rules

Use `scripts/` to preserve deterministic legacy behavior as code rather than fragile prompt instructions.

## When to Migrate to Scripts

- Legacy skill describes mechanical parsing, formatting, or validation;
- A step must produce consistent results across every run;
- The behavior has clear input and output objects;
- Existing examples can become script tests;
- Logic is shared across multiple migrated functions.

## When to Keep in Function Contracts

- The step requires model judgment;
- Source behavior is ambiguous and needs human review;
- Deciding function boundaries or domain tradeoffs;
- Output is user-facing prose.

## Migration Requirements

Each migrated script must preserve or record:

- Source section or legacy script path;
- Input object or file scope;
- Output object or file changes;
- Failure behavior;
- Script tests or reason tests are deferred.

## Viewer Tools

`tools/` is for optional local viewers in the migrated skill and does not carry legacy behavior that must be preserved.

- `tools/log_viewer.mjs` reads `logs/runs/*.jsonl` and summarizes function traces.
- `tools/tester_viewer.mjs` reads `testcases/**/*.case.json` and summarizes regression coverage.
- If the user has not explicitly passed `include_viewers`, explain the purpose and ask before generating; do not generate by default.
