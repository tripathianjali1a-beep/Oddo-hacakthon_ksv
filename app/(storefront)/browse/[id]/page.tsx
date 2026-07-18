'use client';
import Link from 'next/link';
import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { addToCart } from '@/lib/cart';
import type { Product } from '@/lib/types';

const statusStyle: Record<string, { dot: string; label: string; cls: string }> = {
  available: { dot: '#10b981', label: 'Available Now', cls: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
  'low-stock': { dot: '#D97706', label: 'Low Stock', cls: 'text-amber-700 bg-amber-50 border-amber-200' },
  booked: { dot: '#ef4444', label: 'Currently Booked', cls: 'text-red-700 bg-red-50 border-red-200' },
  draft: { dot: '#64748B', label: 'Draft', cls: 'text-slate-600 bg-slate-50 border-slate-200' },
};

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImg, setSelectedImg] = useState(0);
  const [selectedAttachment, setSelectedAttachment] = useState('standard');
  const [pickupDate, setPickupDate] = useState('2024-10-15');
  const [returnDate, setReturnDate] = useState('2024-10-20');
  const [addedToCart, setAddedToCart] = useState(false);
  const [fav, setFav] = useState(false);

  useEffect(() => {
    fetch(`/api/products/${id}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data: Product | null) => {
        setProduct(data);
        if (data?.attachments?.[0]) setSelectedAttachment(data.attachments[0].id);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-8 grid lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 card h-[520px] animate-pulse" />
        <div className="lg:col-span-5 card h-[520px] animate-pulse" />
      </div>
    );
  }
  if (!product) {
    return (
      <div className="max-w-[1400px] mx-auto px-6 py-24 text-center">
        <span className="material-symbols-outlined text-slate/30" style={{ fontSize: '64px' }}>inventory_2</span>
        <p className="text-slate mt-3 mb-4">This item could not be found.</p>
        <Link href="/browse" className="btn-primary inline-flex">Back to Browse</Link>
      </div>
    );
  }

  const gallery = product.gallery.length ? product.gallery : [product.image];
  const attachment = product.attachments.find((a) => a.id === selectedAttachment) || product.attachments[0] || { id: 'standard', label: 'Standard', price: 0 };
  const days = Math.max(1, Math.round((new Date(returnDate).getTime() - new Date(pickupDate).getTime()) / (1000 * 60 * 60 * 24)));
  const baseRate = product.daily;
  const baseTotal = baseRate * days;
  const attachmentCost = attachment.price * days;
  const damageWaiver = 75;
  const taxes = Math.round((baseTotal + attachmentCost) * 0.08);
  const total = baseTotal + attachmentCost + damageWaiver + taxes + product.deposit;
  const st = statusStyle[product.status] ?? statusStyle.available;
  const isBooked = product.status === 'booked';

  const rateTiles = [
    { label: 'Hourly', value: product.hourly },
    { label: 'Daily', value: product.daily },
    { label: 'Weekly', value: product.weekly },
    { label: 'Monthly', value: product.monthly },
  ].filter((r) => r.value > 0);

  const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  const nextImg = () => setSelectedImg((i) => (i + 1) % gallery.length);
  const prevImg = () => setSelectedImg((i) => (i - 1 + gallery.length) % gallery.length);

  const handleAddToCart = () => {
    addToCart({
      productId: product.id,
      title: product.name,
      attachment: attachment.label,
      attachmentPrice: attachment.price,
      days,
      rate: baseRate + attachment.price,
      deposit: product.deposit,
      image: product.image,
      pickup: fmtDate(pickupDate),
      returnDate: fmtDate(returnDate),
    });
    setAddedToCart(true);
    setTimeout(() => router.push('/cart'), 700);
  };

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6 pb-28 lg:pb-8">
      {/* Breadcrumb + back */}
      <div className="flex items-center justify-between mb-5">
        <nav className="flex text-xs text-slate gap-1.5 items-center min-w-0">
          <Link href="/browse" className="hover:text-navy shrink-0">Browse</Link>
          <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>chevron_right</span>
          <Link href="/browse" className="hover:text-navy shrink-0">{product.category}</Link>
          <span className="material-symbols-outlined hidden sm:inline" style={{ fontSize: '14px' }}>chevron_right</span>
          <span className="text-navy font-semibold truncate hidden sm:inline">{product.name}</span>
        </nav>
        <button onClick={() => router.back()} className="btn-ghost text-xs py-1.5 px-2.5 shrink-0">
          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>arrow_back</span>
          Back
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ───────── Left: Gallery + details ───────── */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {/* Gallery */}
          <div className="card overflow-hidden">
            <div className="relative h-72 sm:h-96 lg:h-[460px] bg-navy group">
              <img src={gallery[selectedImg]} alt={product.name} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-navy/30 via-transparent to-transparent pointer-events-none" />

              {/* top row overlay */}
              <div className="absolute top-4 left-4 right-4 flex items-start justify-between">
                <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1.5 rounded-full border backdrop-blur bg-white/90 ${st.cls}`}>
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: st.dot }} />
                  {st.label}
                </span>
                <div className="flex gap-2">
                  <button onClick={() => setFav((f) => !f)} className="w-9 h-9 rounded-full bg-white/90 backdrop-blur flex items-center justify-center text-slate hover:scale-105 transition-transform" aria-label="Save">
                    <span className="material-symbols-outlined" style={{ fontSize: '18px', fontVariationSettings: fav ? "'FILL' 1" : "'FILL' 0", color: fav ? '#D97706' : undefined }}>favorite</span>
                  </button>
                  <button className="w-9 h-9 rounded-full bg-white/90 backdrop-blur flex items-center justify-center text-slate hover:scale-105 transition-transform" aria-label="Share">
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>ios_share</span>
                  </button>
                </div>
              </div>

              {/* arrows */}
              {gallery.length > 1 && (
                <>
                  <button onClick={prevImg} className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/85 backdrop-blur flex items-center justify-center text-navy opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white" aria-label="Previous">
                    <span className="material-symbols-outlined">chevron_left</span>
                  </button>
                  <button onClick={nextImg} className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/85 backdrop-blur flex items-center justify-center text-navy opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white" aria-label="Next">
                    <span className="material-symbols-outlined">chevron_right</span>
                  </button>
                </>
              )}

              <div className="absolute bottom-4 left-4 bg-navy/70 backdrop-blur text-white px-3 py-1 rounded-full text-xs font-medium">
                {selectedImg + 1} / {gallery.length}
              </div>
            </div>

            {gallery.length > 1 && (
              <div className="flex gap-2 p-3">
                {gallery.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImg(i)}
                    className={`relative h-16 sm:h-20 flex-1 rounded-xl overflow-hidden border-2 transition-all ${selectedImg === i ? 'border-amber scale-[1.02]' : 'border-transparent opacity-60 hover:opacity-100'}`}
                  >
                    <img src={img} alt={`View ${i + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Rate options */}
          {rateTiles.length > 0 && (
            <div className="card p-5">
              <div className="flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-amber" style={{ fontSize: '20px' }}>payments</span>
                <h2 className="text-h3 text-navy">Rental Rates</h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {rateTiles.map((r) => (
                  <div key={r.label} className="rounded-xl border border-slate/12 bg-ivory p-3.5 text-center">
                    <p className="text-[10px] font-semibold text-slate uppercase tracking-wide mb-1">{r.label}</p>
                    <p className="text-navy font-bold text-lg font-currency">${r.value.toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Overview */}
          <div className="card p-6">
            <h2 className="text-h3 text-navy mb-3">About this rental</h2>
            <p className="text-on-surface-variant text-sm leading-relaxed">{product.description}</p>

            {/* meta chips */}
            <div className="flex flex-wrap gap-2 mt-5">
              <span className="inline-flex items-center gap-1.5 text-xs text-navy bg-surface-container px-3 py-1.5 rounded-full">
                <span className="material-symbols-outlined text-slate" style={{ fontSize: '15px' }}>sell</span>
                {product.brand}
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs text-navy bg-surface-container px-3 py-1.5 rounded-full">
                <span className="material-symbols-outlined text-slate" style={{ fontSize: '15px' }}>qr_code_2</span>
                {product.sku}
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs text-navy bg-surface-container px-3 py-1.5 rounded-full">
                <span className="material-symbols-outlined text-slate" style={{ fontSize: '15px' }}>category</span>
                {product.category}
              </span>
            </div>
          </div>

          {/* Specs */}
          {product.specs.length > 0 && (
            <div className="card p-6">
              <h2 className="text-h3 text-navy mb-4">Specifications</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {product.specs.map((spec) => (
                  <div key={spec.label} className="rounded-xl border border-slate/10 bg-ivory p-4 flex flex-col gap-2">
                    <span className="w-9 h-9 rounded-lg bg-amber/10 flex items-center justify-center">
                      <span className="material-symbols-outlined text-amber" style={{ fontSize: '20px' }}>{spec.icon}</span>
                    </span>
                    <span className="text-[10px] font-semibold text-slate uppercase tracking-wide">{spec.label}</span>
                    <span className="text-navy font-semibold text-sm">{spec.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Trust row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { icon: 'verified', title: 'Inspected & Certified', desc: 'Serviced to OEM spec' },
              { icon: 'shield_lock', title: 'Protected Payments', desc: 'Full damage cover' },
              { icon: 'support_agent', title: '24/7 Support', desc: 'On-site assistance' },
            ].map((t) => (
              <div key={t.title} className="card p-4 flex items-center gap-3">
                <span className="w-10 h-10 rounded-xl bg-amber/10 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-amber" style={{ fontSize: '20px' }}>{t.icon}</span>
                </span>
                <div>
                  <p className="text-navy font-semibold text-sm leading-tight">{t.title}</p>
                  <p className="text-slate text-xs">{t.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ───────── Right: Booking widget ───────── */}
        <div className="lg:col-span-5">
          <div className="card overflow-hidden sticky top-24">
            {/* Header */}
            <div className="p-6 bg-gradient-to-br from-navy-container to-navy text-white relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-amber/20 blur-3xl" />
              <p className="text-amber text-[11px] font-semibold uppercase tracking-widest mb-1 relative">{product.category}</p>
              <h1 className="text-2xl font-bold leading-tight relative">{product.name}</h1>
              <div className="flex items-center gap-3 mt-3 relative">
                <span className="flex items-center gap-1 text-sm">
                  <span className="material-symbols-outlined text-amber" style={{ fontSize: '17px', fontVariationSettings: "'FILL' 1" }}>star</span>
                  <span className="font-semibold">{product.rating}</span>
                  <span className="text-white/60">({product.reviews} reviews)</span>
                </span>
                <span className="w-px h-4 bg-white/20" />
                <span className="text-white/80 text-sm">{product.brand}</span>
              </div>
              <div className="mt-4 flex items-baseline gap-1 relative">
                <span className="text-3xl font-bold font-currency">${baseRate.toLocaleString()}</span>
                <span className="text-white/60 text-sm">/ day</span>
              </div>
            </div>

            <div className="p-6 flex flex-col gap-5">
              {/* Attachment */}
              {product.attachments.length > 1 && (
                <div>
                  <label className="block text-xs font-semibold text-slate uppercase tracking-wide mb-3">Choose Option</label>
                  <div className="grid grid-cols-2 gap-2">
                    {product.attachments.map((att) => (
                      <label key={att.id} className="cursor-pointer">
                        <input type="radio" name="attachment" value={att.id} checked={selectedAttachment === att.id} onChange={() => setSelectedAttachment(att.id)} className="sr-only peer" />
                        <div className="p-3 rounded-xl border-2 border-slate/15 peer-checked:border-amber peer-checked:bg-amber/5 transition-all text-center">
                          <p className="text-xs font-semibold text-navy">{att.label}</p>
                          <p className="text-[11px] text-slate mt-0.5">{att.price === 0 ? 'Included' : `+$${att.price}/day`}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Dates */}
              <div>
                <label className="block text-xs font-semibold text-slate uppercase tracking-wide mb-3">Rental Period</label>
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-xl border border-slate/15 bg-ivory px-3 py-2">
                    <span className="block text-[10px] font-semibold text-slate/60 uppercase">Pickup</span>
                    <input type="date" value={pickupDate} onChange={(e) => setPickupDate(e.target.value)} className="w-full bg-transparent outline-none text-sm text-navy font-medium" />
                  </div>
                  <div className="rounded-xl border border-slate/15 bg-ivory px-3 py-2">
                    <span className="block text-[10px] font-semibold text-slate/60 uppercase">Return</span>
                    <input type="date" value={returnDate} onChange={(e) => setReturnDate(e.target.value)} className="w-full bg-transparent outline-none text-sm text-navy font-medium" />
                  </div>
                </div>
                <div className="flex items-center justify-center gap-1.5 mt-2 text-xs text-slate">
                  <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>event</span>
                  <strong className="text-navy">{days} day{days !== 1 ? 's' : ''}</strong> selected
                </div>
              </div>

              {/* Price summary */}
              <div className="rounded-xl border border-slate/12 divide-y divide-slate/10">
                <div className="flex justify-between px-4 py-2.5 text-sm">
                  <span className="text-slate">${baseRate}/day × {days}</span>
                  <span className="font-currency text-navy">${baseTotal.toLocaleString()}</span>
                </div>
                {attachment.price > 0 && (
                  <div className="flex justify-between px-4 py-2.5 text-sm">
                    <span className="text-slate">{attachment.label}</span>
                    <span className="font-currency text-navy">+${attachmentCost.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between px-4 py-2.5 text-sm">
                  <span className="text-slate">Damage waiver</span>
                  <span className="font-currency text-navy">${damageWaiver}</span>
                </div>
                <div className="flex justify-between px-4 py-2.5 text-sm">
                  <span className="text-slate">Taxes & fees</span>
                  <span className="font-currency text-navy">${taxes}</span>
                </div>
                <div className="flex justify-between items-center px-4 py-2.5 text-sm bg-ivory">
                  <span className="flex items-center gap-1.5 text-navy font-medium">
                    <span className="material-symbols-outlined text-slate" style={{ fontSize: '16px' }}>security</span>
                    Refundable deposit
                  </span>
                  <span className="font-currency font-semibold text-navy">${product.deposit.toLocaleString()}</span>
                </div>
              </div>

              <div className="flex justify-between items-end pt-1">
                <div>
                  <p className="text-[11px] text-slate uppercase tracking-wide">Total due today</p>
                  <p className="text-3xl text-navy font-bold font-currency">${total.toLocaleString()}</p>
                </div>
                <span className="text-[11px] text-slate">incl. deposit</span>
              </div>

              <button onClick={handleAddToCart} disabled={addedToCart || isBooked} className="btn-primary w-full py-3.5 text-sm">
                {isBooked ? 'Currently Booked' : addedToCart ? (
                  <><span className="material-symbols-outlined" style={{ fontSize: '18px', fontVariationSettings: "'FILL' 1" }}>check_circle</span>Added! Redirecting…</>
                ) : (
                  <><span className="material-symbols-outlined" style={{ fontSize: '18px', fontVariationSettings: "'FILL' 1" }}>shopping_cart</span>Add to Cart</>
                )}
              </button>
              <p className="text-center text-xs text-slate flex items-center justify-center gap-1">
                <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>lock</span>
                You won&apos;t be charged yet · fully refundable deposit
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile sticky CTA bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-xl border-t border-slate/15 px-4 py-3 flex items-center justify-between gap-3 shadow-[0_-8px_30px_-12px_rgba(15,23,42,0.25)]">
        <div>
          <p className="text-[10px] text-slate uppercase tracking-wide">Total · {days}d</p>
          <p className="text-xl text-navy font-bold font-currency">${total.toLocaleString()}</p>
        </div>
        <button onClick={handleAddToCart} disabled={addedToCart || isBooked} className="btn-primary flex-1 max-w-[220px] py-3 text-sm">
          {isBooked ? 'Booked' : addedToCart ? 'Added ✓' : 'Add to Cart'}
        </button>
      </div>
    </div>
  );
}
