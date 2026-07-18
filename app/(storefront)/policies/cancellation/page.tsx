'use client';
import Link from 'next/link';

export default function CancellationPolicyPage() {
  const tiers = [
    { name: 'Flexible', refund: '100% Refund', deadline: 'Up to 24 hours before check-in or equipment dispatch.', desc: 'Ideal for variable project timelines. Cancel anytime up to 24 hours prior without penalty.' },
    { name: 'Standard (Most Popular)', refund: '100% Refund (up to 48 hours)', deadline: '50% refund if cancelled within 48 hours of check-in.', desc: 'Applies to standard machinery and villa rentals. Balance refunded automatically to the payment method.' },
    { name: 'Strict & Enterprise Fleet', refund: 'Full refund within 48h of booking', deadline: 'No refund within 7 days of long-term equipment mobilization.', desc: 'Applies to custom equipment mobilization and multi-month commercial leases.' },
  ];

  return (
    <div className="bg-ivory/30 min-h-screen pb-20">
      {/* Hero */}
      <section className="bg-navy text-white py-16 px-6 text-center">
        <div className="max-w-3xl mx-auto">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-amber text-xs font-semibold uppercase tracking-widest mb-4 border border-white/10">
            <span className="material-symbols-outlined shrink-0" style={{ fontSize: '16px' }}>event_busy</span>
            <span>Policy Guidelines</span>
          </span>
          <h1 className="text-4xl font-bold tracking-tight mb-3">Cancellation & Refund Policy</h1>
          <p className="text-on-navy text-sm">Transparent, fair cancellation terms designed for enterprise contractors and private guests.</p>
        </div>
      </section>

      {/* Policy Cards */}
      <div className="max-w-[1440px] mx-auto px-6 py-14 grid grid-cols-1 md:grid-cols-3 gap-8">
        {tiers.map((t, i) => (
          <div key={i} className="bg-white rounded-2xl p-8 border border-slate/15 shadow-md flex flex-col justify-between card-hover">
            <div>
              <span className="badge-amber mb-3">{t.name}</span>
              <h3 className="font-bold text-navy text-2xl mt-2 font-currency">{t.refund}</h3>
              <p className="text-xs font-semibold text-slate mt-1">{t.deadline}</p>
              <p className="text-slate text-sm mt-4 leading-relaxed">{t.desc}</p>
            </div>
            <div className="mt-8 pt-4 border-t border-slate/10 text-xs text-amber font-semibold flex items-center gap-1">
              <span>Verified Protection</span>
              <span className="material-symbols-outlined shrink-0" style={{ fontSize: '16px' }}>check_circle</span>
            </div>
          </div>
        ))}
      </div>

      <div className="max-w-3xl mx-auto px-6 text-center">
        <p className="text-slate text-xs mb-4">Need to cancel or reschedule an active reservation right now?</p>
        <Link href="/support" className="btn-secondary px-6 py-2.5 text-xs inline-flex items-center gap-1.5">
          <span>Go to Support Desk</span>
        </Link>
      </div>
    </div>
  );
}
