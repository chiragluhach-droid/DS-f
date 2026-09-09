'use client';

import { useEffect, useState } from 'react';
import { Loader2, Check } from 'lucide-react';
import { get, patch, ApiError } from '@/lib/api';
import { useToast } from '@/components/Toast';
import { PageHeading } from '@/components/dashboard/DashboardShell';
import { cn } from '@/lib/utils';
import type { Restaurant } from '@/lib/types';

export default function ProfilePage() {
  const { push } = useToast();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [form, setForm] = useState({
    name: '',
    tagline: '',
    description: '',
    phone: '',
    cuisine: '',
    coverImage: '',
    logoImage: '',
  });
  const [accepting, setAccepting] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    void get<{ restaurant: Restaurant }>('/restaurants/me')
      .then(({ restaurant: r }) => {
        setRestaurant(r);
        setForm({
          name: r.name,
          tagline: r.tagline ?? '',
          description: r.description ?? '',
          phone: r.phone,
          cuisine: r.cuisine.join(', '),
          coverImage: r.coverImage ?? '',
          logoImage: r.logoImage ?? '',
        });
        setAccepting(r.isAcceptingDonations);
      })
      .catch(() => setRestaurant(null));
  }, []);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await patch('/restaurants/me', {
        name: form.name,
        tagline: form.tagline,
        description: form.description,
        phone: form.phone,
        cuisine: form.cuisine
          .split(',')
          .map((c) => c.trim())
          .filter(Boolean),
        ...(form.coverImage ? { coverImage: form.coverImage } : {}),
        ...(form.logoImage ? { logoImage: form.logoImage } : {}),
        isAcceptingDonations: accepting,
      });
      push('Profile updated.', 'success');
    } catch (err) {
      push(err instanceof ApiError ? err.message : 'Could not save your profile.', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (!restaurant) {
    return (
      <div className="flex min-h-[50dvh] items-center justify-center">
        <Loader2 className="size-5 animate-spin text-ink-mute" />
      </div>
    );
  }

  return (
    <>
      <PageHeading
        eyebrow="Profile"
        title="How guests see you"
        description="This is what appears at the top of your donation page when someone scans your code."
      />

      <form onSubmit={save} className="max-w-2xl space-y-6">
        <div className="rounded-[18px] border border-line bg-surface p-6 md:p-7">
          <h2 className="display-sm">Identity</h2>

          <div className="mt-6 space-y-5">
            <div>
              <label className="label-lux" htmlFor="p-name">Restaurant name</label>
              <input
                id="p-name"
                className="field"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>

            <div>
              <label className="label-lux" htmlFor="p-tagline">Tagline</label>
              <input
                id="p-tagline"
                className="field"
                value={form.tagline}
                onChange={(e) => setForm({ ...form, tagline: e.target.value })}
                placeholder="A kitchen that cooks twice."
              />
            </div>

            <div>
              <label className="label-lux" htmlFor="p-desc">About</label>
              <textarea
                id="p-desc"
                rows={5}
                className="field resize-none"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="label-lux" htmlFor="p-phone">Phone</label>
                <input
                  id="p-phone"
                  className="field"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </div>
              <div>
                <label className="label-lux" htmlFor="p-cuisine">Cuisine (comma separated)</label>
                <input
                  id="p-cuisine"
                  className="field"
                  value={form.cuisine}
                  onChange={(e) => setForm({ ...form, cuisine: e.target.value })}
                />
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="label-lux" htmlFor="p-cover">Cover image URL</label>
                <input
                  id="p-cover"
                  type="url"
                  className="field"
                  value={form.coverImage}
                  onChange={(e) => setForm({ ...form, coverImage: e.target.value })}
                />
              </div>
              <div>
                <label className="label-lux" htmlFor="p-logo">Logo image URL</label>
                <input
                  id="p-logo"
                  type="url"
                  className="field"
                  value={form.logoImage}
                  onChange={(e) => setForm({ ...form, logoImage: e.target.value })}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-[18px] border border-line bg-surface p-6 md:p-7">
          <h2 className="display-sm">Donations</h2>
          <button
            type="button"
            onClick={() => setAccepting((v) => !v)}
            className="mt-5 flex w-full items-start gap-3.5 rounded-xl border border-line bg-paper p-4 text-left transition-colors hover:border-emerald/35"
          >
            <span
              className={cn(
                'mt-0.5 flex size-[18px] shrink-0 items-center justify-center rounded-[5px] border transition-all',
                accepting ? 'border-emerald bg-emerald' : 'border-ink-faint bg-surface'
              )}
            >
              {accepting && <Check size={11} className="text-paper" strokeWidth={3} />}
            </span>
            <span>
              <span className="block text-[14px] font-medium text-ink">
                Accepting donations right now
              </span>
              <span className="mt-0.5 block text-[12.5px] leading-relaxed text-ink-mute">
                Turn this off if your kitchen cannot run the second service today. Your page stays
                live but the menu is closed.
              </span>
            </span>
          </button>

          <dl className="mt-6 grid grid-cols-2 gap-5 border-t border-line pt-5 text-[13px]">
            <div>
              <dt className="text-ink-mute">FSSAI licence</dt>
              <dd className="mt-1 text-ink">{restaurant.fssaiLicense ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-ink-mute">Approval status</dt>
              <dd className="mt-1 capitalize text-emerald">{restaurant.approvalStatus}</dd>
            </div>
          </dl>
        </div>

        <button type="submit" disabled={saving} className="btn btn-primary">
          {saving && <Loader2 size={15} className="animate-spin" />}
          Save changes
        </button>
      </form>
    </>
  );
}
