'use client';

import Box from '@mui/material/Box';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { TimelinePoint } from '@dt/shared';
import { fMonth, fNumber } from '@/lib/format';
import { seriesColors } from '@/theme/tokens';
import { ChartTooltipCard } from './ChartTooltip';
import { useChartTheme } from './useChartTheme';

const SERIES = [
  { key: 'admitted', name: 'Admitted', color: seriesColors.admitted },
  { key: 'discharged', name: 'Discharged', color: seriesColors.discharged },
] as const;

/**
 * Admissions vs discharges per month. One y-axis (same unit), 2px lines, light area wash,
 * crosshair + tooltip on hover. Legend with totals lives in the card header.
 */
export default function AdmissionsChart({
  data,
  height = 300,
}: {
  data: TimelinePoint[];
  height?: number;
}) {
  const c = useChartTheme();
  // The last point is the current, unfinished month — say so, so its dip isn't read as a decline.
  const current = data.at(-1)?.month;
  return (
    <Box
      sx={{ height, ml: -2 }}
      role="img"
      aria-label={`Area chart of admitted and discharged patients per month, ${fMonth(data[0]?.month ?? '', true)} to ${fMonth(data.at(-1)?.month ?? '', true)}.`}
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
          <defs>
            {SERIES.map((s) => (
              <linearGradient key={s.key} id={`fill-${s.key}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={s.color} stopOpacity={c.dark ? 0.24 : 0.16} />
                <stop offset="100%" stopColor={s.color} stopOpacity={0} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid vertical={false} stroke={c.grid} strokeDasharray="3 3" />
          <XAxis
            dataKey="month"
            tickFormatter={(m: string) => fMonth(m)}
            tick={{ fill: c.axis, fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            tickMargin={10}
            interval="preserveStartEnd"
            minTickGap={12}
          />
          <YAxis
            tick={{ fill: c.axis, fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            width={48}
            allowDecimals={false}
            tickFormatter={(v: number) => fNumber(v)}
          />
          <Tooltip
            cursor={{ stroke: c.cursor, strokeWidth: 1, strokeDasharray: '3 3' }}
            content={({ active, payload, label }) =>
              active && payload?.length ? (
                <ChartTooltipCard
                  title={`${fMonth(String(label), true)}${label === current ? ' (to date)' : ''}`}
                  rows={SERIES.map((s) => ({
                    name: s.name,
                    color: s.color,
                    value: Number(payload.find((p) => p.dataKey === s.key)?.value ?? 0),
                  }))}
                />
              ) : null
            }
          />
          {SERIES.map((s) => (
            <Area
              key={s.key}
              type="monotone"
              dataKey={s.key}
              name={s.name}
              stroke={s.color}
              strokeWidth={2}
              fill={`url(#fill-${s.key})`}
              dot={false}
              activeDot={{ r: 5, strokeWidth: 2, stroke: c.surface, fill: s.color }}
              isAnimationActive={false}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </Box>
  );
}
