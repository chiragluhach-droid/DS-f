'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useAuth, homeForRole } from '@/lib/auth-context';
import type { Role } from '@/lib/types';

export function RequireRole({
  roles,
  children,
}: {
  roles: Role[];
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;
    if (!user) router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    // Signed in, wrong workspace: send them to their own rather than dropping
    // them on the landing page with no explanation.
    else if (!roles.includes(user.role)) router.replace(homeForRole(user.role));
  }, [user, loading, roles, router, pathname]);

  if (loading || !user || !roles.includes(user.role)) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <Loader2 className="size-5 animate-spin text-ink-mute" />
      </div>
    );
  }

  return <>{children}</>;
}
