import { Reveal } from '@/components/Reveal';

const STEPS = [
  {
    n: '01',
    title: 'Scan the code',
    body: 'Dil Dosa has a DaanSetu code on its tables and counter. One scan opens their donation menu — no app, no sign-up.',
  },
  {
    n: '02',
    title: 'Pick a dish at half price',
    body: 'Not an abstract amount. A real dish from that kitchen, listed at half its menu price.',
  },
  {
    n: '03',
    title: 'The kitchen matches you',
    body: 'Dil Dosa commits the other half. Your ₹50 and their ₹50 become a ₹100 plate of food.',
  },
  {
    n: '04',
    title: 'Follow it out the door',
    body: 'Three checkpoints, each stamped by whoever is responsible. The last one belongs to the NGO, and only they can set it.',
  },
];

export function HowItWorks() {
  return (
    <section id="how" className="relative py-24 md:py-32">
      <div className="container-lux">
        <Reveal className="max-w-2xl">
          <p className="eyebrow">How it works</p>
          <h2 className="display-lg mt-5 text-balance-lux">
            Four steps for you.
            <br />
            <em className="font-normal italic text-ink-mute">Three checkpoints for the food.</em>
          </h2>
        </Reveal>

        <div className="mt-16 grid gap-px overflow-hidden rounded-[22px] border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, i) => (
            <Reveal
              key={step.n}
              delay={i * 90}
              className="group flex flex-col bg-paper p-7 transition-colors duration-500 hover:bg-surface md:p-8"
            >
              <span className="numeral text-[2.4rem] leading-none text-line transition-colors duration-500 group-hover:text-emerald/25">
                {step.n}
              </span>
              <h3 className="display-sm mt-6">{step.title}</h3>
              <p className="mt-3 text-[13.5px] leading-relaxed text-ink-soft">{step.body}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
