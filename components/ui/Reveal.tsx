'use client';

import { useEffect, useRef, type ElementType, type ReactNode } from 'react';

interface RevealProps {
  children: ReactNode;
  /** Animation direction. */
  variant?: 'up' | 'scale' | 'left' | 'right';
  /** Stagger delay in ms. */
  delay?: number;
  /** Element to render. */
  as?: ElementType;
  className?: string;
}

/**
 * Reveals its children with a fade + slide once they scroll into view.
 * Uses IntersectionObserver and toggles the `is-visible` class defined in globals.css.
 * Falls back to visible immediately when reduced motion is preferred.
 */
export default function Reveal({ children, variant = 'up', delay = 0, as, className = '' }: RevealProps) {
  const Tag = (as ?? 'div') as ElementType;
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) {
      el.classList.add('is-visible');
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            el.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      ref={ref}
      data-reveal={variant === 'up' ? '' : variant}
      style={{ transitionDelay: `${delay}ms` }}
      className={className}
    >
      {children}
    </Tag>
  );
}
