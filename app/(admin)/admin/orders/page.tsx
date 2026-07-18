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
  const [view, setView] = useState<'list' | 'kanban'>('list');
  const [searchQ, setSearchQ] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'All' | 'Today' | 'Pickup' | 'Return' | 'Late'>('All');
  const [last7Days, setLast7Days] = useState(true);

  // Modal Views for New Order Page (Image 1) and Invoice Page (Image 3)
  const [modalMode, setModalMode] = useState<'none' | 'newOrder' | 'invoice'>('none');

  // New Order / Edit Order State (Image 1 & Image 3)
  const [orderForm, setOrderForm] = useState({
    id: 'SO0075',
    customer: 'Wood Corner',
    invoiceAddress: '24 Industrial Blvd, Suite 400, Springfield',
    deliveryAddress: 'Site B Construction Yard, 102 East Ave, Springfield',
    startDate: '2026-07-18',
    endDate: '2026-07-25',
    priceList: 'Corporate Tier 1 (10% Off)',
    // Status step from Image 1: 'Quotation' | 'Quotation Sent' | 'Sale Order'
    statusStep: 'Quotation' as 'Quotation' | 'Quotation Sent' | 'Sale Order',
  });

  // Invoice Page State (Image 3 bottom)
  const [invoiceForm, setInvoiceForm] = useState({
    id: 'INV/2026/0001',
    customer: 'Wood Corner',
    invoiceAddress: '24 Industrial Blvd, Suite 400, Springfield',
    deliveryAddress: 'Site B Construction Yard, 102 East Ave, Springfield',
    invoiceDate: '2026-07-18',
    // Invoice status: 'Draft' | 'Posted'
    invoiceStep: 'Draft' as 'Draft' | 'Posted',
  });

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

  const openNewOrderForm = (existing?: OrderItem) => {
    if (existing) {
      setOrderForm({
        id: existing.id,
        customer: existing.customer,
        invoiceAddress: `${existing.customer} HQ, Industrial Avenue 102`,
        deliveryAddress: `${existing.customer} Site Depot, Sector 4`,
        startDate: '2026-07-18',
        endDate: '2026-07-25',
        priceList: 'Corporate Tier 1 (10% Off)',
        statusStep: existing.status === 'Quotation' ? 'Quotation' : 'Sale Order',
      });
    } else {
      setOrderForm({
        id: `SO00${Math.floor(10 + Math.random() * 89)}`,
        customer: 'Wood Corner',
        invoiceAddress: '24 Industrial Blvd, Suite 400, Springfield',
        deliveryAddress: 'Site B Construction Yard, 102 East Ave, Springfield',
        startDate: '2026-07-18',
        endDate: '2026-07-25',
        priceList: 'Corporate Tier 1 (10% Off)',
        statusStep: 'Quotation',
      });
    }
    setModalMode('newOrder');
  };

  const openInvoicePage = () => {
    setInvoiceForm({
      id: `INV/2026/000${Math.floor(1 + Math.random() * 9)}`,
      customer: orderForm.customer,
      invoiceAddress: orderForm.invoiceAddress,
      deliveryAddress: orderForm.deliveryAddress,
      invoiceDate: '2026-07-18',
      invoiceStep: 'Draft',
    });
    setModalMode('invoice');
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

      {/* Top Bar with View Switcher and Actions */}
      <div className="card p-5 mb-6 shadow-md border-slate/15">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-black text-navy flex items-center gap-2">
              <span>Rental Order</span>
              <button
                onClick={() => triggerToast('Rental order policies & gear configuration opened.')}
                className="text-slate hover:text-navy p-1 rounded transition-colors"
                title="Configuration"
              >
                <span className="material-symbols-outlined shrink-0" style={{ fontSize: '20px' }}>settings</span>
              </button>
            </h1>
            <button
              onClick={() => openNewOrderForm()}
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-4 py-1.5 rounded-lg text-xs shadow-sm transition-all flex items-center gap-1"
            >
              <span className="material-symbols-outlined shrink-0" style={{ fontSize: '16px' }}>add</span>
              <span>New</span>
            </button>
          </div>

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

        {/* Filter Pills and KPI Bar */}
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

      {/* List View Table */}
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
                  <tr key={o.id} onClick={() => openNewOrderForm(o)} className="hover:bg-amber/5 cursor-pointer transition-colors">
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

      {/* Kanban View */}
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
                      onClick={() => openNewOrderForm(o)}
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

      {/* NEW ORDER / EDIT RENTAL ORDER PAGE MODAL (Image 1 & Image 3 top) */}
      {modalMode === 'newOrder' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-5xl w-full overflow-hidden shadow-2xl border border-slate/20 flex flex-col max-h-[92vh]">
            {/* Top Bar from Image 1: [ New ] Rental order [ ✔ ] [ ✖ ] */}
            <div className="bg-navy text-white px-6 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="px-2.5 py-1 rounded bg-purple-600 text-[11px] font-black uppercase tracking-wider">New</span>
                <span className="text-base font-bold">Rental order</span>
                <button
                  type="button"
                  onClick={() => { triggerToast(`Order ${orderForm.id} saved successfully!`); setModalMode('none'); }}
                  className="w-7 h-7 rounded bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center transition-colors"
                  title="Save & Confirm"
                >
                  <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>
                </button>
                <button
                  type="button"
                  onClick={() => setModalMode('none')}
                  className="w-7 h-7 rounded bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center transition-colors"
                  title="Discard"
                >
                  <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>close</span>
                </button>
              </div>
              <span className="text-xs text-slate-300 font-mono font-bold">Form View: {orderForm.id}</span>
            </div>

            {/* Second Action & Stepper Bar from Image 1 & Image 3 */}
            <div className="bg-ivory px-6 py-3 border-b border-slate/15 flex flex-wrap items-center justify-between gap-4">
              {/* Left Action Buttons depending on statusStep */}
              <div className="flex items-center gap-2">
                {orderForm.statusStep === 'Sale Order' ? (
                  /* Buttons when status is Sale Order (Image 3 annotation: Make it visible only when sale order/rental order is confirmed) */
                  <>
                    <button
                      type="button"
                      onClick={() => { triggerToast('Opening Invoice creation workflow...'); openInvoicePage(); }}
                      className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-4 py-1.5 rounded text-xs shadow-sm transition-all"
                    >
                      Create Invoice
                    </button>
                    <button
                      type="button"
                      onClick={() => triggerToast(`Pickup verified and equipment marked active for ${orderForm.id}`)}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-1.5 rounded text-xs shadow-sm transition-all"
                    >
                      Pickup
                    </button>
                    <button
                      type="button"
                      onClick={() => { triggerToast('Printing order confirmation agreement...'); window.print(); }}
                      className="btn-secondary px-4 py-1.5 text-xs font-bold"
                    >
                      Print
                    </button>
                    <button
                      type="button"
                      onClick={() => { setOrderForm({ ...orderForm, statusStep: 'Quotation' }); triggerToast('Order cancelled and reset to quotation.'); }}
                      className="btn-secondary px-4 py-1.5 text-xs font-bold text-rose-600"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  /* Buttons when Quotation or Quotation Sent (Image 1) */
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setOrderForm({ ...orderForm, statusStep: 'Quotation Sent' });
                        triggerToast('Quotation sent to customer! State changed from Quotation to Quotation Sent.');
                      }}
                      className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-4 py-1.5 rounded text-xs shadow-sm transition-all"
                    >
                      Send
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setOrderForm({ ...orderForm, statusStep: 'Sale Order' });
                        triggerToast('Quotation confirmed! State changed to Sale Order. Create Invoice & Pickup buttons now visible.');
                      }}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-1.5 rounded text-xs shadow-sm transition-all"
                    >
                      Confirm
                    </button>
                    <button
                      type="button"
                      onClick={() => { triggerToast('Printing quotation proposal...'); window.print(); }}
                      className="btn-secondary px-4 py-1.5 text-xs font-bold"
                    >
                      Print
                    </button>
                  </>
                )}
              </div>

              {/* Right Status Stepper from Image 1: Quotation -> Quotation Sent -> Sale Order */}
              <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-xl border border-slate/20 text-xs font-bold">
                {(['Quotation', 'Quotation Sent', 'Sale Order'] as const).map((step) => (
                  <button
                    key={step}
                    type="button"
                    onClick={() => setOrderForm({ ...orderForm, statusStep: step })}
                    className={`px-3 py-1 rounded-lg transition-all ${
                      orderForm.statusStep === step
                        ? 'bg-navy text-white shadow-sm font-black'
                        : 'text-slate hover:text-navy'
                    }`}
                  >
                    {step}
                  </button>
                ))}
              </div>
            </div>

            {/* Form Fields Body from Image 1 */}
            <div className="p-6 space-y-6 overflow-y-auto flex-1">
              <div>
                <h2 className="text-2xl font-black font-mono text-purple-700">{orderForm.id}</h2>
                <span className="text-xs text-slate font-medium">Rental Order Document & Schedule</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-ivory/60 border border-slate/15 rounded-xl p-5">
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate uppercase mb-1">Customer</label>
                    <select
                      value={orderForm.customer}
                      onChange={(e) => setOrderForm({ ...orderForm, customer: e.target.value })}
                      className="input-field text-xs py-2 font-bold text-navy bg-white"
                    >
                      <option>Wood Corner</option>
                      <option>Smith</option>
                      <option>John</option>
                      <option>Alex</option>
                      <option>Sam</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate uppercase mb-1">Invoice Address</label>
                    <input
                      type="text"
                      value={orderForm.invoiceAddress}
                      onChange={(e) => setOrderForm({ ...orderForm, invoiceAddress: e.target.value })}
                      className="input-field text-xs py-2 font-medium bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate uppercase mb-1">Delivery Address</label>
                    <input
                      type="text"
                      value={orderForm.deliveryAddress}
                      onChange={(e) => setOrderForm({ ...orderForm, deliveryAddress: e.target.value })}
                      className="input-field text-xs py-2 font-medium bg-white"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate uppercase mb-1">Rental Period (Start date → End date)</label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="date"
                        value={orderForm.startDate}
                        onChange={(e) => setOrderForm({ ...orderForm, startDate: e.target.value })}
                        className="input-field text-xs py-2 font-semibold bg-white"
                      />
                      <input
                        type="date"
                        value={orderForm.endDate}
                        onChange={(e) => setOrderForm({ ...orderForm, endDate: e.target.value })}
                        className="input-field text-xs py-2 font-semibold bg-white"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate uppercase mb-1">Price List</label>
                    <select
                      value={orderForm.priceList}
                      onChange={(e) => setOrderForm({ ...orderForm, priceList: e.target.value })}
                      className="input-field text-xs py-2 font-bold text-navy bg-white"
                    >
                      <option>Corporate Tier 1 (10% Off)</option>
                      <option>Standard Public Rate</option>
                      <option>Summer Promo 2026</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Order Line Section from Image 1 */}
              <div className="border border-slate/20 rounded-xl overflow-hidden bg-white shadow-sm">
                <div className="bg-surface-high px-4 py-2.5 border-b border-slate/15 flex items-center gap-4">
                  <span className="text-xs font-black text-navy uppercase border-b-2 border-purple-600 pb-1">Order Line</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-ivory border-b border-slate/15 text-[11px] uppercase text-slate font-bold">
                      <tr>
                        <th className="py-2.5 px-4">Product</th>
                        <th className="py-2.5 px-4 text-center">Quantity</th>
                        <th className="py-2.5 px-4">Unit</th>
                        <th className="py-2.5 px-4">Unit Price</th>
                        <th className="py-2.5 px-4 text-center">Taxes</th>
                        <th className="py-2.5 px-4 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate/10 font-semibold text-navy">
                      <tr>
                        <td className="py-3 px-4">
                          <span>Computers</span>
                          <span className="block text-[10px] text-slate font-normal">[{orderForm.startDate} → {orderForm.endDate}]</span>
                        </td>
                        <td className="py-3 px-4 text-center">20</td>
                        <td className="py-3 px-4">Units</td>
                        <td className="py-3 px-4 font-currency">Rs 20,000</td>
                        <td className="py-3 px-4 text-center">18%</td>
                        <td className="py-3 px-4 text-right font-bold font-currency">Rs 4,00,000</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="p-4 bg-ivory/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="flex items-center gap-4 text-xs font-bold text-purple-700 underline">
                    <button type="button" onClick={() => triggerToast('Opening product selector to append order line...')}>+ Add a Product</button>
                    <button type="button" onClick={() => triggerToast('Adding internal remark note...')}>+ Add a note</button>
                  </div>
                  <div className="space-y-1 text-xs font-bold text-navy text-right w-full md:w-64">
                    <div className="flex justify-between"><span className="text-slate">Untaxed Amount:</span><span className="font-currency">Rs 4,00,000</span></div>
                    <div className="flex justify-between"><span className="text-slate">Taxes (18%):</span><span className="font-currency">Rs 72,000</span></div>
                    <div className="flex justify-between pt-1 border-t border-slate/20 text-sm font-black"><span className="text-navy">Total:</span><span className="font-currency text-purple-700">Rs 4,72,000</span></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* INVOICE PAGE MODAL (Draft Invoice / INV/2026/0001 from Image 3 bottom) */}
      {modalMode === 'invoice' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-5xl w-full overflow-hidden shadow-2xl border border-slate/20 flex flex-col max-h-[92vh]">
            {/* Top Bar from Image 3: [ New ] [ ✔ ] [ ✖ ] */}
            <div className="bg-navy text-white px-6 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="px-2.5 py-1 rounded bg-purple-600 text-[11px] font-black uppercase tracking-wider">New</span>
                <span className="text-base font-bold">Draft Invoice</span>
                <button
                  type="button"
                  onClick={() => { triggerToast(`Invoice ${invoiceForm.id} saved & confirmed!`); setModalMode('none'); }}
                  className="w-7 h-7 rounded bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center transition-colors"
                  title="Confirm"
                >
                  <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>
                </button>
                <button
                  type="button"
                  onClick={() => setModalMode('newOrder')}
                  className="w-7 h-7 rounded bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center transition-colors"
                  title="Close / Back to Order"
                >
                  <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>close</span>
                </button>
              </div>
              <span className="text-xs text-slate-300 font-mono font-bold">Invoice Form: {invoiceForm.id}</span>
            </div>

            {/* Second Action & Stepper Bar from Image 3: [ Send ] [ Print ] [ Pay ] and right [ Draft ] [ Posted ] */}
            <div className="bg-ivory px-6 py-3 border-b border-slate/15 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => { setInvoiceForm({ ...invoiceForm, invoiceStep: 'Posted' }); triggerToast('Invoice sent to customer email & posted to ledger!'); }}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-4 py-1.5 rounded text-xs shadow-sm transition-all"
                >
                  Send
                </button>
                <button
                  type="button"
                  onClick={() => { triggerToast('Printing invoice INV/2026/0001...'); window.print(); }}
                  className="btn-secondary px-4 py-1.5 text-xs font-bold"
                >
                  Print
                </button>
                <button
                  type="button"
                  onClick={() => { setInvoiceForm({ ...invoiceForm, invoiceStep: 'Posted' }); triggerToast('Payment verified! Invoice status marked as Posted.'); }}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-1.5 rounded text-xs shadow-sm transition-all"
                >
                  Pay
                </button>
              </div>

              {/* Right Status Stepper: Draft -> Posted */}
              <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-xl border border-slate/20 text-xs font-bold">
                {(['Draft', 'Posted'] as const).map((step) => (
                  <button
                    key={step}
                    type="button"
                    onClick={() => setInvoiceForm({ ...invoiceForm, invoiceStep: step })}
                    className={`px-4 py-1 rounded-lg transition-all ${
                      invoiceForm.invoiceStep === step
                        ? 'bg-navy text-white shadow-sm font-black'
                        : 'text-slate hover:text-navy'
                    }`}
                  >
                    {step}
                  </button>
                ))}
              </div>
            </div>

            {/* Form Fields Body from Image 3 */}
            <div className="p-6 space-y-6 overflow-y-auto flex-1">
              <div>
                <h2 className="text-2xl font-black font-mono text-purple-700">{invoiceForm.id}</h2>
                <span className="text-xs text-slate font-medium">Commercial Rental Invoice & Tax Billing</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-ivory/60 border border-slate/15 rounded-xl p-5">
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate uppercase mb-1">Customer</label>
                    <input
                      type="text"
                      value={invoiceForm.customer}
                      onChange={(e) => setInvoiceForm({ ...invoiceForm, customer: e.target.value })}
                      className="input-field text-xs py-2 font-bold text-navy bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate uppercase mb-1">Invoice Address</label>
                    <input
                      type="text"
                      value={invoiceForm.invoiceAddress}
                      onChange={(e) => setInvoiceForm({ ...invoiceForm, invoiceAddress: e.target.value })}
                      className="input-field text-xs py-2 font-medium bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate uppercase mb-1">Delivery Address</label>
                    <input
                      type="text"
                      value={invoiceForm.deliveryAddress}
                      onChange={(e) => setInvoiceForm({ ...invoiceForm, deliveryAddress: e.target.value })}
                      className="input-field text-xs py-2 font-medium bg-white"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate uppercase mb-1">Invoice date</label>
                    <input
                      type="date"
                      value={invoiceForm.invoiceDate}
                      onChange={(e) => setInvoiceForm({ ...invoiceForm, invoiceDate: e.target.value })}
                      className="input-field text-xs py-2 font-semibold bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Invoice Lines Section from Image 3 */}
              <div className="border border-slate/20 rounded-xl overflow-hidden bg-white shadow-sm">
                <div className="bg-surface-high px-4 py-2.5 border-b border-slate/15 flex items-center gap-4">
                  <span className="text-xs font-black text-navy uppercase border-b-2 border-purple-600 pb-1">Invoice Lines</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-ivory border-b border-slate/15 text-[11px] uppercase text-slate font-bold">
                      <tr>
                        <th className="py-2.5 px-4">Product</th>
                        <th className="py-2.5 px-4 text-center">Quantity</th>
                        <th className="py-2.5 px-4">Unit</th>
                        <th className="py-2.5 px-4">Unit Price</th>
                        <th className="py-2.5 px-4 text-center">Taxes</th>
                        <th className="py-2.5 px-4 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate/10 font-semibold text-navy">
                      <tr>
                        <td className="py-3 px-4">
                          <span>Computers</span>
                          <span className="block text-[10px] text-slate font-normal">[{orderForm.startDate} → {orderForm.endDate}]</span>
                        </td>
                        <td className="py-3 px-4 text-center">20</td>
                        <td className="py-3 px-4">Units</td>
                        <td className="py-3 px-4 font-currency">Rs 20,000</td>
                        <td className="py-3 px-4 text-center">18%</td>
                        <td className="py-3 px-4 text-right font-bold font-currency">Rs 4,00,000</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="p-4 bg-ivory/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="flex items-center gap-4 text-xs font-bold text-purple-700 underline">
                    <button type="button" onClick={() => triggerToast('Adding additional invoice line product...')}>+ Add a Product</button>
                    <button type="button" onClick={() => triggerToast('Appending accounting note...')}>+ Add a note</button>
                  </div>
                  <div className="space-y-1 text-xs font-bold text-navy text-right w-full md:w-64">
                    <div className="flex justify-between"><span className="text-slate">Untaxed Amount:</span><span className="font-currency">Rs 4,00,000</span></div>
                    <div className="flex justify-between"><span className="text-slate">Taxes (18%):</span><span className="font-currency">Rs 72,000</span></div>
                    <div className="flex justify-between pt-1 border-t border-slate/20 text-sm font-black"><span className="text-navy">Total:</span><span className="font-currency text-purple-700">Rs 4,72,000</span></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
