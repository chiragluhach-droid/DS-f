import Link from 'next/link';
import { Logo } from '@/components/Logo';
import { DONATE_HREF } from '@/lib/config';

export default function NotFound() {
  return (
    <div className="grain relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-6 text-center">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 size-[34rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-wash blur-3xl"
      />
      <div className="relative">
        <Logo />
        <p className="numeral mt-12 text-[5rem] leading-none text-line">404</p>
        <h1 className="display-md mt-4">This page isn&rsquo;t on the menu.</h1>
        <p className="prose-lux mx-auto mt-4 max-w-sm">
          The link may be old, or the kitchen may have paused its donation page.
        </p>
        <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href={DONATE_HREF} className="btn btn-primary">
            See the menu
          </Link>
          <Link href="/track" className="btn btn-outline">
            Track a donation
          </Link>
        </div>
      </div>
    </div>
  );
}
