/**
 * Central query-key factory. Hierarchical keys let a mutation invalidate exactly what it touched,
 * e.g. `queryKeys.doctors.all` invalidates every doctor list, detail and patient sub-list.
 */
export const queryKeys = {
  me: ['auth', 'me'] as const,
  doctors: {
    all: ['doctors'] as const,
    list: (params: object) => ['doctors', 'list', params] as const,
    detail: (id: string) => ['doctors', 'detail', id] as const,
    patients: (id: string, params: object) =>
      ['doctors', 'detail', id, 'patients', params] as const,
    options: ['doctors', 'options'] as const,
    hospitals: ['doctors', 'hospitals'] as const,
  },
  patients: {
    all: ['patients'] as const,
    list: (params: object) => ['patients', 'list', params] as const,
  },
  stats: {
    all: ['stats'] as const,
    overview: ['stats', 'overview'] as const,
    timeline: (months: number) => ['stats', 'timeline', months] as const,
  },
  search: (q: string) => ['search', q] as const,
};
