import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm, stat } from 'node:fs/promises';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { createFunctionalSkill, normalizeSkillName } from './init_skill.mjs';
import { lintFunctionalSkill } from './lint_skill.mjs';

const execFileAsync = promisify(execFile);

test('规范化 skill 名称', () => {
  assert.equal(normalizeSkillName('My Functional Skill'), 'my-functional-skill');
  assert.equal(normalizeSkillName('loadSpecDiff'), 'load-spec-diff');
});

test('创建并 lint functional skill', async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'fskill-init-'));
  try {
    await createFunctionalSkill(dir, { name: 'demo-skill' });
    await stat(path.join(dir, 'scripts/report.mjs'));
    await stat(path.join(dir, 'scripts/runtime.mjs'));
    await stat(path.join(dir, 'scripts/test_report.mjs'));
    await stat(path.join(dir, 'scripts/test_cases.mjs'));
    await stat(path.join(dir, 'tools/log_viewer.mjs'));
    await stat(path.join(dir, 'tools/tester_viewer.mjs'));
    await execFileAsync(process.execPath, [path.join(dir, 'scripts/test_report.mjs')], { cwd: dir });
    await execFileAsync(process.execPath, [path.join(dir, 'scripts/test_cases.mjs'), dir], { cwd: dir });
    const result = await lintFunctionalSkill(dir);
    assert.equal(result.ok, true);
    assert.equal(result.functionCount, 1);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('report 和 unittest 能力分别携带对应 viewer', async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'fskill-init-viewers-'));
  try {
    const result = await createFunctionalSkill(dir, { name: 'demo-skill' });
    assert.ok(result.created.includes('tools/log_viewer.mjs'));
    assert.ok(result.created.includes('tools/tester_viewer.mjs'));
    const logViewerPath = path.join(dir, 'tools/log_viewer.mjs');
    const testerViewerPath = path.join(dir, 'tools/tester_viewer.mjs');
    await stat(logViewerPath);
    await stat(testerViewerPath);
    const logViewer = await import(pathToFileURL(logViewerPath));
    const testerViewer = await import(pathToFileURL(testerViewerPath));
    assert.deepEqual(await logViewer.summarizeLogs(dir), {
      file_count: 0,
      record_count: 0,
      functions: {},
      warnings: 0,
      errors: 0
    });
    assert.deepEqual(await testerViewer.summarizeTestcases(dir), {
      file_count: 0,
      assertion_count: 0,
      functions: {},
      invalid_cases: []
    });
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('可以关闭 report 和 unittest 能力文件', async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'fskill-init-minimal-'));
  try {
    const result = await createFunctionalSkill(dir, {
      name: 'minimal-skill',
      includeReport: false,
      includeUnittest: false
    });
    assert.ok(!result.created.includes('scripts/report.mjs'));
    assert.ok(!result.created.includes('scripts/runtime.mjs'));
    assert.ok(!result.created.includes('scripts/test_report.mjs'));
    assert.ok(!result.created.includes('scripts/test_cases.mjs'));
    assert.ok(!result.created.includes('tools/log_viewer.mjs'));
    assert.ok(!result.created.includes('tools/tester_viewer.mjs'));
    await assert.rejects(() => stat(path.join(dir, 'scripts/report.mjs')));
    await assert.rejects(() => stat(path.join(dir, 'scripts/test_cases.mjs')));
    await assert.rejects(() => stat(path.join(dir, 'tools/log_viewer.mjs')));
    await assert.rejects(() => stat(path.join(dir, 'tools/tester_viewer.mjs')));
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
