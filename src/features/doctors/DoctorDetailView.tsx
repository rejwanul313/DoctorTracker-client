'use client';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Divider from '@mui/material/Divider';
import Link from '@mui/material/Link';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import { memo, useCallback, useState, type ReactNode } from 'react';
import type { DoctorDetail, PatientDTO } from '@dt/shared';
import { Icon } from '@/components/ui/Icon';
import { InitialsAvatar } from '@/components/ui/InitialsAvatar';
import { ConditionLabel, Label } from '@/components/ui/Label';
import { PageHeader } from '@/components/ui/PageHeader';
import { SearchField } from '@/components/ui/SearchField';
import { EmptyState, ErrorState, TableMessageRow, TableRowsSkeleton } from '@/components/ui/States';
import { TablePaginationBar } from '@/components/ui/TablePaginationBar';
import { useCanEdit } from '@/features/auth/hooks';
import { useUpdatePatient } from '@/features/patients/hooks';
import { PatientFormDialog } from '@/features/patients/PatientFormDialog';
import { param, useUrlFilters } from '@/hooks/useUrlFilters';
import { ApiError, errorMessage } from '@/lib/apiClient';
import { fDate, fNumber } from '@/lib/format';
import { useToast } from '@/lib/toast';
import type { DoctorPatientsParams } from './api';
import { DoctorFormDialog } from './DoctorFormDialog';
import { useDoctor, useDoctorPatients, useUnassignPatient } from './hooks';

const PAGE_SIZES = [5, 10, 25] as const;

function parseFilters(p: URLSearchParams): DoctorPatientsParams {
  return {
    page: param.int(p, 'page', 1),
    limit: param.int(p, 'limit', 5, PAGE_SIZES),
    search: param.str(p, 'search'),
  };
}

function DetailRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: '88px minmax(0, 1fr)',
        gap: 2,
        typography: 'body2',
      }}
    >
      <Box component="span" sx={{ color: 'text.secondary' }}>
        {label}
      </Box>
      <Box component="span" sx={{ overflowWrap: 'anywhere' }}>
        {children}
      </Box>
    </Box>
  );
}

function ProfileCard({ doctor }: { doctor?: DoctorDetail }) {
  const stats = doctor
    ? [
        { label: 'Patients', value: doctor.stats.total },
        { label: 'Stable', value: doctor.stats.byCondition.Stable },
        { label: 'Critical', value: doctor.stats.byCondition.Critical },
      ]
    : [];
  return (
    <Card>
      <Stack spacing={1.5} sx={{ alignItems: 'center', textAlign: 'center', p: '40px 24px 24px' }}>
        {doctor ? (
          <>
            <InitialsAvatar name={doctor.name} size={72} />
            <Typography variant="subtitle1">{doctor.name}</Typography>
            <Label color="primary">{doctor.specialization}</Label>
          </>
        ) : (
          <>
            <Skeleton variant="circular" width={72} height={72} />
            <Skeleton width={160} />
            <Skeleton width={90} />
          </>
        )}
      </Stack>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          borderTop: (t) => `1px dashed ${t.vars.palette.divider}`,
          borderBottom: (t) => `1px dashed ${t.vars.palette.divider}`,
        }}
      >
        {(doctor ? stats : [0, 1, 2].map((i) => ({ label: String(i), value: null }))).map(
          (s, i) => (
            <Box
              key={s.label}
              sx={{
                py: 2,
                textAlign: 'center',
                borderLeft: (t) => (i ? `1px dashed ${t.vars.palette.divider}` : 'none'),
              }}
            >
              <Typography variant="h6" component="div">
                {s.value === null ? <Skeleton width={32} sx={{ mx: 'auto' }} /> : fNumber(s.value)}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {doctor ? s.label : <Skeleton width={48} sx={{ mx: 'auto' }} />}
              </Typography>
            </Box>
          ),
        )}
      </Box>
      <Stack spacing={1.5} sx={{ p: 3 }}>
        {doctor ? (
          <>
            <DetailRow label="Hospital">{doctor.hospital}</DetailRow>
            <DetailRow label="Phone">
              <Link href={`tel:${doctor.phone.replace(/[^\d+]/g, '')}`} color="inherit">
                {doctor.phone}
              </Link>
            </DetailRow>
            <DetailRow label="Email">
              <Link href={`mailto:${doctor.email}`} color="inherit">
                {doctor.email}
              </Link>
            </DetailRow>
            <DetailRow label="Joined">{fDate(doctor.createdAt)}</DetailRow>
          </>
        ) : (
          [0, 1, 2, 3].map((i) => <Skeleton key={i} />)
        )}
      </Stack>
    </Card>
  );
}

interface RowProps {
  patient: PatientDTO;
  onRemove?: (p: PatientDTO) => void;
}

const DoctorPatientRow = memo(function DoctorPatientRow({ patient, onRemove }: RowProps) {
  return (
    <TableRow hover>
      <TableCell>
        <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
          <InitialsAvatar name={patient.name} />
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="subtitle2" sx={{ color: 'text.primary' }} noWrap>
              {patient.name}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }} noWrap>
              {patient.phone}
            </Typography>
          </Box>
        </Stack>
      </TableCell>
      <TableCell sx={{ whiteSpace: 'nowrap' }}>
        {patient.age} · {patient.gender}
      </TableCell>
      <TableCell sx={{ whiteSpace: 'nowrap' }}>{fDate(patient.admittedAt)}</TableCell>
      <TableCell>
        <ConditionLabel condition={patient.condition} />
      </TableCell>
      {onRemove && (
        <TableCell align="right">
          <Button
            variant="soft"
            color="error"
            size="small"
            onClick={() => onRemove(patient)}
            aria-label={`Remove ${patient.name} from this doctor's list`}
          >
            Remove
          </Button>
        </TableCell>
      )}
    </TableRow>
  );
});

export function DoctorDetailView({ id }: { id: string }) {
  const toast = useToast();
  const canEdit = useCanEdit();
  const { filters, setFilters } = useUrlFilters(parseFilters);
  const doctor = useDoctor(id);
  const patients = useDoctorPatients(id, filters);
  const unassign = useUnassignPatient(id);
  const reassign = useUpdatePatient();

  const [editKey, setEditKey] = useState(0);
  const [editOpen, setEditOpen] = useState(false);
  const [addKey, setAddKey] = useState(0);
  const [addOpen, setAddOpen] = useState(false);

  const d = doctor.data;
  const lastName = d?.name.split(' ').at(-1);

  const onSearch = useCallback((search: string) => setFilters({ search }), [setFilters]);
  const onPage = useCallback(
    ({ page, limit }: { page?: number; limit?: number }) =>
      setFilters(limit ? { limit } : { page }),
    [setFilters],
  );

  const onRemove = useCallback(
    (patient: PatientDTO) => {
      unassign.mutate(patient, {
        onSuccess: () =>
          toast(
            <>
              <strong>{patient.name}</strong> removed from {d ? `Dr. ${lastName}'s` : 'this'} list
            </>,
            {
              severity: 'info',
              action: {
                label: 'Undo',
                onClick: () =>
                  reassign.mutate(
                    { id: patient._id, body: { doctor: id } },
                    { onError: (err) => toast(errorMessage(err), { severity: 'error' }) },
                  ),
              },
            },
          ),
        onError: (err) => toast(errorMessage(err), { severity: 'error' }),
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mutation objects are stable
    [id, d, lastName, toast],
  );

  if (doctor.isError) {
    const notFound = doctor.error instanceof ApiError && doctor.error.status === 404;
    return (
      <Card sx={{ mt: 4 }}>
        {notFound ? (
          <EmptyState
            icon="doctor"
            title="Doctor not found"
            description="This doctor may have been deleted."
            action={
              <Button href="/doctors" variant="outlined" color="inherit">
                Back to doctors
              </Button>
            }
          />
        ) : (
          <ErrorState message={errorMessage(doctor.error)} onRetry={() => doctor.refetch()} />
        )}
      </Card>
    );
  }

  const columns = canEdit ? 5 : 4;
  const total = patients.data?.meta.total;

  return (
    <Stack spacing={5}>
      <PageHeader
        title={d?.name ?? <Skeleton width={260} />}
        crumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Doctors', href: '/doctors' },
          { label: d?.name ?? '…' },
        ]}
        actions={
          canEdit &&
          d && (
            <>
              <Button
                variant="outlined"
                color="inherit"
                startIcon={<Icon name="edit" />}
                onClick={() => {
                  setEditKey((k) => k + 1);
                  setEditOpen(true);
                }}
              >
                Edit doctor
              </Button>
              <Button
                variant="contained"
                color="inherit"
                startIcon={<Icon name="plus" strokeWidth={2.4} />}
                onClick={() => {
                  setAddKey((k) => k + 1);
                  setAddOpen(true);
                }}
              >
                Add patient
              </Button>
            </>
          )
        }
      />

      <Box
        sx={{
          display: 'grid',
          gap: 3,
          gridTemplateColumns: { xs: '1fr', md: '320px minmax(0, 1fr)' },
          alignItems: 'start',
        }}
      >
        <ProfileCard doctor={d} />

        <Card>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            sx={{
              p: 3,
              pb: 2.5,
              alignItems: { sm: 'flex-start' },
              justifyContent: 'space-between',
            }}
          >
            <Box>
              <Typography variant="h6" component="h2">
                Patients{' '}
                <Box component="span" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                  ({total === undefined ? '…' : fNumber(total)})
                </Box>
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                Removing a patient unassigns them. They stay in Patients.
              </Typography>
            </Box>
            <Box sx={{ width: { xs: 1, sm: 260 }, flexShrink: 0 }}>
              <SearchField
                size="small"
                value={filters.search ?? ''}
                onSearch={onSearch}
                placeholder="Search patients…"
              />
            </Box>
          </Stack>
          <Divider sx={{ borderStyle: 'dashed' }} />

          {patients.isError ? (
            <ErrorState message={errorMessage(patients.error)} onRetry={() => patients.refetch()} />
          ) : (
            <>
              <Box sx={{ overflowX: 'auto' }}>
                <Table sx={{ minWidth: 640 }} aria-busy={patients.isFetching}>
                  <TableHead>
                    <TableRow>
                      <TableCell>Patient</TableCell>
                      <TableCell>Age · Gender</TableCell>
                      <TableCell>Admitted</TableCell>
                      <TableCell>Condition</TableCell>
                      {canEdit && <TableCell align="right">Action</TableCell>}
                    </TableRow>
                  </TableHead>
                  <TableBody
                    sx={{
                      opacity: patients.isPlaceholderData ? 0.56 : 1,
                      transition: 'opacity 150ms',
                    }}
                  >
                    {patients.isPending ? (
                      <TableRowsSkeleton rows={filters.limit} columns={columns} />
                    ) : patients.data.data.length ? (
                      patients.data.data.map((p) => (
                        <DoctorPatientRow
                          key={p._id}
                          patient={p}
                          onRemove={canEdit ? onRemove : undefined}
                        />
                      ))
                    ) : (
                      <TableMessageRow columns={columns}>
                        <EmptyState
                          compact
                          icon="patients"
                          title={
                            filters.search ? 'No matching patients' : 'No patients assigned yet'
                          }
                          description={
                            filters.search
                              ? `Nobody in this list matches “${filters.search}”.`
                              : canEdit
                                ? 'Use “Add patient” to assign the first one.'
                                : undefined
                          }
                        />
                      </TableMessageRow>
                    )}
                  </TableBody>
                </Table>
              </Box>
              <TablePaginationBar
                page={filters.page}
                limit={filters.limit}
                total={total ?? 0}
                onChange={onPage}
                pageSizes={PAGE_SIZES}
              />
            </>
          )}
        </Card>
      </Box>

      {d && (
        <>
          <DoctorFormDialog
            key={`edit-${editKey}`}
            open={editOpen}
            doctor={d}
            onClose={() => setEditOpen(false)}
          />
          <PatientFormDialog
            key={`add-${addKey}`}
            open={addOpen}
            fixedDoctor={{ _id: d._id, name: d.name }}
            onClose={() => setAddOpen(false)}
          />
        </>
      )}
    </Stack>
  );
}
