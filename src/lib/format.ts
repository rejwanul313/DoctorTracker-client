import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);

/**
 * Calendar dates are stored as UTC midnight and filtered by UTC day on the server,
 * so they are displayed in UTC too — "18 Nov 2026" means the same day everywhere.
 */
export function fDate(iso: string | Date | null | undefined): string {
  if (!iso) return '—';
  return dayjs.utc(iso).format('D MMM YYYY');
}

/** `2026-11` → `Nov` (or `Nov 2026` with `withYear`). */
export function fMonth(key: string, withYear = false): string {
  return dayjs.utc(`${key}-01`).format(withYear ? 'MMM YYYY' : 'MMM');
}

const numberFmt = new Intl.NumberFormat('en-US');
export function fNumber(n: number | null | undefined): string {
  return n === null || n === undefined ? '—' : numberFmt.format(n);
}

export function fPercent(n: number): string {
  return `${n > 0 ? '+' : ''}${n.toFixed(1)}%`;
}

/** `YYYY-MM-DD` for today in UTC (matches how calendar dates are stored). */
export function todayIso(): string {
  return dayjs.utc().format('YYYY-MM-DD');
}

export function initials(name: string): string {
  const parts = name
    .replace(/^dr\.?\s+/i, '')
    .trim()
    .split(/\s+/);
  const first = parts[0]?.[0] ?? '';
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? '') : '';
  return (first + last).toUpperCase();
}
