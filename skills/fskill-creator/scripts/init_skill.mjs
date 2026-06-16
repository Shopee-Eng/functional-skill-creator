import { mkdir, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';

export const REQUIRED_DIRS = [
  'functions',
  'references',
  'scripts',
  'testcases/unit',
  'logs/runs'
];

export function normalizeSkillName(name) {
  return String(name || '')
    .trim()
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();
}

async function pathExists(filePath) {
  try {
    await stat(filePath);
    return true;
  } catch {
    return false;
  }
}

async function ensureDir(dirPath) {
  await mkdir(dirPath, { recursive: true });
}

async function writeFileIfMissing(filePath, content) {
  if (await pathExists(filePath)) return false;
  await ensureDir(path.dirname(filePath));
  await writeFile(filePath, content);
  return true;
}

export function functionContractTemplate(functionName) {
  return [
    `# ${functionName}`,
    '',
    '## Purpose',
    '',
    '描述这个 function 的单一职责。',
    '',
    '## Input',
    '',
    '| Field | Required | Description |',
    '|---|---:|---|',
    '| `input` | yes | 替换成具体输入字段。 |',
    '',
    '## Output',
    '',
    '| Field | Description |',
    '|---|---|',
    '| `output` | 替换成具体输出字段。 |',
    '',
    '## Logic',
    '',
    '1. 只读取已声明 inputs 和 references。',
    '2. 只产出已声明 outputs。',
    '3. 对缺失事实返回 blocking errors，不要静默编造。',
    '4. 如果步骤是确定性 parsing、formatting、validation 或 file transformation，优先放进 `scripts/` 并在这里说明调用方式。',
    '',
    '## Errors',
    '',
    '| Code | When |',
    '|---|---|',
    '| `[MISSING_INPUT]` | 缺少必需输入。 |',
    '',
    '## Observability',
    '',
    '记录包含真实 `input_snapshot`、`output_snapshot`、`duration_ms` 和 `agent_conclusion` 的 step event。',
    ''
  ].join('\n');
}

export function skillTemplate(skillName) {
  return [
    '---',
    `name: ${skillName}`,
    'description: 一个 functional agent skill。',
    '---',
    '',
    `# ${skillName}`,
    '',
    '## Goal',
    '',
    '描述这个 skill 做什么，以及必须不做什么。',
    '',
    '## Principles',
    '',
    '- `SKILL.md` 只负责编排 pipeline。',
    '- Function behavior 放在 `functions/*.md`。',
    '- Shared vocabulary 和 policies 放在 `references/*.md`。',
    '- 确定性 helper logic 放在 `scripts/`。',
    '- 每个 function 只消费已声明 inputs，并只返回已声明 outputs。',
    '',
    '## References',
    '',
    '| Resource | Load Timing | Purpose |',
    '|---|---|---|',
    '| `shared_glossary` | On demand | 共享术语和稳定字段语义。 |',
    '',
    '## External Inputs',
    '',
    '| Field | Source | Description |',
    '|---|---|---|',
    '| `project_path` | user | 目标项目路径。 |',
    '| `report_mode` | user | `off`、`local` 或 `remote`；默认 `off`。 |',
    '',
    '## Execution Pipeline',
    '',
    '| Step | Function | Purpose | Input | Output |',
    '|---:|---|---|---|---|',
    '| 1 | `example_function` | 替换成真实 function。 | `project_path` | `example_result` |',
    '',
    '## Output Scope',
    '',
    '说明这个 skill 可以创建或修改的具体 files 或 artifacts。',
    ''
  ].join('\n');
}

export function reportTemplate() {
  return [
    "import { appendFile, mkdir } from 'node:fs/promises';",
    "import path from 'node:path';",
    '',
    "const SECRET_KEY_PATTERN = /(password|secret|token|access_token|refresh_token|id_token|api_key|authorization|cookie)/i;",
    'const MAX_DEPTH = 8;',
    'const MAX_STRING = 4000;',
    'const CHARS_PER_TOKEN = 4;',
    '',
    "export function applyReportMode(reportMode) {",
    '  if (reportMode === undefined || reportMode === null || reportMode === \'\') return;',
    '  const mode = String(reportMode).toLowerCase();',
    "  if (!['off', 'local', 'remote'].includes(mode)) throw new Error(`Invalid report_mode: ${reportMode}`);",
    '  process.env.report_mode = mode;',
    '}',
    '',
    'export function createReporter({ skillName, skillRoot }) {',
    "  if (!skillName) throw new Error('createReporter requires skillName');",
    "  if (!skillRoot) throw new Error('createReporter requires skillRoot');",
    '',
    '  async function writeStepReport({ functionName, step = null, input = {}, output = {}, status = \'success\', durationMs = null, agentConclusion = \'\' }) {',
    '    const record = buildRecord({ skillName, functionName, step, input, output, status, durationMs, agentConclusion });',
    '    await emitRecord(record, skillRoot);',
    '    return record;',
    '  }',
    '',
    '  async function runStep({ functionName, step = null, input = {}, execute, agentConclusion = \'\' }) {',
    '    const startedAt = Date.now();',
    '    try {',
    '      const output = await execute(input);',
    '      await writeStepReport({ functionName, step, input, output, durationMs: Date.now() - startedAt, agentConclusion: resolveConclusion(agentConclusion, output) });',
    '      return output;',
    '    } catch (error) {',
    "      const output = { errors: [error.code || '[STEP_ERROR]'], message: error.message };",
    "      await writeStepReport({ functionName, step, input, output, status: 'error', durationMs: Date.now() - startedAt, agentConclusion: `${functionName} failed: ${error.message}` });",
    '      throw error;',
    '    }',
    '  }',
    '',
    '  return { writeStepReport, runStep };',
    '}',
    '',
    'function buildRecord({ skillName, functionName, step, input, output, status, durationMs, agentConclusion }) {',
    '  const inputSnapshot = snapshot(input);',
    '  const outputSnapshot = snapshot(output);',
    '  return {',
    "    schema_version: '0.1.0',",
    "    event_type: 'step',",
    '    run_id: process.env.FSKILL_RUN_ID || defaultRunId(),',
    '    skill: skillName,',
    '    function_name: functionName,',
    '    step: step === undefined || step === null ? null : String(step),',
    '    input_snapshot: inputSnapshot,',
    '    output_snapshot: outputSnapshot,',
    '    agent_conclusion: agentConclusion || null,',
    '    duration_ms: durationMs,',
    '    token_estimate: estimateTokenUsage(inputSnapshot, outputSnapshot, agentConclusion),',
    "    redaction: { enabled: true, replacement: '[REDACTED]' },",
    '    warnings: collectWarnings(outputSnapshot),',
    '    status,',
    '    created_at: new Date().toISOString()',
    '  };',
    '}',
    '',
    'async function emitRecord(record, skillRoot) {',
    "  const mode = String(process.env.report_mode || 'off').toLowerCase();",
    "  if (mode === 'off') return;",
    "  if (mode === 'local') {",
    "    const dir = path.resolve(process.env.FSKILL_REPORT_DIR || path.join(skillRoot, 'logs', 'runs'));",
    '    await mkdir(dir, { recursive: true });',
    "    await appendFile(path.join(dir, `${record.created_at.slice(0, 10)}.jsonl`), `${JSON.stringify(record)}\\n`, 'utf8');",
    '  }',
    "  if (mode === 'remote') await uploadRecord(record);",
    '}',
    '',
    'async function uploadRecord(record) {',
    '  const endpoint = process.env.FSKILL_REPORT_ENDPOINT;',
    "  if (!endpoint || typeof fetch !== 'function') return;",
    '  await fetch(endpoint, {',
    "    method: 'POST',",
    "    headers: { 'content-type': 'application/json' },",
    '    body: JSON.stringify(record)',
    '  });',
    '}',
    '',
    'function snapshot(value, depth = 0, key = \'\') {',
    "  if (SECRET_KEY_PATTERN.test(key)) return '[REDACTED]';",
    "  if (depth > MAX_DEPTH) return '[TRUNCATED_DEPTH]';",
    '  if (typeof value === \'string\') return value.length > MAX_STRING ? `${value.slice(0, MAX_STRING)}...[TRUNCATED_STRING:${value.length}]` : value;',
    "  if (value === null || typeof value !== 'object') return value;",
    '  if (Array.isArray(value)) return value.map((item) => snapshot(item, depth + 1, key));',
    '  return Object.fromEntries(Object.entries(value).map(([childKey, childValue]) => [childKey, snapshot(childValue, depth + 1, childKey)]));',
    '}',
    '',
    'function estimateTokenUsage(inputSnapshot, outputSnapshot, agentConclusion) {',
    '  const inputChars = JSON.stringify(inputSnapshot ?? {}).length;',
    '  const outputChars = JSON.stringify(outputSnapshot ?? {}).length;',
    '  const conclusionChars = JSON.stringify(agentConclusion || \'\').length;',
    '  const total = Math.ceil((inputChars + outputChars + conclusionChars) / CHARS_PER_TOKEN);',
    "  return { type: 'estimated', method: 'json_chars_div_4', total, total_tokens: total };",
    '}',
    '',
    'function collectWarnings(value) {',
    '  const warnings = [];',
    '  visit(value, (node) => {',
    '    if (node && typeof node === \'object\' && Array.isArray(node.warnings)) warnings.push(...node.warnings.filter((item) => typeof item === \'string\'));',
    '  });',
    '  return [...new Set(warnings)];',
    '}',
    '',
    'function visit(value, visitor) {',
    '  visitor(value);',
    "  if (!value || typeof value !== 'object') return;",
    '  for (const child of Array.isArray(value) ? value : Object.values(value)) visit(child, visitor);',
    '}',
    '',
    'function resolveConclusion(agentConclusion, output) {',
    "  return typeof agentConclusion === 'function' ? agentConclusion(output) : agentConclusion;",
    '}',
    '',
    'function defaultRunId() {',
    "  return `${new Date().toISOString().replace(/[:.]/g, '-')}-${process.pid}`;",
    '}',
    ''
  ].join('\n');
}

export function runtimeTemplate(skillName) {
  return [
    "import path from 'node:path';",
    "import { fileURLToPath } from 'node:url';",
    "import { applyReportMode, createReporter } from './report.mjs';",
    '',
    "const skillRoot = path.resolve(fileURLToPath(new URL('..', import.meta.url)));",
    `const reporter = createReporter({ skillName: '${skillName}', skillRoot });`,
    '',
    'export const { runStep, writeStepReport } = reporter;',
    'export { applyReportMode };',
    ''
  ].join('\n');
}

export function reportTestTemplate(skillName) {
  return [
    "import assert from 'node:assert/strict';",
    "import { mkdtemp, readFile, rm, readdir } from 'node:fs/promises';",
    "import os from 'node:os';",
    "import path from 'node:path';",
    "import { runStep } from './runtime.mjs';",
    '',
    "const tmp = await mkdtemp(path.join(os.tmpdir(), 'fskill-report-'));",
    "process.env.report_mode = 'local';",
    'process.env.FSKILL_REPORT_DIR = tmp;',
    "process.env.FSKILL_RUN_ID = 'test-run';",
    '',
    'try {',
    '  const output = await runStep({',
    "    step: 1,",
    "    functionName: 'example_function',",
    "    input: { text: 'hello', token: 'secret-token' },",
    "    execute: async (input) => ({ result: input.text, warnings: ['[TEST_WARNING]'] }),",
    "    agentConclusion: (result) => `returned ${result.result}`",
    '  });',
    "  assert.equal(output.result, 'hello');",
    "  const files = (await readdir(tmp)).filter((file) => file.endsWith('.jsonl'));",
    '  assert.equal(files.length, 1);',
    "  const record = JSON.parse((await readFile(path.join(tmp, files[0]), 'utf8')).trim());",
    `  assert.equal(record.skill, '${skillName}');`,
    "  assert.equal(record.function_name, 'example_function');",
    "  assert.equal(record.input_snapshot.token, '[REDACTED]');",
    "  assert.deepEqual(record.warnings, ['[TEST_WARNING]']);",
    '  assert.ok(record.token_estimate.total > 0);',
    '} finally {',
    '  delete process.env.report_mode;',
    '  delete process.env.FSKILL_REPORT_DIR;',
    '  delete process.env.FSKILL_RUN_ID;',
    '  await rm(tmp, { recursive: true, force: true });',
    '}',
    '',
    "console.log('test_report: ok');",
    ''
  ].join('\n');
}

export function testCasesTemplate() {
  return [
    "import assert from 'node:assert/strict';",
    "import { readdir, readFile, writeFile, mkdir, stat } from 'node:fs/promises';",
    "import path from 'node:path';",
    '',
    'async function pathExists(filePath) {',
    '  try {',
    '    await stat(filePath);',
    '    return true;',
    '  } catch {',
    '    return false;',
    '  }',
    '}',
    '',
    'async function walk(dirPath) {',
    '  if (!(await pathExists(dirPath))) return [];',
    '  const entries = await readdir(dirPath, { withFileTypes: true });',
    '  const files = [];',
    '  for (const entry of entries) {',
    '    const child = path.join(dirPath, entry.name);',
    '    if (entry.isDirectory()) files.push(...await walk(child));',
    "    if (entry.isFile() && entry.name.endsWith('.case.json')) files.push(child);",
    '  }',
    '  return files;',
    '}',
    '',
    'function getPathValue(context, expression) {',
    "  const normalized = String(expression || '').replace(/\\[(\\d+)\\]/g, '.$1');",
    '  const [root, ...segments] = normalized.split(\'.\').filter(Boolean);',
    '  let current = context[root];',
    '  for (const segment of segments) {',
    '    if (current == null) return undefined;',
    '    current = current[segment];',
    '  }',
    '  return current;',
    '}',
    '',
    'function defaultAssertions() {',
    "  return [{ type: 'deep_equal', actual: 'output', expected: 'expected_output' }];",
    '}',
    '',
    'export function evaluateAssertion(assertion, context) {',
    "  const type = assertion.type || 'deep_equal';",
    "  const actual = getPathValue(context, assertion.actual || 'output');",
    "  const expected = getPathValue(context, assertion.expected || 'expected_output');",
    '  try {',
    "    if (type === 'deep_equal') assert.deepStrictEqual(actual, expected);",
    "    else if (type === 'equal' || type === 'strict_equal') assert.strictEqual(actual, expected);",
    "    else if (type === 'contains' && typeof actual === 'string') assert.ok(actual.includes(String(expected)));",
    "    else if (type === 'matches') assert.match(String(actual), new RegExp(String(expected)));",
    "    else throw new Error(`Unsupported assertion type: ${type}`);",
    "    return { ok: true, type, actual: assertion.actual || 'output', expected: assertion.expected || 'expected_output' };",
    '  } catch (error) {',
    "    return { ok: false, type, actual: assertion.actual || 'output', expected: assertion.expected || 'expected_output', message: error.message };",
    '  }',
    '}',
    '',
    'export async function runTestcases(rootDir = process.cwd()) {',
    "  const files = await walk(path.join(rootDir, 'testcases'));",
    '  const results = [];',
    '  for (const file of files) {',
    "    const data = JSON.parse(await readFile(file, 'utf8'));",
    '    const output = Object.prototype.hasOwnProperty.call(data, \'actual_output\') ? data.actual_output : (data.mock_output ?? data.expected_output ?? {});',
    '    const expectedOutput = data.expected_output ?? {};',
    '    const assertions = (data.assertions?.length ? data.assertions : defaultAssertions()).map((assertion) => evaluateAssertion(assertion, {',
    '      input: data.input ?? {},',
    '      output,',
    '      actual_output: output,',
    '      mock_output: output,',
    '      expected_output: expectedOutput',
    '    }));',
    '    results.push({ file: path.relative(rootDir, file), ok: assertions.every((item) => item.ok), function_name: data.function_name, assertions });',
    '  }',
    '  return { ok: results.every((item) => item.ok), count: results.length, results };',
    '}',
    '',
    'export async function exportCaseFromRecord(record, outDir) {',
    '  const testCase = {',
    "    schema_version: '0.1.0',",
    "    kind: 'functional_skill_testcase',",
    "    case_id: `${record.skill || 'skill'}__${record.function_name || 'function'}__${record.run_id || 'run'}`,",
    "    skill: record.skill || 'unknown',",
    "    function_name: record.function_name || 'unknown',",
    '    input: record.input_snapshot ?? {},',
    '    actual_output: record.output_snapshot ?? {},',
    '    expected_output: record.output_snapshot ?? {},',
    '    source_trace: { run_id: record.run_id, created_at: record.created_at },',
    '    assertions: defaultAssertions()',
    '  };',
    '  await mkdir(outDir, { recursive: true });',
    "  const filePath = path.join(outDir, `${testCase.case_id.replace(/[^a-zA-Z0-9_.-]+/g, '_')}.case.json`);",
    "  await writeFile(filePath, `${JSON.stringify(testCase, null, 2)}\\n`);",
    '  return filePath;',
    '}',
    '',
    "if (import.meta.url === `file://${process.argv[1]}`) {",
    "  runTestcases(path.resolve(process.argv[2] || '.'))",
    '    .then((result) => {',
    '      process.stdout.write(`${JSON.stringify(result, null, 2)}\\n`);',
    '      if (!result.ok) process.exitCode = 1;',
    '    })',
    '    .catch((error) => {',
    '      console.error(error.message);',
    '      process.exitCode = 1;',
    '    });',
    '}',
    ''
  ].join('\n');
}

export function logViewerTemplate() {
  return [
    "import { readdir, readFile, stat } from 'node:fs/promises';",
    "import { realpathSync } from 'node:fs';",
    "import path from 'node:path';",
    "import { fileURLToPath } from 'node:url';",
    '',
    'async function pathExists(filePath) {',
    '  try {',
    '    await stat(filePath);',
    '    return true;',
    '  } catch {',
    '    return false;',
    '  }',
    '}',
    '',
    'async function listJsonlFiles(dirPath) {',
    '  if (!(await pathExists(dirPath))) return [];',
    '  const entries = await readdir(dirPath, { withFileTypes: true });',
    '  const files = [];',
    '  for (const entry of entries) {',
    '    const fullPath = path.join(dirPath, entry.name);',
    '    if (entry.isDirectory()) files.push(...await listJsonlFiles(fullPath));',
    "    if (entry.isFile() && entry.name.endsWith('.jsonl')) files.push(fullPath);",
    '  }',
    '  return files;',
    '}',
    '',
    'function sameFile(left, right) {',
    '  if (!left || !right) return false;',
    '  try {',
    '    return realpathSync(left) === realpathSync(right);',
    '  } catch {',
    '    return path.resolve(left) === path.resolve(right);',
    '  }',
    '}',
    '',
    'export async function summarizeLogs(skillRoot = process.cwd()) {',
    "  const logDir = path.join(skillRoot, 'logs', 'runs');",
    '  const files = await listJsonlFiles(logDir);',
    '  const summary = { file_count: files.length, record_count: 0, functions: {}, warnings: 0, errors: 0 };',
    '  for (const file of files) {',
    "    const lines = (await readFile(file, 'utf8')).split(/\\r?\\n/).filter(Boolean);",
    '    for (const line of lines) {',
    '      let record;',
    '      try {',
    '        record = JSON.parse(line);',
    '      } catch {',
    '        summary.errors += 1;',
    '        continue;',
    '      }',
    '      summary.record_count += 1;',
    "      const functionName = record.function_name || 'unknown';",
    '      summary.functions[functionName] ||= { count: 0, duration_ms: 0, token_estimate: 0, warnings: 0 };',
    '      summary.functions[functionName].count += 1;',
    '      summary.functions[functionName].duration_ms += Number(record.duration_ms || 0);',
    '      summary.functions[functionName].token_estimate += Number(record.token_estimate?.total || record.token_estimate || 0);',
    '      const warningCount = Array.isArray(record.warnings) ? record.warnings.length : 0;',
    '      summary.functions[functionName].warnings += warningCount;',
    '      summary.warnings += warningCount;',
    '    }',
    '  }',
    '  return summary;',
    '}',
    '',
    "if (sameFile(fileURLToPath(import.meta.url), process.argv[1])) {",
    "  summarizeLogs(path.resolve(process.argv[2] || '.'))",
    '    .then((summary) => process.stdout.write(`${JSON.stringify(summary, null, 2)}\\n`))',
    '    .catch((error) => {',
    '      console.error(error.message);',
    '      process.exitCode = 1;',
    '    });',
    '}',
    ''
  ].join('\n');
}

export function testerViewerTemplate() {
  return [
    "import { readdir, readFile, stat } from 'node:fs/promises';",
    "import { realpathSync } from 'node:fs';",
    "import path from 'node:path';",
    "import { fileURLToPath } from 'node:url';",
    '',
    'async function pathExists(filePath) {',
    '  try {',
    '    await stat(filePath);',
    '    return true;',
    '  } catch {',
    '    return false;',
    '  }',
    '}',
    '',
    'async function listCaseFiles(dirPath) {',
    '  if (!(await pathExists(dirPath))) return [];',
    '  const entries = await readdir(dirPath, { withFileTypes: true });',
    '  const files = [];',
    '  for (const entry of entries) {',
    '    const fullPath = path.join(dirPath, entry.name);',
    '    if (entry.isDirectory()) files.push(...await listCaseFiles(fullPath));',
    "    if (entry.isFile() && entry.name.endsWith('.case.json')) files.push(fullPath);",
    '  }',
    '  return files;',
    '}',
    '',
    'function sameFile(left, right) {',
    '  if (!left || !right) return false;',
    '  try {',
    '    return realpathSync(left) === realpathSync(right);',
    '  } catch {',
    '    return path.resolve(left) === path.resolve(right);',
    '  }',
    '}',
    '',
    'export async function summarizeTestcases(skillRoot = process.cwd()) {',
    "  const testcaseDir = path.join(skillRoot, 'testcases');",
    '  const files = await listCaseFiles(testcaseDir);',
    '  const summary = { file_count: files.length, assertion_count: 0, functions: {}, invalid_cases: [] };',
    '  for (const file of files) {',
    '    try {',
    "      const testcase = JSON.parse(await readFile(file, 'utf8'));",
    "      const functionName = testcase.function_name || 'unknown';",
    '      const assertionCount = Array.isArray(testcase.assertions) ? testcase.assertions.length : 0;',
    '      summary.functions[functionName] ||= { case_count: 0, assertion_count: 0 };',
    '      summary.functions[functionName].case_count += 1;',
    '      summary.functions[functionName].assertion_count += assertionCount;',
    '      summary.assertion_count += assertionCount;',
    '    } catch (error) {',
    '      summary.invalid_cases.push({ file: path.relative(skillRoot, file), error: error.message });',
    '    }',
    '  }',
    '  return summary;',
    '}',
    '',
    "if (sameFile(fileURLToPath(import.meta.url), process.argv[1])) {",
    "  summarizeTestcases(path.resolve(process.argv[2] || '.'))",
    '    .then((summary) => process.stdout.write(`${JSON.stringify(summary, null, 2)}\\n`))',
    '    .catch((error) => {',
    '      console.error(error.message);',
    '      process.exitCode = 1;',
    '    });',
    '}',
    ''
  ].join('\n');
}

export async function createFunctionalSkill(rootDir, options = {}) {
  const skillName = options.name || normalizeSkillName(path.basename(rootDir));
  const includeReport = options.includeReport !== false;
  const includeUnittest = options.includeUnittest !== false;
  await ensureDir(rootDir);
  for (const dir of REQUIRED_DIRS) {
    await ensureDir(path.join(rootDir, dir));
  }
  const created = [];
  const files = [
    ['SKILL.md', skillTemplate(skillName)],
    ['references/shared-glossary.md', '# Shared Glossary\n\n| Term | Definition | Notes |\n|---|---|---|\n'],
    ['functions/example_function.md', functionContractTemplate('example_function')],
    ['testcases/unit/.gitkeep', ''],
    ['logs/runs/.gitkeep', '']
  ];
  if (includeReport) {
    files.push(
      ['scripts/report.mjs', reportTemplate()],
      ['scripts/runtime.mjs', runtimeTemplate(skillName)],
      ['scripts/test_report.mjs', reportTestTemplate(skillName)],
      ['tools/log_viewer.mjs', logViewerTemplate()]
    );
  }
  if (includeUnittest) {
    files.push(
      ['scripts/test_cases.mjs', testCasesTemplate()],
      ['tools/tester_viewer.mjs', testerViewerTemplate()]
    );
  }
  for (const [relativePath, content] of files) {
    const didCreate = await writeFileIfMissing(path.join(rootDir, relativePath), content);
    if (didCreate) created.push(relativePath);
  }
  return { rootDir, skillName, created };
}

function readFlag(args, name) {
  const index = args.indexOf(name);
  if (index === -1) return undefined;
  return args[index + 1];
}

function readBooleanFlag(args, name) {
  const value = readFlag(args, name);
  if (value === undefined) return undefined;
  if (['1', 'true', 'yes', 'y'].includes(String(value).toLowerCase())) return true;
  if (['0', 'false', 'no', 'n'].includes(String(value).toLowerCase())) return false;
  throw new Error(`${name} must be true or false.`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const dir = process.argv[2];
  if (!dir) {
    console.error('Usage: node scripts/init_skill.mjs <dir> [--name name] [--include-report true|false] [--include-unittest true|false]');
    process.exitCode = 1;
  } else {
    const args = process.argv.slice(3);
    createFunctionalSkill(path.resolve(dir), {
      name: readFlag(args, '--name'),
      includeReport: readBooleanFlag(args, '--include-report'),
      includeUnittest: readBooleanFlag(args, '--include-unittest')
    })
      .then((result) => process.stdout.write(`${JSON.stringify(result, null, 2)}\n`))
      .catch((error) => {
        console.error(error.message);
        process.exitCode = 1;
      });
  }
}
