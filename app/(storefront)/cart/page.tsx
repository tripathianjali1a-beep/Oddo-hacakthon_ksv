'use client';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const initialItems = [
  { id: 1, title: 'CAT 320 Excavator', attachment: 'Standard Heavy Grading Bucket', days: 5, quantity: 1, rate: 499, deposit: 500, img: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=200&q=80', pickup: '10/15/2024 08:00 AM', returnDate: '10/20/2024 06:00 PM' },
  { id: 2, title: 'Toyota Forklift 8FGU25', attachment: 'Pneumatic Warehouse Package', days: 3, quantity: 1, rate: 210, deposit: 300, img: 'https://images.unsplash.com/photo-1605731009813-8e0a0b2c2f4b?w=200&q=80', pickup: '10/18/2024 09:00 AM', returnDate: '10/21/2024 05:00 PM' },
];

export default function CartPage() {
  const router = useRouter();
  const [items, setItems] = useState(initialItems);
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoError, setPromoError] = useState('');
  const [pickupDate, setPickupDate] = useState('10/15/2024 08:00 AM');
  const [returnDate, setReturnDate] = useState('10/20/2024 06:00 PM');
  const [toast, setToast] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const updateQuantity = (id: number, delta: number) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const nextQ = Math.max(1, item.quantity + delta);
          return { ...item, quantity: nextQ };
        }
        return item;
      })
    );
  };

  const removeItem = (id: number) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
    triggerToast('Item removed from cart.');
  };

  const subtotal = items.reduce((sum, item) => sum + item.rate * item.days * item.quantity, 0);
  const depositTotal = items.reduce((sum, item) => sum + item.deposit * item.quantity, 0);
  const fees = Math.round(subtotal * 0.08);
  const discount = promoApplied ? Math.min(subtotal, 100) : 0;
  const total = subtotal + fees + depositTotal - discount;

  const validCodes = ['LUXRENT10', 'XXXX10', 'WELCOME10', 'SUMMER23', 'FLEET25', 'BULKTIER35'];

  const applyPromo = () => {
    setPromoError('');
    if (validCodes.includes(promoCode.trim().toUpperCase())) {
      setPromoApplied(true);
      triggerToast(`Promo code '${promoCode.toUpperCase()}' applied! $100 discount added.`);
    } else {
      setPromoError('Invalid promo code. Try xxxx10 or LUXRENT10.');
    }
  };

  return (
    <div className="max-w-[1440px] mx-auto px-6 py-8 relative">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-navy text-white px-5 py-3.5 rounded-xl shadow-2xl border border-amber/30 flex items-center gap-3 animate-slide-up">
          <span className="material-symbols-outlined shrink-0 text-amber" style={{ fontSize: '20px' }}>check_circle</span>
          <span className="text-sm font-semibold">{toast}</span>
        </div>
      )}

      {/* Mockup Step Breadcrumb Indicator */}
      <div className="mb-8 bg-white border border-slate/15 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="btn-ghost py-1 px-2.5 text-xs flex items-center gap-1">
            <span className="material-symbols-outlined shrink-0" style={{ fontSize: '18px' }}>arrow_back</span>
            <span>Back</span>
          </button>
          <h1 className="text-xl font-bold text-navy">Order Summary & Cart</h1>
        </div>
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
          <span className="bg-amber text-navy px-3 py-1 rounded-full shadow-sm flex items-center gap-1">
            <span className="material-symbols-outlined shrink-0" style={{ fontSize: '16px' }}>shopping_cart</span>
            <span>1. Add to Cart</span>
          </span>
          <span className="material-symbols-outlined text-slate/40 shrink-0" style={{ fontSize: '18px' }}>chevron_right</span>
          <Link href="/checkout" className="text-slate hover:text-navy px-3 py-1 rounded-full border border-slate/20">
            2. Address
          </Link>
          <span className="material-symbols-outlined text-slate/40 shrink-0" style={{ fontSize: '18px' }}>chevron_right</span>
          <span className="text-slate/60 px-3 py-1">3. Payment</span>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="card p-16 text-center">
          <span className="material-symbols-outlined shrink-0 text-slate/30 text-6xl mb-4">shopping_cart</span>
          <h2 className="text-h3 text-navy mb-2">Your cart is empty</h2>
          <p className="text-slate text-sm mb-6">Explore our catalog and add items to your rental order.</p>
          <Link href="/browse" className="btn-primary inline-flex">Browse Rentals</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Cart Items List */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate/15">
              <h2 className="font-bold text-navy text-base">Selected Equipment ({items.length})</h2>
              <span className="text-xs text-slate">Rates verified for commercial lease</span>
            </div>

            {items.map((item) => (
              <div key={item.id} className="card p-5 flex flex-col sm:flex-row gap-5 hover:border-amber/50 transition-all">
                <div className="w-full sm:w-32 h-28 rounded-xl overflow-hidden flex-shrink-0 bg-surface-high border border-slate/10">
                  <img src={item.img} alt={item.title} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <h3 className="font-bold text-navy text-base">{item.title}</h3>
                        <p className="text-slate text-xs mt-0.5">{item.attachment}</p>
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        title="Remove item"
                        className="text-slate hover:text-red-600 transition-colors p-1 rounded-lg hover:bg-red-50 shrink-0"
                      >
                        <span className="material-symbols-outlined shrink-0" style={{ fontSize: '20px' }}>delete</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-3 mt-3 flex-wrap">
                      <div className="flex items-center gap-1 text-xs text-slate bg-ivory px-2.5 py-1 rounded border border-slate/10">
                        <span className="material-symbols-outlined shrink-0 text-amber" style={{ fontSize: '14px' }}>calendar_today</span>
                        <span>{item.days} Days Booking</span>
                      </div>
                      <span className="badge-green text-[10px]">INSPECTED ✓</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center mt-4 pt-3 border-t border-slate/10">
                    {/* Quantity Selector (- 1 +) from Mockup */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate">Qty:</span>
                      <div className="flex items-center border border-slate/20 rounded-lg bg-ivory overflow-hidden">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, -1)}
                          className="w-7 h-7 flex items-center justify-center text-navy font-bold hover:bg-amber hover:text-white transition-colors"
                        >
                          −
                        </button>
                        <span className="w-8 text-center text-xs font-bold text-navy">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, 1)}
                          className="w-7 h-7 flex items-center justify-center text-navy font-bold hover:bg-amber hover:text-white transition-colors"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[11px] text-slate block">${item.rate}/day × {item.days}d × {item.quantity}</span>
                      <span className="font-extrabold text-navy font-currency text-base">${(item.rate * item.days * item.quantity).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <div className="pt-2">
              <Link
                href="/browse"
                className="btn-secondary w-full py-3 text-xs flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined shrink-0" style={{ fontSize: '18px' }}>add_circle</span>
                <span>Continue Shopping & Add More Items</span>
              </Link>
            </div>
          </div>

          {/* Right Column: Rental Period + Order Summary from Mockup */}
          <div className="lg:col-span-5 space-y-6">
            <div className="card p-6 sticky top-24 space-y-6 shadow-md border-amber/20">
              {/* Rental Period Inputs from Mockup */}
              <div className="space-y-3 pb-5 border-b border-slate/15">
                <h3 className="font-bold text-navy text-sm flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-amber shrink-0" style={{ fontSize: '18px' }}>date_range</span>
                  <span>Rental Period & Delivery Window</span>
                </h3>
                <div className="space-y-2.5">
                  <div>
                    <label className="block text-[10px] font-bold text-slate uppercase mb-1">Pickup / Start Date & Time</label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate/50 shrink-0" style={{ fontSize: '16px' }}>schedule</span>
                      <input
                        type="text"
                        value={pickupDate}
                        onChange={(e) => setPickupDate(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-xs border border-slate/20 rounded-lg bg-ivory font-medium text-navy focus:border-amber outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate uppercase mb-1">Return / End Date & Time</label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate/50 shrink-0" style={{ fontSize: '16px' }}>schedule</span>
                      <input
                        type="text"
                        value={returnDate}
                        onChange={(e) => setReturnDate(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-xs border border-slate/20 rounded-lg bg-ivory font-medium text-navy focus:border-amber outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Coupon Input from Mockup */}
              <div className="space-y-2 pb-5 border-b border-slate/15">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-navy">Delivery Coupon / Promo Code</label>
                  <span className="text-[10px] text-amber font-semibold">Code: xxxx10</span>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter coupon code..."
                    value={promoCode}
                    onChange={(e) => { setPromoCode(e.target.value); setPromoError(''); setPromoApplied(false); }}
                    className="input-field text-xs flex-1 py-2 uppercase font-mono"
                    disabled={promoApplied}
                  />
                  <button onClick={applyPromo} disabled={promoApplied} className="btn-primary text-xs px-4 font-bold shrink-0">
                    {promoApplied ? 'Applied ✓' : 'Apply Coupon'}
                  </button>
                </div>
                {promoError && <p className="text-red-500 text-[11px] font-medium">{promoError}</p>}
                {promoApplied && <p className="text-emerald-600 text-[11px] font-bold flex items-center gap-1"><span className="material-symbols-outlined shrink-0" style={{ fontSize: '14px' }}>check_circle</span>$100 promotional discount applied!</p>}
              </div>

              {/* Cost Breakdown */}
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-slate">Equipment Subtotal</span>
                  <span className="font-currency font-semibold text-navy">${subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate">Delivery & Pickup Charges</span>
                  <span className="font-bold text-emerald-600 uppercase text-xs tracking-wide bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">FREE</span>
                </div>
                {promoApplied && (
                  <div className="flex justify-between items-center text-emerald-600 font-bold">
                    <span>Coupon Discount</span>
                    <span>−${discount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-slate">Estimated Taxes (8%)</span>
                  <span className="font-currency text-navy">${fees.toLocaleString()}</span>
                </div>
                <div className="ledger-card flex justify-between items-center py-2.5 px-3 bg-ivory rounded-xl border border-slate/15">
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined shrink-0 text-amber" style={{ fontSize: '18px' }}>security</span>
                    <span className="text-xs font-bold text-navy">Refundable Security Deposit</span>
                  </div>
                  <span className="font-currency font-bold text-navy">${depositTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-end pt-3 border-t-2 border-navy mt-2">
                  <div>
                    <span className="font-bold text-navy block">Total Due at Checkout</span>
                    <span className="text-[10px] text-slate">Includes refundable deposit</span>
                  </div>
                  <span className="text-2xl font-black text-navy font-currency">${total.toLocaleString()}</span>
                </div>
              </div>

              <Link
                href="/checkout"
                className="btn-primary w-full py-3.5 text-sm flex items-center justify-center gap-2 shadow-xl hover:bg-amber hover:text-navy transition-all font-bold"
              >
                <span>Proceed to Address & Payment</span>
                <span className="material-symbols-outlined shrink-0" style={{ fontSize: '18px' }}>arrow_forward</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
