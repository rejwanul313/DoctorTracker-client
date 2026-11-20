import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import NextLink from 'next/link';

/** Brand mark: primary-green gradient tile with a heart + pulse line. */
export function LogoMark({ size = 40 }: { size?: number }) {
  return (
    <Box
      aria-hidden
      sx={{
        width: size,
        height: size,
        flexShrink: 0,
        borderRadius: `${Math.round(size * 0.28)}px`,
        background: 'linear-gradient(135deg, #00b8a0 0%, #00a76f 45%, #007867 100%)',
        boxShadow: '0 4px 12px -2px rgba(0,167,111,.4)',
        color: 'common.white',
        display: 'grid',
        placeItems: 'center',
      }}
    >
      <svg
        width={size * 0.62}
        height={size * 0.62}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 20.5s-7.6-4.6-9.4-9.5C1.4 7.6 3.6 4.5 7 4.5c2 0 3.7 1.1 5 3 1.3-1.9 3-3 5-3 3.4 0 5.6 3.1 4.4 6.5-1.8 4.9-9.4 9.5-9.4 9.5z" />
        <path d="M6 12.5h3l1.5-2.5 2 4.5 1.5-2h4" />
      </svg>
    </Box>
  );
}

export function Logo({
  showText = true,
  size = 40,
  prefetch,
}: {
  showText?: boolean;
  size?: number;
  prefetch?: boolean;
}) {
  return (
    <Box
      component={NextLink}
      href="/dashboard"
      prefetch={prefetch}
      aria-label="Doctor Tracker home"
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 1.5,
        color: 'text.primary',
        textDecoration: 'none',
      }}
    >
      <LogoMark size={size} />
      {showText && (
        <Typography
          component="span"
          sx={{ fontSize: 20, fontWeight: 800, lineHeight: '28px', letterSpacing: '-0.01em' }}
        >
          Doctor
          <Box
            component="span"
            sx={(theme) => ({
              color: theme.vars.palette.primary.dark,
              ...theme.applyStyles('dark', { color: theme.vars.palette.primary.light }),
            })}
          >
            Tracker
          </Box>
        </Typography>
      )}
    </Box>
  );
}
