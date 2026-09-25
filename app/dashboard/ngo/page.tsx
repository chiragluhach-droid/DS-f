'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Loader2, ArrowRight, PackageCheck } from 'lucide-react';
import { get } from '@/lib/api';
import { PageHeading, StatCard, EmptyState } from '@/components/dashboard/DashboardShell';
import { StatusBadge } from '@/components/StatusBadge';
import { formatInr, formatNumber, formatDate } from '@/lib/utils';
import type { Donation, Ngo, Restaurant } from '@/lib/types';

interface Data {
  donations: Donation[];
  summary: {
    awaitingConfirmation: number;
    beingPrepared: number;
    portionsExpected: number;
    foodValueExpectedPaise: number;
  };
}

export default function NgoOverview() {
  const [data, setData] = useState<Data | null>(null);
  const [ngo, setNgo] = useState<Ngo | null>(null);

  useEffect(() => {
    void Promise.all([get<Data>('/ngos/me/donations'), get<{ ngo: Ngo }>('/ngos/me')])
      .then(([d, n]) => {
        setData(d);
        setNgo(n.ngo);
      })
      .catch(() =>
        setData({
          donations: [],
          summary: {
            awaitingConfirmation: 0,
            beingPrepared: 0,
            portionsExpected: 0,
            foodValueExpectedPaise: 0,
          },
        })
      );
  }, []);

  if (!data) {
    return (
      <div className="flex min-h-[50dvh] items-center justify-center">
        <Loader2 className="size-5 animate-spin text-ink-mute" />
      </div>
    );
  }

  const awaiting = data.donations.filter((d) => d.status === 'DISPATCHED');

  return (
    <>
      <PageHeading
        eyebrow="Overview"
        title="What is coming to you"
        description="Food funded by guests at partner kitchens, and what is waiting on your confirmation."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Awaiting your count"
          value={formatNumber(data.summary.awaitingConfirmation)}
          sub="Handed over, not yet confirmed"
          tone={data.summary.awaitingConfirmation > 0 ? 'amber' : 'default'}
        />
        <StatCard
          label="Portions expected"
          value={formatNumber(data.summary.portionsExpected)}
          sub={`${formatInr(data.summary.foodValueExpectedPaise)} of food`}
        />
        <StatCard label="Being cooked" value={formatNumber(data.summary.beingPrepared)} />
        <StatCard
          label="Portions received"
          value={formatNumber(ngo?.stats.portionsReceived ?? 0)}
          sub="All time"
          tone="emerald"
        />
      </div>

      <section className="mt-8">
        <div className="flex items-center justify-between pb-5">
          <div>
            <h2 className="display-sm">Waiting on you</h2>
            <p className="mt-1 text-[13px] text-ink-soft">
              Only your confirmation closes a donation. Enter the count you actually received.
            </p>
          </div>
          <Link
            href="/dashboard/ngo/donations"
            className="group flex shrink-0 items-center gap-1.5 text-[13px] text-ink-soft transition-colors hover:text-emerald"
          >
            All food
            <ArrowRight size={13} className="transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {awaiting.length === 0 ? (
          <EmptyState
            icon={PackageCheck}
            title="Nothing awaiting confirmation"
            body="When a kitchen marks a delivery as complete it will appear here for you to count and confirm."
          />
        ) : (
          <ul className="space-y-2.5">
            {awaiting.map((d) => {
              const restaurant = d.restaurant as Restaurant;
              return (
                <li key={d._id}>
                  <Link
                    href="/dashboard/ngo/donations"
                    className="flex flex-wrap items-center gap-x-5 gap-y-2 rounded-[14px] border border-amber/25 bg-amber-tint p-4 transition-colors hover:border-amber/45"
                  >
                    <span className="numeral text-[13px] tracking-[0.03em] text-ink-mute">
                      {d.donationId}
                    </span>
                    <span className="flex-1 text-[14px] text-ink">
                      {restaurant?.name} · {formatDate(d.createdAt)}
                    </span>
                    <span className="numeral text-[14px] text-ink">
                      {d.totalPortions} portions
                    </span>
                    <StatusBadge status={d.status} short />
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
