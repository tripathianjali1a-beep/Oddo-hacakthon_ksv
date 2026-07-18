'use client';
import { useState } from 'react';

const orders = [
  { id: '#ORD-0942', customer: 'Sarah Jenkins', email: 'sarah.j@example.com', phone: '+1 (555) 019-2834', item: 'Canon EOS R5 Camera Kit', due: 'Today', status: 'pending', badge: 'badge-amber', badgeLabel: 'Pending Return', deposit: 500, late: true },
  { id: '#ORD-0941', customer: 'Michael Chen', email: 'michael.c@example.com', phone: '+1 (555) 204-8812', item: 'MacBook Pro 16"', due: 'Oct 24, 2024', status: 'active', badge: 'badge-green', badgeLabel: 'Active', deposit: 800, late: false },
  { id: '#ORD-0940', customer: 'Elena Rostova', email: 'elena.r@example.com', phone: '+1 (555) 981-0034', item: 'CAT 320 Excavator', due: 'Oct 28, 2024', status: 'active', badge: 'badge-green', badgeLabel: 'Active', deposit: 1000, late: false },
  { id: '#ORD-0939', customer: 'James Park', email: 'james.p@example.com', phone: '+1 (555) 330-7721', item: 'Forklift 8FGU25', due: 'Oct 15, 2024', status: 'returned', badge: 'badge-slate', badgeLabel: 'Returned', deposit: 300, late: false },
];

const checklist = [
  'All accessories included (charger, cables)',
  'No visible physical damage to main unit',
  'Device powers on and functions correctly',
  'Storage is wiped / reset to factory',
];

export default function AdminOrdersPage() {
  const [selectedOrder, setSelectedOrder] = useState<typeof orders[0] | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [view, setView] = useState<'list' | 'kanban'>('list');
  const [checkedItems, setCheckedItems] = useState<boolean[]>(checklist.map(() => false));
  const [lateFee, setLateFee] = useState('50.00');
  const [searchQ, setSearchQ] = useState('');
  const [processing, setProcessing] = useState(false);
  const [processed, setProcessed] = useState<string[]>([]);
  const [toast, setToast] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const openDrawer = (order: typeof orders[0]) => {
    setSelectedOrder(order);
    setDrawerOpen(true);
    setCheckedItems(checklist.map(() => false));
    setLateFee('50.00');
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setTimeout(() => setSelectedOrder(null), 300);
  };

  const toggleCheck = (i: number) => {
    setCheckedItems((prev) => { const next = [...prev]; next[i] = !next[i]; return next; });
  };

  const refund = Math.max(0, (selectedOrder?.deposit || 0) - (parseFloat(lateFee) || 0));

  const processReturn = async () => {
    setProcessing(true);
    await new Promise((r) => setTimeout(r, 1200));
    if (selectedOrder) {
      setProcessed((prev) => [...prev, selectedOrder.id]);
      triggerToast(`Order ${selectedOrder.id} return processed. Total refund of $${refund.toFixed(2)} issued.`);
    }
    setProcessing(false);
    closeDrawer();
  };

  const filtered = orders.filter((o) =>
    o.customer.toLowerCase().includes(searchQ.toLowerCase()) ||
    o.item.toLowerCase().includes(searchQ.toLowerCase()) ||
    o.id.toLowerCase().includes(searchQ.toLowerCase())
  );

  return (
    <div className="p-6 md:p-8 max-w-[1440px] relative">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-navy text-white px-5 py-3.5 rounded-xl shadow-2xl border border-amber/30 flex items-center gap-3 animate-slide-up">
          <span className="material-symbols-outlined shrink-0 text-amber" style={{ fontSize: '20px' }}>check_circle</span>
          <span className="text-sm font-semibold">{toast}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div>
          <h1 className="text-h1 text-navy">Order Management</h1>
          <p className="text-slate text-sm mt-1">Review and process active rentals and returns.</p>
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
          <span className="material-symbols-outlined shrink-0 absolute left-3 top-1/2 -translate-y-1/2 text-slate/50" style={{fontSize:'18px'}}>search</span>
          <input type="text" placeholder="Search orders, customers, items..." value={searchQ} onChange={(e) => setSearchQ(e.target.value)} className="input-field pl-9 text-sm" />
        </div>
        <button
          onClick={() => triggerToast('Advanced order filtering modal opened.')}
          className="btn-secondary text-xs py-2 px-3 flex items-center justify-center gap-1.5"
        >
          <span className="material-symbols-outlined shrink-0" style={{fontSize:'16px'}}>filter_list</span>
          <span>Filter</span>
        </button>
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
              {filtered.map((order) => (
                <tr
                  key={order.id}
                  className="table-row cursor-pointer"
                  onClick={() => openDrawer(order)}
                >
                  <td className="table-cell font-currency font-semibold text-navy">{order.id}</td>
                  <td className="table-cell">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-navy-container text-white text-xs flex items-center justify-center font-semibold flex-shrink-0">
                        {order.customer[0]}
                      </div>
                      <span className="font-medium text-navy text-sm">{order.customer}</span>
                    </div>
                  </td>
                  <td className="table-cell hidden md:table-cell text-slate">{order.item}</td>
                  <td className={`table-cell hidden lg:table-cell font-medium ${order.due === 'Today' ? 'text-red-600' : 'text-slate'}`}>{order.due}</td>
                  <td className="table-cell">
                    {processed.includes(order.id)
                      ? <span className="badge-green">Processed</span>
                      : <span className={order.badge}>{order.badgeLabel}</span>
                    }
                  </td>
                  <td className="table-cell text-right">
                    <button className={`transition-colors flex items-center justify-center ml-auto ${order.status === 'pending' ? 'text-amber hover:text-navy' : 'text-slate hover:text-navy'}`}>
                      <span className="material-symbols-outlined shrink-0" style={{fontSize:'20px'}}>chevron_right</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="p-12 text-center text-slate text-sm">No orders found.</div>
          )}
        </div>
      )}

      {/* Kanban View */}
      {view === 'kanban' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {['active', 'pending', 'returned'].map((status) => {
            const statusLabels: Record<string, string> = { active: 'Active Rentals', pending: 'Pending Return', returned: 'Returned' };
            const statusBadge: Record<string, string> = { active: 'badge-green', pending: 'badge-amber', returned: 'badge-slate' };
            const col = filtered.filter((o) => processed.includes(o.id) ? false : o.status === status);
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
                        {order.due === 'Today' && <span className="badge-red text-[10px]">Due Today</span>}
                      </div>
                      <p className="font-semibold text-navy text-sm">{order.customer}</p>
                      <p className="text-slate text-xs mt-0.5 line-clamp-1">{order.item}</p>
                      <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate/10">
                        <span className="text-xs text-slate">{order.due}</span>
                        <span className="material-symbols-outlined shrink-0 text-slate" style={{fontSize:'16px'}}>open_in_new</span>
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
                  {processed.includes(selectedOrder.id)
                    ? <span className="badge-green">Processed</span>
                    : <span className={selectedOrder.badge}>{selectedOrder.badgeLabel}</span>
                  }
                </div>
                <p className="text-slate text-xs">Rental Period: Oct 20 – {selectedOrder.due}</p>
              </div>
              <button onClick={closeDrawer} className="p-1.5 rounded-full hover:bg-surface-high transition-colors text-slate flex items-center justify-center">
                <span className="material-symbols-outlined shrink-0" style={{fontSize:'20px'}}>close</span>
              </button>
            </div>

            <div className="flex-1 p-5 space-y-5">
              {/* Customer */}
              <section>
                <h3 className="text-[10px] font-semibold text-slate uppercase tracking-widest mb-3">Customer Details</h3>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-navy-container text-white text-base font-bold flex items-center justify-center flex-shrink-0">
                    {selectedOrder.customer[0]}
                  </div>
                  <div>
                    <p className="font-semibold text-navy">{selectedOrder.customer}</p>
                    <p className="text-slate text-xs">{selectedOrder.email} • {selectedOrder.phone}</p>
                  </div>
                </div>
              </section>

              {/* Item */}
              <section>
                <h3 className="text-[10px] font-semibold text-slate uppercase tracking-widest mb-2">Rental Item</h3>
                <div className="bg-ivory rounded-lg border border-slate/10 p-3 flex items-center gap-3">
                  <span className="material-symbols-outlined shrink-0 text-slate" style={{fontSize:'20px'}}>inventory_2</span>
                  <p className="text-navy font-medium text-sm">{selectedOrder.item}</p>
                </div>
              </section>

              {/* Return Process */}
              <section className="border border-slate/10 rounded-xl overflow-hidden">
                <div className="bg-ivory px-4 py-3 border-b border-slate/10 flex items-center gap-2">
                  <span className="material-symbols-outlined shrink-0 text-navy" style={{fontSize:'18px'}}>fact_check</span>
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
                      <span className="font-currency font-semibold text-navy">${selectedOrder.deposit.toLocaleString()}.00</span>
                    </div>
                    <div className="flex justify-between items-center mb-3">
                      <label className="text-[10px] font-semibold text-slate uppercase tracking-wide flex items-center gap-1" htmlFor="late-fee-input">
                        Late/Damage Fee
                        {selectedOrder.late && <span className="material-symbols-outlined shrink-0 text-amber" style={{fontSize:'14px'}}>warning</span>}
                      </label>
                      <div className="relative">
                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate font-mono text-sm">$</span>
                        <input
                          id="late-fee-input"
                          type="number"
                          value={lateFee}
                          onChange={(e) => setLateFee(e.target.value)}
                          className="input-field w-28 pl-6 pr-2 py-1.5 text-right font-currency text-sm"
                          min="0"
                        />
                      </div>
                    </div>

                    {/* Refund ledger card */}
                    <div className="ledger-card flex justify-between items-center">
                      <span className="font-semibold text-navy text-sm">Total Refund</span>
                      <span className="font-currency font-bold text-navy text-h3">${refund.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </section>
            </div>

            {/* Drawer Footer */}
            <div className="p-5 border-t border-slate/10 sticky bottom-0 bg-white flex gap-3">
              <button onClick={closeDrawer} className="btn-secondary flex-1 py-2.5 flex items-center justify-center"><span>Cancel</span></button>
              <button
                onClick={processReturn}
                disabled={processing || processed.includes(selectedOrder.id)}
                className="btn-primary flex-1 py-2.5 flex items-center justify-center gap-1.5"
              >
                {processing
                  ? <><span className="material-symbols-outlined shrink-0 animate-spin" style={{fontSize:'18px'}}>refresh</span><span>Processing...</span></>
                  : processed.includes(selectedOrder.id)
                  ? <span>Processed ✓</span>
                  : <span>Process Return</span>
                }
              </button>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
