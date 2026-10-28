import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { describe, expect, it } from 'vitest';

// Definition of done: no mock import outside src/services/ and src/mocks/.
function files(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? files(path) : [path];
  });
}

describe('module boundaries', () => {
  it('screens never import mocks directly', () => {
    const src = new URL('../../src', import.meta.url).pathname;
    const offenders = files(src)
      .filter((f) => /\.tsx?$/.test(f))
      .map((f) => relative(src, f))
      .filter((f) => !f.startsWith('services/') && !f.startsWith('mocks/'))
      .filter((f) => /from ['"][^'"]*\/mocks\//.test(readFileSync(join(src, f), 'utf8')));
    expect(offenders).toEqual([]);
  });
});
