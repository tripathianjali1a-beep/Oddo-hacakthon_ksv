'use client';
import { useState } from 'react';
import Link from 'next/link';

interface OrderItem {
  id: string;
  customer: string;
  status: 'Reserved' | 'Picked Up' | 'Late pickup' | 'Quotation' | 'Cancelled' | 'Late Return';
  statusColor: string;
  pickupDate: string;
  returnDate: string;
  total: number;
  invoiceStatus: 'Invoiced' | 'Confirmed' | 'Quotation Sent' | 'Nothing to Invoice';
  invoiceColor: string;
  category: 'Today' | 'Pickup' | 'Return' | 'Late';
  deposit: number;
  email: string;
  phone: string;
  item: string;
}

const initialOrders: OrderItem[] = [
  { id: 'SO0001', customer: 'Wood Corner', status: 'Reserved', statusColor: 'bg-emerald-100 text-emerald-800 border-emerald-300', pickupDate: 'Jul 6, 6:30pm', returnDate: 'Jul 10, 6:30pm', total: 1520, invoiceStatus: 'Invoiced', invoiceColor: 'bg-blue-100 text-blue-800 border-blue-300', category: 'Today', deposit: 500, email: 'contact@woodcorner.com', phone: '+1 (555) 019-2834', item: 'CAT 320 Excavator Kit' },
  { id: 'SO0005', customer: 'Smith', status: 'Picked Up', statusColor: 'bg-amber-100 text-amber-800 border-amber-300', pickupDate: 'Jul 10, 6:30pm', returnDate: 'Jul 13, 8:30pm', total: 1520, invoiceStatus: 'Confirmed', invoiceColor: 'bg-emerald-100 text-emerald-800 border-emerald-300', category: 'Pickup', deposit: 300, email: 'smith.j@example.com', phone: '+1 (555) 204-8812', item: 'Forklift 8FGU25' },
  { id: 'SO0010', customer: 'John', status: 'Late pickup', statusColor: 'bg-rose-100 text-rose-800 border-rose-300', pickupDate: 'Jul 6, 6:30pm', returnDate: 'Jul 10, 6:30pm', total: 1520, invoiceStatus: 'Invoiced', invoiceColor: 'bg-blue-100 text-blue-800 border-blue-300', category: 'Return', deposit: 400, email: 'john@example.com', phone: '+1 (555) 981-0034', item: 'Commercial Generator 50kVA' },
  { id: 'SO0012', customer: 'Alex', status: 'Quotation', statusColor: 'bg-cyan-100 text-cyan-800 border-cyan-300', pickupDate: 'Jul 8, 9:00am', returnDate: 'Jul 11, 9:00am', total: 1520, invoiceStatus: 'Quotation Sent', invoiceColor: 'bg-purple-100 text-purple-800 border-purple-300', category: 'Pickup', deposit: 250, email: 'alex@example.com', phone: '+1 (555) 330-7721', item: 'Cinema Camera Package' },
  { id: 'SO0020', customer: 'Sam', status: 'Cancelled', statusColor: 'bg-slate-200 text-slate-700 border-slate-300', pickupDate: 'Jul 3, 9:00pm', returnDate: 'Jul 11, 9:00am', total: 1520, invoiceStatus: 'Nothing to Invoice', invoiceColor: 'bg-gray-100 text-gray-700 border-gray-300', category: 'Late', deposit: 150, email: 'sam@example.com', phone: '+1 (555) 819-2045', item: 'Scaffolding Lift 40ft' },
  { id: 'SO0013', customer: 'Smith', status: 'Late Return', statusColor: 'bg-rose-100 text-rose-800 border-rose-300', pickupDate: 'Jul 4, 10:00am', returnDate: 'Jul 9, 5:00pm', total: 1450, invoiceStatus: 'Invoiced', invoiceColor: 'bg-blue-100 text-blue-800 border-blue-300', category: 'Today', deposit: 500, email: 'smith.j@example.com', phone: '+1 (555) 204-8812', item: 'CAT 320 Excavator Kit' },
  { id: 'SO0008', customer: 'Prater', status: 'Reserved', statusColor: 'bg-emerald-100 text-emerald-800 border-emerald-300', pickupDate: 'Jul 11, 8:00am', returnDate: 'Jul 15, 6:00pm', total: 50, invoiceStatus: 'Quotation Sent', invoiceColor: 'bg-purple-100 text-purple-800 border-purple-300', category: 'Return', deposit: 100, email: 'prater@example.com', phone: '+1 (555) 440-1029', item: 'Power Drill Set' },
  { id: 'SO0011', customer: 'Mark wood', status: 'Reserved', statusColor: 'bg-emerald-100 text-emerald-800 border-emerald-300', pickupDate: 'Jul 12, 9:00am', returnDate: 'Jul 16, 5:00pm', total: 1450, invoiceStatus: 'Confirmed', invoiceColor: 'bg-emerald-100 text-emerald-800 border-emerald-300', category: 'Return', deposit: 450, email: 'mark@wood.com', phone: '+1 (555) 902-1182', item: 'Scaffolding Lift 40ft' },
];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<OrderItem[]>(initialOrders);
  // Default view is 'list' as specified in Image 3 ("List view by default")
  const [view, setView] = useState<'list' | 'kanban'>('list');
  const [searchQ, setSearchQ] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'All' | 'Today' | 'Pickup' | 'Return' | 'Late'>('All');
  const [last7Days, setLast7Days] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<OrderItem | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [lateFee, setLateFee] = useState('50.00');
  const [toast, setToast] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const filteredOrders = orders.filter((o) => {
    const matchesSearch = o.customer.toLowerCase().includes(searchQ.toLowerCase()) || o.id.toLowerCase().includes(searchQ.toLowerCase()) || o.item.toLowerCase().includes(searchQ.toLowerCase());
    const matchesCategory = selectedFilter === 'All' || o.category === selectedFilter;
    return matchesSearch && matchesCategory;
  });

  const counts = {
    Today: orders.filter((o) => o.category === 'Today').length,
    Pickup: orders.filter((o) => o.category === 'Pickup').length,
    Return: orders.filter((o) => o.category === 'Return').length,
    Late: orders.filter((o) => o.category === 'Late').length,
  };

  const openDrawer = (order: OrderItem) => {
    setSelectedOrder(order);
    setDrawerOpen(true);
  };

  return (
    <div className="p-6 md:p-8 max-w-[1440px] mx-auto relative">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-navy text-white px-5 py-3.5 rounded-xl shadow-2xl border border-amber/30 flex items-center gap-3 animate-slide-up">
          <span className="material-symbols-outlined shrink-0 text-amber" style={{ fontSize: '20px' }}>check_circle</span>
          <span className="text-sm font-semibold">{toast}</span>
        </div>
      )}

      {/* Top Bar with View Switcher and Actions from Image 3 & Image 5 */}
      <div className="card p-5 mb-6 shadow-md border-slate/15">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Left Action Buttons */}
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-black text-navy flex items-center gap-2">
              <span>Rental Order</span>
              <button
                onClick={() => triggerToast('Rental order settings & gear configuration opened.')}
                className="text-slate hover:text-navy p-1 rounded transition-colors"
                title="Configuration"
              >
                <span className="material-symbols-outlined shrink-0" style={{ fontSize: '20px' }}>settings</span>
              </button>
            </h1>
            <button
              onClick={() => triggerToast('Opening New Rental Order dialog box...')}
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-4 py-1.5 rounded-lg text-xs shadow-sm transition-all flex items-center gap-1"
            >
              <span className="material-symbols-outlined shrink-0" style={{ fontSize: '16px' }}>add</span>
              <span>New</span>
            </button>
          </div>

          {/* Search Box */}
          <div className="flex-1 max-w-md relative">
            <span className="material-symbols-outlined shrink-0 absolute left-3 top-1/2 -translate-y-1/2 text-slate/40" style={{ fontSize: '18px' }}>search</span>
            <input
              type="text"
              placeholder="Search by order reference, customer name, gear..."
              value={searchQ}
              onChange={(e) => setSearchQ(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 text-xs bg-ivory border border-slate/20 rounded-lg text-navy focus:border-purple-500 outline-none font-medium"
            />
          </div>

          {/* Right View Switcher & Profile Toggle from Image 3 */}
          <div className="flex items-center gap-4 justify-between md:justify-end">
            <div className="flex items-center gap-1 bg-ivory p-1 rounded-lg border border-slate/20">
              <span className="text-[10px] font-bold text-slate px-2 hidden sm:inline">View Switcher:</span>
              <button
                onClick={() => { setView('list'); triggerToast('Switched to List View (default)'); }}
                title="List View"
                className={`p-1.5 rounded flex items-center justify-center transition-all ${view === 'list' ? 'bg-navy text-white shadow-sm' : 'text-slate hover:text-navy'}`}
              >
                <span className="material-symbols-outlined shrink-0" style={{ fontSize: '18px' }}>view_list</span>
              </button>
              <button
                onClick={() => { setView('kanban'); triggerToast('Switched to Kanban View'); }}
                title="Kanban View"
                className={`p-1.5 rounded flex items-center justify-center transition-all ${view === 'kanban' ? 'bg-navy text-white shadow-sm' : 'text-slate hover:text-navy'}`}
              >
                <span className="material-symbols-outlined shrink-0" style={{ fontSize: '18px' }}>grid_view</span>
              </button>
            </div>
          </div>
        </div>

        {/* Filter Pills and KPI Bar from Image 3 */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mt-5 pt-4 border-t border-slate/10">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setSelectedFilter(selectedFilter === 'Today' ? 'All' : 'Today')}
              className={`px-3 py-1 rounded-lg text-xs font-bold border transition-all flex items-center gap-1.5 ${selectedFilter === 'Today' ? 'bg-amber text-navy border-amber shadow-sm scale-105' : 'bg-amber/15 text-amber-900 border-amber/30 hover:bg-amber/25'}`}
            >
              <span>{counts.Today}</span>
              <span>Today</span>
            </button>
            <button
              onClick={() => setSelectedFilter(selectedFilter === 'Pickup' ? 'All' : 'Pickup')}
              className={`px-3 py-1 rounded-lg text-xs font-bold border transition-all flex items-center gap-1.5 ${selectedFilter === 'Pickup' ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm scale-105' : 'bg-indigo-100 text-indigo-900 border-indigo-200 hover:bg-indigo-200'}`}
            >
              <span>{counts.Pickup}</span>
              <span>Pickup</span>
            </button>
            <button
              onClick={() => setSelectedFilter(selectedFilter === 'Return' ? 'All' : 'Return')}
              className={`px-3 py-1 rounded-lg text-xs font-bold border transition-all flex items-center gap-1.5 ${selectedFilter === 'Return' ? 'bg-purple-600 text-white border-purple-600 shadow-sm scale-105' : 'bg-purple-100 text-purple-900 border-purple-200 hover:bg-purple-200'}`}
            >
              <span>{counts.Return}</span>
              <span>Return</span>
            </button>
            <button
              onClick={() => setSelectedFilter(selectedFilter === 'Late' ? 'All' : 'Late')}
              className={`px-3 py-1 rounded-lg text-xs font-bold border transition-all flex items-center gap-1.5 ${selectedFilter === 'Late' ? 'bg-rose-600 text-white border-rose-600 shadow-sm scale-105' : 'bg-rose-100 text-rose-900 border-rose-200 hover:bg-rose-200'}`}
            >
              <span>{counts.Late}</span>
              <span>Late</span>
            </button>
            {selectedFilter !== 'All' && (
              <button onClick={() => setSelectedFilter('All')} className="text-xs font-semibold text-slate underline ml-2 hover:text-navy">
                Reset Filter
              </button>
            )}
          </div>

          <div className="flex items-center gap-4 text-xs font-bold bg-ivory px-4 py-2 rounded-xl border border-slate/15">
            <label className="flex items-center gap-2 cursor-pointer border-r border-slate/20 pr-3">
              <input type="checkbox" checked={last7Days} onChange={(e) => setLast7Days(e.target.checked)} className="rounded text-purple-600 focus:ring-purple-500" />
              <span className="text-navy">Last 7 Days</span>
            </label>
            <div className="flex items-center gap-3">
              <span className="text-slate">Sales: <strong className="text-emerald-600 font-currency">$10,450</strong></span>
              <span className="text-slate">Late Fees: <strong className="text-rose-600 font-currency">$235</strong></span>
              <span className="text-slate">Deposits: <strong className="text-navy font-currency">$710</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* List View Table from Image 3 ("List view by default") */}
      {view === 'list' && (
        <div className="space-y-4 animate-fade-in">
          <div className="card rounded-xl overflow-x-auto border-slate/15 shadow-md">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-navy text-white text-[11px] uppercase tracking-wider">
                  <th className="p-3.5 w-10 text-center">
                    <input type="checkbox" className="rounded border-slate/50" />
                  </th>
                  <th className="p-3.5 font-bold">Order Reference</th>
                  <th className="p-3.5 font-bold">Customer</th>
                  <th className="p-3.5 font-bold">Status</th>
                  <th className="p-3.5 font-bold">Pickup Date</th>
                  <th className="p-3.5 font-bold">Return Date</th>
                  <th className="p-3.5 font-bold">Total</th>
                  <th className="p-3.5 font-bold">Invoice Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate/10 text-xs font-medium text-navy bg-white">
                {filteredOrders.map((o) => (
                  <tr key={o.id} onClick={() => openDrawer(o)} className="hover:bg-amber/5 cursor-pointer transition-colors">
                    <td className="p-3.5 text-center" onClick={(e) => e.stopPropagation()}>
                      <input type="checkbox" className="rounded border-slate/30 text-purple-600" />
                    </td>
                    <td className="p-3.5 font-mono font-bold text-purple-700">{o.id}</td>
                    <td className="p-3.5 font-bold text-navy">{o.customer}</td>
                    <td className="p-3.5">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border uppercase tracking-wide ${o.statusColor}`}>
                        {o.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate">{o.pickupDate}</td>
                    <td className="p-3.5 text-slate">{o.returnDate}</td>
                    <td className="p-3.5 font-extrabold font-currency">${o.total.toLocaleString()}</td>
                    <td className="p-3.5">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border uppercase tracking-wide ${o.invoiceColor}`}>
                        {o.invoiceStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Legend Box from Image 3 Bottom */}
          <div className="bg-white border border-slate/20 rounded-xl p-4 shadow-sm flex flex-wrap items-center gap-6 text-xs font-semibold">
            <span className="text-slate uppercase text-[10px] tracking-wider font-bold">Invoice Status Legend:</span>
            <div className="flex items-center gap-2">
              <span className="w-4 h-2.5 bg-purple-500 rounded"></span>
              <span className="text-navy">Quotation Sent</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-2.5 bg-emerald-500 rounded"></span>
              <span className="text-navy">Sale order Confirmed</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-2.5 bg-blue-500 rounded"></span>
              <span className="text-navy">Invoiced</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-2.5 bg-gray-400 rounded"></span>
              <span className="text-navy">Nothing to Invoice</span>
            </div>
          </div>
        </div>
      )}

      {/* Kanban View from Image 5 */}
      {view === 'kanban' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 animate-fade-in">
          {(['Today', 'Pickup', 'Return', 'Late'] as const).map((col) => {
            const colOrders = filteredOrders.filter((o) => o.category === col);
            const colColors = {
              Today: 'border-amber-400 bg-amber-50/50 text-amber-900',
              Pickup: 'border-indigo-400 bg-indigo-50/50 text-indigo-900',
              Return: 'border-purple-400 bg-purple-50/50 text-purple-900',
              Late: 'border-rose-400 bg-rose-50/50 text-rose-900',
            }[col];

            return (
              <div key={col} className="bg-surface-high border border-slate/15 rounded-2xl p-4 flex flex-col gap-3 min-h-[480px]">
                <div className={`flex justify-between items-center px-3 py-2 rounded-xl border-t-4 font-bold text-xs uppercase tracking-wide ${colColors}`}>
                  <span>{col} Orders</span>
                  <span className="px-2 py-0.5 bg-white/80 rounded-full text-[11px] shadow-sm">{colOrders.length}</span>
                </div>

                <div className="space-y-3 flex-1 overflow-y-auto pr-1">
                  {colOrders.map((o) => (
                    <div
                      key={o.id}
                      onClick={() => openDrawer(o)}
                      className="bg-white border border-slate/20 rounded-xl p-4 shadow-sm hover:shadow-md hover:border-purple-500 transition-all cursor-pointer flex flex-col gap-2.5"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-bold text-navy text-sm">{o.customer}</p>
                          <p className="font-mono text-xs text-purple-700 font-semibold">{o.id}</p>
                        </div>
                        <span className="font-bold text-navy font-currency text-sm">${o.total}</span>
                      </div>

                      <p className="text-[11px] text-slate truncate">{o.item}</p>

                      <div className="flex items-center justify-between pt-2 border-t border-slate/10 text-[10px]">
                        <span className={`px-2 py-0.5 rounded-md font-bold uppercase tracking-wider ${o.statusColor}`}>
                          {o.status}
                        </span>
                        <span className={`px-2 py-0.5 rounded-md font-bold uppercase tracking-wider ${o.invoiceColor}`}>
                          {o.invoiceStatus}
                        </span>
                      </div>
                    </div>
                  ))}
                  {colOrders.length === 0 && (
                    <div className="h-32 flex items-center justify-center border-2 border-dashed border-slate/20 rounded-xl text-slate text-xs font-semibold">
                      No orders in {col}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Order Detail Side Drawer */}
      {drawerOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full max-w-lg h-full overflow-y-auto shadow-2xl p-6 flex flex-col justify-between animate-slide-left">
            <div>
              <div className="flex justify-between items-center pb-4 border-b border-slate/15">
                <div>
                  <h3 className="text-lg font-bold text-navy">Order Details — {selectedOrder.id}</h3>
                  <p className="text-xs text-slate">{selectedOrder.customer} ({selectedOrder.email})</p>
                </div>
                <button onClick={() => setDrawerOpen(false)} className="w-8 h-8 rounded-full bg-slate/10 hover:bg-slate/20 flex items-center justify-center">
                  <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>close</span>
                </button>
              </div>

              <div className="py-6 space-y-4 text-xs font-medium text-navy">
                <div className="bg-ivory p-4 rounded-xl border border-slate/15 space-y-2">
                  <div className="flex justify-between"><span className="text-slate">Equipment Item:</span><span className="font-bold">{selectedOrder.item}</span></div>
                  <div className="flex justify-between"><span className="text-slate">Pickup Date:</span><span>{selectedOrder.pickupDate}</span></div>
                  <div className="flex justify-between"><span className="text-slate">Return Due:</span><span>{selectedOrder.returnDate}</span></div>
                  <div className="flex justify-between"><span className="text-slate">Total Amount:</span><span className="font-bold font-currency">${selectedOrder.total}</span></div>
                  <div className="flex justify-between"><span className="text-slate">Security Deposit:</span><span className="font-bold text-amber">${selectedOrder.deposit}</span></div>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate uppercase">Deduct Late Fee / Damage Assessment ($)</label>
                  <input
                    type="number"
                    value={lateFee}
                    onChange={(e) => setLateFee(e.target.value)}
                    className="input-field text-sm font-bold"
                  />
                  <p className="text-[11px] text-slate">Deducted from ${selectedOrder.deposit} deposit during inspection.</p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate/15 flex gap-3">
              <button
                type="button"
                onClick={() => { triggerToast(`Order ${selectedOrder.id} confirmed and marked as Paid/Invoiced.`); setDrawerOpen(false); }}
                className="btn-primary flex-1 py-3 text-xs font-bold"
              >
                Mark Invoiced & Process Return
              </button>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="btn-secondary px-5 py-3 text-xs font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
