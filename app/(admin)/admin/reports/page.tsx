'use client';
import { useState } from 'react';

const adminKPIs = [
  { title: 'Gross Platform Revenue (Q3)', value: '$1,482,900', change: '+18.4% YoY', trend: 'up', icon: 'payments' },
  { title: 'Average Utilization Rate', value: '84.2%', change: '+5.1% vs Q2', trend: 'up', icon: 'speed' },
  { title: 'Security Deposits in Escrow', value: '$340,500', change: '100% Collateralized', trend: 'up', icon: 'lock' },
  { title: 'Platform Commission Share (15%)', value: '$222,435', change: '+19.2% Net', trend: 'up', icon: 'account_balance_wallet' },
];

const vendorKPIs = [
  { title: 'My Vendor Revenue (Net)', value: '$142,500', change: '+12.5% this month', trend: 'up', icon: 'payments' },
  { title: 'Active Equipment Leases', value: '28 Units', change: '92% Utilization', trend: 'up', icon: 'inventory_2' },
  { title: 'Pending Escrow Releases', value: '$18,400', change: 'Due post-inspection', trend: 'up', icon: 'shield' },
  { title: 'Average Equipment Rating', value: '4.92 ★', change: '+0.12 vs platform avg', trend: 'up', icon: 'star' },
];

const adminBreakdown = [
  { name: 'Heavy Machinery (Excavators & Cranes)', revenue: '$820,400', share: '55%', orders: 342, status: 'High Demand' },
  { name: 'Luxury Villas & Residences', revenue: '$440,200', share: '30%', orders: 128, status: 'Peak Season' },
  { name: 'Commercial Power Tools & Scaffolding', revenue: '$222,300', share: '15%', orders: 615, status: 'Stable' },
];

const vendorBreakdown = [
  { name: 'CAT 320 Hydraulic Excavator', revenue: '$68,000', share: '48%', orders: 42, status: 'Leased Out' },
  { name: 'Toyota Forklift 8FGU25 (Fleet x4)', revenue: '$45,200', share: '32%', orders: 88, status: 'Active' },
  { name: 'Scaffolding Aerial Lift 40ft', revenue: '$29,300', share: '20%', orders: 36, status: 'Available' },
];

export default function AdminReportsPage() {
  const [roleMode, setRoleMode] = useState<'admin' | 'vendor'>('admin');
  const [range, setRange] = useState('q3');
  const [toast, setToast] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const currentKPIs = roleMode === 'admin' ? adminKPIs : vendorKPIs;
  const currentBreakdown = roleMode === 'admin' ? adminBreakdown : vendorBreakdown;

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-[1440px] mx-auto relative">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-navy text-white px-5 py-3.5 rounded-xl shadow-2xl border border-amber/30 flex items-center gap-3 animate-slide-up">
          <span className="material-symbols-outlined shrink-0 text-amber" style={{ fontSize: '20px' }}>check_circle</span>
          <span className="text-sm font-semibold">{toast}</span>
        </div>
      )}

      {/* Header with Role segregation, Print to PDF, and Export CSV/Excel from Image 5 */}
      <div className="card p-6 border-slate/15 shadow-md flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-black text-navy flex items-center gap-2">
              <span className="material-symbols-outlined text-amber" style={{ fontSize: '26px' }}>analytics</span>
              <span>Financial Reporting & Analytics Ledger</span>
            </h1>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider border ${roleMode === 'admin' ? 'bg-navy text-white border-navy' : 'bg-purple-100 text-purple-800 border-purple-300'}`}>
              {roleMode === 'admin' ? 'Platform Admin Scope' : 'Individual Vendor Scope'}
            </span>
          </div>
          <p className="text-xs text-slate mt-1">
            Reporting for admin and individual vendors should be different. Review real-time revenue and utilization metrics below.
          </p>
        </div>

        {/* Role Toggle & Export Controls from Image 5 */}
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-between lg:justify-end">
          {/* Role Switcher */}
          <div className="flex items-center bg-ivory p-1 rounded-xl border border-slate/20">
            <button
              onClick={() => { setRoleMode('admin'); triggerToast('Switched report scope: Admin Global Platform view'); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${roleMode === 'admin' ? 'bg-navy text-white shadow-sm' : 'text-slate hover:text-navy'}`}
            >
              Admin Global
            </button>
            <button
              onClick={() => { setRoleMode('vendor'); triggerToast('Switched report scope: Individual Vendor view'); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${roleMode === 'vendor' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate hover:text-navy'}`}
            >
              Vendor Portal
            </button>
          </div>

          <select
            value={range}
            onChange={(e) => setRange(e.target.value)}
            className="input-field text-xs py-2 px-3 bg-white w-36 font-semibold"
          >
            <option value="q3">Q3 2024 (Jul - Sep)</option>
            <option value="q2">Q2 2024 (Apr - Jun)</option>
            <option value="ytd">Year to Date (2024)</option>
          </select>

          {/* Print -> PDF from Image 5 */}
          <button
            onClick={() => { triggerToast('Generating formatted PDF report document...'); window.print(); }}
            className="btn-secondary py-2 px-4 text-xs font-bold flex items-center gap-1.5 shadow-sm bg-white"
            title="Print report or save as PDF"
          >
            <span className="material-symbols-outlined shrink-0 text-red-600" style={{ fontSize: '18px' }}>print</span>
            <span>Print → PDF</span>
          </button>

          {/* Export -> Excel & CSV from Image 5 */}
          <button
            onClick={() => triggerToast(`Exporting ${roleMode === 'admin' ? 'Platform' : 'Vendor'} report dataset as Excel (.xlsx) & CSV...`)}
            className="btn-primary py-2 px-4 text-xs font-bold flex items-center gap-1.5 shadow-md bg-emerald-700 hover:bg-emerald-800 text-white"
            title="Download structured spreadsheet data"
          >
            <span className="material-symbols-outlined shrink-0" style={{ fontSize: '18px' }}>table_view</span>
            <span>Export → Excel & CSV</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {currentKPIs.map((kpi, i) => (
          <div key={i} className="card p-5 rounded-2xl flex flex-col justify-between border-slate/15 shadow-sm hover:border-amber/40 transition-all">
            <div className="flex justify-between items-start">
              <span className="text-[11px] font-bold text-slate uppercase tracking-wider">{kpi.title}</span>
              <div className="w-10 h-10 rounded-xl bg-navy text-amber flex items-center justify-center shrink-0 shadow-sm">
                <span className="material-symbols-outlined shrink-0" style={{ fontSize: '22px' }}>{kpi.icon}</span>
              </div>
            </div>
            <div className="mt-5">
              <p className="text-2xl font-black text-navy font-currency">{kpi.value}</p>
              <span className={`text-xs font-bold mt-1 inline-flex items-center gap-1 ${kpi.trend === 'up' ? 'text-emerald-600' : 'text-slate'}`}>
                <span className="material-symbols-outlined text-sm" style={{ fontSize: '14px' }}>trending_up</span>
                <span>{kpi.change}</span>
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Breakdown Table */}
      <div className="card rounded-2xl overflow-hidden border-slate/15 shadow-md">
        <div className="p-6 border-b border-slate/10 flex justify-between items-center bg-ivory">
          <div>
            <h2 className="text-base font-bold text-navy">
              {roleMode === 'admin' ? 'Revenue & Orders by Asset Category' : 'My Fleet Performance Breakdown'}
            </h2>
            <p className="text-slate text-xs mt-0.5">
              {roleMode === 'admin' ? 'Attribution across global categories and corporate tiers' : 'Individual equipment earnings and active order volume'}
            </p>
          </div>
          <span className="badge-amber text-xs font-bold">Live Attribution</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-medium text-navy">
            <thead className="bg-navy text-white text-[11px] uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-6 font-bold">{roleMode === 'admin' ? 'Asset Category' : 'Equipment Unit'}</th>
                <th className="py-3.5 px-6 font-bold">Completed Orders</th>
                <th className="py-3.5 px-6 font-bold">Gross Revenue</th>
                <th className="py-3.5 px-6 font-bold">Portfolio Share</th>
                <th className="py-3.5 px-6 font-bold text-right">Market Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate/10 bg-white">
              {currentBreakdown.map((row, idx) => (
                <tr key={idx} className="hover:bg-amber/5 transition-colors">
                  <td className="py-4 px-6 font-bold text-sm text-navy">{row.name}</td>
                  <td className="py-4 px-6 font-semibold">{row.orders} orders</td>
                  <td className="py-4 px-6 font-black font-currency text-purple-700 text-sm">{row.revenue}</td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-slate/15 rounded-full h-2 overflow-hidden">
                        <div className="bg-amber h-full rounded-full" style={{ width: row.share }} />
                      </div>
                      <span className="font-bold text-xs">{row.share}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-[10px] uppercase tracking-wide">
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-4 bg-ivory border-t border-slate/15 flex justify-between items-center text-xs text-slate font-semibold">
          <span>Displaying 3 of 3 records for {roleMode === 'admin' ? 'Platform System' : 'Vendor ID #VND-849'}</span>
          <span className="text-purple-700 font-bold underline cursor-pointer" onClick={() => triggerToast('Opening complete audit log...')}>View Full Audit Log →</span>
        </div>
      </div>
    </div>
  );
}
