import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';

export const REQUIRED_DIRS = [
  'functions',
  'references',
  'scripts',
  'testcases/unit'
];

async function pathExists(filePath) {
  try {
    await stat(filePath);
    return true;
  } catch {
    return false;
  }
}

async function listMarkdownFiles(dirPath) {
  if (!(await pathExists(dirPath))) return [];
  const entries = await readdir(dirPath, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile() && entry.name.endsWith('.md'))
    .map((entry) => path.join(dirPath, entry.name));
}

export async function lintFunctionalSkill(rootDir) {
  const errors = [];
  const warnings = [];
  const skillPath = path.join(rootDir, 'SKILL.md');
  if (!(await pathExists(skillPath))) {
    errors.push({ code: 'MISSING_SKILL', message: '缺少 SKILL.md。' });
  }
  for (const dir of REQUIRED_DIRS) {
    if (!(await pathExists(path.join(rootDir, dir)))) {
      errors.push({ code: 'MISSING_DIR', message: `缺少 ${dir}/。` });
    }
  }
  const functionFiles = await listMarkdownFiles(path.join(rootDir, 'functions'));
  if (functionFiles.length === 0) {
    warnings.push({ code: 'NO_FUNCTIONS', message: '未找到 function contracts。' });
  }
  for (const functionFile of functionFiles) {
    const text = await readFile(functionFile, 'utf8');
    for (const section of ['## Purpose', '## Input', '## Output', '## Logic']) {
      if (!text.includes(section)) {
        errors.push({
          code: 'FUNCTION_CONTRACT_INCOMPLETE',
          message: `${path.relative(rootDir, functionFile)} 缺少 ${section}。`
        });
      }
    }
  }
  return { ok: errors.length === 0, errors, warnings, functionCount: functionFiles.length };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const dir = path.resolve(process.argv[2] || '.');
  lintFunctionalSkill(dir)
    .then((result) => {
      process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
      if (!result.ok) process.exitCode = 1;
    })
    .catch((error) => {
      console.error(error.message);
      process.exitCode = 1;
    });
}
