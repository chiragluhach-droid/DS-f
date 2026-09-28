'use client';

import { useCallback, useEffect, useState } from 'react';
import { Loader2, PackageCheck, Truck, X, AlertTriangle } from 'lucide-react';
import { get, post, ApiError } from '@/lib/api';
import { useToast } from '@/components/Toast';
import { PageHeading, EmptyState, StatCard } from '@/components/dashboard/DashboardShell';
import { LoadError } from '@/components/dashboard/LoadError';
import { BatchStatusBadge } from '@/components/StatusBadge';
import { formatDate, formatTime, cn, pluralize } from '@/lib/utils';
import { BATCH_META, type Batch, type BatchSummary, type Ngo } from '@/lib/types';

interface Data {
  batches: Batch[];
  summary: BatchSummary;
}

export default function RestaurantBatchesPage() {
  const { push } = useToast();
  const [data, setData] = useState<Data | null>(null);
  const [error, setError] = useState<unknown>(null);
  const [dispatching, setDispatching] = useState<Batch | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      setData(await get<Data>('/batches/restaurant'));
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
        <PageHeading eyebrow="Batches" title="What to cook, and what has gone" />
        <LoadError error={error} onRetry={() => void load()} what="your batches" />
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
  const ready = batches.filter((b) => b.status === 'READY_FOR_DELIVERY');
  const collecting = batches.filter((b) => b.status === 'IN_PROGRESS');
  const gone = batches.filter((b) =>
    ['DISPATCHED', 'RECONCILIATION_REQUIRED', 'COMPLETED'].includes(b.status)
  );

  return (
    <>
      <PageHeading
        eyebrow="Batches"
        title="What to cook, and what has gone"
        description="Guests fund portions of a dish until a batch hits its target. Cook the batch, send it, and the NGO counts it on arrival."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Ready to cook"
          value={summary.readyToCook}
          sub={`${summary.byStatus.READY_FOR_DELIVERY.portions} portions waiting`}
          tone={summary.readyToCook > 0 ? 'amber' : 'default'}
        />
        <StatCard
          label="Collecting"
          value={summary.collecting}
          sub={`${summary.byStatus.IN_PROGRESS.portions} portions funded so far`}
        />
        <StatCard
          label="With the NGO"
          value={summary.inTransit}
          sub={`${summary.portionsInTransit} portions awaiting their count`}
        />
        <StatCard
          label="Closed"
          value={summary.byStatus.COMPLETED.batches}
          sub="Counted and confirmed"
          tone="emerald"
        />
      </div>

      {batches.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            icon={PackageCheck}
            title="No batches yet"
            body="The first donation a guest funds opens a batch for that dish. Share your QR code to get started."
          />
        </div>
      ) : (
        <div className="mt-10 space-y-10">
          {ready.length > 0 && (
            <Section
              title="Ready to cook"
              blurb="These batches have reached their target. Cook them and send them out."
            >
              {ready.map((batch) => (
                <BatchRow key={batch._id} batch={batch} onDispatch={setDispatching} />
              ))}
            </Section>
          )}

          {collecting.length > 0 && (
            <Section
              title="Still collecting"
              blurb="You can send a batch early if you would rather not wait for the target."
            >
              {collecting.map((batch) => (
                <BatchRow key={batch._id} batch={batch} onDispatch={setDispatching} />
              ))}
            </Section>
          )}

          {gone.length > 0 && (
            <Section title="Sent" blurb="Everything that has left your kitchen.">
              {gone.map((batch) => (
                <BatchRow key={batch._id} batch={batch} onDispatch={setDispatching} />
              ))}
            </Section>
          )}
        </div>
      )}

      {dispatching && (
        <DispatchDialog
          batch={dispatching}
          onClose={() => setDispatching(null)}
          onDone={async () => {
            setDispatching(null);
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

function BatchRow({ batch, onDispatch }: { batch: Batch; onDispatch: (b: Batch) => void }) {
  const ngo = batch.ngo as Ngo | undefined;
  const canDispatch = batch.status === 'IN_PROGRESS' || batch.status === 'READY_FOR_DELIVERY';
  const percent = Math.min(
    100,
    Math.round((batch.collectedQuantity / Math.max(1, batch.targetQuantity)) * 100)
  );
  const flagged = batch.status === 'RECONCILIATION_REQUIRED';

  return (
    <li
      className={cn(
        'rounded-[18px] border bg-surface p-5',
        flagged ? 'border-amber/30' : batch.status === 'READY_FOR_DELIVERY' ? 'border-brass/30' : 'border-line'
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
            {batch.collectedQuantity}× {batch.itemName}
          </p>

          <p className="mt-1.5 text-[12.5px] text-ink-mute">
            For {ngo?.name ?? 'your NGO partner'} · {batch.donationCount}{' '}
            {pluralize(batch.donationCount, 'donation')} · opened {formatDate(batch.createdAt)}
          </p>

          {canDispatch && (
            <div className="mt-4 max-w-sm">
              <div className="mb-1.5 flex justify-between text-[11.5px] text-ink-mute">
                <span>{batch.collectedQuantity} funded</span>
                <span>{batch.targetQuantity} target</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-line-soft">
                <div
                  className="h-full rounded-full bg-emerald transition-all duration-700"
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>
          )}

          {batch.dispatchedAt && (
            <p className="mt-3 text-[12.5px] text-ink-soft">
              Sent {formatDate(batch.dispatchedAt)} at {formatTime(batch.dispatchedAt)} —{' '}
              {batch.dispatchedQuantity} portions
              {batch.receivedAt && (
                <>
                  {' · '}
                  <span className={flagged ? 'text-amber' : 'text-emerald'}>
                    {ngo?.name ?? 'The NGO'} counted {batch.receivedQuantity}
                  </span>
                </>
              )}
            </p>
          )}

          {flagged && (
            <p className="mt-3 flex items-start gap-2 rounded-xl border border-amber/30 bg-amber-tint p-3.5 text-[12.5px] leading-relaxed text-ink-soft">
              <AlertTriangle size={13} className="mt-0.5 shrink-0 text-amber" strokeWidth={1.8} />
              <span>
                {batch.receiptNote ?? 'The count did not match.'} DaanSetu is reviewing this with
                the NGO.
              </span>
            </p>
          )}

          {batch.resolution?.note && (
            <p className="mt-2.5 border-l-2 border-emerald/40 pl-3.5 text-[12.5px] leading-relaxed text-emerald">
              Resolved: {batch.resolution.note}
            </p>
          )}
        </div>

        <div className="shrink-0">
          {canDispatch ? (
            <button
              onClick={() => onDispatch(batch)}
              className="btn btn-primary py-2.5 text-[13px]"
            >
              <Truck size={14} strokeWidth={1.8} />
              Send to {ngo?.name?.split(' ')[0] ?? 'NGO'}
            </button>
          ) : (
            <p className="max-w-[10rem] text-right text-[12.5px] text-ink-mute">
              {BATCH_META[batch.status]?.blurb}
            </p>
          )}
        </div>
      </div>
    </li>
  );
}

/**
 * The quantity is not a field: whatever guests funded is what goes out. Typing a
 * number here would let the kitchen quietly send less than it was paid for.
 */
function DispatchDialog({
  batch,
  onClose,
  onDone,
}: {
  batch: Batch;
  onClose: () => void;
  onDone: () => Promise<void>;
}) {
  const { push } = useToast();
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const ngo = batch.ngo as Ngo | undefined;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await post(`/batches/${batch.batchId}/dispatch`, { note: note.trim() || undefined });
      push(`${batch.batchId} sent — ${batch.collectedQuantity} portions on their way.`, 'success');
      await onDone();
    } catch (err) {
      push(err instanceof ApiError ? err.message : 'Could not send this batch.', 'error');
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
            <p className="eyebrow">Send this batch</p>
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

        <div className="mt-6 rounded-xl border border-emerald/20 bg-emerald-wash p-5">
          <p className="numeral text-[2rem] leading-none text-emerald">
            {batch.collectedQuantity}
          </p>
          <p className="mt-1.5 text-[12.5px] text-ink-soft">
            portions of {batch.itemName} to cook and hand to {ngo?.name ?? 'your NGO partner'}
          </p>
        </div>

        <p className="mt-4 text-[13px] leading-relaxed text-ink-soft">
          Everything guests funded goes out — {ngo?.name ?? 'the NGO'} counts what arrives and
          their number is recorded against this one. This cannot be undone.
        </p>

        <div className="mt-5">
          <label className="label-lux" htmlFor="dispatch-note">
            Note <span className="normal-case tracking-normal">(optional)</span>
          </label>
          <textarea
            id="dispatch-note"
            rows={3}
            maxLength={500}
            className="field resize-none"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Cooked fresh at 9am and sent with the morning run."
          />
        </div>

        <div className="mt-7 flex gap-3">
          <button type="button" onClick={onClose} className="btn btn-outline flex-1">
            Cancel
          </button>
          <button type="submit" disabled={saving} className="btn btn-primary flex-1">
            {saving && <Loader2 size={15} className="animate-spin" />}
            Send it
          </button>
        </div>
      </form>
    </div>
  );
}
