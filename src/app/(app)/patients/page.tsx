import type { Metadata } from 'next';
import { Suspense } from 'react';
import { PatientsView } from '@/features/patients/PatientsView';

export const metadata: Metadata = { title: 'Patients' };

export default function PatientsPage() {
  return (
    <Suspense>
      <PatientsView />
    </Suspense>
  );
}
