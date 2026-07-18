'use client';
import Link from 'next/link';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

const products = [
  {
    id: 1,
    title: 'CAT 320 Excavator',
    desc: 'Standard heavy-duty excavator suitable for large scale earthmoving and construction projects.',
    status: 'available',
    category: 'Heavy Machinery',
    brand: 'Caterpillar',
    hourly: 85,
    daily: 650,
    weekly: 3200,
    monthly: 9800,
    isDeal: true,
    discountPrice: '$499/day',
    img: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&q=80',
    colors: ['#D97706', '#1E293B', '#64748B'],
  },
  {
    id: 2,
    title: 'Toyota Forklift 8FGU25',
    desc: 'Versatile indoor/outdoor warehouse lift with 5,000 lb capacity and pneumatic tires.',
    status: 'low-stock',
    category: 'Power Tools',
    brand: 'Komatsu',
    hourly: 45,
    daily: 280,
    weekly: 1150,
    monthly: 3800,
    isDeal: true,
    discountPrice: '$210/day',
    img: 'https://images.unsplash.com/photo-1605731009813-8e0a0b2c2f4b?w=600&q=80',
    colors: ['#EF4444', '#1E293B'],
  },
  {
    id: 3,
    title: 'Industrial Generator 50kW',
    desc: 'Portable 50kW diesel generator for remote site power needs. Reliable, fuel efficient.',
    status: 'available',
    category: 'Heavy Machinery',
    brand: 'Caterpillar',
    hourly: 0,
    daily: 150,
    weekly: 600,
    monthly: 2100,
    isDeal: true,
    discountPrice: '$115/day',
    img: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=600&q=80',
    colors: ['#EAB308', '#3B82F6'],
  },
  {
    id: 4,
    title: 'Concrete Mixer 350L',
    desc: 'High-capacity drum mixer for ready-mix concrete preparation on commercial sites.',
    status: 'available',
    category: 'Scaffolding',
    brand: 'Komatsu',
    hourly: 25,
    daily: 120,
    weekly: 500,
    monthly: 1600,
    isDeal: false,
    img: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&q=80',
    colors: ['#D97706'],
  },
  {
    id: 5,
    title: 'Aerial Work Platform',
    desc: 'Self-propelled scissor lift, 30 ft reach, electric powered for indoor use.',
    status: 'booked',
    category: 'Scaffolding',
    brand: 'Caterpillar',
    hourly: 60,
    daily: 400,
    weekly: 1800,
    monthly: 5200,
    isDeal: false,
    img: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80',
    colors: ['#D97706', '#10B981'],
  },
  {
    id: 6,
    title: 'Telehandler JCB 535',
    desc: 'Versatile 3.5 tonne reach truck with 5.5m lift height, ideal for farm and construction.',
    status: 'available',
    category: 'Heavy Machinery',
    brand: 'Komatsu',
    hourly: 70,
    daily: 480,
    weekly: 2100,
    monthly: 6800,
    isDeal: false,
    img: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&q=80',
    colors: ['#3B82F6', '#1E293B', '#D97706'],
  },
];

const statusMap: Record<string, { label: string; cls: string }> = {
  available: { label: 'AVAILABLE', cls: 'badge-green text-[10px]' },
  'low-stock': { label: 'LOW STOCK', cls: 'badge-amber text-[10px]' },
  booked: { label: 'OUT OF STOCK', cls: 'badge-red text-[10px]' },
};

function BrowseContent() {
  const searchParams = useSearchParams();
  const initialCat = searchParams.get('cat');
  const initialDeals = searchParams.get('deals');
  const initialBrand = searchParams.get('brand');

  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('recommended');
  const [selectedCats, setSelectedCats] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedDuration, setSelectedDuration] = useState<string>('All');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [onlyDeals, setOnlyDeals] = useState<boolean>(false);
  const [page, setPage] = useState(1);
  const [toast, setToast] = useState<string | null>(null);
  const PER_PAGE = 6;

  useEffect(() => {
    if (initialCat && initialCat !== 'all') {
      setSelectedCats([initialCat]);
    }
    if (initialDeals === 'true') {
      setOnlyDeals(true);
    }
    if (initialBrand) {
      setSelectedBrands([initialBrand]);
    }
  }, [initialCat, initialDeals, initialBrand]);

  const triggerToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const toggleCat = (cat: string) => setSelectedCats((prev) => prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]);
  const toggleBrand = (brand: string) => setSelectedBrands((prev) => prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]);
  const toggleColor = (color: string) => setSelectedColors((prev) => prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color]);

  const filtered = products.filter((p) => {
    const matchSearch = p.title.toLowerCase().includes(search.toLowerCase()) || p.desc.toLowerCase().includes(search.toLowerCase());
    const matchCat = selectedCats.length === 0 || selectedCats.includes(p.category);
    const matchBrand = selectedBrands.length === 0 || selectedBrands.includes(p.brand);
    const matchDeals = !onlyDeals || p.isDeal;
    const matchColor = selectedColors.length === 0 || p.colors.some((c) => selectedColors.includes(c));
    const matchMin = !minPrice || p.daily >= parseInt(minPrice);
    const matchMax = !maxPrice || p.daily <= parseInt(maxPrice);
    return matchSearch && matchCat && matchBrand && matchDeals && matchColor && matchMin && matchMax;
  }).sort((a, b) => {
    if (sort === 'price-asc') return a.daily - b.daily;
    if (sort === 'price-desc') return b.daily - a.daily;
    return 0;
  });

  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const totalPages = Math.ceil(filtered.length / PER_PAGE);

  return (
    <div className="max-w-[1440px] mx-auto px-6 py-8 flex flex-col md:flex-row gap-6 relative">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-navy text-white px-5 py-3.5 rounded-xl shadow-2xl border border-amber/30 flex items-center gap-3 animate-slide-up">
          <span className="material-symbols-outlined shrink-0 text-amber" style={{ fontSize: '20px' }}>check_circle</span>
          <span className="text-sm font-semibold">{toast}</span>
        </div>
      )}

      {/* Filters Sidebar from Mockup */}
      <aside className="w-full md:w-64 flex-shrink-0">
        <div className="card p-5 sticky top-24">
          <div className="flex justify-between items-center mb-4 pb-4 border-b border-slate/10">
            <h3 className="font-semibold text-navy text-sm flex items-center gap-1.5">
              <span className="material-symbols-outlined text-amber shrink-0" style={{ fontSize: '18px' }}>filter_alt</span>
              <span>Filters</span>
            </h3>
            <button
              onClick={() => {
                setSelectedCats([]); setSelectedBrands([]); setSelectedColors([]);
                setSelectedDuration('All'); setMinPrice(''); setMaxPrice(''); setOnlyDeals(false);
              }}
              className="text-xs text-amber hover:underline font-medium"
            >
              Clear All
            </button>
          </div>

          {/* Deals Only Toggle */}
          <div className="mb-5 pb-4 border-b border-slate/10">
            <label className="flex items-center justify-between cursor-pointer group">
              <span className="text-xs font-bold text-navy flex items-center gap-1">
                <span className="material-symbols-outlined text-red-600 shrink-0" style={{ fontSize: '16px' }}>local_fire_department</span>
                <span>Active Deals Only</span>
              </span>
              <input
                type="checkbox"
                checked={onlyDeals}
                onChange={(e) => setOnlyDeals(e.target.checked)}
                className="w-4 h-4 rounded border-slate/30 text-amber focus:ring-amber"
              />
            </label>
          </div>

          {/* Category */}
          <div className="mb-5">
            <h4 className="text-xs font-semibold text-slate uppercase tracking-wide mb-3">Category</h4>
            <div className="space-y-2">
              {['Heavy Machinery', 'Power Tools', 'Scaffolding', 'Electronics', 'Office Furniture'].map((cat) => (
                <label key={cat} className="flex items-center gap-2.5 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={selectedCats.includes(cat)}
                    onChange={() => toggleCat(cat)}
                    className="w-4 h-4 rounded border-slate/30 text-navy focus:ring-amber"
                  />
                  <span className="text-sm text-on-surface group-hover:text-navy transition-colors">{cat}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Brand from Mockup */}
          <div className="mb-5">
            <h4 className="text-xs font-semibold text-slate uppercase tracking-wide mb-3">Brand</h4>
            <div className="space-y-2">
              {['Caterpillar', 'Komatsu', 'Sony', 'Herman Miller'].map((brand) => (
                <label key={brand} className="flex items-center gap-2.5 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={selectedBrands.includes(brand)}
                    onChange={() => toggleBrand(brand)}
                    className="w-4 h-4 rounded border-slate/30 text-navy focus:ring-amber"
                  />
                  <span className="text-sm text-on-surface group-hover:text-navy transition-colors">{brand}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Color Variants from Mockup */}
          <div className="mb-5">
            <h4 className="text-xs font-semibold text-slate uppercase tracking-wide mb-3">Color Variant</h4>
            <div className="flex flex-wrap gap-2">
              {[
                { name: 'Mustard', hex: '#D97706' },
                { name: 'Navy', hex: '#1E293B' },
                { name: 'Red', hex: '#EF4444' },
                { name: 'Blue', hex: '#3B82F6' },
                { name: 'Green', hex: '#10B981' },
              ].map((c) => (
                <button
                  key={c.hex}
                  type="button"
                  onClick={() => toggleColor(c.hex)}
                  title={c.name}
                  style={{ backgroundColor: c.hex }}
                  className={`w-6 h-6 rounded-full border-2 transition-transform ${
                    selectedColors.includes(c.hex)
                      ? 'ring-2 ring-amber ring-offset-2 scale-110 border-white'
                      : 'border-slate/20 hover:scale-105'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Duration Options from Mockup */}
          <div className="mb-5">
            <h4 className="text-xs font-semibold text-slate uppercase tracking-wide mb-3">Duration</h4>
            <div className="space-y-1.5">
              {['All', '1 Month', '6 Month', '1 Year', '2 Years', '3 Years'].map((dur) => (
                <label key={dur} className="flex items-center gap-2.5 cursor-pointer group">
                  <input
                    type="radio"
                    name="duration"
                    checked={selectedDuration === dur}
                    onChange={() => setSelectedDuration(dur)}
                    className="w-4 h-4 border-slate/30 text-navy focus:ring-amber"
                  />
                  <span className="text-sm text-on-surface group-hover:text-navy transition-colors">{dur}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div className="mb-5">
            <h4 className="text-xs font-semibold text-slate uppercase tracking-wide mb-3">Daily Price Range</h4>
            <div className="flex items-center gap-2">
              <input type="number" placeholder="Min" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} className="input-field text-xs py-2 px-2" />
              <span className="text-slate">—</span>
              <input type="number" placeholder="Max" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} className="input-field text-xs py-2 px-2" />
            </div>
          </div>

          <button
            onClick={() => triggerToast(`Filters applied across catalog inventory (${filtered.length} items matched).`)}
            className="btn-primary w-full text-sm py-2.5"
          >
            Apply Filters
          </button>
        </div>
      </aside>

      {/* Product Grid */}
      <section className="flex-1 min-w-0">
        {/* Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-5">
          <div>
            <h1 className="text-h2 text-navy">
              {onlyDeals ? 'Active Promotional Deals' : selectedCats.length > 0 ? `${selectedCats.join(', ')} Catalog` : 'Available Rentals'}
            </h1>
            <p className="text-slate text-xs mt-0.5">{filtered.length} items found across inventory</p>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-none">
              <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-slate/50 shrink-0" style={{ fontSize: '16px' }}>search</span>
              <input
                type="text"
                placeholder="Search inventory..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input-field pl-8 text-sm w-full sm:w-56 py-2"
              />
            </div>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="input-field text-sm py-2 w-auto"
            >
              <option value="recommended">Recommended</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Grid */}
        {paginated.length === 0 ? (
          <div className="card p-12 text-center">
            <span className="material-symbols-outlined text-slate/30 text-5xl mb-3 shrink-0">search_off</span>
            <p className="text-slate font-medium">No items match your filters.</p>
            <button
              onClick={() => { setSelectedCats([]); setSelectedBrands([]); setSelectedColors([]); setOnlyDeals(false); setSearch(''); }}
              className="btn-ghost mt-3"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {paginated.map((product) => {
              const s = statusMap[product.status];
              return (
                <article key={product.id} className="card card-hover flex flex-col overflow-hidden group">
                  <div className="relative h-48 bg-surface-high overflow-hidden">
                    <img src={product.img} alt={product.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <span className={`absolute top-3 right-3 ${s.cls}`}>{s.label}</span>
                    {product.isDeal && (
                      <span className="absolute top-3 left-3 bg-red-600 text-white text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded shadow-md flex items-center gap-0.5">
                        <span className="material-symbols-outlined shrink-0" style={{ fontSize: '12px' }}>local_fire_department</span>
                        <span>DEAL</span>
                      </span>
                    )}
                  </div>

                  {/* Variant Swatches under image as shown in Mockup */}
                  <div className="px-5 pt-3 pb-1 flex items-center gap-1.5 border-b border-slate/10">
                    <span className="text-[10px] font-bold text-slate uppercase tracking-wider mr-1">Variants:</span>
                    {product.colors.map((c, idx) => (
                      <div
                        key={idx}
                        style={{ backgroundColor: c }}
                        className="w-3.5 h-3.5 rounded-full border border-slate/30 shadow-xs"
                        title="Available color variant"
                      />
                    ))}
                  </div>

                  <div className="p-5 flex-1 flex flex-col">
                    <h2 className="font-semibold text-navy text-sm mb-1 leading-snug">{product.title}</h2>
                    <p className="text-slate text-xs leading-relaxed mb-4 line-clamp-2">{product.desc}</p>
                    <div className="mt-auto">
                      <div className="grid grid-cols-3 gap-1 mb-4">
                        {[
                          { label: 'Hourly', val: product.hourly ? `$${product.hourly}/hr` : '—' },
                          { label: 'Daily', val: product.isDeal ? product.discountPrice : `$${product.daily}/day` },
                          { label: 'Monthly', val: `$${product.monthly}/mo` },
                        ].map((r) => (
                          <div key={r.label} className="text-center bg-ivory rounded border border-slate/10 py-2">
                            <p className="text-[10px] text-slate uppercase font-semibold mb-0.5">{r.label}</p>
                            <p className={`text-sm font-bold font-currency ${product.isDeal && r.label === 'Daily' ? 'text-red-600' : 'text-navy'}`}>
                              {r.val}
                            </p>
                          </div>
                        ))}
                      </div>
                      <Link
                        href={`/browse/${product.id}`}
                        className={`${product.status === 'booked' ? 'btn-secondary' : 'btn-primary'} w-full text-xs py-2.5 flex items-center justify-center gap-1.5`}
                      >
                        <span className="material-symbols-outlined shrink-0" style={{ fontSize: '16px' }}>calendar_month</span>
                        <span>{product.status === 'booked' ? 'View Details' : 'Check Availability'}</span>
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* Pagination from Mockup */}
        {totalPages > 1 && (
          <div className="mt-8 flex justify-center items-center gap-1">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="p-2 rounded hover:bg-navy/5 text-slate transition-colors disabled:opacity-30 flex items-center justify-center">
              <span className="material-symbols-outlined shrink-0" style={{ fontSize: '20px' }}>chevron_left</span>
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-9 h-9 rounded text-sm font-semibold transition-colors flex items-center justify-center ${p === page ? 'bg-amber text-white' : 'hover:bg-navy/5 text-slate'}`}
              >
                {p}
              </button>
            ))}
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-2 rounded hover:bg-navy/5 text-slate transition-colors disabled:opacity-30 flex items-center justify-center">
              <span className="material-symbols-outlined shrink-0" style={{ fontSize: '20px' }}>chevron_right</span>
            </button>
          </div>
        )}
      </section>
    </div>
  );
}

export default function BrowsePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-ivory/40 flex items-center justify-center"><div className="w-8 h-8 rounded-full border-4 border-amber border-t-transparent animate-spin" /></div>}>
      <BrowseContent />
    </Suspense>
  );
}
