'use client';
import { useState } from 'react';

const docs = [
  { title: 'Adding & Modifying Inventory Items', desc: 'How to configure daily rates, seasonal promotional rules, and variant SKUs.', category: 'Inventory' },
  { title: 'Processing Order Returns & Late Fees', desc: 'Step-by-step procedure for logging damage waivers and calculating overdue balances.', category: 'Orders' },
  { title: 'Security Deposit Escrow Release', desc: 'Automatic vs manual release triggers for credit holds in Stripe/Adyen.', category: 'Payments' },
  { title: 'Role Permissions & Operator Access', desc: 'Managing administrator accounts and regional field dispatch agents.', category: 'Security' },
];

export default function AdminHelpPage() {
  const [search, setSearch] = useState('');

  const filtered = docs.filter((d) => d.title.toLowerCase().includes(search.toLowerCase()) || d.desc.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-[1440px] mx-auto">
      <div>
        <h1 className="text-h1 text-navy">Admin Knowledge Base & Help</h1>
        <p className="text-slate text-sm mt-1">Operational guidelines, API docs, and internal workflow SOPs.</p>
      </div>

      <div className="card p-6 rounded-xl bg-ivory/50 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate/50 shrink-0" style={{ fontSize: '20px' }}>search</span>
          <input
            type="text"
            placeholder="Search documentation..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-10 text-sm bg-white"
          />
        </div>
        <button
          onClick={() => alert('Opening live chat with Level 3 Platform Engineering Support...')}
          className="btn-primary py-2.5 px-5 text-sm shrink-0 flex items-center justify-center gap-1.5"
        >
          <span className="material-symbols-outlined shrink-0" style={{ fontSize: '18px' }}>support_agent</span>
          <span>Contact System Engineer</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filtered.map((item, i) => (
          <div key={i} className="card p-6 rounded-xl flex flex-col justify-between card-hover">
            <div>
              <span className="badge-amber mb-2">{item.category}</span>
              <h3 className="font-bold text-navy text-lg mt-1">{item.title}</h3>
              <p className="text-slate text-xs mt-2 leading-relaxed">{item.desc}</p>
            </div>
            <button
              onClick={() => alert(`Reading internal SOP: ${item.title}`)}
              className="text-amber text-xs font-semibold flex items-center gap-1 mt-6 hover:underline"
            >
              <span>Read Documentation</span>
              <span className="material-symbols-outlined shrink-0" style={{ fontSize: '16px' }}>arrow_forward</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
