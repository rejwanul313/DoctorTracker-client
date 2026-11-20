import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { memo } from 'react';
import { fNumber } from '@/lib/format';
import { Icon } from './Icon';

export interface ActiveFilter {
  key: string;
  group: string;
  label: string;
  onRemove: () => void;
}

interface Props {
  total?: number;
  filters: ActiveFilter[];
  onClear: () => void;
}

/** "N results found" + removable chips for each active filter + Clear (as in the design). */
export const ActiveFilters = memo(function ActiveFilters({ total, filters, onClear }: Props) {
  if (filters.length === 0) return null;
  return (
    <Stack
      direction="row"
      useFlexGap
      sx={{ flexWrap: 'wrap', alignItems: 'center', gap: 1, px: 2.5, pb: 2.5 }}
    >
      <Typography variant="body2" sx={{ mr: 0.5 }}>
        <Box component="strong" sx={{ fontWeight: 600 }}>
          {total === undefined ? '…' : fNumber(total)}
        </Box>{' '}
        <Box component="span" sx={{ color: 'text.secondary' }}>
          results found
        </Box>
      </Typography>
      {filters.map((f) => (
        <Box
          key={f.key}
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 1,
            px: 1,
            py: 0.5,
            borderRadius: 1,
            border: (t) => `1px dashed ${t.alpha(t.vars.palette.grey[500], 0.32)}`,
            typography: 'body2',
            fontSize: 13,
          }}
        >
          <Box component="span" sx={{ fontWeight: 600 }}>
            {f.group}:
          </Box>
          <Chip
            size="small"
            label={f.label}
            onDelete={f.onRemove}
            deleteIcon={<Icon name="close" aria-label={`Remove ${f.group} filter`} />}
            sx={{
              height: 24,
              borderRadius: 1,
              fontSize: 13,
              bgcolor: 'text.primary',
              color: 'background.paper',
              '& .MuiChip-deleteIcon': {
                fontSize: 14,
                color: 'inherit',
                opacity: 0.8,
                '&:hover': { color: 'inherit', opacity: 1 },
              },
            }}
          />
        </Box>
      ))}
      <Button color="error" size="small" onClick={onClear} startIcon={<Icon name="trash" />}>
        Clear
      </Button>
    </Stack>
  );
});
