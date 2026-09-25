'use client';

import { useCallback, useEffect, useState } from 'react';
import { Loader2, PackageCheck, ArrowRight } from 'lucide-react';
import { get, post } from '@/lib/api';
import { useToast } from '@/components/Toast';
import { PageHeading, EmptyState } from '@/components/dashboard/DashboardShell';
import { formatDate, cn } from '@/lib/utils';
import type { Batch, Ngo, MenuItem } from '@/lib/types';

const STATUS_MAP: Record<string, { label: string, color: string }> = {
  IN_PROGRESS: { label: 'Funding', color: 'bg-surface text-ink-mute border border-line' },
  READY_FOR_DELIVERY: { label: 'Ready to dispatch', color: 'bg-amber-tint text-amber border border-amber/30' },
  DISPATCHED: { label: 'Dispatched', color: 'bg-emerald-wash text-emerald border border-emerald/25' },
  NGO_RECEIVED: { label: 'NGO Received', color: 'bg-surface text-ink-mute border border-line' },
  RECONCILIATION_REQUIRED: { label: 'Flagged', color: 'bg-amber-tint text-amber border border-amber/30' },
  COMPLETED: { label: 'Closed', color: 'bg-surface text-ink-mute border border-line' }
};

export default function RestaurantBatchesPage() {
  const { push } = useToast();
  const [batches, setBatches] = useState<Batch[] | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const data = await get<{ data: Batch[] }>('/batches/restaurant');
      setBatches(data.data);
    } catch {
      setBatches([]);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const handleDispatch = async (batch: Batch) => {
    const qty = window.prompt(`How many portions of ${(batch.menuItem as MenuItem).name} are you dispatching?`, batch.collectedQuantity.toString());
    if (!qty) return;
    const dispatchedQuantity = parseInt(qty, 10);
    if (isNaN(dispatchedQuantity)) return push('Invalid quantity', 'error');

    setBusy(batch.batchId);
    try {
      await post(`/batches/${batch.batchId}/dispatch`, { dispatchedQuantity });
      push('Batch dispatched to NGO', 'success');
      await load();
    } catch (e: any) {
      push(e.message || 'Failed to dispatch batch', 'error');
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

  const readyBatches = batches.filter(b => b.status === 'READY_FOR_DELIVERY');
  const otherBatches = batches.filter(b => b.status !== 'READY_FOR_DELIVERY');

  return (
    <>
      <PageHeading
        eyebrow="Operations"
        title="Meal Batches"
        description="Batches automatically collect donations until they reach their target, at which point they lock and await dispatch."
      />

      {batches.length === 0 ? (
        <EmptyState
          icon={PackageCheck}
          title="No active batches"
          body="Once a donation arrives, the first batch will be created."
        />
      ) : (
        <div className="space-y-8">
          {readyBatches.length > 0 && (
            <section>
              <h3 className="font-display text-[1.1rem] font-medium text-ink mb-4">Ready for Dispatch</h3>
              <ul className="space-y-3">
                {readyBatches.map(b => (
                  <BatchCard key={b._id} batch={b} busy={busy} onDispatch={handleDispatch} />
                ))}
              </ul>
            </section>
          )}

          {otherBatches.length > 0 && (
            <section>
              <h3 className="font-display text-[1.1rem] font-medium text-ink mb-4">All Batches</h3>
              <ul className="space-y-3">
                {otherBatches.map(b => (
                  <BatchCard key={b._id} batch={b} busy={busy} onDispatch={handleDispatch} />
                ))}
              </ul>
            </section>
          )}
        </div>
      )}
    </>
  );
}

function BatchCard({ batch, busy, onDispatch }: { batch: Batch, busy: string | null, onDispatch: (b: Batch) => void }) {
  const ngo = batch.ngo as Ngo;
  const item = batch.menuItem as MenuItem;
  const meta = STATUS_MAP[batch.status] || STATUS_MAP.IN_PROGRESS;

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
            {batch.targetQuantity}× {item?.name}
          </p>

          <p className="mt-1.5 text-[12.5px] text-ink-mute">
            Targeting {ngo?.name} · Created {formatDate(batch.createdAt)}
          </p>

          {batch.status === 'IN_PROGRESS' && (
            <div className="mt-4 max-w-sm">
              <div className="flex justify-between text-[11px] text-ink-mute mb-1">
                <span>{batch.collectedQuantity} funded</span>
                <span>{batch.targetQuantity} target</span>
              </div>
              <div className="h-1.5 w-full bg-line-soft rounded-full overflow-hidden">
                <div 
                  className="h-full bg-emerald transition-all duration-500" 
                  style={{ width: `${Math.min(100, Math.round((batch.collectedQuantity / batch.targetQuantity) * 100))}%` }} 
                />
              </div>
            </div>
          )}
        </div>

        <div className="shrink-0 flex flex-col items-end">
          {batch.status === 'READY_FOR_DELIVERY' && (
            <button
              onClick={() => onDispatch(batch)}
              disabled={busy === batch.batchId}
              className="btn btn-primary group px-5 py-2 text-[12.5px]"
            >
              {busy === batch.batchId ? (
                <Loader2 className="animate-spin" size={14} />
              ) : (
                <>
                  Dispatch
                  <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </li>
  );
}
