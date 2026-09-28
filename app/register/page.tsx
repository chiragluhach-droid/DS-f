import type { Metadata } from 'next';
import Link from 'next/link';
import { AuthShell } from '@/components/auth/AuthShell';
import { RegisterForm } from '@/components/auth/RegisterForm';

export const metadata: Metadata = { title: 'Create an account' };

export default function RegisterPage() {
  return (
    <AuthShell
      eyebrow="Create an account"
      title={
        <>
          Keep every meal <em className="font-normal italic text-emerald">in one place.</em>
        </>
      }
      subtitle="An account is optional. Sign in before you donate and every meal you fund is kept here, with its full journey attached."
    >
      <RegisterForm />
      <p className="mt-7 text-[13px] text-ink-soft">
        Already have an account?{' '}
        <Link href="/login" className="text-emerald underline underline-offset-2">
          Sign in
        </Link>
      </p>
      <p className="mt-2 text-[13px] text-ink-soft">
        Signing up for a restaurant or an NGO?{' '}
        <Link href="/join" className="text-emerald underline underline-offset-2">
          Apply to partner
        </Link>
      </p>
    </AuthShell>
  );
}
