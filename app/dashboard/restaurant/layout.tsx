'use client';

import { LayoutGrid, ScrollText, UtensilsCrossed, QrCode, Store } from 'lucide-react';
import { RequireRole } from '@/components/RequireRole';
import { DashboardShell } from '@/components/dashboard/DashboardShell';
import { useAuth } from '@/lib/auth-context';
import { useEffect, useState } from 'react';
import { get } from '@/lib/api';
import type { Restaurant } from '@/lib/types';

const NAV = [
  { href: '/dashboard/restaurant', label: 'Overview', icon: LayoutGrid },
  { href: '/dashboard/restaurant/donations', label: 'Donations', icon: ScrollText },
  { href: '/dashboard/restaurant/menu', label: 'Donation menu', icon: UtensilsCrossed },
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

  return (
    <DashboardShell
      nav={NAV}
      workspace={restaurant?.name ?? user?.name ?? 'Restaurant'}
      workspaceKind="Restaurant workspace"
      publicLink={
        restaurant
          ? { href: `/restaurant/${restaurant.slug}`, label: 'View donation page' }
          : undefined
      }
    >
      {children}
    </DashboardShell>
  );
}
