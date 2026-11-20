import type {
  ApiItem,
  ApiList,
  DoctorCreateInput,
  DoctorDetail,
  DoctorDTO,
  DoctorFacets,
  DoctorListItem,
  DoctorOption,
  DoctorPatientCreateInput,
  DoctorUpdateInput,
  PatientDTO,
  PatientFacets,
  Specialization,
} from '@dt/shared';
import { api } from '@/lib/apiClient';

export interface DoctorListParams {
  page: number;
  limit: number;
  search?: string;
  specialization?: Specialization;
  hospital?: string;
  joinedFrom?: string;
  joinedTo?: string;
}

export interface DoctorPatientsParams {
  page: number;
  limit: number;
  search?: string;
}

export const doctorsApi = {
  list: (query: DoctorListParams, signal?: AbortSignal) =>
    api<ApiList<DoctorListItem, DoctorFacets>>('/doctors', { query: { ...query }, signal }),
  detail: (id: string, signal?: AbortSignal) =>
    api<ApiItem<DoctorDetail>>(`/doctors/${id}`, { signal }).then((r) => r.data),
  options: (signal?: AbortSignal) =>
    api<ApiItem<DoctorOption[]>>('/doctors/options', { signal }).then((r) => r.data),
  hospitals: (signal?: AbortSignal) =>
    api<ApiItem<string[]>>('/doctors/hospitals', { signal }).then((r) => r.data),
  create: (body: DoctorCreateInput) =>
    api<ApiItem<DoctorDTO>>('/doctors', { method: 'POST', body }).then((r) => r.data),
  update: (id: string, body: DoctorUpdateInput) =>
    api<ApiItem<DoctorDTO>>(`/doctors/${id}`, { method: 'PATCH', body }).then((r) => r.data),
  remove: (id: string) => api<void>(`/doctors/${id}`, { method: 'DELETE' }),
  patients: (id: string, query: DoctorPatientsParams, signal?: AbortSignal) =>
    api<ApiList<PatientDTO, PatientFacets>>(`/doctors/${id}/patients`, {
      query: { ...query },
      signal,
    }),
  addPatient: (id: string, body: DoctorPatientCreateInput) =>
    api<ApiItem<PatientDTO>>(`/doctors/${id}/patients`, { method: 'POST', body }).then(
      (r) => r.data,
    ),
  unassignPatient: (id: string, patientId: string) =>
    api<void>(`/doctors/${id}/patients/${patientId}`, { method: 'DELETE' }),
};
