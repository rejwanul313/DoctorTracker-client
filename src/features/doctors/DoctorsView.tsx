'use client';

import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import ListItemIcon from '@mui/material/ListItemIcon';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import { useRouter } from 'next/navigation';
import { useCallback, useMemo, useState, type MouseEvent } from 'react';
import { PAGE_SIZES, SPECIALIZATIONS, type DoctorListItem } from '@dt/shared';
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
import { param, useUrlFilters } from '@/hooks/useUrlFilters';
import { errorMessage } from '@/lib/apiClient';
import { fDate } from '@/lib/format';
import { useToast } from '@/lib/toast';
import type { DoctorListParams } from './api';
import { DoctorFormDialog } from './DoctorFormDialog';
import { DoctorsTable } from './DoctorsTable';
import { useDeleteDoctor, useDoctors, useHospitals } from './hooks';

function parseFilters(p: URLSearchParams): DoctorListParams {
  return {
    page: param.int(p, 'page', 1),
    limit: param.int(p, 'limit', 10, PAGE_SIZES),
    search: param.str(p, 'search'),
    specialization: param.oneOf(p, 'specialization', SPECIALIZATIONS),
    hospital: param.str(p, 'hospital'),
    joinedFrom: param.str(p, 'joinedFrom'),
    joinedTo: param.str(p, 'joinedTo'),
  };
}

type DialogState = { open: boolean; doctor?: DoctorListItem; key: number };

export function DoctorsView() {
  const router = useRouter();
  const toast = useToast();
  const canEdit = useCanEdit();
  const { filters, setFilters, clearFilters } = useUrlFilters(parseFilters);
  const { data, isPending, isError, error, refetch, isPlaceholderData } = useDoctors(filters);
  const hospitals = useHospitals();
  const deleteDoctor = useDeleteDoctor();

  const [dialog, setDialog] = useState<DialogState>({ open: false, key: 0 });
  const [menu, setMenu] = useState<{ anchor: HTMLElement; doctor: DoctorListItem } | null>(null);
  const [toDelete, setToDelete] = useState<DoctorListItem | null>(null);

  const facets = data?.meta.facets?.specialization;
  const tabs = useMemo<FilterTab[]>(
    () => [
      { value: 'all', label: 'All', count: facets?.all },
      ...SPECIALIZATIONS.filter((s) => !facets || facets[s] || s === filters.specialization).map(
        (s) => ({
          value: s,
          label: s,
          count: facets ? (facets[s] ?? 0) : undefined,
        }),
      ),
    ],
    [facets, filters.specialization],
  );

  const onTab = useCallback(
    (v: string) => setFilters({ specialization: v === 'all' ? undefined : v }),
    [setFilters],
  );
  const onSearch = useCallback((search: string) => setFilters({ search }), [setFilters]);
  const onDates = useCallback(
    ({ from, to }: { from?: string; to?: string }) =>
      setFilters({ joinedFrom: from, joinedTo: to }),
    [setFilters],
  );
  const onPage = useCallback(
    ({ page, limit }: { page?: number; limit?: number }) =>
      setFilters(limit ? { limit } : { page }),
    [setFilters],
  );
  const onMenu = useCallback((e: MouseEvent<HTMLElement>, doctor: DoctorListItem) => {
    setMenu({ anchor: e.currentTarget, doctor });
  }, []);

  const active: ActiveFilter[] = [];
  if (filters.specialization)
    active.push({
      key: 'spec',
      group: 'Specialization',
      label: filters.specialization,
      onRemove: () => onTab('all'),
    });
  if (filters.hospital)
    active.push({
      key: 'hospital',
      group: 'Hospital',
      label: filters.hospital,
      onRemove: () => setFilters({ hospital: undefined }),
    });
  if (filters.joinedFrom || filters.joinedTo)
    active.push({
      key: 'joined',
      group: 'Joined',
      label: `${filters.joinedFrom ? fDate(filters.joinedFrom) : '…'} – ${filters.joinedTo ? fDate(filters.joinedTo) : '…'}`,
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
    deleteDoctor.mutate(toDelete._id, {
      onSuccess: () => {
        toast(`${toDelete.name} deleted. Their patients are now unassigned.`);
        setToDelete(null);
      },
      onError: (err) => toast(errorMessage(err), { severity: 'error' }),
    });
  };

  return (
    <Stack spacing={5}>
      <PageHeader
        title="Doctors"
        crumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Doctors' }]}
        actions={
          canEdit && (
            <Button
              variant="contained"
              color="inherit"
              startIcon={<Icon name="plus" strokeWidth={2.4} />}
              onClick={() => setDialog((d) => ({ open: true, key: d.key + 1 }))}
            >
              Add doctor
            </Button>
          )
        }
      />

      <Card>
        <FilterTabs
          tabs={tabs}
          value={filters.specialization ?? 'all'}
          onChange={onTab}
          ariaLabel="Filter by specialization"
        />

        <FilterBar
          activeCount={
            [filters.hospital, filters.joinedFrom || filters.joinedTo].filter(Boolean).length
          }
          search={
            <SearchField
              value={filters.search ?? ''}
              onSearch={onSearch}
              placeholder="Search by name, email or phone…"
            />
          }
        >
          <TextField
            select
            label="Hospital"
            value={filters.hospital ?? ''}
            onChange={(e) => setFilters({ hospital: e.target.value })}
            sx={{ width: { xs: '100%', sm: 220 } }}
            slotProps={{ inputLabel: { shrink: true }, select: { displayEmpty: true } }}
          >
            <MenuItem value="">All hospitals</MenuItem>
            {(hospitals.data ?? []).map((h) => (
              <MenuItem key={h} value={h}>
                {h}
              </MenuItem>
            ))}
          </TextField>
          <DateRangeFields
            fromLabel="Joined from"
            toLabel="Joined to"
            from={filters.joinedFrom}
            to={filters.joinedTo}
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
            <DoctorsTable
              rows={data?.data}
              loading={isPending}
              stale={isPlaceholderData}
              limit={filters.limit}
              onMenu={onMenu}
              empty={
                active.length > 0 ? (
                  <EmptyState
                    compact
                    title="No doctors match these filters"
                    description="Try a different search or clear the filters."
                    action={
                      <Button
                        variant="outlined"
                        color="inherit"
                        onClick={() => clearFilters(['limit'])}
                      >
                        Clear filters
                      </Button>
                    }
                  />
                ) : (
                  <EmptyState
                    compact
                    title="No doctors yet"
                    description="Add your first doctor to get started."
                  />
                )
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

      <Menu
        anchorEl={menu?.anchor}
        open={Boolean(menu)}
        onClose={() => setMenu(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{ paper: { sx: { width: 160 } } }}
      >
        <MenuItem
          onClick={() => {
            if (menu) router.push(`/doctors/${menu.doctor._id}`);
            setMenu(null);
          }}
        >
          <ListItemIcon>
            <Icon name="eye" fontSize="small" />
          </ListItemIcon>
          View
        </MenuItem>
        {canEdit && (
          <MenuItem
            onClick={() => {
              if (menu) setDialog((d) => ({ open: true, doctor: menu.doctor, key: d.key + 1 }));
              setMenu(null);
            }}
          >
            <ListItemIcon>
              <Icon name="edit" fontSize="small" />
            </ListItemIcon>
            Edit
          </MenuItem>
        )}
        {canEdit && (
          <MenuItem
            sx={{ color: 'error.main' }}
            onClick={() => {
              if (menu) setToDelete(menu.doctor);
              setMenu(null);
            }}
          >
            <ListItemIcon sx={{ color: 'inherit' }}>
              <Icon name="trash" fontSize="small" />
            </ListItemIcon>
            Delete
          </MenuItem>
        )}
      </Menu>

      <DoctorFormDialog
        key={dialog.key}
        open={dialog.open}
        doctor={dialog.doctor}
        onClose={() => setDialog((d) => ({ ...d, open: false }))}
      />

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Delete doctor?"
        content={
          <>
            <strong>{toDelete?.name}</strong> will be deleted. Their {toDelete?.patientCount ?? 0}{' '}
            patients stay in Patients as <em>Unassigned</em>.
          </>
        }
        loading={deleteDoctor.isPending}
        onConfirm={confirmDelete}
        onClose={() => setToDelete(null)}
      />
    </Stack>
  );
}
