'use client';

import { useCallback, useEffect, useState } from 'react';
import { Loader2, Users, Search } from 'lucide-react';
import { get } from '@/lib/api';
import { PageHeading, EmptyState } from '@/components/dashboard/DashboardShell';
import { formatDate, cn } from '@/lib/utils';
import type { Role } from '@/lib/types';

interface AdminUser {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: Role;
  isGuest: boolean;
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
}

const ROLES: { value: string; label: string }[] = [
  { value: 'all', label: 'Everyone' },
  { value: 'customer', label: 'Donors' },
  { value: 'restaurant', label: 'Restaurants' },
  { value: 'ngo', label: 'NGOs' },
  { value: 'admin', label: 'Admins' },
];

const ROLE_TONE: Record<Role, string> = {
  admin: 'border-emerald bg-emerald text-paper',
  restaurant: 'border-brass/30 bg-brass-tint text-brass',
  ngo: 'border-emerald/25 bg-emerald-wash text-emerald',
  customer: 'border-line bg-paper text-ink-mute',
};

export default function AdminUsersPage() {
  const [role, setRole] = useState('all');
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState<AdminUser[] | null>(null);

  const load = useCallback(async () => {
    try {
      const data = await get<{ users: AdminUser[] }>(
        `/admin/users?role=${role}&q=${encodeURIComponent(query)}`
      );
      setUsers(data.users);
    } catch {
      setUsers([]);
    }
  }, [role, query]);

  useEffect(() => {
    const t = setTimeout(() => void load(), query ? 300 : 0);
    return () => clearTimeout(t);
  }, [load, query]);

  return (
    <>
      <PageHeading
        eyebrow="Users"
        title="Everyone on the platform"
        description="Donors who gave without registering appear as guests — their history attaches automatically if they sign up with the same email."
      />

      <div className="flex flex-col gap-4 pb-6 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search
            size={15}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-faint"
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or email"
            className="field pl-11"
          />
        </div>
        <div className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 sm:mx-0 sm:px-0">
          {ROLES.map((r) => (
            <button
              key={r.value}
              onClick={() => setRole(r.value)}
              className={cn(
                'shrink-0 rounded-full border px-3.5 py-1.5 text-[12.5px] transition-all duration-300',
                role === r.value
                  ? 'border-emerald bg-emerald text-paper'
                  : 'border-line bg-surface text-ink-soft hover:border-emerald/40 hover:text-emerald'
              )}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {users === null ? (
        <div className="flex min-h-[30dvh] items-center justify-center">
          <Loader2 className="size-5 animate-spin text-ink-mute" />
        </div>
      ) : users.length === 0 ? (
        <EmptyState icon={Users} title="No users found" body="Try a different search or filter." />
      ) : (
        <div className="overflow-hidden rounded-[18px] border border-line bg-surface">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[42rem] text-left">
              <thead>
                <tr className="border-b border-line bg-paper">
                  {['Name', 'Role', 'Contact', 'Joined', 'Last seen'].map((h) => (
                    <th
                      key={h}
                      className="px-5 py-3.5 text-[10.5px] uppercase tracking-[0.12em] text-ink-mute"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-line-soft">
                {users.map((u) => (
                  <tr key={u._id} className="transition-colors hover:bg-paper">
                    <td className="px-5 py-4">
                      <p className="text-[13.5px] font-medium text-ink">{u.name}</p>
                      <p className="mt-0.5 text-[12px] text-ink-mute">{u.email}</p>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={cn(
                          'inline-flex rounded-full border px-2.5 py-1 text-[10px] uppercase tracking-[0.1em]',
                          ROLE_TONE[u.role]
                        )}
                      >
                        {u.role}
                      </span>
                      {u.isGuest && (
                        <span className="ml-2 text-[11px] text-ink-faint">guest</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-[12.5px] text-ink-soft">{u.phone ?? '—'}</td>
                    <td className="px-5 py-4 text-[12.5px] text-ink-soft">
                      {formatDate(u.createdAt)}
                    </td>
                    <td className="px-5 py-4 text-[12.5px] text-ink-soft">
                      {u.lastLoginAt ? formatDate(u.lastLoginAt) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}
