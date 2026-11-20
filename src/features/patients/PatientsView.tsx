'use client';

import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import { useCallback, useMemo, useState } from 'react';
import { CONDITIONS, GENDERS, PAGE_SIZES, UNASSIGNED, type PatientDTO } from '@dt/shared';
import { ActiveFilters, type ActiveFilter } from '@/components/ui/ActiveFilters';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { DateRangeFields } from '@/components/ui/DateRangeFields';
import { FilterBar } from '@/components/ui/FilterBar';
import { FilterTabs, type FilterTab } from '@/components/ui/FilterTabs';
import { Icon } from '@/components/ui/Icon';
import { PageHeader } from '@/components/ui/PageHeader';
import { SearchField } from '@/components/ui/SearchField';
import { EmptyState, ErrorState } from '@/components/ui/States';
import { TablePaginationBar } from '@/components/ui/TablePaginationBar';
import { useCanEdit } from '@/features/auth/hooks';
import { useDoctorOptions } from '@/features/doctors/hooks';
import { param, useUrlFilters } from '@/hooks/useUrlFilters';
import { errorMessage } from '@/lib/apiClient';
import { CONDITION_COLOR } from '@/lib/conditions';
import { fDate } from '@/lib/format';
import { useToast } from '@/lib/toast';
import type { PatientListParams } from './api';
import { useDeletePatient, usePatients } from './hooks';
import { PatientFormDialog } from './PatientFormDialog';
import { PatientsTable } from './PatientsTable';

function parseFilters(p: URLSearchParams): PatientListParams {
  const doctor = param.str(p, 'doctor');
  return {
    page: param.int(p, 'page', 1),
    limit: param.int(p, 'limit', 10, PAGE_SIZES),
    search: param.str(p, 'search'),
    condition: param.oneOf(p, 'condition', CONDITIONS),
    doctor: doctor && (doctor === UNASSIGNED || /^[a-f\d]{24}$/i.test(doctor)) ? doctor : undefined,
    gender: param.oneOf(p, 'gender', GENDERS),
    admittedFrom: param.str(p, 'admittedFrom'),
    admittedTo: param.str(p, 'admittedTo'),
  };
}

type DialogState = { open: boolean; patient?: PatientDTO; key: number };

export function PatientsView() {
  const toast = useToast();
  const canEdit = useCanEdit();
  const { filters, setFilters, clearFilters } = useUrlFilters(parseFilters);
  const { data, isPending, isError, error, refetch, isPlaceholderData } = usePatients(filters);
  const doctors = useDoctorOptions();
  const deletePatient = useDeletePatient();

  const [dialog, setDialog] = useState<DialogState>({ open: false, key: 0 });
  const [toDelete, setToDelete] = useState<PatientDTO | null>(null);

  const facets = data?.meta.facets?.condition;
  const tabs = useMemo<FilterTab[]>(
    () => [
      { value: 'all', label: 'All', count: facets?.all },
      ...CONDITIONS.map((c) => ({
        value: c,
        label: c,
        color: CONDITION_COLOR[c],
        count: facets ? (facets[c] ?? 0) : undefined,
      })),
    ],
    [facets],
  );

  const doctorName = useMemo(() => {
    if (!filters.doctor) return undefined;
    if (filters.doctor === UNASSIGNED) return 'Unassigned';
    return doctors.data?.find((d) => d._id === filters.doctor)?.name ?? 'Selected doctor';
  }, [filters.doctor, doctors.data]);

  const onTab = useCallback(
    (v: string) => setFilters({ condition: v === 'all' ? undefined : v }),
    [setFilters],
  );
  const onSearch = useCallback((search: string) => setFilters({ search }), [setFilters]);
  const onDates = useCallback(
    ({ from, to }: { from?: string; to?: string }) =>
      setFilters({ admittedFrom: from, admittedTo: to }),
    [setFilters],
  );
  const onPage = useCallback(
    ({ page, limit }: { page?: number; limit?: number }) =>
      setFilters(limit ? { limit } : { page }),
    [setFilters],
  );
  // Stable callbacks → memoized rows don't re-render when the page state changes.
  const onEdit = useCallback(
    (patient: PatientDTO) => setDialog((d) => ({ open: true, patient, key: d.key + 1 })),
    [],
  );
  const onDelete = useCallback((patient: PatientDTO) => setToDelete(patient), []);

  const active: ActiveFilter[] = [];
  if (filters.condition)
    active.push({
      key: 'condition',
      group: 'Condition',
      label: filters.condition,
      onRemove: () => onTab('all'),
    });
  if (doctorName)
    active.push({
      key: 'doctor',
      group: 'Doctor',
      label: doctorName,
      onRemove: () => setFilters({ doctor: undefined }),
    });
  if (filters.gender)
    active.push({
      key: 'gender',
      group: 'Gender',
      label: filters.gender,
      onRemove: () => setFilters({ gender: undefined }),
    });
  if (filters.admittedFrom || filters.admittedTo)
    active.push({
      key: 'admitted',
      group: 'Admitted',
      label: `${filters.admittedFrom ? fDate(filters.admittedFrom) : '…'} – ${filters.admittedTo ? fDate(filters.admittedTo) : '…'}`,
      onRemove: () => onDates({}),
    });
  if (filters.search)
    active.push({
      key: 'search',
      group: 'Keyword',
      label: filters.search,
      onRemove: () => onSearch(''),
    });

  const confirmDelete = () => {
    if (!toDelete) return;
    deletePatient.mutate(toDelete._id, {
      onSuccess: () => {
        toast(`${toDelete.name} deleted`);
        setToDelete(null);
      },
      onError: (err) => toast(errorMessage(err), { severity: 'error' }),
    });
  };

  return (
    <Stack spacing={5}>
      <PageHeader
        title="Patients"
        crumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Patients' }]}
        actions={
          canEdit && (
            <Button
              variant="contained"
              color="inherit"
              startIcon={<Icon name="plus" strokeWidth={2.4} />}
              onClick={() => setDialog((d) => ({ open: true, key: d.key + 1 }))}
            >
              New patient
            </Button>
          )
        }
      />

      <Card>
        <FilterTabs
          tabs={tabs}
          value={filters.condition ?? 'all'}
          onChange={onTab}
          ariaLabel="Filter by condition"
        />

        <FilterBar
          activeCount={
            [filters.doctor, filters.gender, filters.admittedFrom || filters.admittedTo].filter(
              Boolean,
            ).length
          }
          search={
            <SearchField
              value={filters.search ?? ''}
              onSearch={onSearch}
              placeholder="Search by name, phone or email…"
            />
          }
        >
          <TextField
            select
            label="Doctor"
            value={filters.doctor ?? ''}
            onChange={(e) => setFilters({ doctor: e.target.value })}
            sx={{ width: { xs: '100%', sm: 220 } }}
            slotProps={{
              inputLabel: { shrink: true },
              select: {
                displayEmpty: true,
                MenuProps: { slotProps: { paper: { sx: { maxHeight: 360 } } } },
              },
            }}
          >
            <MenuItem value="">All doctors</MenuItem>
            <MenuItem value={UNASSIGNED}>
              <em>Unassigned</em>
            </MenuItem>
            {(doctors.data ?? []).map((d) => (
              <MenuItem key={d._id} value={d._id}>
                {d.name}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            label="Gender"
            value={filters.gender ?? ''}
            onChange={(e) => setFilters({ gender: e.target.value })}
            sx={{ width: { xs: '100%', sm: 140 } }}
            slotProps={{ inputLabel: { shrink: true }, select: { displayEmpty: true } }}
          >
            <MenuItem value="">All</MenuItem>
            {GENDERS.map((g) => (
              <MenuItem key={g} value={g}>
                {g}
              </MenuItem>
            ))}
          </TextField>
          <DateRangeFields
            fromLabel="Admitted from"
            toLabel="Admitted to"
            from={filters.admittedFrom}
            to={filters.admittedTo}
            onChange={onDates}
          />
        </FilterBar>

        <ActiveFilters
          total={data?.meta.total}
          filters={active}
          onClear={() => clearFilters(['limit'])}
        />

        {isError ? (
          <ErrorState message={errorMessage(error)} onRetry={() => refetch()} />
        ) : (
          <>
            <PatientsTable
              rows={data?.data}
              loading={isPending}
              stale={isPlaceholderData}
              limit={filters.limit}
              onEdit={canEdit ? onEdit : undefined}
              onDelete={canEdit ? onDelete : undefined}
              empty={
                <EmptyState
                  compact
                  title={active.length ? 'No patients match these filters' : 'No patients yet'}
                  description={
                    active.length
                      ? 'Try a different search or clear the filters.'
                      : 'Add a patient to get started.'
                  }
                  action={
                    active.length > 0 && (
                      <Button
                        variant="outlined"
                        color="inherit"
                        onClick={() => clearFilters(['limit'])}
                      >
                        Clear filters
                      </Button>
                    )
                  }
                />
              }
            />
            <TablePaginationBar
              page={filters.page}
              limit={filters.limit}
              total={data?.meta.total ?? 0}
              onChange={onPage}
            />
          </>
        )}
      </Card>

      <PatientFormDialog
        key={dialog.key}
        open={dialog.open}
        patient={dialog.patient}
        onClose={() => setDialog((d) => ({ ...d, open: false }))}
      />

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Delete patient?"
        content={
          <>
            <strong>{toDelete?.name}</strong> will be permanently deleted. This can’t be undone.
          </>
        }
        loading={deletePatient.isPending}
        onConfirm={confirmDelete}
        onClose={() => setToDelete(null)}
      />
    </Stack>
  );
}
