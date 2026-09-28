import type { Metadata } from 'next';
import Link from 'next/link';
import { AuthShell } from '@/components/auth/AuthShell';
import { PartnerForm } from '@/components/auth/PartnerForm';

export const metadata: Metadata = { title: 'Apply as a restaurant' };

export default function JoinRestaurantPage() {
  return (
    <AuthShell
      eyebrow="For restaurants"
      title={
        <>
          Cook a <em className="font-normal italic text-emerald">second service.</em>
        </>
      }
      subtitle="Tell us about your kitchen. You can set up your menu straight away — your donation page goes live once we have checked your details."
    >
      <PartnerForm kind="restaurant" />
      <p className="mt-7 text-[13px] text-ink-soft">
        An NGO instead?{' '}
        <Link href="/join/ngo" className="text-emerald underline underline-offset-2">
          Apply here
        </Link>
      </p>
    </AuthShell>
  );
}
