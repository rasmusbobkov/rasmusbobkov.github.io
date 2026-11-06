/**
 * The file-length cap keeps its teeth: a code file past the cap fails the
 * gate, files the project does not write by hand are left out of the count,
 * and this project's own code sits inside the cap it chose.
 *
 * Source of the intent: the captain asked for a maximum length on a single
 * code file, enforced for future development.
 */
import { afterAll, expect, test } from 'vitest';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const SCRIPT = path.join(ROOT, 'scripts', 'check-file-lengths.sh');

const scratch: string[] = [];

afterAll(() => {
  for (const dir of scratch) fs.rmSync(dir, { recursive: true, force: true });
});

/** The gate as a reader runs it: a project directory, and optionally a cap. */
function runGate(root: string, cap?: number): { status: number; output: string } {
  const args = [SCRIPT, root, ...(cap === undefined ? [] : [String(cap)])];
  try {
    return { status: 0, output: execFileSync('bash', args, { encoding: 'utf8' }) };
  } catch (error) {
    const failure = error as { status?: number; stdout?: string; stderr?: string };
    return {
      status: failure.status ?? 1,
      output: `${failure.stdout ?? ''}${failure.stderr ?? ''}`,
    };
  }
}

function scratchProject(): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'tahelugu-file-lengths-'));
  scratch.push(dir);
  return dir;
}

/** A file of `units` copies of one real 4-line function, so 4 lines a unit. */
function writeCodeFile(file: string, units: number): void {
  const unit = [
    'export function signGlyph(index: number): string {',
    '  const glyphs = ["\u2648", "\u2649", "\u264A", "\u264B"];',
    '  return glyphs[index % glyphs.length];',
    '}',
    '',
  ].join('\n');
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, unit.repeat(units));
}

test('a code file past the cap fails the gate and is named', () => {
  const project = scratchProject();
  writeCodeFile(path.join(project, 'src', 'wheel.ts'), 2);

  const result = runGate(project, 4);

  expect(result.status).toBe(1);
  expect(result.output).toContain('src/wheel.ts: 8 lines, over the 4-line cap');
});

test('a project whose code sits inside the cap passes without a word', () => {
  const project = scratchProject();
  writeCodeFile(path.join(project, 'src', 'wheel.ts'), 1);

  const result = runGate(project, 4);

  expect(result.output).toBe('');
  expect(result.status).toBe(0);
});

test('installed packages, build output and non-code files are left out', () => {
  const project = scratchProject();
  for (const dir of ['node_modules/astro', 'dist', '.astro', 'gen']) {
    writeCodeFile(path.join(project, dir, 'bundle.js'), 15);
  }
  fs.mkdirSync(path.join(project, 'src', 'data'), { recursive: true });
  fs.writeFileSync(path.join(project, 'src', 'data', 'estonia-places.json'), '{}\n'.repeat(60));
  fs.writeFileSync(path.join(project, 'README.md'), 'T\u00e4helugu\n'.repeat(60));

  const result = runGate(project, 4);

  expect(result.output).toBe('');
  expect(result.status).toBe(0);
});

test('this project writes no code file past its own cap', () => {
  const result = runGate(ROOT);

  expect(result.output).toBe('');
  expect(result.status).toBe(0);
});
