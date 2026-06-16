import test from 'node:test';
import assert from 'node:assert/strict';
import { proposeMigration } from './migrate_proposal.mjs';

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
