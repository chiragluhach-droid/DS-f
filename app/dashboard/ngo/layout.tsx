'use client';

import { useEffect, useState } from 'react';
import { LayoutGrid, PackageCheck, Building2 } from 'lucide-react';
import { RequireRole } from '@/components/RequireRole';
import { DashboardShell } from '@/components/dashboard/DashboardShell';
import { useAuth } from '@/lib/auth-context';
import { get } from '@/lib/api';
import type { Ngo } from '@/lib/types';

const NAV = [
  { href: '/dashboard/ngo', label: 'Overview', icon: LayoutGrid },
  { href: '/dashboard/ngo/batches', label: 'Incoming food', icon: PackageCheck },
  { href: '/dashboard/ngo/partners', label: 'Partner kitchens', icon: Building2 },
];

export default function NgoLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireRole roles={['ngo']}>
      <Inner>{children}</Inner>
    </RequireRole>
  );
}

function Inner({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [ngo, setNgo] = useState<Ngo | null>(null);

  useEffect(() => {
    void get<{ ngo: Ngo }>('/ngos/me')
      .then((d) => setNgo(d.ngo))
      .catch(() => setNgo(null));
  }, []);

  return (
    <DashboardShell
      nav={NAV}
      workspace={ngo?.name ?? user?.name ?? 'NGO'}
      workspaceKind="NGO workspace"
    >
      {children}
    </DashboardShell>
  );
}
