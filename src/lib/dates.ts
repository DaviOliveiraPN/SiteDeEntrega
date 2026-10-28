// pt-BR date helpers. Event dates are ISO dates ("2026-08-15"); we compare calendar days in
// São Paulo time so "há X dias" doesn't jump at UTC midnight.

const TIME_ZONE = 'America/Sao_Paulo';
const DAY_MS = 86_400_000;

/** "YYYY-MM-DD" of an instant, in São Paulo time. */
function calendarDay(date: Date): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: TIME_ZONE, year: 'numeric', month: '2-digit', day: '2-digit' }).format(date);
}

/** Parses an ISO date or datetime. Date-only strings are treated as that calendar day. */
function toDay(iso: string): string {
  return /^\d{4}-\d{2}-\d{2}$/.test(iso) ? iso : calendarDay(new Date(iso));
}

export function daysSince(iso: string, now: Date = new Date()): number {
  return Math.round((Date.parse(calendarDay(now)) - Date.parse(toDay(iso))) / DAY_MS);
}

/** "seu dia foi há 73 dias" */
export function relativeDayLabel(iso: string, now: Date = new Date()): string {
  const days = daysSince(iso, now);
  if (days < 0) return days === -1 ? 'seu dia é amanhã' : `faltam ${-days} dias para o seu dia`;
  if (days === 0) return 'seu dia é hoje';
  if (days === 1) return 'seu dia foi ontem';
  return `seu dia foi há ${days} dias`;
}

/** "15 DE AGOSTO DE 2026" */
export function formatEventDate(iso: string): string {
  return formatLongDate(iso).toUpperCase();
}

/** "15 de agosto de 2026" */
export function formatLongDate(iso: string): string {
  const day = toDay(iso);
  return new Intl.DateTimeFormat('pt-BR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(
    new Date(`${day}T12:00:00Z`),
  );
}
