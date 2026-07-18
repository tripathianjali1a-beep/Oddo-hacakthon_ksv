'use client';
import { useState } from 'react';

const reportKPIs = [
  { title: 'Gross Rental Revenue (Q3)', value: '$1,482,900', change: '+18.4%', trend: 'up', icon: 'payments' },
  { title: 'Average Utilization Rate', value: '84.2%', change: '+5.1%', trend: 'up', icon: 'speed' },
  { title: 'Security Deposits in Escrow', value: '$340,500', change: 'Fully Collateralized', trend: 'up', icon: 'lock' },
  { title: 'Fleet Maintenance Expense', value: '$42,100', change: '-3.2%', trend: 'down', icon: 'build' },
];

const categoryBreakdown = [
  { name: 'Heavy Machinery (Excavators & Lifts)', revenue: '$820,400', share: '55%', orders: 342 },
  { name: 'Luxury Villas & Residences', revenue: '$440,200', share: '30%', orders: 128 },
  { name: 'Commercial Power Tools & Scaffolding', revenue: '$222,300', share: '15%', orders: 615 },
];

export default function AdminReportsPage() {
  const [range, setRange] = useState('q3');
  const [toast, setToast] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-[1440px] mx-auto relative">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-navy text-white px-5 py-3.5 rounded-xl shadow-2xl border border-amber/30 flex items-center gap-3 animate-slide-up">
          <span className="material-symbols-outlined shrink-0 text-amber" style={{ fontSize: '20px' }}>check_circle</span>
          <span className="text-sm font-semibold">{toast}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate/15 pb-6">
        <div>
          <h1 className="text-h1 text-navy">Financial Reports & Analytics</h1>
          <p className="text-slate text-sm mt-1">Real-time revenue attribution, utilization rates, and fleet ROI metrics.</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={range}
            onChange={(e) => setRange(e.target.value)}
            className="input-field text-sm py-2 px-3.5 bg-white"
          >
            <option value="q3">Q3 2024 (Jul - Sep)</option>
            <option value="q2">Q2 2024 (Apr - Jun)</option>
            <option value="ytd">Year to Date (2024)</option>
          </select>
          <button
            onClick={() => triggerToast('Exporting Q3 Financial Ledger (CSV + PDF)... Check downloads.')}
            className="btn-primary py-2 px-4 text-sm flex items-center justify-center gap-1.5"
          >
            <span className="material-symbols-outlined shrink-0" style={{ fontSize: '18px' }}>download</span>
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {reportKPIs.map((kpi, i) => (
          <div key={i} className="card p-5 rounded-xl flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <span className="text-xs font-semibold text-slate uppercase tracking-wide">{kpi.title}</span>
              <div className="w-9 h-9 rounded-lg bg-amber/10 text-amber flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined shrink-0" style={{ fontSize: '20px' }}>{kpi.icon}</span>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-2xl font-bold text-navy font-currency">{kpi.value}</p>
              <span className={`text-xs font-semibold mt-1 inline-flex items-center gap-0.5 ${kpi.trend === 'up' ? 'text-emerald-600' : 'text-slate'}`}>
                <span>{kpi.change}</span>
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Category Breakdown Table */}
      <div className="card rounded-xl overflow-hidden">
        <div className="p-6 border-b border-slate/10 flex justify-between items-center bg-ivory">
          <div>
            <h2 className="text-h3 text-navy">Revenue by Asset Category</h2>
            <p className="text-slate text-xs mt-0.5">Attribution across real estate and equipment categories</p>
          </div>
          <span className="badge-amber">Updated Live</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface-high text-xs font-semibold text-slate uppercase">
              <tr>
                <th className="py-3.5 px-6">Category</th>
                <th className="py-3.5 px-6">Completed Orders</th>
                <th className="py-3.5 px-6">Gross Revenue</th>
                <th className="py-3.5 px-6">Portfolio Share</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate/10">
              {categoryBreakdown.map((cat, i) => (
                <tr key={i} className="hover:bg-ivory/50 transition-colors">
                  <td className="py-4 px-6 font-semibold text-navy">{cat.name}</td>
                  <td className="py-4 px-6 text-slate font-currency">{cat.orders} orders</td>
                  <td className="py-4 px-6 text-navy font-bold font-currency">{cat.revenue}</td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-32 bg-slate/15 h-2 rounded-full overflow-hidden">
                        <div className="bg-amber h-full rounded-full" style={{ width: cat.share }} />
                      </div>
                      <span className="text-xs font-bold text-navy">{cat.share}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
