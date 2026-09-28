'use client';

import Link from 'next/link';
import { AlertTriangle, RotateCw } from 'lucide-react';
import { ApiError } from '@/lib/api';

/**
 * A failed load is not an empty list. Saying so — and saying which failure it
 * was — is the difference between "this kitchen has no dishes" and "your session
 * expired", which look identical when errors are swallowed.
 */
export function LoadError({
  error,
  onRetry,
  what = 'this page',
}: {
  error: unknown;
  onRetry?: () => void;
  what?: string;
}) {
  const status = error instanceof ApiError ? error.status : undefined;
  const expired = status === 401;
  const forbidden = status === 403;

  const message = expired
    ? 'Your session has expired.'
    : forbidden
      ? 'This account does not have access to that.'
      : error instanceof Error && error.message
        ? error.message
        : `We could not load ${what}.`;

  return (
    <div className="rounded-[18px] border border-danger/25 bg-danger-tint px-6 py-12 text-center">
      <AlertTriangle size={22} className="mx-auto text-danger" strokeWidth={1.5} />
      <h3 className="display-sm mt-5">
        {expired ? 'Please sign in again' : `Could not load ${what}`}
      </h3>
      <p className="mx-auto mt-2.5 max-w-sm text-[13.5px] leading-relaxed text-ink-soft">
        {message}
      </p>

      <div className="mt-6 flex flex-wrap justify-center gap-3">
        {expired ? (
          <Link href="/login" className="btn btn-primary">
            Sign in
          </Link>
        ) : (
          onRetry && (
            <button onClick={onRetry} className="btn btn-primary">
              <RotateCw size={14} strokeWidth={1.8} />
              Try again
            </button>
          )
        )}
      </div>
    </div>
  );
}
