'use client';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const initialItems = [
  { id: 1, title: 'Komat 850x Excavator', attachment: 'Standard Bucket', days: 5, rate: 350, deposit: 500, img: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=200&q=80', pickup: 'Oct 15, 2024', returnDate: 'Oct 20, 2024' },
  { id: 2, title: 'Toyota Forklift 8FGU25', attachment: 'Standard', days: 3, rate: 280, deposit: 300, img: 'https://images.unsplash.com/photo-1605731009813-8e0a0b2c2f4b?w=200&q=80', pickup: 'Oct 18, 2024', returnDate: 'Oct 21, 2024' },
];

export default function CartPage() {
  const router = useRouter();
  const [items, setItems] = useState(initialItems);
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoError, setPromoError] = useState('');

  const removeItem = (id: number) => setItems((prev) => prev.filter((i) => i.id !== id));

  const subtotal = items.reduce((sum, item) => sum + item.rate * item.days, 0);
  const depositTotal = items.reduce((sum, item) => sum + item.deposit, 0);
  const fees = Math.round(subtotal * 0.08);
  const discount = promoApplied ? Math.round(subtotal * 0.1) : 0;
  const total = subtotal + fees + depositTotal - discount;

  const applyPromo = () => {
    setPromoError('');
    if (promoCode.toUpperCase() === 'LUXRENT10') {
      setPromoApplied(true);
    } else {
      setPromoError('Invalid promo code. Try LUXRENT10.');
    }
  };

  return (
    <div className="max-w-[1440px] mx-auto px-6 py-8">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} className="btn-ghost py-1 px-2 text-xs flex items-center gap-1">
          <span className="material-symbols-outlined shrink-0" style={{fontSize:'18px'}}>arrow_back</span>
          <span>Back</span>
        </button>
        <h1 className="text-h2 text-navy">Shopping Cart</h1>
        <span className="badge-slate">{items.length} item{items.length !== 1 ? 's' : ''}</span>
      </div>

      {items.length === 0 ? (
        <div className="card p-16 text-center">
          <span className="material-symbols-outlined shrink-0 text-slate/30 text-6xl mb-4">shopping_cart</span>
          <h2 className="text-h3 text-navy mb-2">Your cart is empty</h2>
          <p className="text-slate text-sm mb-6">Add some items to get started.</p>
          <Link href="/browse" className="btn-primary inline-flex">Browse Rentals</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div key={item.id} className="card p-5 flex gap-4">
                <div className="w-24 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-surface-high">
                  <img src={item.img} alt={item.title} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-navy text-sm">{item.title}</h3>
                      <p className="text-slate text-xs mt-0.5">{item.attachment}</p>
                    </div>
                    <button onClick={() => removeItem(item.id)} className="text-slate hover:text-red-500 transition-colors p-1 flex items-center justify-center">
                      <span className="material-symbols-outlined shrink-0" style={{fontSize:'18px'}}>close</span>
                    </button>
                  </div>
                  <div className="flex items-center gap-4 mt-3 flex-wrap">
                    <div className="flex items-center gap-1 text-xs text-slate">
                      <span className="material-symbols-outlined shrink-0" style={{fontSize:'14px'}}>calendar_today</span>
                      {item.pickup} → {item.returnDate}
                    </div>
                    <span className="badge-navy text-[10px]">{item.days} days</span>
                  </div>
                  <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate/10">
                    <span className="text-xs text-slate">${item.rate}/day × {item.days} days</span>
                    <span className="font-bold text-navy font-currency">${(item.rate * item.days).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ))}

            {/* Promo Code */}
            <div className="card p-5">
              <h3 className="font-semibold text-navy text-sm mb-3">Promo Code</h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter code (try LUXRENT10)"
                  value={promoCode}
                  onChange={(e) => { setPromoCode(e.target.value); setPromoError(''); setPromoApplied(false); }}
                  className="input-field text-sm flex-1"
                  disabled={promoApplied}
                />
                <button onClick={applyPromo} disabled={promoApplied} className="btn-secondary text-sm px-4">
                  {promoApplied ? 'Applied ✓' : 'Apply'}
                </button>
              </div>
              {promoError && <p className="text-red-500 text-xs mt-2">{promoError}</p>}
              {promoApplied && <p className="text-emerald-600 text-xs mt-2 flex items-center gap-1"><span className="material-symbols-outlined shrink-0" style={{fontSize:'14px'}}>check_circle</span>10% discount applied!</p>}
            </div>
          </div>

          {/* Order Summary */}
          <div>
            <div className="card p-6 sticky top-24">
              <h3 className="font-semibold text-navy mb-4">Order Summary</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate">Subtotal</span>
                  <span className="font-currency text-navy">${subtotal.toLocaleString()}</span>
                </div>
                {promoApplied && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Promo (LUXRENT10)</span>
                    <span>−${discount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate">Taxes & Fees (8%)</span>
                  <span className="font-currency text-navy">${fees.toLocaleString()}</span>
                </div>
                <div className="ledger-card flex justify-between items-center">
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined shrink-0 text-navy" style={{fontSize:'16px'}}>security</span>
                    <span className="text-xs font-semibold text-navy">Security Deposits</span>
                  </div>
                  <span className="font-currency font-semibold text-navy">${depositTotal.toLocaleString()}</span>
                </div>
                <p className="text-[11px] text-slate">Deposits are fully refundable on safe return.</p>
                <div className="flex justify-between items-end pt-3 border-t-2 border-navy mt-1">
                  <span className="font-semibold text-navy">Total Due</span>
                  <span className="text-h2 text-navy font-currency">${total.toLocaleString()}</span>
                </div>
              </div>

              <Link href="/checkout" className="btn-primary w-full py-3 mt-5 text-sm flex items-center justify-center gap-2">
                <span>Proceed to Checkout</span>
                <span className="material-symbols-outlined shrink-0" style={{fontSize:'18px'}}>arrow_forward</span>
              </Link>
              <Link href="/browse" className="btn-ghost w-full py-2 mt-2 text-xs flex items-center justify-center">
                <span>Continue Browsing</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
