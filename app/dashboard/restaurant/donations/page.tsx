'use client';

import { useCallback, useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Loader2, ScrollText, ArrowRight, ExternalLink } from 'lucide-react';
import { get, patch, ApiError } from '@/lib/api';
import { useToast } from '@/components/Toast';
import { PageHeading, EmptyState } from '@/components/dashboard/DashboardShell';
import { StatusBadge } from '@/components/StatusBadge';
import { formatInr, formatDate, formatTime, cn } from '@/lib/utils';
import { DONATION_STATUSES, STATUS_META, type Donation, type Ngo, type DonationStatus } from '@/lib/types';

const FILTERS: { value: string; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'DONATED', label: 'To cook & hand over' },
  { value: 'HANDED_OVER', label: 'With NGO' },
  { value: 'NGO_CONFIRMED', label: 'Closed' },
];

/** The next status a restaurant is allowed to set, given where a donation is. */
const NEXT_FOR_RESTAURANT: Partial<Record<string, DonationStatus>> = {
  DONATED: 'HANDED_OVER',
};

const ACTION_LABEL: Record<string, string> = {
  HANDED_OVER: 'Mark as handed over',
};

function DonationsInner() {
  const params = useSearchParams();
  const { push } = useToast();
  const [filter, setFilter] = useState('all');
  const [donations, setDonations] = useState<Donation[] | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const focus = params.get('focus');

  const load = useCallback(async () => {
    try {
      const data = await get<{ donations: Donation[] }>(
        `/restaurants/me/donations?status=${filter}`
      );
      setDonations(data.donations);
    } catch {
      setDonations([]);
    }
  }, [filter]);

  useEffect(() => {
    void load();
  }, [load]);

  const advance = async (donation: Donation) => {
    const next = NEXT_FOR_RESTAURANT[donation.status];
    if (!next) return;

    setBusy(donation.donationId);
    try {
      await patch(`/donations/${donation.donationId}/status`, { status: next });
      push(`${donation.donationId} → ${STATUS_META[next].label}`, 'success');
      await load();
    } catch (err) {
      push(err instanceof ApiError ? err.message : 'Could not update the donation.', 'error');
    } finally {
      setBusy(null);
    }
  };

  return (
    <>
      <PageHeading
        eyebrow="Donations"
        title="The queue"
        description="Move each donation forward as it happens. Every change is stamped with your name and cannot be undone."
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
          title="Nothing here yet"
          body="Donations funded by your guests will appear here the moment payment is verified."
        />
      ) : (
        <ul className="space-y-3">
          {donations.map((d) => {
            const next = NEXT_FOR_RESTAURANT[d.status];
            const ngo = d.ngo as Ngo | undefined;
            const stepIdx = DONATION_STATUSES.indexOf(d.status as DonationStatus);

            return (
              <li
                key={d._id}
                className={cn(
                  'rounded-[18px] border bg-surface p-5 transition-colors',
                  focus === d.donationId ? 'border-emerald' : 'border-line'
                )}
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="numeral text-[13px] tracking-[0.03em] text-ink-mute">
                        {d.donationId}
                      </span>
                      <StatusBadge status={d.status} short />
                      {d.discrepancy?.hasDiscrepancy && (
                        <span className="rounded-full border border-amber/30 bg-amber-tint px-2.5 py-1 text-[10px] uppercase tracking-[0.1em] text-amber">
                          Flagged
                        </span>
                      )}
                    </div>

                    <p className="mt-2.5 font-display text-[1.15rem] font-medium tracking-[-0.015em] text-ink">
                      {d.items.map((i) => `${i.quantity}× ${i.name}`).join(', ')}
                    </p>

                    <p className="mt-1.5 text-[12.5px] text-ink-mute">
                      {d.donorSnapshot.isAnonymous ? 'Anonymous donor' : d.donorSnapshot.name} ·{' '}
                      {formatDate(d.createdAt)} at {formatTime(d.createdAt)}
                      {ngo && ` · to ${ngo.name}`}
                    </p>

                    {d.donorSnapshot.message && (
                      <p className="mt-3 border-l-2 border-line pl-3.5 font-display text-[0.98rem] italic leading-relaxed text-ink-soft">
                        &ldquo;{d.donorSnapshot.message}&rdquo;
                      </p>
                    )}
                  </div>

                  <div className="shrink-0 text-right">
                    <p className="numeral text-[1.4rem] leading-none text-emerald">
                      {formatInr(d.totalFoodValuePaise)}
                    </p>
                    <p className="mt-1.5 text-[11.5px] text-ink-mute">
                      {d.totalPortions} {d.totalPortions === 1 ? 'portion' : 'portions'}
                    </p>
                    <p className="mt-1 text-[11px] text-ink-faint">
                      guest {formatInr(d.customerPaidPaise)} · you{' '}
                      {formatInr(d.restaurantContributionPaise)}
                    </p>
                  </div>
                </div>

                {/* progress rail */}
                <div className="mt-5 flex gap-1">
                  {DONATION_STATUSES.map((s, i) => (
                    <span
                      key={s}
                      title={STATUS_META[s].label}
                      className={cn(
                        'h-1 flex-1 rounded-full transition-colors duration-500',
                        i <= stepIdx ? 'bg-emerald' : 'bg-line-soft'
                      )}
                    />
                  ))}
                </div>

                <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-line-soft pt-4">
                  {next ? (
                    <button
                      onClick={() => advance(d)}
                      disabled={busy === d.donationId}
                      className="btn btn-primary py-2.5 text-[13px]"
                    >
                      {busy === d.donationId ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <ArrowRight size={14} />
                      )}
                      {ACTION_LABEL[next]}
                    </button>
                  ) : d.status === 'HANDED_OVER' ? (
                    <p className="text-[13px] text-ink-mute">
                      Waiting on {ngo?.name ?? 'the NGO'} to confirm receipt.
                    </p>
                  ) : (
                    <p className="text-[13px] text-emerald">
                      Closed — {d.portionsReceived ?? d.totalPortions} portions confirmed received.
                    </p>
                  )}

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

export default function RestaurantDonationsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50dvh] items-center justify-center">
          <Loader2 className="size-5 animate-spin text-ink-mute" />
        </div>
      }
    >
      <DonationsInner />
    </Suspense>
  );
}
