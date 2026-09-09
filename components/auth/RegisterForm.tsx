'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, ArrowRight } from 'lucide-react';
import { useAuth, homeForRole } from '@/lib/auth-context';
import { ApiError } from '@/lib/api';
import { cn } from '@/lib/utils';

export function RegisterForm() {
  const router = useRouter();
  const { signUp } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const user = await signUp({
        name: form.name,
        email: form.email,
        password: form.password,
        phone: form.phone || undefined,
      });
      router.push(homeForRole(user.role));
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not create your account.');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-5">
      <div>
        <label className="label-lux" htmlFor="name">
          Full name
        </label>
        <input
          id="name"
          required
          autoComplete="name"
          className="field"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="Ananya Rao"
        />
      </div>

      <div>
        <label className="label-lux" htmlFor="reg-email">
          Email
        </label>
        <input
          id="reg-email"
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
        <label className="label-lux" htmlFor="reg-phone">
          Phone <span className="normal-case tracking-normal">(optional)</span>
        </label>
        <input
          id="reg-phone"
          type="tel"
          autoComplete="tel"
          inputMode="tel"
          className="field"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          placeholder="+91 98200 00000"
        />
      </div>

      <div>
        <label className="label-lux" htmlFor="reg-password">
          Password
        </label>
        <input
          id="reg-password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className="field"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          placeholder="At least 8 characters"
        />
      </div>

      {error && <p className="text-[13px] text-danger">{error}</p>}

      <button type="submit" disabled={loading} className="btn btn-primary group w-full">
        {loading ? <Loader2 size={15} className="animate-spin" /> : null}
        Create account
        {!loading && (
          <ArrowRight size={15} className="transition-transform duration-500 group-hover:translate-x-1" />
        )}
      </button>
    </form>
  );
}
