'use client';
import Link from 'next/link';
import { useState } from 'react';

const products = [
  { id: 1, title: 'CAT 320 Excavator', desc: 'Standard heavy-duty excavator suitable for large scale earthmoving and construction projects.', status: 'available', category: 'Heavy Machinery', brand: 'Caterpillar', hourly: 85, daily: 650, weekly: 3200, img: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&q=80' },
  { id: 2, title: 'Toyota Forklift 8FGU25', desc: 'Versatile indoor/outdoor warehouse lift with 5,000 lb capacity and pneumatic tires.', status: 'low-stock', category: 'Power Tools', brand: 'Komatsu', hourly: 45, daily: 280, weekly: 1150, img: 'https://images.unsplash.com/photo-1605731009813-8e0a0b2c2f4b?w=600&q=80' },
  { id: 3, title: 'Industrial Generator 50kW', desc: 'Portable 50kW diesel generator for remote site power needs. Reliable, fuel efficient.', status: 'available', category: 'Heavy Machinery', brand: 'Caterpillar', hourly: 0, daily: 150, weekly: 600, img: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=600&q=80' },
  { id: 4, title: 'Concrete Mixer 350L', desc: 'High-capacity drum mixer for ready-mix concrete preparation on commercial sites.', status: 'available', category: 'Scaffolding', brand: 'Komatsu', hourly: 25, daily: 120, weekly: 500, img: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&q=80' },
  { id: 5, title: 'Aerial Work Platform', desc: 'Self-propelled scissor lift, 30 ft reach, electric powered for indoor use.', status: 'booked', category: 'Scaffolding', brand: 'Caterpillar', hourly: 60, daily: 400, weekly: 1800, img: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80' },
  { id: 6, title: 'Telehandler JCB 535', desc: 'Versatile 3.5 tonne reach truck with 5.5m lift height, ideal for farm and construction.', status: 'available', category: 'Heavy Machinery', brand: 'Komatsu', hourly: 70, daily: 480, weekly: 2100, img: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&q=80' },
];

const statusMap: Record<string, { label: string; cls: string }> = {
  available: { label: 'AVAILABLE', cls: 'badge-green text-[10px]' },
  'low-stock': { label: 'LOW STOCK', cls: 'badge-amber text-[10px]' },
  booked: { label: 'BOOKED', cls: 'badge-red text-[10px]' },
};

export default function BrowsePage() {
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('recommended');
  const [selectedCats, setSelectedCats] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [page, setPage] = useState(1);
  const PER_PAGE = 6;

  const toggleCat = (cat: string) => setSelectedCats((prev) => prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]);
  const toggleBrand = (brand: string) => setSelectedBrands((prev) => prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]);

  const filtered = products.filter((p) => {
    const matchSearch = p.title.toLowerCase().includes(search.toLowerCase());
    const matchCat = selectedCats.length === 0 || selectedCats.includes(p.category);
    const matchBrand = selectedBrands.length === 0 || selectedBrands.includes(p.brand);
    const matchMin = !minPrice || p.daily >= parseInt(minPrice);
    const matchMax = !maxPrice || p.daily <= parseInt(maxPrice);
    return matchSearch && matchCat && matchBrand && matchMin && matchMax;
  }).sort((a, b) => {
    if (sort === 'price-asc') return a.daily - b.daily;
    if (sort === 'price-desc') return b.daily - a.daily;
    return 0;
  });

  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const totalPages = Math.ceil(filtered.length / PER_PAGE);

  return (
    <div className="max-w-[1440px] mx-auto px-6 py-8 flex flex-col md:flex-row gap-6">
      {/* Filters Sidebar */}
      <aside className="w-full md:w-64 flex-shrink-0">
        <div className="card p-5 sticky top-24">
          <div className="flex justify-between items-center mb-4 pb-4 border-b border-slate/10">
            <h3 className="font-semibold text-navy text-sm">Filters</h3>
            <button
              onClick={() => { setSelectedCats([]); setSelectedBrands([]); setMinPrice(''); setMaxPrice(''); }}
              className="text-xs text-amber hover:underline font-medium"
            >
              Clear All
            </button>
          </div>

          {/* Category */}
          <div className="mb-5">
            <h4 className="text-xs font-semibold text-slate uppercase tracking-wide mb-3">Category</h4>
            <div className="space-y-2">
              {['Heavy Machinery', 'Power Tools', 'Scaffolding'].map((cat) => (
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

          {/* Price Range */}
          <div className="mb-5">
            <h4 className="text-xs font-semibold text-slate uppercase tracking-wide mb-3">Daily Price Range</h4>
            <div className="flex items-center gap-2">
              <input type="number" placeholder="Min" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} className="input-field text-xs py-2 px-2" />
              <span className="text-slate">—</span>
              <input type="number" placeholder="Max" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} className="input-field text-xs py-2 px-2" />
            </div>
          </div>

          {/* Brand */}
          <div className="mb-5">
            <h4 className="text-xs font-semibold text-slate uppercase tracking-wide mb-3">Brand</h4>
            <div className="space-y-2">
              {['Caterpillar', 'Komatsu'].map((brand) => (
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

          <button className="btn-primary w-full text-sm py-2.5">Apply Filters</button>
        </div>
      </aside>

      {/* Product Grid */}
      <section className="flex-1 min-w-0">
        {/* Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-5">
          <div>
            <h1 className="text-h2 text-navy">Available Rentals</h1>
            <p className="text-slate text-xs mt-0.5">{filtered.length} items found</p>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-none">
              <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-slate/50 shrink-0" style={{fontSize:'16px'}}>search</span>
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
            <button onClick={() => { setSelectedCats([]); setSelectedBrands([]); setSearch(''); }} className="btn-ghost mt-3">Clear filters</button>
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
                  </div>
                  <div className="p-5 flex-1 flex flex-col">
                    <h2 className="font-semibold text-navy text-sm mb-1 leading-snug">{product.title}</h2>
                    <p className="text-slate text-xs leading-relaxed mb-4 line-clamp-2">{product.desc}</p>
                    <div className="mt-auto">
                      <div className="grid grid-cols-3 gap-1 mb-4">
                        {[{ label: 'Hourly', val: product.hourly ? `$${product.hourly}` : '—' }, { label: 'Daily', val: `$${product.daily}` }, { label: 'Weekly', val: `$${product.weekly}` }].map((r) => (
                          <div key={r.label} className="text-center bg-ivory rounded border border-slate/10 py-2">
                            <p className="text-[10px] text-slate uppercase font-semibold mb-0.5">{r.label}</p>
                            <p className="text-navy text-sm font-bold font-currency">{r.val}</p>
                          </div>
                        ))}
                      </div>
                      <Link
                        href={`/browse/${product.id}`}
                        className={`${product.status === 'booked' ? 'btn-secondary' : 'btn-primary'} w-full text-xs py-2.5 flex items-center justify-center gap-1.5`}
                      >
                        <span className="material-symbols-outlined shrink-0" style={{fontSize:'16px'}}>calendar_month</span>
                        <span>{product.status === 'booked' ? 'View Details' : 'Check Availability'}</span>
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 flex justify-center items-center gap-1">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="p-2 rounded hover:bg-navy/5 text-slate transition-colors disabled:opacity-30 flex items-center justify-center">
              <span className="material-symbols-outlined shrink-0" style={{fontSize:'20px'}}>chevron_left</span>
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
              <span className="material-symbols-outlined shrink-0" style={{fontSize:'20px'}}>chevron_right</span>
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
