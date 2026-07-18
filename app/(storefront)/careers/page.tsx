'use client';
import Link from 'next/link';

const openings = [
  { id: 1, title: 'Senior Full Stack Engineer (Next.js / Node)', team: 'Engineering', location: 'New York, NY (Hybrid)', type: 'Full-Time' },
  { id: 2, title: 'VP of Vendor Acquisition & Partnerships', team: 'Operations', location: 'Remote (US/Europe)', type: 'Full-Time' },
  { id: 3, title: 'Senior UX/UI Product Designer', team: 'Design', location: 'San Francisco, CA', type: 'Full-Time' },
  { id: 4, title: 'Fleet & Equipment Inspection Specialist', team: 'Quality Assurance', location: 'Chicago, IL', type: 'Full-Time' },
  { id: 5, title: 'Enterprise Concierge Account Coordinator', team: 'Support', location: 'Austin, TX', type: 'Full-Time' },
];

export default function CareersPage() {
  return (
    <div className="bg-ivory/40 min-h-screen pb-20">
      {/* Hero */}
      <section className="bg-navy text-white py-20 px-6 text-center relative overflow-hidden">
        <div className="max-w-3xl mx-auto relative z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-amber text-xs font-semibold uppercase tracking-widest mb-4 border border-white/10">
            <span className="material-symbols-outlined shrink-0" style={{ fontSize: '16px' }}>work</span>
            <span>Join Our Mission</span>
          </span>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">Build the Future of Luxury Rentals</h1>
          <p className="text-on-navy text-base md:text-lg leading-relaxed">
            We are looking for passionate problem solvers, engineers, and customer advocates to revolutionize commercial asset sharing and premium travel.
          </p>
        </div>
      </section>

      {/* Perks */}
      <div className="max-w-[1440px] mx-auto px-6 py-16">
        <h2 className="text-2xl font-bold text-navy text-center mb-10">Why Work With LuxRent?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: 'favorite', title: 'Comprehensive Wellness', desc: '100% employer-covered health, dental, and vision insurance for you and your family.' },
            { icon: 'flight_takeoff', title: 'Annual Travel & Rental Credit', desc: '$4,000 annual platform stipend to stay in any luxury property or rent machinery.' },
            { icon: 'trending_up', title: 'Competitive Equity & 401(k)', desc: 'Generous stock option packages paired with a 5% instant 401(k) company match.' },
          ].map((perk, i) => (
            <div key={i} className="bg-white rounded-xl p-6 border border-slate/15 shadow-md">
              <div className="w-12 h-12 rounded-xl bg-amber/10 text-amber flex items-center justify-center mb-4">
                <span className="material-symbols-outlined shrink-0" style={{ fontSize: '26px' }}>{perk.icon}</span>
              </div>
              <h3 className="font-bold text-navy text-lg mb-2">{perk.title}</h3>
              <p className="text-slate text-xs leading-relaxed">{perk.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Openings */}
      <div className="max-w-[1440px] mx-auto px-6 pb-12">
        <h2 className="text-2xl font-bold text-navy mb-6">Current Open Positions</h2>
        <div className="space-y-4">
          {openings.map((job) => (
            <div key={job.id} className="bg-white rounded-xl p-6 border border-slate/15 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 card-hover">
              <div>
                <span className="badge-amber mb-2">{job.team}</span>
                <h3 className="font-bold text-navy text-lg mt-1">{job.title}</h3>
                <div className="flex items-center gap-4 text-xs text-slate mt-2">
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined shrink-0" style={{ fontSize: '16px' }}>location_on</span>
                    {job.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined shrink-0" style={{ fontSize: '16px' }}>schedule</span>
                    {job.type}
                  </span>
                </div>
              </div>
              <button
                onClick={() => alert(`Applying for ${job.title}. Our recruiting team will connect with you via email.`)}
                className="btn-primary px-5 py-2.5 text-sm shrink-0 flex items-center justify-center gap-1.5"
              >
                <span>Apply Now</span>
                <span className="material-symbols-outlined shrink-0" style={{ fontSize: '16px' }}>arrow_forward</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
