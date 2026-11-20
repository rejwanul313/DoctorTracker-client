import type {
  ApiItem,
  ApiList,
  Condition,
  Gender,
  PatientCreateInput,
  PatientDTO,
  PatientFacets,
  PatientUpdateInput,
} from '@dt/shared';
import { api } from '@/lib/apiClient';

export interface PatientListParams {
  page: number;
  limit: number;
  search?: string;
  condition?: Condition;
  doctor?: string;
  gender?: Gender;
  admittedFrom?: string;
  admittedTo?: string;
}

export const patientsApi = {
  list: (query: PatientListParams, signal?: AbortSignal) =>
    api<ApiList<PatientDTO, PatientFacets>>('/patients', { query: { ...query }, signal }),
  create: (body: PatientCreateInput) =>
    api<ApiItem<PatientDTO>>('/patients', { method: 'POST', body }).then((r) => r.data),
  update: (id: string, body: PatientUpdateInput) =>
    api<ApiItem<PatientDTO>>(`/patients/${id}`, { method: 'PATCH', body }).then((r) => r.data),
  remove: (id: string) => api<void>(`/patients/${id}`, { method: 'DELETE' }),
};
