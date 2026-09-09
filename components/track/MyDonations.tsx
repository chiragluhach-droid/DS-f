'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Loader2, UtensilsCrossed } from 'lucide-react';
import { get } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { StatusBadge } from '@/components/StatusBadge';
import { formatInr, formatNumber, formatDate } from '@/lib/utils';
import type { Donation, Restaurant } from '@/lib/types';
import { DONATE_HREF } from '@/lib/config';

interface Data {
  donations: Donation[];
  totals: {
    portions: number;
    customerPaidPaise: number;
    foodValuePaise: number;
    count: number;
    completed: number;
  };
}

export function MyDonations() {
  const { user } = useAuth();
  const [data, setData] = useState<Data | null>(null);

  useEffect(() => {
    void get<Data>('/donations/mine')
      .then(setData)
      .catch(() =>
        setData({
          donations: [],
          totals: { portions: 0, customerPaidPaise: 0, foodValuePaise: 0, count: 0, completed: 0 },
        })
      );
  }, []);

  if (!data) {
    return (
      <div className="flex min-h-[60dvh] items-center justify-center">
        <Loader2 className="size-5 animate-spin text-ink-mute" />
      </div>
    );
  }

  return (
    <>
      <section className="grain relative overflow-hidden border-b border-line py-12 md:py-16">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-40 -top-24 size-[30rem] rounded-full bg-emerald-wash blur-3xl"
        />
        <div className="container-lux relative">
          <p className="eyebrow">Your record</p>
          <h1 className="display-lg mt-5 max-w-2xl text-balance-lux">
            {user?.name?.split(' ')[0]}, you have sent out{' '}
            <em className="font-normal italic text-emerald">
              {formatInr(data.totals.foodValuePaise)} of food.
            </em>
          </h1>

          <dl className="mt-10 grid max-w-2xl grid-cols-2 gap-6 border-t border-line pt-8 sm:grid-cols-4">
            {[
              ['You paid', formatInr(data.totals.customerPaidPaise)],
              ['Kitchens matched', formatInr(data.totals.foodValuePaise - data.totals.customerPaidPaise)],
              ['Portions sent', formatNumber(data.totals.portions)],
              ['Confirmed served', formatNumber(data.totals.completed)],
            ].map(([label, value]) => (
              <div key={label}>
                <dt className="text-[10.5px] uppercase tracking-[0.12em] text-ink-mute">{label}</dt>
                <dd className="numeral mt-2 text-[1.8rem] leading-none text-ink">{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="container-lux py-12 md:py-16">
        {data.donations.length === 0 ? (
          <div className="mx-auto max-w-md py-16 text-center">
            <UtensilsCrossed size={24} className="mx-auto text-ink-faint" strokeWidth={1.4} />
            <h2 className="display-sm mt-6">No donations yet</h2>
            <p className="mt-3 text-[14px] leading-relaxed text-ink-soft">
              When you fund a dish it will appear here, with its full journey attached.
            </p>
            <Link href={DONATE_HREF} className="btn btn-primary mt-8">
              See the menu
            </Link>
          </div>
        ) : (
          <>
            <h2 className="display-sm">Every donation, in order</h2>
            <ul className="mt-8 space-y-3">
              {data.donations.map((d) => {
                const restaurant = d.restaurant as Restaurant;
                return (
                  <li key={d._id}>
                    <Link
                      href={`/track/${d.donationId}`}
                      className="group flex flex-col gap-4 rounded-[18px] border border-line bg-surface p-4 transition-colors duration-500 hover:border-emerald/30 sm:flex-row sm:items-center sm:gap-5 sm:p-5"
                    >
                      {d.items[0]?.image && (
                        <div className="relative h-32 w-full shrink-0 overflow-hidden rounded-xl sm:size-[72px]">
                          <Image
                            src={d.items[0].image}
                            alt={d.items[0].name}
                            fill
                            sizes="(max-width: 640px) 100vw, 72px"
                            className="object-cover"
                          />
                        </div>
                      )}

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2.5">
                          <span className="numeral text-[13px] tracking-[0.03em] text-ink-mute">
                            {d.donationId}
                          </span>
                          <StatusBadge status={d.status} short />
                        </div>
                        <p className="mt-1.5 font-display text-[1.1rem] font-medium tracking-[-0.015em] text-ink">
                          {d.items.map((i) => `${i.quantity}× ${i.name}`).join(', ')}
                        </p>
                        <p className="mt-1 text-[12.5px] text-ink-mute">
                          {restaurant?.name} · {formatDate(d.createdAt)}
                        </p>
                      </div>

                      <div className="flex items-center justify-between gap-5 sm:justify-end">
                        <div className="text-right">
                          <p className="numeral text-[1.25rem] leading-none text-emerald">
                            {formatInr(d.totalFoodValuePaise)}
                          </p>
                          <p className="mt-1 text-[11.5px] text-ink-mute">
                            you paid {formatInr(d.customerPaidPaise)}
                          </p>
                        </div>
                        <ArrowRight
                          size={16}
                          className="shrink-0 text-ink-faint transition-all duration-500 group-hover:translate-x-1 group-hover:text-emerald"
                        />
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </section>
    </>
  );
}
