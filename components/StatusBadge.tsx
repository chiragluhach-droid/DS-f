import { cn } from '@/lib/utils';
import { statusMeta, BATCH_META, type BatchStatus } from '@/lib/types';

const TONE: Record<string, string> = {
  PENDING_PAYMENT: 'bg-paper-deep text-ink-mute border-line',
  PAYMENT_SUCCESS: 'bg-paper-deep text-ink-soft border-line',
  ASSIGNED_TO_BATCH: 'bg-brass-tint text-brass border-brass/25',
  DISPATCHED: 'bg-amber-tint text-amber border-amber/25',
  NGO_CONFIRMED: 'bg-emerald text-paper border-emerald',
  FAILED: 'bg-danger-tint text-danger border-danger/25',
  CANCELLED: 'bg-danger-tint text-danger border-danger/25',
  REFUNDED: 'bg-danger-tint text-danger border-danger/25',
};

const FALLBACK_TONE = 'bg-paper-deep text-ink-soft border-line';

/**
 * Takes a status string rather than a union: the server owns the lifecycle, and
 * an unfamiliar status should read plainly instead of breaking the page.
 */
export function StatusBadge({
  status,
  className,
  short = false,
}: {
  status: string;
  className?: string;
  short?: boolean;
}) {
  const meta = statusMeta(status);
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1 text-[10.5px] font-medium uppercase tracking-[0.09em]',
        TONE[status] ?? FALLBACK_TONE,
        className
      )}
    >
      {status === 'NGO_CONFIRMED' && (
        <span className="size-1 rounded-full bg-current opacity-70" aria-hidden />
      )}
      {short ? meta.short : meta.label}
    </span>
  );
}

const BATCH_TONE: Record<BatchStatus, string> = {
  IN_PROGRESS: 'bg-paper-deep text-ink-soft border-line',
  READY_FOR_DELIVERY: 'bg-brass-tint text-brass border-brass/30',
  DISPATCHED: 'bg-amber-tint text-amber border-amber/25',
  RECONCILIATION_REQUIRED: 'bg-danger-tint text-danger border-danger/25',
  COMPLETED: 'bg-emerald text-paper border-emerald',
};

export function BatchStatusBadge({
  status,
  className,
  short = false,
}: {
  status: BatchStatus;
  className?: string;
  short?: boolean;
}) {
  const meta = BATCH_META[status];
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1 text-[10.5px] font-medium uppercase tracking-[0.09em]',
        BATCH_TONE[status] ?? FALLBACK_TONE,
        className
      )}
    >
      {meta ? (short ? meta.short : meta.label) : status}
    </span>
  );
}
