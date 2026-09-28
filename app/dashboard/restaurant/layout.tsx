'use client';

import {
  LayoutGrid,
  PackageCheck,
  UtensilsCrossed,
  QrCode,
  Store,
  HeartHandshake,
} from 'lucide-react';
import { RequireRole } from '@/components/RequireRole';
import { DashboardShell } from '@/components/dashboard/DashboardShell';
import { useAuth } from '@/lib/auth-context';
import { useEffect, useState } from 'react';
import { get } from '@/lib/api';
import { cn } from '@/lib/utils';
import type { Restaurant } from '@/lib/types';

const NAV = [
  { href: '/dashboard/restaurant', label: 'Overview', icon: LayoutGrid },
  { href: '/dashboard/restaurant/batches', label: 'Batches', icon: PackageCheck },
  { href: '/dashboard/restaurant/menu', label: 'Donation menu', icon: UtensilsCrossed },
  { href: '/dashboard/restaurant/partners', label: 'NGO partner', icon: HeartHandshake },
  { href: '/dashboard/restaurant/qr', label: 'QR code', icon: QrCode },
  { href: '/dashboard/restaurant/profile', label: 'Profile', icon: Store },
];

export default function RestaurantLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireRole roles={['restaurant']}>
      <Inner>{children}</Inner>
    </RequireRole>
  );
}

function Inner({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);

  useEffect(() => {
    void get<{ restaurant: Restaurant }>('/restaurants/me')
      .then((d) => setRestaurant(d.restaurant))
      .catch(() => setRestaurant(null));
  }, []);

  const pending = restaurant?.approvalStatus === 'pending';
  const blocked =
    restaurant?.approvalStatus === 'rejected' || restaurant?.approvalStatus === 'suspended';

  return (
    <DashboardShell
      nav={NAV}
      workspace={restaurant?.name ?? user?.name ?? 'Restaurant'}
      workspaceKind="Restaurant workspace"
      publicLink={
        restaurant && restaurant.approvalStatus === 'approved'
          ? { href: `/restaurant/${restaurant.slug}`, label: 'View donation page' }
          : undefined
      }
    >
      {(pending || blocked) && (
        <div
          className={cn(
            'mb-8 rounded-[18px] border p-5',
            blocked ? 'border-danger/30 bg-danger-tint' : 'border-amber/30 bg-amber-tint'
          )}
        >
          <p className="text-[14px] font-medium text-ink">
            {pending ? 'Your application is with our team' : 'Your page is not live'}
          </p>
          <p className="mt-1 text-[13px] leading-relaxed text-ink-soft">
            {pending
              ? 'Set up your menu and pick an NGO partner in the meantime — your donation page and QR code go live as soon as you are approved.'
              : 'Nothing has been deleted, but your donation page is hidden. Get in touch with DaanSetu to sort this out.'}
          </p>
        </div>
      )}
      {children}
    </DashboardShell>
  );
}
