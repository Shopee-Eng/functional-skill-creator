import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { evaluateAssertion, runTestcases } from './test_cases.mjs';

test('运行 explicit testcase assertions', async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'fskill-cases-'));
  try {
    const caseDir = path.join(dir, 'testcases/unit');
    await mkdir(caseDir, { recursive: true });
    await writeFile(path.join(caseDir, 'sample.case.json'), JSON.stringify({
      schema_version: '0.1.0',
      kind: 'functional_skill_testcase',
      function_name: 'extract_items',
      input: {},
      mock_output: { items: [{ owner: 'Alice' }] },
      expected_output: { items: [{ owner: 'Alice' }] },
      assertions: [
        { type: 'equal', actual: 'output.items[0].owner', expected: 'expected_output.items[0].owner' }
      ]
    }, null, 2));
    const result = await runTestcases(dir);
    assert.equal(result.ok, true);
    assert.equal(result.count, 1);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('返回 failed assertion details', () => {
  const result = evaluateAssertion(
    { type: 'equal', actual: 'output.owner', expected: 'expected_output.owner' },
    { output: { owner: 'Alice' }, expected_output: { owner: 'Bob' } }
  );
  assert.equal(result.ok, false);
  assert.match(result.message, /Alice/);
});
