'use client';
import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="bg-ivory/40 min-h-screen pb-20">
      {/* Hero */}
      <section className="bg-navy text-white py-20 px-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-amber/10 via-transparent to-blue-500/10 pointer-events-none" />
        <div className="max-w-3xl mx-auto relative z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-amber text-xs font-semibold uppercase tracking-widest mb-4 border border-white/10">
            <span className="material-symbols-outlined shrink-0" style={{ fontSize: '16px' }}>diamond</span>
            <span>About LuxRent</span>
          </span>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">Redefining Premium Rental Experience</h1>
          <p className="text-on-navy text-base md:text-lg leading-relaxed">
            Founded in 2024, LuxRent connects discerning professionals, travelers, and contractors with the world&apos;s most extraordinary real estate and commercial-grade machinery.
          </p>
        </div>
      </section>

      {/* Metrics */}
      <div className="max-w-[1440px] mx-auto px-6 -mt-10 relative z-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Active Listings', val: '12,500+' },
            { label: 'Verified Vendors', val: '1,420' },
            { label: 'Cities Served', val: '64' },
            { label: 'Client Satisfaction', val: '4.9 / 5.0' },
          ].map((stat, i) => (
            <div key={i} className="bg-white rounded-xl p-6 shadow-xl border border-slate/10 text-center">
              <p className="text-h1 text-navy font-bold">{stat.val}</p>
              <p className="text-xs font-semibold text-slate uppercase tracking-wide mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Mission */}
      <div className="max-w-[1440px] mx-auto px-6 py-20 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <h2 className="text-3xl font-bold text-navy mb-4">Uncompromising Standard of Excellence</h2>
          <p className="text-slate text-sm leading-relaxed mb-4">
            Traditional rental marketplaces suffer from inconsistent quality, hidden fees, and unreliable equipment maintenance. At LuxRent, every single property and asset undergoes a rigorous 50-point inspection before listing approval.
          </p>
          <p className="text-slate text-sm leading-relaxed mb-6">
            Whether you require a waterfront penthouse in Manhattan or an 18,000 lb Caterpillar excavator for a commercial development, our platform delivers guaranteed availability, transparent pricing, and 24/7 dedicated white-glove concierge support.
          </p>
          <div className="flex gap-4">
            <Link href="/browse" className="btn-primary px-6 py-3 text-sm flex items-center justify-center gap-2">
              <span>Explore Catalog</span>
              <span className="material-symbols-outlined shrink-0" style={{ fontSize: '18px' }}>arrow_forward</span>
            </Link>
            <Link href="/support" className="btn-secondary px-6 py-3 text-sm flex items-center justify-center gap-2">
              <span>Contact Concierge</span>
            </Link>
          </div>
        </div>
        <div className="relative h-96 rounded-2xl overflow-hidden shadow-2xl border border-slate/10">
          <img
            src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80"
            alt="Luxury architecture"
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </div>
  );
}
