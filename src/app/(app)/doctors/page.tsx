import type { Metadata } from 'next';
import { Suspense } from 'react';
import { DoctorsView } from '@/features/doctors/DoctorsView';

export const metadata: Metadata = { title: 'Doctors' };

export default function DoctorsPage() {
  // useSearchParams (URL-driven filters) needs a Suspense boundary.
  return (
    <Suspense>
      <DoctorsView />
    </Suspense>
  );
}
