import Link from 'next/link';
import PageHero from '@/components/ui/PageHero';

const steps = [
  { icon: 'search', title: 'Discover', desc: 'Browse a curated fleet of heavy machinery, power tools, and studio gear. Filter by category, dates, and budget to find the right unit.' },
  { icon: 'event_available', title: 'Book instantly', desc: 'Pick your rental period, add any attachments, and check live availability. Secure checkout with a fully refundable deposit.' },
  { icon: 'local_shipping', title: 'Pickup or delivery', desc: 'Collect from our depot or have it delivered straight to your site. Everything arrives inspected, fuelled and ready to work.' },
  { icon: 'task_alt', title: 'Use & return', desc: 'Run the job worry-free with 24/7 support and full damage cover. Return it, and your deposit is released automatically.' },
];

const forOwners = [
  { icon: 'add_business', title: 'List in minutes', desc: 'Create your listing, set your rates, and go live.' },
  { icon: 'payments', title: 'Earn on your terms', desc: 'Secure weekly payouts with no listing fees.' },
  { icon: 'shield', title: 'Stay protected', desc: 'Full damage protection and verified renters.' },
];

export default function HowItWorksPage() {
  return (
    <div className="pb-16">
      <PageHero
        eyebrow="How it works"
        title="From search to job site in four steps"
        subtitle="Renting with Rentora is designed to be effortless. Here's exactly how it works."
        icon="bolt"
        crumbs={[{ label: 'Home', href: '/home' }, { label: 'How it works' }]}
      />

      {/* Steps */}
      <div className="max-w-[1100px] mx-auto px-6 mt-14">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {steps.map((s, i) => (
            <div key={s.title} className="card p-6 relative">
              <span className="absolute top-5 right-6 text-6xl font-bold text-amber/10 select-none">{i + 1}</span>
              <span className="w-12 h-12 rounded-xl bg-amber/10 flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-amber" style={{ fontSize: '24px' }}>{s.icon}</span>
              </span>
              <h3 className="text-navy font-semibold text-lg mb-2">{s.title}</h3>
              <p className="text-slate text-sm leading-relaxed max-w-[26rem]">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* For owners */}
      <div className="max-w-[1100px] mx-auto px-6 mt-16">
        <div className="card detach detach-dark bg-gradient-to-br from-navy-container to-navy text-white p-8 md:p-12 relative overflow-hidden">
          <div className="absolute -top-16 -right-10 w-72 h-72 rounded-full bg-amber/20 blur-[100px]" />
          <div className="relative">
            <p className="text-amber text-xs font-semibold uppercase tracking-widest mb-2">For owners</p>
            <h2 className="text-white font-bold text-2xl md:text-3xl">Have equipment to rent out?</h2>
            <p className="text-white/70 text-sm mt-3 max-w-[36rem]">Turn idle machinery into steady income. We handle bookings, payments, and support so you don&apos;t have to.</p>
            <div className="grid sm:grid-cols-3 gap-4 mt-8">
              {forOwners.map((o) => (
                <div key={o.title} className="rounded-2xl bg-white/[0.06] border border-white/10 p-5">
                  <span className="material-symbols-outlined text-amber mb-2" style={{ fontSize: '24px' }}>{o.icon}</span>
                  <p className="text-white font-semibold text-sm">{o.title}</p>
                  <p className="text-white/60 text-xs mt-1">{o.desc}</p>
                </div>
              ))}
            </div>
            <Link href="/login" className="btn-primary mt-8 inline-flex px-6 py-3">
              Become a vendor
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>arrow_forward</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
