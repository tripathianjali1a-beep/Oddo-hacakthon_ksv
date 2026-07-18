'use client';
import Link from 'next/link';
import { useState } from 'react';

const overdueRentals = [
  { id: 1, tenant: 'Sarah Jenkins', property: 'Apt 4B, The Grand', amount: 2450, daysLate: 12, status: 'notice', badge: 'badge-amber', badgeLabel: 'Notice Sent' },
  { id: 2, tenant: 'Michael Chen', property: 'Unit 112, Westside Loft', amount: 3100, daysLate: 45, status: 'eviction', badge: 'badge-red', badgeLabel: 'Eviction Pending' },
  { id: 3, tenant: 'Elena Rostova', property: 'Suite 900, Office Park', amount: 8500, daysLate: 3, status: 'grace', badge: 'badge-amber', badgeLabel: 'Grace Period' },
];

const recentActivity = [
  { icon: 'check_circle', color: 'text-emerald-500', text: 'Payment received from James Park — $2,800', time: '2 min ago' },
  { icon: 'error', color: 'text-amber', text: 'Overdue notice sent to Sarah Jenkins', time: '15 min ago' },
  { icon: 'add_circle', color: 'text-navy', text: 'New rental: CAT Excavator booked by Riya Shah', time: '1 hr ago' },
  { icon: 'assignment_return', color: 'text-slate', text: 'Return processed: MacBook Pro — Michael Chen', time: '3 hr ago' },
];

export default function AdminDashboard() {
  const [baseRent, setBaseRent] = useState('2500.00');
  const [daysLate, setDaysLate] = useState('5');
  const [dailyRate, setDailyRate] = useState('1.5');

  const calculatedFee = (() => {
    const base = parseFloat(baseRent) || 0;
    const days = parseInt(daysLate) || 0;
    const rate = parseFloat(dailyRate) || 0;
    return ((base * (rate / 100)) * days).toFixed(2);
  })();

  return (
    <div className="p-6 md:p-8 max-w-[1440px]">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8">
        <div>
          <h1 className="text-display text-navy">Dashboard</h1>
          <p className="text-slate text-sm mt-1">Welcome back. Here is your ledger overview for today.</p>
        </div>
        <p className="text-xs text-slate mt-2 sm:mt-0">Last updated: Just now</p>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {/* KPI 1 */}
        <div className="kpi-card-dark group">
          <div className="absolute top-3 right-3 opacity-10 group-hover:opacity-20 transition-opacity">
            <span className="material-symbols-outlined shrink-0 text-white" style={{fontSize:'40px'}}>real_estate_agent</span>
          </div>
          <p className="text-[10px] font-semibold text-on-navy uppercase tracking-widest mb-2">Active Rentals</p>
          <p className="text-h1 text-white font-bold font-currency">1,248</p>
          <div className="flex items-center gap-1 mt-2 text-emerald-400 text-xs font-medium">
            <span className="material-symbols-outlined shrink-0" style={{fontSize:'14px'}}>trending_up</span>
            +12% this month
          </div>
        </div>
        {/* KPI 2 */}
        <div className="kpi-card-dark group">
          <div className="absolute top-3 right-3 opacity-10 group-hover:opacity-20 transition-opacity">
            <span className="material-symbols-outlined shrink-0 text-amber" style={{fontSize:'40px'}}>warning</span>
          </div>
          <p className="text-[10px] font-semibold text-on-navy uppercase tracking-widest mb-2">Overdue</p>
          <p className="text-h1 text-amber font-bold font-currency">34</p>
          <div className="flex items-center gap-1 mt-2 text-amber text-xs font-medium">
            <span className="material-symbols-outlined shrink-0" style={{fontSize:'14px'}}>error</span>
            Requires attention
          </div>
        </div>
        {/* KPI 3 */}
        <div className="kpi-card-dark group">
          <div className="absolute top-3 right-3 opacity-10 group-hover:opacity-20 transition-opacity">
            <span className="material-symbols-outlined shrink-0 text-white" style={{fontSize:'40px'}}>payments</span>
          </div>
          <p className="text-[10px] font-semibold text-on-navy uppercase tracking-widest mb-2">Revenue (MTD)</p>
          <p className="text-h1 text-white font-bold font-currency">$842.5K</p>
          <div className="flex items-center gap-1 mt-2 text-emerald-400 text-xs font-medium">
            <span className="material-symbols-outlined shrink-0" style={{fontSize:'14px'}}>trending_up</span>
            +4.2% vs last month
          </div>
        </div>
        {/* KPI 4 — Deposit style */}
        <div className="kpi-card-light group">
          <div className="absolute top-3 right-3 opacity-10">
            <span className="material-symbols-outlined shrink-0 text-navy" style={{fontSize:'40px'}}>account_balance</span>
          </div>
          <p className="text-[10px] font-semibold text-slate uppercase tracking-widest mb-2">Deposits Held</p>
          <p className="text-h1 text-navy font-bold font-currency">$1.2M</p>
          <div className="flex items-center gap-1 mt-2 text-slate text-xs">
            <span className="material-symbols-outlined shrink-0" style={{fontSize:'14px'}}>lock</span>
            Secure Escrow
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Tables + Activity */}
        <div className="lg:col-span-2 space-y-6">
          {/* Overdue Table */}
          <div className="card rounded-xl overflow-hidden">
            <div className="p-5 border-b border-slate/10 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-5 bg-amber rounded-full inline-block"></span>
                <h2 className="text-h3 text-navy">Action Required: Overdue</h2>
              </div>
              <Link href="/admin/orders" className="text-amber text-xs font-semibold hover:underline flex items-center gap-1">
                <span>View All</span>
                <span className="material-symbols-outlined shrink-0" style={{fontSize:'14px'}}>arrow_forward</span>
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-ivory border-b border-slate/10">
                    <th className="table-header">Tenant / Property</th>
                    <th className="table-header">Amount</th>
                    <th className="table-header">Days Late</th>
                    <th className="table-header">Status</th>
                    <th className="table-header text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {overdueRentals.map((rental) => (
                    <tr key={rental.id} className="table-row">
                      <td className="table-cell">
                        <p className="font-semibold text-navy text-sm">{rental.tenant}</p>
                        <p className="text-slate text-xs">{rental.property}</p>
                      </td>
                      <td className="table-cell font-currency font-medium text-navy">${rental.amount.toLocaleString()}.00</td>
                      <td className={`table-cell font-semibold ${rental.daysLate > 30 ? 'text-red-600' : 'text-amber'}`}>{rental.daysLate} Days</td>
                      <td className="table-cell"><span className={rental.badge}>{rental.badgeLabel}</span></td>
                      <td className="table-cell text-right">
                        <button className="p-1.5 border border-slate/20 rounded hover:border-amber hover:text-amber text-slate transition-all flex items-center justify-center">
                          <span className="material-symbols-outlined shrink-0" style={{fontSize:'16px'}}>more_horiz</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="card rounded-xl p-5">
            <h2 className="text-h3 text-navy mb-4">Recent Activity</h2>
            <div className="space-y-3">
              {recentActivity.map((act, i) => (
                <div key={i} className="flex items-start gap-3 pb-3 border-b border-slate/10 last:border-0 last:pb-0">
                  <span className={`material-symbols-outlined shrink-0 ${act.color} flex-shrink-0`} style={{fontSize:'18px', fontVariationSettings:"'FILL' 1"}}>{act.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-on-surface">{act.text}</p>
                    <p className="text-xs text-slate mt-0.5">{act.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Chart Placeholder + Calculator */}
        <div className="space-y-6">
          {/* Chart */}
          <div className="card rounded-xl p-5 h-52 flex flex-col">
            <h2 className="text-sm font-semibold text-navy mb-3">7-Day Revenue Trend</h2>
            <div className="flex-1 border border-dashed border-slate/20 rounded-lg flex items-end px-4 pb-3 pt-4 gap-1.5 bg-ivory/50">
              {[40, 65, 45, 80, 55, 90, 72].map((h, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full bg-amber/20 rounded-sm hover:bg-amber/40 transition-colors" style={{ height: `${h}%` }} />
                  <span className="text-[9px] text-slate">{['M', 'T', 'W', 'T', 'F', 'S', 'S'][i]}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Late Fee Calculator */}
          <div className="card rounded-xl p-5">
            <h2 className="text-sm font-semibold text-navy mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined shrink-0 text-amber" style={{fontSize:'20px'}}>calculate</span>
              Late Fee Calculator
            </h2>
            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-semibold text-slate uppercase tracking-wide mb-1">Base Rent Amount</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate font-mono text-sm">$</span>
                  <input type="text" value={baseRent} onChange={(e) => setBaseRent(e.target.value)} className="input-field pl-7 font-currency text-sm" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-semibold text-slate uppercase tracking-wide mb-1">Days Late</label>
                  <input type="number" value={daysLate} onChange={(e) => setDaysLate(e.target.value)} className="input-field text-sm" min="0" />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate uppercase tracking-wide mb-1">Daily Rate (%)</label>
                  <input type="text" value={dailyRate} onChange={(e) => setDailyRate(e.target.value)} className="input-field text-sm" />
                </div>
              </div>
              <div className="pt-3 border-t border-slate/10 flex justify-between items-end">
                <div>
                  <p className="text-[10px] font-semibold text-slate uppercase tracking-wide mb-1">Calculated Fee</p>
                  <p className="text-h3 text-red-600 font-currency">${calculatedFee}</p>
                </div>
                <button className="btn-primary text-xs py-2 px-4">Apply</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
