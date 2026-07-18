'use client';
import Link from 'next/link';
import { useState } from 'react';
import ParallaxImage from '@/components/ui/ParallaxImage';
import Reveal from '@/components/ui/Reveal';
import CountUp from '@/components/ui/CountUp';
import PropertyCardStack from '@/components/ui/PropertyCardStack';

const properties = [
  {
    id: 1,
    title: 'Azure Skyline Penthouse',
    location: 'Downtown District',
    price: 450,
    rating: 4.9,
    beds: 2,
    baths: 2,
    status: 'available',
    tag: 'Featured',
    img: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80',
  },
  {
    id: 2,
    title: 'Villa Paradiso',
    location: 'Coastal Cliffs',
    price: 850,
    rating: 5.0,
    beds: 4,
    baths: 3,
    status: 'available',
    tag: 'Luxury',
    img: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&q=80',
  },
  {
    id: 3,
    title: 'Urban Industrial Loft',
    location: 'Arts District',
    price: 320,
    rating: 4.7,
    beds: 1,
    baths: 1,
    status: 'available',
    tag: 'New',
    img: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80',
  },
  {
    id: 4,
    title: 'Timberline Retreat',
    location: 'Alpine Valley',
    price: 550,
    rating: 4.8,
    beds: 3,
    baths: 2,
    status: 'available',
    tag: 'Popular',
    img: 'https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=800&q=80',
  },
  {
    id: 5,
    title: 'Harbour View Suite',
    location: 'Marina Bay',
    price: 720,
    rating: 4.7,
    beds: 2,
    baths: 2,
    status: 'available',
    tag: 'Waterfront',
    img: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80',
  },
  {
    id: 6,
    title: 'Garden Cottage',
    location: 'Hillside Park',
    price: 280,
    rating: 4.6,
    beds: 1,
    baths: 1,
    status: 'available',
    tag: '',
    img: 'https://images.unsplash.com/photo-1449844908441-8829872d2607?w=800&q=80',
  },
];

const categories = [
  { name: 'Luxury Villas', icon: 'villa', img: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=500&q=80' },
  { name: 'Penthouses', icon: 'apartment', img: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=500&q=80' },
  { name: 'Corporate', icon: 'business', img: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=500&q=80' },
  { name: 'Cabins', icon: 'cabin', img: 'https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?w=500&q=80' },
  { name: 'Waterfront', icon: 'sailing', img: 'https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=500&q=80' },
];

const features = [
  { icon: 'verified', title: 'Verified Listings', desc: 'Every property is inspected and certified by our team before it goes live.' },
  { icon: 'bolt', title: 'Instant Booking', desc: 'Reserve in seconds with real-time availability and secure checkout.' },
  { icon: 'shield_lock', title: 'Protected Payments', desc: 'Bank-grade encryption and full refund protection on every stay.' },
  { icon: 'support_agent', title: '24/7 Concierge', desc: 'A dedicated team is one tap away, any time of day, anywhere you are.' },
];

const marqueeItems = ['New York', 'Dubai', 'Paris', 'Tokyo', 'London', 'Singapore', 'Sydney', 'Los Angeles'];

export default function HomePage() {
  const [favorites, setFavorites] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCat, setActiveCat] = useState('All');

  const toggleFavorite = (id: number) => {
    setFavorites((prev) => (prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]));
  };

  const filtered = properties.filter((p) => {
    const q = searchQuery.toLowerCase();
    return p.title.toLowerCase().includes(q) || p.location.toLowerCase().includes(q);
  });

  return (
    <div className="overflow-x-hidden">
      {/* ══════════════ HERO ══════════════ */}
      <section className="relative min-h-[92vh] flex items-center overflow-hidden bg-navy">
        {/* Parallax backdrop */}
        <ParallaxImage
          src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1600&q=80"
          alt="Luxury interior"
          speed={0.3}
          fill
        />
        {/* Overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-navy via-navy/85 to-navy/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-navy via-transparent to-navy/60" />

        {/* Drifting gradient blobs */}
        <div className="absolute -top-20 -left-20 w-[28rem] h-[28rem] rounded-full bg-amber/20 blur-[120px] animate-blob" />
        <div className="absolute bottom-0 right-10 w-[24rem] h-[24rem] rounded-full bg-blue-500/20 blur-[120px] animate-blob" style={{ animationDelay: '3s' }} />

        <div className="relative z-10 max-w-[1440px] mx-auto px-6 w-full grid lg:grid-cols-12 gap-10 items-center py-20">
          {/* Copy */}
          <div className="lg:col-span-7">
            <Reveal>
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur border border-white/15 text-white/90 text-xs font-semibold uppercase tracking-widest">
                <span className="w-1.5 h-1.5 rounded-full bg-amber animate-pulse" />
                Premium Rentals Worldwide
              </span>
            </Reveal>

            <Reveal delay={100}>
              <h1 className="mt-6 text-white font-bold leading-[1.05] tracking-tight text-5xl md:text-7xl">
                Elevate
                <br />
                Your{' '}
                <span className="bg-gradient-to-r from-amber via-orange-400 to-amber bg-clip-text text-transparent animate-gradient">
                  Every Stay
                </span>
              </h1>
            </Reveal>

            <Reveal delay={200}>
              <p className="mt-6 text-white/70 text-base md:text-lg max-w-[36rem] leading-relaxed">
                A handpicked collection of the world&apos;s most extraordinary homes and premium
                equipment — booked in seconds, enjoyed for a lifetime.
              </p>
            </Reveal>

            {/* Glass search */}
            <Reveal delay={300}>
              <div className="mt-8 flex flex-col sm:flex-row gap-3 max-w-[36rem]">
                <div className="relative flex-1 group">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-white/50 shrink-0" style={{ fontSize: '20px' }}>
                    search
                  </span>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search a city, villa, or vibe…"
                    className="w-full pl-12 pr-4 py-4 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder-white/50 outline-none focus:border-amber focus:bg-white/15 transition-all"
                  />
                </div>
                <Link href="/browse" className="btn-primary text-base py-4 px-8 rounded-xl shadow-lg shadow-amber/30 flex items-center justify-center gap-2">
                  <span>Explore</span>
                  <span className="material-symbols-outlined shrink-0" style={{ fontSize: '20px' }}>arrow_forward</span>
                </Link>
              </div>
            </Reveal>

            {/* Inline trust */}
            <Reveal delay={400}>
              <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">
                {[
                  { n: 1248, s: '+', l: 'Listings' },
                  { n: 42, s: '', l: 'Cities' },
                  { n: 4.9, s: '★', l: 'Avg Rating', d: 1 },
                ].map((t) => (
                  <div key={t.l}>
                    <p className="text-white text-2xl font-bold">
                      <CountUp end={t.n} decimals={t.d ?? 0} suffix={t.s} />
                    </p>
                    <p className="text-white/50 text-xs uppercase tracking-wider">{t.l}</p>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>

          {/* Auto-rotating property card stack */}
          <div className="lg:col-span-5 hidden lg:flex justify-end">
            <Reveal variant="scale" delay={300}>
              <div className="animate-float">
                <PropertyCardStack items={properties.slice(0, 5)} />
              </div>
            </Reveal>
          </div>
        </div>

        {/* Scroll cue */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-white/50">
          <span className="text-[10px] uppercase tracking-widest">Scroll</span>
          <span className="material-symbols-outlined animate-cue shrink-0" style={{ fontSize: '20px' }}>keyboard_arrow_down</span>
        </div>
      </section>

      {/* ══════════════ MARQUEE STRIP ══════════════ */}
      <div className="bg-navy-container border-y border-white/5 py-4 overflow-hidden">
        <div className="flex whitespace-nowrap animate-marquee">
          {[...marqueeItems, ...marqueeItems].map((item, i) => (
            <span key={i} className="mx-8 text-on-navy text-sm font-medium flex items-center gap-3">
              <span className="material-symbols-outlined text-amber/60 shrink-0" style={{ fontSize: '16px' }}>location_on</span>
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* ══════════════ CATEGORIES ══════════════ */}
      <section className="max-w-[1440px] mx-auto px-6 py-16 md:py-24">
        <Reveal>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
            <div>
              <p className="text-amber text-xs font-semibold uppercase tracking-widest mb-2">Curated Collections</p>
              <h2 className="text-navy font-bold text-3xl md:text-4xl">Find your kind of luxury</h2>
            </div>
            <Link href="/browse" className="text-navy font-semibold text-sm flex items-center gap-1 link-grow self-start">
              <span>All categories</span>
              <span className="material-symbols-outlined shrink-0" style={{ fontSize: '18px' }}>arrow_forward</span>
            </Link>
          </div>
        </Reveal>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {categories.map((cat, i) => (
            <Reveal key={cat.name} variant="up" delay={i * 80}>
              <button
                onClick={() => setActiveCat(cat.name)}
                className="group relative w-full h-52 rounded-2xl overflow-hidden text-left"
              >
                <img
                  src={cat.img}
                  alt={cat.name}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-navy/90 via-navy/30 to-transparent transition-opacity group-hover:from-navy" />
                <div className="absolute inset-0 p-4 flex flex-col justify-end">
                  <span className="material-symbols-outlined text-amber mb-1 transition-transform duration-300 group-hover:-translate-y-1 shrink-0" style={{ fontSize: '26px' }}>
                    {cat.icon}
                  </span>
                  <p className="text-white font-semibold text-sm">{cat.name}</p>
                </div>
                <div className={`absolute top-3 right-3 w-2 h-2 rounded-full transition-all ${activeCat === cat.name ? 'bg-amber scale-125' : 'bg-white/40'}`} />
              </button>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ══════════════ PARALLAX SHOWCASE BANNER ══════════════ */}
      <section className="relative h-[60vh] min-h-[420px] flex items-center overflow-hidden">
        <ParallaxImage
          src="https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?w=1600&q=80"
          alt="Coastal villa"
          speed={0.45}
          fill
        />
        <div className="absolute inset-0 bg-navy/60" />
        <div className="relative z-10 max-w-[1440px] mx-auto px-6 w-full text-center">
          <Reveal>
            <p className="text-amber text-xs font-semibold uppercase tracking-widest mb-4">The LuxRent Standard</p>
          </Reveal>
          <Reveal delay={120}>
            <h2 className="text-white font-bold text-3xl md:text-5xl max-w-[48rem] mx-auto leading-tight">
              Spaces that move you, service that never stops.
            </h2>
          </Reveal>
          <Reveal delay={240}>
            <Link href="/browse" className="btn-primary mt-8 inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl text-base">
              <span>Discover the collection</span>
              <span className="material-symbols-outlined shrink-0" style={{ fontSize: '20px' }}>arrow_forward</span>
            </Link>
          </Reveal>
        </div>
      </section>

      {/* ══════════════ FEATURED LISTINGS ══════════════ */}
      <section className="max-w-[1440px] mx-auto px-6 py-16 md:py-24">
        <Reveal>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
            <div>
              <p className="text-amber text-xs font-semibold uppercase tracking-widest mb-2">Handpicked for you</p>
              <h2 className="text-navy font-bold text-3xl md:text-4xl">Featured stays</h2>
            </div>
            <Link href="/browse" className="text-navy font-semibold text-sm flex items-center gap-1 link-grow self-start">
              <span>View all listings</span>
              <span className="material-symbols-outlined shrink-0" style={{ fontSize: '18px' }}>arrow_forward</span>
            </Link>
          </div>
        </Reveal>

        {filtered.length === 0 ? (
          <p className="text-slate text-center py-16">No stays match &ldquo;{searchQuery}&rdquo;.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((property, i) => (
              <Reveal key={property.id} variant="up" delay={(i % 3) * 100}>
                <article className="group property-card h-full">
                  <div className="relative h-56 overflow-hidden bg-surface-high">
                    <img
                      src={property.img}
                      alt={property.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-navy/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    {property.tag && <span className="absolute top-3 left-3 badge-navy text-[10px] backdrop-blur bg-white/90">{property.tag}</span>}
                    {property.rating > 0 && (
                      <div className="absolute top-3 right-3 bg-white/95 backdrop-blur px-2.5 py-1 rounded-full flex items-center gap-1">
                        <span className="material-symbols-outlined shrink-0 text-amber" style={{ fontSize: '14px', fontVariationSettings: "'FILL' 1" }}>star</span>
                        <span className="text-navy text-xs font-semibold">{property.rating}</span>
                      </div>
                    )}
                    <button
                      onClick={(e) => { e.preventDefault(); toggleFavorite(property.id); }}
                      className="absolute bottom-3 right-3 p-2 bg-white/90 rounded-full hover:bg-white hover:scale-110 transition-all"
                      aria-label="Toggle favorite"
                    >
                      <span
                        className="material-symbols-outlined shrink-0 text-slate"
                        style={{
                          fontSize: '18px',
                          fontVariationSettings: favorites.includes(property.id) ? "'FILL' 1" : "'FILL' 0",
                          color: favorites.includes(property.id) ? '#D97706' : undefined,
                        }}
                      >
                        favorite
                      </span>
                    </button>
                  </div>

                  <Link href={`/browse/${property.id}`} className="p-4 flex flex-col gap-2 flex-grow">
                    <h3 className="font-semibold text-navy text-base leading-snug line-clamp-1 group-hover:text-amber transition-colors">
                      {property.title}
                    </h3>
                    <p className="text-slate text-xs flex items-center gap-1">
                      <span className="material-symbols-outlined shrink-0" style={{ fontSize: '14px' }}>location_on</span>
                      {property.location}
                    </p>
                    <div className="flex items-center justify-between pt-3 border-t border-slate/10 mt-auto">
                      <div>
                        <span className="text-navy font-bold text-lg font-currency">${property.price}</span>
                        <span className="text-slate text-xs">/day</span>
                      </div>
                      <div className="flex items-center gap-3 text-slate text-xs">
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined shrink-0" style={{ fontSize: '15px' }}>bed</span>
                          {property.beds}
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined shrink-0" style={{ fontSize: '15px' }}>shower</span>
                          {property.baths}
                        </span>
                      </div>
                    </div>
                  </Link>
                </article>
              </Reveal>
            ))}
          </div>
        )}
      </section>

      {/* ══════════════ WHY LUXRENT ══════════════ */}
      <section className="bg-white border-y border-slate/10 py-16 md:py-24">
        <div className="max-w-[1440px] mx-auto px-6">
          <Reveal>
            <div className="text-center max-w-[42rem] mx-auto mb-14">
              <p className="text-amber text-xs font-semibold uppercase tracking-widest mb-2">Why LuxRent</p>
              <h2 className="text-navy font-bold text-3xl md:text-4xl">Effortless from search to stay</h2>
              <p className="text-slate mt-4">Everything you need for a seamless rental experience, backed by people who care.</p>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <Reveal key={f.title} variant="up" delay={i * 90}>
                <div className="group card card-hover p-6 h-full">
                  <div className="w-12 h-12 rounded-xl bg-amber/10 flex items-center justify-center mb-4 transition-all group-hover:bg-amber group-hover:scale-110">
                    <span className="material-symbols-outlined text-amber group-hover:text-white transition-colors shrink-0" style={{ fontSize: '24px' }}>
                      {f.icon}
                    </span>
                  </div>
                  <h3 className="text-navy font-semibold text-lg mb-2">{f.title}</h3>
                  <p className="text-slate text-sm leading-relaxed">{f.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════ CTA ══════════════ */}
      <section className="max-w-[1440px] mx-auto px-6 py-16 md:py-24">
        <Reveal variant="scale">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-navy-container via-navy to-navy-container">
            {/* Glow blobs */}
            <div className="absolute -top-24 -right-16 w-80 h-80 rounded-full bg-amber/25 blur-[110px] animate-blob" />
            <div className="absolute -bottom-24 -left-16 w-80 h-80 rounded-full bg-blue-500/20 blur-[110px] animate-blob" style={{ animationDelay: '4s' }} />
            {/* Subtle grid texture */}
            <div
              className="absolute inset-0 opacity-[0.06]"
              style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '48px 48px' }}
            />

            <div className="relative z-10 grid lg:grid-cols-2 gap-10 lg:gap-8 p-10 md:p-14 lg:p-16 items-center">
              {/* Copy */}
              <div>
                <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber/15 border border-amber/25 text-amber text-xs font-semibold uppercase tracking-widest">
                  <span className="material-symbols-outlined shrink-0" style={{ fontSize: '15px' }}>trending_up</span>
                  Earn with LuxRent
                </span>
                <h2 className="mt-5 text-white font-bold text-3xl md:text-4xl leading-tight">
                  Turn your property into <span className="text-amber">premium income</span>
                </h2>
                <p className="mt-4 text-on-navy text-base leading-relaxed max-w-[34rem]">
                  Join thousands of owners earning with LuxRent. List in minutes, set your own rates, and let our concierge team handle bookings, payments, and guests.
                </p>

                <ul className="mt-6 grid sm:grid-cols-2 gap-3">
                  {['No listing fees', 'Secure weekly payouts', 'Full damage protection', 'Dedicated account manager'].map((b) => (
                    <li key={b} className="flex items-center gap-2.5 text-white/85 text-sm">
                      <span className="w-5 h-5 rounded-full bg-amber/20 flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined shrink-0 text-amber" style={{ fontSize: '14px', fontVariationSettings: "'FILL' 1" }}>check</span>
                      </span>
                      {b}
                    </li>
                  ))}
                </ul>

                <div className="mt-8 flex flex-col sm:flex-row gap-3">
                  <Link href="/login" className="btn-primary px-8 py-3.5 rounded-xl text-base animate-shimmer relative overflow-hidden shadow-lg shadow-amber/30 flex items-center justify-center gap-2">
                    <span>Become a Vendor</span>
                    <span className="material-symbols-outlined shrink-0" style={{ fontSize: '18px' }}>arrow_forward</span>
                  </Link>
                  <Link href="/browse" className="btn-secondary px-8 py-3.5 rounded-xl text-base border-white/30 hover:bg-white/10" style={{ color: '#fff' }}>
                    How it works
                  </Link>
                </div>
              </div>

              {/* Earnings visual card */}
              <div className="lg:justify-self-end w-full max-w-[24rem] lg:max-w-none">
                <div className="animate-float rounded-2xl bg-white/[0.07] backdrop-blur-xl border border-white/15 p-6 shadow-2xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-on-navy text-xs uppercase tracking-wider">Est. monthly earnings</p>
                      <p className="text-white font-bold text-3xl mt-1 font-currency">
                        $<CountUp end={12480} />
                      </p>
                    </div>
                    <span className="badge-green text-[11px]">+18% MoM</span>
                  </div>

                  {/* Mini bar chart */}
                  <div className="mt-6 flex items-end gap-2 h-24">
                    {[45, 60, 52, 72, 66, 88, 100].map((h, i) => (
                      <div key={i} className="flex-1 rounded-t-md bg-gradient-to-t from-amber/40 to-amber" style={{ height: `${h}%` }} />
                    ))}
                  </div>
                  <div className="mt-2 flex justify-between text-on-navy text-[10px] uppercase tracking-wide">
                    {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => <span key={i}>{d}</span>)}
                  </div>

                  <div className="mt-6 pt-5 border-t border-white/10 flex items-center gap-3">
                    <div className="flex -space-x-2">
                      {['from-amber to-orange-400', 'from-blue-400 to-blue-600', 'from-emerald-400 to-emerald-600'].map((g, i) => (
                        <div key={i} className={`w-8 h-8 rounded-full bg-gradient-to-br ${g} ring-2 ring-navy`} />
                      ))}
                    </div>
                    <p className="text-white/80 text-xs">Joined by <span className="text-white font-semibold">8,500+</span> owners worldwide</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
