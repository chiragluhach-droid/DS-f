'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Loader2, ArrowRight, PackageCheck, AlertTriangle } from 'lucide-react';
import { get } from '@/lib/api';
import { PageHeading, StatCard, EmptyState } from '@/components/dashboard/DashboardShell';
import { LoadError } from '@/components/dashboard/LoadError';
import { BatchStatusBadge } from '@/components/StatusBadge';
import { formatInr, formatNumber, formatDate, pluralize } from '@/lib/utils';
import type { Batch, BatchSummary, Ngo, Restaurant } from '@/lib/types';

interface BatchData {
  batches: Batch[];
  summary: BatchSummary;
}

interface DonationData {
  summary: {
    portionsExpected: number;
    foodValueExpectedPaise: number;
  };
}

export default function NgoOverview() {
  const [data, setData] = useState<BatchData | null>(null);
  const [expected, setExpected] = useState<DonationData['summary'] | null>(null);
  const [ngo, setNgo] = useState<Ngo | null>(null);
  const [error, setError] = useState<unknown>(null);

  const load = useCallback(() => {
    setError(null);
    void Promise.all([
      get<BatchData>('/batches/ngo'),
      get<DonationData>('/ngos/me/donations'),
      get<{ ngo: Ngo }>('/ngos/me'),
    ])
      .then(([batchData, donationData, ngoData]) => {
        setData(batchData);
        setExpected(donationData.summary);
        setNgo(ngoData.ngo);
      })
      .catch(setError);
  }, []);

  useEffect(load, [load]);

  if (error) {
    return (
      <>
        <PageHeading eyebrow="Overview" title="What is coming to you" />
        <LoadError error={error} onRetry={load} what="your dashboard" />
      </>
    );
  }

  if (!data) {
    return (
      <div className="flex min-h-[50dvh] items-center justify-center">
        <Loader2 className="size-5 animate-spin text-ink-mute" />
      </div>
    );
  }

  const { summary } = data;
  const arriving = data.batches.filter((b) => b.status === 'DISPATCHED');
  const flagged = data.batches.filter((b) => b.status === 'RECONCILIATION_REQUIRED');

  return (
    <>
      <PageHeading
        eyebrow="Overview"
        title="What is coming to you"
        description="Food funded by guests at partner kitchens, and what is waiting on your count."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Waiting for your count"
          value={formatNumber(summary.inTransit)}
          sub={`${summary.portionsInTransit} portions delivered`}
          tone={summary.inTransit > 0 ? 'amber' : 'default'}
        />
        <StatCard
          label="Portions promised"
          value={formatNumber(expected?.portionsExpected ?? summary.portionsAwaitingDispatch)}
          sub={
            expected ? `${formatInr(expected.foodValueExpectedPaise)} of food` : 'Funded, not yet cooked'
          }
        />
        <StatCard
          label="Under review"
          value={formatNumber(summary.flagged)}
          sub="Counts that did not match"
          tone={summary.flagged > 0 ? 'amber' : 'default'}
        />
        <StatCard
          label="Portions received"
          value={formatNumber(ngo?.stats.portionsReceived ?? 0)}
          sub="All time"
          tone="emerald"
        />
      </div>

      {flagged.length > 0 && (
        <div className="mt-6 flex flex-wrap items-center gap-4 rounded-[18px] border border-amber/30 bg-amber-tint p-5">
          <AlertTriangle size={18} className="shrink-0 text-amber" strokeWidth={1.7} />
          <div className="flex-1">
            <p className="text-[14px] font-medium text-ink">
              {flagged.length} {pluralize(flagged.length, 'batch', 'batches')} under review
            </p>
            <p className="mt-1 text-[13px] text-ink-soft">
              You recorded a different count than was sent. DaanSetu is taking it up with the
              kitchen — nothing more is needed from you.
            </p>
          </div>
        </div>
      )}

      <section className="mt-8">
        <div className="flex items-center justify-between pb-5">
          <div>
            <h2 className="display-sm">Waiting on you</h2>
            <p className="mt-1 text-[13px] text-ink-soft">
              Only your count closes a delivery. Enter what actually arrived.
            </p>
          </div>
          <Link
            href="/dashboard/ngo/batches"
            className="group flex shrink-0 items-center gap-1.5 text-[13px] text-ink-soft transition-colors hover:text-emerald"
          >
            All food
            <ArrowRight size={13} className="transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {arriving.length === 0 ? (
          <EmptyState
            icon={PackageCheck}
            title="Nothing awaiting your count"
            body="When a kitchen sends a batch it appears here for you to count and confirm."
          />
        ) : (
          <ul className="space-y-2.5">
            {arriving.map((batch) => {
              const restaurant = batch.restaurant as Restaurant | undefined;
              return (
                <li key={batch._id}>
                  <Link
                    href="/dashboard/ngo/batches"
                    className="flex flex-wrap items-center gap-x-5 gap-y-2 rounded-[14px] border border-amber/25 bg-amber-tint p-4 transition-colors hover:border-amber/45"
                  >
                    <span className="numeral text-[13px] tracking-[0.03em] text-ink-mute">
                      {batch.batchId}
                    </span>
                    <span className="flex-1 text-[14px] text-ink">
                      {batch.dispatchedQuantity}× {batch.itemName} from {restaurant?.name}
                    </span>
                    <span className="text-[12.5px] text-ink-mute">
                      {batch.dispatchedAt && `sent ${formatDate(batch.dispatchedAt)}`}
                    </span>
                    <BatchStatusBadge status={batch.status} short />
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </>
  );
}

const EMPTY_SUMMARY: BatchSummary = {
  collecting: 0,
  readyToCook: 0,
  inTransit: 0,
  flagged: 0,
  portionsAwaitingDispatch: 0,
  portionsInTransit: 0,
  byStatus: {
    IN_PROGRESS: { batches: 0, portions: 0 },
    READY_FOR_DELIVERY: { batches: 0, portions: 0 },
    DISPATCHED: { batches: 0, portions: 0 },
    RECONCILIATION_REQUIRED: { batches: 0, portions: 0 },
    COMPLETED: { batches: 0, portions: 0 },
  },
};
