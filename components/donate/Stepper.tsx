'use client';

import { Minus, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Stepper({
  value,
  onChange,
  size = 'md',
  label,
}: {
  value: number;
  onChange: (next: number) => void;
  size?: 'sm' | 'md';
  label: string;
}) {
  const pad = size === 'sm' ? 'h-9' : 'h-11';
  const btn = size === 'sm' ? 'size-9' : 'size-11';

  if (value === 0) {
    return (
      <button
        onClick={() => onChange(1)}
        aria-label={`Add ${label}`}
        className={cn(
          'btn btn-outline shrink-0 border-emerald/30 px-5 text-emerald hover:bg-emerald hover:text-paper',
          pad
        )}
      >
        <Plus size={15} strokeWidth={2} />
        Add
      </button>
    );
  }

  return (
    <div
      className={cn(
        'flex shrink-0 items-center overflow-hidden rounded-full border border-emerald/30 bg-emerald-wash',
        pad
      )}
    >
      <button
        onClick={() => onChange(value - 1)}
        aria-label={`Remove one ${label}`}
        className={cn(
          'flex items-center justify-center text-emerald transition-colors hover:bg-emerald hover:text-paper',
          btn
        )}
      >
        <Minus size={14} strokeWidth={2.2} />
      </button>
      <span
        aria-live="polite"
        className="numeral min-w-8 text-center text-[15px] font-medium text-emerald"
      >
        {value}
      </span>
      <button
        onClick={() => onChange(value + 1)}
        aria-label={`Add one more ${label}`}
        className={cn(
          'flex items-center justify-center text-emerald transition-colors hover:bg-emerald hover:text-paper',
          btn
        )}
      >
        <Plus size={14} strokeWidth={2.2} />
      </button>
    </div>
  );
}
