import { describe, expect, it } from 'vitest';
import { daysSince, formatEventDate, formatLongDate, relativeDayLabel } from '../../src/lib/dates';

describe('dates', () => {
  // 2026-10-27 21:30 in São Paulo is already the 28th in UTC.
  const lateEvening = new Date('2026-10-28T00:30:00Z');

  it('counts calendar days in São Paulo time', () => {
    expect(daysSince('2026-10-27', lateEvening)).toBe(0);
    expect(daysSince('2026-08-15', lateEvening)).toBe(73);
  });

  it('builds the relative label', () => {
    expect(relativeDayLabel('2026-10-27', lateEvening)).toBe('seu dia é hoje');
    expect(relativeDayLabel('2026-10-26', lateEvening)).toBe('seu dia foi ontem');
    expect(relativeDayLabel('2026-08-15', lateEvening)).toBe('seu dia foi há 73 dias');
    expect(relativeDayLabel('2026-10-30', lateEvening)).toBe('faltam 3 dias para o seu dia');
  });

  it('formats dates in pt-BR', () => {
    expect(formatEventDate('2026-08-15')).toBe('15 DE AGOSTO DE 2026');
    expect(formatLongDate('2027-03-31T23:59:59-03:00')).toBe('31 de março de 2027');
  });
});
