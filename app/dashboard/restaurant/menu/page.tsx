'use client';

import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import { Loader2, Plus, Pencil, Trash2, UtensilsCrossed, X, EyeOff, ExternalLink } from 'lucide-react';
import { get, post, patch, del, ApiError } from '@/lib/api';
import { useToast } from '@/components/Toast';
import { PageHeading, EmptyState } from '@/components/dashboard/DashboardShell';
import { LoadError } from '@/components/dashboard/LoadError';
import { formatInr, cn } from '@/lib/utils';
import { splitPrice, type MenuItem } from '@/lib/types';

/** Guests always pay half — the split is fixed across the platform. */
const CUSTOMER_SHARE_PERCENT = 50;

const BLANK = {
  name: '',
  description: '',
  mrpRupees: '',
  batchTarget: '40',
  image: '',
  category: 'Dosa',
  servingSize: '',
  isVeg: true,
  isSignature: false,
  isAvailable: true,
};

type Draft = typeof BLANK;

const toDraft = (item: MenuItem): Draft => ({
  name: item.name,
  description: item.description ?? '',
  mrpRupees: String(item.mrpPaise / 100),
  batchTarget: String(item.batchTarget || 40),
  image: item.image ?? '',
  category: item.category,
  servingSize: item.servingSize ?? '',
  isVeg: item.isVeg,
  isSignature: item.isSignature,
  isAvailable: item.isAvailable,
});

export default function MenuPage() {
  const { push } = useToast();
  const [items, setItems] = useState<MenuItem[] | null>(null);
  const [error, setError] = useState<unknown>(null);
  const [toggling, setToggling] = useState<string | null>(null);
  const [slug, setSlug] = useState<string | null>(null);
  const [editing, setEditing] = useState<MenuItem | null>(null);
  const [draft, setDraft] = useState<Draft>(BLANK);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    try {
      const data = await get<{ items: MenuItem[] }>('/menu/me');
      setItems(data.items);
    } catch (err) {
      // An empty menu and a failed request look the same to a restaurant owner
      // unless we say which happened.
      setError(err);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    void get<{ restaurant: { slug: string } }>('/restaurants/me')
      .then((d) => setSlug(d.restaurant.slug))
      .catch(() => setSlug(null));
  }, []);

  const openNew = () => {
    setEditing(null);
    setDraft(BLANK);
    setOpen(true);
  };

  const openEdit = (item: MenuItem) => {
    setEditing(item);
    setDraft(toDraft(item));
    setOpen(true);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      name: draft.name.trim(),
      description: draft.description.trim() || undefined,
      mrpPaise: Math.round(Number(draft.mrpRupees) * 100),
      batchTarget: Number(draft.batchTarget) || 40,
      image: draft.image.trim(),
      category: draft.category.trim() || 'Dosa',
      servingSize: draft.servingSize.trim() || undefined,
      isVeg: draft.isVeg,
      isSignature: draft.isSignature,
      isAvailable: draft.isAvailable,
    };

    try {
      if (editing) {
        await patch(`/menu/me/items/${editing._id}`, payload);
        push('Menu item updated.', 'success');
      } else {
        await post('/menu/me/items', payload);
        push('Menu item added.', 'success');
      }
      setOpen(false);
      await load();
    } catch (err) {
      push(err instanceof ApiError ? err.message : 'Could not save the item.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (item: MenuItem) => {
    if (!confirm(`Remove “${item.name}” from your donation menu?`)) return;
    try {
      await del(`/menu/me/items/${item._id}`);
      push('Menu item removed.', 'success');
      await load();
    } catch (err) {
      push(err instanceof ApiError ? err.message : 'Could not remove the item.', 'error');
    }
  };

  /**
   * Flip the switch straight away and send the change behind it. Waiting for the
   * round trip plus a full list reload made a one-tap control feel broken, and
   * this is the switch that decides whether guests can fund the dish at all.
   * A failure puts it back and says so.
   */
  const toggleAvailable = async (item: MenuItem) => {
    const next = !item.isAvailable;
    const apply = (value: boolean) =>
      setItems((current) =>
        current?.map((i) => (i._id === item._id ? { ...i, isAvailable: value } : i)) ?? current
      );

    setToggling(item._id);
    apply(next);

    try {
      await patch(`/menu/me/items/${item._id}`, { isAvailable: next });
      push(
        next
          ? `${item.name} is back on your donation page.`
          : `${item.name} is hidden — guests can no longer fund it.`,
        'success'
      );
    } catch (err) {
      apply(!next);
      push(err instanceof ApiError ? err.message : 'Could not update availability.', 'error');
    } finally {
      setToggling(null);
    }
  };

  return (
    <>
      <PageHeading
        eyebrow="Donation menu"
        title="What guests can fund"
        description="These are the dishes shown when someone scans your code. A guest pays half the menu price and you commit the other half. Hiding a dish removes it from that page straight away."
        action={
          <div className="flex flex-wrap items-center gap-3">
            {slug && (
              <a
                href={`/restaurant/${slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline py-2.5 text-[13px]"
              >
                <ExternalLink size={14} strokeWidth={1.8} />
                View donation page
              </a>
            )}
            <button onClick={openNew} className="btn btn-primary py-2.5 text-[13px]">
              <Plus size={15} />
              Add a dish
            </button>
          </div>
        }
      />

      {error ? (
        <LoadError error={error} onRetry={() => void load()} what="your donation menu" />
      ) : items === null ? (
        <div className="flex min-h-[30dvh] items-center justify-center">
          <Loader2 className="size-5 animate-spin text-ink-mute" />
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={UtensilsCrossed}
          title="Your donation menu is empty"
          body="Add the dishes your kitchen can cook for the second service. Start with one — you can always add more."
          action={
            <button onClick={openNew} className="btn btn-primary">
              <Plus size={15} />
              Add your first dish
            </button>
          }
        />
      ) : (
        <ul className="grid gap-4 md:grid-cols-2">
          {items.map((item) => (
            <li
              key={item._id}
              className={cn(
                'flex gap-4 rounded-[18px] border bg-surface p-4',
                item.isAvailable ? 'border-line' : 'border-line opacity-60'
              )}
            >
              <div className="relative size-[84px] shrink-0 overflow-hidden rounded-xl bg-paper-deep">
                {item.image && (
                  <Image src={item.image} alt={item.name} fill sizes="84px" className="object-cover" />
                )}
              </div>

              <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="truncate font-display text-[1.05rem] font-medium tracking-[-0.015em] text-ink">
                      {item.name}
                    </h3>
                    <p className="mt-0.5 text-[11.5px] uppercase tracking-[0.1em] text-ink-mute">
                      {item.category}
                      {item.isSignature && ' · Signature'}
                    </p>
                    {/* A dish is public only when the kitchen shows it AND
                        DaanSetu has approved it for the pilot. */}
                    {item.activeForDonation === false ? (
                      <p className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-amber/30 bg-amber-tint px-2.5 py-1 text-[10.5px] uppercase tracking-[0.09em] text-amber">
                        Not in the pilot
                      </p>
                    ) : (
                      !item.isAvailable && (
                        <p className="mt-2 inline-flex items-center gap-1.5 text-[11.5px] text-ink-mute">
                          <EyeOff size={11} strokeWidth={1.8} />
                          Not on your donation page
                        </p>
                      )
                    )}
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <button
                      onClick={() => openEdit(item)}
                      aria-label={`Edit ${item.name}`}
                      className="flex size-8 items-center justify-center rounded-lg text-ink-mute transition-colors hover:bg-emerald-wash hover:text-emerald"
                    >
                      <Pencil size={13} />
                    </button>
                    <button
                      onClick={() => remove(item)}
                      aria-label={`Delete ${item.name}`}
                      className="flex size-8 items-center justify-center rounded-lg text-ink-mute transition-colors hover:bg-danger-tint hover:text-danger"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                <div className="mt-auto flex items-end justify-between gap-3 pt-3">
                  <div>
                    <div className="flex items-baseline gap-1.5">
                      <span className="numeral text-[12px] text-ink-faint line-through">
                        {formatInr(item.mrpPaise)}
                      </span>
                      <span className="numeral text-[1.15rem] leading-none text-emerald">
                        {formatInr(splitPrice(item.mrpPaise, item.customerSharePercent).customerPaysPaise)}
                      </span>
                    </div>
                    <p className="mt-1 text-[11px] text-ink-mute">
                      guest pays · you add{' '}
                      {formatInr(
                        splitPrice(item.mrpPaise, item.customerSharePercent).restaurantPaysPaise
                      )}
                    </p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={item.isAvailable}
                    aria-label={`${item.name}: ${
                      item.isAvailable ? 'shown on' : 'hidden from'
                    } your donation page`}
                    disabled={toggling === item._id}
                    onClick={() => toggleAvailable(item)}
                    className={cn(
                      'inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11.5px]',
                      'transition-all duration-150 active:scale-[0.94] disabled:cursor-wait',
                      'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald',
                      item.isAvailable
                        ? 'border-emerald/30 bg-emerald-wash text-emerald hover:border-emerald/60 hover:bg-emerald/10'
                        : 'border-line bg-paper text-ink-mute hover:border-ink-faint hover:text-ink-soft'
                    )}
                  >
                    {toggling === item._id ? (
                      <Loader2 size={11} className="animate-spin" />
                    ) : (
                      <span
                        aria-hidden
                        className={cn(
                          'size-1.5 rounded-full transition-colors duration-150',
                          item.isAvailable ? 'bg-emerald' : 'bg-ink-faint'
                        )}
                      />
                    )}
                    {item.isAvailable ? 'Available' : 'Hidden'}
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* --------------------------------------------------- editor sheet */}
      {open && (
        <div className="fixed inset-0 z-[70] flex items-end justify-center bg-ink/25 backdrop-blur-sm sm:items-center">
          <div
            className="absolute inset-0"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <form
            onSubmit={save}
            className="relative max-h-[92dvh] w-full max-w-lg overflow-y-auto rounded-t-[24px] border border-line bg-paper p-6 sm:rounded-[24px] md:p-8"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="eyebrow">{editing ? 'Edit dish' : 'New dish'}</p>
                <h2 className="display-sm mt-2">
                  {editing ? editing.name : 'Add to your donation menu'}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="-mr-2 flex size-9 items-center justify-center text-ink-mute hover:text-ink"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-7 space-y-5">
              <div>
                <label className="label-lux" htmlFor="m-name">Name</label>
                <input
                  id="m-name"
                  required
                  className="field"
                  value={draft.name}
                  onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                  placeholder="Masala Dosa"
                />
              </div>

              <div>
                <label className="label-lux" htmlFor="m-desc">Description</label>
                <textarea
                  id="m-desc"
                  rows={3}
                  className="field resize-none"
                  value={draft.description}
                  onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                  placeholder="What is on the plate, and who it is cooked for."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label-lux" htmlFor="m-mrp">Menu price (₹)</label>
                  <input
                    id="m-mrp"
                    type="number"
                    min="1"
                    step="1"
                    required
                    className="field"
                    value={draft.mrpRupees}
                    onChange={(e) => setDraft({ ...draft, mrpRupees: e.target.value })}
                    placeholder="100"
                  />
                </div>
                <div>
                  <label className="label-lux" htmlFor="m-target">Batch size (portions)</label>
                  <input
                    id="m-target"
                    type="number"
                    min="1"
                    max="1000"
                    required
                    className="field"
                    value={draft.batchTarget}
                    onChange={(e) => setDraft({ ...draft, batchTarget: e.target.value })}
                    placeholder="40"
                  />
                  <p className="mt-1.5 text-[11.5px] leading-relaxed text-ink-mute">
                    Portions guests fund before you cook this dish for the NGO.
                  </p>
                </div>
              </div>

              {/* the split, previewed live as they type */}
              {Number(draft.mrpRupees) > 0 && (
                <div className="flex items-center justify-between rounded-xl border border-emerald/20 bg-emerald-wash px-4 py-3.5">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.11em] text-ink-mute">
                      Guest pays
                    </p>
                    <p className="numeral mt-1 text-[1.15rem] leading-none text-ink">
                      {formatInr(
                        splitPrice(
                          Math.round(Number(draft.mrpRupees) * 100),
                          CUSTOMER_SHARE_PERCENT
                        ).customerPaysPaise
                      )}
                    </p>
                  </div>
                  <span className="text-ink-faint">+</span>
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.11em] text-ink-mute">You add</p>
                    <p className="numeral mt-1 text-[1.15rem] leading-none text-ink">
                      {formatInr(
                        splitPrice(
                          Math.round(Number(draft.mrpRupees) * 100),
                          CUSTOMER_SHARE_PERCENT
                        ).restaurantPaysPaise
                      )}
                    </p>
                  </div>
                  <span className="text-ink-faint">=</span>
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.11em] text-emerald">Food sent</p>
                    <p className="numeral mt-1 text-[1.3rem] leading-none text-emerald">
                      {formatInr(Math.round(Number(draft.mrpRupees) * 100))}
                    </p>
                  </div>
                </div>
              )}

              <div>
                <label className="label-lux" htmlFor="m-image">Image URL</label>
                <input
                  id="m-image"
                  type="url"
                  className="field"
                  value={draft.image}
                  onChange={(e) => setDraft({ ...draft, image: e.target.value })}
                  placeholder="https://images.unsplash.com/…"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label-lux" htmlFor="m-cat">Category</label>
                  <input
                    id="m-cat"
                    className="field"
                    value={draft.category}
                    onChange={(e) => setDraft({ ...draft, category: e.target.value })}
                    placeholder="Dosa"
                  />
                </div>
                <div>
                  <label className="label-lux" htmlFor="m-serving">Serving size</label>
                  <input
                    id="m-serving"
                    className="field"
                    value={draft.servingSize}
                    onChange={(e) => setDraft({ ...draft, servingSize: e.target.value })}
                    placeholder="Serves 1"
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {(
                  [
                    ['isVeg', 'Vegetarian'],
                    ['isSignature', 'Signature dish'],
                    ['isAvailable', 'Available now'],
                  ] as const
                ).map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setDraft({ ...draft, [key]: !draft[key] })}
                    className={cn(
                      'rounded-full border px-3.5 py-2 text-[12.5px] transition-colors',
                      draft[key]
                        ? 'border-emerald bg-emerald text-paper'
                        : 'border-line bg-surface text-ink-soft'
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-8 flex gap-3">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="btn btn-outline flex-1"
              >
                Cancel
              </button>
              <button type="submit" disabled={saving} className="btn btn-primary flex-1">
                {saving && <Loader2 size={15} className="animate-spin" />}
                {editing ? 'Save changes' : 'Add dish'}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
