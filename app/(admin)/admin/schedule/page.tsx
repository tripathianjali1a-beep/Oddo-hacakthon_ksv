'use client';
import { useState, useEffect, useCallback } from 'react';
import type { Order } from '@/lib/types';

const fmtDate = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

const fmtTime = (iso: string | null) =>
  iso ? new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '—';

const today = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

const isToday = (iso: string | null) => {
  if (!iso) return false;
  const d = new Date(iso);
  d.setHours(0, 0, 0, 0);
  return d.getTime() === today().getTime();
};

const isUpcoming = (iso: string | null, days = 7) => {
  if (!iso) return false;
  const d = new Date(iso);
  d.setHours(0, 0, 0, 0);
  const t = today();
  const future = new Date(t);
  future.setDate(future.getDate() + days);
  return d > t && d <= future;
};

const isOverdue = (iso: string | null) => {
  if (!iso) return false;
  const d = new Date(iso);
  d.setHours(0, 0, 0, 0);
  return d < today();
};

type ViewTab = 'today' | 'upcoming' | 'overdue';

export default function SchedulePage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<ViewTab>('today');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    fetch('/api/orders')
      .then((r) => r.json())
      .then((data: Order[]) => setOrders(data))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  // Categorise orders
  const pickupsToday = orders.filter((o) => o.status === 'reserved' && isToday(o.startAt));
  const returnsToday = orders.filter((o) => o.status === 'active' && isToday(o.endAt));
  const overdueReturns = orders.filter((o) => o.status === 'active' && isOverdue(o.endAt));
  const upcomingPickups = orders.filter((o) => o.status === 'reserved' && isUpcoming(o.startAt));
  const upcomingReturns = orders.filter((o) => o.status === 'active' && isUpcoming(o.endAt));

  const todayItems = [
    ...pickupsToday.map((o) => ({ ...o, scheduleType: 'pickup' as const })),
    ...returnsToday.map((o) => ({ ...o, scheduleType: 'return' as const })),
  ].sort((a, b) => new Date(a.startAt || '').getTime() - new Date(b.startAt || '').getTime());

  const upcomingItems = [
    ...upcomingPickups.map((o) => ({ ...o, scheduleType: 'pickup' as const })),
    ...upcomingReturns.map((o) => ({ ...o, scheduleType: 'return' as const })),
  ].sort((a, b) => {
    const da = a.scheduleType === 'pickup' ? a.startAt : a.endAt;
    const db = b.scheduleType === 'pickup' ? b.startAt : b.endAt;
    return new Date(da || '').getTime() - new Date(db || '').getTime();
  });

  const overdueItems = overdueReturns.map((o) => ({ ...o, scheduleType: 'return' as const }));

  const tabs: { key: ViewTab; label: string; count: number; icon: string; color: string }[] = [
    { key: 'today', label: "Today's Schedule", count: todayItems.length, icon: 'today', color: 'text-navy' },
    { key: 'upcoming', label: 'Upcoming (7 days)', count: upcomingItems.length, icon: 'event_upcoming', color: 'text-amber' },
    { key: 'overdue', label: 'Overdue Returns', count: overdueItems.length, icon: 'warning', color: 'text-red-500' },
  ];

  const displayItems =
    activeTab === 'today' ? todayItems :
    activeTab === 'upcoming' ? upcomingItems :
    overdueItems;

  return (
    <div className="p-6 md:p-8 max-w-[1440px]">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-h1 text-navy">Pickup &amp; Return Schedule</h1>
        <p className="text-slate text-sm mt-1">
          Manage daily pickups, returns, and overdue rentals from a single view.
        </p>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="kpi-card-dark group p-5">
          <p className="text-[10px] font-semibold text-on-navy uppercase tracking-widest mb-1">Pickups Today</p>
          <p className="text-h2 text-white font-bold font-currency">{loading ? '—' : pickupsToday.length}</p>
          <p className="text-xs text-on-navy mt-1 flex items-center gap-1">
            <span className="material-symbols-outlined" style={{ fontSize: '13px' }}>local_shipping</span>
            Awaiting collection
          </p>
        </div>
        <div className="kpi-card-dark group p-5">
          <p className="text-[10px] font-semibold text-on-navy uppercase tracking-widest mb-1">Returns Today</p>
          <p className="text-h2 text-amber font-bold font-currency">{loading ? '—' : returnsToday.length}</p>
          <p className="text-xs text-on-navy mt-1 flex items-center gap-1">
            <span className="material-symbols-outlined" style={{ fontSize: '13px' }}>assignment_return</span>
            Due back today
          </p>
        </div>
        <div className="kpi-card-light group p-5">
          <p className="text-[10px] font-semibold text-slate uppercase tracking-widest mb-1">Upcoming (7d)</p>
          <p className="text-h2 text-navy font-bold font-currency">{loading ? '—' : upcomingItems.length}</p>
          <p className="text-xs text-slate mt-1 flex items-center gap-1">
            <span className="material-symbols-outlined" style={{ fontSize: '13px' }}>calendar_month</span>
            Next 7 days
          </p>
        </div>
        <div className="kpi-card-light group p-5 border-l-4 border-l-red-400">
          <p className="text-[10px] font-semibold text-slate uppercase tracking-widest mb-1">Overdue</p>
          <p className="text-h2 text-red-500 font-bold font-currency">{loading ? '—' : overdueItems.length}</p>
          <p className="text-xs text-slate mt-1 flex items-center gap-1">
            <span className="material-symbols-outlined text-red-400" style={{ fontSize: '13px' }}>error_outline</span>
            Immediate action
          </p>
        </div>
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Schedule list */}
        <div className="xl:col-span-2 card rounded-xl overflow-hidden flex flex-col">
          {/* Tabs */}
          <div className="flex border-b border-slate/10 bg-ivory/60">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-semibold transition-all border-b-2
                  ${activeTab === t.key
                    ? 'border-amber text-navy bg-white'
                    : 'border-transparent text-slate hover:text-navy hover:bg-white/50'}`}
              >
                <span className={`material-symbols-outlined ${activeTab === t.key ? t.color : 'text-slate'}`} style={{ fontSize: '16px' }}>{t.icon}</span>
                <span className="hidden sm:inline">{t.label}</span>
                {t.count > 0 && (
                  <span className={`ml-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold
                    ${t.key === 'overdue' ? 'bg-red-100 text-red-600' :
                      t.key === 'upcoming' ? 'bg-amber/10 text-amber' :
                      'bg-navy/10 text-navy'}`}>
                    {t.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate/8">
            {loading ? (
              <div className="p-12 text-center text-slate text-sm">Loading schedule…</div>
            ) : displayItems.length === 0 ? (
              <div className="p-12 text-center">
                <span className="material-symbols-outlined text-slate/30 block mb-2" style={{ fontSize: '48px' }}>
                  {activeTab === 'overdue' ? 'check_circle' : 'event_available'}
                </span>
                <p className="text-slate text-sm font-medium">
                  {activeTab === 'overdue' ? 'No overdue rentals. Great job!' :
                   activeTab === 'today' ? 'Nothing scheduled for today.' :
                   'No events in the next 7 days.'}
                </p>
              </div>
            ) : displayItems.map((item) => {
              const isPickup = item.scheduleType === 'pickup';
              const scheduleDate = isPickup ? item.startAt : item.endAt;
              const daysOverdue = item.daysLate ?? 0;

              return (
                <div
                  key={`${item.id}-${item.scheduleType}`}
                  onClick={() => setSelectedOrder(selectedOrder?.id === item.id ? null : item)}
                  className={`flex items-start gap-4 p-4 cursor-pointer transition-colors
                    ${selectedOrder?.id === item.id ? 'bg-amber/5 border-l-4 border-l-amber' : 'hover:bg-surface-low border-l-4 border-l-transparent'}`}
                >
                  {/* Type indicator */}
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0
                    ${isPickup ? 'bg-navy/8' : item.late ? 'bg-red-50' : 'bg-emerald-50'}`}>
                    <span className={`material-symbols-outlined
                      ${isPickup ? 'text-navy' : item.late ? 'text-red-500' : 'text-emerald-600'}`}
                      style={{ fontSize: '20px', fontVariationSettings: "'FILL' 1" }}>
                      {isPickup ? 'local_shipping' : item.late ? 'warning' : 'assignment_return'}
                    </span>
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold text-navy leading-tight">{item.customerName}</p>
                        <p className="text-xs text-slate mt-0.5 truncate">{item.item}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        {item.late ? (
                          <span className="badge-red text-[10px]">{daysOverdue}d overdue</span>
                        ) : (
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full
                            ${isPickup ? 'bg-navy/8 text-navy' : 'bg-emerald-50 text-emerald-700'}`}>
                            {isPickup ? 'Pickup' : 'Return'}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 mt-2 flex-wrap">
                      <span className="flex items-center gap-1 text-xs text-slate">
                        <span className="material-symbols-outlined" style={{ fontSize: '13px' }}>calendar_today</span>
                        {fmtDate(scheduleDate)}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-slate">
                        <span className="material-symbols-outlined" style={{ fontSize: '13px' }}>payments</span>
                        ₹{item.total.toLocaleString()} total
                      </span>
                      <span className="flex items-center gap-1 text-xs text-slate">
                        <span className="material-symbols-outlined" style={{ fontSize: '13px' }}>tag</span>
                        {item.id}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right panel */}
        <div className="space-y-5">
          {/* Order detail */}
          {selectedOrder ? (
            <div className="card rounded-xl overflow-hidden">
              <div className="bg-navy px-5 py-4 flex justify-between items-start">
                <div>
                  <p className="text-[10px] font-semibold text-on-navy uppercase tracking-widest mb-0.5">Order Detail</p>
                  <p className="text-white font-bold text-sm">{selectedOrder.id}</p>
                </div>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="text-on-navy hover:text-white transition-colors"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>close</span>
                </button>
              </div>
              <div className="p-5 space-y-4">
                {/* Customer */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-navy-container text-white font-bold text-sm flex items-center justify-center flex-shrink-0">
                    {selectedOrder.customerName[0]}
                  </div>
                  <div>
                    <p className="font-semibold text-navy text-sm">{selectedOrder.customerName}</p>
                    <p className="text-xs text-slate">{selectedOrder.email}</p>
                    <p className="text-xs text-slate">{selectedOrder.phone}</p>
                  </div>
                </div>

                <div className="border-t border-slate/10 pt-4 space-y-2.5 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate text-xs">Item</span>
                    <span className="text-navy font-medium text-xs text-right max-w-[55%] truncate">{selectedOrder.item}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate text-xs">Pickup Date</span>
                    <span className="text-navy font-medium text-xs">{fmtDate(selectedOrder.startAt)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate text-xs">Return Date</span>
                    <span className={`font-medium text-xs ${selectedOrder.late ? 'text-red-500' : 'text-navy'}`}>{fmtDate(selectedOrder.endAt)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate text-xs">Duration</span>
                    <span className="text-navy font-medium text-xs">{selectedOrder.days} days</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate text-xs">Rental Total</span>
                    <span className="text-navy font-bold text-sm font-currency">₹{selectedOrder.total.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate text-xs">Security Deposit</span>
                    <span className="text-navy font-medium text-xs font-currency">₹{selectedOrder.deposit.toLocaleString()}</span>
                  </div>
                  {selectedOrder.late && (
                    <div className="flex justify-between bg-red-50 rounded-lg px-3 py-2 -mx-1">
                      <span className="text-red-600 text-xs font-semibold">Overdue by</span>
                      <span className="text-red-600 text-xs font-bold">{selectedOrder.daysLate} days</span>
                    </div>
                  )}
                </div>

                <div className="pt-2 flex gap-2">
                  <a
                    href="/admin/orders"
                    className="btn-secondary flex-1 text-xs py-2.5 text-center"
                  >
                    Open Order
                  </a>
                  {selectedOrder.late && (
                    <button className="btn-primary flex-1 text-xs py-2.5">
                      Process Return
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="card rounded-xl p-5 text-center border-dashed">
              <span className="material-symbols-outlined text-slate/30 block mb-2" style={{ fontSize: '36px' }}>touch_app</span>
              <p className="text-slate text-sm">Click a schedule item to view order details</p>
            </div>
          )}

          {/* Daily checklist */}
          <div className="card rounded-xl p-5">
            <h3 className="text-sm font-semibold text-navy mb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-amber" style={{ fontSize: '18px' }}>checklist</span>
              Daily Ops Checklist
            </h3>
            <DailyChecklist />
          </div>

          {/* Quick legend */}
          <div className="card rounded-xl p-4">
            <h3 className="text-xs font-semibold text-slate uppercase tracking-wide mb-3">Legend</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-navy/8 flex items-center justify-center">
                  <span className="material-symbols-outlined text-navy" style={{ fontSize: '16px', fontVariationSettings: "'FILL' 1" }}>local_shipping</span>
                </div>
                <span className="text-xs text-slate">Scheduled Pickup</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                  <span className="material-symbols-outlined text-emerald-600" style={{ fontSize: '16px', fontVariationSettings: "'FILL' 1" }}>assignment_return</span>
                </div>
                <span className="text-xs text-slate">Scheduled Return</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
                  <span className="material-symbols-outlined text-red-500" style={{ fontSize: '16px', fontVariationSettings: "'FILL' 1" }}>warning</span>
                </div>
                <span className="text-xs text-slate">Overdue Return</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Daily Ops Checklist ─────────────────────────────────────────────────── */
const defaultChecks = [
  'Review today\'s pickup schedule',
  'Confirm product availability for pickups',
  'Check returns scheduled for today',
  'Verify security deposit status for returns',
  'Inspect returned products for damage',
  'Update inventory after confirmed returns',
  'Flag overdue rentals for follow-up',
  'Settle deposits for completed returns',
];

function DailyChecklist() {
  const [checked, setChecked] = useState<boolean[]>(defaultChecks.map(() => false));

  const toggle = (i: number) =>
    setChecked((prev) => { const n = [...prev]; n[i] = !n[i]; return n; });

  const done = checked.filter(Boolean).length;

  return (
    <div>
      {/* Progress bar */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex-1 h-1.5 bg-surface-high rounded-full overflow-hidden mr-3">
          <div
            className="h-full bg-amber rounded-full transition-all duration-300"
            style={{ width: `${(done / defaultChecks.length) * 100}%` }}
          />
        </div>
        <span className="text-xs font-semibold text-slate flex-shrink-0">{done}/{defaultChecks.length}</span>
      </div>
      <div className="space-y-2">
        {defaultChecks.map((item, i) => (
          <label key={i} className="flex items-start gap-2.5 cursor-pointer group">
            <input
              type="checkbox"
              checked={checked[i]}
              onChange={() => toggle(i)}
              className="mt-0.5 w-4 h-4 rounded border-slate/30 text-amber focus:ring-amber flex-shrink-0"
            />
            <span className={`text-xs transition-colors leading-relaxed
              ${checked[i] ? 'line-through text-slate/50' : 'text-on-surface group-hover:text-navy'}`}>
              {item}
            </span>
          </label>
        ))}
      </div>
      {done === defaultChecks.length && (
        <div className="mt-3 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2 text-center">
          <p className="text-emerald-700 text-xs font-semibold">All daily tasks complete 🎉</p>
        </div>
      )}
    </div>
  );
}
