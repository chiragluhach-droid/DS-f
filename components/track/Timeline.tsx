import { Check, AlertTriangle } from 'lucide-react';
import { DONATION_STATUSES, STATUS_META, type AnyStatus, type DonationEvent } from '@/lib/types';
import { formatDate, formatTime, cn } from '@/lib/utils';

const ROLE_LABEL: Record<string, string> = {
  system: 'DaanSetu',
  customer: 'Donor',
  restaurant: 'Restaurant',
  ngo: 'NGO',
  admin: 'Admin',
};

export function Timeline({
  status,
  events,
  flagged,
}: {
  status: AnyStatus;
  events: DonationEvent[];
  flagged?: boolean;
}) {
  const currentIdx = DONATION_STATUSES.indexOf(status as (typeof DONATION_STATUSES)[number]);
  const eventByStatus = new Map(events.map((e) => [e.status, e]));

  return (
    <ol className="relative">
      {DONATION_STATUSES.map((step, i) => {
        const event = eventByStatus.get(step);
        const done = i <= currentIdx && currentIdx >= 0;
        const active = i === currentIdx;
        const isLast = i === DONATION_STATUSES.length - 1;
        const meta = STATUS_META[step];
        const isFlaggedStep = isLast && flagged && done;

        return (
          <li key={step} className="relative flex gap-5 pb-8 last:pb-0">
            {/* connector */}
            {!isLast && (
              <span
                aria-hidden
                className={cn(
                  'absolute left-[15px] top-8 w-px',
                  'bottom-0',
                  i < currentIdx ? 'bg-emerald/35' : 'bg-line'
                )}
              />
            )}

            {/* node */}
            <span
              className={cn(
                'relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full border transition-all duration-500',
                isFlaggedStep
                  ? 'border-amber/40 bg-amber-tint text-amber'
                  : done
                    ? 'border-emerald bg-emerald text-paper'
                    : 'border-line bg-surface text-ink-faint'
              )}
            >
              {isFlaggedStep ? (
                <AlertTriangle size={13} strokeWidth={2} />
              ) : done ? (
                <Check size={13} strokeWidth={2.6} />
              ) : (
                <span className="size-1.5 rounded-full bg-current" />
              )}
              {active && !isLast && (
                <span className="absolute inset-0 animate-ping rounded-full border border-emerald opacity-40" />
              )}
            </span>

            {/* body */}
            <div className={cn('min-w-0 flex-1 pt-1', !done && 'opacity-55')}>
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <h3
                  className={cn(
                    'font-display text-[1.15rem] font-medium tracking-[-0.018em]',
                    done ? 'text-ink' : 'text-ink-mute'
                  )}
                >
                  {event?.title ?? meta.label}
                </h3>
                {event && (
                  <time className="shrink-0 text-[11.5px] tabular-nums text-ink-mute">
                    {formatDate(event.createdAt)} · {formatTime(event.createdAt)}
                  </time>
                )}
              </div>

              <p className="mt-1.5 text-[13.5px] leading-relaxed text-ink-soft">
                {event?.note ?? meta.blurb}
              </p>

              {event && (
                <p className="mt-2.5 inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-2.5 py-1 text-[10.5px] uppercase tracking-[0.1em] text-ink-mute">
                  {ROLE_LABEL[event.actorRole] ?? event.actorRole} · {event.actorName}
                </p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
