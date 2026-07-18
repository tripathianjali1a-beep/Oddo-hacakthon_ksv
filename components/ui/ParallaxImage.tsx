'use client';

import { useEffect, useRef, useState } from 'react';

interface ParallaxImageProps {
  src: string;
  alt: string;
  /** How strongly the image moves relative to scroll. 0.3 = subtle, 0.6 = strong. */
  speed?: number;
  /** When true the component absolutely fills its nearest positioned parent (use for backdrops). */
  fill?: boolean;
  className?: string;
}

/**
 * A scroll-driven parallax image. The image is rendered slightly taller than its
 * container and translated on the Y axis as the container passes through the
 * viewport, creating a depth effect. Respects `prefers-reduced-motion`.
 *
 * Use `fill` to make it an absolute backdrop inside a `relative` parent.
 */
export default function ParallaxImage({ src, alt, speed = 0.35, fill = false, className = '' }: ParallaxImageProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const viewportCenter = window.innerHeight / 2;
      const elementCenter = rect.top + rect.height / 2;
      const delta = viewportCenter - elementCenter;
      setOffset(delta * speed);
    };

    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [speed]);

  return (
    <div
      ref={containerRef}
      className={`overflow-hidden ${fill ? 'absolute inset-0' : 'relative'} ${className}`}
    >
      <img
        src={src}
        alt={alt}
        // Oversize so the translated edges never reveal the background.
        className="absolute inset-0 w-full h-[130%] -top-[15%] object-cover will-change-transform"
        style={{ transform: `translate3d(0, ${offset}px, 0)` }}
      />
    </div>
  );
}
