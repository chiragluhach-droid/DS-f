import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Store, HeartHandshake } from 'lucide-react';
import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';

export const metadata: Metadata = {
  title: 'Partner with DaanSetu',
  description:
    'Restaurants and NGOs can apply to join DaanSetu — a second service for kitchens, and confirmed meals for the organisations that distribute them.',
};

const OPTIONS = [
  {
    href: '/join/restaurant',
    icon: Store,
    eyebrow: 'For restaurants',
    title: 'Cook a second service',
    body: 'Put a code on your tables. Guests fund a dish at half its menu price, you commit the other half, and you cook it in batches when enough is funded.',
    points: [
      'No fee, and no commission on the guest’s half',
      'You choose the dishes and how big a batch is',
      'An NGO confirms every batch you send',
    ],
    cta: 'Apply as a restaurant',
  },
  {
    href: '/join/ngo',
    icon: HeartHandshake,
    eyebrow: 'For NGOs',
    title: 'Receive meals you can count',
    body: 'Partner kitchens cook batches for your programme. You count what arrives and confirm it — and if it is short, you say so on the record.',
    points: [
      'See what is funded before it is cooked',
      'Your count is the final word on a donation',
      'Shortfalls are raised with us, not hidden',
    ],
    cta: 'Apply as an NGO',
  },
];

export default function JoinPage() {
  return (
    <>
      <SiteHeader />
      <main className="pt-16 md:pt-[74px]">
        <section className="grain relative overflow-hidden border-b border-line py-14 md:py-20">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-40 -top-32 size-[32rem] rounded-full bg-emerald-wash blur-3xl"
          />
          <div className="container-lux relative">
            <p className="eyebrow">Partner with us</p>
            <h1 className="display-lg mt-5 max-w-2xl text-balance-lux">
              A kitchen that can cook one more meal, and{' '}
              <em className="font-normal italic text-emerald">someone who needs it.</em>
            </h1>
            <p className="prose-lux mt-6 max-w-xl">
              DaanSetu keeps the two ends of that honest with each other. Every plate is funded
              half by a guest and half by the kitchen, and no donation closes until the NGO confirms
              what arrived.
            </p>
          </div>
        </section>

        <section className="container-lux py-14 md:py-20">
          <div className="grid gap-5 lg:grid-cols-2">
            {OPTIONS.map((option) => {
              const Icon = option.icon;
              return (
                <div
                  key={option.href}
                  className="flex flex-col rounded-[22px] border border-line bg-surface p-7 md:p-9"
                >
                  <span className="flex size-11 items-center justify-center rounded-full border border-emerald/20 bg-emerald-wash text-emerald">
                    <Icon size={18} strokeWidth={1.7} />
                  </span>
                  <p className="eyebrow mt-6">{option.eyebrow}</p>
                  <h2 className="display-sm mt-3">{option.title}</h2>
                  <p className="mt-3 text-[14px] leading-relaxed text-ink-soft">{option.body}</p>

                  <ul className="mt-6 space-y-3 border-t border-line-soft pt-6">
                    {option.points.map((point) => (
                      <li key={point} className="flex gap-3 text-[13.5px] leading-relaxed text-ink-soft">
                        <span className="mt-2 size-1 shrink-0 rounded-full bg-emerald" />
                        {point}
                      </li>
                    ))}
                  </ul>

                  <Link href={option.href} className="btn btn-primary group mt-8 w-full">
                    {option.cta}
                    <ArrowRight
                      size={15}
                      className="transition-transform duration-500 group-hover:translate-x-1"
                    />
                  </Link>
                </div>
              );
            })}
          </div>

          <p className="mt-10 text-center text-[13px] text-ink-soft">
            Already applied?{' '}
            <Link href="/login" className="text-emerald underline underline-offset-2">
              Sign in to your workspace
            </Link>
            .
          </p>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
