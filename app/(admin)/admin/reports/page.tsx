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
  const [chartType, setChartType] = useState<'bar' | 'pie' | 'line'>('bar');
  const [criteria, setCriteria] = useState('Revenue by Category');
  const [showGearMenu, setShowGearMenu] = useState(false);
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

      {/* Header with Role segregation and exact Reports [⚙️] bar from Image 2 top */}
      <div className="card p-6 border-slate/15 shadow-md space-y-5">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 pb-4 border-b border-slate/15">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-black text-navy flex items-center gap-2">
              <span className="material-symbols-outlined text-amber" style={{ fontSize: '26px' }}>analytics</span>
              <span>Reporting</span>
            </h1>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider border ${roleMode === 'admin' ? 'bg-navy text-white border-navy' : 'bg-purple-100 text-purple-800 border-purple-300'}`}>
              {roleMode === 'admin' ? 'Platform Admin Scope' : 'Individual Vendor Scope'}
            </span>
          </div>

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
        </div>

        {/* Second Action Bar from Image 2 top: Reports [⚙️], Criteria for Analysis, Insert in chart, Chart Switcher */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="flex items-center gap-2">
                <span className="text-base font-black text-navy">Reports</span>
                <button
                  type="button"
                  onClick={() => setShowGearMenu(!showGearMenu)}
                  className="w-8 h-8 rounded-lg bg-ivory hover:bg-slate/10 border border-slate/20 flex items-center justify-center text-navy transition-colors"
                  title="Reporting Actions Menu"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>settings</span>
                </button>
              </div>

              {/* Gear Dropdown Menu from Image 2 top (Print -> PDF, Import, Export -> Excel & CSV) */}
              {showGearMenu && (
                <div className="absolute left-0 mt-2 w-52 bg-white rounded-xl shadow-2xl border border-slate/20 py-2 z-30 animate-fade-in text-xs font-bold text-navy">
                  <button
                    type="button"
                    onClick={() => { setShowGearMenu(false); triggerToast('Generating formatted PDF report document...'); window.print(); }}
                    className="w-full px-4 py-2.5 text-left hover:bg-amber/10 flex items-center justify-between"
                  >
                    <span>Print → PDF</span>
                    <span className="material-symbols-outlined text-red-600" style={{ fontSize: '18px' }}>print</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowGearMenu(false); triggerToast('Opening file dialog to Import reporting ledger data...'); }}
                    className="w-full px-4 py-2.5 text-left hover:bg-amber/10 flex items-center justify-between"
                  >
                    <span>Import</span>
                    <span className="material-symbols-outlined text-purple-600" style={{ fontSize: '18px' }}>file_upload</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowGearMenu(false); triggerToast(`Exporting ${roleMode === 'admin' ? 'Platform' : 'Vendor'} dataset as Excel (.xlsx) & CSV...`); }}
                    className="w-full px-4 py-2.5 text-left hover:bg-amber/10 flex items-center justify-between"
                  >
                    <span>Export → Excel & CSV</span>
                    <span className="material-symbols-outlined text-emerald-600" style={{ fontSize: '18px' }}>table_view</span>
                  </button>
                </div>
              )}
            </div>

            {/* Criteria for Analysis selector from Image 2 top */}
            <div className="flex items-center gap-2">
              <select
                value={criteria}
                onChange={(e) => setCriteria(e.target.value)}
                className="input-field text-xs py-1.5 px-3 bg-purple-100 text-purple-900 border-purple-300 font-bold rounded-lg w-auto"
              >
                <option>Criteria for Analysis ♥</option>
                <option>Revenue by Asset Category</option>
                <option>Utilization Rate by Duration</option>
                <option>Monthly Order Volume Growth</option>
              </select>

              <button
                type="button"
                onClick={() => triggerToast(`Appended '${criteria}' metric directly into dynamic report chart!`)}
                className="btn-secondary py-1.5 px-3 text-xs font-bold bg-white"
              >
                Insert in chart
              </button>
            </div>
          </div>

          {/* Chart Type Switcher from Image 2 top: [ Bar ] [ Pie ] [ Line ] */}
          <div className="flex items-center gap-1 bg-ivory p-1 rounded-xl border border-slate/20">
            <button
              onClick={() => { setChartType('bar'); triggerToast('Switched to Bar Chart visualization'); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${chartType === 'bar' ? 'bg-navy text-white shadow-sm' : 'text-slate hover:text-navy'}`}
              title="Bar Chart"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>bar_chart</span>
              <span>Bar</span>
            </button>
            <button
              onClick={() => { setChartType('pie'); triggerToast('Switched to Pie Chart visualization'); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${chartType === 'pie' ? 'bg-navy text-white shadow-sm' : 'text-slate hover:text-navy'}`}
              title="Pie Chart"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>pie_chart</span>
              <span>Pie</span>
            </button>
            <button
              onClick={() => { setChartType('line'); triggerToast('Switched to Line Graph visualization'); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${chartType === 'line' ? 'bg-navy text-white shadow-sm' : 'text-slate hover:text-navy'}`}
              title="Line Chart"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>show_chart</span>
              <span>Line</span>
            </button>
          </div>
        </div>

        {/* Visual Chart Box from Image 2 top */}
        <div className="bg-surface-high border border-slate/20 rounded-2xl p-6 min-h-[300px] flex flex-col justify-between relative overflow-hidden">
          <div className="flex justify-between items-center text-xs font-bold text-navy mb-4">
            <span>Displaying {chartType.toUpperCase()} CHART — {criteria} ({roleMode === 'admin' ? 'Global Platform' : 'Vendor Portfolio'})</span>
            <span className="badge-amber">Interactive Canvas</span>
          </div>

          {/* Chart Visual Representation */}
          <div className="flex-1 flex items-end justify-around gap-6 py-6 border-b-2 border-l-2 border-slate/30 pl-4 pr-4 min-h-[220px]">
            {chartType === 'bar' && (
              /* Exact 5 Bars from Image 2 top */
              [
                { label: 'Excavators', h: '65%', val: '$320k' },
                { label: 'Forklifts', h: '45%', val: '$210k' },
                { label: 'Villas', h: '88%', val: '$440k' },
                { label: 'Cranes', h: '60%', val: '$290k' },
                { label: 'Scaffolding', h: '60%', val: '$222k' },
              ].map((bar, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                  <span className="text-[11px] font-bold text-purple-700 opacity-0 group-hover:opacity-100 transition-opacity">{bar.val}</span>
                  <div
                    style={{ height: bar.h }}
                    className="w-full max-w-[64px] bg-blue-600 group-hover:bg-amber rounded-t-xl transition-all shadow-md relative"
                  />
                  <span className="text-[10px] font-bold text-slate mt-1 truncate max-w-[70px]">{bar.label}</span>
                </div>
              ))
            )}

            {chartType === 'pie' && (
              <div className="w-full flex items-center justify-center gap-8 py-4">
                <div className="w-44 h-44 rounded-full border-8 border-purple-600 border-t-amber border-r-blue-600 flex items-center justify-center shadow-inner">
                  <span className="text-xs font-black text-navy">55% / 30% / 15%</span>
                </div>
                <div className="space-y-2 text-xs font-bold text-navy">
                  <div className="flex items-center gap-2"><span className="w-3 h-3 bg-purple-600 rounded" /><span>Heavy Machinery (55%)</span></div>
                  <div className="flex items-center gap-2"><span className="w-3 h-3 bg-blue-600 rounded" /><span>Luxury Villas (30%)</span></div>
                  <div className="flex items-center gap-2"><span className="w-3 h-3 bg-amber rounded" /><span>Power Tools (15%)</span></div>
                </div>
              </div>
            )}

            {chartType === 'line' && (
              <div className="w-full h-full flex items-center justify-center flex-col gap-2">
                <div className="w-full h-32 border-b border-purple-600/50 flex items-end justify-between px-6 relative">
                  <span className="material-symbols-outlined text-purple-600 text-6xl absolute left-12 top-6 animate-pulse">show_chart</span>
                  <span className="text-xs font-bold text-navy">Trend slope +18.4% upward trajectory across Q1 → Q3</span>
                </div>
              </div>
            )}
          </div>
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
      </div>
    </div>
  );
}
