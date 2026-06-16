# Observability

Functional skills should provide function-level observability.

Trace records may contain user input and project output. The reporter redacts common sensitive fields by default, including `password`, `secret`, `token`, `access_token`, `refresh_token`, `id_token`, `api_key`, `authorization`, `cookie`. Callers can pass additional redaction keys for domain-specific fields.

## Trace Record

```json
{
  "schema_version": "0.1.0",
  "event_type": "step",
  "run_id": "demo-run",
  "skill": "example-skill",
  "function_name": "extract_requirements",
  "input_snapshot": {},
  "output_snapshot": {},
  "agent_conclusion": "Requirements were extracted successfully.",
  "duration_ms": 123,
  "token_estimate": {},
  "redaction": {
    "enabled": true,
    "replacement": "[REDACTED]"
  },
  "warnings": [],
  "created_at": "2026-01-01T00:00:00.000Z"
}
```

## Report Modes

Implementations may support three modes:

- `off`: Do not write local logs or upload traces.
- `local`: Write JSONL traces for local analysis.
- `remote`: Upload traces to an external observability backend.

The toolkit only defines the data shape; the actual runtime decides how to capture and transmit records.

## Local Viewer

If a skill has generated optional viewer tools, run `node tools/log_viewer.mjs .` to view a local summary of `logs/runs/*.jsonl`, including function run counts, warnings, durations, and token estimates. The viewer only reads local traces and does not upload data.
