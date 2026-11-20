import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import type { ReactNode } from 'react';
import { Icon, type IconName } from './Icon';

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: ReactNode;
  icon?: IconName;
  compact?: boolean;
}

export function EmptyState({
  title,
  description,
  action,
  icon = 'inbox',
  compact,
}: EmptyStateProps) {
  return (
    <Stack
      spacing={1.5}
      sx={{ alignItems: 'center', textAlign: 'center', py: compact ? 4 : 8, px: 3 }}
    >
      <Box
        sx={{
          width: 64,
          height: 64,
          borderRadius: '50%',
          display: 'grid',
          placeItems: 'center',
          bgcolor: 'background.neutral',
          color: 'text.disabled',
        }}
      >
        <Icon name={icon} sx={{ fontSize: 30 }} strokeWidth={1.6} />
      </Box>
      <Typography variant="h6">{title}</Typography>
      {description && (
        <Typography variant="body2" sx={{ color: 'text.secondary', maxWidth: 360 }}>
          {description}
        </Typography>
      )}
      {action}
    </Stack>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <EmptyState
      icon="alert"
      title="Couldn’t load this"
      description={message}
      action={
        onRetry && (
          <Button variant="outlined" color="inherit" onClick={onRetry}>
            Try again
          </Button>
        )
      }
    />
  );
}

/** Placeholder rows shaped like the real ones, so the table doesn't jump when data arrives. */
export function TableRowsSkeleton({ rows = 5, columns }: { rows?: number; columns: number }) {
  return (
    <>
      {Array.from({ length: rows }, (_, r) => (
        <TableRow key={r} aria-hidden>
          {Array.from({ length: columns }, (_, c) => (
            <TableCell key={c}>
              {c === 0 ? (
                <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
                  <Skeleton variant="circular" width={40} height={40} />
                  <Box sx={{ flex: 1 }}>
                    <Skeleton width="70%" />
                    <Skeleton width="45%" />
                  </Box>
                </Stack>
              ) : (
                <Skeleton width={c % 2 ? '80%' : '60%'} />
              )}
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
}

export function TableMessageRow({ columns, children }: { columns: number; children: ReactNode }) {
  return (
    <TableRow>
      <TableCell colSpan={columns} sx={{ borderBottom: 'none' }}>
        {children}
      </TableCell>
    </TableRow>
  );
}
