'use client';
import { useState } from 'react';

export default function ContactPage() {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    setLoading(false);
    setSent(true);
    setForm({ name: '', email: '', phone: '', message: '' });
    setTimeout(() => setSent(false), 5000);
  };

  return (
    <div className="max-w-[1440px] mx-auto px-6 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Contact Info */}
        <div className="lg:col-span-5 space-y-6">
          <div>
            <span className="badge-amber mb-3">Get In Touch</span>
            <h1 className="text-4xl font-bold text-navy mt-2">Connect With Our Team</h1>
            <p className="text-slate text-sm mt-3 leading-relaxed">
              Whether you have questions regarding bespoke enterprise equipment rates or luxury property listings, our specialists are available 24 hours a day.
            </p>
          </div>

          <div className="space-y-4 pt-4 border-t border-slate/10">
            <div className="flex items-start gap-4 p-4 rounded-xl bg-ivory border border-slate/10">
              <span className="material-symbols-outlined shrink-0 text-amber text-2xl mt-0.5">call</span>
              <div>
                <p className="font-bold text-navy text-sm">Concierge Hotline</p>
                <p className="text-slate text-xs mt-0.5">+1 (800) 555-0199 • Available 24/7</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-xl bg-ivory border border-slate/10">
              <span className="material-symbols-outlined shrink-0 text-amber text-2xl mt-0.5">mail</span>
              <div>
                <p className="font-bold text-navy text-sm">Direct Support</p>
                <p className="text-slate text-xs mt-0.5">support@luxrent.com • Replies within 2 hours</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-xl bg-ivory border border-slate/10">
              <span className="material-symbols-outlined shrink-0 text-amber text-2xl mt-0.5">location_on</span>
              <div>
                <p className="font-bold text-navy text-sm">Global Headquarters</p>
                <p className="text-slate text-xs mt-0.5">350 Fifth Avenue, Suite 4800, New York, NY 10118</p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-8 border border-slate/15 shadow-xl">
          <h2 className="text-2xl font-bold text-navy mb-2">Send an Inquiry</h2>
          <p className="text-slate text-xs mb-6">Fill out the form below and an account director will reach out immediately.</p>

          {sent && (
            <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 text-sm flex items-center gap-3">
              <span className="material-symbols-outlined shrink-0 text-2xl">check_circle</span>
              <span>Inquiry received! We will follow up with you promptly.</span>
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate uppercase tracking-wide mb-1.5">Full Name *</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Elena Rostova"
                  className="input-field text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate uppercase tracking-wide mb-1.5">Email Address *</label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="elena@example.com"
                  className="input-field text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate uppercase tracking-wide mb-1.5">Phone Number</label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="+1 (555) 019-2834"
                className="input-field text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate uppercase tracking-wide mb-1.5">Message / Inquiry *</label>
              <textarea
                required
                rows={5}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                placeholder="Tell us about your project dates, location, and equipment requirements..."
                className="input-field text-sm resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 text-sm flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="material-symbols-outlined shrink-0 animate-spin" style={{ fontSize: '18px' }}>refresh</span>
                  <span>Sending Inquiry...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined shrink-0" style={{ fontSize: '18px' }}>send</span>
                  <span>Submit Inquiry</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
