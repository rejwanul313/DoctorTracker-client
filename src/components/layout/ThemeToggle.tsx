'use client';

import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import { useColorScheme } from '@mui/material/styles';
import { Icon } from '../ui/Icon';

export function ThemeToggle() {
  const { mode, systemMode, setMode } = useColorScheme();
  const resolved = mode === 'system' ? systemMode : mode;
  if (!resolved) return <IconButton aria-hidden disabled sx={{ visibility: 'hidden' }} />;

  const next = resolved === 'dark' ? 'light' : 'dark';
  const label = `Switch to ${next} mode`;
  return (
    <Tooltip title={label}>
      <IconButton aria-label={label} onClick={() => setMode(next)}>
        <Icon name={resolved === 'dark' ? 'sun' : 'moon'} sx={{ fontSize: 20 }} />
      </IconButton>
    </Tooltip>
  );
}
