'use client';
import { useState } from 'react';
import PageHero from '@/components/ui/PageHero';

type Tab = 'terms' | 'privacy' | 'cookies';

const content: Record<Tab, { label: string; icon: string; sections: { h: string; p: string }[] }> = {
  terms: {
    label: 'Terms of Service',
    icon: 'gavel',
    sections: [
      { h: '1. Acceptance of terms', p: 'By accessing or using Rentora, you agree to be bound by these Terms of Service and all applicable laws. If you do not agree, please do not use the platform.' },
      { h: '2. Rentals & bookings', p: 'All bookings are subject to availability and confirmation. You agree to use rented items responsibly, return them on time, and cover any damage beyond the included waiver.' },
      { h: '3. Payments & deposits', p: 'Rental fees and refundable deposits are charged at checkout. Deposits are released after the item is returned in acceptable condition, less any applicable fees.' },
      { h: '4. Cancellations', p: 'Cancellations are governed by our Cancellation Policy. Free cancellation windows and partial-refund tiers are shown before you confirm a booking.' },
      { h: '5. Liability', p: 'Rentora facilitates rentals between users and is not liable for indirect damages. Our total liability is limited to the amount paid for the relevant booking.' },
    ],
  },
  privacy: {
    label: 'Privacy Policy',
    icon: 'lock',
    sections: [
      { h: '1. Information we collect', p: 'We collect account details, booking history, payment information, and usage data to operate and improve the platform.' },
      { h: '2. How we use it', p: 'Your data is used to process bookings, prevent fraud, provide support, and personalise your experience. We never sell your personal information.' },
      { h: '3. Sharing', p: 'We share only what is necessary with owners, payment processors, and service providers under strict confidentiality obligations.' },
      { h: '4. Your rights', p: 'You may access, correct, export, or delete your personal data at any time from your account settings, or by contacting our privacy team.' },
      { h: '5. Security', p: 'We use bank-grade encryption and continuous monitoring to keep your information safe, both in transit and at rest.' },
    ],
  },
  cookies: {
    label: 'Cookie Policy',
    icon: 'cookie',
    sections: [
      { h: '1. What are cookies', p: 'Cookies are small text files stored on your device that help us remember your preferences and understand how the platform is used.' },
      { h: '2. Types we use', p: 'Essential cookies keep the site working, analytics cookies help us improve, and preference cookies remember your settings.' },
      { h: '3. Managing cookies', p: 'You can control or delete cookies through your browser settings. Disabling essential cookies may affect core functionality.' },
      { h: '4. Third parties', p: 'Some trusted partners set cookies to provide analytics and secure payments, always under our data-protection standards.' },
    ],
  },
};

export default function LegalPage() {
  const [tab, setTab] = useState<Tab>('terms');
  const active = content[tab];

  return (
    <div className="pb-16">
      <PageHero
        eyebrow="Legal"
        title="Terms, privacy & cookies"
        subtitle="The fine print, in plain language. Last updated June 2024."
        icon="verified"
        crumbs={[{ label: 'Home', href: '/home' }, { label: 'Legal' }]}
      />

      <div className="max-w-[880px] mx-auto px-6 mt-12">
        {/* Tabs */}
        <div className="card p-1.5 flex gap-1 mb-6 sticky top-24 z-10">
          {(Object.keys(content) as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${tab === t ? 'bg-navy text-white shadow-sm' : 'text-slate hover:text-navy'}`}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>{content[t].icon}</span>
              <span className="hidden sm:inline">{content[t].label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="card p-6 md:p-8 animate-fade-in">
          <h2 className="text-h2 text-navy mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined text-amber" style={{ fontSize: '24px' }}>{active.icon}</span>
            {active.label}
          </h2>
          <div className="space-y-6">
            {active.sections.map((s) => (
              <div key={s.h}>
                <h3 className="text-navy font-semibold text-base mb-1.5">{s.h}</h3>
                <p className="text-slate text-sm leading-relaxed">{s.p}</p>
              </div>
            ))}
          </div>
          <p className="text-slate text-xs mt-8 pt-6 border-t border-slate/10">
            Questions about our policies? Email <a href="mailto:legal@luxrent.com" className="text-amber font-medium">legal@luxrent.com</a>.
          </p>
        </div>
      </div>
    </div>
  );
}
