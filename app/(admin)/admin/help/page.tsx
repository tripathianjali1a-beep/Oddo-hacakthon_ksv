'use client';
import Link from 'next/link';
import { useState } from 'react';

const guides = [
  { icon: 'inventory_2', title: 'Managing your catalog', desc: 'Add products, set rental rates, and manage availability.', href: '/admin/products' },
  { icon: 'receipt_long', title: 'Processing orders', desc: 'Track rentals, process returns, and handle deposits.', href: '/admin/orders' },
  { icon: 'calendar_today', title: 'Scheduling & availability', desc: 'Block dates and manage your rental calendar.', href: '/admin/schedule' },
  { icon: 'assessment', title: 'Reading your reports', desc: 'Understand revenue, utilisation, and top performers.', href: '/admin/reports' },
  { icon: 'settings', title: 'Configuration', desc: 'Pricing rules, tax, deposits, and store settings.', href: '/admin/configuration' },
  { icon: 'sell', title: 'Pricing & discounts', desc: 'Set up time-bound promos and bulk tiers.', href: '/admin/products' },
];

const faqs = [
  { q: 'How do I process a return and release a deposit?', a: 'Open the order from the Orders page, complete the condition checklist, enter any late or damage fee, then click Process Return. The refundable deposit is released automatically minus any fees.' },
  { q: 'How are rental rates calculated?', a: 'Each product stores hourly, daily, weekly, and monthly rates. Storefront pricing uses the daily rate multiplied by the number of days in the selected period, plus options, waiver, taxes, and deposit.' },
  { q: 'Can I bulk delete products?', a: 'Yes — select the checkboxes in the inventory list and use the Delete action that appears in the toolbar.' },
  { q: 'Where does my data live?', a: 'All data is stored in a local SQLite database and served through the built-in API. Nothing leaves your machine in this environment.' },
];

export default function AdminHelpPage() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="p-6 md:p-8 max-w-[1100px]">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-h1 text-navy">Help & Documentation</h1>
        <p className="text-slate text-sm mt-1">Everything you need to run your rental business on Rentora.</p>
      </div>

      {/* Quick start banner */}
      <div className="card detach detach-dark bg-gradient-to-br from-navy-container to-navy text-white p-6 md:p-8 mb-6 relative overflow-hidden">
        <div className="absolute -top-12 -right-8 w-56 h-56 rounded-full bg-amber/20 blur-[90px]" />
        <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="text-amber text-xs font-semibold uppercase tracking-widest mb-1">Getting started</p>
            <h2 className="text-white font-bold text-xl">New to the admin portal?</h2>
            <p className="text-white/70 text-sm mt-1.5 max-w-[32rem]">Add your first product, then watch it appear instantly in the storefront and your reports.</p>
          </div>
          <Link href="/admin/products" className="btn-primary px-5 py-2.5 text-sm shrink-0">
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add</span>
            Add a product
          </Link>
        </div>
      </div>

      {/* Guides */}
      <h2 className="text-h3 text-navy mb-4">Guides</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {guides.map((g) => (
          <Link key={g.title} href={g.href} className="card card-hover p-5 group">
            <span className="w-11 h-11 rounded-xl bg-amber/10 flex items-center justify-center mb-3 group-hover:bg-amber transition-colors">
              <span className="material-symbols-outlined text-amber group-hover:text-white transition-colors" style={{ fontSize: '22px' }}>{g.icon}</span>
            </span>
            <h3 className="text-navy font-semibold text-sm">{g.title}</h3>
            <p className="text-slate text-xs mt-1 leading-relaxed">{g.desc}</p>
          </Link>
        ))}
      </div>

      {/* FAQ */}
      <h2 className="text-h3 text-navy mb-4">Frequently asked questions</h2>
      <div className="flex flex-col gap-3 mb-8">
        {faqs.map((f, i) => {
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

      {/* Contact */}
      <div className="card p-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-l-4 border-l-amber">
        <div className="flex items-center gap-4">
          <span className="w-11 h-11 rounded-xl bg-amber/10 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-amber" style={{ fontSize: '22px' }}>support_agent</span>
          </span>
          <div>
            <p className="text-navy font-semibold text-sm">Need more help?</p>
            <p className="text-slate text-xs">Our partner success team is here for you.</p>
          </div>
        </div>
        <a href="mailto:partners@luxrent.com" className="btn-primary px-5 py-2.5 text-sm shrink-0">Contact partner support</a>
      </div>
    </div>
  );
}
