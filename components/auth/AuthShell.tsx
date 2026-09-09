import Image from 'next/image';
import Link from 'next/link';
import { Logo } from '@/components/Logo';

const ASIDE_IMAGE =
  'https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=1200&q=85';

export function AuthShell({
  children,
  eyebrow,
  title,
  subtitle,
}: {
  children: React.ReactNode;
  eyebrow: string;
  title: React.ReactNode;
  subtitle: string;
}) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-[1fr_1.05fr]">
      {/* form side */}
      <div className="grain relative flex flex-col overflow-hidden px-6 py-8 sm:px-10 lg:px-16">
        <Logo />

        <div className="relative flex flex-1 items-center py-12">
          <div className="w-full max-w-sm">
            <p className="eyebrow">{eyebrow}</p>
            <h1 className="display-md mt-4 text-balance-lux">{title}</h1>
            <p className="mt-3.5 text-[14px] leading-relaxed text-ink-soft">{subtitle}</p>
            <div className="mt-9">{children}</div>
          </div>
        </div>

        <p className="text-[12px] text-ink-mute">
          <Link href="/" className="transition-colors hover:text-emerald">
            ← Back to daansetu.in
          </Link>
        </p>
      </div>

      {/* visual side */}
      <div className="relative hidden lg:block">
        <Image
          src={ASIDE_IMAGE}
          alt=""
          fill
          sizes="52vw"
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-emerald-deep via-emerald-deep/55 to-emerald-deep/25" />
        <div className="absolute inset-x-0 bottom-0 p-14">
          <span className="rule-diamond w-16 text-paper/25" />
          <p className="mt-7 max-w-md font-display text-[1.7rem] italic leading-snug text-paper">
            &ldquo;A donation nobody can quietly lose.&rdquo;
          </p>
          <p className="mt-4 text-[13px] text-paper/50">
            Six checkpoints. Each one signed by the role that owns it.
          </p>
        </div>
      </div>
    </div>
  );
}
