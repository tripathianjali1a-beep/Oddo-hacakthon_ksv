'use client';
import Link from 'next/link';
import { useState } from 'react';

const dealsCatalog = [
  {
    id: 'deal-1',
    title: 'Summer Construction Flash Sale: CAT 320 Excavator',
    category: 'Heavy Machinery',
    brand: 'Caterpillar',
    originalPrice: '$650/day',
    discountedPrice: '$499/day',
    discountBadge: '23% OFF',
    couponCode: 'SUMMER23',
    expiresIn: '2 Days 14 Hrs',
    img: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&q=80',
    desc: 'Heavy-duty hydraulic excavator with GPS grading package included at no extra cost. Perfect for site preparation and deep trenching.',
    minDays: 3,
  },
  {
    id: 'deal-2',
    title: 'Warehouse Fleet Promo: Toyota Forklift 8FGU25',
    category: 'Power Tools',
    brand: 'Komatsu',
    originalPrice: '$280/day',
    discountedPrice: '$210/day',
    discountBadge: '25% OFF',
    couponCode: 'FLEET25',
    expiresIn: '5 Days 08 Hrs',
    img: 'https://images.unsplash.com/photo-1605731009813-8e0a0b2c2f4b?w=800&q=80',
    desc: '5,000 lb capacity indoor/outdoor pneumatic tire lift with dual-fuel capability and side-shift attachment.',
    minDays: 1,
  },
  {
    id: 'deal-3',
    title: 'Film Production Bundle: RED Cinema Camera & Optics Kit',
    category: 'Electronics',
    brand: 'Sony',
    originalPrice: '$350/day',
    discountedPrice: '$280/day',
    discountBadge: '20% OFF',
    couponCode: 'CINEMA20',
    expiresIn: '1 Day 19 Hrs',
    img: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&q=80',
    desc: 'Complete 8K RED V-Raptor package with Zeiss prime lens kit, matte box, and wireless follow-focus control.',
    minDays: 2,
  },
  {
    id: 'deal-4',
    title: 'Remote Power Special: 50kW Industrial Generator',
    category: 'Heavy Machinery',
    brand: 'Caterpillar',
    originalPrice: '$150/day',
    discountedPrice: '$115/day',
    discountBadge: '23% OFF',
    couponCode: 'POWER23',
    expiresIn: '4 Days 12 Hrs',
    img: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&q=80',
    desc: 'Whisper-quiet enclosed sound-attenuated diesel generator with automatic voltage regulation and 24-hour run fuel tank.',
    minDays: 3,
  },
  {
    id: 'deal-5',
    title: 'Commercial Scaffolding Tower & Scissor Lift Combo',
    category: 'Scaffolding',
    brand: 'Caterpillar',
    originalPrice: '$400/day',
    discountedPrice: '$320/day',
    discountBadge: '20% OFF',
    couponCode: 'SCAFF20',
    expiresIn: '3 Days 04 Hrs',
    img: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
    desc: '30 ft electric self-propelled scissor lift plus 200 sq. ft. modular aluminum scaffolding tower with outriggers.',
    minDays: 5,
  },
  {
    id: 'deal-6',
    title: 'Corporate Event & Executive Lounge Furniture Suite',
    category: 'Office Furniture',
    brand: 'Herman Miller',
    originalPrice: '$120/day',
    discountedPrice: '$85/day',
    discountBadge: '29% OFF',
    couponCode: 'EVENT29',
    expiresIn: '6 Days 21 Hrs',
    img: 'https://images.unsplash.com/photo-1541558869434-2840d308329a?w=800&q=80',
    desc: 'Set of 12 Herman Miller Aeron chairs, executive boardroom table, and 4 velvet lounge armchairs for corporate summits.',
    minDays: 2,
  },
];

export default function DealsPage() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [toast, setToast] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const copyCoupon = (code: string) => {
    navigator.clipboard?.writeText(code);
    setCopiedCode(code);
    triggerToast(`Promo code '${code}' copied to clipboard! Apply at checkout.`);
    setTimeout(() => setCopiedCode(null), 3000);
  };

  const filteredDeals = selectedCategory === 'All'
    ? dealsCatalog
    : dealsCatalog.filter((d) => d.category === selectedCategory);

  return (
    <div className="bg-ivory/40 min-h-screen pb-20 relative">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-navy text-white px-5 py-3.5 rounded-xl shadow-2xl border border-amber/30 flex items-center gap-3 animate-slide-up">
          <span className="material-symbols-outlined shrink-0 text-amber" style={{ fontSize: '20px' }}>check_circle</span>
          <span className="text-sm font-semibold">{toast}</span>
        </div>
      )}

      {/* Hero Header */}
      <section className="bg-gradient-to-r from-navy via-navy-container to-navy text-white py-16 px-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#D97706_1px,transparent_1px)] [background-size:20px_20px]" />
        <div className="max-w-4xl mx-auto relative z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber/20 text-amber text-xs font-bold uppercase tracking-widest mb-4 border border-amber/30">
            <span className="material-symbols-outlined shrink-0 animate-pulse" style={{ fontSize: '16px' }}>local_fire_department</span>
            <span>Limited-Time Equipment & Fleet Savings</span>
          </span>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4">Exclusive Deals & Flash Offers</h1>
          <p className="text-on-navy text-base max-w-2xl mx-auto">
            Take advantage of seasonal discounts, bulk commercial tiers, and special promo codes. Instant verification with zero booking fees when claimed during the promotional period.
          </p>

          {/* New Member Coupon Banner from Mockup */}
          <div className="mt-8 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 md:p-6 max-w-2xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 shadow-2xl">
            <div className="flex items-center gap-3.5 text-left">
              <div className="w-12 h-12 rounded-xl bg-amber text-white flex items-center justify-center font-bold text-xl shrink-0 shadow-lg">
                %
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber block">New Sign-Up Special Offer</span>
                <p className="font-bold text-sm md:text-base text-white">Get $100 OFF your first commercial rental over $500</p>
              </div>
            </div>
            <button
              onClick={() => copyCoupon('xxxx10')}
              className="bg-amber hover:bg-amber/90 text-navy font-bold text-xs py-2.5 px-5 rounded-xl transition-all flex items-center gap-1.5 shrink-0 shadow-md active:scale-95"
            >
              <span className="material-symbols-outlined shrink-0" style={{ fontSize: '16px' }}>content_copy</span>
              <span>{copiedCode === 'xxxx10' ? 'Copied!' : 'Code: xxxx10'}</span>
            </button>
          </div>
        </div>
      </section>

      {/* Main Container */}
      <div className="max-w-[1440px] mx-auto px-6 py-12">
        {/* Category Filters */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8 pb-6 border-b border-slate/15">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-amber shrink-0" style={{ fontSize: '22px' }}>filter_alt</span>
            <span className="text-sm font-bold text-navy">Filter Deals by Category:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {['All', 'Heavy Machinery', 'Power Tools', 'Electronics', 'Scaffolding', 'Office Furniture'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  selectedCategory === cat
                    ? 'bg-navy text-white shadow-sm'
                    : 'bg-white text-slate hover:text-navy border border-slate/20'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Deals Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredDeals.map((deal) => (
            <div
              key={deal.id}
              className="bg-white rounded-2xl overflow-hidden border border-slate/15 shadow-sm hover:shadow-xl hover:border-amber transition-all duration-300 flex flex-col justify-between group"
            >
              <div>
                {/* Image & Discount Badge */}
                <div className="relative h-52 w-full overflow-hidden bg-slate/10">
                  <img
                    src={deal.img}
                    alt={deal.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <span className="absolute top-4 left-4 bg-red-600 text-white font-black text-xs px-3 py-1 rounded-full shadow-lg flex items-center gap-1 animate-bounce">
                    <span className="material-symbols-outlined shrink-0" style={{ fontSize: '14px' }}>sell</span>
                    <span>{deal.discountBadge}</span>
                  </span>
                  <span className="absolute top-4 right-4 bg-black/60 backdrop-blur-md text-white text-[11px] font-semibold px-2.5 py-1 rounded border border-white/20 flex items-center gap-1">
                    <span className="material-symbols-outlined shrink-0 text-amber" style={{ fontSize: '14px' }}>timer</span>
                    <span>Expires in {deal.expiresIn}</span>
                  </span>
                  <div className="absolute bottom-3 left-4 right-4 text-white flex items-end justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber block">{deal.brand} • {deal.category}</span>
                      <p className="text-xs text-white/80 line-through font-currency">{deal.originalPrice}</p>
                      <p className="text-xl font-extrabold text-white font-currency drop-shadow">{deal.discountedPrice}</p>
                    </div>
                    <span className="text-[10px] bg-amber/90 text-navy font-bold px-2 py-0.5 rounded">
                      Min. {deal.minDays} {deal.minDays === 1 ? 'Day' : 'Days'}
                    </span>
                  </div>
                </div>

                {/* Body */}
                <div className="p-6">
                  <h3 className="font-bold text-navy text-lg group-hover:text-amber transition-colors mb-2 line-clamp-2">
                    {deal.title}
                  </h3>
                  <p className="text-slate text-xs leading-relaxed mb-6">
                    {deal.desc}
                  </p>

                  {/* Coupon Box */}
                  <div className="bg-ivory border border-dashed border-amber/60 rounded-xl p-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="material-symbols-outlined text-amber shrink-0" style={{ fontSize: '20px' }}>confirmation_number</span>
                      <div className="min-w-0">
                        <span className="text-[10px] text-slate block uppercase font-semibold">Promo Code</span>
                        <span className="font-mono font-bold text-navy text-sm tracking-wide block truncate">{deal.couponCode}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => copyCoupon(deal.couponCode)}
                      className="btn-secondary text-xs py-1.5 px-3 shrink-0 hover:bg-amber hover:text-navy transition-colors font-bold"
                    >
                      {copiedCode === deal.couponCode ? 'Copied!' : 'Copy Code'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="p-6 pt-0 mt-auto flex gap-2">
                <Link
                  href={`/browse?deals=true`}
                  onClick={() => triggerToast(`Applying ${deal.couponCode} discount to ${deal.title}...`)}
                  className="btn-primary flex-1 py-3 text-xs flex items-center justify-center gap-1.5 shadow-md"
                >
                  <span className="material-symbols-outlined shrink-0" style={{ fontSize: '18px' }}>shopping_bag</span>
                  <span>Claim & Book Now</span>
                </Link>
                <Link
                  href={`/browse/1`}
                  className="btn-secondary px-3 py-3 text-xs flex items-center justify-center"
                  title="View Equipment Specs"
                >
                  <span className="material-symbols-outlined shrink-0" style={{ fontSize: '18px' }}>info</span>
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Bulk Corporate Tiers Banner */}
        <div className="mt-16 bg-white rounded-2xl border border-slate/15 p-8 md:p-12 shadow-sm flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-2">
            <span className="badge-green">Enterprise Volume Tiers</span>
            <h2 className="text-2xl font-bold text-navy">Renting 5+ machines for a multi-month project?</h2>
            <p className="text-slate text-sm max-w-xl">
              Commercial contractors and architectural firms qualify for custom tiered discounts up to 35% off standard daily/monthly rates, dedicated account management, and free scheduled maintenance.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 shrink-0 w-full sm:w-auto">
            <Link
              href="/contact"
              onClick={() => triggerToast('Opening commercial volume account application...')}
              className="btn-primary py-3 px-6 text-sm flex items-center justify-center gap-2"
            >
              <span>Apply for Wholesale Tier</span>
            </Link>
            <button
              onClick={() => copyCoupon('BULKTIER35')}
              className="btn-secondary py-3 px-6 text-sm flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined shrink-0" style={{ fontSize: '18px' }}>content_copy</span>
              <span>Code: BULKTIER35</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
