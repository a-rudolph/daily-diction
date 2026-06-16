/** App timezone — all calendar dates are computed in this zone. */
const TZ = 'America/Toronto';

/**
 * Returns today's date as YYYY-MM-DD in America/Toronto.
 * Safe to call on the server (Vercel runs UTC).
 */
export function getTodayLocalDate(): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

/**
 * Adds `days` (may be negative) to a YYYY-MM-DD date string.
 * Purely calendar arithmetic — no timezone ambiguity.
 */
export function addDays(dateStr: string, days: number): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const result = new Date(y, m - 1, d + days);
  return [
    result.getFullYear(),
    String(result.getMonth() + 1).padStart(2, '0'),
    String(result.getDate()).padStart(2, '0'),
  ].join('-');
}

/**
 * Formats a YYYY-MM-DD date string as a short label, e.g. "Mon".
 */
export function shortDayLabel(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-US', { weekday: 'short' });
}
