'use client';

import { useEffect, useState } from 'react';
import { Loader2, FileClock } from 'lucide-react';
import { get } from '@/lib/api';
import { PageHeading, EmptyState } from '@/components/dashboard/DashboardShell';
import { formatDate, formatTime, relativeTime, cn } from '@/lib/utils';

interface AuditLog {
  _id: string;
  actorEmail?: string;
  actorRole?: string;
  action: string;
  entityType: string;
  entityId?: string;
  before?: Record<string, unknown>;
  after?: Record<string, unknown>;
  ip?: string;
  createdAt: string;
}

const ENTITIES = ['all', 'Donation', 'Restaurant', 'Ngo', 'MenuItem', 'User'];

export default function AuditPage() {
  const [entityType, setEntityType] = useState('all');
  const [logs, setLogs] = useState<AuditLog[] | null>(null);

  useEffect(() => {
    setLogs(null);
    void get<{ logs: AuditLog[] }>(`/admin/audit-logs?entityType=${entityType}`)
      .then((d) => setLogs(d.logs))
      .catch(() => setLogs([]));
  }, [entityType]);

  return (
    <>
      <PageHeading
        eyebrow="Audit log"
        title="Who did what, and when"
        description="Append-only. Every approval, status change and payment verification lands here with the actor attached."
      />

      <div className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 pb-6 md:mx-0 md:px-0">
        {ENTITIES.map((e) => (
          <button
            key={e}
            onClick={() => setEntityType(e)}
            className={cn(
              'shrink-0 rounded-full border px-3.5 py-1.5 text-[12.5px] transition-all duration-300',
              entityType === e
                ? 'border-emerald bg-emerald text-paper'
                : 'border-line bg-surface text-ink-soft hover:border-emerald/40 hover:text-emerald'
            )}
          >
            {e === 'all' ? 'Everything' : e}
          </button>
        ))}
      </div>

      {logs === null ? (
        <div className="flex min-h-[30dvh] items-center justify-center">
          <Loader2 className="size-5 animate-spin text-ink-mute" />
        </div>
      ) : logs.length === 0 ? (
        <EmptyState
          icon={FileClock}
          title="Nothing logged yet"
          body="Actions taken across the platform will be recorded here as they happen."
        />
      ) : (
        <ol className="relative space-y-0">
          {logs.map((log, i) => (
            <li key={log._id} className="relative flex gap-5 pb-6 last:pb-0">
              {i < logs.length - 1 && (
                <span aria-hidden className="absolute bottom-0 left-[7px] top-5 w-px bg-line" />
              )}
              <span className="relative z-10 mt-1.5 size-[15px] shrink-0 rounded-full border-4 border-paper-deep bg-emerald/35" />

              <div className="min-w-0 flex-1 rounded-[14px] border border-line bg-surface p-4">
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                  <p className="numeral text-[13.5px] text-ink">{log.action}</p>
                  <time className="text-[11.5px] tabular-nums text-ink-mute">
                    {formatDate(log.createdAt)} · {formatTime(log.createdAt)} ·{' '}
                    {relativeTime(log.createdAt)}
                  </time>
                </div>

                <p className="mt-1.5 text-[12.5px] text-ink-soft">
                  {log.entityType}
                  {log.entityId && ` · ${log.entityId}`}
                </p>

                <p className="mt-2 text-[12px] text-ink-mute">
                  {log.actorEmail ?? 'system'}
                  {log.actorRole && ` (${log.actorRole})`}
                  {log.ip && ` · ${log.ip}`}
                </p>

                {(log.before || log.after) && (
                  <div className="mt-3 flex flex-wrap gap-2 border-t border-line-soft pt-3 text-[11.5px]">
                    {log.before && (
                      <code className="rounded-md bg-danger-tint px-2 py-1 text-danger">
                        − {JSON.stringify(log.before).slice(0, 90)}
                      </code>
                    )}
                    {log.after && (
                      <code className="rounded-md bg-emerald-wash px-2 py-1 text-emerald">
                        + {JSON.stringify(log.after).slice(0, 90)}
                      </code>
                    )}
                  </div>
                )}
              </div>
            </li>
          ))}
        </ol>
      )}
    </>
  );
}
