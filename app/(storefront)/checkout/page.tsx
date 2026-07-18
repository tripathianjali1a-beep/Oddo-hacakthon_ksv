'use client';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

type Step = 'contact' | 'delivery' | 'payment' | 'confirm';

export default function CheckoutPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('contact');
  const [loading, setLoading] = useState(false);

  const [contact, setContact] = useState({ name: '', email: '', phone: '' });
  const [delivery, setDelivery] = useState({ method: 'pickup', address: '', city: '', notes: '' });
  const [payment, setPayment] = useState({ cardName: '', cardNumber: '', expiry: '', cvv: '' });

  const steps: Step[] = ['contact', 'delivery', 'payment', 'confirm'];
  const stepLabels: Record<Step, string> = { contact: 'Contact', delivery: 'Delivery', payment: 'Payment', confirm: 'Confirm' };
  const stepIcons: Record<Step, string> = { contact: 'person', delivery: 'local_shipping', payment: 'credit_card', confirm: 'check_circle' };

  const currentIndex = steps.indexOf(step);

  const goNext = () => {
    if (currentIndex < steps.length - 1) setStep(steps[currentIndex + 1]);
  };

  const goPrev = () => {
    if (currentIndex > 0) setStep(steps[currentIndex - 1]);
  };

  const placeOrder = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1500));
    setLoading(false);
    router.push('/home');
  };

  return (
    <div className="max-w-[1440px] mx-auto px-6 py-8">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} className="btn-ghost py-1 px-2 text-xs flex items-center gap-1">
          <span className="material-symbols-outlined shrink-0" style={{fontSize:'18px'}}>arrow_back</span>
          <span>Back</span>
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
                    ? <span className="material-symbols-outlined shrink-0" style={{fontSize:'18px', fontVariationSettings:"'FILL' 1"}}>check</span>
                    : <span className="material-symbols-outlined shrink-0" style={{fontSize:'18px'}}>{stepIcons[s]}</span>
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
                        <span className="material-symbols-outlined shrink-0 text-amber mb-2" style={{fontSize:'24px'}}>{opt.icon}</span>
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
                <h2 className="text-h3 text-navy mb-1">Payment Details</h2>
                <p className="text-slate text-sm mb-5">Your payment info is encrypted and secure.</p>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate uppercase tracking-wide mb-1.5">Cardholder Name *</label>
                    <input type="text" value={payment.cardName} onChange={(e) => setPayment({ ...payment, cardName: e.target.value })} placeholder="John Smith" className="input-field" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate uppercase tracking-wide mb-1.5">Card Number *</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={payment.cardNumber}
                        onChange={(e) => setPayment({ ...payment, cardNumber: e.target.value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim() })}
                        placeholder="1234 5678 9012 3456"
                        maxLength={19}
                        className="input-field pr-12"
                      />
                      <span className="material-symbols-outlined shrink-0 absolute right-3 top-1/2 -translate-y-1/2 text-slate/50" style={{fontSize:'20px'}}>credit_card</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate uppercase tracking-wide mb-1.5">Expiry Date *</label>
                      <input type="text" value={payment.expiry} onChange={(e) => setPayment({ ...payment, expiry: e.target.value })} placeholder="MM / YY" className="input-field" maxLength={7} />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate uppercase tracking-wide mb-1.5">CVV *</label>
                      <input type="text" value={payment.cvv} onChange={(e) => setPayment({ ...payment, cvv: e.target.value })} placeholder="•••" className="input-field" maxLength={4} />
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2 text-xs text-slate">
                  <span className="material-symbols-outlined shrink-0" style={{fontSize:'16px'}}>lock</span>
                  Secured with 256-bit SSL encryption
                </div>
              </div>
            )}

            {/* Step: Confirm */}
            {step === 'confirm' && (
              <div className="animate-fade-in text-center py-8">
                <span className="material-symbols-outlined shrink-0 text-amber text-6xl mb-4" style={{fontVariationSettings:"'FILL' 1"}}>task_alt</span>
                <h2 className="text-h2 text-navy mb-2">Review & Confirm</h2>
                <p className="text-slate text-sm mb-6">Please review your order before placing it.</p>
                <div className="text-left bg-ivory rounded-lg border border-slate/10 p-4 mb-6 space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-slate">Name:</span><span className="text-navy font-medium">{contact.name || '—'}</span></div>
                  <div className="flex justify-between"><span className="text-slate">Email:</span><span className="text-navy font-medium">{contact.email || '—'}</span></div>
                  <div className="flex justify-between"><span className="text-slate">Delivery:</span><span className="text-navy font-medium capitalize">{delivery.method}</span></div>
                  <div className="flex justify-between"><span className="text-slate">Payment:</span><span className="text-navy font-medium">Card ending {payment.cardNumber.slice(-4) || '••••'}</span></div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center mt-6 pt-6 border-t border-slate/10">
              <button onClick={goPrev} disabled={currentIndex === 0} className="btn-secondary py-2.5 px-5 disabled:opacity-30 flex items-center justify-center gap-1.5">
                <span className="material-symbols-outlined shrink-0" style={{fontSize:'18px'}}>arrow_back</span>
                <span>Back</span>
              </button>
              {step === 'confirm' ? (
                <button onClick={placeOrder} disabled={loading} className="btn-primary py-2.5 px-6 flex items-center justify-center gap-1.5">
                  {loading ? (
                    <><span className="material-symbols-outlined shrink-0 animate-spin" style={{fontSize:'18px'}}>refresh</span><span>Placing Order...</span></>
                  ) : (
                    <><span className="material-symbols-outlined shrink-0" style={{fontSize:'18px', fontVariationSettings:"'FILL' 1"}}>check_circle</span><span>Place Order</span></>
                  )}
                </button>
              ) : (
                <button onClick={goNext} className="btn-primary py-2.5 px-5 flex items-center justify-center gap-1.5">
                  <span>Continue</span>
                  <span className="material-symbols-outlined shrink-0" style={{fontSize:'18px'}}>arrow_forward</span>
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
              <div className="flex items-center gap-3 pb-3 border-b border-slate/10">
                <div className="w-14 h-12 bg-surface-high rounded-md overflow-hidden flex-shrink-0">
                  <img src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=200&q=80" alt="" className="w-full h-full object-cover" />
                </div>
                <div>
                  <p className="text-navy font-semibold text-xs">Komat 850x Excavator</p>
                  <p className="text-slate text-xs">5 days — Oct 15–20</p>
                </div>
              </div>
              <div className="flex justify-between"><span className="text-slate">Subtotal</span><span className="font-currency text-navy">$1,750</span></div>
              <div className="flex justify-between"><span className="text-slate">Taxes & Fees</span><span className="font-currency text-navy">$146</span></div>
              <div className="ledger-card flex justify-between items-center">
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined shrink-0 text-navy" style={{fontSize:'16px'}}>security</span>
                  <span className="text-xs font-semibold text-navy">Deposit</span>
                </div>
                <span className="font-currency font-semibold text-navy">$500</span>
              </div>
              <div className="flex justify-between items-center pt-3 border-t-2 border-navy">
                <span className="font-semibold text-navy">Total</span>
                <span className="text-h3 text-navy font-currency">$2,396</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
