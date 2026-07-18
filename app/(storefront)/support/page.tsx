'use client';
import Link from 'next/link';
import { useState } from 'react';
import PageHero from '@/components/ui/PageHero';

const topics = [
  { icon: 'shopping_cart', title: 'Bookings & Orders', desc: 'Reserve, modify, or cancel a rental.', count: 12 },
  { icon: 'payments', title: 'Payments & Deposits', desc: 'Charges, refunds, and security deposits.', count: 9 },
  { icon: 'local_shipping', title: 'Pickup & Delivery', desc: 'Collection, drop-off, and logistics.', count: 7 },
  { icon: 'build', title: 'Equipment & Care', desc: 'Operating guides and maintenance.', count: 8 },
  { icon: 'verified_user', title: 'Trust & Safety', desc: 'Insurance, damage cover, disputes.', count: 6 },
  { icon: 'account_circle', title: 'Your Account', desc: 'Profile, login, and notifications.', count: 5 },
];

const faqs = [
  { q: 'How do security deposits work?', a: 'A refundable deposit is held at checkout and released back to your original payment method within 3–5 business days after the item is returned in good condition. Any damage or late fees are deducted transparently before release.' },
  { q: 'Can I extend my rental period?', a: 'Yes. Open your order and request an extension at least 24 hours before the return date. Availability permitting, the extra days are charged at your existing daily rate.' },
  { q: 'What happens if equipment is damaged?', a: 'Every rental includes a damage waiver. Report any issue immediately through your order page. Minor wear is covered; significant damage may be deducted from your deposit after an assessment.' },
  { q: 'Do you offer delivery to my site?', a: 'Most items support both self-pickup and site delivery. Choose your preference at checkout — delivery fees are calculated by distance and shown before you pay.' },
  { q: 'How do I cancel a booking?', a: 'Cancellations are free up to 48 hours before pickup. See our Cancellation Policy for the full fee schedule and partial-refund windows.' },
  { q: 'Is there 24/7 support during my rental?', a: 'Absolutely. Our concierge team is reachable around the clock by phone and chat for anything from operating questions to on-site assistance.' },
];

export default function SupportPage() {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState<number | null>(0);

  const filtered = faqs.filter((f) => (f.q + f.a).toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="pb-16">
      <PageHero
        eyebrow="Help Center"
        title="How can we help?"
        subtitle="Search our knowledge base or browse popular topics. Still stuck? Our team is one tap away."
        icon="support_agent"
        crumbs={[{ label: 'Home', href: '/home' }, { label: 'Support' }]}
      >
        <div className="relative max-w-[36rem] mx-auto">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-white/50" style={{ fontSize: '20px' }}>search</span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for answers…"
            className="w-full pl-12 pr-4 py-4 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder-white/50 outline-none focus:border-amber focus:bg-white/15 transition-all"
          />
        </div>
      </PageHero>

      <div className="max-w-[1100px] mx-auto px-6 mt-14">
        {/* Topics */}
        <h2 className="text-h2 text-navy mb-1">Browse by topic</h2>
        <p className="text-slate text-sm mb-6">Find articles grouped by what you need.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {topics.map((t) => (
            <div key={t.title} className="card card-hover p-5 cursor-pointer group">
              <div className="flex items-start justify-between">
                <span className="w-11 h-11 rounded-xl bg-amber/10 flex items-center justify-center mb-3 group-hover:bg-amber transition-colors">
                  <span className="material-symbols-outlined text-amber group-hover:text-white transition-colors" style={{ fontSize: '22px' }}>{t.icon}</span>
                </span>
                <span className="badge-slate text-[10px]">{t.count} articles</span>
              </div>
              <h3 className="text-navy font-semibold text-sm">{t.title}</h3>
              <p className="text-slate text-xs mt-1 leading-relaxed">{t.desc}</p>
            </div>
          ))}
        </div>

        {/* FAQ */}
        <h2 className="text-h2 text-navy mt-14 mb-6">Frequently asked questions</h2>
        <div className="flex flex-col gap-3">
          {filtered.length === 0 && (
            <div className="card p-8 text-center text-slate text-sm">No results for &ldquo;{query}&rdquo;. Try different keywords or contact us below.</div>
          )}
          {filtered.map((f, i) => {
            const isOpen = open === i;
            return (
              <div key={f.q} className="card overflow-hidden">
                <button onClick={() => setOpen(isOpen ? null : i)} className="w-full flex items-center justify-between gap-4 p-5 text-left">
                  <span className="text-navy font-semibold text-sm">{f.q}</span>
                  <span className={`material-symbols-outlined text-amber transition-transform shrink-0 ${isOpen ? 'rotate-180' : ''}`} style={{ fontSize: '22px' }}>expand_more</span>
                </button>
                {isOpen && <div className="px-5 pb-5 -mt-1 text-slate text-sm leading-relaxed animate-fade-in">{f.a}</div>}
              </div>
            );
          })}
        </div>

        {/* Contact CTA */}
        <div className="card detach detach-dark bg-gradient-to-br from-navy-container to-navy text-white p-8 md:p-10 mt-12 text-center relative overflow-hidden">
          <div className="absolute -top-12 -right-8 w-56 h-56 rounded-full bg-amber/20 blur-[90px]" />
          <div className="relative">
            <h3 className="text-white font-bold text-2xl">Still need a hand?</h3>
            <p className="text-white/70 text-sm mt-2 max-w-[32rem] mx-auto">Our concierge team responds in minutes, 24 hours a day. We&apos;re here for you.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
              <Link href="/contact" className="btn-primary px-6 py-3">
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>chat</span>
                Contact support
              </Link>
              <a href="tel:+18005550199" className="btn-outline-light px-6 py-3">
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>call</span>
                +1 (800) 555-0199
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
