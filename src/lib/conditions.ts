import type { Condition } from '@dt/shared';
import { palette } from '@/theme/tokens';

export type LabelColor =
  'default' | 'primary' | 'secondary' | 'info' | 'success' | 'warning' | 'error';

/** One mapping for chips, tabs and charts so a condition always has the same color. */
export const CONDITION_COLOR: Record<Condition, Exclude<LabelColor, 'default'>> = {
  Stable: 'success',
  Recovering: 'warning',
  Critical: 'error',
  Discharged: 'info',
};

/**
 * Chart fills. The design's "main" steps fail the dataviz palette validator (amber is too light
 * on white; green/amber collide for protan viewers), so charts use the validated "dark" steps of
 * the same ramps — passes in light AND dark mode. Order matters: Stable and Recovering are never
 * adjacent in the donut.
 */
export const CONDITION_HEX: Record<Condition, string> = {
  Stable: palette.success.dark,
  Discharged: palette.info.dark,
  Recovering: palette.warning.dark,
  Critical: palette.error.dark,
};
export const CONDITION_CHART_ORDER: Condition[] = [
  'Stable',
  'Discharged',
  'Recovering',
  'Critical',
];
