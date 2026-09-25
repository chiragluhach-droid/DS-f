"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowRight,
  Building2,
  Check,
  Copy,
  HeartHandshake,
  ExternalLink,
  MapPin,
  AlertTriangle,
} from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { StatusBadge } from "@/components/StatusBadge";
import { Timeline } from "./Timeline";
import { Celebrate } from "./Celebrate";
import { useToast } from "@/components/Toast";
import { formatInr, formatDate, cn, displayDomain } from "@/lib/utils";
import {
  STATUS_META,
  type Donation,
  type DonationEvent,
  type Restaurant,
  type Ngo,
} from "@/lib/types";

export function TrackView({
  donation,
  timeline,
}: {
  donation: Donation;
  timeline: DonationEvent[];
}) {
  const params = useSearchParams();
  const { push } = useToast();
  const [copied, setCopied] = useState(false);
  const celebrate = params.get("celebrate") === "1";

  const restaurant = donation.restaurant as Restaurant;
  const ngo = donation.ngo as Ngo | undefined;
  const flagged =
    donation.discrepancy?.hasDiscrepancy && !donation.discrepancy?.resolvedAt;
  const complete = donation.status === "NGO_CONFIRMED";

  useEffect(() => {
    if (!celebrate) return;
    const t = setTimeout(
      () =>
        push(
          "Thank you for your contribution. Your donation is registered.",
          "success",
        ),
      700,
    );
    return () => clearTimeout(t);
  }, [celebrate, push]);

  const copyId = async () => {
    try {
      await navigator.clipboard.writeText(donation.donationId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      push("Could not copy — select the ID and copy it manually.", "error");
    }
  };

  return (
    <>
      {celebrate && <Celebrate />}
      <SiteHeader />

      <main className="pt-16 md:pt-[74px]">
        {/* ------------------------------------------------- masthead */}
        <section className="grain relative overflow-hidden bg-paper-deep py-10 md:py-16">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-32 -top-32 size-[30rem] rounded-full bg-emerald-wash blur-3xl"
          />
          <div className="container-lux relative">
            <div className="flex flex-wrap items-center gap-3">
              <p className="eyebrow">
                {celebrate ? "Thank you" : "Donation record"}
              </p>
              <StatusBadge status={donation.status} />
            </div>

            <h1 className="display-lg mt-5 max-w-3xl text-balance-lux">
              {celebrate ? (
                <>
                  You sent out{" "}
                  <em className="font-normal italic text-emerald">
                    {formatInr(donation.totalFoodValuePaise)} of food.
                  </em>
                </>
              ) : complete ? (
                <>
                  {donation.totalPortions}{" "}
                  {donation.totalPortions === 1 ? "portion" : "portions"}{" "}
                  <em className="font-normal italic text-emerald">served.</em>
                </>
              ) : (
                <>
                  {donation.totalPortions}{" "}
                  {donation.totalPortions === 1 ? "portion" : "portions"},
                  currently{" "}
                  <em className="font-normal italic text-emerald">
                    {STATUS_META[donation.status].short.toLowerCase()}.
                  </em>
                </>
              )}
            </h1>

            <p className="prose-lux mt-5 max-w-lg">
              {celebrate
                ? "Keep this page. Every step below updates on its own as your food moves through the kitchen and out to the NGO."
                : `Funded at ${restaurant.name} on ${formatDate(donation.createdAt)}. Every checkpoint below was stamped by the person responsible for it.`}
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <button
                onClick={copyId}
                className="group flex items-center gap-2.5 rounded-full border border-line bg-surface px-4 py-2.5 transition-colors hover:border-emerald/40"
              >
                <span className="text-[10.5px] uppercase tracking-[0.12em] text-ink-mute">
                  ID
                </span>
                <span className="numeral text-[15px] tracking-[0.02em] text-ink">
                  {donation.donationId}
                </span>
                {copied ? (
                  <Check size={13} className="text-emerald" strokeWidth={2.4} />
                ) : (
                  <Copy
                    size={13}
                    className="text-ink-mute transition-colors group-hover:text-emerald"
                  />
                )}
              </button>


              {donation.items[0]?.batch?.batchId && (
                <div className="flex flex-col gap-2 rounded-2xl border border-line bg-surface px-5 py-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] font-medium uppercase tracking-[0.08em] text-ink-mute">
                      Batch <span className="font-mono text-ink-soft">{donation.items[0].batch.batchId}</span>
                    </span>
                    <span className="text-[12px] font-medium text-ink-mute">
                      {donation.items[0].batch.collectedQuantity} / {donation.items[0].batch.targetQuantity} funded
                    </span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-line/60">
                    <div
                      className="h-full rounded-full bg-emerald transition-all duration-1000"
                      style={{
                        width: `${Math.min(
                          100,
                          Math.round(
                            (donation.items[0].batch.collectedQuantity /
                              donation.items[0].batch.targetQuantity) *
                              100,
                          ),
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ---------------------------------------------------- journey */}
        <section className="bg-[linear-gradient(to_bottom,var(--color-paper-deep)_0%,var(--color-emerald-wash)_16%,var(--color-emerald-wash)_84%,var(--color-paper)_100%)] py-12 md:py-16">
          <div className="container-lux">
            <div className="max-w-2xl">
              <h2 className="display-sm">The journey</h2>
              <p className="mt-2 text-[13.5px] text-ink-soft">
                Three checkpoints. Each can only be set once, and only by its
                owner.
              </p>
              <div className="mt-9">
                <Timeline
                  status={donation.status}
                  events={timeline}
                  flagged={flagged}
                />
              </div>

              {complete && donation.portionsReceived !== undefined && (
                <div
                  className={cn(
                    "mt-10 rounded-[18px] border p-6",
                    flagged
                      ? "border-amber/30 bg-amber-tint"
                      : "border-emerald/20 bg-emerald-wash",
                  )}
                >
                  <p className="eyebrow">Final count, as recorded by the NGO</p>
                  <div className="mt-4 flex flex-wrap items-baseline gap-x-8 gap-y-3">
                    <div>
                      <p className="numeral text-[2.2rem] leading-none text-emerald">
                        {donation.portionsReceived}
                      </p>
                      <p className="mt-1.5 text-[11.5px] uppercase tracking-[0.1em] text-ink-mute">
                        Portions received
                      </p>
                    </div>
                    <div>
                      <p className="numeral text-[2.2rem] leading-none text-ink-mute">
                        {donation.totalPortions}
                      </p>
                      <p className="mt-1.5 text-[11.5px] uppercase tracking-[0.1em] text-ink-mute">
                        Portions sent
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ------------------------------------------------- flagged */}
        {flagged && (
          <div className="container-lux pt-8">
            <div className="flex gap-4 rounded-[18px] border border-amber/30 bg-amber-tint p-5">
              <AlertTriangle
                size={18}
                className="mt-0.5 shrink-0 text-amber"
                strokeWidth={1.7}
              />
              <div>
                <p className="text-[14px] font-medium text-ink">
                  A shortfall was reported on this donation
                </p>
                <p className="mt-1.5 text-[13px] leading-relaxed text-ink-soft">
                  {donation.discrepancy?.note}
                </p>
                <p className="mt-2.5 text-[12px] text-ink-mute">
                  Our team is reviewing it. We publish these rather than hide
                  them.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------- the split, up front */}
        <section className="container-lux py-8 md:py-10">
          <p className="eyebrow">How this plate was paid for</p>

          <dl className="mt-5 grid grid-cols-3 overflow-hidden rounded-[18px] border border-line bg-surface">
            <div className="border-r border-line p-4 md:p-6">
              <dt className="text-[10px] uppercase tracking-[0.11em] text-ink-mute md:text-[10.5px]">
                {donation.donorSnapshot.isAnonymous ? "Donor paid" : "You paid"}
              </dt>
              <dd className="numeral mt-2.5 text-[1.4rem] leading-none text-ink md:text-[1.75rem]">
                {formatInr(donation.customerPaidPaise)}
              </dd>
            </div>

            <div className="border-r border-line p-4 md:p-6">
              <dt className="text-[10px] uppercase tracking-[0.11em] text-ink-mute md:text-[10.5px]">
                {restaurant.name} matched
              </dt>
              <dd className="numeral mt-2.5 text-[1.4rem] leading-none text-ink md:text-[1.75rem]">
                + {formatInr(donation.restaurantContributionPaise)}
              </dd>
            </div>

            <div className="bg-emerald-wash p-4 md:p-6">
              <dt className="text-[10px] uppercase tracking-[0.11em] text-emerald md:text-[10.5px]">
                Food donated
              </dt>
              <dd className="numeral mt-2.5 text-[1.4rem] leading-none text-emerald md:text-[1.75rem]">
                {formatInr(donation.totalFoodValuePaise)}
              </dd>
              <dd className="mt-1.5 text-[11px] text-ink-mute">
                {donation.totalPortions}{" "}
                {donation.totalPortions === 1 ? "portion" : "portions"}
              </dd>
            </div>
          </dl>
        </section>

        {/* ---------------------------------------------------- details */}
        <section className="container-lux pb-14 md:pb-20">
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            <div className="card-lux overflow-hidden">
              <div className="border-b border-line bg-paper px-5 py-4">
                <p className="eyebrow">What was sent</p>
              </div>
              <ul className="divide-y divide-line-soft px-5">
                {donation.items.map((item) => (
                  <li key={item.menuItem} className="flex gap-3.5 py-4">
                    {item.image && (
                      <div className="relative size-14 shrink-0 overflow-hidden rounded-lg">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          sizes="56px"
                          className="object-cover"
                        />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-[13.5px] font-medium leading-snug text-ink">
                        {item.name}
                      </p>
                      <p className="mt-0.5 text-[12px] text-ink-mute">
                        {item.quantity} × {formatInr(item.mrpPaise)} menu price
                      </p>
                    </div>
                    <p className="numeral shrink-0 text-[14px] text-ink">
                      {formatInr(item.lineFoodValuePaise)}
                    </p>
                  </li>
                ))}
              </ul>
              <div className="flex items-baseline justify-between border-t border-line px-5 py-4">
                <span className="text-[13.5px] font-medium text-ink">
                  You paid
                </span>
                <span className="numeral text-[1.35rem] leading-none text-ink">
                  {formatInr(donation.customerPaidPaise)}
                </span>
              </div>
            </div>

            <div className="card-lux p-5">
              <p className="eyebrow flex items-center gap-2">
                <Building2 size={12} strokeWidth={1.7} />
                Cooked by
              </p>
              <div className="mt-4 flex items-center gap-3.5">
                {restaurant.logoImage && (
                  <div className="relative size-12 shrink-0 overflow-hidden rounded-full border border-line">
                    <Image
                      src={restaurant.logoImage}
                      alt={restaurant.name}
                      fill
                      sizes="48px"
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="min-w-0">
                  <p className="font-display text-[1.05rem] font-medium tracking-[-0.015em]">
                    {restaurant.name}
                  </p>
                  <p className="mt-0.5 flex items-center gap-1 text-[12px] text-ink-mute">
                    <MapPin size={11} strokeWidth={1.6} />
                    {restaurant.address?.city}
                  </p>
                </div>
              </div>
              <Link
                href={`/restaurant/${restaurant.slug}`}
                className="group mt-4 inline-flex items-center gap-1.5 text-[13px] text-emerald"
              >
                Donate here again
                <ArrowRight
                  size={13}
                  className="transition-transform group-hover:translate-x-1"
                />
              </Link>
            </div>

            {ngo && (
              <div className="card-lux p-5">
                <p className="eyebrow flex items-center gap-2">
                  <HeartHandshake size={12} strokeWidth={1.7} />
                  Received by
                </p>
                <div className="mt-4 flex items-center gap-3.5">
                  {ngo.logoImage && (
                    <div className="relative size-12 shrink-0 overflow-hidden rounded-full border border-line">
                      <Image
                        src={ngo.logoImage}
                        alt={ngo.name}
                        fill
                        sizes="48px"
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="font-display text-[1.05rem] font-medium tracking-[-0.015em]">
                      {ngo.name}
                    </p>
                    <p className="mt-0.5 flex items-center gap-1 text-[12px] text-ink-mute">
                      <MapPin size={11} strokeWidth={1.6} />
                      {ngo.address?.city}
                    </p>
                  </div>
                </div>
                {ngo.mission && (
                  <p className="mt-4 line-clamp-3 text-[12.5px] leading-relaxed text-ink-soft">
                    {ngo.mission}
                  </p>
                )}
                {ngo.website && (
                  <a
                    href={ngo.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3.5 inline-flex items-center gap-1 text-[11px] text-ink-mute underline decoration-line underline-offset-2 transition-colors hover:text-emerald hover:decoration-emerald/40"
                  >
                    {displayDomain(ngo.website)}
                    <ExternalLink size={10} strokeWidth={1.8} />
                  </a>
                )}
              </div>
            )}

            {donation.donorSnapshot.message && (
              <div className="rounded-[18px] border border-line bg-paper-warm p-5">
                <p className="eyebrow">Your note</p>
                <p className="mt-3 font-display text-[1.05rem] italic leading-relaxed text-ink">
                  &ldquo;{donation.donorSnapshot.message}&rdquo;
                </p>
                <p className="mt-3 text-[12px] text-ink-mute">
                  —{" "}
                  {donation.donorSnapshot.isAnonymous
                    ? "Anonymous"
                    : donation.donorSnapshot.name}
                </p>
              </div>
            )}
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
