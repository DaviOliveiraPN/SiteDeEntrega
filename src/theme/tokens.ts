import { useEffect } from 'react';
import type { ThemeTokens } from '../types';

// Default palette. Mirrored in the `@theme` block of src/index.css (a unit test keeps both in sync).
export const tokens: ThemeTokens = {
  ink: '#0B0B0B',
  inkSoft: '#161513',
  charcoal: '#3B3B3B',
  cream: '#F5F0EB',
  paper: '#FBF9F6',
  muted: '#8A8175',
  accent: '#AAB0B8',
  lineDark: '#2A2826',
};

/** `inkSoft` -> `--color-ink-soft`, the CSS variable Tailwind generates utilities from. */
export function cssVarName(key: keyof ThemeTokens): string {
  return `--color-${key.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`)}`;
}

/** CSS variables that override the default palette for one page (from `PageContent.theme`). */
export function themeVars(overrides: Partial<ThemeTokens> | null | undefined): Record<string, string> {
  const vars: Record<string, string> = {};
  if (!overrides) return vars;
  for (const [key, value] of Object.entries(overrides)) {
    if (value) vars[cssVarName(key as keyof ThemeTokens)] = value;
  }
  return vars;
}

/** Applies page overrides on <html>, so portaled overlays (gallery, lightbox) get them too. */
export function usePageTheme(overrides: Partial<ThemeTokens> | null | undefined): void {
  useEffect(() => {
    const root = document.documentElement;
    const vars = Object.entries(themeVars(overrides));
    for (const [name, value] of vars) root.style.setProperty(name, value);
    return () => {
      for (const [name] of vars) root.style.removeProperty(name);
    };
  }, [overrides]);
}
