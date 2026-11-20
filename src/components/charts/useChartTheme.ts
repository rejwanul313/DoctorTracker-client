'use client';

import { useColorScheme } from '@mui/material/styles';
import { palette } from '@/theme/tokens';

/**
 * SVG presentation attributes can't read CSS variables, so chart chrome (axes, grid, cursor)
 * gets concrete colors for the active scheme. Grid and axes stay recessive.
 */
export function useChartTheme() {
  const { mode, systemMode } = useColorScheme();
  const dark = (mode === 'system' ? systemMode : mode) === 'dark';
  return {
    dark,
    axis: dark ? palette.grey[500] : palette.grey[600],
    grid: dark ? 'rgba(145,158,171,0.16)' : 'rgba(145,158,171,0.24)',
    cursor: dark ? palette.grey[600] : palette.grey[400],
    surface: dark ? palette.grey[800] : '#ffffff',
  };
}
