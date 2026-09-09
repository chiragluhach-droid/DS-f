import Image from 'next/image';
import { Reveal } from '@/components/Reveal';
import { formatNumber } from '@/lib/utils';
import type { Ngo } from '@/lib/types';

export function PartnerNgo({ ngo }: { ngo: Ngo }) {
  return (
    <section className="bg-paper-deep py-24 md:py-32">
      <div className="container-lux">
        <div className="grid items-center gap-14 lg:grid-cols-2 lg:gap-20">
          <Reveal className="order-2 lg:order-1">
            <p className="eyebrow">On the other side</p>
            <h2 className="display-lg mt-5 text-balance-lux">{ngo.name}</h2>
            <p className="prose-lux mt-6 max-w-lg">{ngo.mission}</p>

            <div className="mt-9 flex flex-wrap gap-2">
              {ngo.beneficiaryFocus.map((focus) => (
                <span
                  key={focus}
                  className="rounded-full border border-line bg-paper px-3 py-1.5 text-[12px] text-ink-soft"
                >
                  {focus}
                </span>
              ))}
            </div>

            <dl className="mt-10 grid grid-cols-2 gap-8 border-t border-line pt-8 sm:grid-cols-3">
              {[
                ['Portions received', formatNumber(ngo.stats.portionsReceived)],
                ['Donations confirmed', formatNumber(ngo.stats.donationsConfirmed)],
                ['Daily capacity', formatNumber(ngo.dailyCapacity)],
              ].map(([label, value]) => (
                <div key={label}>
                  <dt className="text-[10.5px] uppercase tracking-[0.12em] text-ink-mute">{label}</dt>
                  <dd className="numeral mt-2 text-[2rem] leading-none text-emerald">{value}</dd>
                </div>
              ))}
            </dl>
          </Reveal>

          <Reveal delay={120} className="order-1 lg:order-2">
            <div className="relative aspect-[4/3] overflow-hidden rounded-[24px] border border-line">
              <Image
                src={
                  ngo.coverImage ??
                  'https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=1400&q=85'
                }
                alt={ngo.name}
                fill
                sizes="(max-width: 1024px) 100vw, 48vw"
                className="object-cover"
              />
            </div>
            <p className="mt-4 text-[12px] text-ink-mute">
              Registered {ngo.registrationNumber} · {ngo.address.city}, {ngo.address.state}
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
