import { AlertTriangle, Check, CookingPot, Truck } from 'lucide-react';
import { BATCH_META, type TrackedBatch } from '@/lib/types';
import { formatDate, cn, pluralize } from '@/lib/utils';

/**
 * A kitchen cooks in batches, so a donor's dishes travel with other people's.
 * This shows the batch each of their dishes is in, and how full it is — the
 * honest answer to "where is my meal?" between paying and delivery.
 */
export function BatchProgress({ batches }: { batches: TrackedBatch[] }) {
  if (batches.length === 0) return null;

  return (
    <ul className="space-y-3">
      {batches.map((batch, i) => {
        const meta = batch.status ? BATCH_META[batch.status] : undefined;
        const collected = batch.collectedQuantity ?? 0;
        const target = batch.targetQuantity ?? 0;
        const sent = Boolean(batch.dispatchedAt);
        const received = Boolean(batch.receivedAt);
        const percent = target > 0 ? Math.min(100, Math.round((collected / target) * 100)) : 0;

        const Icon = batch.shortfall ? AlertTriangle : received ? Check : sent ? Truck : CookingPot;

        return (
          <li
            key={`${batch.batchId ?? 'batch'}-${i}`}
            className={cn(
              'rounded-[16px] border p-4 md:p-5',
              batch.shortfall ? 'border-amber/30 bg-amber-tint' : 'border-line bg-surface'
            )}
          >
            <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
              <div className="min-w-0">
                <p className="flex items-center gap-2 text-[14px] font-medium text-ink">
                  <Icon
                    size={14}
                    strokeWidth={1.8}
                    className={cn('shrink-0', batch.shortfall ? 'text-amber' : 'text-emerald')}
                  />
                  {batch.quantity} × {batch.itemName}
                </p>
                <p className="mt-1 text-[12px] text-ink-mute">
                  {meta?.blurb ?? 'Waiting to be added to a batch.'}
                </p>
              </div>
              {batch.batchId && (
                <span className="numeral shrink-0 text-[11.5px] tracking-[0.03em] text-ink-faint">
                  {batch.batchId}
                </span>
              )}
            </div>

            {/* Before it is sent, the honest thing to show is how full the batch is. */}
            {!sent && target > 0 && (
              <div className="mt-4">
                <div className="flex items-baseline justify-between text-[12px] text-ink-mute">
                  <span>
                    {collected} of {target} {pluralize(target, 'portion')} funded
                  </span>
                  <span className="numeral">{percent}%</span>
                </div>
                <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-line-soft">
                  <div
                    className="h-full rounded-full bg-emerald transition-all duration-700"
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            )}

            {sent && (
              <dl className="mt-4 flex flex-wrap gap-x-8 gap-y-2 border-t border-line-soft pt-3.5 text-[12px]">
                <div>
                  <dt className="text-ink-mute">Sent</dt>
                  <dd className="numeral mt-0.5 text-ink">
                    {batch.dispatchedQuantity} portions
                    {batch.dispatchedAt && (
                      <span className="text-ink-faint"> · {formatDate(batch.dispatchedAt)}</span>
                    )}
                  </dd>
                </div>
                {received && (
                  <div>
                    <dt className="text-ink-mute">Counted by the NGO</dt>
                    <dd
                      className={cn(
                        'numeral mt-0.5',
                        batch.shortfall ? 'text-amber' : 'text-emerald'
                      )}
                    >
                      {batch.receivedQuantity} portions
                      {batch.receivedAt && (
                        <span className="text-ink-faint"> · {formatDate(batch.receivedAt)}</span>
                      )}
                    </dd>
                  </div>
                )}
              </dl>
            )}

            {batch.receiptNote && (
              <p className="mt-3 border-l-2 border-line pl-3.5 text-[12.5px] leading-relaxed text-ink-soft">
                &ldquo;{batch.receiptNote}&rdquo; — the NGO
              </p>
            )}

            {batch.resolutionNote && (
              <p className="mt-2.5 border-l-2 border-emerald/40 pl-3.5 text-[12.5px] leading-relaxed text-emerald">
                Resolved: {batch.resolutionNote}
              </p>
            )}
          </li>
        );
      })}
    </ul>
  );
}
