'use client';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

type Step = 'contact' | 'delivery' | 'payment' | 'confirm';

export default function CheckoutPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('contact');
  const [loading, setLoading] = useState(false);
  const [sameAsDelivery, setSameAsDelivery] = useState(true);
  const [saveCard, setSaveCard] = useState(true);
  const [toast, setToast] = useState<string | null>(null);

  const [contact, setContact] = useState({ name: 'Alexander Wright', email: 'alexander@luxrent.com', phone: '+1 (555) 382-9102' });
  const [delivery, setDelivery] = useState({ method: 'standard', address: '742 Evergreen Terrace', city: 'Springfield', zip: '97477', notes: 'Gate code #4092. Please drop off near main equipment loading dock.' });
  const [payment, setPayment] = useState({ cardName: 'Alexander Wright', cardNumber: '4532 •••• •••• 8821', expiry: '08 / 28', cvv: '912' });

  const steps: Step[] = ['contact', 'delivery', 'payment', 'confirm'];
  const stepLabels: Record<Step, string> = { contact: '1. Contact & Address', delivery: '2. Delivery Method', payment: '3. Payment Details', confirm: '4. Order Confirmation' };
  const stepIcons: Record<Step, string> = { contact: 'person', delivery: 'local_shipping', payment: 'credit_card', confirm: 'check_circle' };

  const currentIndex = steps.indexOf(step);

  const triggerToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const goNext = () => {
    if (currentIndex < steps.length - 1) {
      const nextStep = steps[currentIndex + 1];
      setStep(nextStep);
      triggerToast(`Proceeding to ${stepLabels[nextStep]}`);
    }
  };

  const goPrev = () => {
    if (currentIndex > 0) setStep(steps[currentIndex - 1]);
  };

  const placeOrder = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1500));
    setLoading(false);
    triggerToast('Order placed successfully! Redirecting to confirmation...');
    setTimeout(() => router.push('/home'), 1500);
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

      {/* Mockup Breadcrumb Indicator */}
      <div className="mb-8 bg-white border border-slate/15 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/cart" className="btn-ghost py-1 px-2.5 text-xs flex items-center gap-1">
            <span className="material-symbols-outlined shrink-0" style={{ fontSize: '18px' }}>arrow_back</span>
            <span>Back to Cart</span>
          </Link>
          <h1 className="text-xl font-bold text-navy">Express Checkout & Lease Verification</h1>
        </div>
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
          <Link href="/cart" className="text-slate hover:text-navy px-3 py-1 rounded-full border border-slate/20">
            1. Add to Cart
          </Link>
          <span className="material-symbols-outlined text-slate/40 shrink-0" style={{ fontSize: '18px' }}>chevron_right</span>
          <span className={`px-3 py-1 rounded-full shadow-sm flex items-center gap-1 ${step !== 'payment' && step !== 'confirm' ? 'bg-amber text-navy font-black' : 'text-slate border border-slate/20'}`}>
            <span className="material-symbols-outlined shrink-0" style={{ fontSize: '16px' }}>local_shipping</span>
            <span>2. Address & Delivery</span>
          </span>
          <span className="material-symbols-outlined text-slate/40 shrink-0" style={{ fontSize: '18px' }}>chevron_right</span>
          <span className={`px-3 py-1 rounded-full ${step === 'payment' || step === 'confirm' ? 'bg-amber text-navy font-black shadow-sm' : 'text-slate/60'}`}>
            3. Payment
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Checkout Panel */}
        <div className="lg:col-span-8">
          <div className="card p-6 md:p-8 rounded-2xl border-slate/15 shadow-md">
            {/* Step 1: Contact & Delivery Address from Mockup */}
            {step === 'contact' && (
              <div className="animate-fade-in space-y-5">
                <div className="pb-3 border-b border-slate/15 flex justify-between items-center">
                  <div>
                    <h2 className="text-lg font-bold text-navy">Delivery Address & Contact Details</h2>
                    <p className="text-slate text-xs mt-0.5">Please provide exact site coordinates or corporate address</p>
                  </div>
                  <span className="badge-amber text-xs">Step 1 of 3</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate uppercase tracking-wide mb-1.5">Customer / Company Name *</label>
                    <input
                      type="text"
                      value={contact.name}
                      onChange={(e) => setContact({ ...contact, name: e.target.value })}
                      placeholder="Enter full name or corporate entity"
                      required
                      className="input-field text-sm py-2.5 font-medium text-navy"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate uppercase tracking-wide mb-1.5">Corporate Email Address *</label>
                    <input
                      type="email"
                      value={contact.email}
                      onChange={(e) => setContact({ ...contact, email: e.target.value })}
                      placeholder="corporate@domain.com"
                      required
                      className="input-field text-sm py-2.5 font-medium text-navy"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate uppercase tracking-wide mb-1.5">Site Phone / Dispatch Contact *</label>
                    <input
                      type="tel"
                      value={contact.phone}
                      onChange={(e) => setContact({ ...contact, phone: e.target.value })}
                      placeholder="+1 (555) 000-0000"
                      required
                      className="input-field text-sm py-2.5 font-medium text-navy"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate uppercase tracking-wide mb-1.5">Postal Code / ZIP *</label>
                    <input
                      type="text"
                      value={delivery.zip}
                      onChange={(e) => setDelivery({ ...delivery, zip: e.target.value })}
                      placeholder="97477"
                      className="input-field text-sm py-2.5 font-medium text-navy"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate uppercase tracking-wide mb-1.5">Street / Delivery Address *</label>
                  <input
                    type="text"
                    value={delivery.address}
                    onChange={(e) => setDelivery({ ...delivery, address: e.target.value })}
                    placeholder="742 Evergreen Terrace, Industrial Sector B"
                    className="input-field text-sm py-2.5 font-medium text-navy"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate uppercase tracking-wide mb-1.5">City & State / Region *</label>
                  <input
                    type="text"
                    value={delivery.city}
                    onChange={(e) => setDelivery({ ...delivery, city: e.target.value })}
                    placeholder="Springfield, IL"
                    className="input-field text-sm py-2.5 font-medium text-navy"
                  />
                </div>

                {/* Billing Address Toggle from Mockup */}
                <div className="bg-ivory border border-slate/20 rounded-xl p-4 flex items-center justify-between cursor-pointer" onClick={() => setSameAsDelivery(!sameAsDelivery)}>
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={sameAsDelivery}
                      onChange={(e) => setSameAsDelivery(e.target.checked)}
                      className="w-4 h-4 rounded border-slate/30 text-amber focus:ring-amber shrink-0"
                    />
                    <div>
                      <span className="text-xs font-bold text-navy block">If enabled it will make Billing and Delivery address the same</span>
                      <span className="text-[11px] text-slate">Disable to provide a separate corporate accounting address for invoice billing</span>
                    </div>
                  </div>
                </div>

                {!sameAsDelivery && (
                  <div className="bg-slate/5 border border-slate/15 rounded-xl p-4 space-y-3 animate-fade-in">
                    <span className="text-xs font-bold text-amber uppercase tracking-wider block">Separate Billing / Invoice Address</span>
                    <input type="text" placeholder="Billing Street Address" className="input-field text-xs py-2 bg-white" />
                    <div className="grid grid-cols-2 gap-3">
                      <input type="text" placeholder="City" className="input-field text-xs py-2 bg-white" />
                      <input type="text" placeholder="Postal Code" className="input-field text-xs py-2 bg-white" />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 2: Delivery Method from Mockup */}
            {step === 'delivery' && (
              <div className="animate-fade-in space-y-5">
                <div className="pb-3 border-b border-slate/15 flex justify-between items-center">
                  <div>
                    <h2 className="text-lg font-bold text-navy">Select Delivery Method</h2>
                    <p className="text-slate text-xs mt-0.5">Heavy machinery transport or depot self-pickup options</p>
                  </div>
                  <span className="badge-amber text-xs">Step 2 of 3</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { id: 'standard', label: 'Standard Delivery - Free', icon: 'local_shipping', desc: 'Flatbed delivery directly to your job site within 24 hours. Includes unloading & setup inspection.', badge: 'MOST POPULAR' },
                    { id: 'pickup', label: 'Pickup - Free', icon: 'store', desc: 'Self-pickup from our regional distribution hub using your certified transport carrier.', badge: 'INSTANT' },
                  ].map((opt) => (
                    <label key={opt.id} className="cursor-pointer">
                      <input
                        type="radio"
                        name="deliveryMethod"
                        value={opt.id}
                        checked={delivery.method === opt.id}
                        onChange={() => setDelivery({ ...delivery, method: opt.id })}
                        className="sr-only peer"
                      />
                      <div className="p-5 rounded-xl border-2 border-slate/15 peer-checked:border-amber peer-checked:bg-amber/5 transition-all h-full flex flex-col justify-between relative">
                        <div>
                          <div className="flex justify-between items-start mb-3">
                            <div className="w-10 h-10 rounded-lg bg-navy text-amber flex items-center justify-center shadow-md">
                              <span className="material-symbols-outlined shrink-0" style={{ fontSize: '22px' }}>{opt.icon}</span>
                            </div>
                            <span className="text-[10px] font-bold bg-amber text-navy px-2 py-0.5 rounded uppercase">{opt.badge}</span>
                          </div>
                          <p className="text-base font-bold text-navy mb-1">{opt.label}</p>
                          <p className="text-xs text-slate leading-relaxed">{opt.desc}</p>
                        </div>
                        <div className="mt-4 pt-3 border-t border-slate/10 flex justify-between items-center text-xs font-semibold">
                          <span className="text-slate">Estimated Window:</span>
                          <span className="text-emerald-600 font-bold">Oct 15, 08:00 AM</span>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate uppercase tracking-wide mb-1.5">Site Access Instructions / Dispatch Notes</label>
                  <textarea
                    value={delivery.notes}
                    onChange={(e) => setDelivery({ ...delivery, notes: e.target.value })}
                    rows={3}
                    placeholder="Gate codes, forklift requirements, site foreman phone number..."
                    className="input-field text-sm resize-none"
                  />
                </div>
              </div>
            )}

            {/* Step 3: Payment Method from Mockup */}
            {step === 'payment' && (
              <div className="animate-fade-in space-y-5">
                <div className="pb-3 border-b border-slate/15 flex justify-between items-center">
                  <div>
                    <h2 className="text-lg font-bold text-navy">Payment Method & Lease Execution</h2>
                    <p className="text-slate text-xs mt-0.5">Encrypted transaction verified via corporate escrow account</p>
                  </div>
                  <span className="badge-amber text-xs">Step 3 of 3</span>
                </div>

                {/* Card selection tabs */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'card', label: 'Credit / Corporate Card', icon: 'credit_card' },
                    { id: 'ach', label: 'ACH / Wire Transfer', icon: 'account_balance' },
                    { id: 'invoice', label: 'Net 30 Invoice Term', icon: 'receipt_long' },
                  ].map((m, idx) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => triggerToast(`Selected payment method: ${m.label}`)}
                      className={`p-3.5 rounded-xl border flex flex-col items-center gap-2 text-center transition-all ${
                        idx === 0 ? 'border-amber bg-amber/10 text-navy font-bold' : 'border-slate/15 bg-white text-slate hover:border-slate/30'
                      }`}
                    >
                      <span className="material-symbols-outlined shrink-0 text-amber" style={{ fontSize: '24px' }}>{m.icon}</span>
                      <span className="text-xs">{m.label}</span>
                    </button>
                  ))}
                </div>

                <div className="bg-ivory/50 border border-slate/15 rounded-xl p-5 space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate uppercase tracking-wide mb-1.5">Cardholder / Corporate Account Name *</label>
                    <input
                      type="text"
                      value={payment.cardName}
                      onChange={(e) => setPayment({ ...payment, cardName: e.target.value })}
                      placeholder="Alexander Wright - Enterprise Group"
                      className="input-field text-sm py-2.5 font-medium text-navy bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate uppercase tracking-wide mb-1.5">Card Number *</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={payment.cardNumber}
                        onChange={(e) => setPayment({ ...payment, cardNumber: e.target.value })}
                        placeholder="•••• •••• •••• 8821"
                        className="input-field text-sm py-2.5 font-mono font-medium text-navy pr-12 bg-white"
                      />
                      <span className="material-symbols-outlined shrink-0 absolute right-3.5 top-1/2 -translate-y-1/2 text-slate/50" style={{ fontSize: '22px' }}>credit_card</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate uppercase tracking-wide mb-1.5">Expiry Date *</label>
                      <input
                        type="text"
                        value={payment.expiry}
                        onChange={(e) => setPayment({ ...payment, expiry: e.target.value })}
                        placeholder="MM / YY"
                        className="input-field text-sm py-2.5 font-mono font-medium text-navy bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate uppercase tracking-wide mb-1.5">CVV Security Code *</label>
                      <input
                        type="password"
                        value={payment.cvv}
                        onChange={(e) => setPayment({ ...payment, cvv: e.target.value })}
                        placeholder="•••"
                        maxLength={4}
                        className="input-field text-sm py-2.5 font-mono font-medium text-navy bg-white"
                      />
                    </div>
                  </div>

                  {/* Save Card Checkbox from Mockup */}
                  <label className="flex items-center gap-2.5 cursor-pointer pt-2">
                    <input
                      type="checkbox"
                      checked={saveCard}
                      onChange={(e) => setSaveCard(e.target.checked)}
                      className="w-4 h-4 rounded border-slate/30 text-amber focus:ring-amber"
                    />
                    <span className="text-xs font-bold text-navy">Save corporate card profile for future instant equipment rentals</span>
                  </label>
                </div>
              </div>
            )}

            {/* Step 4: Confirm Order */}
            {step === 'confirm' && (
              <div className="animate-fade-in text-center py-8 space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
                  <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>task_alt</span>
                </div>
                <h2 className="text-2xl font-bold text-navy">Ready to Finalize Rental Order</h2>
                <p className="text-slate text-sm max-w-md mx-auto">By clicking Pay Now below, you authorize the commercial equipment lease agreement and deposit verification.</p>

                <div className="text-left bg-ivory rounded-xl border border-slate/15 p-5 space-y-2.5 text-xs font-medium text-navy max-w-lg mx-auto">
                  <div className="flex justify-between"><span className="text-slate">Contract Entity:</span><span>{contact.name}</span></div>
                  <div className="flex justify-between"><span className="text-slate">Delivery Site:</span><span>{delivery.address}, {delivery.city}</span></div>
                  <div className="flex justify-between"><span className="text-slate">Delivery Method:</span><span className="capitalize">{delivery.method === 'standard' ? 'Standard Delivery (Free)' : 'Self Pickup (Free)'}</span></div>
                  <div className="flex justify-between"><span className="text-slate">Payment Authorization:</span><span>Card ending in 8821</span></div>
                </div>
              </div>
            )}

            {/* Navigation Controls */}
            <div className="flex justify-between items-center mt-8 pt-6 border-t border-slate/15">
              <button
                type="button"
                onClick={goPrev}
                disabled={currentIndex === 0}
                className="btn-secondary py-3 px-6 text-xs disabled:opacity-30 flex items-center gap-1.5 font-bold"
              >
                <span className="material-symbols-outlined shrink-0" style={{ fontSize: '18px' }}>arrow_back</span>
                <span>Back</span>
              </button>

              {step === 'payment' || step === 'confirm' ? (
                <button
                  type="button"
                  onClick={placeOrder}
                  disabled={loading}
                  className="btn-primary py-3.5 px-8 text-sm flex items-center justify-center gap-2 shadow-xl hover:bg-amber transition-all font-bold"
                >
                  {loading ? (
                    <><span className="material-symbols-outlined shrink-0 animate-spin" style={{ fontSize: '20px' }}>refresh</span><span>Verifying Lease & Payment...</span></>
                  ) : (
                    <><span className="material-symbols-outlined shrink-0" style={{ fontSize: '20px', fontVariationSettings: "'FILL' 1" }}>verified_user</span><span>Authorize & Pay Now ($2,396)</span></>
                  )}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={goNext}
                  className="btn-primary py-3 px-8 text-xs flex items-center gap-1.5 shadow-md font-bold"
                >
                  <span>Continue to {step === 'contact' ? 'Delivery Method' : 'Payment Details'}</span>
                  <span className="material-symbols-outlined shrink-0" style={{ fontSize: '18px' }}>arrow_forward</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right Sidebar Summary */}
        <div className="lg:col-span-4 space-y-6">
          <div className="card p-6 sticky top-24 space-y-5 border-amber/20 shadow-md">
            <h3 className="font-bold text-navy text-sm pb-3 border-b border-slate/15 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-amber shrink-0" style={{ fontSize: '18px' }}>receipt_long</span>
              <span>Order Summary</span>
            </h3>

            <div className="space-y-4 text-xs">
              <div className="flex items-center gap-3 pb-3 border-b border-slate/10">
                <div className="w-14 h-12 bg-surface-high rounded-lg overflow-hidden flex-shrink-0 border border-slate/10">
                  <img src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=200&q=80" alt="" className="w-full h-full object-cover" />
                </div>
                <div className="min-w-0">
                  <p className="text-navy font-bold text-xs truncate">CAT 320 Excavator</p>
                  <p className="text-slate text-[11px]">5 days • Standard Bucket</p>
                </div>
                <span className="font-bold text-navy ml-auto font-currency">$1,750</span>
              </div>

              <div className="flex items-center gap-3 pb-3 border-b border-slate/10">
                <div className="w-14 h-12 bg-surface-high rounded-lg overflow-hidden flex-shrink-0 border border-slate/10">
                  <img src="https://images.unsplash.com/photo-1605731009813-8e0a0b2c2f4b?w=200&q=80" alt="" className="w-full h-full object-cover" />
                </div>
                <div className="min-w-0">
                  <p className="text-navy font-bold text-xs truncate">Toyota Forklift 8FGU25</p>
                  <p className="text-slate text-[11px]">3 days • Pneumatic Lift</p>
                </div>
                <span className="font-bold text-navy ml-auto font-currency">$630</span>
              </div>

              <div className="space-y-2 text-sm pt-1">
                <div className="flex justify-between"><span className="text-slate">Equipment Subtotal</span><span className="font-currency text-navy font-medium">$2,380</span></div>
                <div className="flex justify-between items-center"><span className="text-slate">Delivery & Pickup</span><span className="font-bold text-emerald-600 text-xs bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">FREE</span></div>
                <div className="flex justify-between text-emerald-600 font-bold"><span>Promo Discount (xxxx10)</span><span>−$100</span></div>
                <div className="flex justify-between"><span className="text-slate">Estimated Taxes</span><span className="font-currency text-navy font-medium">$116</span></div>
              </div>

              <div className="ledger-card flex justify-between items-center py-2.5 px-3 bg-ivory rounded-xl border border-slate/15">
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined shrink-0 text-amber" style={{ fontSize: '18px' }}>security</span>
                  <span className="text-xs font-bold text-navy">Refundable Security Deposit</span>
                </div>
                <span className="font-currency font-bold text-navy">$500</span>
              </div>

              <div className="flex justify-between items-end pt-3 border-t-2 border-navy">
                <div>
                  <span className="font-bold text-navy block text-sm">Total Due</span>
                  <span className="text-[10px] text-slate">Deposit returned post-inspection</span>
                </div>
                <span className="text-2xl font-black text-navy font-currency">$2,396</span>
              </div>
            </div>

            <div className="bg-amber/10 rounded-xl p-3 border border-amber/30 text-[11px] text-navy flex items-start gap-2">
              <span className="material-symbols-outlined shrink-0 text-amber" style={{ fontSize: '18px' }}>verified</span>
              <span>All machinery is backed by our 24/7 on-site replacement guarantee during the active rental term.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
