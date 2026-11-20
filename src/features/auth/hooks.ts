'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ApiItem, LoginInput, UserDTO } from '@dt/shared';
import { api } from '@/lib/apiClient';
import { queryKeys } from '@/lib/queryKeys';

export const authApi = {
  me: (signal?: AbortSignal) => api<ApiItem<UserDTO>>('/auth/me', { signal }).then((r) => r.data),
  login: (body: LoginInput) =>
    api<ApiItem<UserDTO>>('/auth/login', { method: 'POST', body }).then((r) => r.data),
  logout: () => api<void>('/auth/logout', { method: 'POST' }),
};

export function useMe() {
  return useQuery({
    queryKey: queryKeys.me,
    queryFn: ({ signal }) => authApi.me(signal),
    staleTime: 5 * 60_000,
  });
}

/** Authorization in the UI: staff are read-only (the API enforces this too). */
export function useCanEdit(): boolean {
  return useMe().data?.role === 'admin';
}

export function useLogin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: authApi.login,
    onSuccess: (user) => {
      qc.clear();
      qc.setQueryData(queryKeys.me, user);
    },
  });
}

export function useLogout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: authApi.logout,
    onSettled: () => {
      qc.clear();
      // Full navigation so the proxy re-evaluates the (now cleared) cookie and all state resets.
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      window.location.assign('/login');
    },
  });
}
