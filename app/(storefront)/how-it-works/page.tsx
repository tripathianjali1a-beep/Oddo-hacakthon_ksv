'use client';
import Link from 'next/link';

export default function HowItWorksPage() {
  const steps = [
    {
      step: '01',
      title: 'Browse & Filter with Precision',
      desc: 'Explore thousands of verified luxury homes, corporate penthouses, and commercial machinery. Filter by exact specifications, operating weight, rental duration, and delivery radius.',
      icon: 'search',
    },
    {
      step: '02',
      title: 'Automated Verification & Instant Booking',
      desc: 'Our AI identity protocol verifies required permits and insurance within seconds. Reserve with instant booking or request custom multi-month proposals directly from verified vendors.',
      icon: 'verified_user',
    },
    {
      step: '03',
      title: 'White-Glove Delivery & Inspection',
      desc: 'Equipment is dispatched to your job site or property prepared with fresh detailing. Every check-in is logged with digital timestamped condition reports and video walkthroughs.',
      icon: 'local_shipping',
    },
    {
      step: '04',
      title: '24/7 Concierge & Seamless Return',
      desc: 'Throughout your rental, access our dedicated technical support and emergency field service. When your reservation concludes, returns are finalized effortlessly with immediate deposit release.',
      icon: 'support_agent',
    },
  ];

  return (
    <div className="bg-ivory/30 min-h-screen pb-20">
      {/* Hero Banner */}
      <section className="bg-navy text-white py-20 px-6 text-center relative overflow-hidden">
        <div className="max-w-3xl mx-auto relative z-10">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/10 text-amber text-xs font-semibold uppercase tracking-widest mb-4 border border-white/10">
            <span className="material-symbols-outlined shrink-0" style={{ fontSize: '16px' }}>menu_book</span>
            <span>Platform Workflow</span>
          </span>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">How LuxRent Works</h1>
          <p className="text-on-navy text-base md:text-lg leading-relaxed">
            From first search to final check-out, experience an enterprise-grade marketplace built for speed, security, and uncompromising quality.
          </p>
        </div>
      </section>

      {/* Steps Grid */}
      <div className="max-w-[1440px] mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((item) => (
            <div key={item.step} className="bg-white rounded-2xl p-8 border border-slate/15 shadow-lg relative flex flex-col items-start card-hover">
              <span className="text-6xl font-black text-slate/10 absolute top-4 right-6 pointer-events-none">{item.step}</span>
              <div className="w-14 h-14 rounded-xl bg-amber/10 text-amber flex items-center justify-center mb-6 shadow-sm">
                <span className="material-symbols-outlined shrink-0" style={{ fontSize: '30px' }}>{item.icon}</span>
              </div>
              <h3 className="font-bold text-navy text-xl mb-3 leading-snug">{item.title}</h3>
              <p className="text-slate text-xs leading-relaxed mt-auto">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Band */}
      <div className="max-w-[1440px] mx-auto px-6 mt-6">
        <div className="bg-navy rounded-3xl p-10 md:p-14 text-white flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-80 h-80 bg-amber/20 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
          <div className="max-w-xl relative z-10">
            <h2 className="text-3xl font-bold tracking-tight mb-3">Ready to Experience Premium Rentals?</h2>
            <p className="text-on-navy text-sm leading-relaxed">
              Join thousands of contractors, enterprise teams, and private travelers who rely on LuxRent every day.
            </p>
          </div>
          <div className="flex flex-wrap gap-4 relative z-10 shrink-0">
            <Link href="/browse" className="btn-primary px-7 py-3.5 text-sm flex items-center justify-center gap-2">
              <span>Browse Catalog</span>
              <span className="material-symbols-outlined shrink-0" style={{ fontSize: '18px' }}>arrow_forward</span>
            </Link>
            <Link href="/support" className="btn-secondary px-7 py-3.5 text-sm flex items-center justify-center gap-2">
              <span>Ask Questions</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
