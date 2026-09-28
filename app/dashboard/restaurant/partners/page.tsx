'use client';

import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import { Loader2, HeartHandshake, MapPin, Star, Pause, Play, Plus } from 'lucide-react';
import { get, post, patch, ApiError } from '@/lib/api';
import { useToast } from '@/components/Toast';
import { PageHeading, EmptyState } from '@/components/dashboard/DashboardShell';
import { formatNumber, cn, pluralize } from '@/lib/utils';
import type { Ngo } from '@/lib/types';

interface Relationship {
  _id: string;
  status: 'pending' | 'active' | 'paused' | 'ended';
  isPrimary: boolean;
  note?: string;
  ngo: Ngo;
}

interface Data {
  partnerships: Relationship[];
  available: Ngo[];
}

const STATUS_TONE: Record<string, string> = {
  active: 'border-emerald/25 bg-emerald-wash text-emerald',
  pending: 'border-amber/25 bg-amber-tint text-amber',
  paused: 'border-line bg-paper text-ink-mute',
  ended: 'border-line bg-paper text-ink-mute',
};

export default function RestaurantPartnersPage() {
  const { push } = useToast();
  const [data, setData] = useState<Data | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setData(await get<Data>('/restaurants/me/ngos'));
    } catch (err) {
      push(err instanceof ApiError ? err.message : 'Could not load your partners.', 'error');
    }
  }, [push]);

  useEffect(() => {
    void load();
  }, [load]);

  const addPartner = async (ngo: Ngo) => {
    setBusy(ngo._id);
    try {
      const result = await post<{ backlogAssigned: number }>('/restaurants/me/ngos', {
        ngoId: ngo._id,
      });
      push(
        result.backlogAssigned > 0
          ? `${ngo.name} added — ${result.backlogAssigned} waiting ${pluralize(result.backlogAssigned, 'donation')} queued for cooking.`
          : `${ngo.name} added as a partner.`,
        'success'
      );
      await load();
    } catch (err) {
      push(err instanceof ApiError ? err.message : 'Could not add that NGO.', 'error');
    } finally {
      setBusy(null);
    }
  };

  const update = async (
    rel: Relationship,
    body: { isPrimary?: boolean; status?: 'active' | 'paused' },
    message: string
  ) => {
    setBusy(rel.ngo._id);
    try {
      await patch(`/restaurants/me/ngos/${rel.ngo._id}`, body);
      push(message, 'success');
      await load();
    } catch (err) {
      push(err instanceof ApiError ? err.message : 'Could not update that partnership.', 'error');
    } finally {
      setBusy(null);
    }
  };

  if (!data) {
    return (
      <div className="flex min-h-[50dvh] items-center justify-center">
        <Loader2 className="size-5 animate-spin text-ink-mute" />
      </div>
    );
  }

  const hasPrimary = data.partnerships.some((p) => p.isPrimary && p.status === 'active');

  return (
    <>
      <PageHeading
        eyebrow="NGO partners"
        title="Where your food goes"
        description="Donations are routed to your primary partner. They receive each batch you send and confirm what arrived."
      />

      {!hasPrimary && (
        <div className="mb-8 rounded-[18px] border border-amber/30 bg-amber-tint p-5">
          <p className="text-[14px] font-medium text-ink">Choose an NGO to receive your food</p>
          <p className="mt-1 text-[13px] leading-relaxed text-ink-soft">
            Until you pick one, donations your guests fund are held safely but cannot be put into a
            batch. They are queued for cooking the moment you add a partner.
          </p>
        </div>
      )}

      {data.partnerships.length === 0 ? (
        <EmptyState
          icon={HeartHandshake}
          title="No partner yet"
          body="Pick an approved NGO below. You can change this later, and pause a partnership without losing any history."
        />
      ) : (
        <ul className="space-y-3">
          {data.partnerships.map((rel) => (
            <li
              key={rel._id}
              className={cn(
                'rounded-[18px] border bg-surface p-5',
                rel.isPrimary ? 'border-emerald/30' : 'border-line'
              )}
            >
              <div className="flex flex-wrap items-start gap-4">
                <div className="relative size-12 shrink-0 overflow-hidden rounded-full border border-line bg-paper-deep">
                  {rel.ngo.logoImage && (
                    <Image
                      src={rel.ngo.logoImage}
                      alt={rel.ngo.name}
                      fill
                      sizes="48px"
                      className="object-cover"
                    />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <h2 className="font-display text-[1.15rem] font-medium tracking-[-0.018em] text-ink">
                      {rel.ngo.name}
                    </h2>
                    {rel.isPrimary && (
                      <span className="flex items-center gap-1.5 rounded-full border border-emerald/25 bg-emerald-wash px-2.5 py-1 text-[10px] uppercase tracking-[0.1em] text-emerald">
                        <Star size={9} strokeWidth={2.4} />
                        Primary
                      </span>
                    )}
                    <span
                      className={cn(
                        'rounded-full border px-2.5 py-1 text-[10px] uppercase tracking-[0.1em]',
                        STATUS_TONE[rel.status]
                      )}
                    >
                      {rel.status}
                    </span>
                  </div>

                  <p className="mt-1.5 flex items-center gap-1.5 text-[12.5px] text-ink-mute">
                    <MapPin size={12} strokeWidth={1.6} />
                    {rel.ngo.address?.city}, {rel.ngo.address?.state} ·{' '}
                    {formatNumber(rel.ngo.stats?.portionsReceived ?? 0)} portions received all time
                  </p>

                  {rel.ngo.mission && (
                    <p className="mt-3 line-clamp-2 text-[12.5px] leading-relaxed text-ink-soft">
                      {rel.ngo.mission}
                    </p>
                  )}
                </div>

                <div className="flex shrink-0 flex-wrap gap-2">
                  {!rel.isPrimary && rel.status === 'active' && (
                    <button
                      onClick={() =>
                        update(rel, { isPrimary: true }, `${rel.ngo.name} is now your primary partner.`)
                      }
                      disabled={busy === rel.ngo._id}
                      className="btn btn-outline py-2.5 text-[13px]"
                    >
                      {busy === rel.ngo._id ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <Star size={14} />
                      )}
                      Make primary
                    </button>
                  )}
                  {rel.status === 'active' ? (
                    <button
                      onClick={() =>
                        update(rel, { status: 'paused' }, `${rel.ngo.name} paused.`)
                      }
                      disabled={busy === rel.ngo._id}
                      className="btn btn-ghost py-2.5 text-[13px]"
                    >
                      <Pause size={14} />
                      Pause
                    </button>
                  ) : (
                    <button
                      onClick={() =>
                        update(rel, { status: 'active' }, `${rel.ngo.name} resumed.`)
                      }
                      disabled={busy === rel.ngo._id}
                      className="btn btn-outline py-2.5 text-[13px]"
                    >
                      <Play size={14} />
                      Resume
                    </button>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {data.available.length > 0 && (
        <section className="mt-12">
          <h2 className="display-sm">Approved NGOs you can partner with</h2>
          <p className="mt-1.5 text-[13px] text-ink-soft">
            Every organisation here has been checked by DaanSetu.
          </p>

          <ul className="mt-6 grid gap-4 md:grid-cols-2">
            {data.available.map((ngo) => (
              <li key={ngo._id} className="flex gap-4 rounded-[18px] border border-line bg-surface p-5">
                <div className="relative size-12 shrink-0 overflow-hidden rounded-full border border-line bg-paper-deep">
                  {ngo.logoImage && (
                    <Image src={ngo.logoImage} alt={ngo.name} fill sizes="48px" className="object-cover" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-display text-[1.05rem] font-medium tracking-[-0.015em] text-ink">
                    {ngo.name}
                  </h3>
                  <p className="mt-1 flex items-center gap-1.5 text-[12px] text-ink-mute">
                    <MapPin size={11} strokeWidth={1.6} />
                    {ngo.address?.city} · can take {formatNumber(ngo.dailyCapacity)} meals a day
                  </p>
                  {ngo.mission && (
                    <p className="mt-2.5 line-clamp-2 text-[12.5px] leading-relaxed text-ink-soft">
                      {ngo.mission}
                    </p>
                  )}
                  <button
                    onClick={() => addPartner(ngo)}
                    disabled={busy === ngo._id}
                    className="btn btn-outline mt-4 py-2 text-[12.5px]"
                  >
                    {busy === ngo._id ? (
                      <Loader2 size={13} className="animate-spin" />
                    ) : (
                      <Plus size={13} />
                    )}
                    Add as partner
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}
