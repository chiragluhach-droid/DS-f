import { cn } from '@/lib/utils';

export interface Point {
  label: string;
  value: number;
}

/** A restrained inline bar chart. No library — it must match the paper aesthetic. */
export function BarChart({
  data,
  height = 132,
  format = (n: number) => String(n),
  className,
}: {
  data: Point[];
  height?: number;
  format?: (n: number) => string;
  className?: string;
}) {
  if (data.length === 0) {
    return (
      <div
        className={cn('flex items-center justify-center text-[13px] text-ink-mute', className)}
        style={{ height }}
      >
        Nothing recorded in this window yet.
      </div>
    );
  }

  const max = Math.max(...data.map((d) => d.value), 1);

  return (
    <div className={className}>
      <div className="flex items-end gap-[3px]" style={{ height }}>
        {data.map((d, i) => (
          <div key={`${d.label}-${i}`} className="group relative flex flex-1 flex-col justify-end">
            <div
              className="w-full rounded-t-[3px] bg-emerald/18 transition-colors duration-300 group-hover:bg-emerald"
              style={{ height: `${Math.max((d.value / max) * 100, d.value > 0 ? 4 : 1.5)}%` }}
            />
            <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded-lg border border-line bg-surface px-2.5 py-1.5 text-[11px] shadow-sm group-hover:block">
              <span className="numeral text-ink">{format(d.value)}</span>
              <span className="ml-1.5 text-ink-mute">{d.label}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-3 flex justify-between text-[10.5px] text-ink-mute">
        <span>{data[0]?.label}</span>
        <span>{data[data.length - 1]?.label}</span>
      </div>
    </div>
  );
}
