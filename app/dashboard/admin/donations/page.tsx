'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Loader2, ScrollText, ExternalLink, AlertTriangle, Check } from 'lucide-react';
import { get, patch, ApiError } from '@/lib/api';
import { useToast } from '@/components/Toast';
import { PageHeading, EmptyState } from '@/components/dashboard/DashboardShell';
import { StatusBadge } from '@/components/StatusBadge';
import { formatInr, formatDate, cn } from '@/lib/utils';
import { DONATION_STATUSES, STATUS_META, type Donation, type Restaurant, type Ngo } from '@/lib/types';

const FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'flagged', label: 'Flagged' },
  ...DONATION_STATUSES.map((s) => ({ value: s, label: STATUS_META[s].short })),
];

export default function AdminDonationsPage() {
  const { push } = useToast();
  const [filter, setFilter] = useState('all');
  const [donations, setDonations] = useState<Donation[] | null>(null);
  const [resolving, setResolving] = useState<Donation | null>(null);

  const load = useCallback(async () => {
    setDonations(null);
    const query =
      filter === 'flagged' ? 'flagged=true' : filter === 'all' ? 'status=all' : `status=${filter}`;
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
        description="Filter to flagged donations to see where an NGO recorded fewer portions than were sent."
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
            const open = d.discrepancy?.hasDiscrepancy && !d.discrepancy?.resolvedAt;

            return (
              <li
                key={d._id}
                className={cn(
                  'rounded-[16px] border bg-surface p-4 md:p-5',
                  open ? 'border-amber/30' : 'border-line'
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
                        <span
                          className={cn(
                            'flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] uppercase tracking-[0.1em]',
                            open
                              ? 'border-amber/30 bg-amber-tint text-amber'
                              : 'border-emerald/25 bg-emerald-wash text-emerald'
                          )}
                        >
                          <AlertTriangle size={10} />
                          {open ? 'Open' : 'Resolved'}
                        </span>
                      )}
                    </div>

                    <p className="mt-2 text-[14px] text-ink">
                      {d.items.map((i) => `${i.quantity}× ${i.name}`).join(', ')}
                    </p>
                    <p className="mt-1 text-[12.5px] text-ink-mute">
                      {restaurant?.name}
                      {ngo && ` → ${ngo.name}`} · {formatDate(d.createdAt)} ·{' '}
                      {d.donorSnapshot.isAnonymous ? 'Anonymous' : d.donorSnapshot.name}
                    </p>

                    {d.discrepancy?.note && (
                      <p className="mt-3 border-l-2 border-amber/40 pl-3.5 text-[12.5px] leading-relaxed text-ink-soft">
                        {d.discrepancy.note}
                      </p>
                    )}
                    {d.discrepancy?.resolutionNote && (
                      <p className="mt-2 border-l-2 border-emerald/40 pl-3.5 text-[12.5px] leading-relaxed text-emerald">
                        Resolved: {d.discrepancy.resolutionNote}
                      </p>
                    )}
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
                  {open && (
                    <button
                      onClick={() => setResolving(d)}
                      className="btn btn-primary py-2 text-[12.5px]"
                    >
                      <Check size={13} strokeWidth={2.4} />
                      Resolve discrepancy
                    </button>
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

      {resolving && (
        <ResolveDialog
          donation={resolving}
          onClose={() => setResolving(null)}
          onDone={async () => {
            setResolving(null);
            await load();
          }}
          push={push}
        />
      )}
    </>
  );
}

function ResolveDialog({
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
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await patch(`/admin/donations/${donation.donationId}/discrepancy`, {
        resolutionNote: note.trim(),
      });
      push('Discrepancy resolved.', 'success');
      await onDone();
    } catch (err) {
      push(err instanceof ApiError ? err.message : 'Could not resolve this.', 'error');
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-ink/25 backdrop-blur-sm sm:items-center">
      <div className="absolute inset-0" onClick={onClose} aria-hidden />
      <form
        onSubmit={submit}
        className="relative w-full max-w-md rounded-t-[24px] border border-line bg-paper p-6 sm:rounded-[24px] md:p-8"
      >
        <p className="eyebrow">Resolve discrepancy</p>
        <h2 className="display-sm mt-2">{donation.donationId}</h2>
        <p className="mt-2.5 text-[13.5px] leading-relaxed text-ink-soft">
          {donation.discrepancy?.note}
        </p>

        <div className="mt-6">
          <label className="label-lux" htmlFor="resolution">
            What was done about it
          </label>
          <textarea
            id="resolution"
            rows={4}
            required
            minLength={5}
            className="field resize-none"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Spoke to both parties. Kitchen re-sent two plates the following day."
          />
          <p className="mt-2 text-[11.5px] text-ink-mute">
            This is recorded in the audit log and shown on the donor&rsquo;s tracking page.
          </p>
        </div>

        <div className="mt-7 flex gap-3">
          <button type="button" onClick={onClose} className="btn btn-outline flex-1">
            Cancel
          </button>
          <button type="submit" disabled={saving} className="btn btn-primary flex-1">
            {saving && <Loader2 size={15} className="animate-spin" />}
            Mark resolved
          </button>
        </div>
      </form>
    </div>
  );
}
