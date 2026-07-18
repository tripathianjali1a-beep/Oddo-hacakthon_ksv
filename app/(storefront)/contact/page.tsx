'use client';
import { useState } from 'react';
import PageHero from '@/components/ui/PageHero';

const channels = [
  { icon: 'call', title: 'Call us', value: '+1 (800) 555-0199', sub: 'Mon–Sun, 24 hours' },
  { icon: 'mail', title: 'Email', value: 'hello@luxrent.com', sub: 'Replies within 2 hours' },
  { icon: 'location_on', title: 'Visit', value: '350 Fifth Avenue', sub: 'New York, NY 10118' },
];

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: 'General enquiry', message: '' });
  const [sent, setSent] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return;
    setSent(true);
    setForm({ name: '', email: '', subject: 'General enquiry', message: '' });
    setTimeout(() => setSent(false), 4000);
  };

  return (
    <div className="pb-16">
      <PageHero
        eyebrow="Contact"
        title="Let's talk"
        subtitle="Questions, feedback, or a bespoke request — reach out and a real person will get back to you fast."
        icon="forum"
        crumbs={[{ label: 'Home', href: '/home' }, { label: 'Contact' }]}
      />

      <div className="max-w-[1100px] mx-auto px-6 mt-14 grid lg:grid-cols-3 gap-6">
        {/* Channels */}
        <div className="space-y-4">
          {channels.map((c) => (
            <div key={c.title} className="card p-5 flex items-start gap-4">
              <span className="w-11 h-11 rounded-xl bg-amber/10 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-amber" style={{ fontSize: '22px' }}>{c.icon}</span>
              </span>
              <div>
                <p className="text-[11px] font-semibold text-slate uppercase tracking-wide">{c.title}</p>
                <p className="text-navy font-semibold text-sm mt-0.5">{c.value}</p>
                <p className="text-slate text-xs mt-0.5">{c.sub}</p>
              </div>
            </div>
          ))}
          <div className="card p-5">
            <p className="text-[11px] font-semibold text-slate uppercase tracking-wide mb-2">Response time</p>
            <div className="flex items-center gap-2 text-emerald-600 text-sm font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Typically under 2 hours
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="lg:col-span-2">
          <div className="card p-6 md:p-8">
            <h2 className="text-h3 text-navy mb-1">Send us a message</h2>
            <p className="text-slate text-sm mb-6">We&apos;ll route it to the right team and reply by email.</p>

            {sent && (
              <div className="mb-5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm rounded-xl px-4 py-3 flex items-center gap-2 animate-fade-in">
                <span className="material-symbols-outlined" style={{ fontSize: '18px', fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                Thanks! Your message has been sent — we&apos;ll be in touch shortly.
              </div>
            )}

            <form onSubmit={submit} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate uppercase tracking-wide mb-1.5">Full name *</label>
                  <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field" placeholder="John Smith" required />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate uppercase tracking-wide mb-1.5">Email *</label>
                  <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input-field" placeholder="you@example.com" required />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate uppercase tracking-wide mb-1.5">Subject</label>
                <select value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} className="input-field">
                  <option>General enquiry</option>
                  <option>Booking support</option>
                  <option>Billing & refunds</option>
                  <option>Become a vendor</option>
                  <option>Press & media</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate uppercase tracking-wide mb-1.5">Message *</label>
                <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} rows={5} className="input-field resize-none" placeholder="How can we help?" required />
              </div>
              <button type="submit" className="btn-primary px-6 py-3">
                Send message
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>send</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
