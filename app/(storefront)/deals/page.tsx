'use client';
import Link from 'next/link';
import { useState } from 'react';

interface DealSpec {
  id: string;
  title: string;
  category: string;
  brand: string;
  originalPrice: string;
  discountedPrice: string;
  discountBadge: string;
  couponCode: string;
  expiresIn: string;
  img: string;
  desc: string;
  minDays: number;
  // Enriched technical & deal information
  technicalSpecs: { label: string; val: string }[];
  includedAddons: string[];
  eligibilityTerms: string[];
  dailyRateNumeric: number;
  originalRateNumeric: number;
  totalSavings3Day: number;
  totalSavings7Day: number;
}

const dealsCatalog: DealSpec[] = [
  {
    id: 'deal-1',
    title: 'Summer Construction Flash Sale: CAT 320 Hydraulic Excavator',
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
    technicalSpecs: [
      { label: 'Operating Weight', val: '49,600 lbs (22.5 Metric Tons)' },
      { label: 'Engine Output', val: '172 HP (CAT C4.4 ACERT Diesel)' },
      { label: 'Max Digging Depth', val: '22.1 ft (6,720 mm)' },
      { label: 'Bucket Capacity', val: '1.56 cu yd Heavy Duty' },
    ],
    includedAddons: ['Cat Grade Control 2D/3D GPS Module ($45/day value - FREE)', 'Hydraulic Quick Coupler & Thumb Attachment', '8 Operating Engine Hours per 24-hour cycle included'],
    eligibilityTerms: ['Valid for commercial contractor accounts & verified corporate entities.', '$1,000 refundable deposit or COI verification required.', 'Subject to local fleet availability in regional depots.'],
    dailyRateNumeric: 499,
    originalRateNumeric: 650,
    totalSavings3Day: 453,
    totalSavings7Day: 1057,
  },
  {
    id: 'deal-2',
    title: 'Warehouse Fleet Promo: Toyota Forklift 8FGU25 (5,000 lb)',
    category: 'Power Tools',
    brand: 'Komatsu',
    originalPrice: '$280/day',
    discountedPrice: '$210/day',
    discountBadge: '25% OFF',
    couponCode: 'FLEET25',
    expiresIn: '5 Days 08 Hrs',
    img: 'https://images.unsplash.com/photo-1605731009813-8e0a0b2c2f4b?w=800&q=80',
    desc: '5,000 lb capacity indoor/outdoor pneumatic tire lift with dual-fuel capability and side-shift attachment for warehouse logistics.',
    minDays: 1,
    technicalSpecs: [
      { label: 'Max Lift Capacity', val: '5,000 lbs @ 24" Load Center' },
      { label: 'Mast Lift Height', val: '189 inches (3-Stage Triple Mast)' },
      { label: 'Power System', val: 'Dual-Fuel LPG / Gasoline Engine' },
      { label: 'Tire Type', val: 'Pneumatic Indoor/Outdoor Tread' },
    ],
    includedAddons: ['Integrated Side-Shift Carriage & 48" Fork Tines', 'Full Safety Strobe & Reverse Audible Alarm Package', 'Complimentary LPG Tank included upon dispatch'],
    eligibilityTerms: ['Open to all business and commercial warehouse operators.', 'Standard operator safety checklist verification.', 'Instant counter pickup or same-day local flatbed delivery.'],
    dailyRateNumeric: 210,
    originalRateNumeric: 280,
    totalSavings3Day: 210,
    totalSavings7Day: 490,
  },
  {
    id: 'deal-3',
    title: 'Film Production Bundle: RED V-Raptor 8K Cinema & Optics Kit',
    category: 'Electronics',
    brand: 'Sony',
    originalPrice: '$350/day',
    discountedPrice: '$280/day',
    discountBadge: '20% OFF',
    couponCode: 'CINEMA20',
    expiresIn: '1 Day 19 Hrs',
    img: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&q=80',
    desc: 'Complete 8K RED V-Raptor package with Zeiss prime lens kit, matte box, and wireless follow-focus control for commercial shoots.',
    minDays: 2,
    technicalSpecs: [
      { label: 'Sensor Architecture', val: '35.4MP 8K VistaVision VV CMOS' },
      { label: 'Dynamic Range', val: '17+ Stops Ultra-Clean Low Light' },
      { label: 'Recording Formats', val: 'REDCODE RAW up to 8K 120 fps' },
      { label: 'Included Lens Suite', val: 'Zeiss CP.3 Prime Kit (21, 35, 50, 85mm)' },
    ],
    includedAddons: ['4x 2TB PROMAG High-Speed Media Cards & Reader', 'Teradek Bolt 4K Wireless Video Transmitter Kit', 'Tilta Nucleus-M Wireless Dual Motor Follow Focus'],
    eligibilityTerms: ['Verified production company or production insurance policy required.', 'Pre-shoot optical calibration & prep table time included free.', '24-hour hot-swap emergency camera body guarantee.'],
    dailyRateNumeric: 280,
    originalRateNumeric: 350,
    totalSavings3Day: 210,
    totalSavings7Day: 490,
  },
  {
    id: 'deal-4',
    title: 'Remote Site Power Special: CAT C15 50kW Enclosed Generator',
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
    technicalSpecs: [
      { label: 'Prime Power Output', val: '50 kW (62.5 kVA) Three-Phase' },
      { label: 'Voltage Options', val: '120/208V, 277/480V Switchable' },
      { label: 'Noise Rating', val: '64 dB(A) @ 23 ft (Sound Attenuated)' },
      { label: 'Fuel Autonomy', val: '24 Hours Continuous Run Tank' },
    ],
    includedAddons: ['Cam-Lok Distribution Panel & 100ft 4/0 Feeder Cables', 'Automatic Voltage Regulator (AVR) & Frequency Control', 'Remote Telematics Fuel Alerting System included'],
    eligibilityTerms: ['Ideal for construction sites, remote events, and hospital backups.', 'Fuel surcharge applies only on actual consumption.', 'Includes routine fluid check & filter maintenance.'],
    dailyRateNumeric: 115,
    originalRateNumeric: 150,
    totalSavings3Day: 105,
    totalSavings7Day: 245,
  },
  {
    id: 'deal-5',
    title: 'Commercial Scaffolding Tower & 30ft Scissor Lift Combo',
    category: 'Scaffolding',
    brand: 'Caterpillar',
    originalPrice: '$400/day',
    discountedPrice: '$320/day',
    discountBadge: '20% OFF',
    couponCode: 'SCAFF20',
    expiresIn: '3 Days 04 Hrs',
    img: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
    desc: '30 ft electric self-propelled scissor lift plus 200 sq. ft. modular aluminum scaffolding tower with outriggers for exterior siding.',
    minDays: 5,
    technicalSpecs: [
      { label: 'Scissor Working Height', val: '36 ft (30 ft Platform Height)' },
      { label: 'Scissor Lift Capacity', val: '1,000 lbs (3 Workers + Tools)' },
      { label: 'Scaffolding Coverage', val: '200 sq ft Modular Aluminum Tower' },
      { label: 'Safety Accessories', val: 'Leveling Outriggers & Toeboards' },
    ],
    includedAddons: ['2x Full-Body Safety Harnesses with Dual Lanyards', 'Complimentary Battery Smart-Charger & Extension Cord', 'On-site structural stabilization and leveling guide'],
    eligibilityTerms: ['5-day minimum booking required to lock in combo promotional rate.', 'OSHA safety compliance documentation provided upon delivery.', 'Free scheduled jobsite delivery within 30 miles.'],
    dailyRateNumeric: 320,
    originalRateNumeric: 400,
    totalSavings3Day: 240,
    totalSavings7Day: 560,
  },
  {
    id: 'deal-6',
    title: 'Corporate Summit Suite: 12x Aeron Chairs & Executive Table',
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
    technicalSpecs: [
      { label: 'Seating Package', val: '12x Herman Miller Aeron (Size B Fully Loaded)' },
      { label: 'Boardroom Table', val: '16-Foot Walnut Modular Conference Table' },
      { label: 'Lounge Add-on', val: '4x Italian Velvet Club Armchairs' },
      { label: 'Sanitization Standard', val: 'Steam-Cleaned & GREENGUARD Gold' },
    ],
    includedAddons: ['White-Glove Inside Setup, Leveling & Placement Included', 'Integrated Tabletop Power & HDMI/USB-C Connectivity Boxes', 'Post-Event Teardown and Packaging Service Free'],
    eligibilityTerms: ['Available for corporate summits, trade shows, and hotel boardrooms.', 'Zero security deposit required for registered net-30 clients.', 'Complimentary extra day allowed for setup/rehearsal.'],
    dailyRateNumeric: 85,
    originalRateNumeric: 120,
    totalSavings3Day: 105,
    totalSavings7Day: 245,
  },
];

export default function DealsPage() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeModalDeal, setActiveModalDeal] = useState<DealSpec | null>(null);
  const [calcDays, setCalcDays] = useState<number>(5);
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

      {/* Hero Header with proper container max width */}
      <section className="bg-gradient-to-r from-navy via-navy-container to-navy text-white py-16 px-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#D97706_1px,transparent_1px)] [background-size:20px_20px]" />
        <div className="max-w-4xl mx-auto relative z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber/20 text-amber text-xs font-bold uppercase tracking-widest mb-4 border border-amber/30">
            <span className="material-symbols-outlined shrink-0 animate-pulse" style={{ fontSize: '16px' }}>local_fire_department</span>
            <span>Limited-Time Equipment & Fleet Savings</span>
          </span>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4">Exclusive Deals & Flash Offers</h1>
          <p className="text-on-navy text-base mx-auto max-w-[680px]">
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
                <div className="p-6 space-y-4">
                  <div>
                    <h3 className="font-bold text-navy text-lg group-hover:text-amber transition-colors mb-2 line-clamp-2">
                      {deal.title}
                    </h3>
                    <p className="text-slate text-xs leading-relaxed">
                      {deal.desc}
                    </p>
                  </div>

                  {/* Technical Highlights Mini Box */}
                  <div className="bg-ivory rounded-xl p-3 border border-slate/15 space-y-1.5 text-xs">
                    <div className="flex justify-between font-semibold text-navy">
                      <span className="text-slate">{deal.technicalSpecs[0].label}:</span>
                      <span>{deal.technicalSpecs[0].val}</span>
                    </div>
                    <div className="flex justify-between font-semibold text-navy">
                      <span className="text-slate">Included Bonus:</span>
                      <span className="text-purple-700 truncate max-w-[170px]">{deal.includedAddons[0].split('(')[0]}</span>
                    </div>
                  </div>

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
                <button
                  type="button"
                  onClick={() => { setActiveModalDeal(deal); setCalcDays(Math.max(deal.minDays, 5)); triggerToast(`Inspecting deal details & calculator for ${deal.title}`); }}
                  className="btn-secondary flex-1 py-3 text-xs font-bold flex items-center justify-center gap-1.5 hover:border-amber hover:text-amber-900"
                >
                  <span className="material-symbols-outlined shrink-0" style={{ fontSize: '18px' }}>calculate</span>
                  <span>Inspect Deal & Save</span>
                </button>
                <Link
                  href={`/browse?deals=true`}
                  onClick={() => triggerToast(`Applying ${deal.couponCode} discount to ${deal.title}...`)}
                  className="btn-primary py-3 px-4 text-xs font-bold flex items-center justify-center gap-1 shadow-md"
                  title="Claim & Book Now"
                >
                  <span className="material-symbols-outlined shrink-0" style={{ fontSize: '18px' }}>shopping_bag</span>
                  <span>Claim</span>
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Detailed Deal Inspection & Savings Calculator Modal */}
        {activeModalDeal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in overflow-y-auto">
            <div className="bg-white rounded-2xl max-w-3xl w-full p-6 md:p-8 shadow-2xl border border-slate/20 space-y-6 max-h-[90vh] overflow-y-auto relative">
              <div className="flex items-start justify-between pb-4 border-b border-slate/15">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-amber text-navy flex items-center justify-center shadow-md font-black text-xl shrink-0">
                    %
                  </div>
                  <div>
                    <span className="px-2.5 py-0.5 rounded-full bg-red-100 text-red-700 text-[10px] font-black uppercase tracking-wider border border-red-300">
                      {activeModalDeal.discountBadge} Promo • Expires in {activeModalDeal.expiresIn}
                    </span>
                    <h2 className="text-lg md:text-xl font-black text-navy mt-1">{activeModalDeal.title}</h2>
                  </div>
                </div>
                <button
                  onClick={() => setActiveModalDeal(null)}
                  className="w-9 h-9 rounded-full bg-slate/10 hover:bg-rose-100 hover:text-rose-600 text-slate flex items-center justify-center transition-colors"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>close</span>
                </button>
              </div>

              {/* Technical Specifications Grid */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-navy flex items-center gap-2">
                  <span className="material-symbols-outlined text-purple-600" style={{ fontSize: '18px' }}>tune</span>
                  <span>Equipment Specifications ({activeModalDeal.brand} • {activeModalDeal.category})</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {activeModalDeal.technicalSpecs.map((spec, i) => (
                    <div key={i} className="bg-ivory p-3 rounded-xl border border-slate/15 text-xs flex justify-between items-center">
                      <span className="text-slate font-medium">{spec.label}:</span>
                      <span className="font-bold text-navy">{spec.val}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Included Free Addons & Value */}
              <div className="bg-purple-50/70 border border-purple-200 rounded-xl p-4 space-y-2.5">
                <h4 className="text-xs font-bold text-purple-900 uppercase flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-purple-700" style={{ fontSize: '18px' }}>card_giftcard</span>
                  <span>Included Promotional Value & Add-ons</span>
                </h4>
                <ul className="space-y-1.5 text-xs text-purple-950 font-semibold">
                  {activeModalDeal.includedAddons.map((addon, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-purple-600 shrink-0" style={{ fontSize: '16px' }}>check_circle</span>
                      <span>{addon}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Interactive Savings Calculator */}
              <div className="bg-navy text-white rounded-xl p-5 border border-amber/30 space-y-4 shadow-md">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
                  <div>
                    <h4 className="text-sm font-black text-amber flex items-center gap-1.5">
                      <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>savings</span>
                      <span>Interactive Deal Savings Calculator</span>
                    </h4>
                    <p className="text-xs text-on-navy">Select your projected rental duration to view instant promotional discounts.</p>
                  </div>
                  <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-lg">
                    <span className="text-xs font-bold text-white">Rental Days:</span>
                    <input
                      type="number"
                      min={activeModalDeal.minDays}
                      max={90}
                      value={calcDays}
                      onChange={(e) => setCalcDays(Math.max(activeModalDeal.minDays, parseInt(e.target.value) || activeModalDeal.minDays))}
                      className="w-16 bg-white text-navy font-black text-xs py-1 px-2 rounded text-center"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                    <span className="text-[10px] text-on-navy uppercase font-bold block">Standard Rate</span>
                    <p className="text-base font-bold text-slate-300 line-through mt-1 font-currency">
                      ${activeModalDeal.originalRateNumeric * calcDays}
                    </p>
                  </div>
                  <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                    <span className="text-[10px] text-amber uppercase font-bold block">Deal Rate ({activeModalDeal.discountBadge})</span>
                    <p className="text-lg font-black text-white mt-1 font-currency">
                      ${activeModalDeal.dailyRateNumeric * calcDays}
                    </p>
                  </div>
                  <div className="bg-emerald-950/60 p-3 rounded-xl border border-emerald-400/40">
                    <span className="text-[10px] text-emerald-400 uppercase font-black block">Your Net Savings</span>
                    <p className="text-lg font-black text-emerald-300 mt-1 font-currency">
                      +${(activeModalDeal.originalRateNumeric - activeModalDeal.dailyRateNumeric) * calcDays}
                    </p>
                  </div>
                </div>
              </div>

              {/* Eligibility & Terms */}
              <div className="space-y-2 bg-ivory p-4 rounded-xl border border-slate/15">
                <h4 className="text-xs font-bold text-navy uppercase flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-amber shrink-0" style={{ fontSize: '18px' }}>rule</span>
                  <span>Promotional Eligibility & Terms</span>
                </h4>
                <ul className="list-disc pl-5 space-y-1 text-xs text-slate font-medium">
                  <li>Minimum booking duration: <strong>{activeModalDeal.minDays} {activeModalDeal.minDays === 1 ? 'Day' : 'Days'}</strong>.</li>
                  {activeModalDeal.eligibilityTerms.map((t, i) => (
                    <li key={i}>{t}</li>
                  ))}
                </ul>
              </div>

              {/* Modal Footer Actions */}
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t border-slate/15">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-navy">Use Coupon at Checkout:</span>
                  <button
                    onClick={() => copyCoupon(activeModalDeal.couponCode)}
                    className="font-mono bg-purple-100 hover:bg-purple-200 text-purple-900 border border-purple-300 font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1"
                  >
                    <span>{activeModalDeal.couponCode}</span>
                    <span className="material-symbols-outlined text-sm">content_copy</span>
                  </button>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => setActiveModalDeal(null)}
                    className="btn-secondary py-2.5 px-5 text-xs font-bold flex-1 sm:flex-initial"
                  >
                    Close
                  </button>
                  <Link
                    href={`/browse?deals=true`}
                    onClick={() => setActiveModalDeal(null)}
                    className="btn-primary py-2.5 px-6 text-xs font-bold flex items-center justify-center gap-1.5 shadow-md flex-1 sm:flex-initial"
                  >
                    <span className="material-symbols-outlined text-sm">shopping_cart_checkout</span>
                    <span>Claim Deal & Book ({activeModalDeal.couponCode})</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

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
