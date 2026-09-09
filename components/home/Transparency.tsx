import { Reveal } from '@/components/Reveal';
import { DONATION_STATUSES, STATUS_META, STATUS_ACTOR_LABEL } from '@/lib/types';

export function Transparency() {
  return (
    <section id="transparency" className="relative overflow-hidden bg-emerald-deep py-24 text-paper md:py-32">
      <div
        aria-hidden
        className="pointer-events-none absolute -left-52 top-1/3 size-[36rem] rounded-full bg-emerald-mid/12 blur-3xl"
      />

      <div className="container-lux relative">
        <div className="grid gap-16 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
          <Reveal>
            <p className="eyebrow text-paper/40">The transparency promise</p>
            <h2 className="display-lg mt-5 text-paper text-balance-lux">
              A donation nobody can
              <em className="font-normal italic text-emerald-mid"> quietly lose.</em>
            </h2>
            <p className="mt-7 max-w-md text-[15px] leading-relaxed text-paper/60">
              Status can only move forward, one step at a time, and each step is signed by the role
              that owns it. A restaurant cannot mark its own donation as received. Only the NGO
              closes the loop — and if the count they enter is short, the platform flags it for
              review rather than hiding it.
            </p>

            <div className="mt-10 space-y-5 border-t border-paper/12 pt-8">
              {[
                ['No back-dating', 'Events are append-only. Nothing is edited after the fact.'],
                ['No skipped steps', 'The lifecycle is enforced server-side, not in the browser.'],
                ['No silent shortfalls', 'A mismatch between portions sent and received raises a flag.'],
              ].map(([title, body]) => (
                <div key={title} className="flex gap-4">
                  <span className="mt-2 size-1 shrink-0 rounded-full bg-emerald-mid" />
                  <div>
                    <p className="text-[14px] font-medium text-paper">{title}</p>
                    <p className="mt-1 text-[13px] leading-relaxed text-paper/50">{body}</p>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>

          <Reveal delay={140}>
            <ol className="relative">
              <span
                aria-hidden
                className="absolute bottom-6 left-[13px] top-3 w-px origin-top bg-gradient-to-b from-emerald-mid via-emerald-mid/40 to-transparent"
              />
              {DONATION_STATUSES.map((status, i) => (
                <li key={status} className="relative flex gap-6 pb-9 last:pb-0">
                  <span className="relative z-10 mt-1 flex size-[27px] shrink-0 items-center justify-center rounded-full border border-paper/20 bg-emerald-deep">
                    <span className="numeral text-[11px] text-paper/60">{i + 1}</span>
                  </span>
                  <div className="pt-0.5">
                    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                      <h3 className="font-display text-[1.3rem] font-normal tracking-[-0.02em] text-paper">
                        {STATUS_META[status].label}
                      </h3>
                      <span className="text-[10.5px] uppercase tracking-[0.14em] text-emerald-mid">
                        {STATUS_ACTOR_LABEL[status]}
                      </span>
                    </div>
                    <p className="mt-1.5 max-w-sm text-[13.5px] leading-relaxed text-paper/50">
                      {STATUS_META[status].blurb}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
