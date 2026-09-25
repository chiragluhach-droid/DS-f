'use client';

import Image from 'next/image';
import { Stepper } from './Stepper';
import { PriceSplit } from './PriceSplit';
import type { MenuItem } from '@/lib/types';

const FALLBACK =
  'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=900&q=80';

function VegMark() {
  return (
    <span
      title="Vegetarian"
      className="inline-flex size-3.5 shrink-0 items-center justify-center rounded-[3px] border border-emerald-mid"
    >
      <span className="size-1.5 rounded-full bg-emerald-mid" />
    </span>
  );
}

interface Props {
  item: MenuItem;
  quantity: number;
  onChange: (n: number) => void;
  restaurantName: string;
  activeBatch?: { collectedQuantity: number; targetQuantity: number };
}

/** Large editorial card for the kitchen's signature dishes. */
export function SignatureDishCard({ item, quantity, onChange, restaurantName, activeBatch }: Props) {
  return (
    <article className="group overflow-hidden rounded-[20px] border border-line bg-surface transition-colors duration-500 hover:border-emerald/25">
      <div className="relative aspect-[16/10] overflow-hidden">
        <Image
          src={item.image || FALLBACK}
          alt={item.name}
          fill
          sizes="(max-width: 768px) 100vw, 46vw"
          className="object-cover transition-transform duration-[1.2s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-emerald-deep/40 via-transparent to-transparent" />
        <span className="absolute left-4 top-4 rounded-full bg-paper/92 px-3 py-1 text-[10.5px] font-medium uppercase tracking-[0.1em] text-emerald backdrop-blur">
          {100 - item.customerSharePercent}% matched
        </span>
      </div>

      <div className="p-5 md:p-6">
        <div className="flex items-start gap-2.5">
          {item.isVeg && (
            <span className="mt-1.5">
              <VegMark />
            </span>
          )}
          <h3 className="display-sm flex-1">{item.name}</h3>
        </div>

        {item.description && (
          <p className="mt-2.5 text-[13.5px] leading-relaxed text-ink-soft">{item.description}</p>
        )}

        {item.servingSize && (
          <p className="mt-3 text-[12px] text-ink-mute">{item.servingSize}</p>
        )}

        {activeBatch && (
          <div className="mt-4 space-y-1.5">
            <div className="flex justify-between text-[11px] font-medium tracking-wide uppercase text-ink-mute">
              <span>Current Batch</span>
              <span>{activeBatch.collectedQuantity} / {activeBatch.targetQuantity} funded</span>
            </div>
            <div className="h-1 w-full overflow-hidden rounded-full bg-line/60">
              <div
                className="h-full rounded-full bg-emerald transition-all duration-1000"
                style={{ width: `${Math.min(100, Math.round((activeBatch.collectedQuantity / activeBatch.targetQuantity) * 100))}%` }}
              />
            </div>
          </div>
        )}

        <div className="mt-6 flex items-end justify-between gap-4 border-t border-line-soft pt-5">
          <PriceSplit
            mrpPaise={item.mrpPaise}
            customerSharePercent={item.customerSharePercent}
            restaurantName={restaurantName}
          />
          <Stepper value={quantity} onChange={onChange} label={item.name} />
        </div>
      </div>
    </article>
  );
}

/** Compact row for the rest of the menu. */
export function CompactDishCard({ item, quantity, onChange, restaurantName, activeBatch }: Props) {
  return (
    <article className="group flex gap-4 rounded-[18px] border border-line bg-surface p-3.5 transition-colors duration-500 hover:border-emerald/25 sm:gap-5 sm:p-4">
      <div className="relative size-[92px] shrink-0 overflow-hidden rounded-[13px] sm:size-[110px]">
        <Image
          src={item.image || FALLBACK}
          alt={item.name}
          fill
          sizes="110px"
          className="object-cover transition-transform duration-[1.2s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
        />
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start gap-2">
          {item.isVeg && (
            <span className="mt-1">
              <VegMark />
            </span>
          )}
          <h3 className="font-display text-[1.05rem] font-medium leading-snug tracking-[-0.015em] text-ink">
            {item.name}
          </h3>
        </div>

        {item.description && (
          <p className="mt-1 line-clamp-2 text-[12.5px] leading-relaxed text-ink-soft">
            {item.description}
          </p>
        )}

        {activeBatch && (
          <div className="mt-2 space-y-1.5">
            <div className="flex justify-between text-[10px] font-medium tracking-wide uppercase text-ink-mute">
              <span>Batch Progress</span>
              <span>{activeBatch.collectedQuantity} / {activeBatch.targetQuantity}</span>
            </div>
            <div className="h-1 w-3/4 max-w-[12rem] overflow-hidden rounded-full bg-line/60">
              <div
                className="h-full rounded-full bg-emerald transition-all duration-1000"
                style={{ width: `${Math.min(100, Math.round((activeBatch.collectedQuantity / activeBatch.targetQuantity) * 100))}%` }}
              />
            </div>
          </div>
        )}

        <div className="mt-auto flex items-end justify-between gap-3 pt-3">
          <PriceSplit
            mrpPaise={item.mrpPaise}
            customerSharePercent={item.customerSharePercent}
            restaurantName={restaurantName}
            size="sm"
          />
          <Stepper value={quantity} onChange={onChange} size="sm" label={item.name} />
        </div>
      </div>
    </article>
  );
}
