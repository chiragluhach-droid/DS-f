'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Loader2, ArrowRight } from 'lucide-react';
import { get } from '@/lib/api';
import { PageHeading, StatCard } from '@/components/dashboard/DashboardShell';
import { BarChart, type Point } from '@/components/dashboard/BarChart';
import { StatusBadge } from '@/components/StatusBadge';
import { formatInr, formatNumber, formatDate } from '@/lib/utils';
import { DONATION_STATUSES, STATUS_META, type Donation, type Ngo } from '@/lib/types';

interface Analytics {
  totals: {
    donations: number;
    portions: number;
    customerPaise: number;
    restaurantPaise: number;
    foodValuePaise: number;
  };
  today: { donations: number; portions: number; foodValuePaise: number };
  byStatus: Record<string, number>;
  daily: { _id: string; portions: number; foodValuePaise: number }[];
  topItems: { _id: string; quantity: number; foodValuePaise: number }[];
}

export default function RestaurantOverview() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [recent, setRecent] = useState<Donation[]>([]);

  useEffect(() => {
    void Promise.all([
      get<Analytics>('/restaurants/me/analytics'),
      get<{ donations: Donation[] }>('/restaurants/me/donations?limit=6'),
    ])
      .then(([a, d]) => {
        setAnalytics(a);
        setRecent(d.donations);
      })
      .catch(() => setAnalytics(null));
  }, []);

  if (!analytics) {
    return (
      <div className="flex min-h-[50dvh] items-center justify-center">
        <Loader2 className="size-5 animate-spin text-ink-mute" />
      </div>
    );
  }

  const chart: Point[] = analytics.daily.map((d) => ({
    label: formatDate(d._id),
    value: d.portions,
  }));

  const toHandOver = analytics.byStatus.ASSIGNED_TO_BATCH ?? 0;

  return (
    <>
      <PageHeading
        eyebrow="Overview"
        title="Today at the counter"
        description="What guests funded, what you matched, and what still needs to leave the kitchen."
      />

      {/* today, first — this is the number that drives the shift */}
      <div className="rounded-[18px] border border-emerald/20 bg-emerald-wash p-6">
        <p className="eyebrow text-emerald">Today</p>
        <div className="mt-4 flex flex-wrap items-end gap-x-10 gap-y-5">
          <div>
            <p className="numeral text-[2.4rem] leading-none text-emerald">
              {formatNumber(analytics.today.portions)}
            </p>
            <p className="mt-1.5 text-[11.5px] uppercase tracking-[0.11em] text-ink-mute">
              Portions to cook
            </p>
          </div>
          <div>
            <p className="numeral text-[2.4rem] leading-none text-ink">
              {formatNumber(analytics.today.donations)}
            </p>
            <p className="mt-1.5 text-[11.5px] uppercase tracking-[0.11em] text-ink-mute">
              Donations
            </p>
          </div>
          <div>
            <p className="numeral text-[2.4rem] leading-none text-ink">
              {formatInr(analytics.today.foodValuePaise)}
            </p>
            <p className="mt-1.5 text-[11.5px] uppercase tracking-[0.11em] text-ink-mute">
              Food value
            </p>
          </div>
        </div>
      </div>

      {/* the contribution split, all time */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Guests contributed"
          value={formatInr(analytics.totals.customerPaise)}
          sub="All time"
        />
        <StatCard
          label="You matched"
          value={formatInr(analytics.totals.restaurantPaise)}
          sub="Your commitment"
        />
        <StatCard
          label="Food sent out"
          value={formatInr(analytics.totals.foodValuePaise)}
          sub={`${formatNumber(analytics.totals.portions)} portions`}
          tone="emerald"
        />
        <StatCard
          label="Needs your action"
          value={formatNumber(toHandOver)}
          sub="To cook and hand over"
          tone={toHandOver > 0 ? 'amber' : 'default'}
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <section className="rounded-[18px] border border-line bg-surface p-6">
          <h2 className="display-sm">Portions funded</h2>
          <p className="mt-1 text-[12.5px] text-ink-mute">Last 30 days</p>
          <BarChart data={chart} className="mt-7" format={(n) => `${n} portions`} />
        </section>

        <section className="rounded-[18px] border border-line bg-surface p-6">
          <h2 className="display-sm">Where the food is</h2>
          <ul className="mt-6 space-y-3.5">
            {DONATION_STATUSES.map((s) => {
              const count = analytics.byStatus[s] ?? 0;
              const total = analytics.totals.donations || 1;
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

      {analytics.topItems.length > 0 && (
        <section className="mt-6 rounded-[18px] border border-line bg-surface p-6">
          <h2 className="display-sm">Most funded dishes</h2>
          <ul className="mt-5 divide-y divide-line-soft">
            {analytics.topItems.map((item, i) => (
              <li key={item._id} className="flex items-center gap-4 py-3.5">
                <span className="numeral w-6 text-[15px] text-ink-faint">{i + 1}</span>
                <span className="flex-1 text-[14px] text-ink">{item._id}</span>
                <span className="text-[13px] text-ink-mute">{item.quantity} portions</span>
                <span className="numeral w-24 text-right text-[14px] text-emerald">
                  {formatInr(item.foodValuePaise)}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mt-6">
        <div className="flex items-center justify-between pb-5">
          <h2 className="display-sm">Recent donations</h2>
          <Link
            href="/dashboard/restaurant/donations"
            className="group flex items-center gap-1.5 text-[13px] text-ink-soft transition-colors hover:text-emerald"
          >
            See all
            <ArrowRight size={13} className="transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <ul className="space-y-2.5">
          {recent.map((d) => (
            <li key={d._id}>
              <Link
                href={`/dashboard/restaurant/donations?focus=${d.donationId}`}
                className="flex flex-wrap items-center gap-x-5 gap-y-2 rounded-[14px] border border-line bg-surface p-4 transition-colors hover:border-emerald/30"
              >
                <span className="numeral text-[13px] tracking-[0.03em] text-ink-mute">
                  {d.donationId}
                </span>
                <span className="flex-1 text-[14px] text-ink">
                  {d.items.map((i) => `${i.quantity}× ${i.name}`).join(', ')}
                </span>
                <span className="text-[12.5px] text-ink-mute">
                  {(d.ngo as Ngo | undefined)?.name}
                </span>
                <span className="numeral text-[13px] text-emerald">
                  {formatInr(d.totalFoodValuePaise)}
                </span>
                <StatusBadge status={d.status} short />
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
