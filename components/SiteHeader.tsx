'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, ArrowUpRight } from 'lucide-react';
import { Logo } from './Logo';
import { useAuth, homeForRole } from '@/lib/auth-context';
import { cn } from '@/lib/utils';
import { DONATE_HREF } from '@/lib/config';

const LINKS = [
  { href: '/#how', label: 'How it works' },
  { href: DONATE_HREF, label: 'Dil Dosa' },
  { href: '/track', label: 'Track Donation' },
];

export function SiteHeader({ transparent = false }: { transparent?: boolean }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  const solid = scrolled || !transparent || open;

  return (
    <>
      <header
        className={cn(
          'fixed inset-x-0 top-0 z-50 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]',
          solid
            ? 'border-b border-line bg-paper/85 backdrop-blur-xl'
            : 'border-b border-transparent bg-transparent'
        )}
      >
        <div className="container-lux flex h-16 items-center justify-between md:h-[74px]">
          <Logo />

          <nav className="hidden items-center gap-7 md:flex">
            {LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-[13.5px] tracking-[-0.022em] text-ink-soft transition-colors duration-300 hover:text-emerald"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-2 md:flex">
            {user ? (
              <Link href={homeForRole(user.role)} className="btn btn-outline py-2.5 text-[13px] tracking-[-0.022em]">
                {user.role === 'customer' ? 'My donations' : 'Dashboard'}
                <ArrowUpRight size={14} />
              </Link>
            ) : (
              <>
                <Link href="/login" className="btn btn-ghost py-2.5 text-[13px] tracking-[-0.022em]">
                  Sign in
                </Link>
                <Link href={DONATE_HREF} className="btn btn-primary py-2.5 text-[13px] tracking-[-0.022em]">
                  Donate a meal
                </Link>
              </>
            )}
          </div>

          <button
            onClick={() => setOpen((v) => !v)}
            className="-mr-2 flex size-10 items-center justify-center text-ink md:hidden"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      {/* Mobile sheet */}
      <div
        className={cn(
          'fixed inset-0 z-40 bg-paper transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] md:hidden',
          open ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        )}
      >
        <div className="flex h-full flex-col px-6 pb-safe pt-24">
          <nav className="flex flex-col">
            {LINKS.map((link, i) => (
              <Link
                key={link.href}
                href={link.href}
                style={{ transitionDelay: open ? `${120 + i * 60}ms` : '0ms' }}
                className={cn(
                  'border-b border-line-soft py-5 font-display text-[1.75rem] tracking-[-0.02em] text-ink transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]',
                  open ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0'
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="mt-auto flex flex-col gap-3 py-8">
            {user ? (
              <Link href={homeForRole(user.role)} className="btn btn-primary w-full">
                {user.role === 'customer' ? 'My donations' : 'Go to dashboard'}
              </Link>
            ) : (
              <>
                <Link href={DONATE_HREF} className="btn btn-primary w-full">
                  Donate a meal
                </Link>
                <Link href="/login" className="btn btn-outline w-full">
                  Sign in
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
