'use client';

import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Link from '@mui/material/Link';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import NextLink from 'next/link';
import { memo, type MouseEvent, type ReactNode } from 'react';
import type { DoctorListItem } from '@dt/shared';
import { Icon } from '@/components/ui/Icon';
import { InitialsAvatar } from '@/components/ui/InitialsAvatar';
import { TableMessageRow, TableRowsSkeleton } from '@/components/ui/States';
import { fDate, fNumber } from '@/lib/format';

const COLUMNS = 7;

interface RowProps {
  doctor: DoctorListItem;
  onMenu?: (event: MouseEvent<HTMLElement>, doctor: DoctorListItem) => void;
}

/** Memoized: re-renders only when its own doctor object changes. */
const DoctorRow = memo(function DoctorRow({ doctor, onMenu }: RowProps) {
  return (
    <TableRow hover>
      <TableCell sx={{ maxWidth: 300 }}>
        <Link
          component={NextLink}
          href={`/doctors/${doctor._id}`}
          underline="none"
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            color: 'inherit',
            '&:hover .name': { textDecoration: 'underline' },
          }}
        >
          <InitialsAvatar name={doctor.name} />
          <Box sx={{ minWidth: 0 }}>
            <Typography className="name" variant="subtitle2" sx={{ color: 'text.primary' }} noWrap>
              {doctor.name}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }} noWrap>
              {doctor.email}
            </Typography>
          </Box>
        </Link>
      </TableCell>
      <TableCell sx={{ whiteSpace: 'nowrap' }}>{doctor.specialization}</TableCell>
      <TableCell sx={{ whiteSpace: 'nowrap' }}>{doctor.hospital}</TableCell>
      <TableCell sx={{ whiteSpace: 'nowrap' }}>{doctor.phone}</TableCell>
      <TableCell align="right" sx={{ color: 'text.primary', fontWeight: 600 }}>
        {fNumber(doctor.patientCount)}
      </TableCell>
      <TableCell sx={{ whiteSpace: 'nowrap' }}>{fDate(doctor.createdAt)}</TableCell>
      <TableCell align="right" sx={{ width: 56, px: 1 }}>
        {onMenu && (
          <IconButton aria-label={`Actions for ${doctor.name}`} onClick={(e) => onMenu(e, doctor)}>
            <Icon name="more" sx={{ fontSize: 20 }} />
          </IconButton>
        )}
      </TableCell>
    </TableRow>
  );
});

interface TableProps {
  rows: DoctorListItem[] | undefined;
  loading: boolean;
  stale: boolean;
  limit: number;
  empty: ReactNode;
  onMenu?: RowProps['onMenu'];
}

export function DoctorsTable({ rows, loading, stale, limit, empty, onMenu }: TableProps) {
  return (
    <Box sx={{ overflowX: 'auto' }}>
      <Table sx={{ minWidth: 960, tableLayout: 'auto' }} aria-busy={loading || stale}>
        <TableHead>
          <TableRow>
            <TableCell>Doctor</TableCell>
            <TableCell>Specialization</TableCell>
            <TableCell>Hospital</TableCell>
            <TableCell>Phone</TableCell>
            <TableCell align="right">Patients</TableCell>
            <TableCell>Joined</TableCell>
            <TableCell aria-label="Actions" />
          </TableRow>
        </TableHead>
        <TableBody sx={{ opacity: stale ? 0.56 : 1, transition: 'opacity 150ms' }}>
          {loading ? (
            <TableRowsSkeleton rows={Math.min(limit, 8)} columns={COLUMNS} />
          ) : rows && rows.length > 0 ? (
            rows.map((d) => <DoctorRow key={d._id} doctor={d} onMenu={onMenu} />)
          ) : (
            <TableMessageRow columns={COLUMNS}>{empty}</TableMessageRow>
          )}
        </TableBody>
      </Table>
    </Box>
  );
}
