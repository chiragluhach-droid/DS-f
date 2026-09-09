'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Loader2, Download, Copy, Check, Printer } from 'lucide-react';
import { get } from '@/lib/api';
import { useToast } from '@/components/Toast';
import { PageHeading } from '@/components/dashboard/DashboardShell';

interface QrData {
  url: string;
  qrToken: string;
  dataUrl: string;
  restaurantName: string;
}

export default function QrPage() {
  const { push } = useToast();
  const [data, setData] = useState<QrData | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    void get<QrData>('/restaurants/me/qr')
      .then(setData)
      .catch(() => setData(null));
  }, []);

  const copy = async () => {
    if (!data) return;
    try {
      await navigator.clipboard.writeText(data.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      push('Could not copy the link.', 'error');
    }
  };

  const download = () => {
    if (!data) return;
    const a = document.createElement('a');
    a.href = data.dataUrl;
    a.download = `daansetu-qr-${data.restaurantName.toLowerCase().replace(/\s+/g, '-')}.png`;
    a.click();
  };

  if (!data) {
    return (
      <div className="flex min-h-[50dvh] items-center justify-center">
        <Loader2 className="size-5 animate-spin text-ink-mute" />
      </div>
    );
  }

  return (
    <>
      <PageHeading
        eyebrow="QR code"
        title="Put this on your tables"
        description="One scan opens your donation menu. No app, no sign-up — guests can give before the bill arrives."
      />

      <div className="grid gap-6 lg:grid-cols-[26rem_1fr]">
        {/* the printable card */}
        <div className="rounded-[18px] border border-line bg-surface p-6">
          <div
            id="qr-card"
            className="mx-auto w-full max-w-[19rem] rounded-[20px] border border-line bg-paper p-7 text-center"
          >
            <p className="eyebrow">Feed someone tonight</p>
            <h2 className="display-sm mt-3 leading-tight">{data.restaurantName}</h2>

            <div className="mx-auto mt-6 aspect-square w-full max-w-[13rem] overflow-hidden rounded-2xl border border-line bg-surface p-3">
              <div className="relative size-full">
                <Image
                  src={data.dataUrl}
                  alt={`Donation QR code for ${data.restaurantName}`}
                  fill
                  unoptimized
                  className="object-contain"
                />
              </div>
            </div>

            <p className="mt-6 text-[12.5px] leading-relaxed text-ink-soft">
              Scan to fund a dish at half price. We match the other half, and you can follow it all
              the way to the person who receives it.
            </p>
            <p className="mt-4 font-display text-[15px] italic text-emerald">daansetu.in</p>
          </div>

          <div className="mt-6 flex gap-3">
            <button onClick={download} className="btn btn-primary flex-1 py-2.5 text-[13px]">
              <Download size={14} />
              Download PNG
            </button>
            <button onClick={() => window.print()} className="btn btn-outline py-2.5 text-[13px]">
              <Printer size={14} />
              Print
            </button>
          </div>
        </div>

        {/* details */}
        <div className="space-y-4">
          <div className="rounded-[18px] border border-line bg-surface p-6">
            <p className="eyebrow">Where it points</p>
            <button
              onClick={copy}
              className="group mt-4 flex w-full items-center justify-between gap-4 rounded-xl border border-line bg-paper px-4 py-3.5 text-left transition-colors hover:border-emerald/40"
            >
              <span className="truncate text-[13.5px] text-ink">{data.url}</span>
              {copied ? (
                <Check size={15} className="shrink-0 text-emerald" strokeWidth={2.4} />
              ) : (
                <Copy size={15} className="shrink-0 text-ink-mute group-hover:text-emerald" />
              )}
            </button>
            <p className="mt-3 text-[12.5px] leading-relaxed text-ink-mute">
              This link never changes, so printed codes stay valid even if you rename plates or
              update prices.
            </p>
          </div>

          <div className="rounded-[18px] border border-line bg-surface p-6">
            <p className="eyebrow">Where to place it</p>
            <ul className="mt-4 space-y-3.5">
              {[
                ['On the table tent', 'Guests decide while they wait for the bill — this converts best.'],
                ['On the bill folder', 'A second prompt at the moment people are already paying.'],
                ['At the counter', 'For takeaway and delivery pickups.'],
                ['On your receipts', 'Print the link; it works without the code.'],
              ].map(([title, body]) => (
                <li key={title} className="flex gap-3.5">
                  <span className="mt-2 size-1 shrink-0 rounded-full bg-emerald" />
                  <div>
                    <p className="text-[13.5px] font-medium text-ink">{title}</p>
                    <p className="mt-0.5 text-[12.5px] leading-relaxed text-ink-soft">{body}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #qr-card,
          #qr-card * {
            visibility: visible;
          }
          #qr-card {
            position: absolute;
            left: 50%;
            top: 4rem;
            transform: translateX(-50%);
            width: 20rem;
          }
        }
      `}</style>
    </>
  );
}
