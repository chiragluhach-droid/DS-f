import { cn } from '@/lib/utils';
import { STATUS_META, type AnyStatus } from '@/lib/types';

const TONE: Record<AnyStatus, string> = {
  PENDING_PAYMENT: 'bg-paper-deep text-ink-soft border-line',
  PAYMENT_SUCCESS: 'bg-paper-deep text-ink-soft border-line',
  ASSIGNED_TO_BATCH: 'bg-blue-50 text-blue-600 border-blue-200',
  DISPATCHED: 'bg-amber-tint text-amber border-amber/25',
  NGO_CONFIRMED: 'bg-emerald text-paper border-emerald',
  CANCELLED: 'bg-danger-tint text-danger border-danger/25',
  REFUNDED: 'bg-danger-tint text-danger border-danger/25',
  FAILED: 'bg-danger-tint text-danger border-danger/25',
};

export function StatusBadge({
  status,
  className,
  short = false,
}: {
  status: AnyStatus;
  className?: string;
  short?: boolean;
}) {
  const meta = STATUS_META[status];
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1 text-[10.5px] font-medium uppercase tracking-[0.09em]',
        TONE[status],
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
