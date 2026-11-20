'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import type { ApiItem, StatsOverview, TimelinePoint } from '@dt/shared';
import { api } from '@/lib/apiClient';
import { queryKeys } from '@/lib/queryKeys';

export function useStatsOverview() {
  return useQuery({
    queryKey: queryKeys.stats.overview,
    queryFn: ({ signal }) =>
      api<ApiItem<StatsOverview>>('/stats/overview', { signal }).then((r) => r.data),
    staleTime: 60_000,
  });
}

export function useTimeline(months: number) {
  return useQuery<TimelinePoint[]>({
    queryKey: queryKeys.stats.timeline(months),
    queryFn: ({ signal }) =>
      api<ApiItem<TimelinePoint[]>>('/stats/timeline', { query: { months }, signal }).then(
        (r) => r.data,
      ),
    staleTime: 60_000,
    placeholderData: keepPreviousData,
  });
}
