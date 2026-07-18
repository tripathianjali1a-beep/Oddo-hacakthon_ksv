'use client';
import { useState } from 'react';

export default function LegalPage() {
  const [activeTab, setActiveTab] = useState<'terms' | 'privacy' | 'cookies'>('terms');

  return (
    <div className="bg-ivory/30 min-h-screen pb-20">
      {/* Hero */}
      <section className="bg-navy text-white py-16 px-6 text-center">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold tracking-tight mb-3">Legal, Privacy & Compliance</h1>
          <p className="text-on-navy text-sm">Please review our terms of service, data privacy protocols, and cookie guidelines.</p>
        </div>
      </section>

      {/* Tabs */}
      <div className="max-w-[1440px] mx-auto px-6 py-10">
        <div className="flex border-b border-slate/20 mb-8 gap-6">
          {[
            { id: 'terms', label: 'Terms of Service' },
            { id: 'privacy', label: 'Privacy Policy' },
            { id: 'cookies', label: 'Cookie Policy' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-3.5 text-sm font-semibold transition-colors relative ${
                activeTab === tab.id ? 'text-navy' : 'text-slate hover:text-navy'
              }`}
            >
              {tab.label}
              {activeTab === tab.id && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber rounded-full" />}
            </button>
          ))}
        </div>

        {/* Content Box */}
        <div className="bg-white rounded-2xl p-8 md:p-12 border border-slate/15 shadow-sm max-w-4xl mx-auto text-sm leading-relaxed space-y-6 text-on-surface-variant">
          {activeTab === 'terms' && (
            <>
              <h2 className="text-2xl font-bold text-navy mb-4">LuxRent Terms of Service</h2>
              <p>Effective Date: January 1, 2024</p>
              <h3 className="text-lg font-bold text-navy mt-6">1. Platform Scope and Eligibility</h3>
              <p>LuxRent operates as a peer-to-peer and enterprise marketplace connecting property owners and heavy equipment operators with verified renters. Users must be at least 21 years of age and hold valid government credentials to book machinery or luxury residences.</p>
              <h3 className="text-lg font-bold text-navy mt-6">2. Security Deposits & Escrow</h3>
              <p>By confirming a booking, you authorize a credit hold equal to the item&apos;s security deposit. Holds are automatically released within 3-5 business days upon damage-free return verified by the lessor.</p>
              <h3 className="text-lg font-bold text-navy mt-6">3. Equipment Operation & Safety Compliance</h3>
              <p>Renters operating heavy machinery (excavators, forklifts, aerial platforms) warrant that operators hold valid OSHA certifications or applicable regional operator licenses. LuxRent disclaims liability for improper operation.</p>
            </>
          )}

          {activeTab === 'privacy' && (
            <>
              <h2 className="text-2xl font-bold text-navy mb-4">Global Privacy Policy</h2>
              <p>We prioritize the confidentiality of your personal, corporate, and financial data in accordance with GDPR and CCPA guidelines.</p>
              <h3 className="text-lg font-bold text-navy mt-6">1. Data Collection and Usage</h3>
              <p>We collect identity verification documents (photo ID, corporate permits) strictly for fraud prevention and insurance underwriting. Data is encrypted using AES-256 standards both in transit and at rest.</p>
              <h3 className="text-lg font-bold text-navy mt-6">2. Third-Party Sharing</h3>
              <p>We do not sell personal data. Information is shared exclusively with verified lessors upon reservation confirmation to facilitate check-in and delivery.</p>
            </>
          )}

          {activeTab === 'cookies' && (
            <>
              <h2 className="text-2xl font-bold text-navy mb-4">Cookie & Tracking Policy</h2>
              <p>We utilize essential and performance cookies to maintain secure authentication sessions and remember your currency and location preferences across our marketplace.</p>
              <h3 className="text-lg font-bold text-navy mt-6">1. Essential Cookies</h3>
              <p>Required for login persistence, shopping cart state, and CSRF security protection. These cannot be disabled without impairing core site functionality.</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
