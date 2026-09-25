'use client';

import { useCallback, useEffect, useState } from 'react';
import { Loader2, PackageCheck, Check } from 'lucide-react';
import { get, post } from '@/lib/api';
import { useToast } from '@/components/Toast';
import { PageHeading, EmptyState } from '@/components/dashboard/DashboardShell';
import { formatDate, cn } from '@/lib/utils';
import type { Batch, Restaurant, MenuItem } from '@/lib/types';

const STATUS_MAP: Record<string, { label: string, color: string }> = {
  IN_PROGRESS: { label: 'Funding', color: 'bg-surface text-ink-mute border border-line' },
  READY_FOR_DELIVERY: { label: 'Ready to dispatch', color: 'bg-amber-tint text-amber border border-amber/30' },
  DISPATCHED: { label: 'Incoming', color: 'bg-emerald-wash text-emerald border border-emerald/25' },
  NGO_RECEIVED: { label: 'Received', color: 'bg-surface text-ink-mute border border-line' },
  RECONCILIATION_REQUIRED: { label: 'Flagged', color: 'bg-amber-tint text-amber border border-amber/30' },
  COMPLETED: { label: 'Closed', color: 'bg-surface text-ink-mute border border-line' }
};

export default function NgoBatchesPage() {
  const { push } = useToast();
  const [batches, setBatches] = useState<Batch[] | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const data = await get<{ data: Batch[] }>('/batches/ngo');
      setBatches(data.data);
    } catch {
      setBatches([]);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const handleConfirm = async (batch: Batch) => {
    const expected = batch.dispatchedQuantity || batch.collectedQuantity;
    const qty = window.prompt(`How many portions of ${(batch.menuItem as MenuItem).name} did you receive?`, expected.toString());
    if (!qty) return;
    const receivedQuantity = parseInt(qty, 10);
    if (isNaN(receivedQuantity)) return push('Invalid quantity', 'error');

    setBusy(batch.batchId);
    try {
      await post(`/batches/${batch.batchId}/confirm`, { receivedQuantity });
      push('Batch received and confirmed', 'success');
      await load();
    } catch (e: any) {
      push(e.message || 'Failed to confirm receipt', 'error');
    } finally {
      setBusy(null);
    }
  };

  if (batches === null) {
    return (
      <div className="flex min-h-[50dvh] items-center justify-center">
        <Loader2 className="size-5 animate-spin text-ink-mute" />
      </div>
    );
  }

  const incomingBatches = batches.filter(b => b.status === 'DISPATCHED');
  const historyBatches = batches.filter(b => b.status !== 'DISPATCHED' && b.status !== 'IN_PROGRESS' && b.status !== 'READY_FOR_DELIVERY');

  return (
    <>
      <PageHeading
        eyebrow="Operations"
        title="Incoming Food"
        description="Batches dispatched by your partner kitchens will appear here for you to confirm receipt."
      />

      {batches.length === 0 ? (
        <EmptyState
          icon={PackageCheck}
          title="No deliveries yet"
          body="Once a kitchen dispatches a batch of food to you, it will appear here."
        />
      ) : (
        <div className="space-y-8">
          {incomingBatches.length > 0 && (
            <section>
              <h3 className="font-display text-[1.1rem] font-medium text-ink mb-4">Incoming Deliveries</h3>
              <ul className="space-y-3">
                {incomingBatches.map(b => (
                  <BatchCard key={b._id} batch={b} busy={busy} onConfirm={handleConfirm} />
                ))}
              </ul>
            </section>
          )}

          {historyBatches.length > 0 && (
            <section>
              <h3 className="font-display text-[1.1rem] font-medium text-ink mb-4">Delivery History</h3>
              <ul className="space-y-3">
                {historyBatches.map(b => (
                  <BatchCard key={b._id} batch={b} busy={busy} onConfirm={handleConfirm} />
                ))}
              </ul>
            </section>
          )}
        </div>
      )}
    </>
  );
}

function BatchCard({ batch, busy, onConfirm }: { batch: Batch, busy: string | null, onConfirm: (b: Batch) => void }) {
  const restaurant = batch.restaurant as Restaurant;
  const item = batch.menuItem as MenuItem;
  const meta = STATUS_MAP[batch.status] || STATUS_MAP.COMPLETED;

  return (
    <li className="rounded-[18px] border border-line bg-surface p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="numeral text-[13px] tracking-[0.03em] text-ink-mute">
              {batch.batchId}
            </span>
            <span className={cn('rounded-full px-2.5 py-1 text-[10px] uppercase tracking-[0.1em]', meta.color)}>
              {meta.label}
            </span>
          </div>

          <p className="mt-2.5 font-display text-[1.15rem] font-medium tracking-[-0.015em] text-ink">
            {batch.dispatchedQuantity || batch.collectedQuantity}× {item?.name}
          </p>

          <p className="mt-1.5 text-[12.5px] text-ink-mute">
            From {restaurant?.name} · Dispatched {batch.dispatchedAt ? formatDate(batch.dispatchedAt) : 'Pending'}
          </p>
        </div>

        <div className="shrink-0 flex flex-col items-end">
          {batch.status === 'DISPATCHED' && (
            <button
              onClick={() => onConfirm(batch)}
              disabled={busy === batch.batchId}
              className="btn btn-primary group px-5 py-2 text-[12.5px]"
            >
              {busy === batch.batchId ? (
                <Loader2 className="animate-spin" size={14} />
              ) : (
                <>
                  Confirm Receipt
                  <Check size={14} className="ml-1" />
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </li>
  );
}
