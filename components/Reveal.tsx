'use client';

import { useEffect, useRef, useState, type ElementType } from 'react';
import { cn } from '@/lib/utils';

/** Fades and lifts a block into place the first time it enters the viewport. */
export function Reveal({
  children,
  delay = 0,
  className,
  as: Tag = 'div',
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  as?: ElementType;
}) {
  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -60px 0px' }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={cn(
        'transition-all duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)]',
        visible ? 'translate-y-0 opacity-100' : 'translate-y-5 opacity-0',
        className
      )}
    >
      {children}
    </Tag>
  );
}
