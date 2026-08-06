import { createRequire } from 'node:module';
const ts = createRequire(import.meta.url)('typescript');

import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const ROOT = join(process.cwd(), 'src');
const SKIP = new Set(['vite-env.d.ts']);

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const path = join(dir, entry.name);
    if (SKIP.has(entry.name)) continue;
    if (entry.isDirectory()) {
      files.push(...(await walk(path)));
    } else if (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx')) {
      files.push(path);
    }
  }
  return files;
}

function stripComments(code) {
  const result = ts.transpileModule(code, {
    compilerOptions: {
      target: ts.ScriptTarget.Latest,
      module: ts.ModuleKind.ESNext,
      jsx: ts.JsxEmit.React,
      removeComments: true,
    },
    reportDiagnostics: false,
  });
  return result.outputText;
}

async function main() {
  const files = await walk(ROOT);
  let changed = 0;
  for (const file of files) {
    const original = await readFile(file, 'utf8');
    const stripped = stripComments(original);
    if (stripped !== original) {
      await writeFile(file, stripped, 'utf8');
      changed++;
    }
  }
  console.log(`Stripped comments from ${changed}/${files.length} files.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
