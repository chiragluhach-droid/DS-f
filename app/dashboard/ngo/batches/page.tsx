'use client';

import { useCallback, useEffect, useState } from 'react';
import { Loader2, PackageCheck, Check, AlertTriangle, X } from 'lucide-react';
import { get, post, ApiError } from '@/lib/api';
import { useToast } from '@/components/Toast';
import { PageHeading, EmptyState, StatCard } from '@/components/dashboard/DashboardShell';
import { LoadError } from '@/components/dashboard/LoadError';
import { BatchStatusBadge } from '@/components/StatusBadge';
import { formatDate, formatTime, cn, pluralize } from '@/lib/utils';
import type { Batch, BatchSummary, Restaurant } from '@/lib/types';

interface Data {
  batches: Batch[];
  summary: BatchSummary;
}

export default function NgoBatchesPage() {
  const { push } = useToast();
  const [data, setData] = useState<Data | null>(null);
  const [error, setError] = useState<unknown>(null);
  const [confirming, setConfirming] = useState<Batch | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      setData(await get<Data>('/batches/ngo'));
    } catch (err) {
      setError(err);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  if (error) {
    return (
      <>
        <PageHeading eyebrow="Incoming food" title="Count it, then confirm" />
        <LoadError error={error} onRetry={() => void load()} what="incoming food" />
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

  const { batches, summary } = data;
  const arriving = batches.filter((b) => b.status === 'DISPATCHED');
  const cooking = batches.filter((b) =>
    ['IN_PROGRESS', 'READY_FOR_DELIVERY'].includes(b.status)
  );
  const counted = batches.filter((b) =>
    ['RECONCILIATION_REQUIRED', 'COMPLETED'].includes(b.status)
  );

  return (
    <>
      <PageHeading
        eyebrow="Incoming food"
        title="Count it, then confirm"
        description="Your count is the last checkpoint a donor sees. Enter what actually arrived — if it is short, say so, and we will take it up with the kitchen."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Waiting for your count"
          value={summary.inTransit}
          sub={`${summary.portionsInTransit} portions sent to you`}
          tone={summary.inTransit > 0 ? 'amber' : 'default'}
        />
        <StatCard
          label="Being funded"
          value={summary.collecting + summary.readyToCook}
          sub={`${summary.portionsAwaitingDispatch} portions promised`}
        />
        <StatCard
          label="Under review"
          value={summary.flagged}
          sub="Counts that did not match"
          tone={summary.flagged > 0 ? 'amber' : 'default'}
        />
        <StatCard
          label="Confirmed"
          value={summary.byStatus.COMPLETED.batches}
          sub="Closed batches"
          tone="emerald"
        />
      </div>

      {batches.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            icon={PackageCheck}
            title="Nothing on its way yet"
            body="Food funded at your partner kitchens appears here as soon as it is paid for, and moves to the top when it is sent."
          />
        </div>
      ) : (
        <div className="mt-10 space-y-10">
          {arriving.length > 0 && (
            <Section
              title="Arrived — waiting on you"
              blurb="Count the portions as you unload them, then confirm."
            >
              {arriving.map((batch) => (
                <BatchRow key={batch._id} batch={batch} onConfirm={setConfirming} />
              ))}
            </Section>
          )}

          {cooking.length > 0 && (
            <Section
              title="Still with the kitchen"
              blurb="Funded by guests and not yet cooked. Nothing to do here yet."
            >
              {cooking.map((batch) => (
                <BatchRow key={batch._id} batch={batch} onConfirm={setConfirming} />
              ))}
            </Section>
          )}

          {counted.length > 0 && (
            <Section title="Counted" blurb="Everything you have confirmed.">
              {counted.map((batch) => (
                <BatchRow key={batch._id} batch={batch} onConfirm={setConfirming} />
              ))}
            </Section>
          )}
        </div>
      )}

      {confirming && (
        <ConfirmDialog
          batch={confirming}
          onClose={() => setConfirming(null)}
          onDone={async () => {
            setConfirming(null);
            await load();
          }}
        />
      )}
    </>
  );
}

function Section({
  title,
  blurb,
  children,
}: {
  title: string;
  blurb: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="display-sm">{title}</h2>
      <p className="mt-1.5 text-[13px] text-ink-soft">{blurb}</p>
      <ul className="mt-5 space-y-3">{children}</ul>
    </section>
  );
}

function BatchRow({ batch, onConfirm }: { batch: Batch; onConfirm: (b: Batch) => void }) {
  const restaurant = batch.restaurant as Restaurant | undefined;
  const awaiting = batch.status === 'DISPATCHED';
  const flagged = batch.status === 'RECONCILIATION_REQUIRED';
  const expected = batch.dispatchedQuantity || batch.collectedQuantity;

  return (
    <li
      className={cn(
        'rounded-[18px] border bg-surface p-5',
        awaiting ? 'border-amber/30' : flagged ? 'border-amber/30' : 'border-line'
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="numeral text-[13px] tracking-[0.03em] text-ink-mute">
              {batch.batchId}
            </span>
            <BatchStatusBadge status={batch.status} short />
          </div>

          <p className="mt-2.5 font-display text-[1.15rem] font-medium tracking-[-0.015em] text-ink">
            {expected}× {batch.itemName}
          </p>

          <p className="mt-1.5 text-[12.5px] text-ink-mute">
            From {restaurant?.name ?? 'a partner kitchen'} · {batch.donationCount}{' '}
            {pluralize(batch.donationCount, 'donation')}
            {batch.dispatchedAt &&
              ` · sent ${formatDate(batch.dispatchedAt)} at ${formatTime(batch.dispatchedAt)}`}
          </p>

          {batch.receivedAt && (
            <p className="mt-3 text-[12.5px]">
              <span className={flagged ? 'text-amber' : 'text-emerald'}>
                You counted {batch.receivedQuantity} of {batch.dispatchedQuantity} sent
              </span>
              <span className="text-ink-mute"> · {formatDate(batch.receivedAt)}</span>
            </p>
          )}

          {batch.receiptNote && (
            <p className="mt-2.5 border-l-2 border-line pl-3.5 text-[12.5px] leading-relaxed text-ink-soft">
              {batch.receiptNote}
            </p>
          )}

          {batch.resolution?.note && (
            <p className="mt-2.5 border-l-2 border-emerald/40 pl-3.5 text-[12.5px] leading-relaxed text-emerald">
              Resolved by DaanSetu: {batch.resolution.note}
            </p>
          )}
        </div>

        <div className="shrink-0">
          {awaiting && (
            <button onClick={() => onConfirm(batch)} className="btn btn-primary py-2.5 text-[13px]">
              <Check size={14} strokeWidth={2.4} />
              Confirm what arrived
            </button>
          )}
        </div>
      </div>
    </li>
  );
}

function ConfirmDialog({
  batch,
  onClose,
  onDone,
}: {
  batch: Batch;
  onClose: () => void;
  onDone: () => Promise<void>;
}) {
  const { push } = useToast();
  const expected = batch.dispatchedQuantity;
  const [received, setReceived] = useState(String(expected));
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const restaurant = batch.restaurant as Restaurant | undefined;

  const count = Number(received);
  const valid = Number.isInteger(count) && count >= 0;
  const mismatch = valid && count !== expected;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid) {
      push('Enter the number of portions you received.', 'error');
      return;
    }
    if (mismatch && note.trim().length < 5) {
      push('Tell us briefly why the count differs.', 'error');
      return;
    }

    setSaving(true);
    try {
      await post(`/batches/${batch.batchId}/confirm`, {
        receivedQuantity: count,
        note: note.trim() || undefined,
      });
      push(
        mismatch
          ? `${batch.batchId} confirmed with a shortfall — flagged for review.`
          : `${batch.batchId} confirmed. Thank you.`,
        'success'
      );
      await onDone();
    } catch (err) {
      push(err instanceof ApiError ? err.message : 'Could not confirm this batch.', 'error');
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
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="eyebrow">Confirm receipt</p>
            <h2 className="display-sm mt-2">{batch.batchId}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="-mr-2 flex size-9 items-center justify-center text-ink-mute hover:text-ink"
          >
            <X size={18} />
          </button>
        </div>

        <p className="mt-2.5 text-[13.5px] leading-relaxed text-ink-soft">
          {restaurant?.name ?? 'The kitchen'} sent{' '}
          <span className="text-ink">
            {expected} {pluralize(expected, 'portion')} of {batch.itemName}
          </span>
          .
        </p>

        <div className="mt-7">
          <label className="label-lux" htmlFor="received">
            Portions actually received
          </label>
          <input
            id="received"
            type="number"
            min="0"
            step="1"
            required
            autoFocus
            className="field numeral text-[1.35rem]"
            value={received}
            onChange={(e) => setReceived(e.target.value)}
          />
        </div>

        {mismatch && (
          <div className="mt-4 rounded-xl border border-amber/30 bg-amber-tint p-4">
            <p className="flex items-center gap-2 text-[13px] font-medium text-amber">
              <AlertTriangle size={14} strokeWidth={1.8} />
              {count < expected
                ? `That is ${expected - count} fewer than was sent`
                : `That is ${count - expected} more than was sent`}
            </p>
            <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink-soft">
              The donors will see this on their tracking pages and our team will review it. Please
              say what happened.
            </p>
          </div>
        )}

        <div className="mt-5">
          <label className="label-lux" htmlFor="note">
            Note{' '}
            {mismatch ? (
              <span className="text-danger" aria-hidden>
                *
              </span>
            ) : (
              <span className="normal-case tracking-normal">(optional)</span>
            )}
          </label>
          <textarea
            id="note"
            rows={3}
            maxLength={500}
            className="field resize-none"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={
              mismatch
                ? 'Two carriers arrived damaged and could not be served.'
                : 'Served at the Udyachand shelter this evening.'
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
