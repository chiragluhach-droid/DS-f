import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Money is held in paise, so an exact half-rupee split must be shown to the
 * paisa. Rounding each side to whole rupees made a ₹95 dish read as ₹48 paid by
 * the guest plus ₹48 matched by the kitchen — ₹96, which never existed.
 * Whole-rupee amounts still print without decimals.
 */
export const formatInr = (paise: number, opts?: { decimals?: boolean }) => {
  const exact = opts?.decimals ?? Math.round(paise) % 100 !== 0;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: exact ? 2 : 0,
    maximumFractionDigits: exact ? 2 : 0,
  }).format(paise / 100);
};

export const formatNumber = (n: number) => new Intl.NumberFormat('en-IN').format(n);

/** The pilot runs in one city; every timestamp is shown in IST and labelled. */
export const TIME_ZONE = 'Asia/Kolkata';
export const TIME_ZONE_LABEL = 'IST';

export const formatDate = (date: string | Date, withTime = false) =>
  new Intl.DateTimeFormat('en-IN', {
    timeZone: TIME_ZONE,
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    ...(withTime ? { hour: 'numeric', minute: '2-digit', hour12: true } : {}),
  }).format(new Date(date));

export const formatTime = (date: string | Date) =>
  new Intl.DateTimeFormat('en-IN', {
    timeZone: TIME_ZONE,
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(new Date(date));

export function relativeTime(date: string | Date): string {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.round(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days}d ago`;
  return formatDate(date);
}

export const pluralize = (n: number, one: string, many = `${one}s`) => (n === 1 ? one : many);

/** "https://parbhatanawakening.org/" → "parbhatanawakening.org" */
export function displayDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}
