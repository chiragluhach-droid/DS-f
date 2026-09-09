import type { Metadata } from 'next';
import { Suspense } from 'react';
import Link from 'next/link';
import { AuthShell } from '@/components/auth/AuthShell';
import { LoginForm } from '@/components/auth/LoginForm';

export const metadata: Metadata = { title: 'Sign in' };

export default function LoginPage() {
  return (
    <AuthShell
      eyebrow="Welcome back"
      title={
        <>
          Sign in to <em className="font-normal italic text-emerald">DaanSetu.</em>
        </>
      }
      subtitle="Restaurants, NGOs and donors all sign in here — you land in the right place automatically."
    >
      <Suspense fallback={<div className="h-72" />}>
        <LoginForm />
      </Suspense>
      <p className="mt-7 text-[13px] text-ink-soft">
        Donating for the first time?{' '}
        <Link href="/restaurants" className="text-emerald underline underline-offset-2">
          You don&rsquo;t need an account
        </Link>
        .
      </p>
    </AuthShell>
  );
}
