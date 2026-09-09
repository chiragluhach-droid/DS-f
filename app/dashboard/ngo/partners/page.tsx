'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Loader2, Building2, ExternalLink, MapPin } from 'lucide-react';
import { get } from '@/lib/api';
import { PageHeading, EmptyState } from '@/components/dashboard/DashboardShell';
import { formatInr } from '@/lib/utils';
import type { Restaurant } from '@/lib/types';

interface Relationship {
  _id: string;
  status: 'pending' | 'active' | 'paused' | 'ended';
  isPrimary: boolean;
  note?: string;
  restaurant: Restaurant;
}

const STATUS_TONE: Record<string, string> = {
  active: 'border-emerald/25 bg-emerald-wash text-emerald',
  pending: 'border-amber/25 bg-amber-tint text-amber',
  paused: 'border-line bg-paper text-ink-mute',
  ended: 'border-line bg-paper text-ink-mute',
};

export default function NgoPartnersPage() {
  const [relationships, setRelationships] = useState<Relationship[] | null>(null);

  useEffect(() => {
    void get<{ relationships: Relationship[] }>('/ngos/me/partners')
      .then((d) => setRelationships(d.relationships))
      .catch(() => setRelationships([]));
  }, []);

  if (relationships === null) {
    return (
      <div className="flex min-h-[50dvh] items-center justify-center">
        <Loader2 className="size-5 animate-spin text-ink-mute" />
      </div>
    );
  }

  return (
    <>
      <PageHeading
        eyebrow="Partner kitchens"
        title="Who cooks for you"
        description="Restaurants routing their second service to your kitchens. New partnerships are set up by the DaanSetu team."
      />

      {relationships.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No partner kitchens yet"
          body="Once a restaurant is matched with your organisation it will appear here, along with everything it sends you."
        />
      ) : (
        <ul className="grid gap-4 md:grid-cols-2">
          {relationships.map((rel) => {
            const r = rel.restaurant;
            return (
              <li
                key={rel._id}
                className="overflow-hidden rounded-[18px] border border-line bg-surface"
              >
                <div className="relative aspect-[16/7]">
                  <Image
                    src={
                      r.coverImage ??
                      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80'
                    }
                    alt={r.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-emerald-deep/75 via-emerald-deep/15 via-55% to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4">
                    <h2 className="font-display text-[1.25rem] font-medium tracking-[-0.02em] text-paper">
                      {r.name}
                    </h2>
                    <span
                      className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] uppercase tracking-[0.1em] ${STATUS_TONE[rel.status]}`}
                    >
                      {rel.isPrimary ? 'Primary' : rel.status}
                    </span>
                  </div>
                </div>

                <div className="p-5">
                  <p className="flex items-center gap-1.5 text-[12.5px] text-ink-mute">
                    <MapPin size={12} strokeWidth={1.6} />
                    {r.address?.city}
                  </p>

                  {rel.note && (
                    <p className="mt-3 border-l-2 border-line pl-3.5 text-[13px] leading-relaxed text-ink-soft">
                      {rel.note}
                    </p>
                  )}

                  <div className="mt-5 flex items-end justify-between border-t border-line-soft pt-4">
                    <div>
                      <p className="numeral text-[1.35rem] leading-none text-emerald">
                        {formatInr(r.stats?.totalFoodValuePaise ?? 0)}
                      </p>
                      <p className="mt-1 text-[10.5px] uppercase tracking-[0.11em] text-ink-mute">
                        Food sent from here
                      </p>
                    </div>
                    <Link
                      href={`/restaurant/${r.slug}`}
                      target="_blank"
                      className="flex items-center gap-1.5 text-[12.5px] text-ink-soft transition-colors hover:text-emerald"
                    >
                      Their page
                      <ExternalLink size={12} />
                    </Link>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
