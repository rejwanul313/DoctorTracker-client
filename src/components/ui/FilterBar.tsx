'use client';

import Badge from '@mui/material/Badge';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import { useState, type ReactNode } from 'react';
import { Icon } from './Icon';

interface FilterBarProps {
  /** The search input — always visible. */
  search: ReactNode;
  /** Extra filters: inline from `md`, behind a "Filters" toggle on phones. */
  children: ReactNode;
  activeCount?: number;
}

export function FilterBar({ search, children, activeCount = 0 }: FilterBarProps) {
  const [open, setOpen] = useState(false);
  return (
    <Box sx={{ p: 2.5, display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', gap: 2 }}>
      <Box id="extra-filters" sx={{ display: { xs: open ? 'contents' : 'none', md: 'contents' } }}>
        {children}
      </Box>
      <Box sx={{ flex: '999 1 240px', display: 'flex', gap: 1, order: { xs: -1, md: 0 } }}>
        {search}
        <IconButton
          aria-label="Filters"
          aria-expanded={open}
          aria-controls="extra-filters"
          onClick={() => setOpen((o) => !o)}
          sx={{
            display: { md: 'none' },
            width: 54,
            height: 54,
            flexShrink: 0,
            borderRadius: 1,
            border: (t) => `1px solid ${t.vars.palette.divider}`,
            ...(open && { bgcolor: 'action.selected' }),
          }}
        >
          <Badge badgeContent={activeCount} color="primary">
            <Icon name="filter" sx={{ fontSize: 20 }} />
          </Badge>
        </IconButton>
      </Box>
    </Box>
  );
}
