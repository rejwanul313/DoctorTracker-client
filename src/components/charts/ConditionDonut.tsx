'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import type { Condition } from '@dt/shared';
import { CONDITION_CHART_ORDER, CONDITION_HEX } from '@/lib/conditions';
import { fNumber } from '@/lib/format';
import { ChartTooltipCard } from './ChartTooltip';
import { useChartTheme } from './useChartTheme';

/**
 * Part-to-whole of 4 conditions: a donut with the total in the hole, 2px surface gaps between
 * segments, hover tooltip, and a labeled legend (rendered by the card) as secondary encoding.
 */
export default function ConditionDonut({
  data,
  size = 220,
}: {
  data: Record<Condition, number>;
  size?: number;
}) {
  const c = useChartTheme();
  const rows = CONDITION_CHART_ORDER.map((name) => ({ name, value: data[name] ?? 0 }));
  const total = rows.reduce((s, r) => s + r.value, 0);

  return (
    <Box
      sx={{ position: 'relative', width: size, height: size, mx: 'auto' }}
      role="img"
      aria-label={`Donut chart of patients by condition: ${rows.map((r) => `${r.name} ${r.value}`).join(', ')}.`}
    >
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={rows}
            dataKey="value"
            nameKey="name"
            innerRadius="72%"
            outerRadius="100%"
            startAngle={90}
            endAngle={-270}
            stroke={c.surface}
            strokeWidth={2}
            isAnimationActive={false}
          >
            {rows.map((r) => (
              <Cell key={r.name} fill={CONDITION_HEX[r.name]} />
            ))}
          </Pie>
          <Tooltip
            content={({ active, payload }) => {
              const p = payload?.[0];
              if (!active || !p) return null;
              const name = String(p.name) as Condition;
              const value = Number(p.value);
              return (
                <ChartTooltipCard
                  title={total ? `${Math.round((value / total) * 100)}% of patients` : undefined}
                  rows={[{ name, value, color: CONDITION_HEX[name] }]}
                />
              );
            }}
          />
        </PieChart>
      </ResponsiveContainer>
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none',
        }}
      >
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Total
        </Typography>
        <Typography variant="display">{fNumber(total)}</Typography>
      </Box>
    </Box>
  );
}
