'use client';
import { Suspense, useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import type { Order } from '@/lib/types';

const badgeFor = (o: Order) => {
  if (o.late) return { badge: 'badge-red', label: `Overdue ${o.daysLate}d` };
  if (o.status === 'reserved') return { badge: 'badge-amber', label: 'Reserved' };
  if (o.status === 'active') return { badge: 'badge-green', label: 'Active' };
  if (o.status === 'returned') return { badge: 'badge-slate', label: 'Returned' };
  return { badge: 'badge-slate', label: 'Cancelled' };
};

const fmtDate = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';

const checklist = [
  'All accessories included (charger, cables)',
  'No visible physical damage to main unit',
  'Device powers on and functions correctly',
  'Storage is wiped / reset to factory',
];

export default function AdminOrdersPage() {
  return (
    <Suspense>
      <AdminOrdersContent />
    </Suspense>
  );
}

function AdminOrdersContent() {
  const searchParams = useSearchParams();
  const focusId = searchParams.get('focus');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [view, setView] = useState<'list' | 'kanban'>('list');
  const [checkedItems, setCheckedItems] = useState<boolean[]>(checklist.map(() => false));
  const [lateFee, setLateFee] = useState('0.00');
  const [searchQ, setSearchQ] = useState('');
  const [processing, setProcessing] = useState(false);
  const [actionError, setActionError] = useState('');

  const load = useCallback(() => {
    setLoading(true);
    fetch('/api/orders')
      .then((r) => r.json())
      .then((data: Order[]) => setOrders(data))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  // Deep-linked from the Dashboard's overdue list (?focus=<orderId>) — open
  // that order's drawer once, as soon as it's loaded. A ref (not state) guards
  // this so subsequent reloads (e.g. after processing a return) don't fight
  // the user by reopening a drawer they just closed.
  const autoOpened = useRef(false);
  useEffect(() => {
    if (!focusId || loading || autoOpened.current) return;
    const match = orders.find((o) => o.id === focusId);
    if (match) { openDrawer(match); autoOpened.current = true; }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusId, loading, orders]);

  const openDrawer = (order: Order) => {
    setSelectedOrder(order);
    setDrawerOpen(true);
    setCheckedItems(checklist.map(() => false));
    setLateFee(order.late ? '50.00' : '0.00');
    setActionError('');
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setTimeout(() => setSelectedOrder(null), 300);
  };

  const toggleCheck = (i: number) => {
    setCheckedItems((prev) => { const next = [...prev]; next[i] = !next[i]; return next; });
  };

  const refund = Math.max(0, (selectedOrder?.deposit || 0) - (parseFloat(lateFee) || 0));
  const allChecked = checkedItems.every(Boolean);

  const runAction = async (action: 'pickup' | 'return' | 'cancel') => {
    if (!selectedOrder) return;
    setProcessing(true);
    setActionError('');
    try {
      const res = await fetch(`/api/orders/${selectedOrder.id}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(action === 'return' ? { action, lateFee: parseFloat(lateFee) || 0 } : { action }),
      });
      const data = await res.json();
      if (!res.ok) { setActionError(data.error || 'Action failed.'); setProcessing(false); return; }
      setProcessing(false);
      closeDrawer();
      load();
    } catch {
      setActionError('Network error. Please try again.');
      setProcessing(false);
    }
  };

  const filtered = orders.filter((o) =>
    o.customerName.toLowerCase().includes(searchQ.toLowerCase()) ||
    o.item.toLowerCase().includes(searchQ.toLowerCase()) ||
    o.id.toLowerCase().includes(searchQ.toLowerCase())
  );

  return (
    <div className="p-6 md:p-8 max-w-[1440px] relative">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div>
          <h1 className="text-h1 text-navy">Order Management</h1>
          <p className="text-slate text-sm mt-1">Review and process reservations, pickups and returns.</p>
        </div>
        <div className="flex items-center gap-2 mt-3 sm:mt-0">
          <div className="flex bg-surface-high p-1 rounded-lg border border-slate/10">
            <button onClick={() => setView('list')} className={`px-4 py-1.5 rounded text-xs font-semibold transition-all ${view === 'list' ? 'bg-white shadow-sm text-navy' : 'text-slate hover:text-navy'}`}>List</button>
            <button onClick={() => setView('kanban')} className={`px-4 py-1.5 rounded text-xs font-semibold transition-all ${view === 'kanban' ? 'bg-white shadow-sm text-navy' : 'text-slate hover:text-navy'}`}>Kanban</button>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="card p-4 mb-5 flex items-center gap-3">
        <div className="relative flex-1">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate/50" style={{fontSize:'18px'}}>search</span>
          <input type="text" placeholder="Search orders, customers, items..." value={searchQ} onChange={(e) => setSearchQ(e.target.value)} className="input-field pl-9 text-sm" />
        </div>
      </div>

      {/* List View */}
      {view === 'list' && (
        <div className="card rounded-xl overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-ivory border-b border-slate/10">
                <th className="table-header">Order ID</th>
                <th className="table-header">Customer</th>
                <th className="table-header hidden md:table-cell">Item</th>
                <th className="table-header hidden lg:table-cell">Due Date</th>
                <th className="table-header">Status</th>
                <th className="table-header text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((order) => {
                const b = badgeFor(order);
                return (
                <tr
                  key={order.id}
                  className="table-row cursor-pointer"
                  onClick={() => openDrawer(order)}
                >
                  <td className="table-cell font-currency font-semibold text-navy">{order.id}</td>
                  <td className="table-cell">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-navy-container text-white text-xs flex items-center justify-center font-semibold flex-shrink-0">
                        {order.customerName[0]}
                      </div>
                      <span className="font-medium text-navy text-sm">{order.customerName}</span>
                    </div>
                  </td>
                  <td className="table-cell hidden md:table-cell text-slate">{order.item}</td>
                  <td className={`table-cell hidden lg:table-cell font-medium ${order.late ? 'text-red-600' : 'text-slate'}`}>{fmtDate(order.endAt)}</td>
                  <td className="table-cell">
                    <span className={b.badge}>{b.label}</span>
                  </td>
                  <td className="table-cell text-right">
                    <button className={`transition-colors ${order.late ? 'text-amber hover:text-navy' : 'text-slate hover:text-navy'}`}>
                      <span className="material-symbols-outlined" style={{fontSize:'20px'}}>chevron_right</span>
                    </button>
                  </td>
                </tr>
                );
              })}
            </tbody>
          </table>
          {loading && <div className="p-12 text-center text-slate text-sm">Loading orders…</div>}
          {!loading && filtered.length === 0 && (
            <div className="p-12 text-center text-slate text-sm">No orders found.</div>
          )}
        </div>
      )}

      {/* Kanban View */}
      {view === 'kanban' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {(['reserved', 'active', 'returned'] as const).map((status) => {
            const statusLabels: Record<string, string> = { reserved: 'Reserved', active: 'Active Rentals', returned: 'Returned' };
            const statusBadge: Record<string, string> = { reserved: 'badge-amber', active: 'badge-green', returned: 'badge-slate' };
            const col = filtered.filter((o) => o.status === status);
            return (
              <div key={status}>
                <div className="flex items-center gap-2 mb-3">
                  <h3 className="font-semibold text-navy text-sm">{statusLabels[status]}</h3>
                  <span className={`${statusBadge[status]} text-[10px]`}>{col.length}</span>
                </div>
                <div className="space-y-3">
                  {col.map((order) => (
                    <div key={order.id} onClick={() => openDrawer(order)} className="card p-4 cursor-pointer hover:border-amber transition-all card-hover">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-xs font-currency font-semibold text-slate">{order.id}</span>
                        {order.late && <span className="badge-red text-[10px]">{order.daysLate}d Overdue</span>}
                      </div>
                      <p className="font-semibold text-navy text-sm">{order.customerName}</p>
                      <p className="text-slate text-xs mt-0.5 line-clamp-1">{order.item}</p>
                      <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate/10">
                        <span className="text-xs text-slate">{fmtDate(order.startAt)} → {fmtDate(order.endAt)}</span>
                        <span className="material-symbols-outlined text-slate" style={{fontSize:'16px'}}>open_in_new</span>
                      </div>
                    </div>
                  ))}
                  {col.length === 0 && <div className="card p-6 text-center text-slate text-xs">No orders</div>}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Drawer Overlay */}
      <div
        className={`fixed inset-0 bg-black/30 z-40 transition-opacity duration-300 ${drawerOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={closeDrawer}
      />

      {/* Order Detail Drawer */}
      <aside className={`drawer ${drawerOpen ? 'open' : ''}`}>
        {selectedOrder && (
          <>
            <div className="p-5 border-b border-slate/10 flex justify-between items-start sticky top-0 bg-white z-10">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-h3 text-navy">Order {selectedOrder.id}</h2>
                  <span className={badgeFor(selectedOrder).badge}>{badgeFor(selectedOrder).label}</span>
                </div>
                <p className="text-slate text-xs">Rental Period: {fmtDate(selectedOrder.startAt)} – {fmtDate(selectedOrder.endAt)}</p>
              </div>
              <button onClick={closeDrawer} className="p-1.5 rounded-full hover:bg-surface-high transition-colors text-slate">
                <span className="material-symbols-outlined" style={{fontSize:'20px'}}>close</span>
              </button>
            </div>

            <div className="flex-1 p-5 space-y-5">
              {actionError && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">{actionError}</div>
              )}

              {/* Customer */}
              <section>
                <h3 className="text-[10px] font-semibold text-slate uppercase tracking-widest mb-3">Customer Details</h3>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-navy-container text-white text-base font-bold flex items-center justify-center flex-shrink-0">
                    {selectedOrder.customerName[0]}
                  </div>
                  <div>
                    <p className="font-semibold text-navy">{selectedOrder.customerName}</p>
                    <p className="text-slate text-xs">{selectedOrder.email} • {selectedOrder.phone}</p>
                  </div>
                </div>
              </section>

              {/* Item */}
              <section>
                <h3 className="text-[10px] font-semibold text-slate uppercase tracking-widest mb-2">Rental Item</h3>
                <div className="bg-ivory rounded-lg border border-slate/10 p-3 flex items-center gap-3">
                  <span className="material-symbols-outlined text-slate" style={{fontSize:'20px'}}>inventory_2</span>
                  <div>
                    <p className="text-navy font-medium text-sm">{selectedOrder.item}</p>
                    <p className="text-slate text-xs">{selectedOrder.addonLabel} · {selectedOrder.days} days @ ₹{selectedOrder.rate}/day · total ₹{selectedOrder.total.toLocaleString()}</p>
                    <p className="text-slate text-xs mt-0.5">
                      Payment: {selectedOrder.paymentStatus === 'paid' ? `Razorpay · ${selectedOrder.paymentRef}` : 'Demo mode'}
                    </p>
                  </div>
                </div>
              </section>

              {/* Reserved: pickup / cancel */}
              {selectedOrder.status === 'reserved' && (
                <section className="border border-slate/10 rounded-xl p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-navy" style={{fontSize:'18px'}}>event_upcoming</span>
                    <h3 className="text-sm font-semibold text-navy">Reservation</h3>
                  </div>
                  <p className="text-xs text-slate">Pickup scheduled for {fmtDate(selectedOrder.startAt)}. Mark as picked up when the customer collects the item.</p>
                </section>
              )}

              {/* Active: return process */}
              {selectedOrder.status === 'active' && (
                <section className="border border-slate/10 rounded-xl overflow-hidden">
                  <div className="bg-ivory px-4 py-3 border-b border-slate/10 flex items-center gap-2">
                    <span className="material-symbols-outlined text-navy" style={{fontSize:'18px'}}>fact_check</span>
                    <h3 className="text-sm font-semibold text-navy">Return Process</h3>
                  </div>
                  <div className="p-4 space-y-4">
                    {/* Checklist */}
                    <div>
                      <p className="text-[10px] font-semibold text-slate uppercase tracking-wide mb-2">Condition Checklist</p>
                      <div className="space-y-2.5">
                        {checklist.map((item, i) => (
                          <label key={i} className="flex items-start gap-2.5 cursor-pointer group">
                            <input
                              type="checkbox"
                              checked={checkedItems[i]}
                              onChange={() => toggleCheck(i)}
                              className="mt-0.5 w-4 h-4 rounded border-slate/30 text-navy focus:ring-amber"
                            />
                            <span className={`text-sm transition-colors ${checkedItems[i] ? 'text-navy line-through opacity-60' : 'text-on-surface group-hover:text-amber'}`}>{item}</span>
                          </label>
                        ))}
                      </div>
                      <div className="mt-2 text-xs text-slate">{checkedItems.filter(Boolean).length} of {checklist.length} checked</div>
                    </div>

                    {/* Deposit & Late Fee */}
                    <div className="border-t border-slate/10 pt-4">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-[10px] font-semibold text-slate uppercase tracking-wide">Security Deposit Held</span>
                        <span className="font-currency font-semibold text-navy">₹{selectedOrder.deposit.toLocaleString()}.00</span>
                      </div>
                      <div className="flex justify-between items-center mb-3">
                        <label className="text-[10px] font-semibold text-slate uppercase tracking-wide flex items-center gap-1" htmlFor="late-fee-input">
                          Late/Damage Fee
                          {selectedOrder.late && <span className="material-symbols-outlined text-amber" style={{fontSize:'14px'}}>warning</span>}
                        </label>
                        <div className="relative">
                          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate font-mono text-sm">₹</span>
                          <input
                            id="late-fee-input"
                            type="number"
                            value={lateFee}
                            onChange={(e) => setLateFee(e.target.value)}
                            className="input-field w-28 pl-6 pr-2 py-1.5 text-right font-currency text-sm"
                            min="0"
                            max={selectedOrder.deposit}
                          />
                        </div>
                      </div>

                      {/* Refund ledger card */}
                      <div className="ledger-card flex justify-between items-center">
                        <span className="font-semibold text-navy text-sm">Deposit Refund</span>
                        <span className="font-currency font-bold text-navy text-h3">₹{refund.toFixed(2)}</span>
                      </div>
                      {(parseFloat(lateFee) || 0) > selectedOrder.deposit && (
                        <p className="text-red-600 text-xs mt-2">Fee cannot exceed the held deposit.</p>
                      )}
                    </div>
                  </div>
                </section>
              )}

              {/* Returned summary */}
              {selectedOrder.status === 'returned' && (
                <section className="border border-slate/10 rounded-xl p-4 space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-slate">Returned on</span><span className="text-navy font-medium">{fmtDate(selectedOrder.returnedAt)}</span></div>
                  <div className="flex justify-between"><span className="text-slate">Late/Damage fee</span><span className="text-navy font-medium">₹{selectedOrder.lateFee.toLocaleString()}</span></div>
                  <div className="flex justify-between"><span className="text-slate">Deposit refunded</span><span className="text-emerald-600 font-semibold">₹{selectedOrder.refund.toLocaleString()}</span></div>
                </section>
              )}
            </div>

            {/* Drawer Footer */}
            <div className="p-5 border-t border-slate/10 sticky bottom-0 bg-white flex gap-3">
              {selectedOrder.status === 'reserved' && (
                <>
                  <button onClick={() => runAction('cancel')} disabled={processing} className="btn-secondary flex-1 py-2.5">Cancel Order</button>
                  <button onClick={() => runAction('pickup')} disabled={processing} className="btn-primary flex-1 py-2.5">
                    {processing ? 'Saving…' : 'Mark Picked Up'}
                  </button>
                </>
              )}
              {selectedOrder.status === 'active' && (
                <>
                  <button onClick={closeDrawer} className="btn-secondary flex-1 py-2.5">Close</button>
                  <button
                    onClick={() => runAction('return')}
                    disabled={processing || !allChecked}
                    title={allChecked ? '' : 'Complete the condition checklist first'}
                    className="btn-primary flex-1 py-2.5 disabled:opacity-40"
                  >
                    {processing
                      ? <><span className="material-symbols-outlined animate-spin" style={{fontSize:'18px'}}>refresh</span>Processing...</>
                      : 'Process Return'
                    }
                  </button>
                </>
              )}
              {(selectedOrder.status === 'returned' || selectedOrder.status === 'cancelled') && (
                <button onClick={closeDrawer} className="btn-secondary flex-1 py-2.5">Close</button>
              )}
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
