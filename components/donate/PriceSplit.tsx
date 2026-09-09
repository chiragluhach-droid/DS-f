import { formatInr, cn } from '@/lib/utils';
import { splitPrice } from '@/lib/types';

/**
 * The 50–50 story in one block: struck-through menu price, what the guest
 * actually pays, and the kitchen's matching half underneath.
 */
export function PriceSplit({
  mrpPaise,
  customerSharePercent,
  restaurantName,
  size = 'md',
}: {
  mrpPaise: number;
  customerSharePercent: number;
  restaurantName: string;
  size?: 'sm' | 'md';
}) {
  const { customerPaysPaise, restaurantPaysPaise } = splitPrice(mrpPaise, customerSharePercent);

  return (
    <div>
      <div className="flex items-baseline gap-2">
        <span
          className={cn(
            'numeral leading-none text-ink-faint line-through',
            size === 'sm' ? 'text-[13px]' : 'text-[15px]'
          )}
        >
          {formatInr(mrpPaise)}
        </span>
        <span
          className={cn(
            'numeral leading-none text-emerald',
            size === 'sm' ? 'text-[1.25rem]' : 'text-[1.6rem]'
          )}
        >
          {formatInr(customerPaysPaise)}
        </span>
      </div>
      <p
        className={cn(
          'mt-1.5 leading-tight text-ink-mute',
          size === 'sm' ? 'text-[11px]' : 'text-[11.5px]'
        )}
      >
        you pay · {restaurantName} adds {formatInr(restaurantPaysPaise)}
      </p>
    </div>
  );
}
