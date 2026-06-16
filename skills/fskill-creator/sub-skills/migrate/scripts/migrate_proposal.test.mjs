import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {
  proposeMigration,
  proposeMigrationFromPackage,
  resolveSkillRoot,
  loadLegacySkillPackage
} from './migrate_proposal.mjs';

test('从 action sections 提取 function candidates', () => {
  const proposal = proposeMigration('# Skill\n\n## Step 1 Load Input\n\nText\n\n## Validate Output\n\nText');
  assert.equal(proposal.summary.function_candidate_count, 2);
  assert.deepEqual(proposal.suggested_structure.references, ['references/shared-glossary.md']);
});

test('从 pipeline table tokens 提取 function candidates', () => {
  const proposal = proposeMigration('| Step | Function |\n|---|---|\n| 1 | `load_meeting_notes` |\n| 2 | `extract_action_items` |\n| 3 | `draft_follow_up` |');
  assert.deepEqual(
    proposal.function_candidates.map((candidate) => candidate.suggested_function),
    ['load_meeting_notes', 'extract_action_items', 'draft_follow_up']
  );
});

test('按需建议 viewer tools', () => {
  const proposal = proposeMigration('# Skill\n\n## Step 1 Load Input\n\nText', { includeViewers: true });
  assert.deepEqual(proposal.suggested_structure.tools, [
    'tools/log_viewer.mjs',
    'tools/tester_viewer.mjs'
  ]);
  assert.ok(proposal.review_notes.some((note) => note.includes('log_viewer')));
});

test('从 legacy skill package 提取 companion files 与 preserve candidates', () => {
  const proposal = proposeMigrationFromPackage({
    skill_root: '/tmp/example-skill',
    markdown: '# Skill\n\n## Step 1 Load Input\n\nUse `action_item`.',
    companion_files: {
      references: ['references/rules.md'],
      scripts: ['scripts/normalize_input.mjs'],
      tools: ['tools/log_viewer.mjs'],
      testcases: ['testcases/unit/basic.case.json']
    },
    companion_contents: {
      'references/rules.md': 'Shared `owner` field rules.'
    }
  });
  assert.equal(proposal.legacy_skill_root, '/tmp/example-skill');
  assert.equal(proposal.summary.reference_file_count, 1);
  assert.equal(proposal.summary.script_file_count, 1);
  assert.deepEqual(proposal.script_preserve_candidates, [
    { path: 'scripts/normalize_input.mjs', action: 'preserve_or_refactor' }
  ]);
  assert.deepEqual(proposal.reference_preserve_candidates, [
    { path: 'references/rules.md', action: 'preserve_or_merge' }
  ]);
  assert.ok(proposal.unresolved_term_sources.some((item) => item.source_file === 'references/rules.md'));
});

test('resolveSkillRoot 支持 skill 目录与 SKILL.md 路径', async () => {
  const tempRoot = await mkdtemp(path.join(os.tmpdir(), 'fskill-migrate-'));
  try {
    await writeFile(path.join(tempRoot, 'SKILL.md'), '# Skill\n', 'utf8');
    assert.equal(await resolveSkillRoot(tempRoot), tempRoot);
    assert.equal(await resolveSkillRoot(path.join(tempRoot, 'SKILL.md')), tempRoot);
  } finally {
    await rm(tempRoot, { recursive: true, force: true });
  }
});

test('loadLegacySkillPackage 读取 references 与 scripts', async () => {
  const tempRoot = await mkdtemp(path.join(os.tmpdir(), 'fskill-migrate-'));
  try {
    await writeFile(path.join(tempRoot, 'SKILL.md'), '# Skill\n\n## Step 1 Load Input\n\nText\n', 'utf8');
    await mkdir(path.join(tempRoot, 'references'), { recursive: true });
    await mkdir(path.join(tempRoot, 'scripts'), { recursive: true });
    await writeFile(path.join(tempRoot, 'references', 'rules.md'), '# Rules\n\nUse `owner`.\n', 'utf8');
    await writeFile(path.join(tempRoot, 'scripts', 'normalize_input.mjs'), 'export {};\n', 'utf8');
    const legacySkill = await loadLegacySkillPackage(tempRoot);
    assert.equal(legacySkill.skill_root, tempRoot);
    assert.deepEqual(legacySkill.companion_files.references, ['references/rules.md']);
    assert.deepEqual(legacySkill.companion_files.scripts, ['scripts/normalize_input.mjs']);
    assert.ok(legacySkill.companion_contents['references/rules.md'].includes('owner'));
  } finally {
    await rm(tempRoot, { recursive: true, force: true });
  }
});
