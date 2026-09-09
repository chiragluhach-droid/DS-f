'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LogOut, Menu, X, ExternalLink, type LucideIcon } from 'lucide-react';
import { Logo, LogoMark } from '@/components/Logo';
import { useAuth } from '@/lib/auth-context';
import { cn } from '@/lib/utils';

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export function DashboardShell({
  nav,
  workspace,
  workspaceKind,
  children,
  publicLink,
}: {
  nav: NavItem[];
  workspace: string;
  workspaceKind: string;
  children: React.ReactNode;
  publicLink?: { href: string; label: string };
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [open, setOpen] = useState(false);

  useEffect(() => setOpen(false), [pathname]);

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };

  const isActive = (href: string) =>
    href === pathname || (href !== '/' && pathname.startsWith(`${href}/`));

  const navList = (
    <nav className="flex flex-col gap-0.5">
      {nav.map((item) => {
        const Icon = item.icon;
        const active = isActive(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'group flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-[13.5px] transition-all duration-300',
              active
                ? 'bg-emerald text-paper'
                : 'text-ink-soft hover:bg-emerald-wash hover:text-emerald'
            )}
          >
            <Icon size={16} strokeWidth={1.7} className="shrink-0" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  const identity = (
    <div className="rounded-xl border border-line bg-paper p-3.5">
      <p className="text-[10px] uppercase tracking-[0.14em] text-ink-mute">{workspaceKind}</p>
      <p className="mt-1.5 truncate font-display text-[15px] font-medium tracking-[-0.015em] text-ink">
        {workspace}
      </p>
      <p className="mt-0.5 truncate text-[11.5px] text-ink-mute">{user?.email}</p>
    </div>
  );

  return (
    <div className="min-h-dvh bg-paper-deep">
      {/* -------------------------------------------------- desktop rail */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[16.5rem] flex-col border-r border-line bg-paper px-5 py-6 lg:flex">
        <Logo />
        <div className="mt-7">{identity}</div>
        <div className="mt-6 flex-1">{navList}</div>

        <div className="space-y-2 border-t border-line pt-5">
          {publicLink && (
            <Link
              href={publicLink.href}
              target="_blank"
              className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-[13px] text-ink-soft transition-colors hover:text-emerald"
            >
              <ExternalLink size={15} strokeWidth={1.7} />
              {publicLink.label}
            </Link>
          )}
          <button
            onClick={handleSignOut}
            className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-[13px] text-ink-soft transition-colors hover:text-danger"
          >
            <LogOut size={15} strokeWidth={1.7} />
            Sign out
          </button>
        </div>
      </aside>

      {/* -------------------------------------------------- mobile bar */}
      <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-line bg-paper/90 px-5 backdrop-blur-xl lg:hidden">
        <Link href="/" className="flex items-center gap-2.5">
          <LogoMark className="size-6 text-emerald" />
          <span className="font-display text-[15px] font-medium tracking-[-0.02em]">
            {workspace}
          </span>
        </Link>
        <button
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? 'Close menu' : 'Open menu'}
          className="-mr-2 flex size-10 items-center justify-center text-ink"
        >
          {open ? <X size={19} /> : <Menu size={19} />}
        </button>
      </header>

      {open && (
        <div className="fixed inset-0 top-14 z-30 bg-paper px-5 py-6 lg:hidden">
          {identity}
          <div className="mt-6">{navList}</div>
          <div className="mt-6 space-y-2 border-t border-line pt-5">
            {publicLink && (
              <Link
                href={publicLink.href}
                target="_blank"
                className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-[13.5px] text-ink-soft"
              >
                <ExternalLink size={15} strokeWidth={1.7} />
                {publicLink.label}
              </Link>
            )}
            <button
              onClick={handleSignOut}
              className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-[13.5px] text-danger"
            >
              <LogOut size={15} strokeWidth={1.7} />
              Sign out
            </button>
          </div>
        </div>
      )}

      <main className="lg:pl-[16.5rem]">
        <div className="mx-auto max-w-6xl px-5 py-7 md:px-8 md:py-10">{children}</div>
      </main>
    </div>
  );
}

export function PageHeading({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 pb-8">
      <div className="max-w-xl">
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="display-md mt-3">{title}</h1>
        {description && (
          <p className="mt-2.5 text-[14px] leading-relaxed text-ink-soft">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}

export function StatCard({
  label,
  value,
  sub,
  tone = 'default',
}: {
  label: string;
  value: string | number;
  sub?: string;
  tone?: 'default' | 'emerald' | 'amber';
}) {
  return (
    <div
      className={cn(
        'rounded-[16px] border p-5',
        tone === 'emerald'
          ? 'border-emerald/20 bg-emerald-wash'
          : tone === 'amber'
            ? 'border-amber/25 bg-amber-tint'
            : 'border-line bg-surface'
      )}
    >
      <p className="text-[10.5px] uppercase tracking-[0.12em] text-ink-mute">{label}</p>
      <p
        className={cn(
          'numeral mt-2.5 text-[2rem] leading-none',
          tone === 'emerald' ? 'text-emerald' : tone === 'amber' ? 'text-amber' : 'text-ink'
        )}
      >
        {value}
      </p>
      {sub && <p className="mt-2 text-[12px] text-ink-mute">{sub}</p>}
    </div>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  body,
  action,
}: {
  icon: LucideIcon;
  title: string;
  body: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="rounded-[18px] border border-dashed border-line bg-surface px-6 py-16 text-center">
      <Icon size={22} className="mx-auto text-ink-faint" strokeWidth={1.4} />
      <h3 className="display-sm mt-5">{title}</h3>
      <p className="mx-auto mt-2.5 max-w-sm text-[13.5px] leading-relaxed text-ink-soft">{body}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
