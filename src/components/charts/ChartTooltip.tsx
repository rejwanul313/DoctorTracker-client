import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { fNumber } from '@/lib/format';

export interface TooltipRow {
  name: string;
  value: number;
  color: string;
}

/** Shared HTML tooltip for every chart: title + one row per series (text in text tokens). */
export function ChartTooltipCard({ title, rows }: { title?: string; rows: TooltipRow[] }) {
  return (
    <Paper
      sx={(t) => ({
        px: 1.5,
        py: 1,
        minWidth: 150,
        borderRadius: 1.25,
        boxShadow: `0 0 2px 0 ${t.alpha(t.vars.palette.grey[500], 0.24)}, -20px 20px 40px -4px ${t.alpha(t.vars.palette.grey[500], 0.24)}`,
        pointerEvents: 'none',
      })}
    >
      {title && (
        <Typography variant="caption" sx={{ display: 'block', fontWeight: 600, mb: 0.5 }}>
          {title}
        </Typography>
      )}
      {rows.map((r) => (
        <Box
          key={r.name}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            typography: 'caption',
            lineHeight: '20px',
          }}
        >
          <Box
            component="span"
            sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: r.color, flexShrink: 0 }}
          />
          <Box component="span" sx={{ color: 'text.secondary' }}>
            {r.name}
          </Box>
          <Box component="span" sx={{ ml: 'auto', pl: 2, fontWeight: 600 }}>
            {fNumber(r.value)}
          </Box>
        </Box>
      ))}
    </Paper>
  );
}

export function LegendItem({
  color,
  label,
  value,
}: {
  color: string;
  label: string;
  value?: string;
}) {
  return (
    <Box
      component="li"
      sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, typography: 'body2' }}
    >
      <Box
        component="span"
        aria-hidden
        sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: color, flexShrink: 0 }}
      />
      <Box component="span" sx={{ color: 'text.secondary' }}>
        {label}
      </Box>
      {value !== undefined && (
        <Box component="span" sx={{ fontWeight: 600 }}>
          {value}
        </Box>
      )}
    </Box>
  );
}
