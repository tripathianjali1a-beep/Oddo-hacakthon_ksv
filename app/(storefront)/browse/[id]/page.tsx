'use client';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const product = {
  id: 1,
  title: 'Komat 850x Excavator',
  category: 'Heavy Machinery',
  rating: 4.9,
  reviews: 124,
  status: 'Available Now',
  desc: 'The Komat 850x Excavator offers unparalleled digging force and lifting capacity for its size class. Ideal for medium to large residential and commercial foundational work. Maintained strictly to OEM standards, ensuring reliability on your job site.',
  specs: [
    { icon: 'weight', label: 'Operating Weight', value: '18,500 lbs' },
    { icon: 'speed', label: 'Engine Power', value: '120 HP' },
    { icon: 'straighten', label: 'Dig Depth', value: '15 ft 2 in' },
    { icon: 'local_gas_station', label: 'Fuel Type', value: 'Diesel' },
  ],
  attachments: [
    { id: 'standard', label: 'Standard Bucket', price: 0 },
    { id: 'breaker', label: 'Breaker Hammer', price: 150 },
    { id: 'auger', label: 'Auger Drill', price: 200 },
    { id: 'thumb', label: 'Hydraulic Thumb', price: 80 },
  ],
  baseRate: 350,
  deposit: 500,
  imgs: [
    'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&q=80',
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80',
    'https://images.unsplash.com/photo-1605731009813-8e0a0b2c2f4b?w=400&q=80',
  ],
};

export default function ProductDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [selectedImg, setSelectedImg] = useState(0);
  const [selectedAttachment, setSelectedAttachment] = useState('standard');
  const [pickupDate, setPickupDate] = useState('2024-10-15');
  const [returnDate, setReturnDate] = useState('2024-10-20');
  const [addedToCart, setAddedToCart] = useState(false);

  const attachment = product.attachments.find((a) => a.id === selectedAttachment)!;
  const days = Math.max(1, Math.round((new Date(returnDate).getTime() - new Date(pickupDate).getTime()) / (1000 * 60 * 60 * 24)));
  const baseTotal = product.baseRate * days;
  const attachmentCost = attachment.price * days;
  const damageWaiver = 75;
  const taxes = Math.round((baseTotal + attachmentCost) * 0.08);
  const total = baseTotal + attachmentCost + damageWaiver + taxes + product.deposit;

  const [showConfigureModal, setShowConfigureModal] = useState(false);
  const [selectedVariantColor, setSelectedVariantColor] = useState('Mustard Gold');
  const [selectedAddons, setSelectedAddons] = useState<string[]>(['GPS Grading Kit', 'Safety Harness']);

  const toggleAddon = (addon: string) => {
    setSelectedAddons((prev) =>
      prev.includes(addon) ? prev.filter((a) => a !== addon) : [...prev, addon]
    );
  };

  const handleAddToCart = () => {
    // If product has variants, open Configure modal first as shown in Image 2
    setShowConfigureModal(true);
  };

  const confirmAndAddToCart = () => {
    setShowConfigureModal(false);
    setAddedToCart(true);
    setTimeout(() => { router.push('/cart'); }, 800);
  };

  return (
    <div className="max-w-[1440px] mx-auto px-6 py-8 relative">
      {/* Breadcrumb */}
      <nav className="hidden md:flex text-xs text-slate gap-1.5 items-center mb-6">
        <Link href="/browse" className="hover:text-navy">Browse</Link>
        <span className="material-symbols-outlined shrink-0" style={{fontSize:'14px'}}>chevron_right</span>
        <Link href="/browse" className="hover:text-navy">Heavy Machinery</Link>
        <span className="material-symbols-outlined shrink-0" style={{fontSize:'14px'}}>chevron_right</span>
        <span className="text-navy font-semibold">{product.title}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {/* Image Gallery */}
          <div className="card p-3 rounded-xl">
            <div className="relative rounded-lg overflow-hidden h-80 md:h-[480px] mb-3 bg-surface-high cursor-zoom-in group">
              <img
                src={product.imgs[selectedImg]}
                alt={product.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur px-3 py-1 rounded text-xs font-medium text-navy">
                Image {selectedImg + 1} of {product.imgs.length}
              </div>
            </div>
            <div className="flex gap-2">
              {product.imgs.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImg(i)}
                  className={`relative h-20 flex-1 rounded-md overflow-hidden border-2 transition-all ${selectedImg === i ? 'border-amber' : 'border-transparent opacity-70 hover:opacity-100'}`}
                >
                  <img src={img} alt={`View ${i + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
              <div className="relative h-20 flex-1 rounded-md overflow-hidden border-2 border-transparent bg-navy/20 flex items-center justify-center text-white font-bold text-sm">
                +4
              </div>
            </div>
          </div>

          {/* Overview + Specs */}
          <div className="card p-6 rounded-xl">
            <h2 className="text-h3 text-navy mb-3">Overview</h2>
            <p className="text-on-surface-variant text-sm leading-relaxed mb-5">{product.desc}</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {product.specs.map((spec) => (
                <div key={spec.label} className="bg-ivory rounded-lg border border-slate/10 p-3 flex flex-col gap-1.5">
                  <span className="material-symbols-outlined shrink-0 text-slate" style={{fontSize:'20px'}}>{spec.icon}</span>
                  <span className="text-[10px] font-semibold text-slate uppercase tracking-wide">{spec.label}</span>
                  <span className="text-navy font-semibold text-sm">{spec.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column — Booking Widget */}
        <div className="lg:col-span-5">
          <div className="card rounded-xl overflow-hidden sticky top-24">
            {/* Widget Header */}
            <div className="p-6 border-b border-slate/10 bg-ivory">
              <h1 className="text-h2 text-navy mb-2">{product.title}</h1>
              <div className="flex items-center gap-3">
                <span className="badge-green">{product.status}</span>
                <span className="flex items-center gap-1 text-sm text-slate">
                  <span className="material-symbols-outlined shrink-0 text-amber" style={{fontSize:'16px', fontVariationSettings:"'FILL' 1"}}>star</span>
                  {product.rating} ({product.reviews} reviews)
                </span>
              </div>
            </div>

            <div className="p-6 flex flex-col gap-5">
              {/* Attachment Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate uppercase tracking-wide mb-3">Select Attachment</label>
                <div className="grid grid-cols-2 gap-2">
                  {product.attachments.map((att) => (
                    <label key={att.id} className="cursor-pointer">
                      <input type="radio" name="attachment" value={att.id} checked={selectedAttachment === att.id} onChange={() => setSelectedAttachment(att.id)} className="sr-only peer" />
                      <div className="p-3 rounded-lg border-2 border-slate/15 peer-checked:border-amber peer-checked:bg-navy peer-checked:text-white transition-all text-center">
                        <p className="text-xs font-semibold">{att.label}</p>
                        <p className="text-xs opacity-70 mt-0.5">{att.price === 0 ? 'Included' : `+$${att.price}/day`}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Date Range */}
              <div>
                <label className="block text-xs font-semibold text-slate uppercase tracking-wide mb-3">Rental Period</label>
                <div className="grid grid-cols-2 gap-2">
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate/50 text-xs font-semibold">PICKUP</span>
                    <input
                      type="date"
                      value={pickupDate}
                      onChange={(e) => setPickupDate(e.target.value)}
                      className="input-field pt-6 pb-2 text-sm"
                    />
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate/50 text-xs font-semibold">RETURN</span>
                    <input
                      type="date"
                      value={returnDate}
                      onChange={(e) => setReturnDate(e.target.value)}
                      className="input-field pt-6 pb-2 text-sm"
                    />
                  </div>
                </div>
                <p className="text-right text-xs text-slate mt-1.5">
                  Total: <strong className="text-navy">{days} day{days !== 1 ? 's' : ''}</strong>
                </p>
              </div>
            </div>

            {/* Price Summary Ledger */}
            <div className="bg-ivory border-t border-slate/10 p-6">
              <h3 className="text-sm font-semibold text-navy mb-4">Price Summary</h3>
              <div className="space-y-2.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate">Base Rate (${product.baseRate}/day × {days})</span>
                  <span className="font-currency text-navy">${baseTotal.toLocaleString()}</span>
                </div>
                {attachment.price > 0 && (
                  <div className="flex justify-between">
                    <span className="text-slate">{attachment.label} ({days} days)</span>
                    <span className="font-currency text-navy">+${attachmentCost}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate">Damage Waiver</span>
                  <span className="font-currency text-navy">${damageWaiver}</span>
                </div>
                <div className="flex justify-between pb-3 border-b border-slate/10">
                  <span className="text-slate">Taxes & Fees</span>
                  <span className="font-currency text-navy">${taxes}</span>
                </div>
                {/* Security Deposit Card */}
                <div className="ledger-card flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined shrink-0 text-navy" style={{fontSize:'18px'}}>security</span>
                    <span className="text-xs font-semibold text-navy">Security Deposit</span>
                  </div>
                  <span className="font-currency font-semibold text-navy">${product.deposit}</span>
                </div>
                <p className="text-[11px] text-slate text-right">Fully refundable upon safe return</p>
                <div className="flex justify-between items-end pt-2 border-t-2 border-navy">
                  <span className="font-semibold text-navy">Total Due Today</span>
                  <span className="text-h2 text-navy font-currency">${total.toLocaleString()}</span>
                </div>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={addedToCart}
                className="btn-primary w-full py-3 mt-4 text-sm flex items-center justify-center gap-2"
              >
                {addedToCart ? (
                  <>
                    <span className="material-symbols-outlined shrink-0" style={{fontSize:'18px', fontVariationSettings:"'FILL' 1"}}>check_circle</span>
                    <span>Added! Redirecting...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined shrink-0" style={{fontSize:'18px', fontVariationSettings:"'FILL' 1"}}>shopping_cart</span>
                    <span>Add to Cart</span>
                  </>
                )}
              </button>
              <p className="text-center text-xs text-slate mt-2">You won't be charged yet.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Configure Variants Modal Dialog from Image 2 */}
      {showConfigureModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate/20 animate-scale-up">
            {/* Dialog Header */}
            <div className="bg-navy text-white px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <span className="material-symbols-outlined text-amber" style={{ fontSize: '22px' }}>tune</span>
                <span>Configure</span>
              </h3>
              <button
                onClick={() => setShowConfigureModal(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
                title="Close"
              >
                <span className="material-symbols-outlined shrink-0" style={{ fontSize: '20px' }}>close</span>
              </button>
            </div>

            {/* Dialog Body */}
            <div className="p-6 space-y-6">
              {/* Row 1: Color / Variant options from Image 2 */}
              <div className="bg-ivory/60 border border-slate/15 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-navy uppercase tracking-wider">Select Color / Finish Variant</span>
                  <span className="badge-amber text-[10px]">{selectedVariantColor}</span>
                </div>
                <div className="flex items-center justify-around py-2">
                  {[
                    { name: 'Mustard Gold', hex: '#D97706' },
                    { name: 'Industrial Navy', hex: '#1E293B' },
                    { name: 'Safety Orange', hex: '#EA580C' },
                    { name: 'Steel Gray', hex: '#64748B' },
                  ].map((v) => (
                    <label key={v.name} className="flex flex-col items-center gap-2 cursor-pointer group">
                      <input
                        type="radio"
                        name="variantColor"
                        checked={selectedVariantColor === v.name}
                        onChange={() => setSelectedVariantColor(v.name)}
                        className="sr-only"
                      />
                      <div
                        style={{ backgroundColor: v.hex }}
                        className={`w-10 h-10 rounded-full border-2 transition-all flex items-center justify-center ${
                          selectedVariantColor === v.name
                            ? 'ring-4 ring-amber/30 scale-110 border-white shadow-md'
                            : 'border-slate/20 opacity-70 group-hover:opacity-100'
                        }`}
                      >
                        {selectedVariantColor === v.name && (
                          <span className="material-symbols-outlined text-white text-sm" style={{ fontSize: '18px', fontVariationSettings: "'FILL' 1" }}>check</span>
                        )}
                      </div>
                      <span className="text-[11px] font-semibold text-slate group-hover:text-navy">{v.name.split(' ')[0]}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Row 2: Add-on Checkboxes from Image 2 */}
              <div className="bg-ivory/60 border border-slate/15 rounded-xl p-4 space-y-3">
                <span className="text-xs font-bold text-navy uppercase tracking-wider block">Optional Add-ons & Accessories</span>
                <div className="space-y-2.5">
                  {[
                    { name: 'GPS Grading Kit', price: '+$15/day' },
                    { name: 'Safety Harness & Beacon', price: '+$8/day' },
                    { name: 'Extended Hydraulic Warranty', price: '+$25/day' },
                  ].map((addon) => (
                    <label
                      key={addon.name}
                      onClick={() => toggleAddon(addon.name)}
                      className="flex items-center justify-between p-2.5 rounded-lg border border-slate/15 bg-white hover:border-amber cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={selectedAddons.includes(addon.name)}
                          onChange={() => {}}
                          className="w-4 h-4 rounded border-slate/30 text-amber focus:ring-amber"
                        />
                        <span className="text-xs font-bold text-navy">{addon.name}</span>
                      </div>
                      <span className="text-xs font-semibold text-emerald-600">{addon.price}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Dialog Footer from Image 2 */}
            <div className="px-6 py-4 bg-ivory border-t border-slate/15 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowConfigureModal(false)}
                className="btn-secondary px-5 py-2.5 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmAndAddToCart}
                className="btn-primary px-6 py-2.5 text-xs font-bold flex items-center gap-1.5 shadow-md"
              >
                <span>Configure & Add to Cart</span>
                <span className="material-symbols-outlined shrink-0" style={{ fontSize: '16px' }}>check_circle</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
