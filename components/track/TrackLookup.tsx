'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Loader2 } from 'lucide-react';
import { get, ApiError } from '@/lib/api';
import { cn } from '@/lib/utils';

export function TrackLookup() {
  const router = useRouter();
  const [value, setValue] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const id = value.trim().toUpperCase();
    if (!id) return setError('Enter the donation ID from your receipt.');

    setLoading(true);
    setError('');
    try {
      await get(`/donations/${encodeURIComponent(id)}/track`);
      router.push(`/track/${encodeURIComponent(id)}`);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : 'We could not reach the server. Try again.'
      );
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="mx-auto mt-10 max-w-md">
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setError('');
          }}
          placeholder="DS-7K2P-9QXM"
          aria-label="Donation ID"
          spellCheck={false}
          autoCapitalize="characters"
          className={cn(
            'field numeral flex-1 text-center text-[1.05rem] tracking-[0.06em] sm:text-left',
            error && 'border-danger'
          )}
        />
        <button type="submit" disabled={loading} className="btn btn-primary group shrink-0">
          {loading ? <Loader2 size={15} className="animate-spin" /> : null}
          Track
          {!loading && (
            <ArrowRight size={15} className="transition-transform duration-500 group-hover:translate-x-1" />
          )}
        </button>
      </div>
      {error && <p className="mt-3 text-[13px] text-danger">{error}</p>}
    </form>
  );
}
