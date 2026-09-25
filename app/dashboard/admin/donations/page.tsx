'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Loader2, ScrollText, ExternalLink } from 'lucide-react';
import { get } from '@/lib/api';
import { PageHeading, EmptyState } from '@/components/dashboard/DashboardShell';
import { StatusBadge } from '@/components/StatusBadge';
import { formatInr, formatDate, cn } from '@/lib/utils';
import { DONATION_STATUSES, STATUS_META, type Donation, type Restaurant, type Ngo } from '@/lib/types';

const FILTERS = [
  { value: 'all', label: 'All' },
  ...DONATION_STATUSES.map((s) => ({ value: s, label: STATUS_META[s].short })),
];

export default function AdminDonationsPage() {
  const [filter, setFilter] = useState('all');
  const [donations, setDonations] = useState<Donation[] | null>(null);

  const load = useCallback(async () => {
    setDonations(null);
    const query = filter === 'all' ? 'status=all' : `status=${filter}`;
    try {
      const data = await get<{ donations: Donation[] }>(`/admin/donations?${query}`);
      setDonations(data.donations);
    } catch {
      setDonations([]);
    }
  }, [filter]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <>
      <PageHeading
        eyebrow="Donations"
        title="Every plate on the platform"
        description="View the complete history of donations made through DaanSetu."
      />

      <div className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 pb-6 md:mx-0 md:px-0">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={cn(
              'shrink-0 rounded-full border px-3.5 py-1.5 text-[12.5px] transition-all duration-300',
              filter === f.value
                ? 'border-emerald bg-emerald text-paper'
                : 'border-line bg-surface text-ink-soft hover:border-emerald/40 hover:text-emerald'
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {donations === null ? (
        <div className="flex min-h-[30dvh] items-center justify-center">
          <Loader2 className="size-5 animate-spin text-ink-mute" />
        </div>
      ) : donations.length === 0 ? (
        <EmptyState
          icon={ScrollText}
          title="No donations match"
          body="Try a different filter — or nothing has reached this stage yet."
        />
      ) : (
        <ul className="space-y-2.5">
          {donations.map((d) => {
            const restaurant = d.restaurant as Restaurant;
            const ngo = d.ngo as Ngo | undefined;

            return (
              <li
                key={d._id}
                className="rounded-[16px] border border-line bg-surface p-4 md:p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="numeral text-[13px] tracking-[0.03em] text-ink-mute">
                        {d.donationId}
                      </span>
                      <StatusBadge status={d.status} short />
                    </div>

                    <p className="mt-2 text-[14px] text-ink">
                      {d.items.map((i) => `${i.quantity}× ${i.name}`).join(', ')}
                    </p>
                    <p className="mt-1 text-[12.5px] text-ink-mute">
                      {restaurant?.name}
                      {ngo && ` → ${ngo.name}`} · {formatDate(d.createdAt)} ·{' '}
                      {d.donorSnapshot.isAnonymous ? 'Anonymous' : d.donorSnapshot.name}
                    </p>
                  </div>

                  <div className="shrink-0 text-right">
                    <p className="numeral text-[1.25rem] leading-none text-emerald">
                      {formatInr(d.totalFoodValuePaise)}
                    </p>
                    <p className="mt-1 text-[11.5px] text-ink-mute">
                      {d.portionsReceived !== undefined
                        ? `${d.portionsReceived}/${d.totalPortions} portions`
                        : `${d.totalPortions} portions`}
                    </p>
                    <p className="mt-1 text-[11px] text-ink-faint">
                      guest {formatInr(d.customerPaidPaise)} · kitchen{' '}
                      {formatInr(d.restaurantContributionPaise)}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-line-soft pt-3.5">
                  <Link
                    href={`/track/${d.donationId}`}
                    target="_blank"
                    className="ml-auto flex items-center gap-1.5 text-[12.5px] text-ink-mute transition-colors hover:text-emerald"
                  >
                    Donor view
                    <ExternalLink size={12} />
                  </Link>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
