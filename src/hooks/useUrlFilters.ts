'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useMemo } from 'react';

export type FilterValue = string | number | null | undefined;

/**
 * URL search params as the single source of truth for list state (search, filters, tab, page,
 * rows per page). Lists become shareable/bookmarkable, back/forward works, and no component
 * needs lifted state — the table re-renders only when the URL (and so the query key) changes.
 *
 * `parse` maps the raw params to a typed, defaulted object (memoized on the query string).
 */
export function useUrlFilters<T>(parse: (params: URLSearchParams) => T) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const qs = searchParams.toString();

  // eslint-disable-next-line react-hooks/exhaustive-deps -- `parse` is a module-level function
  const filters = useMemo(() => parse(new URLSearchParams(qs)), [qs]);

  /** Merge updates into the URL. Any change other than `page` resets to page 1. */
  const setFilters = useCallback(
    (updates: Record<string, FilterValue>) => {
      const next = new URLSearchParams(qs);
      for (const [key, value] of Object.entries(updates)) {
        if (value === undefined || value === null || value === '') next.delete(key);
        else next.set(key, String(value));
      }
      if (!('page' in updates)) next.delete('page');
      const str = next.toString();
      router.replace(str ? `${pathname}?${str}` : pathname, { scroll: false });
    },
    [qs, pathname, router],
  );

  const clearFilters = useCallback(
    (keep: string[] = []) => {
      const next = new URLSearchParams();
      for (const key of keep) {
        const v = new URLSearchParams(qs).get(key);
        if (v) next.set(key, v);
      }
      const str = next.toString();
      router.replace(str ? `${pathname}?${str}` : pathname, { scroll: false });
    },
    [qs, pathname, router],
  );

  return { filters, setFilters, clearFilters };
}

/** Helpers for `parse` functions. */
export const param = {
  str: (p: URLSearchParams, key: string) => p.get(key) || undefined,
  int: (p: URLSearchParams, key: string, fallback: number, allowed?: readonly number[]) => {
    const n = Number(p.get(key));
    if (!Number.isInteger(n) || n < 1) return fallback;
    if (allowed && !allowed.includes(n)) return fallback;
    return n;
  },
  oneOf: <V extends string>(
    p: URLSearchParams,
    key: string,
    values: readonly V[],
  ): V | undefined => {
    const v = p.get(key);
    return v && (values as readonly string[]).includes(v) ? (v as V) : undefined;
  },
};
