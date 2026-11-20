import { describe, expect, it } from 'vitest';
import { param } from './useUrlFilters';

const p = (qs: string) => new URLSearchParams(qs);

describe('URL filter parsing', () => {
  it('falls back to defaults for invalid numbers and page sizes', () => {
    expect(param.int(p('page=3'), 'page', 1)).toBe(3);
    expect(param.int(p('page=-2'), 'page', 1)).toBe(1);
    expect(param.int(p('page=abc'), 'page', 1)).toBe(1);
    expect(param.int(p('limit=7'), 'limit', 10, [5, 10, 25])).toBe(10);
    expect(param.int(p('limit=25'), 'limit', 10, [5, 10, 25])).toBe(25);
  });

  it('only accepts known enum values', () => {
    const values = ['Stable', 'Critical'] as const;
    expect(param.oneOf(p('condition=Critical'), 'condition', values)).toBe('Critical');
    expect(param.oneOf(p('condition=Hacked'), 'condition', values)).toBeUndefined();
    expect(param.str(p('search='), 'search')).toBeUndefined();
  });
});
