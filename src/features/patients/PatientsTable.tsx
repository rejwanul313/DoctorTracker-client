'use client';

import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import NextLink from 'next/link';
import { memo, type ReactNode } from 'react';
import type { PatientDTO } from '@dt/shared';
import { Icon } from '@/components/ui/Icon';
import { InitialsAvatar } from '@/components/ui/InitialsAvatar';
import { ConditionLabel } from '@/components/ui/Label';
import { TableMessageRow, TableRowsSkeleton } from '@/components/ui/States';
import { fDate } from '@/lib/format';

const HIDE_XS = { display: { xs: 'none', sm: 'table-cell' } };

interface RowProps {
  patient: PatientDTO;
  onEdit?: (patient: PatientDTO) => void;
  onDelete?: (patient: PatientDTO) => void;
}

const PatientRow = memo(function PatientRow({ patient, onEdit, onDelete }: RowProps) {
  return (
    <TableRow hover>
      <TableCell sx={{ maxWidth: 300 }}>
        <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
          <InitialsAvatar name={patient.name} />
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="subtitle2" sx={{ color: 'text.primary' }} noWrap>
              {patient.name}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }} noWrap>
              {patient.email || patient.phone}
            </Typography>
            {/* Phones: condition sits with the name instead of in a far-right column. */}
            <Box sx={{ display: { xs: 'block', sm: 'none' }, mt: 0.5 }}>
              <ConditionLabel condition={patient.condition} />
            </Box>
          </Box>
        </Stack>
      </TableCell>
      <TableCell sx={{ whiteSpace: 'nowrap' }}>
        {patient.doctor ? (
          <Link
            component={NextLink}
            href={`/doctors/${patient.doctor._id}`}
            color="inherit"
            underline="hover"
          >
            {patient.doctor.name}
          </Link>
        ) : (
          <Box component="span" sx={{ color: 'text.disabled', fontStyle: 'italic' }}>
            Unassigned
          </Box>
        )}
      </TableCell>
      <TableCell sx={{ whiteSpace: 'nowrap' }}>
        {patient.age} · {patient.gender}
      </TableCell>
      <TableCell sx={{ whiteSpace: 'nowrap' }}>{fDate(patient.admittedAt)}</TableCell>
      <TableCell sx={HIDE_XS}>
        <ConditionLabel condition={patient.condition} />
      </TableCell>
      {(onEdit || onDelete) && (
        <TableCell align="right" sx={{ whiteSpace: 'nowrap', px: 1 }}>
          {onEdit && (
            <Tooltip title="Edit">
              <IconButton aria-label={`Edit ${patient.name}`} onClick={() => onEdit(patient)}>
                <Icon name="edit" sx={{ fontSize: 20 }} />
              </IconButton>
            </Tooltip>
          )}
          {onDelete && (
            <Tooltip title="Delete">
              <IconButton
                aria-label={`Delete ${patient.name}`}
                onClick={() => onDelete(patient)}
                sx={{ color: 'error.main' }}
              >
                <Icon name="trash" sx={{ fontSize: 20 }} />
              </IconButton>
            </Tooltip>
          )}
        </TableCell>
      )}
    </TableRow>
  );
});

interface TableProps {
  rows: PatientDTO[] | undefined;
  loading: boolean;
  stale: boolean;
  limit: number;
  empty: ReactNode;
  onEdit?: RowProps['onEdit'];
  onDelete?: RowProps['onDelete'];
}

export function PatientsTable({
  rows,
  loading,
  stale,
  limit,
  empty,
  onEdit,
  onDelete,
}: TableProps) {
  const actions = Boolean(onEdit || onDelete);
  const columns = actions ? 6 : 5;
  return (
    <Box sx={{ overflowX: 'auto' }}>
      <Table sx={{ minWidth: { xs: 640, sm: 860 } }} aria-busy={loading || stale}>
        <TableHead>
          <TableRow>
            <TableCell>Patient</TableCell>
            <TableCell>Doctor</TableCell>
            <TableCell>Age · Gender</TableCell>
            <TableCell>Admitted</TableCell>
            <TableCell sx={HIDE_XS}>Condition</TableCell>
            {actions && <TableCell align="right" aria-label="Actions" />}
          </TableRow>
        </TableHead>
        <TableBody sx={{ opacity: stale ? 0.56 : 1, transition: 'opacity 150ms' }}>
          {loading ? (
            <TableRowsSkeleton rows={Math.min(limit, 8)} columns={columns} />
          ) : rows && rows.length > 0 ? (
            rows.map((p) => (
              <PatientRow key={p._id} patient={p} onEdit={onEdit} onDelete={onDelete} />
            ))
          ) : (
            <TableMessageRow columns={columns}>{empty}</TableMessageRow>
          )}
        </TableBody>
      </Table>
    </Box>
  );
}
