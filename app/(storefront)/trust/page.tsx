import Link from 'next/link';
import PageHero from '@/components/ui/PageHero';

const pillars = [
  { icon: 'verified_user', title: 'Verified listings', desc: 'Every item is inspected and certified by our team before going live, with real photos and honest specs.' },
  { icon: 'lock', title: 'Protected payments', desc: 'Bank-grade encryption, secure escrow for deposits, and full refund protection on every booking.' },
  { icon: 'shield', title: 'Damage cover', desc: 'A damage waiver is built into every rental, so accidents don’t become expensive surprises.' },
  { icon: 'fingerprint', title: 'Verified identities', desc: 'Both renters and owners are ID-verified, keeping the marketplace safe on both sides.' },
  { icon: 'gavel', title: 'Fair resolutions', desc: 'A dedicated team mediates any dispute quickly and transparently, with clear evidence trails.' },
  { icon: 'support_agent', title: '24/7 assistance', desc: 'Round-the-clock support for anything from operating questions to on-site emergencies.' },
];

const safetySteps = [
  'Read the listing details, specs, and reviews before booking.',
  'Keep all communication and payments on LuxRent.',
  'Inspect the item at pickup and report issues immediately.',
  'Return on time and in the condition you received it.',
];

export default function TrustPage() {
  return (
    <div className="pb-16">
      <PageHero
        eyebrow="Trust & Safety"
        title="Rent with total peace of mind"
        subtitle="Safety isn't a feature — it's the foundation. Here's how we protect every renter and owner on LuxRent."
        icon="verified_user"
        crumbs={[{ label: 'Home', href: '/home' }, { label: 'Trust & Safety' }]}
      />

      {/* Pillars */}
      <div className="max-w-[1100px] mx-auto px-6 mt-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {pillars.map((p) => (
            <div key={p.title} className="card card-hover p-6">
              <span className="w-12 h-12 rounded-xl bg-amber/10 flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-amber" style={{ fontSize: '24px' }}>{p.icon}</span>
              </span>
              <h3 className="text-navy font-semibold text-base mb-1.5">{p.title}</h3>
              <p className="text-slate text-sm leading-relaxed">{p.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Safety checklist */}
      <div className="max-w-[1100px] mx-auto px-6 mt-14 grid lg:grid-cols-2 gap-6 items-center">
        <div className="card overflow-hidden h-72 lg:h-80">
          <img src="https://images.unsplash.com/photo-1521791136064-7986c2920216?w=900&q=80" alt="Handshake" className="w-full h-full object-cover" />
        </div>
        <div className="card p-6 md:p-8">
          <h2 className="text-h3 text-navy mb-4">Your safety checklist</h2>
          <ul className="space-y-3">
            {safetySteps.map((s) => (
              <li key={s} className="flex items-start gap-3 text-sm text-navy">
                <span className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="material-symbols-outlined text-emerald-600" style={{ fontSize: '15px', fontVariationSettings: "'FILL' 1" }}>check</span>
                </span>
                {s}
              </li>
            ))}
          </ul>
          <Link href="/support" className="btn-secondary mt-6 inline-flex px-5 py-2.5 text-sm">Read the help center</Link>
        </div>
      </div>

      {/* Report banner */}
      <div className="max-w-[1100px] mx-auto px-6 mt-12">
        <div className="card p-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-l-4 border-l-amber">
          <div className="flex items-center gap-4">
            <span className="w-11 h-11 rounded-xl bg-amber/10 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-amber" style={{ fontSize: '22px' }}>flag</span>
            </span>
            <div>
              <p className="text-navy font-semibold text-sm">See something concerning?</p>
              <p className="text-slate text-xs">Report it and our safety team will act within the hour.</p>
            </div>
          </div>
          <Link href="/contact" className="btn-primary px-5 py-2.5 text-sm shrink-0">Report an issue</Link>
        </div>
      </div>
    </div>
  );
}
