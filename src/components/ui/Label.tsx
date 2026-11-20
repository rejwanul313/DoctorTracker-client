import Box, { type BoxProps } from '@mui/material/Box';
import type { Condition } from '@dt/shared';
import { CONDITION_COLOR, type LabelColor } from '@/lib/conditions';

interface LabelProps extends BoxProps {
  color?: LabelColor;
  variant?: 'soft' | 'filled';
}

/** Small status chip (6px radius, 12px bold) — soft by default, as in the design. */
export function Label({ color = 'default', variant = 'soft', sx, children, ...props }: LabelProps) {
  return (
    <Box
      component="span"
      {...props}
      sx={[
        (theme) => ({
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          minWidth: 24,
          height: 24,
          px: 0.75,
          borderRadius: '6px',
          fontSize: 12,
          lineHeight: 1.5,
          fontWeight: 700,
          whiteSpace: 'nowrap',
          ...(color === 'default'
            ? variant === 'filled'
              ? {
                  color: theme.vars.palette.background.paper,
                  backgroundColor: theme.vars.palette.text.primary,
                }
              : {
                  color: theme.vars.palette.text.secondary,
                  backgroundColor: theme.vars.palette.action.selected,
                }
            : variant === 'filled'
              ? {
                  color: theme.vars.palette[color].contrastText,
                  backgroundColor: theme.vars.palette[color].main,
                }
              : {
                  color: theme.vars.palette[color].dark,
                  backgroundColor: theme.alpha(theme.vars.palette[color].main, 0.16),
                  ...theme.applyStyles('dark', { color: theme.vars.palette[color].light }),
                }),
        }),
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {children}
    </Box>
  );
}

export function ConditionLabel({ condition }: { condition: Condition }) {
  return <Label color={CONDITION_COLOR[condition]}>{condition}</Label>;
}
