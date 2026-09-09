import Link from 'next/link';
import { LogoMark } from './Logo';

/**
 * Deliberately short. Sign-in routes are reachable from the header, and the
 * donation menu is reached by scanning a restaurant's code — not from here,
 * so the footer stays correct as more kitchens are onboarded.
 */
const LINKS = [
  { href: '/#how', label: 'How it works' },
  { href: '/#transparency', label: 'Transparency promise' },
  { href: '/track', label: 'Track a donation' },
];

export function SiteFooter() {
  return (
    <footer className="bg-emerald-deep text-paper/70">
      <div className="container-lux py-14 md:py-16">
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between md:gap-16">
          <div className="max-w-xs">
            <div className="flex items-center gap-2 text-paper">
              <LogoMark className="size-6 brightness-0 invert" />
              <span className="font-display text-[1.15rem] font-medium tracking-[-0.02em]">
                DaanSetu
              </span>
            </div>
            <p className="mt-5 text-[13.5px] leading-relaxed text-paper/55">
              A bridge between a kitchen that can cook one more meal and a person who needs it —
              with every step on the record.
            </p>
          </div>

          <nav className="md:text-right">
            <p className="eyebrow text-paper/40">Platform</p>
            <ul className="mt-5 space-y-3">
              {LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-[13.5px] text-paper/65 transition-colors duration-300 hover:text-paper"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-paper/12 pt-7 text-[12px] text-paper/40 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} DaanSetu · daansetu.in</p>
          <p className="flex items-center gap-2">
            <span className="size-1.5 rounded-full bg-emerald-mid" />
            100% of every donation reaches the kitchen.
          </p>
        </div>
      </div>
    </footer>
  );
}
