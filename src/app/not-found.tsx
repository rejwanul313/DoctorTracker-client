'use client';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import NextLink from 'next/link';

export default function NotFound() {
  return (
    <Box
      sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', p: 3, textAlign: 'center' }}
    >
      <Box>
        <Typography variant="h2" component="h1">
          Page not found
        </Typography>
        <Typography sx={{ color: 'text.secondary', mt: 2, mb: 4 }}>
          The page you’re looking for doesn’t exist or was moved.
        </Typography>
        <Button
          component={NextLink}
          href="/dashboard"
          variant="contained"
          color="inherit"
          size="large"
        >
          Go to dashboard
        </Button>
      </Box>
    </Box>
  );
}
