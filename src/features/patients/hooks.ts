'use client';

import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { PatientUpdateInput } from '@dt/shared';
import { queryKeys } from '@/lib/queryKeys';
import { patientsApi, type PatientListParams } from './api';

export function usePatients(params: PatientListParams) {
  return useQuery({
    queryKey: queryKeys.patients.list(params),
    queryFn: ({ signal }) => patientsApi.list(params, signal),
    placeholderData: keepPreviousData,
  });
}

/** Patient changes affect patient lists, doctor patient lists/counts and the dashboard. */
function useInvalidatePatientData() {
  const qc = useQueryClient();
  return () =>
    Promise.all([
      qc.invalidateQueries({ queryKey: queryKeys.patients.all }),
      qc.invalidateQueries({ queryKey: queryKeys.doctors.all }),
      qc.invalidateQueries({ queryKey: queryKeys.stats.all }),
    ]);
}

export function useCreatePatient() {
  const invalidate = useInvalidatePatientData();
  return useMutation({ mutationFn: patientsApi.create, onSuccess: invalidate });
}

export function useUpdatePatient() {
  const invalidate = useInvalidatePatientData();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: PatientUpdateInput }) =>
      patientsApi.update(id, body),
    onSuccess: invalidate,
  });
}

export function useDeletePatient() {
  const invalidate = useInvalidatePatientData();
  return useMutation({ mutationFn: patientsApi.remove, onSuccess: invalidate });
}
