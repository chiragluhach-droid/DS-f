'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Lock, Loader2, ShieldCheck, HandHeart } from 'lucide-react';
import { Logo } from '@/components/Logo';
import { useToast } from '@/components/Toast';
import { useAuth } from '@/lib/auth-context';
import { post, ApiError } from '@/lib/api';
import { readCart, clearCart, cartTotals, type CartLine } from '@/lib/cart';
import { loadRazorpay } from '@/lib/razorpay';
import { formatInr, cn } from '@/lib/utils';
import { splitPrice, type MenuItem, type Restaurant, type Ngo, type Donation } from '@/lib/types';

interface Props {
  restaurant: Restaurant;
  items: MenuItem[];
  ngo: Ngo | null;
}

interface OrderResponse {
  mode: 'razorpay' | 'mock';
  orderId: string;
  amountPaise: number;
  currency: string;
  keyId: string | null;
  donationId: string;
}

export function CheckoutView({ restaurant, items, ngo }: Props) {
  const router = useRouter();
  const { push } = useToast();
  const { user } = useAuth();

  const [lines, setLines] = useState<CartLine[] | null>(null);
  const [form, setForm] = useState({ name: '', phone: '', message: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [nudge, setNudge] = useState(false);
  const phoneRef = useRef<HTMLInputElement>(null);
  const phoneWrapRef = useRef<HTMLDivElement>(null);
  const [submitting, setSubmitting] = useState(false);
  const [stage, setStage] = useState<'idle' | 'creating' | 'paying' | 'verifying'>('idle');

  // Rebuild the cart against server-fresh dishes so prices are never stale.
  useEffect(() => {
    const stored = readCart();
    if (!stored || stored.restaurantSlug !== restaurant.slug) {
      setLines([]);
      return;
    }
    const byId = new Map(items.map((i) => [i._id, i]));
    setLines(
      stored.lines
        .map((l) => {
          const item = byId.get(l.menuItemId);
          return item ? { item, quantity: l.quantity } : null;
        })
        .filter((l): l is CartLine => l !== null)
    );
  }, [restaurant.slug, items]);

  useEffect(() => {
    if (user) {
      setForm((f) => ({
        ...f,
        name: f.name || user.name,
        phone: f.phone || user.phone || '',
      }));
    }
  }, [user]);

  const totals = useMemo(() => cartTotals(lines ?? []), [lines]);

  const validate = () => {
    const next: Record<string, string> = {};
    if (!/^(\+91)?[6-9]\d{9}$/.test(form.phone.replace(/[\s-]/g, ''))) {
      next.phone = form.phone
        ? 'Enter a valid 10-digit mobile number'
        : 'We need your number to send your tracking link';
    }
    setErrors(next);

    // Send the guest straight to the field rather than leaving them to hunt
    // for why the button did nothing.
    if (next.phone) {
      phoneWrapRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      phoneRef.current?.focus({ preventScroll: true });
      setNudge(true);
      window.setTimeout(() => setNudge(false), 1400);
    }

    return Object.keys(next).length === 0;
  };

  const finish = (donationId: string) => {
    clearCart();
    router.push(`/track/${donationId}?celebrate=1`);
  };

  const handlePay = async () => {
    if (!lines || lines.length === 0 || !validate()) return;

    setSubmitting(true);
    try {
      setStage('creating');
      const created = await post<{ donation: Donation }>('/donations', {
        restaurantSlug: restaurant.slug,
        items: lines.map((l) => ({ menuItemId: l.item._id, quantity: l.quantity })),
        donor: {
          name: form.name.trim(),
          phone: form.phone.trim(),
          message: form.message.trim(),
        },
      });

      const donationId = created.donation.donationId;
      const order = await post<OrderResponse>('/payments/order', { donationId });

      // Bypass Razorpay entirely for now per user request
      setStage('paying');
      await new Promise((r) => setTimeout(r, 900));
      setStage('verifying');
      await post('/payments/verify', {
        donationId,
        razorpayOrderId: order.orderId || `order_mock_${Date.now()}`,
        razorpayPaymentId: `pay_mock_${Date.now()}`,
        razorpaySignature: 'mock_signature',
      });
      finish(donationId);
      return;


    } catch (err) {
      push(err instanceof Error ? err.message : 'Something went wrong.', 'error');
      setSubmitting(false);
      setStage('idle');
    }
  };

  if (lines === null) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <Loader2 className="size-5 animate-spin text-ink-mute" />
      </div>
    );
  }

  if (lines.length === 0) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
        <Logo />
        <h1 className="display-md mt-10">Your selection expired</h1>
        <p className="prose-lux mt-4 max-w-sm">
          Nothing is held in the cart right now. Pick a dish again — it only takes a moment.
        </p>
        <Link href={`/restaurant/${restaurant.slug}`} className="btn btn-primary mt-8">
          Back to the menu
        </Link>
      </div>
    );
  }

  const stageLabel = {
    idle: 'Pay securely',
    creating: 'Creating your donation…',
    paying: 'Opening payment…',
    verifying: 'Verifying payment…',
  }[stage];

  const payButton = (
    <>
      <button onClick={handlePay} disabled={submitting} className="btn btn-primary w-full">
        {submitting ? (
          <Loader2 size={15} className="animate-spin" />
        ) : (
          <Lock size={14} strokeWidth={1.8} />
        )}
        {submitting ? stageLabel : `Pay ${formatInr(totals.customerPaise)}`}
      </button>
      <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-[11.5px] text-ink-mute">
        <ShieldCheck size={12} strokeWidth={1.6} className="shrink-0" />
        Sends {formatInr(totals.foodValuePaise)} of food · verified before it is recorded
      </p>
    </>
  );

  return (
    <div className="min-h-dvh bg-paper-deep">
      <main className="container-lux pt-4 pb-44 md:pt-7 lg:pb-14">
        <div className="mx-auto max-w-5xl">
          {/* back on the left, the mark on the right — reassurance on a payment screen */}
          <div className="flex items-center justify-between gap-4">
            <Link
              href={`/restaurant/${restaurant.slug}`}
              className="group inline-flex items-center gap-2 text-[10.5px] uppercase tracking-[0.14em] text-ink-mute transition-colors hover:text-emerald"
            >
              <span className="flex size-6 items-center justify-center rounded-full border border-line bg-surface transition-colors group-hover:border-emerald/40">
                <ArrowLeft size={11} strokeWidth={2} />
              </span>
              Back
            </Link>

            <Logo />
          </div>

          <div className="max-w-lg">
            <h1 className="display-md mt-6">Almost there.</h1>
            <p className="mt-3 text-[14.5px] leading-relaxed text-ink-soft">
              Please provide your number so we can send your donation ID and tracking link, to
              ensure full transparency.
            </p>

            {/* The one thing we actually need — kept out of the optional card. */}
            <div className="mt-8">
              <label className="label-lux" htmlFor="donor-phone">
                Mobile number <span className="text-danger" aria-hidden>*</span>
              </label>
              <div
                ref={phoneWrapRef}
                className={cn(
                  'flex items-center rounded-xl border bg-surface transition-colors focus-within:border-emerald',
                  errors.phone ? 'border-danger' : 'border-line',
                  nudge && 'attention'
                )}
              >
                <span className="numeral pl-4 pr-2.5 text-[15px] text-ink-mute">+91</span>
                <span className="h-5 w-px bg-line" aria-hidden />
                <input
                  id="donor-phone"
                  ref={phoneRef}
                  type="tel"
                  required
                  aria-required="true"
                  aria-invalid={Boolean(errors.phone)}
                  inputMode="numeric"
                  autoComplete="tel-national"
                  maxLength={10}
                  className="numeral w-full bg-transparent px-3.5 py-3.5 text-[15px] tracking-[0.04em] text-ink outline-none placeholder:tracking-normal placeholder:text-ink-faint"
                  value={form.phone}
                  onChange={(e) => {
                    setForm({ ...form, phone: e.target.value.replace(/\D/g, '') });
                    if (errors.phone) setErrors({});
                  }}
                  placeholder="98200 00000"
                />
              </div>
              {errors.phone && <p className="mt-1.5 text-[12px] text-danger">{errors.phone}</p>}
            </div>
          </div>

          <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_25rem] lg:gap-12">
            {/* ------------------------------------------------- optional */}
            <div className="order-2 lg:order-1">
              <div className="card-lux p-6 md:p-8">
                <h2 className="display-sm">Anything else?</h2>
                <p className="mt-2 text-[13px] leading-relaxed text-ink-soft">
                  Both optional. Leave the name blank to give anonymously.
                </p>

                <div className="mt-6 space-y-5">
                  <div>
                    <label className="label-lux" htmlFor="donor-name">
                      Name <span className="normal-case tracking-normal">(optional)</span>
                    </label>
                    <input
                      id="donor-name"
                      className="field"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="Ananya Rao"
                      autoComplete="name"
                    />
                  </div>

                  <div>
                    <label className="label-lux" htmlFor="donor-message">
                      Add a note <span className="normal-case tracking-normal">(optional)</span>
                    </label>
                    <textarea
                      id="donor-message"
                      rows={2}
                      maxLength={400}
                      className="field resize-none"
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      placeholder="For Amma, on her 70th birthday…"
                    />
                  </div>
                </div>
              </div>
            </div>

            <aside className="order-1 lg:order-2">
              <div className="card-lux overflow-hidden lg:sticky lg:top-8">
                <div className="border-b border-line bg-paper px-6 py-5">
                  <p className="eyebrow">Your donation</p>
                  <h2 className="display-sm mt-2">{restaurant.name}</h2>
                </div>

                <ul className="divide-y divide-line-soft px-6">
                  {lines.map(({ item, quantity }) => {
                    const { customerPaysPaise } = splitPrice(
                      item.mrpPaise,
                      item.customerSharePercent
                    );
                    return (
                      <li key={item._id} className="flex gap-3.5 py-4">
                        {item.image && (
                          <div className="relative size-14 shrink-0 overflow-hidden rounded-lg">
                            <Image src={item.image} alt={item.name} fill sizes="56px" className="object-cover" />
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="text-[13.5px] font-medium leading-snug text-ink">
                            {item.name}
                          </p>
                          <p className="mt-0.5 text-[12px] text-ink-mute">
                            {quantity} × {formatInr(customerPaysPaise)}
                            <span className="text-ink-faint"> of {formatInr(item.mrpPaise)}</span>
                          </p>
                        </div>
                        <p className="numeral shrink-0 text-[14px] text-ink">
                          {formatInr(customerPaysPaise * quantity)}
                        </p>
                      </li>
                    );
                  })}
                </ul>

                {/* The charged amount is the only enlarged figure — everything
                    above it is context, not something the guest is paying. */}
                <div className="space-y-2.5 border-t border-line px-6 py-5 text-[13.5px]">
                  <div className="flex justify-between text-ink-soft">
                    <span>{restaurant.name} matches</span>
                    <span className="numeral text-emerald">
                      + {formatInr(totals.restaurantPaise)}
                    </span>
                  </div>
                  <div className="flex justify-between text-ink-soft">
                    <span>Platform fee</span>
                    <span className="text-emerald">Nil</span>
                  </div>
                  <div className="flex justify-between text-ink-soft">
                    <span>Food sent out</span>
                    <span className="numeral text-emerald">
                      {formatInr(totals.foodValuePaise)}
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between border-t border-line pt-3">
                    <span className="text-[14px] font-medium text-ink">You pay</span>
                    <span className="numeral text-[1.6rem] leading-none text-ink">
                      {formatInr(totals.customerPaise)}
                    </span>
                  </div>
                </div>

                <div className="bg-emerald-wash px-6 py-4">
                  <p className="flex items-center gap-2 text-[13px] font-medium text-emerald">
                    <HandHeart size={14} strokeWidth={1.7} />
                    {totals.portions} {totals.portions === 1 ? 'portion' : 'portions'} of food
                  </p>
                  {ngo && (
                    <p className="mt-1.5 text-[12px] leading-relaxed text-ink-soft">
                      Handed to {ngo.name}, {ngo.address.city} — and confirmed by them.
                    </p>
                  )}
                </div>

                <div className="hidden border-t border-line p-6 lg:block">{payButton}</div>
              </div>
            </aside>
          </div>
        </div>
      </main>

      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-line bg-paper/95 backdrop-blur-xl lg:hidden">
        <div className="container-lux py-3.5 pb-safe">{payButton}</div>
      </div>
    </div>
  );
}
