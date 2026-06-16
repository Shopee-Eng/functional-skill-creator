import assert from 'node:assert/strict';
import { mkdir, readdir, readFile, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';

async function pathExists(filePath) {
  try {
    await stat(filePath);
    return true;
  } catch {
    return false;
  }
}

async function walk(dirPath) {
  if (!(await pathExists(dirPath))) return [];
  const entries = await readdir(dirPath, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const child = path.join(dirPath, entry.name);
    if (entry.isDirectory()) files.push(...await walk(child));
    if (entry.isFile() && entry.name.endsWith('.case.json')) files.push(child);
  }
  return files;
}

function hasOwn(object, key) {
  return Object.prototype.hasOwnProperty.call(object, key);
}

function actualOutputFor(testCaseData) {
  if (hasOwn(testCaseData, 'actual_output')) return { source: 'actual_output', value: testCaseData.actual_output };
  if (hasOwn(testCaseData, 'mock_output')) return { source: 'mock_output', value: testCaseData.mock_output };
  return { source: 'expected_output', value: testCaseData.expected_output ?? {} };
}

function getPathValue(context, expression) {
  const normalized = String(expression || '').replace(/\[(\d+)\]/g, '.$1');
  const [root, ...segments] = normalized.split('.').filter(Boolean);
  let current = context[root];
  for (const segment of segments) {
    if (current == null) return undefined;
    current = current[segment];
  }
  return current;
}

function defaultAssertions() {
  return [{ type: 'deep_equal', actual: 'output', expected: 'expected_output' }];
}

export function evaluateAssertion(assertion, context) {
  const type = assertion.type || 'deep_equal';
  const actual = getPathValue(context, assertion.actual || 'output');
  const expected = getPathValue(context, assertion.expected || 'expected_output');
  try {
    if (type === 'deep_equal') {
      assert.deepStrictEqual(actual, expected);
    } else if (type === 'equal' || type === 'strict_equal') {
      assert.strictEqual(actual, expected);
    } else if (type === 'contains') {
      if (typeof actual === 'string') {
        assert.ok(actual.includes(String(expected)));
      } else if (Array.isArray(actual)) {
        assert.ok(actual.some((item) => {
          try {
            assert.deepStrictEqual(item, expected);
            return true;
          } catch {
            return false;
          }
        }));
      } else {
        throw new Error('contains assertion requires a string or array actual value');
      }
    } else if (type === 'matches') {
      assert.match(String(actual), new RegExp(String(expected)));
    } else {
      throw new Error(`Unsupported assertion type: ${type}`);
    }
    return { ok: true, type, actual: assertion.actual || 'output', expected: assertion.expected || 'expected_output' };
  } catch (error) {
    return {
      ok: false,
      type,
      actual: assertion.actual || 'output',
      expected: assertion.expected || 'expected_output',
      message: error.message
    };
  }
}

export async function loadTestcases(rootDir) {
  const baseDir = path.join(rootDir, 'testcases');
  const files = await walk(baseDir);
  const cases = [];
  for (const file of files) {
    cases.push({ file, data: JSON.parse(await readFile(file, 'utf8')) });
  }
  return cases;
}

export async function runTestcases(rootDir) {
  const cases = await loadTestcases(rootDir);
  const results = cases.map((testCase) => {
    const actualOutput = actualOutputFor(testCase.data);
    const expectedOutput = testCase.data.expected_output ?? {};
    const assertionResults = (testCase.data.assertions?.length ? testCase.data.assertions : defaultAssertions())
      .map((assertion) => evaluateAssertion(assertion, {
        input: testCase.data.input ?? {},
        output: actualOutput.value,
        actual_output: actualOutput.value,
        mock_output: actualOutput.value,
        expected_output: expectedOutput
      }));
    return {
      file: path.relative(rootDir, testCase.file),
      ok: assertionResults.every((assertion) => assertion.ok),
      function_name: testCase.data.function_name,
      actual_source: actualOutput.source,
      assertions: assertionResults
    };
  });
  return { ok: results.every((result) => result.ok), count: results.length, results };
}

export async function exportCaseFromRecord(record, outDir) {
  const testCase = {
    schema_version: '0.1.0',
    kind: 'functional_skill_testcase',
    case_id: `${record.skill || 'skill'}__${record.function_name || 'function'}__${record.run_id || 'run'}`,
    skill: record.skill || 'unknown',
    function_name: record.function_name || 'unknown',
    input: record.input_snapshot ?? {},
    actual_output: record.output_snapshot ?? {},
    expected_output: record.output_snapshot ?? {},
    source_trace: { run_id: record.run_id, created_at: record.created_at },
    assertions: defaultAssertions()
  };
  await mkdir(outDir, { recursive: true });
  const filePath = path.join(outDir, `${testCase.case_id.replace(/[^a-zA-Z0-9_.-]+/g, '_')}.case.json`);
  await writeFile(filePath, `${JSON.stringify(testCase, null, 2)}\n`);
  return filePath;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const dir = path.resolve(process.argv[2] || '.');
  runTestcases(dir)
    .then((result) => {
      process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
      if (!result.ok) process.exitCode = 1;
    })
    .catch((error) => {
      console.error(error.message);
      process.exitCode = 1;
    });
}
