'use client';

import { LayoutGrid, Store, HeartHandshake, Users, ScrollText, FileClock } from 'lucide-react';
import { RequireRole } from '@/components/RequireRole';
import { DashboardShell } from '@/components/dashboard/DashboardShell';
import { useAuth } from '@/lib/auth-context';

const NAV = [
  { href: '/dashboard/admin', label: 'Overview', icon: LayoutGrid },
  { href: '/dashboard/admin/restaurants', label: 'Restaurants', icon: Store },
  { href: '/dashboard/admin/ngos', label: 'NGOs', icon: HeartHandshake },
  { href: '/dashboard/admin/donations', label: 'Donations', icon: ScrollText },
  { href: '/dashboard/admin/users', label: 'Users', icon: Users },
  { href: '/dashboard/admin/audit', label: 'Audit log', icon: FileClock },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireRole roles={['admin']}>
      <Inner>{children}</Inner>
    </RequireRole>
  );
}

function Inner({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  return (
    <DashboardShell
      nav={NAV}
      workspace="DaanSetu"
      workspaceKind={`Platform admin · ${user?.name ?? ''}`}
      publicLink={{ href: '/', label: 'View public site' }}
    >
      {children}
    </DashboardShell>
  );
}
