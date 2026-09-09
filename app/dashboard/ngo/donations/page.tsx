'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Loader2, PackageCheck, ExternalLink, AlertTriangle, Check } from 'lucide-react';
import { get, patch, ApiError } from '@/lib/api';
import { useToast } from '@/components/Toast';
import { PageHeading, EmptyState } from '@/components/dashboard/DashboardShell';
import { StatusBadge } from '@/components/StatusBadge';
import { formatInr, formatDate, formatTime, cn } from '@/lib/utils';
import { DONATION_STATUSES, STATUS_META, type Donation, type Restaurant, type DonationStatus } from '@/lib/types';

const FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'HANDED_OVER', label: 'Awaiting your count' },
  { value: 'DONATED', label: 'Being cooked' },
  { value: 'NGO_CONFIRMED', label: 'Confirmed' },
];

export default function NgoDonationsPage() {
  const { push } = useToast();
  const [filter, setFilter] = useState('all');
  const [donations, setDonations] = useState<Donation[] | null>(null);
  const [confirming, setConfirming] = useState<Donation | null>(null);

  const load = useCallback(async () => {
    try {
      const data = await get<{ donations: Donation[] }>(`/ngos/me/donations?status=${filter}`);
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
        eyebrow="Incoming food"
        title="Count, then confirm"
        description="Your confirmation is the last checkpoint a donor sees. Enter what actually arrived — if it is short, say so."
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
          icon={PackageCheck}
          title="No meals in this view"
          body="Food funded at your partner kitchens appears here as soon as it is paid for."
        />
      ) : (
        <ul className="space-y-3">
          {donations.map((d) => {
            const restaurant = d.restaurant as Restaurant;
            const stepIdx = DONATION_STATUSES.indexOf(d.status as DonationStatus);
            const awaiting = d.status === 'HANDED_OVER';
            const closed = d.status === 'NGO_CONFIRMED';
            const short = d.discrepancy?.hasDiscrepancy;

            return (
              <li
                key={d._id}
                className={cn(
                  'rounded-[18px] border bg-surface p-5',
                  awaiting ? 'border-amber/30' : 'border-line'
                )}
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="numeral text-[13px] tracking-[0.03em] text-ink-mute">
                        {d.donationId}
                      </span>
                      <StatusBadge status={d.status} short />
                      {short && (
                        <span className="flex items-center gap-1.5 rounded-full border border-amber/30 bg-amber-tint px-2.5 py-1 text-[10px] uppercase tracking-[0.1em] text-amber">
                          <AlertTriangle size={10} />
                          Shortfall reported
                        </span>
                      )}
                    </div>

                    <p className="mt-2.5 font-display text-[1.15rem] font-medium tracking-[-0.015em] text-ink">
                      {d.items.map((i) => `${i.quantity}× ${i.name}`).join(', ')}
                    </p>

                    <p className="mt-1.5 text-[12.5px] text-ink-mute">
                      From {restaurant?.name} · funded {formatDate(d.createdAt)} at{' '}
                      {formatTime(d.createdAt)} · {formatInr(d.totalFoodValuePaise)} of food
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="numeral text-[1.6rem] leading-none text-emerald">
                      {closed ? d.portionsReceived : d.totalPortions}
                    </p>
                    <p className="mt-1.5 text-[11px] uppercase tracking-[0.1em] text-ink-mute">
                      {closed ? 'Received' : 'Expected'}
                    </p>
                    {closed && d.portionsReceived !== d.totalPortions && (
                      <p className="mt-1 text-[11.5px] text-amber">of {d.totalPortions} sent</p>
                    )}
                  </div>
                </div>

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
                  {awaiting ? (
                    <button
                      onClick={() => setConfirming(d)}
                      className="btn btn-primary py-2.5 text-[13px]"
                    >
                      <Check size={14} strokeWidth={2.4} />
                      Confirm what arrived
                    </button>
                  ) : closed ? (
                    <p className="text-[13px] text-emerald">
                      Confirmed on {d.timestamps_.NGO_CONFIRMED && formatDate(d.timestamps_.NGO_CONFIRMED)}
                    </p>
                  ) : (
                    <p className="text-[13px] text-ink-mute">
                      {STATUS_META[d.status].blurb}
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

      {confirming && (
        <ConfirmDialog
          donation={confirming}
          onClose={() => setConfirming(null)}
          onDone={async () => {
            setConfirming(null);
            await load();
          }}
          push={push}
        />
      )}
    </>
  );
}

function ConfirmDialog({
  donation,
  onClose,
  onDone,
  push,
}: {
  donation: Donation;
  onClose: () => void;
  onDone: () => Promise<void>;
  push: (message: string, tone?: 'success' | 'error' | 'info') => void;
}) {
  const [received, setReceived] = useState(String(donation.totalPortions));
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  const count = Number(received);
  const short = Number.isFinite(count) && count !== donation.totalPortions;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (short && note.trim().length < 5) {
      push('Tell us briefly why the count differs.', 'error');
      return;
    }
    setSaving(true);
    try {
      await patch(`/donations/${donation.donationId}/confirm`, {
        portionsReceived: count,
        note: note.trim() || undefined,
      });
      push(
        short
          ? `${donation.donationId} confirmed with a shortfall — flagged for review.`
          : `${donation.donationId} confirmed. Thank you.`,
        'success'
      );
      await onDone();
    } catch (err) {
      push(err instanceof ApiError ? err.message : 'Could not confirm this donation.', 'error');
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-ink/25 backdrop-blur-sm sm:items-center">
      <div className="absolute inset-0" onClick={onClose} aria-hidden />
      <form
        onSubmit={submit}
        className="relative max-h-[92dvh] w-full max-w-md overflow-y-auto rounded-t-[24px] border border-line bg-paper p-6 sm:rounded-[24px] md:p-8"
      >
        <p className="eyebrow">Confirm receipt</p>
        <h2 className="display-sm mt-2">{donation.donationId}</h2>
        <p className="mt-2.5 text-[13.5px] leading-relaxed text-ink-soft">
          {donation.items.map((i) => `${i.quantity}× ${i.name}`).join(', ')} — sent as{' '}
          <span className="text-ink">{donation.totalPortions} portions</span>.
        </p>

        <div className="mt-7">
          <label className="label-lux" htmlFor="received">
            Portions actually received
          </label>
          <input
            id="received"
            type="number"
            min="0"
            required
            className="field numeral text-[1.35rem]"
            value={received}
            onChange={(e) => setReceived(e.target.value)}
          />
        </div>

        {short && (
          <div className="mt-4 rounded-xl border border-amber/30 bg-amber-tint p-4">
            <p className="flex items-center gap-2 text-[13px] font-medium text-amber">
              <AlertTriangle size={14} strokeWidth={1.8} />
              This differs from what was sent
            </p>
            <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink-soft">
              The donor will see this on their tracking page, and our team will review it. Please
              say what happened.
            </p>
          </div>
        )}

        <div className="mt-5">
          <label className="label-lux" htmlFor="note">
            Note {short ? '' : <span className="normal-case tracking-normal">(optional)</span>}
          </label>
          <textarea
            id="note"
            rows={3}
            className="field resize-none"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={
              short
                ? 'Two boxes arrived damaged and could not be served.'
                : 'Served at the Lower Parel shelter this evening.'
            }
          />
        </div>

        <div className="mt-7 flex gap-3">
          <button type="button" onClick={onClose} className="btn btn-outline flex-1">
            Cancel
          </button>
          <button type="submit" disabled={saving} className="btn btn-primary flex-1">
            {saving && <Loader2 size={15} className="animate-spin" />}
            Confirm
          </button>
        </div>
      </form>
    </div>
  );
}
