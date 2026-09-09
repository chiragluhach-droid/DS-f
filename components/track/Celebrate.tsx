'use client';

import { useEffect, useState } from 'react';

const SEEDS = Array.from({ length: 26 }, (_, i) => ({
  left: (i * 37) % 100,
  delay: (i % 9) * 0.16,
  duration: 3.1 + ((i * 7) % 18) / 10,
  size: 4 + (i % 4) * 2,
  color: ['#0d4b38', '#1a7a5a', '#b08d4f', '#e9f1eb'][i % 4],
  rotate: (i * 53) % 360,
}));

/** A restrained one-shot confetti for the moment a donation lands. */
export function Celebrate() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setVisible(false), 6500);
    return () => clearTimeout(t);
  }, []);

  if (!visible) return null;

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[60] overflow-hidden">
      {SEEDS.map((s, i) => (
        <span
          key={i}
          className="absolute top-[-6%]"
          style={{
            left: `${s.left}%`,
            width: s.size,
            height: s.size * 1.8,
            background: s.color,
            borderRadius: 1,
            transform: `rotate(${s.rotate}deg)`,
            animation: `confetti-fall ${s.duration}s cubic-bezier(0.3,0.1,0.4,1) ${s.delay}s forwards`,
          }}
        />
      ))}
      <style>{`
        @keyframes confetti-fall {
          0%   { transform: translateY(0) rotate(0deg); opacity: 0; }
          8%   { opacity: 0.9; }
          100% { transform: translateY(108vh) rotate(560deg); opacity: 0; }
        }
        @media (prefers-reduced-motion: reduce) {
          [aria-hidden] > span { animation: none !important; opacity: 0 !important; }
        }
      `}</style>
    </div>
  );
}
