'use client';
import Link from 'next/link';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import ParallaxImage from '@/components/ui/ParallaxImage';
import Reveal from '@/components/ui/Reveal';
import CountUp from '@/components/ui/CountUp';
import PropertyCardStack from '@/components/ui/PropertyCardStack';
import type { Product } from '@/lib/types';

// Category tiles reuse the exact photos of the machines we actually stock,
// so every image on the page maps to something rentable.
const categories = [
  { name: 'Heavy Machinery', icon: 'front_loader', img: '/images/products/cat-320-excavator.jpg' },
  { name: 'Warehouse', icon: 'forklift', img: '/images/products/toyota-forklift.jpg' },
  { name: 'Power', icon: 'bolt', img: '/images/products/generator-caterpillar.jpg' },
  { name: 'Scaffolding', icon: 'construction', img: '/images/products/genie-scissor-lift.jpg' },
  { name: 'Electronics', icon: 'photo_camera', img: '/images/products/sony-a7r-iv.jpg' },
];

const features = [
  { icon: 'verified', title: 'Inspected Fleet', desc: 'Every unit is serviced to OEM spec and photographed before each dispatch.' },
  { icon: 'event_available', title: 'Live Availability', desc: 'Real calendars per unit — if you can book it, it will be in the yard.' },
  { icon: 'shield_lock', title: 'Secure Deposits', desc: 'Razorpay-backed payments with transparent, fully refundable deposits.' },
  { icon: 'local_shipping', title: 'Site Delivery', desc: 'Doorstep or depot — flatbed delivery to your site with certified operators.' },
];

const marqueeBrands = ['Caterpillar', 'JCB', 'Genie', 'Toyota', 'Komatsu', 'Sony', 'Herman Miller'];

// Confirmation banner shown after a successful checkout (/home?ordered=1).
function OrderConfirmedBanner() {
  const searchParams = useSearchParams();
  const [dismissed, setDismissed] = useState(false);
  if (dismissed || searchParams.get('ordered') !== '1') return null;
  return (
    <div className="mx-3 sm:mx-5 mt-3 rounded-2xl border border-emerald-300 bg-emerald-50 px-5 py-4 flex items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <span className="material-symbols-outlined text-emerald-600" style={{ fontSize: '28px', fontVariationSettings: "'FILL' 1" }}>check_circle</span>
        <div>
          <p className="text-navy font-semibold text-sm">Order placed successfully!</p>
          <p className="text-slate text-xs">Your reservation is confirmed — we&apos;ve emailed the details. Deposits are refunded on safe return.</p>
        </div>
      </div>
      <button onClick={() => setDismissed(true)} className="text-slate hover:text-navy p-1" aria-label="Dismiss">
        <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>close</span>
      </button>
    </div>
  );
}

export default function HomePage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // The homepage sells what the catalog actually stocks.
  useEffect(() => {
    fetch('/api/products')
      .then((r) => r.json())
      .then((data: Product[]) => setProducts(Array.isArray(data) ? data : []))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(searchQuery.trim() ? `/browse?search=${encodeURIComponent(searchQuery.trim())}` : '/browse');
  };

  const stackItems = [...products]
    .sort((a, b) => b.daily - a.daily)
    .slice(0, 5)
    .map((p) => ({ id: p.id, title: p.name, location: p.category, price: p.daily, rating: p.rating, tag: p.brand, img: p.image }));

  const featured = products.filter((p) => {
    const q = searchQuery.toLowerCase();
    return p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q) || p.category.toLowerCase().includes(q);
  }).slice(0, 6);

  const categoryCount = new Set(products.map((p) => p.category)).size;
  const unitCount = products.reduce((s, p) => s + p.quantity, 0);
  const rated = products.filter((p) => p.reviews > 0);
  const avgRating = rated.length ? rated.reduce((s, p) => s + p.rating, 0) / rated.length : 0;

  return (
    <div className="overflow-x-hidden">
      <Suspense>
        <OrderConfirmedBanner />
      </Suspense>
      {/* ══════════════ HERO ══════════════ */}
      <section className="detach detach-dark relative min-h-[86vh] flex items-center overflow-hidden bg-navy rounded-[28px] mx-3 sm:mx-5 mt-2 shadow-[0_24px_60px_-20px_rgba(15,23,42,0.45)]">
        {/* Parallax backdrop — tower crane silhouetted against a dusk sky */}
        <ParallaxImage
          src="/images/marketing/hero-crane-sunset.jpg"
          alt="Construction crane silhouetted at dusk"
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
                Equipment Rentals, Done Right
              </span>
            </Reveal>

            <Reveal delay={100}>
              <h1 className="mt-6 text-white leading-[1.04] tracking-tight text-5xl md:text-7xl font-display font-semibold">
                Heavy iron to
                <br />
                studio{' '}
                <span className="bg-gradient-to-r from-amber via-orange-400 to-amber bg-clip-text text-transparent animate-gradient">
                  gear.
                </span>
              </h1>
            </Reveal>

            <Reveal delay={200}>
              <p className="mt-6 text-white/70 text-base md:text-lg max-w-[36rem] leading-relaxed">
                Excavators, forklifts, generators, cameras — inspected, insured and
                delivered to your site. Book by the day with live availability and
                fully refundable deposits.
              </p>
            </Reveal>

            {/* Glass search */}
            <Reveal delay={300}>
              <form onSubmit={submitSearch} className="mt-8 flex flex-col sm:flex-row gap-3 max-w-[36rem]">
                <div className="relative flex-1 group">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-white/50" style={{ fontSize: '20px' }}>
                    search
                  </span>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search an excavator, lift, or camera…"
                    className="w-full pl-12 pr-4 py-4 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder-white/50 outline-none focus:border-amber focus:bg-white/15 transition-all"
                  />
                </div>
                <button type="submit" className="btn-primary text-base py-4 px-8 rounded-xl shadow-lg shadow-amber/30">
                  Explore
                  <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>arrow_forward</span>
                </button>
              </form>
            </Reveal>

            {/* Inline trust */}
            <Reveal delay={400}>
              <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">
                {[
                  { n: unitCount, s: '', l: 'Units in fleet' },
                  { n: categoryCount, s: '', l: 'Categories' },
                  { n: avgRating, s: '★', l: 'Avg Rating', d: 1 },
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

          {/* Auto-rotating equipment card stack */}
          <div className="lg:col-span-5 hidden lg:flex justify-end">
            <Reveal variant="scale" delay={300}>
              <div className="animate-float">
                {stackItems.length > 0 && <PropertyCardStack items={stackItems} />}
              </div>
            </Reveal>
          </div>
        </div>

        {/* Scroll cue */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-white/50">
          <span className="text-[10px] uppercase tracking-widest">Scroll</span>
          <span className="material-symbols-outlined animate-cue" style={{ fontSize: '20px' }}>keyboard_arrow_down</span>
        </div>
      </section>

      {/* ══════════════ BRAND MARQUEE ══════════════ */}
      <div className="detach detach-dark bg-navy-container rounded-2xl mx-3 sm:mx-5 my-4 py-4 overflow-hidden shadow-[0_16px_40px_-16px_rgba(15,23,42,0.4)] border border-white/5">
        <div className="flex whitespace-nowrap animate-marquee">
          {[...marqueeBrands, ...marqueeBrands].map((item, i) => (
            <span key={i} className="mx-8 text-on-navy text-sm font-medium flex items-center gap-3">
              <span className="material-symbols-outlined text-amber/60" style={{ fontSize: '16px' }}>verified</span>
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
              <p className="text-amber text-xs font-semibold uppercase tracking-widest mb-2">Browse the fleet</p>
              <h2 className="text-navy font-display font-semibold text-3xl md:text-4xl">What are you building today?</h2>
            </div>
            <Link href="/browse" className="text-navy font-semibold text-sm flex items-center gap-1 link-grow self-start">
              All categories
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>arrow_forward</span>
            </Link>
          </div>
        </Reveal>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {categories.map((cat, i) => (
            <Reveal key={cat.name} variant="up" delay={i * 80}>
              <Link
                href={`/browse?cat=${encodeURIComponent(cat.name)}`}
                className="detach detach-dark group block w-full h-52 rounded-2xl overflow-hidden text-left relative"
              >
                <img
                  src={cat.img}
                  alt={cat.name}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-navy/90 via-navy/30 to-transparent transition-opacity group-hover:from-navy" />
                <div className="absolute inset-0 p-4 flex flex-col justify-end">
                  <span className="material-symbols-outlined text-amber mb-1 transition-transform duration-300 group-hover:-translate-y-1" style={{ fontSize: '26px' }}>
                    {cat.icon}
                  </span>
                  <p className="text-white font-semibold text-sm">{cat.name}</p>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ══════════════ PARALLAX SHOWCASE BANNER ══════════════ */}
      <section className="detach detach-dark relative h-[60vh] min-h-[420px] flex items-center overflow-hidden rounded-[28px] mx-3 sm:mx-5 my-4 shadow-[0_24px_60px_-20px_rgba(15,23,42,0.45)]">
        <ParallaxImage
          src="/images/products/cat-320-excavator.jpg"
          alt="CAT 320 excavator on site"
          speed={0.45}
          fill
        />
        <div className="absolute inset-0 bg-navy/60" />
        <div className="relative z-10 max-w-[1440px] mx-auto px-6 w-full text-center">
          <Reveal>
            <p className="text-amber text-xs font-semibold uppercase tracking-widest mb-4">The Rentora Standard</p>
          </Reveal>
          <Reveal delay={120}>
            <h2 className="text-white font-display font-semibold text-3xl md:text-5xl max-w-[48rem] mx-auto leading-tight">
              Iron that shows up serviced, fuelled and ready to dig.
            </h2>
          </Reveal>
          <Reveal delay={240}>
            <Link href="/browse" className="btn-primary mt-8 inline-flex px-8 py-3.5 rounded-xl text-base">
              Browse the fleet
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>arrow_forward</span>
            </Link>
          </Reveal>
        </div>
      </section>

      {/* ══════════════ FEATURED EQUIPMENT ══════════════ */}
      <section className="max-w-[1440px] mx-auto px-6 py-16 md:py-24">
        <Reveal>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
            <div>
              <p className="text-amber text-xs font-semibold uppercase tracking-widest mb-2">Straight from the yard</p>
              <h2 className="text-navy font-display font-semibold text-3xl md:text-4xl">Featured equipment</h2>
            </div>
            <Link href="/browse" className="text-navy font-semibold text-sm flex items-center gap-1 link-grow self-start">
              View full catalog
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>arrow_forward</span>
            </Link>
          </div>
        </Reveal>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="property-card h-80 animate-pulse bg-surface-high" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16">
            <span className="material-symbols-outlined text-slate/30 block mb-2" style={{ fontSize: '48px' }}>inventory_2</span>
            <p className="text-slate font-medium">No equipment listed yet.</p>
            <p className="text-slate/70 text-sm mt-1">New rentals will appear here as vendors add them.</p>
          </div>
        ) : featured.length === 0 ? (
          <p className="text-slate text-center py-16">Nothing matches &ldquo;{searchQuery}&rdquo;.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featured.map((product, i) => (
              <Reveal key={product.id} variant="up" delay={(i % 3) * 100}>
                <Link href={`/browse/${product.id}`} className="group property-card h-full flex flex-col">
                  <div className="relative h-56 overflow-hidden bg-surface-high">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-navy/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <span className="absolute top-3 left-3 badge-navy text-[10px] backdrop-blur bg-white/90">{product.brand}</span>
                    <div className="absolute top-3 right-3 bg-white/95 backdrop-blur px-2.5 py-1 rounded-full flex items-center gap-1">
                      <span className="material-symbols-outlined text-amber" style={{ fontSize: '14px', fontVariationSettings: "'FILL' 1" }}>star</span>
                      <span className="text-navy text-xs font-semibold">{product.rating}</span>
                    </div>
                  </div>

                  <div className="p-4 flex flex-col gap-2 flex-grow">
                    <h3 className="font-semibold text-navy text-base leading-snug line-clamp-1 group-hover:text-amber transition-colors">
                      {product.name}
                    </h3>
                    <p className="text-slate text-xs flex items-center gap-1">
                      <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>category</span>
                      {product.category}
                    </p>
                    <div className="flex items-center justify-between pt-3 border-t border-slate/10 mt-auto">
                      <div>
                        <span className="text-navy font-bold text-lg font-currency">₹{product.daily.toLocaleString()}</span>
                        <span className="text-slate text-xs">/day</span>
                      </div>
                      <span className="text-slate text-xs flex items-center gap-1">
                        <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>security</span>
                        ₹{product.deposit.toLocaleString()} deposit
                      </span>
                    </div>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        )}
      </section>

      {/* ══════════════ WHY RENTORA ══════════════ */}
      <section className="bg-white border-y border-slate/10 py-16 md:py-24">
        <div className="max-w-[1440px] mx-auto px-6">
          <Reveal>
            <div className="text-center max-w-[42rem] mx-auto mb-14">
              <p className="text-amber text-xs font-semibold uppercase tracking-widest mb-2">Why Rentora</p>
              <h2 className="text-navy font-display font-semibold text-3xl md:text-4xl">From quote to job site, no surprises</h2>
              <p className="text-slate mt-4">Transparent pricing, real availability, and deposits that come back — the way renting should work.</p>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <Reveal key={f.title} variant="up" delay={i * 90}>
                <div className="group card card-hover p-6 h-full">
                  <div className="w-12 h-12 rounded-xl bg-amber/10 flex items-center justify-center mb-4 transition-all group-hover:bg-amber group-hover:scale-110">
                    <span className="material-symbols-outlined text-amber group-hover:text-white transition-colors" style={{ fontSize: '24px' }}>
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
          <div className="detach detach-dark relative overflow-hidden rounded-3xl bg-gradient-to-br from-navy-container via-navy to-navy-container">
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
                  <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>trending_up</span>
                  Earn with Rentora
                </span>
                <h2 className="mt-5 text-white font-display font-semibold text-3xl md:text-4xl leading-tight">
                  Turn idle equipment into <span className="text-amber">working capital</span>
                </h2>
                <p className="mt-4 text-on-navy text-base leading-relaxed max-w-[34rem]">
                  Machines parked in the yard don&apos;t pay for themselves. List your fleet on
                  Rentora, set your rates, and we handle bookings, deposits and payments.
                </p>

                <ul className="mt-6 grid sm:grid-cols-2 gap-3">
                  {['No listing fees', 'Secure weekly payouts', 'Full damage protection', 'Dedicated account manager'].map((b) => (
                    <li key={b} className="flex items-center gap-2.5 text-white/85 text-sm">
                      <span className="w-5 h-5 rounded-full bg-amber/20 flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-amber" style={{ fontSize: '14px', fontVariationSettings: "'FILL' 1" }}>check</span>
                      </span>
                      {b}
                    </li>
                  ))}
                </ul>

                <div className="mt-8 flex flex-col sm:flex-row gap-3">
                  <Link href="/login" className="btn-primary px-8 py-3.5 rounded-xl text-base animate-shimmer relative overflow-hidden shadow-lg shadow-amber/30">
                    Become a Vendor
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>arrow_forward</span>
                  </Link>
                  <Link href="/how-it-works" className="btn-outline-light px-8 py-3.5 rounded-xl text-base">
                    How it works
                  </Link>
                </div>
              </div>

              {/* How listing works card */}
              <div className="lg:justify-self-end w-full max-w-[24rem] lg:max-w-none">
                <div className="detach detach-dark animate-float rounded-2xl bg-white/[0.07] backdrop-blur-xl border border-white/15 p-6 shadow-2xl">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-amber/20 flex items-center justify-center">
                      <span className="material-symbols-outlined text-amber" style={{ fontSize: '22px' }}>storefront</span>
                    </div>
                    <div>
                      <p className="text-on-navy text-xs uppercase tracking-wider">List in minutes</p>
                      <p className="text-white font-bold text-lg">Rent out your equipment</p>
                    </div>
                  </div>

                  <ul className="mt-6 space-y-4">
                    {[
                      { icon: 'sell', title: 'Set your own rates', desc: 'Hourly, daily, weekly or monthly — you decide.' },
                      { icon: 'calendar_month', title: 'We handle bookings', desc: 'Live availability, deposits and payments, managed for you.' },
                      { icon: 'account_balance_wallet', title: 'Secure payouts', desc: 'Get paid on time with full damage protection.' },
                    ].map((step) => (
                      <li key={step.title} className="flex items-start gap-3">
                        <span className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined text-amber" style={{ fontSize: '17px' }}>{step.icon}</span>
                        </span>
                        <div>
                          <p className="text-white text-sm font-semibold">{step.title}</p>
                          <p className="text-white/60 text-xs leading-relaxed">{step.desc}</p>
                        </div>
                      </li>
                    ))}
                  </ul>

                  <Link href="/login" className="btn-primary w-full justify-center mt-6 py-2.5 rounded-xl text-sm">
                    Start listing
                    <span className="material-symbols-outlined" style={{ fontSize: '17px' }}>arrow_forward</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
