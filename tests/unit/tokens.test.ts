import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { cssVarName, themeVars, tokens } from '../../src/theme/tokens';
import type { ThemeTokens } from '../../src/types';

describe('theme tokens', () => {
  it('match the @theme block in index.css', () => {
    const css = readFileSync(new URL('../../src/index.css', import.meta.url), 'utf8');
    for (const [key, value] of Object.entries(tokens)) {
      expect(css).toContain(`${cssVarName(key as keyof ThemeTokens)}: ${value};`);
    }
  });

  it('maps page overrides to CSS variables', () => {
    expect(themeVars({ inkSoft: '#111' })).toEqual({ '--color-ink-soft': '#111' });
    expect(themeVars(null)).toEqual({});
  });
});
