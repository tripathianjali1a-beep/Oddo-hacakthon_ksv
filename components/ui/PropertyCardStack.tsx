'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';

export interface StackItem {
  id: number;
  title: string;
  location: string;
  price: number;
  rating: number;
  tag?: string;
  img: string;
}

interface Props {
  items: StackItem[];
  /** Auto-advance interval in ms. */
  interval?: number;
}

/**
 * A Hotstar-style stacked property carousel. Cards sit behind one another with
 * depth (offset + scale + fade); the front card auto-advances by sliding up and
 * fading out while the rest promote forward. Pauses on hover, respects reduced
 * motion, and supports manual selection via the progress dots.
 */
export default function PropertyCardStack({ items, interval = 3800 }: Props) {
  const n = items.length;
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const reduceRef = useRef(false);

  const advance = useCallback(() => setActive((a) => (a + 1) % n), [n]);

  useEffect(() => {
    reduceRef.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  useEffect(() => {
    if (paused || reduceRef.current || n <= 1) return;
    const id = setInterval(advance, interval);
    return () => clearInterval(id);
  }, [paused, advance, interval, n]);

  // Visual style for a card at stack position p (0 = front).
  // Back cards peek UP behind the front card so only their top edges show.
  const styleFor = (p: number): React.CSSProperties => {
    // Exit slot: the card that just left the front slides up and fades away.
    if (p === n - 1 && n > 3) {
      return { transform: 'translateY(-92px) scale(1.05)', opacity: 0, zIndex: 0 };
    }
    switch (p) {
      case 0:
        return { transform: 'translateY(0) scale(1)', opacity: 1, zIndex: 30 };
      case 1:
        return { transform: 'translateY(-16px) scale(0.95)', opacity: 0.55, zIndex: 20 };
      case 2:
        return { transform: 'translateY(-30px) scale(0.90)', opacity: 0.3, zIndex: 10 };
      default:
        // Parked behind, invisible, ready to fade into position 2.
        return { transform: 'translateY(-30px) scale(0.90)', opacity: 0, zIndex: 5 };
    }
  };

  return (
    <div
      className="relative w-[340px] h-[420px]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {items.map((item, i) => {
        const p = (i - active + n) % n;
        const isFront = p === 0;
        return (
          <div
            key={item.id}
            className="absolute inset-x-0 top-2 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 p-5 shadow-2xl transition-all duration-[700ms] ease-[cubic-bezier(0.16,1,0.3,1)]"
            style={{ ...styleFor(p), pointerEvents: isFront ? 'auto' : 'none' }}
            aria-hidden={!isFront}
          >
            <div className="relative h-44 rounded-xl overflow-hidden mb-4">
              <img src={item.img} alt={item.title} className="w-full h-full object-cover" />
              {/* Badges only on the front card to avoid stacked duplicates */}
              {isFront && item.tag && <span className="absolute top-3 left-3 badge-amber text-[10px]">{item.tag}</span>}
              {isFront && item.rating > 0 && (
                <div className="absolute top-3 right-3 bg-white/95 backdrop-blur px-2.5 py-1 rounded-full flex items-center gap-1">
<<<<<<< HEAD
                  <span className="material-symbols-outlined shrink-0 text-amber" style={{ fontSize: '13px', fontVariationSettings: "'FILL' 1" }}>star</span>
=======
                  <span className="material-symbols-outlined text-amber" style={{ fontSize: '13px', fontVariationSettings: "'FILL' 1" }}>star</span>
>>>>>>> 6a5d09f717306f85784045d827ad2e941e4ade94
                  <span className="text-navy text-xs font-semibold">{item.rating}</span>
                </div>
              )}
            </div>
            {/* Text is shown for the front card only so back cards never show competing prices */}
            <div
              className="transition-opacity duration-300"
              style={{ opacity: isFront ? 1 : 0 }}
              aria-hidden={!isFront}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-white font-semibold text-sm truncate">{item.title}</p>
                  <p className="text-white/50 text-xs flex items-center gap-1 mt-0.5">
<<<<<<< HEAD
                    <span className="material-symbols-outlined shrink-0" style={{ fontSize: '14px' }}>location_on</span>
=======
                    <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>location_on</span>
>>>>>>> 6a5d09f717306f85784045d827ad2e941e4ade94
                    {item.location}
                  </p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
                <p className="text-white font-bold text-lg font-currency">
                  ${item.price}
                  <span className="text-white/40 text-xs font-normal">/day</span>
                </p>
                <Link href={`/browse/${item.id}`} className="text-amber text-xs font-semibold link-grow" tabIndex={isFront ? 0 : -1}>
                  View details
                </Link>
              </div>
            </div>
          </div>
        );
      })}

      {/* Progress dots */}
      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-40">
        {items.map((item, i) => (
          <button
            key={item.id}
            onClick={() => setActive(i)}
            aria-label={`Show ${item.title}`}
            className="h-1.5 rounded-full transition-all duration-300"
            style={{
              width: i === active ? 22 : 6,
              backgroundColor: i === active ? '#D97706' : 'rgba(255,255,255,0.35)',
            }}
          />
        ))}
      </div>
    </div>
  );
}
