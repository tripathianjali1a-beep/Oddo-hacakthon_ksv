'use client';
import Link from 'next/link';

export default function TrustPage() {
  const pillars = [
    { icon: 'verified_user', title: '$2,000,000 Host & Renter Protection', desc: 'Comprehensive property and equipment liability insurance backed by top-tier global underwriters on every reservation.' },
    { icon: 'fact_check', title: '50-Point Physical Inspection', desc: 'Every heavy machinery unit and luxury property undergoes recurring quarterly checks for safety compliance and mechanical integrity.' },
    { icon: 'lock', title: 'Bank-Grade Payment Escrow', desc: 'Funds are held securely in escrow until 24 hours after check-in or equipment delivery to ensure total satisfaction.' },
    { icon: 'gavel', title: 'Arbitration & Rapid Dispute Resolution', desc: 'Our dedicated legal and claims concierge resolves security deposit or damage inquiries within 48 hours.' },
  ];

  return (
    <div className="bg-ivory/30 min-h-screen pb-20">
      {/* Hero */}
      <section className="bg-navy text-white py-20 px-6 text-center relative overflow-hidden">
        <div className="max-w-3xl mx-auto relative z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-emerald-400 text-xs font-semibold uppercase tracking-widest mb-4 border border-white/10">
            <span className="material-symbols-outlined shrink-0" style={{ fontSize: '16px' }}>security</span>
            <span>Trust & Safety Guarantee</span>
          </span>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4">Peace of Mind on Every Rental</h1>
          <p className="text-on-navy text-base md:text-lg">
            Our multi-layer protection framework shields both renters and asset owners from risk, fraud, and unexpected downtime.
          </p>
        </div>
      </section>

      {/* Pillars */}
      <div className="max-w-[1440px] mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-2 gap-8">
        {pillars.map((item, i) => (
          <div key={i} className="bg-white rounded-2xl p-8 border border-slate/15 shadow-md flex gap-5 items-start card-hover">
            <div className="w-14 h-14 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined shrink-0" style={{ fontSize: '30px' }}>{item.icon}</span>
            </div>
            <div>
              <h3 className="font-bold text-navy text-xl mb-2">{item.title}</h3>
              <p className="text-slate text-sm leading-relaxed">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="max-w-3xl mx-auto px-6 text-center">
        <div className="bg-white rounded-2xl p-8 border border-slate/15 shadow-sm">
          <h2 className="text-2xl font-bold text-navy mb-2">Have a Trust or Verification Question?</h2>
          <p className="text-slate text-xs mb-6">Our risk and compliance team can verify your corporate insurance certificates within minutes.</p>
          <Link href="/support" className="btn-primary px-6 py-3 text-sm inline-flex items-center gap-2">
            <span>Contact Safety Desk</span>
            <span className="material-symbols-outlined shrink-0" style={{ fontSize: '18px' }}>arrow_forward</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
