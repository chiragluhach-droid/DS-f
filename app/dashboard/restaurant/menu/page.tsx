'use client';

import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import { Loader2, Plus, Pencil, Trash2, UtensilsCrossed, X } from 'lucide-react';
import { get, post, patch, del, ApiError } from '@/lib/api';
import { useToast } from '@/components/Toast';
import { PageHeading, EmptyState } from '@/components/dashboard/DashboardShell';
import { formatInr, cn } from '@/lib/utils';
import { splitPrice, type MenuItem } from '@/lib/types';

const BLANK = {
  name: '',
  description: '',
  mrpRupees: '',
  customerSharePercent: '50',
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
  customerSharePercent: String(item.customerSharePercent),
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
  const [editing, setEditing] = useState<MenuItem | null>(null);
  const [draft, setDraft] = useState<Draft>(BLANK);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await get<{ items: MenuItem[] }>('/menu/me');
      setItems(data.items);
    } catch {
      setItems([]);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

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
      customerSharePercent: Number(draft.customerSharePercent) || 50,
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

  const toggleAvailable = async (item: MenuItem) => {
    try {
      await patch(`/menu/me/items/${item._id}`, { isAvailable: !item.isAvailable });
      await load();
    } catch (err) {
      push(err instanceof ApiError ? err.message : 'Could not update availability.', 'error');
    }
  };

  return (
    <>
      <PageHeading
        eyebrow="Donation menu"
        title="What guests can fund"
        description="These are the dishes shown when someone scans your code. Guests pay their share; you commit the rest."
        action={
          <button onClick={openNew} className="btn btn-primary py-2.5 text-[13px]">
            <Plus size={15} />
            Add a dish
          </button>
        }
      />

      {items === null ? (
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
                    onClick={() => toggleAvailable(item)}
                    className={cn(
                      'rounded-full border px-3 py-1.5 text-[11.5px] transition-colors',
                      item.isAvailable
                        ? 'border-emerald/25 bg-emerald-wash text-emerald'
                        : 'border-line bg-paper text-ink-mute'
                    )}
                  >
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
                  <label className="label-lux" htmlFor="m-share">Guest pays (%)</label>
                  <input
                    id="m-share"
                    type="number"
                    min="1"
                    max="100"
                    required
                    className="field"
                    value={draft.customerSharePercent}
                    onChange={(e) => setDraft({ ...draft, customerSharePercent: e.target.value })}
                  />
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
                          Number(draft.customerSharePercent) || 50
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
                          Number(draft.customerSharePercent) || 50
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
