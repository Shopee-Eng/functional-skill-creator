import { readdir, readFile, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';

const ACTION_WORDS = [
  'load',
  'read',
  'extract',
  'resolve',
  'build',
  'generate',
  'draft',
  'write',
  'render',
  'validate',
  'check',
  'decide',
  'summarize',
  'classify'
];

const SCRIPT_PATTERN = /\.(m?js|cjs|py|sh)$/i;
const TOOL_PATTERN = /\.m?js$/i;

export function normalizeFunctionName(name) {
  return String(name || '')
    .trim()
    .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
    .replace(/[^a-zA-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .toLowerCase();
}

export function parseMarkdownSections(markdown) {
  const sections = [];
  const lines = String(markdown).split(/\r?\n/);
  let current = null;
  for (const line of lines) {
    const match = /^(#{1,6})\s+(.+)$/.exec(line);
    if (match) {
      current = { level: match[1].length, title: match[2].trim(), content: [] };
      sections.push(current);
    } else if (current) {
      current.content.push(line);
    }
  }
  return sections.map((section) => ({ ...section, content: section.content.join('\n').trim() }));
}

export async function resolveSkillRoot(inputPath) {
  const resolved = path.resolve(inputPath);
  const info = await stat(resolved);
  if (info.isFile()) {
    if (path.basename(resolved).toLowerCase() === 'skill.md') {
      return path.dirname(resolved);
    }
    throw new Error('Input file must be SKILL.md or provide a skill directory.');
  }
  if (info.isDirectory()) {
    return resolved;
  }
  throw new Error('Invalid skill path.');
}

async function listRelativeFiles(rootDir, subdir, pattern) {
  const targetDir = path.join(rootDir, subdir);
  try {
    const entries = await readdir(targetDir, { withFileTypes: true });
    return entries
      .filter((entry) => entry.isFile() && pattern.test(entry.name))
      .map((entry) => path.join(subdir, entry.name));
  } catch {
    return [];
  }
}

export async function loadLegacySkillPackage(skillRoot) {
  const skillMdPath = path.join(skillRoot, 'SKILL.md');
  const markdown = await readFile(skillMdPath, 'utf8');
  const companionFiles = {
    references: await listRelativeFiles(skillRoot, 'references', /\.md$/i),
    scripts: await listRelativeFiles(skillRoot, 'scripts', SCRIPT_PATTERN),
    tools: await listRelativeFiles(skillRoot, 'tools', TOOL_PATTERN),
    testcases: await listRelativeFiles(skillRoot, 'testcases', /\.(json|md)$/i)
  };
  const companionContents = {};
  for (const relativePath of companionFiles.references) {
    companionContents[relativePath] = await readFile(path.join(skillRoot, relativePath), 'utf8');
  }
  return {
    skill_root: skillRoot,
    path: skillMdPath,
    markdown,
    companion_files: companionFiles,
    companion_contents: companionContents
  };
}

export function proposeMigration(markdown, options = {}) {
  const sections = parseMarkdownSections(markdown);
  const candidates = [];
  const seen = new Set();
  function addCandidate(candidate) {
    if (!candidate.suggested_function || seen.has(candidate.suggested_function)) return;
    seen.add(candidate.suggested_function);
    candidates.push(candidate);
  }
  for (const section of sections) {
    const title = section.title.replace(/^\d+[.)]\s*/, '').trim();
    const lower = title.toLowerCase();
    const hasAction = ACTION_WORDS.some((word) => lower.includes(word));
    const looksLikeStep = /^step\s*\d+/i.test(title) || /^步骤\s*\d+/.test(title) || hasAction;
    if (section.level <= 3 && looksLikeStep) {
      addCandidate({
        source_title: section.title,
        suggested_function: normalizeFunctionName(title),
        reason: hasAction ? 'action-oriented section' : 'step-like section'
      });
    }
  }
  for (const line of String(markdown).split(/\r?\n/)) {
    if (!line.includes('|') || !line.includes('`')) continue;
    const codeTokens = Array.from(line.matchAll(/`([a-zA-Z][a-zA-Z0-9_]*?)`/g)).map((match) => match[1]);
    for (const token of codeTokens) {
      if (ACTION_WORDS.some((word) => token.startsWith(`${word}_`) || token === word)) {
        addCandidate({
          source_title: token,
          suggested_function: normalizeFunctionName(token),
          reason: 'pipeline table function token'
        });
      }
    }
  }
  const unresolvedTerms = Array.from(new Set(
    (markdown.match(/`[a-zA-Z][a-zA-Z0-9_.-]+`/g) || []).map((token) => token.slice(1, -1))
  )).slice(0, 80);
  const suggestedStructure = {
    orchestration: 'SKILL.md',
    functions: candidates.map((candidate) => `functions/${candidate.suggested_function}.md`),
    references: ['references/shared-glossary.md']
  };
  if (options.includeViewers === true) {
    suggestedStructure.tools = ['tools/log_viewer.mjs', 'tools/tester_viewer.mjs'];
  }
  const reviewNotes = [
    '写文件前先 review 每个 function candidate。',
    '平台相关规则放在 references 中，不要混进 functional core。',
    'Function-local fields 放在 functions/*.md；只有共享术语放入 glossary。'
  ];
  if (options.includeViewers === true) {
    reviewNotes.push('已建议生成 tools/log_viewer.mjs 和 tools/tester_viewer.mjs，用于本地查看 trace 与 regression testcase 覆盖。');
  }
  return {
    schema_version: '0.1.0',
    source: options.source || null,
    summary: {
      section_count: sections.length,
      function_candidate_count: candidates.length,
      unresolved_term_count: unresolvedTerms.length
    },
    suggested_structure: suggestedStructure,
    function_candidates: candidates,
    unresolved_terms: unresolvedTerms,
    review_notes: reviewNotes
  };
}

export function proposeMigrationFromPackage(legacySkill, options = {}) {
  const proposal = proposeMigration(legacySkill.markdown, {
    source: legacySkill.skill_root || options.source || null,
    includeViewers: options.includeViewers
  });
  const companionFiles = legacySkill.companion_files || {
    references: [],
    scripts: [],
    tools: [],
    testcases: []
  };
  const referenceTerms = Object.entries(legacySkill.companion_contents || {}).flatMap(([filePath, content]) =>
    Array.from(content.matchAll(/`([a-zA-Z][a-zA-Z0-9_.-]+)`/g)).map((match) => ({
      term: match[1],
      source_file: filePath
    }))
  );
  const mergedTerms = Array.from(new Map(
    [...proposal.unresolved_terms.map((term) => [term, { term, source_file: 'SKILL.md' }]), ...referenceTerms.map((item) => [item.term, item])]
  ).values()).slice(0, 120);
  return {
    ...proposal,
    legacy_skill_root: legacySkill.skill_root || null,
    companion_files: companionFiles,
    script_preserve_candidates: companionFiles.scripts.map((filePath) => ({
      path: filePath,
      action: 'preserve_or_refactor'
    })),
    reference_preserve_candidates: companionFiles.references.map((filePath) => ({
      path: filePath,
      action: 'preserve_or_merge'
    })),
    summary: {
      ...proposal.summary,
      reference_file_count: companionFiles.references.length,
      script_file_count: companionFiles.scripts.length,
      tool_file_count: companionFiles.tools.length,
      testcase_file_count: companionFiles.testcases.length,
      unresolved_term_count: mergedTerms.length
    },
    unresolved_terms: mergedTerms.map((item) => item.term),
    unresolved_term_sources: mergedTerms
  };
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
  const skillInput = process.argv[2];
  if (!skillInput) {
    console.error('Usage: node scripts/migrate_proposal.mjs <skill-dir> [--out file] [--include-viewers true|false]');
    process.exitCode = 1;
  } else {
    const args = process.argv.slice(3);
    const out = readFlag(args, '--out');
    const includeViewers = readBooleanFlag(args, '--include-viewers');
    resolveSkillRoot(skillInput)
      .then((skillRoot) => loadLegacySkillPackage(skillRoot))
      .then((legacySkill) => proposeMigrationFromPackage(legacySkill, { includeViewers }))
      .then(async (proposal) => {
        if (out) {
          await writeFile(path.resolve(out), `${JSON.stringify(proposal, null, 2)}\n`);
          process.stdout.write(`迁移 proposal 已写入 ${out}\n`);
        } else {
          process.stdout.write(`${JSON.stringify(proposal, null, 2)}\n`);
        }
      })
      .catch((error) => {
        console.error(error.message);
        process.exitCode = 1;
      });
  }
}
