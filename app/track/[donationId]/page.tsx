import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import type { Metadata } from 'next';
import { serverGet } from '@/lib/api';
import { TrackView } from '@/components/track/TrackView';
import type { Donation, DonationEvent, TrackedBatch } from '@/lib/types';

interface TrackData {
  donation: Donation;
  timeline: DonationEvent[];
  /** The batch each dish in the donation is cooked in. */
  batches: TrackedBatch[];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ donationId: string }>;
}): Promise<Metadata> {
  const { donationId } = await params;
  return { title: `Donation ${donationId}` };
}

export default async function TrackDonationPage({
  params,
}: {
  params: Promise<{ donationId: string }>;
}) {
  const { donationId } = await params;
  const data = await serverGet<TrackData>(`/donations/${donationId}/track`);
  if (!data) notFound();

  return (
    <Suspense fallback={null}>
      <TrackView
        donation={data.donation}
        timeline={data.timeline}
        batches={data.batches ?? []}
      />
    </Suspense>
  );
}
