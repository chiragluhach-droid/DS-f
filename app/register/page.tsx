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
      subtitle="Use the same email you donated with and your past donations will already be waiting for you."
    >
      <RegisterForm />
      <p className="mt-7 text-[13px] text-ink-soft">
        Already have an account?{' '}
        <Link href="/login" className="text-emerald underline underline-offset-2">
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
}
