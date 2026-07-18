'use client';
import Link from 'next/link';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getCart, removeFromCart, type CartItem } from '@/lib/cart';
import type { Quote } from '@/lib/types';

const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

export default function CartPage() {
  const router = useRouter();
  const [items, setItems] = useState<CartItem[]>([]);
  const [quote, setQuote] = useState<Quote | null>(null);
  const [quoteError, setQuoteError] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [appliedCode, setAppliedCode] = useState('');
  const [promoError, setPromoError] = useState('');

  useEffect(() => {
    setItems(getCart());
    const saved = localStorage.getItem('luxrent.promo') || '';
    if (saved) { setPromoCode(saved); setAppliedCode(saved); }
    const sync = () => setItems(getCart());
    window.addEventListener('cart:changed', sync);
    return () => window.removeEventListener('cart:changed', sync);
  }, []);

  // All prices come from the server — the cart never computes money locally.
  const fetchQuote = useCallback(async (cartItems: CartItem[], code: string) => {
    if (cartItems.length === 0) { setQuote(null); return; }
    try {
      const res = await fetch('/api/quotes', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          lines: cartItems.map((i) => ({ productId: i.productId, attachmentId: i.attachmentId, startAt: i.startAt, endAt: i.endAt })),
          promoCode: code,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setQuote(null); setQuoteError(data.error || 'Could not price your cart.'); return; }
      setQuoteError('');
      setQuote(data as Quote);
      // Persist a valid promo so checkout re-applies it server-side.
      if ((data as Quote).promoValid) {
        localStorage.setItem('luxrent.promo', (data as Quote).promoCode);
      } else {
        localStorage.removeItem('luxrent.promo');
        if (code) {
          setPromoError('Invalid promo code. Try RENTORA10.');
          setAppliedCode('');
        }
      }
    } catch {
      setQuoteError('Network error while pricing your cart.');
    }
  }, []);

  useEffect(() => { fetchQuote(items, appliedCode); }, [items, appliedCode, fetchQuote]);

  const removeItem = (key: string) => { removeFromCart(key); setItems(getCart()); };

  const applyPromo = () => {
    setPromoError('');
    setAppliedCode(promoCode.trim());
  };

  const promoApplied = !!quote?.promoValid;
  const hasUnavailable = !!quote?.lines.some((l) => !l.available);

  return (
    <div className="max-w-[1440px] mx-auto px-6 py-8">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} className="btn-ghost py-1 px-2 text-xs">
          <span className="material-symbols-outlined" style={{fontSize:'18px'}}>arrow_back</span>
          Back
        </button>
        <h1 className="text-h2 text-navy">Shopping Cart</h1>
        <span className="badge-slate">{items.length} item{items.length !== 1 ? 's' : ''}</span>
      </div>

      {items.length === 0 ? (
        <div className="card p-16 text-center">
          <span className="material-symbols-outlined text-slate/30 text-6xl mb-4">shopping_cart</span>
          <h2 className="text-h3 text-navy mb-2">Your cart is empty</h2>
          <p className="text-slate text-sm mb-6">Add some items to get started.</p>
          <Link href="/browse" className="btn-primary inline-flex">Browse Rentals</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {quoteError && (
              <div className="card p-4 border border-red-200 bg-red-50 text-red-700 text-sm">{quoteError}</div>
            )}
            {items.map((item, idx) => {
              const line = quote?.lines[idx];
              return (
              <div key={item.key} className={`card p-5 flex gap-4 ${line && !line.available ? 'border border-red-300' : ''}`}>
                <div className="w-24 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-surface-high">
                  <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-navy text-sm">{line?.item ?? item.title}</h3>
                      <p className="text-slate text-xs mt-0.5">{line?.attachmentLabel ?? item.attachmentLabel}</p>
                    </div>
                    <button onClick={() => removeItem(item.key)} className="text-slate hover:text-red-500 transition-colors p-1">
                      <span className="material-symbols-outlined" style={{fontSize:'18px'}}>close</span>
                    </button>
                  </div>
                  <div className="flex items-center gap-4 mt-3 flex-wrap">
                    <div className="flex items-center gap-1 text-xs text-slate">
                      <span className="material-symbols-outlined" style={{fontSize:'14px'}}>calendar_today</span>
                      {fmtDate(item.startAt)} → {fmtDate(item.endAt)}
                    </div>
                    {line && <span className="badge-navy text-[10px]">{line.days} days</span>}
                    {line && !line.available && (
                      <span className="badge-red text-[10px]">No longer available for these dates</span>
                    )}
                  </div>
                  <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate/10">
                    <span className="text-xs text-slate">{line ? `₹${line.rate}/day × ${line.days} days` : 'Pricing…'}</span>
                    <span className="font-bold text-navy font-currency">{line ? `₹${line.subtotal.toLocaleString()}` : '—'}</span>
                  </div>
                </div>
              </div>
              );
            })}

            {/* Promo Code */}
            <div className="card p-5">
              <h3 className="font-semibold text-navy text-sm mb-3">Promo Code</h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter code (try RENTORA10)"
                  value={promoCode}
                  onChange={(e) => { setPromoCode(e.target.value); setPromoError(''); }}
                  className="input-field text-sm flex-1"
                  disabled={promoApplied}
                />
                <button onClick={applyPromo} disabled={promoApplied} className="btn-secondary text-sm px-4">
                  {promoApplied ? 'Applied ✓' : 'Apply'}
                </button>
              </div>
              {promoError && <p className="text-red-500 text-xs mt-2">{promoError}</p>}
              {promoApplied && <p className="text-emerald-600 text-xs mt-2 flex items-center gap-1"><span className="material-symbols-outlined" style={{fontSize:'14px'}}>check_circle</span>Discount applied!</p>}
            </div>
          </div>

          {/* Order Summary */}
          <div>
            <div className="card p-6 sticky top-24">
              <h3 className="font-semibold text-navy mb-4">Order Summary</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate">Subtotal</span>
                  <span className="font-currency text-navy">{quote ? `₹${quote.subtotal.toLocaleString()}` : '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate">Damage Waiver</span>
                  <span className="font-currency text-navy">{quote ? `₹${quote.waiver.toLocaleString()}` : '—'}</span>
                </div>
                {quote && quote.discount > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Promo ({quote.promoCode})</span>
                    <span>−₹{quote.discount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate">Taxes & Fees (8%)</span>
                  <span className="font-currency text-navy">{quote ? `₹${quote.tax.toLocaleString()}` : '—'}</span>
                </div>
                <div className="ledger-card flex justify-between items-center">
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-navy" style={{fontSize:'16px'}}>security</span>
                    <span className="text-xs font-semibold text-navy">Security Deposits</span>
                  </div>
                  <span className="font-currency font-semibold text-navy">{quote ? `₹${quote.depositTotal.toLocaleString()}` : '—'}</span>
                </div>
                <p className="text-[11px] text-slate">Deposits are fully refundable on safe return.</p>
                <div className="flex justify-between items-end pt-3 border-t-2 border-navy mt-1">
                  <span className="font-semibold text-navy">Total Due</span>
                  <span className="text-h2 text-navy font-currency">{quote ? `₹${quote.total.toLocaleString()}` : '—'}</span>
                </div>
              </div>

              {hasUnavailable && (
                <p className="text-red-600 text-xs mt-4">
                  Some items are no longer available for the selected dates. Remove them or pick different dates to continue.
                </p>
              )}
              <Link
                href="/checkout"
                aria-disabled={!quote || hasUnavailable}
                className={`btn-primary w-full py-3 mt-5 text-sm ${!quote || hasUnavailable ? 'opacity-40 pointer-events-none' : ''}`}
              >
                Proceed to Checkout
                <span className="material-symbols-outlined" style={{fontSize:'18px'}}>arrow_forward</span>
              </Link>
              <Link href="/browse" className="btn-ghost w-full py-2 mt-2 text-xs">
                Continue Browsing
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
