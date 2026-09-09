'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, ArrowRight } from 'lucide-react';
import { useAuth, homeForRole } from '@/lib/auth-context';
import { ApiError } from '@/lib/api';
import { cn } from '@/lib/utils';

const DEMO = [
  { label: 'Admin', email: 'admin@daansetu.in' },
  { label: 'Restaurant', email: 'kitchen@saffronandstone.in' },
  { label: 'NGO', email: 'parbhatanawakening@gmail.com' },
];
const DEMO_PASSWORD = 'DaanSetu@2026';

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const { signIn } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const user = await signIn(form.email, form.password);
      router.push(params.get('next') ?? homeForRole(user.role));
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not sign in. Try again.');
      setLoading(false);
    }
  };

  return (
    <>
      <form onSubmit={submit} className="space-y-5">
        <div>
          <label className="label-lux" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            inputMode="email"
            className={cn('field', error && 'border-danger')}
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label className="label-lux" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            autoComplete="current-password"
            className={cn('field', error && 'border-danger')}
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            placeholder="••••••••"
          />
        </div>

        {error && <p className="text-[13px] text-danger">{error}</p>}

        <button type="submit" disabled={loading} className="btn btn-primary group w-full">
          {loading ? <Loader2 size={15} className="animate-spin" /> : null}
          Sign in
          {!loading && (
            <ArrowRight size={15} className="transition-transform duration-500 group-hover:translate-x-1" />
          )}
        </button>
      </form>

      <p className="mt-6 text-[13px] text-ink-soft">
        New here?{' '}
        <Link href="/register" className="text-emerald underline underline-offset-2">
          Create an account
        </Link>
      </p>

      {/* MVP convenience — remove before going to production. */}
      <div className="mt-8 rounded-xl border border-line bg-paper-deep p-4">
        <p className="text-[10.5px] uppercase tracking-[0.13em] text-ink-mute">Demo accounts</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {DEMO.map((d) => (
            <button
              key={d.email}
              type="button"
              onClick={() => setForm({ email: d.email, password: DEMO_PASSWORD })}
              className="rounded-full border border-line bg-surface px-3 py-1.5 text-[12px] text-ink-soft transition-colors hover:border-emerald/40 hover:text-emerald"
            >
              {d.label}
            </button>
          ))}
        </div>
        <p className="mt-3 text-[11.5px] text-ink-mute">
          Password for all three: <span className="text-ink">{DEMO_PASSWORD}</span>
        </p>
      </div>
    </>
  );
}
