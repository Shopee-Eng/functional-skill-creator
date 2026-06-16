import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeMeetingNotes } from './normalize_meeting_notes.mjs';

test('normalizes whitespace and counts non-empty lines', () => {
  const result = normalizeMeetingNotes('  Alice will send notes.  \r\n\r\n  Decision: ship Friday.  ');
  assert.deepEqual(result, {
    text: 'Alice will send notes.\nDecision: ship Friday.',
    has_content: true,
    line_count: 2,
    warnings: []
  });
});

test('reports missing meeting notes', () => {
  const result = normalizeMeetingNotes('   \n  ');
  assert.deepEqual(result, {
    text: '',
    has_content: false,
    line_count: 0,
    warnings: ['missing_meeting_notes']
  });
});
