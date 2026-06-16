# Functional Skill Methodology

Functional Skill is a pattern for maintaining complex agent skills. It breaks a large, hard-to-debug, hard-to-review `SKILL.md` into a thin orchestration layer and a set of local function contracts.

This pattern suits skills that need long-term maintenance and continuous iteration: product workflows, code generation workflows, review workflows, migration workflows, research workflows, and other multi-step agent workflows where regression is costly. By making the input, output, tests, and traces of each step explicit, iteration becomes more controllable.

Small one-off prompts usually do not need this pattern.

## Principles

- `SKILL.md` handles orchestration, not all the rules.
- Each `functions/*.md` file owns one function contract.
- Function inputs must come from external inputs, preceding function outputs, or declared references.
- Function outputs should be stable enough to test and trace.
- Shared references hold reusable policy, schema, and glossary.
- Deterministic parsing, formatting, validation, and file transformation belong in `scripts/`, not in fragile prompt steps.
- When reporting is enabled, logs should record real function input, output, conclusion, duration, and token estimate.
- Testcases should come from both hand-written examples and real traces.

## Recommended Structure

```text
SKILL.md
functions/
  load_input.md
  extract_requirements.md
  generate_plan.md
references/
  shared-glossary.md
  policies.md
scripts/
  normalize_input.mjs
tools/
  log_viewer.mjs
  tester_viewer.mjs
testcases/
  unit/
logs/
  runs/
```

## Scripts

Scripts handle deterministic work that does not require model judgment. Suitable script tasks include:

- Parsing structured files;
- Normalizing whitespace or frontmatter;
- Validating schema-like objects;
- Converting trace records into test fixtures;
- Rendering predictable reports;
- Performing mechanical file transformations.

Model-dependent judgment stays in function contracts. Deterministic helpers go in `scripts/`, with the function contract describing how to invoke them, and script tests added for helpers with branching logic.

## Viewer Tools

Complex skills can optionally generate local viewers under `tools/`:

- `tools/log_viewer.mjs`: Reads `logs/runs/*.jsonl` and summarizes function run counts, warnings, durations, and token estimates.
- `tools/tester_viewer.mjs`: Reads `testcases/**/*.case.json` and summarizes regression cases, assertions, and function coverage.

Viewer tools are optional deterministic utilities. When creating or migrating a skill, if the user has not explicitly stated whether they are needed, explain their purpose and confirm before generating; do not generate by default.

## Iteration Loop

```text
Run skill → Check trace → Review function behavior → Export testcase → Update function → Run tests
```

This loop keeps changes local. A problem in a given function should become a testcase for that function, not a vague rewrite of the entire skill.

## Migration Strategy

Generate a reviewable proposal first:

1. Identify action-oriented sections in the legacy skill.
2. Convert those sections into candidate functions.
3. Move shared rules to `references/`.
4. Move duplicated or ambiguous terms to `references/shared-glossary.md`.
5. Before large-scale behavior changes, add tests from real runs.

The migrator should suggest structure; the final split requires human confirmation.
