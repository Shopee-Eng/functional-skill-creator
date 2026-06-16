# Functional Skill Creator

> **Maintain Agent Skills with functional programming discipline.**

[中文版 README](docs/README.zh-CN.md)

Functional Skill is an engineering methodology, **designed for complex Skill maintenance and iteration.**
Combined with trace logging and unit testing, it makes Skills **modular, traceable, and testable**:

- Treat each `Step` as a `Function` with explicit `Input/Output` (pure function first)
- `SKILL.md` only orchestrates the pipeline of `Function`s, consuming only `external inputs` and `reference dependencies`
- Shared rules across `Function`s go into `references/`
- Deterministic logic called by `Function`s becomes `scripts/`
- Add trace logging for every `Function`, running locally, recording input/output/token consumption/duration
- Equip every `Function` with unit tests and E2E tests, ensuring neither individual Functions nor the full pipeline regress

## Quick Start

### Install

```bash
npx skills add Shopee-Eng/functional-skill-creator --skill fskill-creator -y
```

Install via [skills.sh](https://skills.sh/). Add `-a <agent>` to target one agent; add `-g` only if it supports global install.

---

### Usage

**Create** — new functional skill from a workflow brief:

```text
/fskill-creator create a functional skill for <workflow>
```

**Migrate** — convert an existing legacy skill directory into a functional skill:

```text
/fskill-creator migrate <path-to-skill-dir>
```

The migrate lane reads the whole skill package — `SKILL.md`, `references/`, `scripts/`, and other companion files — not a single markdown file in isolation.

Optional: `include_report`, `include_unittest`, `include_viewers` (on by default; set to `false` to skip).

## Why

Your Skill is getting bloated.

As your Skill's capabilities iterate, your `SKILL.md` and `references/*.md` grow longer, rules pile up, edge cases get patched ever more finely — slowly turning into an unmaintainable wall of prose.

A typical example is when everything keeps getting stuffed into a handful of markdown files:

### Before: monolithic prose wall

```mermaid
flowchart TB
  subgraph mono["Monolithic Skill — tangled dependencies"]
    SKILL["SKILL.md<br/>Goal · Workflow · Rules · Output · Known issues"]
    W["Workflow + Step 1.5 patch"]
    RL["Rules · edge cases · stop rules"]
    OUT["Output handler · validation"]

    RULES["references/rules.md<br/>Terms · policies · snippets"]
    EX["references/examples.md<br/>Success · failures · workarounds"]

    S1["parse_input.js"]
    S2["parse_input_new.js"]
    S3["fix_edge_case_once.sh"]
    S4["migrate_old_do_not_delete.js"]
  end

  SKILL <--> W
  SKILL <--> RL
  W <--> RL
  RL <--> OUT
  SKILL <--> RULES
  RULES <--> EX
  EX <--> W
  OUT <--> EX
  W --> S1
  RL --> S2
  S1 <--> S2
  S2 --> S3
  S3 <--> EX
  OUT --> S4
  S4 <--> SKILL
  S3 <--> RL
  S1 --> OUT

  style mono fill:#fff5f5,stroke:#c53030
  style SKILL fill:#fde8e8,stroke:#c53030
  style W fill:#fde8e8,stroke:#c53030
  style RL fill:#fde8e8,stroke:#c53030
  style OUT fill:#fde8e8,stroke:#c53030
  style RULES fill:#fde8e8,stroke:#c53030
  style EX fill:#fde8e8,stroke:#c53030
  style S1 fill:#fde8e8,stroke:#c53030
  style S2 fill:#fde8e8,stroke:#c53030
  style S3 fill:#fde8e8,stroke:#c53030
  style S4 fill:#fde8e8,stroke:#c53030
```



Functional Skill Creator provides an engineering methodology that makes Skills **modular, traceable, and testable**:

- Break each step into a `Function` with explicit Input/Output
- `SKILL.md` only orchestrates the pipeline of `Function`s, consuming only `external inputs` and `reference dependencies`
- Shared rules across `Function`s go into `references/`
- Deterministic logic called by `Function`s becomes `scripts/`
- Add trace logging for every `Function`, running locally, recording input/output/token consumption/duration
- Equip every `Function` with unit tests and E2E tests, ensuring neither individual Functions nor the full pipeline regress

### After: observable functional pipeline

```mermaid
flowchart TB
  subgraph exec["execution — compose(f₄ ∘ f₃ ∘ f₂ ∘ f₁)"]
    direction LR
    ORCH["SKILL.md<br/>orchestration only"] --> F1["f₁ load_input<br/>(raw) → loaded"] --> F2["f₂ extract<br/>(loaded) → req"] --> F3["f₃ generate<br/>(req) → plan"] --> F4["f₄ validate<br/>(plan) → out"]
  end

  subgraph sup["supporting layers — read-only dependencies"]
    direction LR
    REF["references/"] --- SCR["scripts/"] --- TC["testcases/"] --- LOG["logs/runs/"]
  end

  exec --- sup

  style exec fill:#f0fff4,stroke:#2f855a,stroke-width:2px
  style sup fill:#ebf8ff,stroke:#2b6cb0,stroke-width:2px
  style ORCH fill:#e6ffed,stroke:#2f855a
  style F1 fill:#e6ffed,stroke:#2f855a
  style F2 fill:#e6ffed,stroke:#2f855a
  style F3 fill:#e6ffed,stroke:#2f855a
  style F4 fill:#e6ffed,stroke:#2f855a
  style REF fill:#ebf8ff,stroke:#2b6cb0
  style SCR fill:#ebf8ff,stroke:#2b6cb0
  style TC fill:#ebf8ff,stroke:#2b6cb0
  style LOG fill:#ebf8ff,stroke:#2b6cb0
```



Functional Skill does not aim to make Skills complex, but to put complexity where it belongs: judgment goes to Functions, rules go into references, deterministic actions go to scripts, and regression behavior solidifies into testcases.

## When to Use

- You are maintaining a long-evolving agent skill and don't want to rely on gut feeling for every regression check.
- Your `SKILL.md` and `references/` have become impossible to maintain manually, leaving you no choice but to blindly let AI iterate down one path.
- You want to extract deterministic work like parsing, formatting, and validation from prompts and execute them reliably through scripts.
- You want your skill's functionality and execution flow to become traceable, so you can pinpoint exactly where each run went wrong.
- You want your skill to capture real failure cases and ideal runs, turning them into repeatable test suites.

In other words, if your Skill is concise, or you've already split it cleanly in a modular way and are confident it's maintainable — you don't need to make it Functional.

## Report Log and Unittest Capabilities

Skills generated by `fskill-creator` include basic report / unittest tooling by default. Use `include_report=false` and `include_unittest=false` to disable them separately, or use `include_viewers=true|false` to control whether local viewers are generated.

- `scripts/report.mjs`: Writes function-level report logs, supports `report_mode=off|local|remote`.
- `scripts/runtime.mjs`: Exports `runStep`, `writeStepReport`, and `applyReportMode` for wrapping each Step in the function workflow.
- `scripts/test_report.mjs`: Validates that the report runtime can write JSONL and checks sensitive field redaction.
- `scripts/test_cases.mjs`: Runs `testcases/**/*.case.json` function input/output assertions, and can also export trace records as testcases.
- `logs/runs/`: JSONL traces written when `report_mode=local`.

## Iteration Loop

Functional Skill encourages turning real execution traces into regression assets:

```text
Run skill → Check trace → Review function behavior → Export testcase → Fix function → Run tests
```

If `Function1` fails, add a testcase for `Function1`;
if `normalize_input` is deterministic logic, push it down into `scripts/` and write a script test.
Problems stay at the layer where they occur — maintenance cost does not spread across the entire skill.

See methodology details in [docs/functional-skill.md](docs/functional-skill.md). Function contract specification in [docs/function-contract.md](docs/function-contract.md). When to put logic into `scripts/` in [docs/scripting.md](docs/scripting.md). Testing and trace in [docs/testing.md](docs/testing.md) and [docs/observability.md](docs/observability.md).

## Repository Structure

```text
skills/
  fskill-creator/        Create, maintain, or migrate functional skills
    sub-skills/
      create/            Form create_context from requirement brief
      migrate/           Form migration_context from a legacy skill directory
docs/                    Methodology and specifications
templates/               Reusable skill templates
examples/                Runnable functional skill examples
```

## Project Status

Currently `v0.1.0 alpha`. File formats and script conventions are usable, but may still adjust before 1.0.

This project does not bind to any agent platform, model vendor, or workflow engine. The built-in testcase runner is a runtime-agnostic assertion engine — it only validates output, does not execute agents or call models.

## Contributing

Issues and PRs welcome. See [CONTRIBUTING.md](CONTRIBUTING.md) for development guide. For security-sensitive submissions, please read [SECURITY.md](SECURITY.md) first.

## License

MIT. See [LICENSE](LICENSE).