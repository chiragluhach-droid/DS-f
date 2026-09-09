'use client';

import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Loader2, Check, X, Pause, ExternalLink, MapPin, Inbox } from 'lucide-react';
import { get, patch, ApiError } from '@/lib/api';
import { useToast } from '@/components/Toast';
import { PageHeading, EmptyState } from '@/components/dashboard/DashboardShell';
import { formatInr, formatNumber, formatDate, cn } from '@/lib/utils';

type Approval = 'pending' | 'approved' | 'rejected' | 'suspended';

export interface ApprovalEntity {
  _id: string;
  name: string;
  slug: string;
  email: string;
  phone: string;
  logoImage?: string;
  coverImage?: string;
  address: { city: string; state: string };
  approvalStatus: Approval;
  createdAt: string;
  registrationNumber?: string;
  fssaiLicense?: string;
  stats?: { totalFoodValuePaise?: number; totalPortions?: number; portionsReceived?: number };
}

const FILTERS: { value: string; label: string }[] = [
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'suspended', label: 'Suspended' },
  { value: 'all', label: 'All' },
];

const TONE: Record<Approval, string> = {
  approved: 'border-emerald/25 bg-emerald-wash text-emerald',
  pending: 'border-amber/25 bg-amber-tint text-amber',
  rejected: 'border-danger/25 bg-danger-tint text-danger',
  suspended: 'border-line bg-paper text-ink-mute',
};

export function ApprovalList({
  kind,
  endpoint,
  listKey,
  eyebrow,
  title,
  description,
  publicPath,
}: {
  kind: 'restaurant' | 'ngo';
  endpoint: string;
  listKey: 'restaurants' | 'ngos';
  eyebrow: string;
  title: string;
  description: string;
  publicPath?: (slug: string) => string;
}) {
  const { push } = useToast();
  const [filter, setFilter] = useState('pending');
  const [items, setItems] = useState<ApprovalEntity[] | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    setItems(null);
    try {
      const data = await get<Record<string, ApprovalEntity[]>>(`${endpoint}?status=${filter}`);
      setItems(data[listKey] ?? []);
    } catch {
      setItems([]);
    }
  }, [endpoint, filter, listKey]);

  useEffect(() => {
    void load();
  }, [load]);

  const setApproval = async (entity: ApprovalEntity, approvalStatus: Approval) => {
    setBusy(entity._id);
    try {
      await patch(`${endpoint}/${entity._id}/approval`, { approvalStatus });
      push(`${entity.name} → ${approvalStatus}.`, 'success');
      await load();
    } catch (err) {
      push(err instanceof ApiError ? err.message : 'Could not update this record.', 'error');
    } finally {
      setBusy(null);
    }
  };

  return (
    <>
      <PageHeading eyebrow={eyebrow} title={title} description={description} />

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

      {items === null ? (
        <div className="flex min-h-[30dvh] items-center justify-center">
          <Loader2 className="size-5 animate-spin text-ink-mute" />
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title={`No ${filter === 'all' ? '' : filter} ${kind === 'ngo' ? 'NGOs' : 'restaurants'}`}
          body={
            filter === 'pending'
              ? 'Nothing is waiting on a decision right now.'
              : 'Nothing matches this filter.'
          }
        />
      ) : (
        <ul className="space-y-3">
          {items.map((entity) => (
            <li key={entity._id} className="rounded-[18px] border border-line bg-surface p-5">
              <div className="flex flex-wrap items-start gap-4">
                <div className="relative size-14 shrink-0 overflow-hidden rounded-full border border-line bg-paper-deep">
                  {entity.logoImage && (
                    <Image
                      src={entity.logoImage}
                      alt={entity.name}
                      fill
                      sizes="56px"
                      className="object-cover"
                    />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <h2 className="font-display text-[1.2rem] font-medium tracking-[-0.018em] text-ink">
                      {entity.name}
                    </h2>
                    <span
                      className={cn(
                        'rounded-full border px-2.5 py-1 text-[10px] uppercase tracking-[0.1em]',
                        TONE[entity.approvalStatus]
                      )}
                    >
                      {entity.approvalStatus}
                    </span>
                  </div>

                  <p className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12.5px] text-ink-mute">
                    <span className="flex items-center gap-1.5">
                      <MapPin size={12} strokeWidth={1.6} />
                      {entity.address?.city}, {entity.address?.state}
                    </span>
                    <span>{entity.email}</span>
                    <span>{entity.phone}</span>
                  </p>

                  <p className="mt-2 text-[12px] text-ink-mute">
                    Applied {formatDate(entity.createdAt)}
                    {entity.fssaiLicense && ` · FSSAI ${entity.fssaiLicense}`}
                    {entity.registrationNumber && ` · Reg. ${entity.registrationNumber}`}
                    {' · '}
                    {entity.stats?.totalFoodValuePaise !== undefined
                      ? `${formatInr(entity.stats.totalFoodValuePaise)} of food`
                      : `${formatNumber(entity.stats?.portionsReceived ?? 0)} portions received`}
                  </p>
                </div>

                {publicPath && entity.approvalStatus === 'approved' && (
                  <Link
                    href={publicPath(entity.slug)}
                    target="_blank"
                    className="flex items-center gap-1.5 text-[12.5px] text-ink-mute transition-colors hover:text-emerald"
                  >
                    View
                    <ExternalLink size={12} />
                  </Link>
                )}
              </div>

              <div className="mt-5 flex flex-wrap gap-2.5 border-t border-line-soft pt-4">
                {entity.approvalStatus !== 'approved' && (
                  <button
                    onClick={() => setApproval(entity, 'approved')}
                    disabled={busy === entity._id}
                    className="btn btn-primary py-2.5 text-[13px]"
                  >
                    {busy === entity._id ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Check size={14} strokeWidth={2.4} />
                    )}
                    Approve
                  </button>
                )}
                {entity.approvalStatus === 'approved' && (
                  <button
                    onClick={() => setApproval(entity, 'suspended')}
                    disabled={busy === entity._id}
                    className="btn btn-outline py-2.5 text-[13px]"
                  >
                    <Pause size={14} />
                    Suspend
                  </button>
                )}
                {entity.approvalStatus !== 'rejected' && (
                  <button
                    onClick={() => setApproval(entity, 'rejected')}
                    disabled={busy === entity._id}
                    className="btn btn-ghost py-2.5 text-[13px] hover:bg-danger-tint hover:text-danger"
                  >
                    <X size={14} />
                    Reject
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
