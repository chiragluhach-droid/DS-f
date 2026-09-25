'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, ExternalLink, MapPin, ShieldCheck, Quote } from 'lucide-react';
import { Logo } from '@/components/Logo';
import { SiteFooter } from '@/components/SiteFooter';
import { Reveal } from '@/components/Reveal';
import { CountUp } from '@/components/CountUp';
import { SignatureDishCard, CompactDishCard } from './DishCard';
import { saveCart, cartTotals, type CartLine } from '@/lib/cart';
import { formatInr, formatNumber, displayDomain, cn } from '@/lib/utils';
import type { MenuItem, Restaurant, Ngo } from '@/lib/types';

interface RecentDonation {
  donationId: string;
  totalPortions: number;
  totalFoodValuePaise: number;
  createdAt: string;
  donorSnapshot: { name: string; isAnonymous: boolean; message?: string };
}

interface Props {
  restaurant: Restaurant;
  items: MenuItem[];
  partners: Ngo[];
  activeBatches: {
    batchId: string;
    menuItem: string;
    targetQuantity: number;
    collectedQuantity: number;
  }[];
  recentDonations: RecentDonation[];
}

export function RestaurantView({ restaurant, items, partners, activeBatches, recentDonations }: Props) {
  const router = useRouter();
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [category, setCategory] = useState('All');

  const categories = useMemo(
    () => ['All', ...Array.from(new Set(items.map((i) => i.category)))],
    [items]
  );

  const visible = category === 'All' ? items : items.filter((i) => i.category === category);
  const signature = visible.filter((i) => i.isSignature);
  const rest = visible.filter((i) => !i.isSignature);

  const lines: CartLine[] = useMemo(
    () =>
      items
        .filter((i) => (quantities[i._id] ?? 0) > 0)
        .map((item) => ({ item, quantity: quantities[item._id] })),
    [items, quantities]
  );

  const totals = cartTotals(lines);
  const setQty = (id: string, n: number) =>
    setQuantities((prev) => ({ ...prev, [id]: Math.max(0, n) }));

  const proceed = () => {
    saveCart(restaurant, lines);
    router.push(`/restaurant/${restaurant.slug}/checkout`);
  };

  const ngo = partners[0];

  // A short donor list would leave a visible gap mid-loop, so repeat it until
  // the strip is comfortably wider than any viewport before duplicating.
  const marqueeCards = useMemo(() => {
    const base = recentDonations.slice(0, 6);
    if (base.length === 0) return [];
    const copies = Math.ceil(8 / base.length);
    return Array.from({ length: copies }, () => base).flat();
  }, [recentDonations]);

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-40 border-b border-line/60 bg-paper/80 backdrop-blur-xl">
        <div className="container-lux flex h-14 items-center justify-between md:h-16">
          <Logo />
          <Link
            href="/track"
            className="text-[13.5px] tracking-[-0.022em] text-ink-soft transition-colors hover:text-emerald"
          >
            Track Donation
          </Link>
        </div>
      </header>

      <main className={cn(lines.length > 0 && 'pb-36')}>
        {/* ------------------------------------------------------- cover */}
        <section className="relative h-[62vw] max-h-[26rem] min-h-[15rem] w-full overflow-hidden">
          <Image
            src={
              restaurant.coverImage ??
              'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1800&q=85'
            }
            alt={restaurant.name}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          {/* Scrim weighted to the bottom, where the name and address sit —
              the top of the photo stays readable. */}
          <div className="absolute inset-0 bg-gradient-to-t from-emerald-deep/88 via-emerald-deep/28 via-42% to-transparent" />

          <div className="container-lux absolute inset-x-0 bottom-0 pb-6 md:pb-9">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-paper/25 bg-paper/12 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.12em] text-paper backdrop-blur-sm">
                DaanSetu partner
              </span>
              {restaurant.isAcceptingDonations && (
                <span className="flex items-center gap-1.5 rounded-full border border-paper/25 bg-paper/12 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.12em] text-paper backdrop-blur-sm">
                  <span className="live-dot" />
                  Accepting donations
                </span>
              )}
            </div>

            <h1 className="display-lg mt-4 text-paper">{restaurant.name}</h1>
            <p className="mt-2 flex items-center gap-1.5 text-[13px] text-paper/70">
              <MapPin size={13} strokeWidth={1.6} />
              {restaurant.address.line1}
              {restaurant.address.line2 ? `, ${restaurant.address.line2}` : ''} ·{' '}
              {restaurant.address.city}
            </p>
          </div>
        </section>

        {/* ------------------------------------------- where the food goes */}
        <section className="container-lux py-10 md:py-12">
          <div className="grid gap-8 lg:grid-cols-[1fr_26rem] lg:gap-14">
            <div>
              <p className="eyebrow">Where the food goes</p>
              <h2 className="display-md mt-3 max-w-md text-balance-lux">
                Cooked here. Served <em className="font-normal italic text-emerald">there.</em>
              </h2>
            </div>

            <aside className="card-lux h-fit p-6">
              {ngo ? (
                <>
                  <div className="flex items-center gap-4">
                    {ngo.logoImage && (
                      <div className="relative size-14 shrink-0 overflow-hidden rounded-full border border-line">
                        <Image src={ngo.logoImage} alt="" fill sizes="56px" className="object-cover" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <h3 className="font-display text-[1.15rem] font-medium leading-snug tracking-[-0.015em]">
                        {ngo.name}
                      </h3>
                      <p className="mt-0.5 flex items-center gap-1 text-[12px] text-ink-mute">
                        <MapPin size={11} strokeWidth={1.6} />
                        {ngo.address.line1}, {ngo.address.city}
                      </p>
                    </div>
                  </div>

                  {ngo.mission && (
                    <p className="mt-4 line-clamp-3 text-[13px] leading-relaxed text-ink-soft">
                      {ngo.mission}
                    </p>
                  )}

                  {ngo.beneficiaryFocus.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {ngo.beneficiaryFocus.slice(0, 2).map((focus) => (
                        <span
                          key={focus}
                          className="rounded-full bg-emerald-wash px-2.5 py-1 text-[11px] text-emerald"
                        >
                          {focus}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="mt-5 grid grid-cols-2 gap-4 border-t border-line pt-5">
                    <div>
                      <p className="text-[10.5px] uppercase tracking-[0.12em] text-ink-mute">
                        Total donations
                      </p>
                      <CountUp
                        value={restaurant.stats.totalFoodValuePaise}
                        format={(n) => formatInr(n)}
                        className="numeral mt-1.5 block text-[1.65rem] leading-none text-ink tabular-nums"
                      />
                    </div>
                    <div>
                      <p className="text-[10.5px] uppercase tracking-[0.12em] text-ink-mute">
                        Total portions
                      </p>
                      <CountUp
                        value={restaurant.stats.totalPortions}
                        className="numeral mt-1.5 block text-[1.65rem] leading-none text-emerald tabular-nums"
                      />
                    </div>
                  </div>

                  <p className="mt-5 flex items-start gap-2.5 text-[12px] leading-relaxed text-ink-mute">
                    <ShieldCheck
                      size={20}
                      className="mt-px shrink-0 text-emerald"
                      strokeWidth={1.5}
                    />
                    Meals are dispatched in batches when fully funded, and verified by {ngo.name}.
                  </p>

                  {ngo.website && (
                    <a
                      href={ngo.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 inline-flex items-center gap-1 text-[11px] text-ink-mute underline decoration-line underline-offset-2 transition-colors hover:text-emerald hover:decoration-emerald/40"
                    >
                      {displayDomain(ngo.website)}
                      <ExternalLink size={10} strokeWidth={1.8} />
                    </a>
                  )}
                </>
              ) : (
                <p className="text-[13px] text-ink-soft">
                  This kitchen is being matched with a verified NGO partner.
                </p>
              )}
            </aside>
          </div>
        </section>

        {/* --------------------------------------------------------- menu */}
        <section id="menu" className="bg-paper-deep py-12 md:py-16">
          <div className="container-lux">
            <div className="max-w-xl">
              <p className="eyebrow">The donation menu</p>
              <h2 className="display-md mt-4">Pick a dish to send out</h2>
              <p className="mt-3 text-[14.5px] leading-relaxed text-ink-soft">
                Dispatched to {ngo?.name ?? 'our NGO partner'} once the current batch reaches its target.
              </p>
            </div>

            {activeBatches.length > 0 && (
              <div className="mt-8 flex flex-col gap-3.5 max-w-xl">
                <p className="text-[11.5px] font-medium uppercase tracking-[0.1em] text-ink-mute">
                  Active Batches Funding Now
                </p>
                {activeBatches.map(b => {
                  const item = items.find(i => i._id === b.menuItem);
                  if (!item) return null;
                  const progress = Math.min(100, Math.round((b.collectedQuantity / b.targetQuantity) * 100));
                  return (
                    <div
                      key={b.batchId}
                      className="group relative flex flex-col gap-3 overflow-hidden rounded-[18px] border border-line/60 bg-gradient-to-b from-surface to-paper p-5 transition-all duration-300 hover:border-emerald/30 hover:shadow-[0_4px_20px_-4px_rgba(16,185,129,0.1)]"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3.5">
                          <div className="relative size-12 shrink-0 overflow-hidden rounded-xl border border-line/40 bg-paper-deep">
                            {item.image && (
                              <Image src={item.image} alt={item.name} fill sizes="48px" className="object-cover" />
                            )}
                          </div>
                          <div>
                            <h4 className="font-display text-[15px] font-medium leading-none text-ink group-hover:text-emerald transition-colors">
                              {item.name}
                            </h4>
                            <p className="mt-1.5 flex items-center gap-1.5 text-[11.5px] text-ink-mute">
                              Batch <span className="font-mono text-[11px] font-medium tracking-wide text-ink-soft bg-line-soft px-1.5 py-0.5 rounded">{b.batchId}</span>
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="numeral text-[18px] font-semibold leading-none text-emerald">
                            {progress}%
                          </p>
                          <p className="mt-1 text-[10px] font-medium uppercase tracking-[0.12em] text-ink-faint">
                            Funded
                          </p>
                        </div>
                      </div>

                      <div className="relative mt-2">
                        <div className="h-2 w-full overflow-hidden rounded-full bg-line/50">
                          <div
                            className="h-full rounded-full bg-emerald transition-all duration-1000 ease-out"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[12px] font-medium text-ink-mute">
                        <span className="flex items-center gap-2">
                          <span className="relative flex size-2 items-center justify-center">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald opacity-20"></span>
                            <span className="relative inline-flex size-1.5 rounded-full bg-emerald"></span>
                          </span>
                          <span className="text-ink">{b.collectedQuantity}</span> funded
                        </span>
                        <span><span className="text-ink">{b.targetQuantity}</span> target</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {categories.length > 2 && (
              <div className="no-scrollbar -mx-5 mt-8 flex gap-2 overflow-x-auto px-5 md:mx-0 md:px-0">
                {categories.map((c) => (
                  <button
                    key={c}
                    onClick={() => setCategory(c)}
                    className={cn(
                      'shrink-0 rounded-full border px-4 py-2 text-[13px] transition-all duration-300',
                      category === c
                        ? 'border-emerald bg-emerald text-paper'
                        : 'border-line bg-surface text-ink-soft hover:border-emerald/40 hover:text-emerald'
                    )}
                  >
                    {c}
                  </button>
                ))}
              </div>
            )}

            {signature.length > 0 && (
              <div className="mt-9 grid gap-5 md:grid-cols-2 md:gap-6">
                {signature.map((item, i) => (
                  <Reveal key={item._id} delay={i * 70}>
                    <SignatureDishCard
                      item={item}
                      quantity={quantities[item._id] ?? 0}
                      onChange={(n) => setQty(item._id, n)}
                      restaurantName={restaurant.name}
                      activeBatch={activeBatches.find(b => b.menuItem === item._id)}
                    />
                  </Reveal>
                ))}
              </div>
            )}

            {rest.length > 0 && (
              <div className="mt-5 grid gap-4 md:mt-6 md:grid-cols-2 md:gap-5">
                {rest.map((item, i) => (
                  <Reveal key={item._id} delay={i * 45}>
                    <CompactDishCard
                      item={item}
                      quantity={quantities[item._id] ?? 0}
                      onChange={(n) => setQty(item._id, n)}
                      restaurantName={restaurant.name}
                      activeBatch={activeBatches.find(b => b.menuItem === item._id)}
                    />
                  </Reveal>
                ))}
              </div>
            )}

            {visible.length === 0 && (
              <p className="mt-12 text-center text-[14px] text-ink-mute">
                Nothing on the menu in this category right now.
              </p>
            )}
          </div>
        </section>

        {/* --------------------------------------------------- donor wall */}
        {recentDonations.length > 0 && (
          <section className="py-16 md:py-24">
            <div className="container-lux">
              <Reveal className="max-w-lg">
                <p className="eyebrow">Recently, at this counter</p>
                <h2 className="display-md mt-4">
                  People who ate here, and paid it{' '}
                  <em className="font-normal italic text-emerald">forward.</em>
                </h2>
              </Reveal>
            </div>

            {/* full-bleed so the cards run off both edges of the page */}
            <div
              className="marquee mt-10"
              style={{ ['--marquee-duration' as string]: `${marqueeCards.length * 7}s` }}
            >
              <div className="marquee-track gap-4 px-4">
                {[...marqueeCards, ...marqueeCards].map((d, i) => (
                  <figure
                    key={`${d.donationId}-${i}`}
                    aria-hidden={i >= marqueeCards.length}
                    className="card-lux flex w-[19rem] shrink-0 flex-col p-5 sm:w-[21rem]"
                  >
                    <Quote size={16} className="text-line" strokeWidth={1.6} />
                    <blockquote className="mt-3 flex-1 font-display text-[1.02rem] italic leading-relaxed text-ink">
                      {d.donorSnapshot.message ||
                        `Sent out ${d.totalPortions} ${d.totalPortions === 1 ? 'portion' : 'portions'} from this kitchen.`}
                    </blockquote>
                    <figcaption className="mt-5 flex items-center justify-between border-t border-line-soft pt-4 text-[12px]">
                      <span className="text-ink-soft">{d.donorSnapshot.name}</span>
                      <span className="numeral text-emerald">
                        {formatInr(d.totalFoodValuePaise)} of food
                      </span>
                    </figcaption>
                  </figure>
                ))}
              </div>
            </div>
          </section>
        )}

      </main>

      {/* ---------------------------------------------------- sticky cart */}
      <div
        className={cn(
          'fixed inset-x-0 bottom-0 z-50 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]',
          lines.length > 0
            ? 'translate-y-0 opacity-100'
            : 'pointer-events-none translate-y-full opacity-0'
        )}
      >
        <div className="border-t border-line bg-paper/94 backdrop-blur-xl">
          <div className="container-lux py-3.5 pb-safe">
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="text-[11px] uppercase tracking-[0.11em] text-ink-mute">
                  {totals.portions} {totals.portions === 1 ? 'portion' : 'portions'}
                </p>
                <p className="numeral mt-1 text-[1.45rem] leading-none text-ink">
                  {formatInr(totals.customerPaise)}
                  <span className="ml-2 font-sans text-[11.5px] tracking-normal text-ink-mute">
                    you pay
                  </span>
                </p>
                <p className="mt-1.5 text-[11.5px] text-ink-mute">
                  {restaurant.name} adds{' '}
                  <span className="numeral text-ink">{formatInr(totals.restaurantPaise)}</span>
                </p>
              </div>
              <button onClick={proceed} className="btn btn-primary group shrink-0 px-7">
                Continue
                <ArrowRight
                  size={15}
                  className="transition-transform duration-500 group-hover:translate-x-1"
                />
              </button>
            </div>
          </div>
        </div>
      </div>

      <SiteFooter />
    </>
  );
}
