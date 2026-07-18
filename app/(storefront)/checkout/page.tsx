'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCart, clearCart, type CartItem } from '@/lib/cart';
import type { Quote } from '@/lib/types';

type Step = 'contact' | 'delivery' | 'payment' | 'confirm';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

interface PaymentDone {
  demo: boolean;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
}

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Razorpay?: any;
  }
}

// Load Razorpay checkout.js once.
function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function CheckoutPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('contact');
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<CartItem[]>([]);
  const [quote, setQuote] = useState<Quote | null>(null);
  const [error, setError] = useState('');

  const [contact, setContact] = useState({ name: '', email: '', phone: '' });
  const [delivery, setDelivery] = useState({ method: 'pickup', address: '', city: '', notes: '' });
  const [paid, setPaid] = useState<PaymentDone | null>(null);
  const [payLoading, setPayLoading] = useState(false);

  useEffect(() => { setItems(getCart()); }, []);

  // Authoritative pricing comes from the server; the promo applied in the cart
  // carries over via localStorage.
  useEffect(() => {
    if (items.length === 0) { setQuote(null); return; }
    const promoCode = localStorage.getItem('luxrent.promo') || '';
    fetch('/api/quotes', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        lines: items.map((i) => ({ productId: i.productId, attachmentId: i.attachmentId, startAt: i.startAt, endAt: i.endAt })),
        promoCode,
      }),
    })
      .then(async (r) => { const d = await r.json(); if (!r.ok) throw new Error(d.error); return d as Quote; })
      .then(setQuote)
      .catch((e: Error) => setError(e.message || 'Could not price your order.'));
  }, [items]);

  const steps: Step[] = ['contact', 'delivery', 'payment', 'confirm'];
  const stepLabels: Record<Step, string> = { contact: 'Contact', delivery: 'Delivery', payment: 'Payment', confirm: 'Confirm' };
  const stepIcons: Record<Step, string> = { contact: 'person', delivery: 'local_shipping', payment: 'credit_card', confirm: 'check_circle' };

  const currentIndex = steps.indexOf(step);

  // Each step must be complete before the wizard advances.
  const validateStep = (): string => {
    if (step === 'contact') {
      if (!contact.name.trim()) return 'Please enter your full name.';
      if (!EMAIL_RE.test(contact.email.trim())) return 'Please enter a valid email address.';
      if (!contact.phone.trim()) return 'Please enter your phone number.';
    }
    if (step === 'delivery' && delivery.method === 'delivery') {
      if (!delivery.address.trim()) return 'Please enter a delivery address.';
      if (!delivery.city.trim()) return 'Please enter the city.';
    }
    if (step === 'payment') {
      if (!paid) return 'Please complete the payment first.';
    }
    return '';
  };

  // Create a server-priced Razorpay order and open the checkout modal.
  // Falls back to demo mode when Razorpay keys are not configured.
  const payNow = async () => {
    setPayLoading(true);
    setError('');
    try {
      const res = await fetch('/api/payments/razorpay-order', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          lines: items.map((i) => ({ productId: i.productId, attachmentId: i.attachmentId, startAt: i.startAt, endAt: i.endAt })),
          promoCode: localStorage.getItem('luxrent.promo') || '',
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Could not start payment.'); setPayLoading(false); return; }

      if (data.demo) {
        setPaid({ demo: true });
        setPayLoading(false);
        setStep('confirm');
        return;
      }

      const ok = await loadRazorpayScript();
      if (!ok || !window.Razorpay) { setError('Could not load Razorpay. Check your connection.'); setPayLoading(false); return; }

      const rzp = new window.Razorpay({
        key: data.keyId,
        order_id: data.razorpayOrderId,
        amount: data.amount,
        currency: data.currency,
        name: 'Rentora',
        description: 'Rental booking',
        prefill: { name: contact.name, email: contact.email, contact: contact.phone },
        theme: { color: '#D97706' },
        handler: (resp: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
          setPaid({
            demo: false,
            razorpayOrderId: resp.razorpay_order_id,
            razorpayPaymentId: resp.razorpay_payment_id,
            razorpaySignature: resp.razorpay_signature,
          });
          setPayLoading(false);
          setStep('confirm');
        },
        modal: { ondismiss: () => setPayLoading(false) },
      });
      rzp.on('payment.failed', (resp: { error?: { description?: string } }) => {
        setError(resp.error?.description || 'Payment failed. Please try again.');
        setPayLoading(false);
      });
      rzp.open();
    } catch {
      setError('Network error while starting payment.');
      setPayLoading(false);
    }
  };

  const goNext = () => {
    const problem = validateStep();
    if (problem) { setError(problem); return; }
    setError('');
    if (currentIndex < steps.length - 1) setStep(steps[currentIndex + 1]);
  };

  const goPrev = () => {
    setError('');
    if (currentIndex > 0) setStep(steps[currentIndex - 1]);
  };

  const placeOrder = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          customerName: contact.name.trim(),
          email: contact.email.trim(),
          phone: contact.phone.trim(),
          deliveryMethod: delivery.method,
          address: [delivery.address, delivery.city].filter(Boolean).join(', '),
          notes: delivery.notes,
          promoCode: localStorage.getItem('luxrent.promo') || '',
          payment: paid && !paid.demo ? {
            razorpayOrderId: paid.razorpayOrderId,
            razorpayPaymentId: paid.razorpayPaymentId,
            razorpaySignature: paid.razorpaySignature,
          } : undefined,
          lines: items.map((i) => ({ productId: i.productId, attachmentId: i.attachmentId, startAt: i.startAt, endAt: i.endAt })),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Could not place your order. Please try again.');
        setLoading(false);
        return;
      }
      clearCart();
      localStorage.removeItem('luxrent.promo');
      router.push('/home?ordered=1');
    } catch {
      setError('Network error. Your order was NOT placed — please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-[1440px] mx-auto px-6 py-8">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} className="btn-ghost py-1 px-2 text-xs">
          <span className="material-symbols-outlined" style={{fontSize:'18px'}}>arrow_back</span>
        </button>
        <h1 className="text-h2 text-navy">Checkout</h1>
      </div>

      {/* Step Indicator */}
      <div className="card p-4 mb-6">
        <div className="flex items-center justify-between relative">
          {steps.map((s, i) => (
            <div key={s} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${i < currentIndex ? 'bg-emerald-500 text-white' : i === currentIndex ? 'bg-amber text-white' : 'bg-surface-high text-slate'}`}>
                  {i < currentIndex
                    ? <span className="material-symbols-outlined" style={{fontSize:'18px', fontVariationSettings:"'FILL' 1"}}>check</span>
                    : <span className="material-symbols-outlined" style={{fontSize:'18px'}}>{stepIcons[s]}</span>
                  }
                </div>
                <p className={`text-[11px] font-semibold mt-1 hidden sm:block ${i === currentIndex ? 'text-navy' : 'text-slate'}`}>{stepLabels[s]}</p>
              </div>
              {i < steps.length - 1 && (
                <div className={`flex-1 h-0.5 mx-2 transition-all ${i < currentIndex ? 'bg-emerald-400' : 'bg-slate/20'}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Panel */}
        <div className="lg:col-span-2">
          <div className="card p-6 rounded-xl">
            {error && (
              <div className="mb-5 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg flex items-center gap-2">
                <span className="material-symbols-outlined" style={{fontSize:'18px'}}>error</span>
                {error}
              </div>
            )}

            {/* Step: Contact */}
            {step === 'contact' && (
              <div className="animate-fade-in">
                <h2 className="text-h3 text-navy mb-1">Contact Information</h2>
                <p className="text-slate text-sm mb-5">We'll use this to confirm your booking.</p>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate uppercase tracking-wide mb-1.5">Full Name *</label>
                    <input type="text" value={contact.name} onChange={(e) => setContact({ ...contact, name: e.target.value })} placeholder="John Smith" className="input-field" required />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate uppercase tracking-wide mb-1.5">Email Address *</label>
                    <input type="email" value={contact.email} onChange={(e) => setContact({ ...contact, email: e.target.value })} placeholder="john@example.com" className="input-field" required />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate uppercase tracking-wide mb-1.5">Phone Number *</label>
                    <input type="tel" value={contact.phone} onChange={(e) => setContact({ ...contact, phone: e.target.value })} placeholder="+1 (555) 000-0000" className="input-field" required />
                  </div>
                </div>
              </div>
            )}

            {/* Step: Delivery */}
            {step === 'delivery' && (
              <div className="animate-fade-in">
                <h2 className="text-h3 text-navy mb-1">Delivery / Pickup</h2>
                <p className="text-slate text-sm mb-5">Choose how you'd like to receive your items.</p>
                <div className="grid grid-cols-2 gap-3 mb-5">
                  {[{ id: 'pickup', label: 'Self Pickup', icon: 'store', desc: 'Collect from our depot' }, { id: 'delivery', label: 'Delivery', icon: 'local_shipping', desc: 'Delivered to your site' }].map((opt) => (
                    <label key={opt.id} className="cursor-pointer">
                      <input type="radio" name="delivery" value={opt.id} checked={delivery.method === opt.id} onChange={() => setDelivery({ ...delivery, method: opt.id })} className="sr-only peer" />
                      <div className="p-4 rounded-lg border-2 border-slate/15 peer-checked:border-amber peer-checked:bg-amber/5 transition-all">
                        <span className="material-symbols-outlined text-amber mb-2" style={{fontSize:'24px'}}>{opt.icon}</span>
                        <p className="text-sm font-semibold text-navy">{opt.label}</p>
                        <p className="text-xs text-slate mt-0.5">{opt.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
                {delivery.method === 'delivery' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate uppercase tracking-wide mb-1.5">Delivery Address *</label>
                      <input type="text" value={delivery.address} onChange={(e) => setDelivery({ ...delivery, address: e.target.value })} placeholder="123 Main Street" className="input-field" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate uppercase tracking-wide mb-1.5">City *</label>
                      <input type="text" value={delivery.city} onChange={(e) => setDelivery({ ...delivery, city: e.target.value })} placeholder="New York" className="input-field" />
                    </div>
                  </div>
                )}
                <div className="mt-4">
                  <label className="block text-xs font-semibold text-slate uppercase tracking-wide mb-1.5">Special Instructions</label>
                  <textarea value={delivery.notes} onChange={(e) => setDelivery({ ...delivery, notes: e.target.value })} rows={3} placeholder="Any special notes for pickup/delivery..." className="input-field resize-none" />
                </div>
              </div>
            )}

            {/* Step: Payment */}
            {step === 'payment' && (
              <div className="animate-fade-in">
                <h2 className="text-h3 text-navy mb-1">Payment</h2>
                <p className="text-slate text-sm mb-5">Pay securely via Razorpay — UPI, cards, netbanking and wallets.</p>

                {paid ? (
                  <div className="rounded-xl border border-emerald-300 bg-emerald-50 p-5 flex items-center gap-3">
                    <span className="material-symbols-outlined text-emerald-600" style={{fontSize:'28px', fontVariationSettings:"'FILL' 1"}}>check_circle</span>
                    <div>
                      <p className="text-navy font-semibold text-sm">Payment {paid.demo ? 'recorded (demo mode)' : 'successful'}</p>
                      {paid.razorpayPaymentId && <p className="text-slate text-xs font-mono">{paid.razorpayPaymentId}</p>}
                    </div>
                  </div>
                ) : (
                  <div className="rounded-xl border border-slate/15 p-6 text-center">
                    <div className="flex justify-center mb-4">
                      <span className="material-symbols-outlined text-amber" style={{fontSize:'44px'}}>account_balance_wallet</span>
                    </div>
                    <p className="text-navy font-semibold mb-1">Total payable: <span className="font-currency">{quote ? `₹${quote.total.toLocaleString()}` : '—'}</span></p>
                    <p className="text-slate text-xs mb-5">Includes refundable deposit of {quote ? `₹${quote.depositTotal.toLocaleString()}` : '—'}</p>
                    <button onClick={payNow} disabled={payLoading || !quote} className="btn-primary py-3 px-8 mx-auto">
                      {payLoading ? (
                        <><span className="material-symbols-outlined animate-spin" style={{fontSize:'18px'}}>refresh</span>Opening Razorpay…</>
                      ) : (
                        <><span className="material-symbols-outlined" style={{fontSize:'18px'}}>bolt</span>Pay with Razorpay</>
                      )}
                    </button>
                  </div>
                )}

                <div className="mt-4 flex items-center gap-2 text-xs text-slate">
                  <span className="material-symbols-outlined" style={{fontSize:'16px'}}>lock</span>
                  Payments are processed by Razorpay — card details never touch our servers.
                </div>
              </div>
            )}

            {/* Step: Confirm */}
            {step === 'confirm' && (
              <div className="animate-fade-in text-center py-8">
                <span className="material-symbols-outlined text-amber text-6xl mb-4" style={{fontVariationSettings:"'FILL' 1"}}>task_alt</span>
                <h2 className="text-h2 text-navy mb-2">Review & Confirm</h2>
                <p className="text-slate text-sm mb-6">Please review your order before placing it.</p>
                <div className="text-left bg-ivory rounded-lg border border-slate/10 p-4 mb-6 space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-slate">Name:</span><span className="text-navy font-medium">{contact.name || '—'}</span></div>
                  <div className="flex justify-between"><span className="text-slate">Email:</span><span className="text-navy font-medium">{contact.email || '—'}</span></div>
                  <div className="flex justify-between"><span className="text-slate">Delivery:</span><span className="text-navy font-medium capitalize">{delivery.method}</span></div>
                  <div className="flex justify-between"><span className="text-slate">Payment:</span><span className="text-navy font-medium">{paid?.demo ? 'Demo payment' : paid?.razorpayPaymentId ? `Razorpay · ${paid.razorpayPaymentId}` : '—'}</span></div>
                  <div className="flex justify-between pt-2 border-t border-slate/10"><span className="text-slate">Total due:</span><span className="text-navy font-bold font-currency">{quote ? `₹${quote.total.toLocaleString()}` : '—'}</span></div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center mt-6 pt-6 border-t border-slate/10">
              <button onClick={goPrev} disabled={currentIndex === 0} className="btn-secondary py-2.5 px-5 disabled:opacity-30">
                <span className="material-symbols-outlined" style={{fontSize:'18px'}}>arrow_back</span>
                Back
              </button>
              {step === 'confirm' ? (
                <button onClick={placeOrder} disabled={loading || !quote || items.length === 0} className="btn-primary py-2.5 px-6">
                  {loading ? (
                    <><span className="material-symbols-outlined animate-spin" style={{fontSize:'18px'}}>refresh</span>Placing Order...</>
                  ) : (
                    <><span className="material-symbols-outlined" style={{fontSize:'18px', fontVariationSettings:"'FILL' 1"}}>check_circle</span>Place Order</>
                  )}
                </button>
              ) : (
                <button onClick={goNext} className="btn-primary py-2.5 px-5">
                  Continue
                  <span className="material-symbols-outlined" style={{fontSize:'18px'}}>arrow_forward</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div>
          <div className="card p-6 sticky top-24">
            <h3 className="font-semibold text-navy mb-4 pb-3 border-b border-slate/10">Order Summary</h3>
            <div className="space-y-3 text-sm">
              {items.length === 0 ? (
                <p className="text-slate text-xs py-2">Your cart is empty.</p>
              ) : items.map((it, idx) => {
                const line = quote?.lines[idx];
                return (
                <div key={it.key} className="flex items-center gap-3 pb-3 border-b border-slate/10">
                  <div className="w-14 h-12 bg-surface-high rounded-md overflow-hidden flex-shrink-0">
                    <img src={it.image} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-navy font-semibold text-xs truncate">{line?.item ?? it.title}</p>
                    <p className="text-slate text-xs">{line ? `${line.days} days` : ''} — {fmtDate(it.startAt)}</p>
                  </div>
                </div>
                );
              })}
              <div className="flex justify-between"><span className="text-slate">Subtotal</span><span className="font-currency text-navy">{quote ? `₹${quote.subtotal.toLocaleString()}` : '—'}</span></div>
              <div className="flex justify-between"><span className="text-slate">Damage Waiver</span><span className="font-currency text-navy">{quote ? `₹${quote.waiver.toLocaleString()}` : '—'}</span></div>
              {quote && quote.discount > 0 && (
                <div className="flex justify-between text-emerald-600"><span>Promo ({quote.promoCode})</span><span>−₹{quote.discount.toLocaleString()}</span></div>
              )}
              <div className="flex justify-between"><span className="text-slate">Taxes & Fees</span><span className="font-currency text-navy">{quote ? `₹${quote.tax.toLocaleString()}` : '—'}</span></div>
              <div className="ledger-card flex justify-between items-center">
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-navy" style={{fontSize:'16px'}}>security</span>
                  <span className="text-xs font-semibold text-navy">Deposit</span>
                </div>
                <span className="font-currency font-semibold text-navy">{quote ? `₹${quote.depositTotal.toLocaleString()}` : '—'}</span>
              </div>
              <div className="flex justify-between items-center pt-3 border-t-2 border-navy">
                <span className="font-semibold text-navy">Total</span>
                <span className="text-h3 text-navy font-currency">{quote ? `₹${quote.total.toLocaleString()}` : '—'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
