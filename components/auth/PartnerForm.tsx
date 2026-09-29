'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, ArrowRight } from 'lucide-react';
import { post, ApiError } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { cn } from '@/lib/utils';

type Kind = 'restaurant' | 'ngo';

const BLANK = {
  contactName: '',
  email: '',
  password: '',
  accountPhone: '',
  orgName: '',
  orgPhone: '',
  line1: '',
  city: '',
  state: '',
  pincode: '',
  fssaiLicense: '',
  registrationNumber: '',
  website: '',
  about: '',
};

/**
 * A kitchen or an NGO applying to join. The account works immediately so they
 * can finish setting up, but nothing is public until an admin approves it.
 */
export function PartnerForm({ kind }: { kind: Kind }) {
  const router = useRouter();
  const { refresh } = useAuth();
  const [form, setForm] = useState(BLANK);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (key: keyof typeof BLANK) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm({ ...form, [key]: e.target.value });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const account = {
      name: form.contactName,
      email: form.email,
      password: form.password,
      phone: form.accountPhone,
    };
    const address = {
      line1: form.line1,
      city: form.city,
      state: form.state,
      pincode: form.pincode,
    };

    try {
      if (kind === 'restaurant') {
        await post('/auth/register/restaurant', {
          account,
          restaurant: {
            name: form.orgName,
            phone: form.orgPhone,
            address,
            fssaiLicense: form.fssaiLicense,
            description: form.about || undefined,
          },
        });
      } else {
        await post('/auth/register/ngo', {
          account,
          ngo: {
            name: form.orgName,
            phone: form.orgPhone,
            address,
            registrationNumber: form.registrationNumber,
            website: form.website || undefined,
            mission: form.about || undefined,
          },
        });
      }

      // The application set the session cookie; load it before navigating so
      // the dashboard does not briefly look signed out.
      await refresh();
      router.replace(kind === 'restaurant' ? '/dashboard/restaurant' : '/dashboard/ngo');
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : 'Could not send your application. Please try again.'
      );
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-7">
      <fieldset className="space-y-5">
        <legend className="label-lux mb-4">
          {kind === 'restaurant' ? 'Your kitchen' : 'Your organisation'}
        </legend>

        <Field
          id="orgName"
          label={kind === 'restaurant' ? 'Restaurant name' : 'Organisation name'}
          value={form.orgName}
          onChange={set('orgName')}
          placeholder={kind === 'restaurant' ? 'Dil Dosa' : 'Parbhat - An Awakening'}
          required
          minLength={2}
        />

        <div className="grid gap-5 sm:grid-cols-2">
          <Field
            id="orgPhone"
            label="Phone"
            type="tel"
            inputMode="tel"
            value={form.orgPhone}
            onChange={set('orgPhone')}
            placeholder="98200 00000"
            required
          />
          {kind === 'restaurant' ? (
            <Field
              id="fssaiLicense"
              label="FSSAI licence"
              inputMode="numeric"
              value={form.fssaiLicense}
              onChange={set('fssaiLicense')}
              placeholder="14 digits"
              required
              hint="Printed on your licence certificate."
            />
          ) : (
            <Field
              id="registrationNumber"
              label="Registration number"
              value={form.registrationNumber}
              onChange={set('registrationNumber')}
              placeholder="Trust / society / Section 8 number"
              required
            />
          )}
        </div>

        <Field
          id="line1"
          label="Street address"
          value={form.line1}
          onChange={set('line1')}
          placeholder="BPTP Park Street Market"
          required
        />

        <div className="grid gap-5 sm:grid-cols-3">
          <Field id="city" label="City" value={form.city} onChange={set('city')} placeholder="Faridabad" required />
          <Field id="state" label="State" value={form.state} onChange={set('state')} placeholder="Haryana" required />
          <Field
            id="pincode"
            label="Pincode"
            inputMode="numeric"
            maxLength={6}
            value={form.pincode}
            onChange={set('pincode')}
            placeholder="121001"
            required
          />
        </div>

        {kind === 'ngo' && (
          <Field
            id="website"
            label="Website"
            type="url"
            value={form.website}
            onChange={set('website')}
            placeholder="https://example.org"
            optional
          />
        )}

        <div>
          <label className="label-lux" htmlFor="about">
            {kind === 'restaurant' ? 'About the kitchen' : 'Your mission'}{' '}
            <span className="normal-case tracking-normal">(optional)</span>
          </label>
          <textarea
            id="about"
            rows={3}
            maxLength={2000}
            className="field resize-none"
            value={form.about}
            onChange={set('about')}
            placeholder={
              kind === 'restaurant'
                ? 'One griddle, two cooks, and a queue that starts at seven.'
                : 'Who you serve, and how the food is distributed.'
            }
          />
        </div>
      </fieldset>

      <fieldset className="space-y-5 border-t border-line pt-7">
        <legend className="label-lux mb-4">Your sign-in</legend>

        <Field
          id="contactName"
          label="Your name"
          value={form.contactName}
          onChange={set('contactName')}
          placeholder="Nikhil Fernandes"
          required
          minLength={2}
          autoComplete="name"
        />

        <div className="grid gap-5 sm:grid-cols-2">
          <Field
            id="email"
            label="Email"
            type="email"
            inputMode="email"
            value={form.email}
            onChange={set('email')}
            placeholder="you@example.in"
            required
            autoComplete="email"
          />
          <Field
            id="accountPhone"
            label="Your mobile"
            type="tel"
            inputMode="tel"
            value={form.accountPhone}
            onChange={set('accountPhone')}
            placeholder="98200 00000"
            required
            autoComplete="tel"
          />
        </div>

        <Field
          id="password"
          label="Password"
          type="password"
          value={form.password}
          onChange={set('password')}
          placeholder="At least 8 characters"
          required
          minLength={8}
          autoComplete="new-password"
        />
      </fieldset>

      {error && <p className="text-[13px] text-danger">{error}</p>}

      <div>
        <button type="submit" disabled={loading} className="btn btn-primary group w-full">
          {loading ? <Loader2 size={15} className="animate-spin" /> : null}
          Send application
          {!loading && (
            <ArrowRight size={15} className="transition-transform duration-500 group-hover:translate-x-1" />
          )}
        </button>
        <p className="mt-3 text-center text-[12px] leading-relaxed text-ink-mute">
          You can sign in and set everything up straight away. DaanSetu reviews every application
          before your page goes live.
        </p>
      </div>
    </form>
  );
}

function Field({
  id,
  label,
  hint,
  optional,
  ...props
}: {
  id: string;
  label: string;
  hint?: string;
  optional?: boolean;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label className="label-lux" htmlFor={id}>
        {label}{' '}
        {optional && <span className="normal-case tracking-normal">(optional)</span>}
      </label>
      <input id={id} className={cn('field')} {...props} />
      {hint && <p className="mt-1.5 text-[11.5px] text-ink-mute">{hint}</p>}
    </div>
  );
}
