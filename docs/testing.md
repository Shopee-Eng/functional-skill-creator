# Testing Functional Skills

Functional skill testing should focus on function contracts, not complete agent personality.

The built-in runner is runtime-agnostic. It validates whether `actual_output` or `mock_output` matches `expected_output`; it does not execute agents, call models, or interpret markdown functions.

## Unit Cases

A unit case captures a function input and expected output:

```json
{
  "schema_version": "0.1.0",
  "kind": "functional_skill_testcase",
  "function_name": "extract_requirements",
  "input": {},
  "mock_output": {},
  "expected_output": {},
  "assertions": [
    {
      "type": "deep_equal",
      "actual": "output",
      "expected": "expected_output"
    }
  ]
}
```

Supported assertion types:

- `deep_equal`: Compare objects and arrays by value.
- `equal` or `strict_equal`: Compare primitive values using strict equality.
- `contains`: Require that a string contains a substring, or an array contains an item.
- `matches`: Require that a string matches a regular expression.

## Trace To Testcase

Valuable traces can become regression cases:

```bash
node skills/fskill-creator/scripts/test_cases.mjs .
```

This way every fixed behavior becomes a case that guards future iterations. The trace-to-testcase conversion can be maintained as a deterministic helper in a specific skill's `scripts/`.

## Script Tests

If scripts contain branching logic or data transformations, they should have regular code tests. Tests live alongside their scripts:

```text
scripts/
  normalize_input.mjs
  normalize_input.test.mjs
```

Run example script tests:

```bash
npm run test:example-scripts
```

Script tests and functional testcases complement each other. Deterministic code behavior uses script tests; function input/output contracts use functional testcases.

## Testcase Viewer

If a skill has generated optional viewer tools, run `node tools/tester_viewer.mjs .` to view a local summary of `testcases/**/*.case.json`, including the number of regression cases and assertions per function. The viewer is for maintaining test coverage and does not execute agents or call models.
