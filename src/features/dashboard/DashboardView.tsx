'use client';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import LinearProgress from '@mui/material/LinearProgress';
import Link from '@mui/material/Link';
import MenuItem from '@mui/material/MenuItem';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import dynamic from 'next/dynamic';
import NextLink from 'next/link';
import { useState } from 'react';
import type { StatsOverview } from '@dt/shared';
import { LegendItem } from '@/components/charts/ChartTooltip';
import { StatCard } from '@/components/charts/StatCard';
import { Icon } from '@/components/ui/Icon';
import { ConditionLabel } from '@/components/ui/Label';
import { ErrorState } from '@/components/ui/States';
import { useCanEdit, useMe } from '@/features/auth/hooks';
import { DoctorFormDialog } from '@/features/doctors/DoctorFormDialog';
import { errorMessage } from '@/lib/apiClient';
import { CONDITION_CHART_ORDER, CONDITION_HEX } from '@/lib/conditions';
import { fDate, fNumber } from '@/lib/format';
import { palette, seriesColors } from '@/theme/tokens';
import { useStatsOverview, useTimeline } from './hooks';

// Charts are client-only and code-split: the dashboard shell paints before recharts loads.
const AdmissionsChart = dynamic(() => import('@/components/charts/AdmissionsChart'), {
  ssr: false,
  loading: () => <Skeleton variant="rounded" height={300} />,
});
const ConditionDonut = dynamic(() => import('@/components/charts/ConditionDonut'), {
  ssr: false,
  loading: () => <Skeleton variant="circular" width={220} height={220} sx={{ mx: 'auto' }} />,
});

const RANGES = [6, 12, 24] as const;

function AdmissionsCard() {
  const [months, setMonths] = useState<(typeof RANGES)[number]>(12);
  const { data, isError, error, refetch } = useTimeline(months);
  const totals = data?.reduce(
    (acc, p) => ({
      admitted: acc.admitted + p.admitted,
      discharged: acc.discharged + p.discharged,
    }),
    { admitted: 0, discharged: 0 },
  );

  return (
    <Card sx={{ height: 1 }}>
      <CardHeader
        title="Patients over time"
        subheader="Admissions and discharges per month · current month to date"
        action={
          <TextField
            select
            size="small"
            value={months}
            onChange={(e) => setMonths(Number(e.target.value) as (typeof RANGES)[number])}
            slotProps={{ htmlInput: { 'aria-label': 'Time range' } }}
            sx={{ '& .MuiSelect-select': { py: 0.75, fontSize: 14, fontWeight: 600 } }}
          >
            {RANGES.map((r) => (
              <MenuItem key={r} value={r}>
                Last {r} months
              </MenuItem>
            ))}
          </TextField>
        }
      />
      <Box sx={{ p: 3, pt: 2 }}>
        <Box
          component="ul"
          aria-label="Legend"
          sx={{ listStyle: 'none', m: 0, p: 0, mb: 2, display: 'flex', flexWrap: 'wrap', gap: 3 }}
        >
          <LegendItem
            color={seriesColors.admitted}
            label="Admitted"
            value={totals ? fNumber(totals.admitted) : '…'}
          />
          <LegendItem
            color={seriesColors.discharged}
            label="Discharged"
            value={totals ? fNumber(totals.discharged) : '…'}
          />
        </Box>
        {isError ? (
          <ErrorState message={errorMessage(error)} onRetry={() => refetch()} />
        ) : data ? (
          <AdmissionsChart data={data} />
        ) : (
          <Skeleton variant="rounded" height={300} />
        )}
      </Box>
    </Card>
  );
}

function ConditionCard({ data }: { data?: StatsOverview }) {
  const total = data ? Object.values(data.byCondition).reduce((a, b) => a + b, 0) : 0;
  return (
    <Card sx={{ height: 1, display: 'flex', flexDirection: 'column' }}>
      <CardHeader
        title="Patients by condition"
        subheader={data ? `All ${fNumber(total)} patients` : ' '}
      />
      <Box sx={{ p: 3, flex: 1, display: 'flex', alignItems: 'center' }}>
        {data ? (
          <ConditionDonut data={data.byCondition} />
        ) : (
          <Skeleton variant="circular" width={220} height={220} sx={{ mx: 'auto' }} />
        )}
      </Box>
      <Box
        component="ul"
        aria-label="Legend"
        sx={{
          listStyle: 'none',
          m: 0,
          p: 3,
          display: 'grid',
          gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
          gap: 1.5,
          borderTop: (t) => `1px dashed ${t.vars.palette.divider}`,
        }}
      >
        {CONDITION_CHART_ORDER.map((c) => (
          <LegendItem
            key={c}
            color={CONDITION_HEX[c]}
            label={c}
            value={data ? fNumber(data.byCondition[c]) : '…'}
          />
        ))}
      </Box>
    </Card>
  );
}

function TopDoctorsCard({ data }: { data?: StatsOverview }) {
  const max = Math.max(1, ...(data?.topDoctors.map((d) => d.patients) ?? [1]));
  return (
    <Card sx={{ height: 1 }}>
      <CardHeader title="Patients per doctor" subheader="Top 6 by assigned patients" />
      <Stack component="ol" spacing={2.5} sx={{ listStyle: 'none', m: 0, p: 3 }}>
        {data
          ? data.topDoctors.map((d) => (
              <li key={d._id}>
                <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mb: 1 }}>
                  <Link
                    component={NextLink}
                    href={`/doctors/${d._id}`}
                    color="text.primary"
                    underline="hover"
                    variant="subtitle2"
                    noWrap
                  >
                    {d.name}
                  </Link>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }} noWrap>
                    {d.specialization}
                  </Typography>
                  <Typography variant="subtitle2" sx={{ ml: 'auto' }}>
                    {fNumber(d.patients)}
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={(d.patients / max) * 100}
                  aria-label={`${d.name}: ${d.patients} patients`}
                  sx={(t) => ({
                    bgcolor: t.alpha(t.vars.palette.primary.main, 0.12),
                    '& .MuiLinearProgress-bar': { bgcolor: palette.primary.main },
                  })}
                />
              </li>
            ))
          : Array.from({ length: 6 }, (_, i) => (
              <li key={i}>
                <Skeleton width="60%" />
                <Skeleton variant="rounded" height={8} />
              </li>
            ))}
        {data?.topDoctors.length === 0 && (
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            No patients are assigned yet.
          </Typography>
        )}
      </Stack>
    </Card>
  );
}

function RecentPatientsCard({ data }: { data?: StatsOverview }) {
  return (
    <Card sx={{ height: 1 }}>
      <CardHeader
        title="Recently admitted"
        subheader="Latest 5 patients"
        action={
          <Button
            component={NextLink}
            href="/patients"
            size="small"
            color="inherit"
            endIcon={<Icon name="arrowRight" />}
          >
            View all
          </Button>
        }
      />
      <Box sx={{ overflowX: 'auto', mt: 3 }}>
        <Table sx={{ minWidth: 520 }}>
          <TableHead>
            <TableRow>
              <TableCell>Patient</TableCell>
              <TableCell>Doctor</TableCell>
              <TableCell>Admitted</TableCell>
              <TableCell>Condition</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data
              ? data.recentPatients.map((p) => (
                  <TableRow key={p._id} hover>
                    <TableCell
                      sx={{ color: 'text.primary', fontWeight: 600, whiteSpace: 'nowrap' }}
                    >
                      {p.name}
                    </TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap' }}>
                      {p.doctor ? (
                        <Link
                          component={NextLink}
                          href={`/doctors/${p.doctor._id}`}
                          color="inherit"
                          underline="hover"
                        >
                          {p.doctor.name}
                        </Link>
                      ) : (
                        <Box component="span" sx={{ color: 'text.disabled', fontStyle: 'italic' }}>
                          Unassigned
                        </Box>
                      )}
                    </TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap' }}>{fDate(p.admittedAt)}</TableCell>
                    <TableCell>
                      <ConditionLabel condition={p.condition} />
                    </TableCell>
                  </TableRow>
                ))
              : Array.from({ length: 5 }, (_, i) => (
                  <TableRow key={i}>
                    {[0, 1, 2, 3].map((c) => (
                      <TableCell key={c}>
                        <Skeleton />
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
          </TableBody>
        </Table>
      </Box>
    </Card>
  );
}

export function DashboardView() {
  const { data, isError, error, refetch } = useStatsOverview();
  const { data: me } = useMe();
  const canEdit = useCanEdit();
  const [addKey, setAddKey] = useState(0);
  const [addOpen, setAddOpen] = useState(false);
  const firstName = me?.name.split(' ')[0];

  return (
    <Stack spacing={3}>
      <Stack
        direction="row"
        useFlexGap
        sx={{ flexWrap: 'wrap', alignItems: 'flex-end', gap: 2, mb: 2 }}
      >
        <Box sx={{ flex: '1 1 320px' }}>
          <Typography variant="h4" component="h1">
            Hi{firstName ? `, ${firstName}` : ''} — welcome back
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
            Here’s how your doctors and patients are doing this month.
          </Typography>
        </Box>
        {canEdit && (
          <Button
            variant="contained"
            color="inherit"
            startIcon={<Icon name="plus" strokeWidth={2.4} />}
            onClick={() => {
              setAddKey((k) => k + 1);
              setAddOpen(true);
            }}
          >
            Add doctor
          </Button>
        )}
      </Stack>

      {isError ? (
        <Card>
          <ErrorState message={errorMessage(error)} onRetry={() => refetch()} />
        </Card>
      ) : (
        <>
          <Box
            sx={{
              display: 'grid',
              gap: { xs: 2, md: 3 },
              gridTemplateColumns: {
                xs: 'repeat(2, minmax(0, 1fr))',
                lg: 'repeat(4, minmax(0, 1fr))',
              },
            }}
          >
            <StatCard
              title="Total doctors"
              value={data?.totals.doctors}
              changePct={data?.deltas.doctors.changePct}
              spark={data?.sparklines.doctors}
              sparkColor={palette.primary.main}
            />
            <StatCard
              title="Total patients"
              value={data?.totals.patients}
              changePct={data?.deltas.patients.changePct}
              spark={data?.sparklines.patients}
              sparkColor={palette.info.dark}
            />
            <StatCard
              title="New this month"
              value={data?.deltas.newThisMonth.value}
              changePct={data?.deltas.newThisMonth.changePct}
              caption="vs same days last month"
              spark={data?.sparklines.patients}
              sparkColor={palette.warning.dark}
            />
            <StatCard
              title="Critical patients"
              value={data?.totals.critical}
              caption={
                data ? `${fNumber(data.criticalNewThisMonth)} admitted this month` : undefined
              }
              spark={data?.sparklines.critical}
              sparkColor={palette.error.dark}
            />
          </Box>

          <Box
            sx={{
              display: 'grid',
              gap: 3,
              gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 2fr) minmax(0, 1fr)' },
            }}
          >
            <AdmissionsCard />
            <ConditionCard data={data} />
          </Box>

          <Box
            sx={{
              display: 'grid',
              gap: 3,
              gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 5fr) minmax(0, 7fr)' },
            }}
          >
            <TopDoctorsCard data={data} />
            <RecentPatientsCard data={data} />
          </Box>
        </>
      )}

      {canEdit && (
        <DoctorFormDialog key={addKey} open={addOpen} onClose={() => setAddOpen(false)} />
      )}
    </Stack>
  );
}
