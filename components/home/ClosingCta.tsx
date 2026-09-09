import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Reveal } from '@/components/Reveal';
import { DONATE_HREF } from '@/lib/config';

export function ClosingCta() {
  return (
    <section className="grain relative overflow-hidden py-28 md:py-36">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 size-[42rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-wash blur-3xl"
      />
      <div className="container-lux relative">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="rule-diamond mx-auto w-24" />
          <h2 className="display-lg mt-8 text-balance-lux">
            Someone is going to eat tonight
            <br className="hidden sm:block" /> because of a plate you chose.
          </h2>
          <p className="prose-lux mx-auto mt-7 max-w-md">
            It takes about forty seconds. You will know exactly where it went.
          </p>
          <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href={DONATE_HREF} className="btn btn-primary group">
              Donate a meal
              <ArrowRight size={15} className="transition-transform duration-500 group-hover:translate-x-1" />
            </Link>
            <Link href="/track" className="btn btn-outline">
              I have a donation ID
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
