import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, QrCode, ShieldCheck } from 'lucide-react';
import { DONATE_HREF } from '@/lib/config';
import { formatInr } from '@/lib/utils';

// Kept distinct from every menu-item photo so the hero never mirrors a card.
const HERO_IMAGE =
  'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=1400&q=85';
const HERO_SECONDARY =
  'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=900&q=85';

export function Hero({ foodValuePaise, portions }: { foodValuePaise: number; portions: number }) {
  return (
    <section className="grain relative overflow-hidden pt-28 md:pt-36">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-40 -top-40 size-[38rem] rounded-full bg-emerald-wash blur-3xl md:-right-24"
      />

      <div className="container-lux relative">
        <div className="grid items-center gap-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
          {/* ---------------------------------------------------- copy */}
          <div className="animate-rise">
            <div className="flex items-center gap-3">
              <span className="rule-diamond w-8 shrink-0" />
              <p className="eyebrow">A shared plate, not a donation box</p>
            </div>

            <h1 className="display-xl mt-7 text-balance-lux text-ink">
              You pay half.
              <br />
              <em className="font-normal italic text-emerald">The kitchen pays the rest.</em>
            </h1>

            <p className="prose-lux mt-7 max-w-lg">
              Scan the code on your table, pick a dish at half its menu price, and the restaurant
              matches your half. Then follow the full plate — confirmed, cooked, handed over, and
              counted by the NGO that served it.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link href={DONATE_HREF} className="btn btn-primary group w-full sm:w-auto">
                Donate a dish
                <ArrowRight
                  size={15}
                  className="transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-1"
                />
              </Link>
              <Link href="/track" className="btn btn-outline w-full sm:w-auto">
                Track a donation
              </Link>
            </div>

            <div className="mt-11 flex flex-wrap items-center gap-x-8 gap-y-4 border-t border-line pt-7">
              <div className="flex items-center gap-2.5">
                <ShieldCheck size={16} className="text-emerald" strokeWidth={1.6} />
                <span className="text-[13px] text-ink-soft">Confirmed by the receiving NGO</span>
              </div>
              <div className="flex items-center gap-2.5">
                <QrCode size={16} className="text-emerald" strokeWidth={1.6} />
                <span className="text-[13px] text-ink-soft">No account needed to give</span>
              </div>
            </div>
          </div>

          {/* -------------------------------------------------- visual */}
          <div className="animate-fade relative [animation-delay:250ms]">
            <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[24px] border border-line sm:aspect-[5/6] lg:aspect-[4/5]">
              <Image
                src={HERO_IMAGE}
                alt="A shared vegetarian meal laid out in steel bowls"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 46vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-emerald-deep/50 via-emerald-deep/6 via-50% to-transparent" />
            </div>

            <div className="absolute -bottom-6 -left-2 w-[min(19rem,88%)] rounded-2xl border border-line bg-surface/95 p-4 shadow-[0_28px_70px_-32px_rgba(20,32,26,0.5)] backdrop-blur-sm sm:-left-6 sm:p-5">
              <div className="flex items-center justify-between">
                <p className="eyebrow">Donation DS-7K2P</p>
                <span className="flex items-center gap-1.5 text-[10.5px] font-medium uppercase tracking-[0.09em] text-emerald">
                  <span className="relative flex size-1.5">
                    <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-mid opacity-60" />
                    <span className="relative inline-flex size-1.5 rounded-full bg-emerald" />
                  </span>
                  Live
                </span>
              </div>

              <div className="mt-4 space-y-2.5">
                {[
                  { label: 'Restaurant confirmed', done: true },
                  { label: 'Handed over to NGO', done: true },
                  { label: 'Confirmed by NGO', done: false },
                ].map((step) => (
                  <div key={step.label} className="flex items-center gap-3">
                    <span
                      className={
                        step.done
                          ? 'size-1.5 rounded-full bg-emerald'
                          : 'size-1.5 rounded-full border border-ink-faint'
                      }
                    />
                    <span className={step.done ? 'text-[13px] text-ink' : 'text-[13px] text-ink-faint'}>
                      {step.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="absolute -right-5 -top-8 hidden aspect-square w-32 overflow-hidden rounded-2xl border-4 border-paper lg:block">
              <Image src={HERO_SECONDARY} alt="A restaurant dining room" fill sizes="128px" className="object-cover" />
            </div>
          </div>
        </div>

        <div className="mt-24 border-t border-line pt-7 md:mt-32">
          <p className="text-center text-[13px] text-ink-mute">
            <span className="numeral text-[15px] text-ink">{formatInr(foodValuePaise)}</span> of food
            sent out so far across{' '}
            <span className="numeral text-[15px] text-ink">{portions}</span> portions · every one
            confirmed by the NGO that served it
          </p>
        </div>
      </div>
    </section>
  );
}
