'use client';

import { useEffect, useState } from 'react';
import { LayoutGrid, PackageCheck, Building2 } from 'lucide-react';
import { RequireRole } from '@/components/RequireRole';
import { DashboardShell } from '@/components/dashboard/DashboardShell';
import { useAuth } from '@/lib/auth-context';
import { get } from '@/lib/api';
import { cn } from '@/lib/utils';
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

  const pending = ngo?.approvalStatus === 'pending';
  const blocked = ngo?.approvalStatus === 'rejected' || ngo?.approvalStatus === 'suspended';

  return (
    <DashboardShell
      nav={NAV}
      workspace={ngo?.name ?? user?.name ?? 'NGO'}
      workspaceKind="NGO workspace"
    >
      {(pending || blocked) && (
        <div
          className={cn(
            'mb-8 rounded-[18px] border p-5',
            blocked ? 'border-danger/30 bg-danger-tint' : 'border-amber/30 bg-amber-tint'
          )}
        >
          <p className="text-[14px] font-medium text-ink">
            {pending ? 'Your application is with our team' : 'Your organisation is not active'}
          </p>
          <p className="mt-1 text-[13px] leading-relaxed text-ink-soft">
            {pending
              ? 'Once approved, partner kitchens can route their second service to you and this is where you confirm what arrives.'
              : 'Nothing has been deleted, but kitchens cannot send you food right now. Get in touch with DaanSetu.'}
          </p>
        </div>
      )}
      {children}
    </DashboardShell>
  );
}
