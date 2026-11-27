import { execFileSync, execSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

const statusOutput = execSync('git status --porcelain -uall', { encoding: 'utf8' });

const files = statusOutput
  .split(/\r?\n/)
  .filter(Boolean)
  .map((line) => {
    const rawPath = line.slice(3);
    const targetPath = rawPath.includes(' -> ') ? rawPath.split(' -> ').pop() : rawPath;
    return targetPath.replace(/^"|"$/g, '');
  })
  .filter((file) => existsSync(file))
  .filter((file) => /\.(ts|tsx|js|jsx|json|css|md)$/.test(file));

if (files.length === 0) {
  console.log('No changed files to normalize.');
  process.exit(0);
}

console.log(`Normalizing ${files.length} changed file(s)...`);

// Resolve the JS entry points inside node_modules directly (cross-platform, no shell needed)
const eslintBin = resolve('node_modules/eslint/bin/eslint.js');
const prettierBin = resolve('node_modules/prettier/bin/prettier.cjs');

const eslintFiles = files.filter((f) => /\.(ts|tsx|js|jsx)$/.test(f));
if (eslintFiles.length > 0) {
  execFileSync(process.execPath, [eslintBin, '--fix', ...eslintFiles], {
    stdio: 'inherit',
  });
}

execFileSync(process.execPath, [prettierBin, '--write', '--end-of-line', 'lf', ...files], {
  stdio: 'inherit',
});
