'use client';

import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ApiList, DoctorUpdateInput, PatientDTO, PatientFacets } from '@dt/shared';
import { queryKeys } from '@/lib/queryKeys';
import { doctorsApi, type DoctorListParams, type DoctorPatientsParams } from './api';

export function useDoctors(params: DoctorListParams) {
  return useQuery({
    queryKey: queryKeys.doctors.list(params),
    queryFn: ({ signal }) => doctorsApi.list(params, signal),
    // Keep showing the current page while the next one loads — no table flash.
    placeholderData: keepPreviousData,
  });
}

export function useDoctor(id: string) {
  return useQuery({
    queryKey: queryKeys.doctors.detail(id),
    queryFn: ({ signal }) => doctorsApi.detail(id, signal),
  });
}

export function useDoctorOptions(enabled = true) {
  return useQuery({
    queryKey: queryKeys.doctors.options,
    queryFn: ({ signal }) => doctorsApi.options(signal),
    staleTime: 5 * 60_000,
    enabled,
  });
}

export function useHospitals() {
  return useQuery({
    queryKey: queryKeys.doctors.hospitals,
    queryFn: ({ signal }) => doctorsApi.hospitals(signal),
    staleTime: 5 * 60_000,
  });
}

export function useDoctorPatients(id: string, params: DoctorPatientsParams) {
  return useQuery({
    queryKey: queryKeys.doctors.patients(id, params),
    queryFn: ({ signal }) => doctorsApi.patients(id, params, signal),
    placeholderData: keepPreviousData,
  });
}

/** Doctor changes affect doctor lists/details, patient rows (doctor names) and the dashboard. */
function useInvalidateDoctorData() {
  const qc = useQueryClient();
  return () =>
    Promise.all([
      qc.invalidateQueries({ queryKey: queryKeys.doctors.all }),
      qc.invalidateQueries({ queryKey: queryKeys.patients.all }),
      qc.invalidateQueries({ queryKey: queryKeys.stats.all }),
    ]);
}

export function useCreateDoctor() {
  const invalidate = useInvalidateDoctorData();
  return useMutation({ mutationFn: doctorsApi.create, onSuccess: invalidate });
}

export function useUpdateDoctor(id: string) {
  const invalidate = useInvalidateDoctorData();
  return useMutation({
    mutationFn: (body: DoctorUpdateInput) => doctorsApi.update(id, body),
    onSuccess: invalidate,
  });
}

export function useDeleteDoctor() {
  const invalidate = useInvalidateDoctorData();
  return useMutation({ mutationFn: doctorsApi.remove, onSuccess: invalidate });
}

export function useAddDoctorPatient(id: string) {
  const invalidate = useInvalidateDoctorData();
  return useMutation({
    mutationFn: (body: Parameters<typeof doctorsApi.addPatient>[1]) =>
      doctorsApi.addPatient(id, body),
    onSuccess: invalidate,
  });
}

/**
 * "Remove from this doctor's list" with an optimistic update: the row disappears immediately,
 * and is restored if the request fails.
 */
export function useUnassignPatient(doctorId: string) {
  const qc = useQueryClient();
  const invalidate = useInvalidateDoctorData();
  const listKey = [...queryKeys.doctors.detail(doctorId), 'patients'];

  return useMutation({
    mutationFn: (patient: PatientDTO) => doctorsApi.unassignPatient(doctorId, patient._id),
    onMutate: async (patient) => {
      await qc.cancelQueries({ queryKey: listKey });
      const snapshot = qc.getQueriesData<ApiList<PatientDTO, PatientFacets>>({ queryKey: listKey });
      qc.setQueriesData<ApiList<PatientDTO, PatientFacets>>({ queryKey: listKey }, (old) =>
        old
          ? {
              ...old,
              data: old.data.filter((p) => p._id !== patient._id),
              meta: { ...old.meta, total: Math.max(0, old.meta.total - 1) },
            }
          : old,
      );
      return { snapshot };
    },
    onError: (_err, _patient, ctx) => {
      ctx?.snapshot.forEach(([key, data]) => qc.setQueryData(key, data));
    },
    onSettled: invalidate,
  });
}
