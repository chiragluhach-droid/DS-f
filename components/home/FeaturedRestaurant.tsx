import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, MapPin } from 'lucide-react';
import { Reveal } from '@/components/Reveal';
import { formatInr, formatNumber } from '@/lib/utils';
import type { Restaurant } from '@/lib/types';

export function FeaturedRestaurant({ restaurant }: { restaurant: Restaurant }) {
  return (
    <section className="py-24 md:py-32">
      <div className="container-lux">
        <Reveal className="max-w-xl">
          <p className="eyebrow">The kitchen</p>
          <h2 className="display-lg mt-5 text-balance-lux">
            One griddle in Faridabad, cooking <em className="font-normal italic">twice.</em>
          </h2>
        </Reveal>

        <Reveal delay={120} className="mt-14">
          <article className="group overflow-hidden rounded-[24px] border border-line bg-surface">
            <div className="grid lg:grid-cols-[1.1fr_1fr]">
              <div className="relative aspect-[16/11] lg:aspect-auto lg:min-h-[27rem]">
                <Image
                  src={
                    restaurant.coverImage ??
                    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1400&q=85'
                  }
                  alt={restaurant.name}
                  fill
                  sizes="(max-width: 1024px) 100vw, 55vw"
                  className="object-cover transition-transform duration-[1.2s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.03]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-emerald-deep/28 to-transparent lg:bg-gradient-to-r" />
              </div>

              <div className="flex flex-col justify-center p-8 md:p-11">
                <div className="flex flex-wrap items-center gap-2">
                  {restaurant.cuisine.slice(0, 3).map((c) => (
                    <span
                      key={c}
                      className="rounded-full border border-line bg-paper px-2.5 py-1 text-[10.5px] uppercase tracking-[0.09em] text-ink-mute"
                    >
                      {c}
                    </span>
                  ))}
                </div>

                <h3 className="display-md mt-5">{restaurant.name}</h3>

                <p className="mt-1.5 flex items-center gap-1.5 text-[13px] text-ink-mute">
                  <MapPin size={13} strokeWidth={1.6} />
                  {restaurant.address.line2 ? `${restaurant.address.line2}, ` : ''}
                  {restaurant.address.city}
                </p>

                {restaurant.tagline && (
                  <p className="mt-5 font-display text-[1.15rem] italic leading-snug text-ink-soft">
                    &ldquo;{restaurant.tagline}&rdquo;
                  </p>
                )}

                {/* the split, as it actually stands */}
                <dl className="mt-8 space-y-3 border-y border-line py-6">
                  <div className="flex items-baseline justify-between">
                    <dt className="text-[13px] text-ink-soft">Guests contributed</dt>
                    <dd className="numeral text-[1.15rem] text-ink">
                      {formatInr(restaurant.stats.customerContributionPaise)}
                    </dd>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <dt className="text-[13px] text-ink-soft">{restaurant.name} matched</dt>
                    <dd className="numeral text-[1.15rem] text-ink">
                      + {formatInr(restaurant.stats.restaurantContributionPaise)}
                    </dd>
                  </div>
                  <div className="flex items-baseline justify-between border-t border-line-soft pt-3">
                    <dt className="text-[13px] font-medium text-ink">
                      Food sent out
                      <span className="ml-2 text-[12px] font-normal text-ink-mute">
                        {formatNumber(restaurant.stats.totalPortions)} portions
                      </span>
                    </dt>
                    <dd className="numeral text-[1.6rem] leading-none text-emerald">
                      {formatInr(restaurant.stats.totalFoodValuePaise)}
                    </dd>
                  </div>
                </dl>

                <Link
                  href={`/restaurant/${restaurant.slug}`}
                  className="btn btn-primary mt-8 w-full sm:w-fit"
                >
                  Open their donation menu
                  <ArrowRight size={15} />
                </Link>
              </div>
            </div>
          </article>
        </Reveal>
      </div>
    </section>
  );
}
