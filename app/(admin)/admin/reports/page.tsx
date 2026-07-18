'use client';
import { useState, useEffect, useMemo } from 'react';
import type { Order, Product, DashboardData } from '@/lib/types';

const fmtMoney = (n: number) => {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
  return `$${n.toLocaleString()}`;
};

const catColors = ['#D97706', '#0F172A', '#0EA5E9', '#10B981', '#8B5CF6', '#F59E0B', '#64748B'];

export default function AdminReportsPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [dash, setDash] = useState<DashboardData | null>(null);
  const [range, setRange] = useState('30');

  useEffect(() => {
    Promise.all([
      fetch('/api/orders').then((r) => r.json()),
      fetch('/api/products').then((r) => r.json()),
      fetch('/api/dashboard').then((r) => r.json()),
    ]).then(([o, p, d]) => { setOrders(o); setProducts(p); setDash(d); }).catch(() => {});
  }, []);

  const metrics = useMemo(() => {
    const revenue = orders.reduce((s, o) => s + (o.total - o.deposit), 0);
    const deposits = orders.reduce((s, o) => s + o.deposit, 0);
    const avgOrder = orders.length ? revenue / orders.length : 0;

    const byStatus: Record<string, number> = {};
    orders.forEach((o) => { byStatus[o.status] = (byStatus[o.status] || 0) + 1; });

    const prodMap = new Map(products.map((p) => [p.id, p]));
    const catRevenue: Record<string, number> = {};
    orders.forEach((o) => {
      const cat = (o.productId && prodMap.get(o.productId)?.category) || 'Other';
      catRevenue[cat] = (catRevenue[cat] || 0) + (o.total - o.deposit);
    });
    const cats = Object.entries(catRevenue).sort((a, b) => b[1] - a[1]);
    const catMax = Math.max(1, ...cats.map((c) => c[1]));

    const prodCount: Record<string, { name: string; count: number; rev: number }> = {};
    orders.forEach((o) => {
      const key = o.item;
      prodCount[key] = prodCount[key] || { name: key, count: 0, rev: 0 };
      prodCount[key].count += 1;
      prodCount[key].rev += o.total - o.deposit;
    });
    const topProducts = Object.values(prodCount).sort((a, b) => b.rev - a.rev).slice(0, 5);
    const topRev = Math.max(1, ...topProducts.map((p) => p.rev));

    const available = products.filter((p) => p.status === 'available').length;
    const utilisation = products.length ? Math.round(((products.length - available) / products.length) * 100) : 0;

    return { revenue, deposits, avgOrder, byStatus, cats, catMax, topProducts, topRev, utilisation };
  }, [orders, products]);

  const trend = dash?.revenueTrend ?? [40, 65, 45, 80, 55, 90, 72];

  return (
    <div className="p-6 md:p-8 max-w-[1440px]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3">
        <div>
          <h1 className="text-h1 text-navy">Reports & Analytics</h1>
          <p className="text-slate text-sm mt-1">Performance overview computed live from your rentals.</p>
        </div>
        <div className="flex items-center gap-2">
          <select value={range} onChange={(e) => setRange(e.target.value)} className="input-field text-sm py-2 w-auto">
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last quarter</option>
          </select>
          <button className="btn-secondary text-xs py-2.5 px-4">
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>download</span>
            Export
          </button>
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
        {[
          { label: 'Total Revenue', value: fmtMoney(metrics.revenue), icon: 'payments', tone: 'dark' },
          { label: 'Total Orders', value: String(orders.length), icon: 'receipt_long', tone: 'dark' },
          { label: 'Avg Order Value', value: fmtMoney(Math.round(metrics.avgOrder)), icon: 'trending_up', tone: 'dark' },
          { label: 'Fleet Utilisation', value: `${metrics.utilisation}%`, icon: 'donut_large', tone: 'light' },
        ].map((k) => (
          <div key={k.label} className={k.tone === 'dark' ? 'kpi-card-dark group' : 'kpi-card-light group'}>
            <div className="absolute top-3 right-3 opacity-10 group-hover:opacity-20 transition-opacity">
              <span className={`material-symbols-outlined ${k.tone === 'dark' ? 'text-white' : 'text-navy'}`} style={{ fontSize: '40px' }}>{k.icon}</span>
            </div>
            <p className={`text-[10px] font-semibold uppercase tracking-widest mb-2 ${k.tone === 'dark' ? 'text-on-navy' : 'text-slate'}`}>{k.label}</p>
            <p className={`text-h1 font-bold font-currency ${k.tone === 'dark' ? 'text-white' : 'text-navy'}`}>{k.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue trend */}
        <div className="lg:col-span-2 card p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-h3 text-navy">Revenue Trend</h2>
            <span className="badge-green text-[10px]">7-day</span>
          </div>
          <div className="flex items-end gap-2 h-56">
            {trend.map((h, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                <div className="w-full rounded-t-lg bg-gradient-to-t from-amber/30 to-amber transition-all group-hover:from-amber group-hover:to-amber-bright relative" style={{ height: `${h}%` }}>
                  <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-semibold text-navy opacity-0 group-hover:opacity-100 transition-opacity">{h}%</span>
                </div>
                <span className="text-[10px] text-slate">{['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Order status breakdown */}
        <div className="card p-6">
          <h2 className="text-h3 text-navy mb-5">Orders by Status</h2>
          <div className="space-y-4">
            {[
              { key: 'active', label: 'Active', color: '#10B981' },
              { key: 'pending', label: 'Pending Return', color: '#D97706' },
              { key: 'returned', label: 'Returned', color: '#64748B' },
            ].map((s) => {
              const count = metrics.byStatus[s.key] || 0;
              const pct = orders.length ? Math.round((count / orders.length) * 100) : 0;
              return (
                <div key={s.key}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-navy font-medium flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ background: s.color }} />
                      {s.label}
                    </span>
                    <span className="text-slate">{count} · {pct}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-surface-high overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: s.color }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Revenue by category */}
        <div className="card p-6">
          <h2 className="text-h3 text-navy mb-5">Revenue by Category</h2>
          <div className="space-y-3">
            {metrics.cats.length === 0 && <p className="text-slate text-sm">No data yet.</p>}
            {metrics.cats.map(([cat, rev], i) => (
              <div key={cat}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-navy">{cat}</span>
                  <span className="text-slate font-currency">{fmtMoney(rev)}</span>
                </div>
                <div className="h-2.5 rounded-full bg-surface-high overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${(rev / metrics.catMax) * 100}%`, background: catColors[i % catColors.length] }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top products */}
        <div className="lg:col-span-2 card p-6">
          <h2 className="text-h3 text-navy mb-5">Top Performing Rentals</h2>
          <div className="space-y-3">
            {metrics.topProducts.length === 0 && <p className="text-slate text-sm">No orders yet.</p>}
            {metrics.topProducts.map((p, i) => (
              <div key={p.name} className="flex items-center gap-4">
                <span className="w-7 h-7 rounded-lg bg-navy text-white text-xs font-bold flex items-center justify-center shrink-0">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-navy font-medium truncate">{p.name}</span>
                    <span className="text-slate shrink-0 ml-2">{p.count} order{p.count !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="h-2 rounded-full bg-surface-high overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-amber to-amber-bright" style={{ width: `${(p.rev / metrics.topRev) * 100}%` }} />
                  </div>
                </div>
                <span className="text-navy font-currency font-semibold text-sm shrink-0 w-16 text-right">{fmtMoney(p.rev)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
