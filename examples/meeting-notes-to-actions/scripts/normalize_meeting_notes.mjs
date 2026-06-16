export function normalizeMeetingNotes(meetingNotes) {
  const text = String(meetingNotes ?? '')
    .replace(/\r\n?/g, '\n')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .join('\n');

  const warnings = [];
  if (!text) {
    warnings.push('missing_meeting_notes');
  }

  return {
    text,
    has_content: text.length > 0,
    line_count: text ? text.split('\n').length : 0,
    warnings
  };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const input = process.argv.slice(2).join(' ');
  process.stdout.write(`${JSON.stringify(normalizeMeetingNotes(input), null, 2)}\n`);
}
