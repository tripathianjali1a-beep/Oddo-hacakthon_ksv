'use client';

import { useState } from 'react';

const pressReleases = [
  { date: 'October 14, 2024', title: 'LuxRent Secures $45M Series B to Expand Enterprise Equipment & Architecture Fleet', source: 'Wall Street Journal' },
  { date: 'August 02, 2024', title: 'How AI-Driven Inspection Protocols Are Revolutionizing Commercial Asset Sharing', source: 'Forbes' },
  { date: 'May 19, 2024', title: 'LuxRent Named Top 10 Most Innovative Marketplace Platforms of 2024', source: 'TechCrunch' },
];

export default function PressPage() {
  const [toast, setToast] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  return (
    <div className="bg-ivory/40 min-h-screen pb-20 relative">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-navy text-white px-5 py-3.5 rounded-xl shadow-2xl border border-amber/30 flex items-center gap-3 animate-slide-up">
          <span className="material-symbols-outlined shrink-0 text-amber" style={{ fontSize: '20px' }}>check_circle</span>
          <span className="text-sm font-semibold">{toast}</span>
        </div>
      )}

      {/* Hero */}
      <section className="bg-navy text-white py-20 px-6 text-center">
        <div className="max-w-3xl mx-auto">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-amber text-xs font-semibold uppercase tracking-widest mb-4 border border-white/10">
            <span className="material-symbols-outlined shrink-0" style={{ fontSize: '16px' }}>newspaper</span>
            <span>Press & Media Room</span>
          </span>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4">News & Announcements</h1>
          <p className="text-on-navy text-base">Media kits, brand guidelines, and official press coverage for LuxRent.</p>
        </div>
      </section>

      {/* Content */}
      <div className="max-w-[1440px] mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-12 gap-10">
        <div className="md:col-span-8 space-y-6">
          <h2 className="text-2xl font-bold text-navy mb-4">Recent Press Coverage</h2>
          {pressReleases.map((pr, i) => (
            <div key={i} className="bg-white rounded-xl p-6 border border-slate/15 shadow-sm card-hover flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <p className="text-xs font-semibold text-amber uppercase tracking-wider">{pr.source} • {pr.date}</p>
                <h3 className="font-bold text-navy text-lg mt-1">{pr.title}</h3>
              </div>
              <button onClick={() => triggerToast(`Opened press release: "${pr.title}" (${pr.source})`)} className="btn-secondary px-4 py-2 text-xs shrink-0">Read Article</button>
            </div>
          ))}
        </div>

        <div className="md:col-span-4 space-y-6">
          <div className="bg-white rounded-xl p-6 border border-slate/15 shadow-md">
            <h3 className="font-bold text-navy text-lg mb-2">Media & Kit Resources</h3>
            <p className="text-slate text-xs mb-4">Download official vector logos, executive headshots, and brand color tokens.</p>
            <button onClick={() => triggerToast('Downloading LuxRent_Media_Kit_2024.zip archive... Check downloads.')} className="btn-primary w-full py-2.5 text-xs flex items-center justify-center gap-1.5">
              <span className="material-symbols-outlined shrink-0" style={{ fontSize: '18px' }}>download</span>
              <span>Download Media Kit (ZIP)</span>
            </button>
          </div>

          <div className="bg-navy rounded-xl p-6 text-white shadow-md">
            <h3 className="font-bold text-white text-lg mb-2">Media Inquiries</h3>
            <p className="text-on-navy text-xs mb-4">For interview requests or commentary, reach our communications desk directly.</p>
            <a href="mailto:press@luxrent.com" className="text-amber text-xs font-semibold hover:underline">press@luxrent.com</a>
          </div>
        </div>
      </div>
    </div>
  );
}
