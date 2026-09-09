'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Loader2, ArrowRight } from 'lucide-react';
import { get } from '@/lib/api';
import { PageHeading, StatCard } from '@/components/dashboard/DashboardShell';
import { BarChart, type Point } from '@/components/dashboard/BarChart';
import { formatInr, formatNumber, formatDate } from '@/lib/utils';
import { DONATION_STATUSES, STATUS_META } from '@/lib/types';

interface Overview {
  counts: {
    restaurants: number;
    pendingRestaurants: number;
    ngos: number;
    pendingNgos: number;
    users: number;
    openDiscrepancies: number;
  };
  totals: {
    donations: number;
    portions: number;
    customerPaise: number;
    restaurantPaise: number;
    foodValuePaise: number;
  };
  daily: { _id: string; portions: number; foodValuePaise: number }[];
  byStatus: Record<string, number>;
}

export default function AdminOverview() {
  const [data, setData] = useState<Overview | null>(null);

  useEffect(() => {
    void get<Overview>('/admin/overview')
      .then(setData)
      .catch(() => setData(null));
  }, []);

  if (!data) {
    return (
      <div className="flex min-h-[50dvh] items-center justify-center">
        <Loader2 className="size-5 animate-spin text-ink-mute" />
      </div>
    );
  }

  const chart: Point[] = data.daily.map((d) => ({ label: formatDate(d._id), value: d.portions }));
  const pendingTotal = data.counts.pendingRestaurants + data.counts.pendingNgos;

  return (
    <>
      <PageHeading
        eyebrow="Platform"
        title="Everything, at a glance"
        description="Meals funded across every kitchen, and anything that needs a decision from you."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Food donated"
          value={formatInr(data.totals.foodValuePaise)}
          sub={`${formatNumber(data.totals.portions)} portions`}
          tone="emerald"
        />
        <StatCard
          label="Guests paid"
          value={formatInr(data.totals.customerPaise)}
          sub={`${formatNumber(data.totals.donations)} donations`}
        />
        <StatCard
          label="Kitchens matched"
          value={formatInr(data.totals.restaurantPaise)}
          sub="Restaurant commitment"
        />
        <StatCard
          label="Open discrepancies"
          value={formatNumber(data.counts.openDiscrepancies)}
          sub="Reported by NGOs"
          tone={data.counts.openDiscrepancies > 0 ? 'amber' : 'default'}
        />
      </div>

      {pendingTotal > 0 && (
        <div className="mt-6 flex flex-wrap items-center gap-4 rounded-[18px] border border-amber/30 bg-amber-tint p-5">
          <div className="flex-1">
            <p className="text-[14px] font-medium text-ink">
              {pendingTotal} {pendingTotal === 1 ? 'application' : 'applications'} awaiting approval
            </p>
            <p className="mt-1 text-[13px] text-ink-soft">
              {data.counts.pendingRestaurants} restaurants · {data.counts.pendingNgos} NGOs
            </p>
          </div>
          <div className="flex gap-2">
            {data.counts.pendingRestaurants > 0 && (
              <Link href="/dashboard/admin/restaurants" className="btn btn-outline py-2.5 text-[13px]">
                Restaurants
              </Link>
            )}
            {data.counts.pendingNgos > 0 && (
              <Link href="/dashboard/admin/ngos" className="btn btn-primary py-2.5 text-[13px]">
                NGOs
                <ArrowRight size={14} />
              </Link>
            )}
          </div>
        </div>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <section className="rounded-[18px] border border-line bg-surface p-6">
          <h2 className="display-sm">Portions funded</h2>
          <p className="mt-1 text-[12.5px] text-ink-mute">Across all kitchens, last 30 days</p>
          <BarChart data={chart} className="mt-7" format={(n) => `${n} portions`} />
        </section>

        <section className="rounded-[18px] border border-line bg-surface p-6">
          <h2 className="display-sm">Lifecycle spread</h2>
          <ul className="mt-6 space-y-3.5">
            {DONATION_STATUSES.map((s) => {
              const count = data.byStatus[s] ?? 0;
              const total = data.totals.donations || 1;
              return (
                <li key={s}>
                  <div className="flex items-center justify-between text-[13px]">
                    <span className="text-ink-soft">{STATUS_META[s].label}</span>
                    <span className="numeral text-ink">{count}</span>
                  </div>
                  <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-line-soft">
                    <div
                      className="h-full rounded-full bg-emerald transition-all duration-700"
                      style={{ width: `${(count / total) * 100}%` }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Live restaurants"
          value={formatNumber(data.counts.restaurants)}
          sub={`${data.counts.pendingRestaurants} pending`}
        />
        <StatCard
          label="Approved NGOs"
          value={formatNumber(data.counts.ngos)}
          sub={`${data.counts.pendingNgos} pending`}
        />
        <StatCard label="Registered users" value={formatNumber(data.counts.users)} />
      </div>
    </>
  );
}
