import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { DONATE_HREF } from '@/lib/config';

/**
 * The artwork is a single dark-green mark on transparency. On dark surfaces
 * pass `brightness-0 invert` to flip it white — see the footer.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <Image
      src="/daansetu-mark.png"
      alt=""
      width={128}
      height={128}
      className={cn('size-7 object-contain', className)}
    />
  );
}

/** Clicking the mark or the wordmark opens the donation menu. */
export function Logo({
  className,
  href = DONATE_HREF,
  compact = false,
}: {
  className?: string;
  href?: string;
  compact?: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn("group inline-flex items-center gap-2 text-ink", className)}
    >
      <LogoMark className="size-7 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105" />
      {!compact && (
        <span className="font-display text-[1.15rem] font-medium tracking-[-0.02em]">
          DaanSetu
        </span>
      )}
    </Link>
  );
}
