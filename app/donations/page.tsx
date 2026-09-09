import type { Metadata } from 'next';
import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';
import { RequireRole } from '@/components/RequireRole';
import { MyDonations } from '@/components/track/MyDonations';

export const metadata: Metadata = { title: 'My donations' };

export default function DonationsPage() {
  return (
    <>
      <SiteHeader />
      <RequireRole roles={['customer', 'admin', 'restaurant', 'ngo']}>
        <main className="pt-16 md:pt-[74px]">
          <MyDonations />
        </main>
      </RequireRole>
      <SiteFooter />
    </>
  );
}
