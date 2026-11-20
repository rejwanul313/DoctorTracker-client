import { describe, expect, it } from 'vitest';
import { toQueryString } from './apiClient';
import { fDate, fMonth, fNumber, fPercent, initials } from './format';

describe('format', () => {
  it('formats calendar dates in UTC regardless of the local timezone', () => {
    expect(fDate('2026-11-18T00:00:00.000Z')).toBe('18 Nov 2026');
    expect(fDate(null)).toBe('—');
  });

  it('formats months, numbers and percentages', () => {
    expect(fMonth('2026-11')).toBe('Nov');
    expect(fMonth('2026-11', true)).toBe('Nov 2026');
    expect(fNumber(1286)).toBe('1,286');
    expect(fPercent(4.3)).toBe('+4.3%');
    expect(fPercent(-1.4)).toBe('-1.4%');
  });

  it('builds initials without the "Dr." prefix', () => {
    expect(initials('Dr. Farhana Rahman')).toBe('FR');
    expect(initials('Ayesha Karim')).toBe('AK');
    expect(initials('Cher')).toBe('C');
  });

  it('drops empty query params', () => {
    expect(toQueryString({ page: 1, search: '', doctor: undefined, condition: 'Critical' })).toBe(
      '?page=1&condition=Critical',
    );
    expect(toQueryString({})).toBe('');
  });
});
