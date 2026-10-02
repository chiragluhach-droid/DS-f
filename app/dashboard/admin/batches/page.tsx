'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Loader2, PackageCheck, AlertTriangle, Check, ChevronDown } from 'lucide-react';
import { get, patch, ApiError } from '@/lib/api';
import { useToast } from '@/components/Toast';
import { PageHeading, EmptyState } from '@/components/dashboard/DashboardShell';
import { LoadError } from '@/components/dashboard/LoadError';
import { BatchStatusBadge } from '@/components/StatusBadge';
import { formatDate, cn } from '@/lib/utils';
import { formatTime, pluralize, TIME_ZONE_LABEL } from '@/lib/utils';
import {
  BATCH_STATUSES,
  BATCH_META,
  type Batch,
  type BatchDetail,
  type Restaurant,
  type Ngo,
} from '@/lib/types';

// Each filter names one state. A second "Flagged" button that did the same
// thing as the RECONCILIATION_REQUIRED filter was simply ambiguous.
const FILTERS = [
  { value: 'all', label: 'All' },
  ...BATCH_STATUSES.map((s) => ({ value: s, label: BATCH_META[s].short })),
];

export default function AdminBatchesPage() {
  const { push } = useToast();
  const [filter, setFilter] = useState('all');
  const [batches, setBatches] = useState<Batch[] | null>(null);
  const [error, setError] = useState<unknown>(null);
  const [resolving, setResolving] = useState<Batch | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  const load = useCallback(async () => {
    setBatches(null);
    const query = filter === 'all' ? 'status=all' : `status=${filter}`;
    try {
      const data = await get<{ batches: Batch[] }>(`/admin/batches?${query}`);
      setBatches(data.batches);
      setError(null);
    } catch (err) {
      setError(err);
    }
  }, [filter]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <>
      <PageHeading
        eyebrow="Batches"
        title="Delivery logistics"
        description="Filter to flagged batches to see where an NGO recorded fewer portions than were sent."
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

      {error ? (
        <LoadError error={error} onRetry={() => void load()} what="batches" />
      ) : batches === null ? (
        <div className="flex min-h-[30dvh] items-center justify-center">
          <Loader2 className="size-5 animate-spin text-ink-mute" />
        </div>
      ) : batches.length === 0 ? (
        <EmptyState
          icon={PackageCheck}
          title="No batches match"
          body="Try a different filter — or nothing has reached this stage yet."
        />
      ) : (
        <ul className="space-y-2.5">
          {batches.map((d) => {
            const restaurant = d.restaurant as Restaurant;
            const ngo = d.ngo as Ngo | undefined;
            const open = d.status === 'RECONCILIATION_REQUIRED';

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
                        {d.batchId}
                      </span>
                      <BatchStatusBadge status={d.status} short />
                      {open && (
                        <span
                          className={cn(
                            'flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] uppercase tracking-[0.1em]',
                            'border-amber/30 bg-amber-tint text-amber'
                          )}
                        >
                          <AlertTriangle size={10} />
                          Open
                        </span>
                      )}
                    </div>

                    <p className="mt-2 text-[14px] text-ink">
                      {d.collectedQuantity}× {d.itemName}
                    </p>
                    <p className="mt-1 text-[12.5px] text-ink-mute">
                      {restaurant?.name}
                      {ngo && ` → ${ngo.name}`} · {formatDate(d.createdAt)}
                    </p>

                    {d.receiptNote && (
                      <p className="mt-3 border-l-2 border-amber/40 pl-3.5 text-[12.5px] leading-relaxed text-ink-soft">
                        {d.receiptNote}
                      </p>
                    )}
                    {d.resolution?.note && (
                      <p className="mt-2 border-l-2 border-emerald/40 pl-3.5 text-[12.5px] leading-relaxed text-emerald">
                        Resolved: {d.resolution.note}
                      </p>
                    )}
                  </div>

                  <div className="shrink-0 text-right">
                    <BatchCount batch={d} />
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
                  <button
                    onClick={() => setExpanded(expanded === d.batchId ? null : d.batchId)}
                    className="ml-auto flex items-center gap-1.5 text-[12.5px] text-ink-mute transition-colors hover:text-emerald"
                  >
                    {expanded === d.batchId ? 'Hide detail' : 'Batch detail'}
                    <ChevronDown
                      size={13}
                      className={cn('transition-transform', expanded === d.batchId && 'rotate-180')}
                    />
                  </button>
                </div>

                {expanded === d.batchId && <BatchDetailPanel batchId={d.batchId} />}
              </li>
            );
          })}
        </ul>
      )}

      {resolving && (
        <ResolveDialog
          batch={resolving}
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
  batch,
  onClose,
  onDone,
  push,
}: {
  batch: Batch;
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
      await patch(`/admin/batches/${batch.batchId}/resolve`, {
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
        <h2 className="display-sm mt-2">{batch.batchId}</h2>
        <p className="mt-2.5 text-[13.5px] leading-relaxed text-ink-soft">
          {batch.receiptNote}
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

/**
 * A ratio means nothing without its basis. Before a batch goes out the useful
 * number is how full it is; afterwards it is what the NGO counted against what
 * was actually sent. Showing received/dispatched on a collecting batch is how
 * every pre-dispatch batch came to read 0/0.
 */
function BatchCount({ batch }: { batch: Batch }) {
  const sent = Boolean(batch.dispatchedAt);
  const counted = Boolean(batch.receivedAt);

  const [value, basis] =
    counted
      ? [`${batch.receivedQuantity}/${batch.dispatchedQuantity}`, 'received / dispatched']
      : sent
        ? [`${batch.dispatchedQuantity}`, 'portions dispatched']
        : [`${batch.collectedQuantity}/${batch.targetQuantity}`, 'funded / target'];

  return (
    <>
      <p className="numeral text-[1.25rem] leading-none text-ink">{value}</p>
      <p className="mt-1 text-[11px] uppercase tracking-[0.1em] text-ink-mute">{basis}</p>
    </>
  );
}

/** The donations riding on a batch, and every state change it has been through. */
function BatchDetailPanel({ batchId }: { batchId: string }) {
  const [detail, setDetail] = useState<BatchDetail | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let active = true;
    void get<BatchDetail>(`/batches/${batchId}`)
      .then((d) => active && setDetail(d))
      .catch(() => active && setFailed(true));
    return () => {
      active = false;
    };
  }, [batchId]);

  if (failed) {
    return (
      <p className="mt-4 border-t border-line-soft pt-4 text-[12.5px] text-danger">
        Could not load this batch&rsquo;s detail.
      </p>
    );
  }

  if (!detail) {
    return (
      <div className="mt-4 flex justify-center border-t border-line-soft pt-4">
        <Loader2 className="size-4 animate-spin text-ink-mute" />
      </div>
    );
  }

  return (
    <div className="mt-4 grid gap-6 border-t border-line-soft pt-4 md:grid-cols-2">
      <div>
        <p className="text-[11px] uppercase tracking-[0.1em] text-ink-mute">
          Donations in this batch ({detail.donations.length})
        </p>
        <ul className="mt-3 space-y-1.5">
          {detail.donations.map((d) => (
            <li key={d.donationId} className="flex items-baseline justify-between gap-3 text-[12.5px]">
              <Link
                href={`/track/${d.donationId}`}
                target="_blank"
                className="numeral text-ink-soft underline decoration-line underline-offset-2 hover:text-emerald"
              >
                {d.donationId}
              </Link>
              <span className="text-ink-mute">
                {d.portions} {pluralize(d.portions, 'portion')}
              </span>
            </li>
          ))}
          {detail.donations.length === 0 && (
            <li className="text-[12.5px] text-ink-mute">No donations are linked to this batch.</li>
          )}
        </ul>
      </div>

      <div>
        <p className="text-[11px] uppercase tracking-[0.1em] text-ink-mute">Event history</p>
        <ol className="mt-3 space-y-2.5">
          {detail.events.map((e) => (
            <li key={e._id} className="text-[12.5px] leading-relaxed">
              <span className="text-ink">
                {e.fromStatus ? `${BATCH_META[e.fromStatus]?.short} → ` : ''}
                {BATCH_META[e.toStatus]?.short ?? e.toStatus}
              </span>
              <span className="text-ink-mute">
                {' '}
                · {e.actorName} ({e.actorType}) · {formatDate(e.createdAt)}{' '}
                {formatTime(e.createdAt)} {TIME_ZONE_LABEL}
              </span>
              {e.note && <p className="mt-0.5 text-ink-soft">{e.note}</p>}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
