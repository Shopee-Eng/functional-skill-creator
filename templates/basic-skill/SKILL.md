---
name: basic-functional-skill
description: Starter template for a functional agent skill.
---

# basic-functional-skill

## Goal

Describe the workflow this skill is responsible for.

## Principles

- `SKILL.md` only handles orchestration.
- `functions/*.md` defines local function contracts.
- `references/*.md` defines shared rules and terminology.
- `scripts/*.mjs` carries deterministic helper logic.
- Tests and traces support controllable iteration.

## References

| Resource | Load Timing | Purpose |
|---|---|---|
| `shared_glossary` | On demand | Shared terminology and stable field semantics. |

## External Inputs

| Field | Source | Description |
|---|---|---|
| `input` | user | Replace with concrete workflow input. |

## Execution Pipeline

| Step | Function | Purpose | Input | Output |
|---:|---|---|---|---|
| 1 | `example_function` | Replace with a real function. | `input` | `output` |

## Output Scope

Describe what files, data, or artifacts this skill may create or modify.
