'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

interface DashboardStats {
  active_rentals: number;
  rentals_due_today: number;
  upcoming_pickups: number;
  upcoming_returns: number;
  overdue_rentals: number;
  total_revenue: number;
  deposits_held: number;
  late_fee_collected: number;
}

interface Order {
  id: number;
  order_number: string;
  status: string;
  return_due_at: string | null;
  deposit_amount: number;
  late_fee: number;
  total_amount: number;
  created_at: string;
  user?: { full_name: string; email: string };
  items: Array<{ product?: { name: string } }>;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [overdueOrders, setOverdueOrders] = useState<Order[]>([]);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [baseRent, setBaseRent] = useState('2500.00');
  const [daysLate, setDaysLate] = useState('5');
  const [dailyRate, setDailyRate] = useState('1.5');
  const [toast, setToast] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const getToken = () =>
    typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = getToken();
      const h = { Authorization: `Bearer ${token}` };
      const [statsRes, ordersRes] = await Promise.all([
        fetch(`${API_BASE}/orders/admin/dashboard-stats`, { headers: h }),
        fetch(`${API_BASE}/orders/admin/all?limit=50`, { headers: h }),
      ]);
      if (statsRes.ok) setStats(await statsRes.json());
      if (ordersRes.ok) {
        const orders: Order[] = await ordersRes.json();
        const now = new Date();
        setOverdueOrders(
          orders
            .filter(
              (o) =>
                o.return_due_at &&
                new Date(o.return_due_at) < now &&
                ['active', 'picked_up', 'late'].includes(o.status)
            )
            .slice(0, 5)
        );
        setRecentOrders(orders.slice(0, 4));
      }
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const calculatedFee = (() => {
    const base = parseFloat(baseRent) || 0;
    const days = parseInt(daysLate) || 0;
    const rate = parseFloat(dailyRate) || 0;
    return ((base * (rate / 100)) * days).toFixed(2);
  })();

  const fmt = (n: number) =>
    n >= 1_000_000
      ? `₹${(n / 1_000_000).toFixed(1)}M`
      : n >= 1_000
      ? `₹${(n / 1_000).toFixed(1)}K`
      : `₹${n.toFixed(0)}`;

  const fmtDate = (d: string | null) =>
    d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '—';

  const STATUS_COLOR: Record<string, string> = {
    pending: 'badge-warning',
    confirmed: 'badge-info',
    picked_up: 'badge-success',
    active: 'badge-success',
    late: 'badge-danger',
    returned: 'badge-success',
    completed: 'badge-success',
    cancelled: 'badge-danger',
  };

  return (
    <div className="p-6 md:p-8 max-w-[1440px] relative">
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-navy text-white px-5 py-3.5 rounded-xl shadow-2xl border border-amber/30 flex items-center gap-3 animate-slide-up">
          <span className="material-symbols-outlined shrink-0 text-amber" style={{ fontSize: '20px' }}>check_circle</span>
          <span className="text-sm font-semibold">{toast}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8">
        <div>
          <h1 className="text-display text-navy">Operations Dashboard</h1>
          <p className="text-slate text-sm mt-1">Real-time rental activity overview.</p>
        </div>
        <div className="flex items-center gap-2 mt-2 sm:mt-0">
          <button
            onClick={fetchData}
            className="p-1.5 text-slate hover:text-navy hover:bg-slate/10 rounded-lg transition-all"
            title="Refresh data"
          >
            <span className={`material-symbols-outlined shrink-0 ${loading ? 'animate-spin' : ''}`} style={{ fontSize: '18px' }}>refresh</span>
          </button>
          <p className="text-xs text-slate">Live data</p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <span className="material-symbols-outlined animate-spin text-amber" style={{ fontSize: '36px' }}>refresh</span>
        </div>
      ) : (
        <>
          {/* KPI Row — 8 metrics from spec */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
            {[
              { label: 'Active Rentals', value: stats?.active_rentals ?? 0, icon: 'real_estate_agent', color: 'text-white', sub: 'Currently rented' },
              { label: 'Overdue Returns', value: stats?.overdue_rentals ?? 0, icon: 'warning', color: 'text-amber', sub: stats?.overdue_rentals ? 'Needs attention' : 'All on time' },
              { label: 'Due Today', value: stats?.rentals_due_today ?? 0, icon: 'today', color: 'text-white', sub: 'Returns today' },
              { label: 'Upcoming Pickups', value: stats?.upcoming_pickups ?? 0, icon: 'local_shipping', color: 'text-white', sub: 'Next 3 days' },
            ].map((kpi) => (
              <div key={kpi.label} className="kpi-card-dark group relative overflow-hidden">
                <div className="absolute top-3 right-3 opacity-10">
                  <span className="material-symbols-outlined shrink-0" style={{ fontSize: '36px' }}>{kpi.icon}</span>
                </div>
                <p className="text-[10px] font-semibold text-on-navy uppercase tracking-widest mb-2">{kpi.label}</p>
                <p className={`text-h1 font-bold font-currency ${kpi.color}`}>{kpi.value.toLocaleString()}</p>
                <p className="text-[11px] text-on-navy/70 mt-1">{kpi.sub}</p>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Upcoming Returns', value: stats?.upcoming_returns ?? 0, icon: 'assignment_return', sub: 'Next 3 days', light: true },
              { label: 'Total Revenue', value: fmt(stats?.total_revenue ?? 0), icon: 'payments', sub: 'Completed orders', light: true },
              { label: 'Deposits Held', value: fmt(stats?.deposits_held ?? 0), icon: 'account_balance', sub: 'In escrow', light: true },
              { label: 'Late Fees Collected', value: fmt(stats?.late_fee_collected ?? 0), icon: 'receipt', sub: 'Total penalties', light: true },
            ].map((kpi) => (
              <div key={kpi.label} className="kpi-card-light group relative overflow-hidden">
                <div className="absolute top-3 right-3 opacity-10">
                  <span className="material-symbols-outlined shrink-0 text-navy" style={{ fontSize: '36px' }}>{kpi.icon}</span>
                </div>
                <p className="text-[10px] font-semibold text-slate uppercase tracking-widest mb-2">{kpi.label}</p>
                <p className="text-h1 text-navy font-bold font-currency">{typeof kpi.value === 'number' ? kpi.value.toLocaleString() : kpi.value}</p>
                <p className="text-[11px] text-slate mt-1">{kpi.sub}</p>
              </div>
            ))}
          </div>

          {/* Main grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">

              {/* Overdue rentals table */}
              <div className="card rounded-xl overflow-hidden">
                <div className="p-5 border-b border-slate/10 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-5 bg-amber rounded-full inline-block" />
                    <h2 className="text-h3 text-navy">Action Required: Overdue</h2>
                  </div>
                  <Link href="/admin/orders" className="text-amber text-xs font-semibold hover:underline flex items-center gap-1">
                    View All
                    <span className="material-symbols-outlined shrink-0" style={{ fontSize: '14px' }}>arrow_forward</span>
                  </Link>
                </div>

                {overdueOrders.length === 0 ? (
                  <div className="py-10 text-center text-sm text-slate">
                    <span className="material-symbols-outlined block mb-2 text-emerald-500" style={{ fontSize: '32px' }}>check_circle</span>
                    No overdue rentals — all returns are on time!
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-ivory border-b border-slate/10">
                          <th className="table-header">Order / Customer</th>
                          <th className="table-header">Return Due</th>
                          <th className="table-header">Late Fee</th>
                          <th className="table-header">Status</th>
                          <th className="table-header text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {overdueOrders.map((o) => {
                          const daysLateNum = o.return_due_at
                            ? Math.ceil((Date.now() - new Date(o.return_due_at).getTime()) / 86400000)
                            : 0;
                          return (
                            <tr key={o.id} className="table-row">
                              <td className="table-cell">
                                <p className="font-semibold text-navy text-sm">#{o.order_number}</p>
                                <p className="text-slate text-xs">{o.user?.full_name || o.user?.email || 'Customer'}</p>
                              </td>
                              <td className="table-cell text-red-600 font-semibold text-sm">{fmtDate(o.return_due_at)}</td>
                              <td className="table-cell font-currency text-sm text-navy">₹{o.late_fee.toLocaleString()}</td>
                              <td className="table-cell">
                                <span className="badge-danger text-[10px]">{daysLateNum}d overdue</span>
                              </td>
                              <td className="table-cell text-right">
                                <Link href="/admin/orders"
                                  className="p-1.5 border border-slate/20 rounded hover:border-amber hover:text-amber text-slate transition-all inline-flex items-center justify-center">
                                  <span className="material-symbols-outlined shrink-0" style={{ fontSize: '16px' }}>open_in_new</span>
                                </Link>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Recent Orders */}
              <div className="card rounded-xl p-5">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-h3 text-navy">Recent Orders</h2>
                  <Link href="/admin/orders" className="text-amber text-xs font-semibold hover:underline">View All</Link>
                </div>
                {recentOrders.length === 0 ? (
                  <p className="text-sm text-slate text-center py-6">No orders yet. They will appear here once customers start renting.</p>
                ) : (
                  <div className="space-y-3">
                    {recentOrders.map((o) => (
                      <div key={o.id} className="flex items-center justify-between py-2 border-b border-slate/10 last:border-0">
                        <div>
                          <p className="text-sm font-semibold text-navy">#{o.order_number}</p>
                          <p className="text-xs text-slate">{o.user?.full_name || o.user?.email || 'Customer'} • {fmtDate(o.created_at)}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`${STATUS_COLOR[o.status] || 'badge-info'} text-[10px]`}>{o.status.replace('_', ' ')}</span>
                          <span className="text-sm font-bold text-navy font-currency">₹{o.total_amount.toLocaleString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right: Chart + Calculator */}
            <div className="space-y-6">
              {/* Quick stats bar chart */}
              <div className="card rounded-xl p-5">
                <h2 className="text-sm font-semibold text-navy mb-1">Rental Status Breakdown</h2>
                <p className="text-xs text-slate mb-4">Current order distribution</p>
                <div className="space-y-3">
                  {[
                    { label: 'Active', value: stats?.active_rentals ?? 0, color: 'bg-emerald-500', max: Math.max(stats?.active_rentals ?? 1, 1) },
                    { label: 'Due Today', value: stats?.rentals_due_today ?? 0, color: 'bg-amber', max: Math.max(stats?.active_rentals ?? 1, 1) },
                    { label: 'Overdue', value: stats?.overdue_rentals ?? 0, color: 'bg-red-500', max: Math.max(stats?.active_rentals ?? 1, 1) },
                    { label: 'Upcoming', value: (stats?.upcoming_pickups ?? 0) + (stats?.upcoming_returns ?? 0), color: 'bg-blue-500', max: Math.max(stats?.active_rentals ?? 1, 1) },
                  ].map((item) => (
                    <div key={item.label}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate font-medium">{item.label}</span>
                        <span className="font-bold text-navy">{item.value}</span>
                      </div>
                      <div className="h-2 bg-slate/10 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${item.color}`}
                          style={{ width: item.max > 0 ? `${Math.min(100, (item.value / item.max) * 100)}%` : '0%' }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Late Fee Calculator */}
              <div className="card rounded-xl p-5">
                <h2 className="text-sm font-semibold text-navy mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined shrink-0 text-amber" style={{ fontSize: '20px' }}>calculate</span>
                  Late Fee Calculator
                </h2>
                <div className="space-y-3">
                  <div>
                    <label className="block text-[10px] font-semibold text-slate uppercase tracking-wide mb-1">Base Rental Amount</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate font-mono text-sm">₹</span>
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
                      <p className="text-h3 text-red-600 font-currency">₹{calculatedFee}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => triggerToast(`Late fee of ₹${calculatedFee} calculated. Apply it in the Orders panel.`)}
                      className="btn-primary text-xs py-2 px-4"
                    >
                      Copy
                    </button>
                  </div>
                </div>
              </div>

              {/* Quick links */}
              <div className="card rounded-xl p-5">
                <h2 className="text-sm font-semibold text-navy mb-3">Quick Actions</h2>
                <div className="space-y-2">
                  {[
                    { href: '/admin/orders', icon: 'add_circle', label: 'Create New Order' },
                    { href: '/admin/schedule', icon: 'calendar_today', label: 'View Schedule' },
                    { href: '/admin/products', icon: 'inventory_2', label: 'Manage Products' },
                    { href: '/admin/configuration', icon: 'settings', label: 'Rental Settings' },
                  ].map((item) => (
                    <Link key={item.href} href={item.href}
                      className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-ivory transition-colors group">
                      <span className="material-symbols-outlined shrink-0 text-amber" style={{ fontSize: '18px' }}>{item.icon}</span>
                      <span className="text-xs font-semibold text-navy group-hover:text-amber transition-colors">{item.label}</span>
                      <span className="material-symbols-outlined shrink-0 text-slate ml-auto" style={{ fontSize: '14px' }}>arrow_forward</span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
