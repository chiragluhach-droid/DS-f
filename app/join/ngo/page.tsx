import type { Metadata } from 'next';
import Link from 'next/link';
import { AuthShell } from '@/components/auth/AuthShell';
import { PartnerForm } from '@/components/auth/PartnerForm';

export const metadata: Metadata = { title: 'Apply as an NGO' };

export default function JoinNgoPage() {
  return (
    <AuthShell
      eyebrow="For NGOs"
      title={
        <>
          Meals you can <em className="font-normal italic text-emerald">count.</em>
        </>
      }
      subtitle="Tell us about your organisation. Once approved, partner kitchens can route their second service to you and you confirm every batch that arrives."
    >
      <PartnerForm kind="ngo" />
      <p className="mt-7 text-[13px] text-ink-soft">
        A restaurant instead?{' '}
        <Link href="/join/restaurant" className="text-emerald underline underline-offset-2">
          Apply here
        </Link>
      </p>
    </AuthShell>
  );
}
