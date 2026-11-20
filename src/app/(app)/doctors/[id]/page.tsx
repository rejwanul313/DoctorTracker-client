import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { DoctorDetailView } from '@/features/doctors/DoctorDetailView';

export const metadata: Metadata = { title: 'Doctor' };

export default async function DoctorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[a-f\d]{24}$/i.test(id)) notFound();
  return (
    <Suspense>
      <DoctorDetailView id={id} />
    </Suspense>
  );
}
