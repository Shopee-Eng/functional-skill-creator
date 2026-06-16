# Function Contract

A Function contract describes one step in a functional skill. It should be small enough for local review, and stable enough to be tested.

## Required Sections

```text
# function_name

## Purpose
## Input
## Output
## Logic
## Errors
## Observability
```

## Input Rules

Every input must be traceable to one of the following sources:

- User input;
- System or repository environment;
- Output of a preceding function;
- A declared reference.

If a value cannot be traced to any of these sources, the function must not fabricate it.

## Output Rules

Output should be explicit object fields. If an output becomes a handoff shared across multiple skills, add its stable semantics to `references/shared-glossary.md`.

## Script Rules

If a function needs deterministic logic, document the script helper in the function contract rather than describing a fragile manual procedure.

The following are suitable for scripts:

- Does not require model judgment, and is repeatable;
- Easier to verify with code tests than with prose;
- May be reused by multiple functions;
- Responsible for mechanical parsing, formatting, validation, or file transformation.

The function contract should state the script path, expected input, expected output, and fallback behavior when the script cannot run.
