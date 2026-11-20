'use client';

import Card from '@mui/material/Card';
import { ErrorState } from '@/components/ui/States';

export default function AppError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <Card sx={{ mt: 4 }}>
      <ErrorState
        message={error.message || 'Something went wrong while rendering this page.'}
        onRetry={reset}
      />
    </Card>
  );
}
