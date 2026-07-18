'use client';
import { useState } from 'react';

interface Booking {
  id: string;
  assetName: string;
  clientName: string;
  clientEmail: string;
  category: 'Cinema Equipment' | 'Luxury Property' | 'Exotic Vehicle' | 'Yacht';
  startDate: string;
  endDate: string;
  status: 'Confirmed' | 'Pending' | 'Maintenance' | 'Checked Out';
  totalRate: string;
}

const mockBookings: Booking[] = [
  {
    id: 'SCH-9012',
    assetName: 'ARRI Alexa Mini LF Cinema Package',
    clientName: 'Elena Rostova',
    clientEmail: 'elena@rostovafilms.com',
    category: 'Cinema Equipment',
    startDate: '2026-07-19',
    endDate: '2026-07-24',
    status: 'Confirmed',
    totalRate: '$6,250'
  },
  {
    id: 'SCH-9013',
    assetName: 'The Glass Pavilion - Malibu Villa',
    clientName: 'Marcus Vance',
    clientEmail: 'm.vance@vanceproductions.com',
    category: 'Luxury Property',
    startDate: '2026-07-20',
    endDate: '2026-07-28',
    status: 'Checked Out',
    totalRate: '$38,400'
  },
  {
    id: 'SCH-9014',
    assetName: 'Rolls-Royce Spectre 2026 EV',
    clientName: 'Arthur Pendelton',
    clientEmail: 'arthur@pendelton.co.uk',
    category: 'Exotic Vehicle',
    startDate: '2026-07-21',
    endDate: '2026-07-23',
    status: 'Pending',
    totalRate: '$4,800'
  },
  {
    id: 'SCH-9015',
    assetName: 'Cooke Anamorphic /i Full Frame Plus Lenses',
    clientName: 'Chloé St. Laurent',
    clientEmail: 'chloe@stlaurent.fr',
    category: 'Cinema Equipment',
    startDate: '2026-07-22',
    endDate: '2026-07-30',
    status: 'Confirmed',
    totalRate: '$7,120'
  },
  {
    id: 'SCH-9016',
    assetName: '85ft Sunseeker Predator Yacht',
    clientName: 'Julian Thorne',
    clientEmail: 'j.thorne@globalholdings.com',
    category: 'Yacht',
    startDate: '2026-07-25',
    endDate: '2026-07-27',
    status: 'Maintenance',
    totalRate: '$19,500'
  }
];

const daysOfWeek = ['Sun, Jul 19', 'Mon, Jul 20', 'Tue, Jul 21', 'Wed, Jul 22', 'Thu, Jul 23', 'Fri, Jul 24', 'Sat, Jul 25'];

export default function SchedulePage() {
  const [viewMode, setViewMode] = useState<'week' | 'month' | 'agenda'>('week');
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [newModalOpen, setNewModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // New Booking State
  const [newBooking, setNewBooking] = useState({
    assetName: '',
    clientName: '',
    category: 'Cinema Equipment' as Booking['category'],
    startDate: '2026-07-20',
    endDate: '2026-07-23',
    totalRate: '$2,400'
  });
  const [bookings, setBookings] = useState<Booking[]>(mockBookings);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleCreateBooking = (e: React.FormEvent) => {
    e.preventDefault();
    const created: Booking = {
      id: `SCH-${Math.floor(1000 + Math.random() * 9000)}`,
      assetName: newBooking.assetName || 'Custom Bespoke Reservation',
      clientName: newBooking.clientName || 'VIP Client',
      clientEmail: 'vip.client@luxrent.com',
      category: newBooking.category,
      startDate: newBooking.startDate,
      endDate: newBooking.endDate,
      status: 'Confirmed',
      totalRate: newBooking.totalRate
    };
    setBookings([created, ...bookings]);
    setNewModalOpen(false);
    triggerToast(`Booking ${created.id} scheduled successfully.`);
  };

  const filtered = bookings.filter((b) => {
    if (filterCategory !== 'All' && b.category !== filterCategory) return false;
    if (filterStatus !== 'All' && b.status !== filterStatus) return false;
    return true;
  });

  const getStatusBadge = (status: Booking['status']) => {
    switch (status) {
      case 'Confirmed':
        return 'bg-emerald-500/15 text-emerald-700 border-emerald-500/30';
      case 'Checked Out':
        return 'bg-blue-500/15 text-blue-700 border-blue-500/30';
      case 'Pending':
        return 'bg-amber/15 text-amber border-amber/30';
      case 'Maintenance':
        return 'bg-rose-500/15 text-rose-700 border-rose-500/30';
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-[1440px] mx-auto space-y-6 animate-fade-in">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-navy text-white px-5 py-3.5 rounded-xl shadow-2xl border border-amber/30 flex items-center gap-3 animate-slide-up">
          <span className="material-symbols-outlined shrink-0 text-amber" style={{ fontSize: '20px' }}>check_circle</span>
          <span className="text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate/15 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="badge-amber text-xs">Dispatch & Scheduling</span>
            <span className="text-slate text-xs font-medium">Live Asset Matrix</span>
          </div>
          <h1 className="text-3xl font-bold text-navy mt-1.5">Master Reservation Schedule</h1>
          <p className="text-slate text-sm mt-1">Coordinate luxury properties, high-end equipment turnarounds, and fleet dispatches.</p>
        </div>

        <div className="flex items-center flex-wrap gap-3">
          <div className="flex bg-ivory p-1 rounded-xl border border-slate/15 text-xs font-semibold">
            {(['week', 'month', 'agenda'] as const).map((m) => (
              <button
                key={m}
                onClick={() => setViewMode(m)}
                className={`px-3.5 py-1.5 rounded-lg capitalize transition-all ${
                  viewMode === m ? 'bg-navy text-white shadow' : 'text-slate hover:text-navy'
                }`}
              >
                {m} View
              </button>
            ))}
          </div>

          <button
            onClick={() => triggerToast('Master Schedule synced with Google & Outlook Calendar feeds.')}
            className="btn-secondary px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2"
          >
            <span className="material-symbols-outlined shrink-0" style={{ fontSize: '18px' }}>sync</span>
            <span>Sync Feeds</span>
          </button>

          <button
            onClick={() => setNewModalOpen(true)}
            className="btn-primary px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2"
          >
            <span className="material-symbols-outlined shrink-0" style={{ fontSize: '18px' }}>add</span>
            <span>New Booking</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate/15 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined shrink-0 text-slate" style={{ fontSize: '18px' }}>filter_list</span>
            <span className="text-xs font-semibold text-navy">Filters:</span>
          </div>

          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="input-field text-xs py-1.5 px-3 w-auto bg-ivory/80"
          >
            <option value="All">All Categories</option>
            <option value="Cinema Equipment">Cinema Equipment</option>
            <option value="Luxury Property">Luxury Property</option>
            <option value="Exotic Vehicle">Exotic Vehicle</option>
            <option value="Yacht">Yacht</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="input-field text-xs py-1.5 px-3 w-auto bg-ivory/80"
          >
            <option value="All">All Statuses</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Checked Out">Checked Out</option>
            <option value="Pending">Pending</option>
            <option value="Maintenance">Maintenance</option>
          </select>
        </div>

        <div className="flex items-center gap-4 text-xs text-slate font-medium">
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Confirmed ({filtered.filter(b => b.status === 'Confirmed').length})</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Checked Out ({filtered.filter(b => b.status === 'Checked Out').length})</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber" /> Pending ({filtered.filter(b => b.status === 'Pending').length})</span>
        </div>
      </div>

      {/* Schedule Matrix / Agenda */}
      {viewMode === 'agenda' ? (
        <div className="bg-white rounded-2xl border border-slate/15 overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate/15 bg-ivory/60 text-xs font-semibold text-slate uppercase tracking-wider">
                <th className="py-3.5 px-6">Booking ID</th>
                <th className="py-3.5 px-6">Asset Specification</th>
                <th className="py-3.5 px-6">Client Details</th>
                <th className="py-3.5 px-6">Dates & Turnaround</th>
                <th className="py-3.5 px-6">Status</th>
                <th className="py-3.5 px-6 text-right">Total Rate</th>
                <th className="py-3.5 px-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate/10 text-sm">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-ivory/40 transition-colors">
                  <td className="py-4 px-6 font-mono font-bold text-navy">{item.id}</td>
                  <td className="py-4 px-6">
                    <p className="font-bold text-navy">{item.assetName}</p>
                    <span className="text-xs text-amber font-semibold">{item.category}</span>
                  </td>
                  <td className="py-4 px-6">
                    <p className="font-semibold text-navy">{item.clientName}</p>
                    <p className="text-xs text-slate">{item.clientEmail}</p>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-1.5 text-xs font-medium text-navy">
                      <span className="material-symbols-outlined shrink-0 text-slate" style={{ fontSize: '15px' }}>calendar_today</span>
                      <span>{item.startDate} → {item.endDate}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(item.status)}`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right font-bold text-navy font-currency">{item.totalRate}</td>
                  <td className="py-4 px-6 text-right">
                    <button
                      onClick={() => setSelectedBooking(item)}
                      className="text-amber hover:text-navy text-xs font-bold transition-colors"
                    >
                      Inspect Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        /* Week / Calendar View Grid */
        <div className="bg-white rounded-2xl border border-slate/15 p-6 shadow-sm overflow-x-auto">
          <div className="grid grid-cols-7 min-w-[800px] gap-4 border-b border-slate/15 pb-4 mb-4">
            {daysOfWeek.map((day, i) => (
              <div key={day} className={`p-3 rounded-xl text-center ${i === 1 ? 'bg-navy text-white shadow-md' : 'bg-ivory text-navy'}`}>
                <p className="text-xs font-bold uppercase tracking-wider">{day.split(',')[0]}</p>
                <p className={`text-sm font-extrabold mt-0.5 ${i === 1 ? 'text-amber' : 'text-slate'}`}>{day.split(',')[1]}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 min-w-[800px] gap-4">
            {daysOfWeek.map((_, colIndex) => {
              // Distribute items across columns for realistic visualization
              const dayBookings = filtered.filter((_, idx) => idx % 7 === colIndex);
              return (
                <div key={colIndex} className="space-y-3 min-h-[320px] bg-ivory/30 p-2.5 rounded-xl border border-slate/10">
                  {dayBookings.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-slate/40 text-xs italic">
                      No active dispatches
                    </div>
                  ) : (
                    dayBookings.map((b) => (
                      <div
                        key={b.id}
                        onClick={() => setSelectedBooking(b)}
                        className="p-3 rounded-xl bg-white border border-slate/15 shadow-sm hover:border-amber hover:shadow-md cursor-pointer transition-all group"
                      >
                        <div className="flex items-center justify-between gap-1 mb-1.5">
                          <span className="text-[10px] font-mono font-bold text-slate">{b.id}</span>
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${getStatusBadge(b.status)}`}>
                            {b.status}
                          </span>
                        </div>
                        <p className="text-xs font-bold text-navy line-clamp-1 group-hover:text-amber transition-colors">{b.assetName}</p>
                        <p className="text-[11px] text-slate mt-1 line-clamp-1">👤 {b.clientName}</p>
                        <div className="mt-2 pt-2 border-t border-slate/10 flex items-center justify-between text-[10px] font-semibold text-navy">
                          <span>{b.startDate.slice(5)}</span>
                          <span className="font-currency text-amber">{b.totalRate}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Booking Details Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 bg-navy/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate/15 space-y-5 animate-scale-up">
            <div className="flex items-center justify-between border-b border-slate/15 pb-4">
              <div>
                <span className="text-xs font-mono font-bold text-slate">{selectedBooking.id}</span>
                <h3 className="text-xl font-bold text-navy">{selectedBooking.assetName}</h3>
              </div>
              <button
                onClick={() => setSelectedBooking(null)}
                className="p-2 rounded-full hover:bg-slate/10 text-slate hover:text-navy transition-colors"
              >
                <span className="material-symbols-outlined shrink-0" style={{ fontSize: '20px' }}>close</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="p-3 rounded-xl bg-ivory border border-slate/10">
                <span className="text-xs text-slate font-semibold block">Client Name</span>
                <span className="font-bold text-navy">{selectedBooking.clientName}</span>
              </div>
              <div className="p-3 rounded-xl bg-ivory border border-slate/10">
                <span className="text-xs text-slate font-semibold block">Category</span>
                <span className="font-bold text-amber">{selectedBooking.category}</span>
              </div>
              <div className="p-3 rounded-xl bg-ivory border border-slate/10">
                <span className="text-xs text-slate font-semibold block">Start Date</span>
                <span className="font-bold text-navy">{selectedBooking.startDate}</span>
              </div>
              <div className="p-3 rounded-xl bg-ivory border border-slate/10">
                <span className="text-xs text-slate font-semibold block">End Date</span>
                <span className="font-bold text-navy">{selectedBooking.endDate}</span>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl bg-navy-container text-white">
              <div>
                <span className="text-xs text-white/70 block">Total Reservation Value</span>
                <span className="text-2xl font-bold text-amber font-currency">{selectedBooking.totalRate}</span>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusBadge(selectedBooking.status)} bg-white/90`}>
                {selectedBooking.status}
              </span>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => {
                  triggerToast(`Dispatch orders for ${selectedBooking.id} sent to warehouse.`);
                  setSelectedBooking(null);
                }}
                className="btn-secondary px-4 py-2 rounded-xl text-xs font-bold"
              >
                Dispatch Authorization
              </button>
              <button
                onClick={() => {
                  setBookings(bookings.filter(b => b.id !== selectedBooking.id));
                  setSelectedBooking(null);
                  triggerToast(`Reservation ${selectedBooking.id} cancelled/archived.`);
                }}
                className="bg-rose-500 hover:bg-rose-600 text-white px-4 py-2 rounded-xl text-xs font-bold transition-colors"
              >
                Cancel Booking
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Booking Modal */}
      {newModalOpen && (
        <div className="fixed inset-0 z-50 bg-navy/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <form onSubmit={handleCreateBooking} className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate/15 space-y-4 animate-scale-up">
            <div className="flex items-center justify-between border-b border-slate/15 pb-3">
              <h3 className="text-lg font-bold text-navy">Schedule New Reservation</h3>
              <button
                type="button"
                onClick={() => setNewModalOpen(false)}
                className="p-1 rounded-full hover:bg-slate/10 text-slate"
              >
                <span className="material-symbols-outlined shrink-0" style={{ fontSize: '20px' }}>close</span>
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate uppercase mb-1">Asset or Property Name *</label>
              <input
                type="text"
                required
                value={newBooking.assetName}
                onChange={(e) => setNewBooking({ ...newBooking, assetName: e.target.value })}
                placeholder="e.g. Sony Venice 2 Package"
                className="input-field text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate uppercase mb-1">Client Full Name *</label>
              <input
                type="text"
                required
                value={newBooking.clientName}
                onChange={(e) => setNewBooking({ ...newBooking, clientName: e.target.value })}
                placeholder="e.g. Elena Rostova"
                className="input-field text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate uppercase mb-1">Category</label>
                <select
                  value={newBooking.category}
                  onChange={(e) => setNewBooking({ ...newBooking, category: e.target.value as any })}
                  className="input-field text-sm"
                >
                  <option value="Cinema Equipment">Cinema Equipment</option>
                  <option value="Luxury Property">Luxury Property</option>
                  <option value="Exotic Vehicle">Exotic Vehicle</option>
                  <option value="Yacht">Yacht</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate uppercase mb-1">Total Rate ($)</label>
                <input
                  type="text"
                  required
                  value={newBooking.totalRate}
                  onChange={(e) => setNewBooking({ ...newBooking, totalRate: e.target.value })}
                  className="input-field text-sm font-currency"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate uppercase mb-1">Start Date</label>
                <input
                  type="date"
                  value={newBooking.startDate}
                  onChange={(e) => setNewBooking({ ...newBooking, startDate: e.target.value })}
                  className="input-field text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate uppercase mb-1">End Date</label>
                <input
                  type="date"
                  value={newBooking.endDate}
                  onChange={(e) => setNewBooking({ ...newBooking, endDate: e.target.value })}
                  className="input-field text-sm"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate/15">
              <button
                type="button"
                onClick={() => setNewModalOpen(false)}
                className="btn-secondary px-4 py-2 rounded-xl text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary px-5 py-2 rounded-xl text-xs font-bold"
              >
                Confirm Booking
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
