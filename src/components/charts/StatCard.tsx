import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';
import { memo, type ReactNode } from 'react';
import { fNumber, fPercent } from '@/lib/format';
import { Icon } from '../ui/Icon';

interface StatCardProps {
  title: string;
  value?: number;
  /** % change; null = no comparison available. */
  changePct?: number | null;
  /** Shown instead of "vs last month" (or when there's no % change). */
  caption?: ReactNode;
  /** When true, a rise is bad (e.g. critical patients). */
  invert?: boolean;
  spark?: number[];
  sparkColor: string;
}

/** Mini bar sparkline — decorative (the number is the content), so it's hidden from AT. */
function Sparkline({ values, color }: { values: number[]; color: string }) {
  const max = Math.max(1, ...values);
  const w = 6;
  const gap = 4;
  const h = 40;
  return (
    <svg width={values.length * (w + gap) - gap} height={h} aria-hidden style={{ flexShrink: 0 }}>
      {values.map((v, i) => {
        const bh = Math.max(3, (v / max) * h);
        return (
          <rect
            key={i}
            x={i * (w + gap)}
            y={h - bh}
            width={w}
            height={bh}
            rx={2}
            fill={color}
            opacity={i === values.length - 1 ? 1 : 0.48}
          />
        );
      })}
    </svg>
  );
}

export const StatCard = memo(function StatCard({
  title,
  value,
  changePct,
  caption,
  invert,
  spark,
  sparkColor,
}: StatCardProps) {
  const up = (changePct ?? 0) >= 0;
  const good = invert ? !up : up;
  return (
    <Card sx={{ p: { xs: 2, md: 3 }, display: 'flex', alignItems: 'flex-start', gap: 2 }}>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="subtitle2">{title}</Typography>
        <Typography variant="display" component="div" sx={{ mt: 1, mb: 0.5 }}>
          {value === undefined ? <Skeleton width={80} /> : fNumber(value)}
        </Typography>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 0.5,
            typography: 'caption',
            color: 'text.secondary',
          }}
        >
          {value === undefined ? (
            <Skeleton width={110} />
          ) : (
            <>
              {changePct !== undefined && changePct !== null && (
                <Box
                  component="span"
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 0.25,
                    fontWeight: 700,
                    color: good ? 'success.dark' : 'error.dark',
                  }}
                >
                  <Icon name={up ? 'trendUp' : 'trendDown'} sx={{ fontSize: 16 }} />
                  {fPercent(changePct)}
                </Box>
              )}
              <span>{caption ?? 'vs last month'}</span>
            </>
          )}
        </Box>
      </Box>
      {spark && (
        <Box sx={{ display: { xs: 'none', sm: 'block' }, mt: 3.5 }}>
          <Sparkline values={spark} color={sparkColor} />
        </Box>
      )}
    </Card>
  );
});
