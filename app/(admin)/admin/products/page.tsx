'use client';
import { useState } from 'react';

const initialProducts = [
  { id: 1, name: 'Aeron Executive Chair', brand: 'Herman Miller', sku: 'HM-AER-01', variants: ['Graphite', 'Size B'], rate: 45, status: 'active', img: 'https://images.unsplash.com/photo-1541558869434-2840d308329a?w=100&q=80', category: 'Furniture' },
  { id: 2, name: 'Jarvis Standing Desk', brand: 'Fully', sku: 'FUL-JAR-48', variants: ['Bamboo', '48x30'], rate: 60, status: 'active', img: 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=100&q=80', category: 'Furniture' },
  { id: 3, name: 'Lounge Sofa Set', brand: 'West Elm', sku: 'WE-LOU-03', variants: ['Navy Velvet'], rate: 120, status: 'draft', img: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=100&q=80', category: 'Furniture' },
  { id: 4, name: 'Sony A7R V Camera', brand: 'Sony', sku: 'SON-A7R-05', variants: ['Body Only', 'Kit 24-70'], rate: 85, status: 'active', img: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=100&q=80', category: 'Electronics' },
  { id: 5, name: 'DJI Mavic 3 Drone', brand: 'DJI', sku: 'DJI-MAV-3', variants: ['Standard', 'Fly More'], rate: 95, status: 'active', img: 'https://images.unsplash.com/photo-1507582020474-9a35b7d455d9?w=100&q=80', category: 'Electronics' },
];

const pricingRules = [
  { name: 'Summer Promo 24', desc: '-15% on Outdoor (Ends Aug 31)', active: true },
  { name: 'Corporate Bulk Tier 1', desc: 'Wholesale defaults', active: false },
  { name: 'Weekend Flash Sale', desc: '-10% on Electronics', active: true },
];

const rentalPeriods = [
  { n: 1, label: 'Month (Base)', disc: '' },
  { n: 3, label: 'Months', disc: '-5%' },
  { n: 6, label: 'Months', disc: '-10%' },
  { n: 12, label: 'Months', disc: '-20%' },
];

export default function AdminProductsPage() {
  const [products, setProducts] = useState(initialProducts);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selected, setSelected] = useState<number[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: '', brand: '', sku: '', category: 'Furniture', rate: '', status: 'active' });
  const [page, setPage] = useState(1);
  const PER_PAGE = 5;

  const filtered = products.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase()) || p.brand.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === 'all' || p.category === category;
    const matchStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchSearch && matchCat && matchStatus;
  });

  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const totalPages = Math.ceil(filtered.length / PER_PAGE);

  const toggleSelect = (id: number) => setSelected((prev) => prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]);
  const toggleAll = () => setSelected(selected.length === paginated.length ? [] : paginated.map((p) => p.id));

  const deleteSelected = () => {
    setProducts((prev) => prev.filter((p) => !selected.includes(p.id)));
    setSelected([]);
  };

  const addProduct = (e: React.FormEvent) => {
    e.preventDefault();
    setProducts((prev) => [...prev, { ...newProduct, id: Date.now(), variants: [], rate: parseFloat(newProduct.rate) || 0, img: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=100&q=80' }]);
    setNewProduct({ name: '', brand: '', sku: '', category: 'Furniture', rate: '', status: 'active' });
    setShowAddModal(false);
  };

  const statusBadge = (s: string) => s === 'active' ? 'badge-green' : s === 'draft' ? 'badge-amber' : 'badge-slate';

  return (
    <div className="p-6 md:p-8 max-w-[1440px] relative">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-slate/10 -mx-6 md:-mx-8 -mt-6 md:-mt-8 px-6 md:px-8 py-4 mb-6 z-10 flex items-center justify-between">
        <div>
          <h1 className="text-h2 text-navy">Product Catalog</h1>
          <p className="text-slate text-xs mt-0.5">Manage inventory, variants, and rental pricing.</p>
        </div>
        <div className="flex gap-2">
          <button className="btn-secondary text-xs py-2 px-4 flex items-center justify-center gap-1.5">
            <span className="material-symbols-outlined shrink-0" style={{fontSize:'16px'}}>download</span>
            <span>Export CSV</span>
          </button>
          <button onClick={() => setShowAddModal(true)} className="btn-primary text-xs py-2 px-4 flex items-center justify-center gap-1.5">
            <span className="material-symbols-outlined shrink-0" style={{fontSize:'16px'}}>add</span>
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="card p-4 mb-5 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[220px]">
          <span className="material-symbols-outlined shrink-0 absolute left-3 top-1/2 -translate-y-1/2 text-slate/50" style={{fontSize:'18px'}}>search</span>
          <input type="text" placeholder="Search products, SKUs, brands..." value={search} onChange={(e) => setSearch(e.target.value)} className="input-field pl-9 text-sm" />
        </div>
        <div className="flex gap-2">
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="input-field text-sm py-2.5 w-auto">
            <option value="all">All Categories</option>
            <option value="Furniture">Furniture</option>
            <option value="Electronics">Electronics</option>
          </select>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input-field text-sm py-2.5 w-auto">
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="draft">Draft</option>
          </select>
        </div>
        {selected.length > 0 && (
          <button onClick={deleteSelected} className="btn-danger text-xs py-2 px-3 ml-auto flex items-center justify-center gap-1">
            <span className="material-symbols-outlined shrink-0" style={{fontSize:'16px'}}>delete</span>
            <span>Delete ({selected.length})</span>
          </button>
        )}
      </div>

      {/* Bento Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Product Table */}
        <div className="xl:col-span-2 card rounded-xl overflow-hidden flex flex-col">
          <div className="px-5 py-3.5 border-b border-slate/10 flex justify-between items-center bg-ivory">
            <h2 className="text-sm font-semibold text-navy">Inventory List</h2>
            <span className="text-xs text-slate">Showing {Math.min((page - 1) * PER_PAGE + 1, filtered.length)}–{Math.min(page * PER_PAGE, filtered.length)} of {filtered.length}</span>
          </div>
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-ivory/50 border-b border-slate/10">
                  <th className="table-header w-10 text-center">
                    <input type="checkbox" checked={selected.length === paginated.length && paginated.length > 0} onChange={toggleAll} className="w-4 h-4 rounded border-slate/30 text-navy focus:ring-amber" />
                  </th>
                  <th className="table-header">Product & Brand</th>
                  <th className="table-header hidden md:table-cell">Variants</th>
                  <th className="table-header text-right">Base Rate/Mo</th>
                  <th className="table-header text-center">Status</th>
                  <th className="table-header w-8"></th>
                </tr>
              </thead>
              <tbody>
                {paginated.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center p-12 text-slate text-sm">No products match your filters.</td>
                  </tr>
                ) : paginated.map((product) => (
                  <tr key={product.id} className="table-row group">
                    <td className="table-cell text-center">
                      <input type="checkbox" checked={selected.includes(product.id)} onChange={() => toggleSelect(product.id)} className="w-4 h-4 rounded border-slate/30 text-navy focus:ring-amber" />
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-lg bg-surface-high flex-shrink-0 overflow-hidden">
                          {product.img
                            ? <img src={product.img} alt={product.name} className="w-full h-full object-cover" />
                            : <span className="material-symbols-outlined shrink-0 text-slate w-full h-full flex items-center justify-center" style={{fontSize:'20px'}}>image_not_supported</span>
                          }
                        </div>
                        <div>
                          <p className="font-semibold text-navy text-sm">{product.name}</p>
                          <p className="text-slate text-xs">{product.brand} • {product.sku}</p>
                        </div>
                      </div>
                    </td>
                    <td className="table-cell hidden md:table-cell">
                      <div className="flex flex-wrap gap-1">
                        {product.variants.map((v) => (
                          <span key={v} className="px-2 py-0.5 rounded bg-surface-container text-[11px] text-navy">{v}</span>
                        ))}
                        {product.variants.length === 0 && <span className="text-slate text-xs">—</span>}
                      </div>
                    </td>
                    <td className="table-cell text-right font-currency font-medium text-navy">${product.rate}.00</td>
                    <td className="table-cell text-center"><span className={statusBadge(product.status)}>{product.status === 'active' ? 'Active' : 'Draft'}</span></td>
                    <td className="table-cell opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="text-slate hover:text-amber transition-colors flex items-center justify-center">
                        <span className="material-symbols-outlined shrink-0" style={{fontSize:'18px'}}>more_vert</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="p-4 border-t border-slate/10 flex items-center justify-between bg-ivory">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="btn-ghost text-xs py-1.5 px-3 disabled:opacity-30 flex items-center justify-center gap-1">
                <span className="material-symbols-outlined shrink-0" style={{fontSize:'16px'}}>chevron_left</span> <span>Prev</span>
              </button>
              <div className="flex gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button key={p} onClick={() => setPage(p)} className={`w-8 h-8 rounded text-sm font-semibold transition-colors flex items-center justify-center ${p === page ? 'bg-navy text-white' : 'hover:bg-surface-high text-navy'}`}>{p}</button>
                ))}
              </div>
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="btn-ghost text-xs py-1.5 px-3 disabled:opacity-30 flex items-center justify-center gap-1">
                <span>Next</span> <span className="material-symbols-outlined shrink-0" style={{fontSize:'16px'}}>chevron_right</span>
              </button>
            </div>
          )}
        </div>

        {/* Right Sidebar */}
        <div className="space-y-5">
          {/* Pricing Rules */}
          <div className="card p-5 rounded-xl border-l-4 border-l-navy">
            <h3 className="text-sm font-semibold text-navy mb-1 flex items-center gap-2">
              <span className="material-symbols-outlined shrink-0 text-amber" style={{fontSize:'20px'}}>sell</span>
              Pricing Rules Active
            </h3>
            <p className="text-slate text-xs mb-4">Manage current price lists and time-bound overrides.</p>
            <div className="space-y-2.5">
              {pricingRules.map((rule, i) => (
                <div key={i} className={`flex justify-between items-center p-3 rounded-lg border border-slate/10 ${!rule.active ? 'opacity-50' : 'bg-ivory'}`}>
                  <div>
                    <p className="text-sm font-semibold text-navy">{rule.name}</p>
                    <p className="text-xs text-slate">{rule.desc}</p>
                  </div>
                  <span className={`material-symbols-outlined shrink-0 ${rule.active ? 'text-amber' : 'text-slate'}`} style={{fontSize:'24px', fontVariationSettings:"'FILL' 1"}}>
                    {rule.active ? 'toggle_on' : 'toggle_off'}
                  </span>
                </div>
              ))}
            </div>
            <button className="btn-secondary w-full text-xs py-2 mt-4 flex items-center justify-center"><span>Manage Price Lists</span></button>
          </div>

          {/* Rental Periods */}
          <div className="card p-5 rounded-xl">
            <h3 className="text-sm font-semibold text-navy mb-1">Rental Periods</h3>
            <p className="text-xs text-slate mb-4">Standardized durations available for variants.</p>
            <div className="grid grid-cols-2 gap-2">
              {rentalPeriods.map((rp) => (
                <button key={rp.n} className="border border-slate/15 rounded-lg p-3 text-center hover:border-amber transition-all group">
                  <p className="text-navy font-bold text-xl group-hover:text-amber transition-colors">{rp.n}</p>
                  <p className="text-xs text-slate">{rp.label}</p>
                  {rp.disc && <p className="text-[10px] font-semibold text-emerald-600 mt-0.5">{rp.disc}</p>}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-h3 text-navy">Add Product</h2>
              <button onClick={() => setShowAddModal(false)} className="text-slate hover:text-navy flex items-center justify-center">
                <span className="material-symbols-outlined shrink-0" style={{fontSize:'20px'}}>close</span>
              </button>
            </div>
            <form onSubmit={addProduct} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate uppercase tracking-wide mb-1.5">Product Name *</label>
                <input type="text" value={newProduct.name} onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })} className="input-field text-sm" required placeholder="e.g. Ergonomic Chair" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate uppercase tracking-wide mb-1.5">Brand *</label>
                  <input type="text" value={newProduct.brand} onChange={(e) => setNewProduct({ ...newProduct, brand: e.target.value })} className="input-field text-sm" required placeholder="Brand name" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate uppercase tracking-wide mb-1.5">SKU *</label>
                  <input type="text" value={newProduct.sku} onChange={(e) => setNewProduct({ ...newProduct, sku: e.target.value })} className="input-field text-sm" required placeholder="ABC-001" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate uppercase tracking-wide mb-1.5">Category</label>
                  <select value={newProduct.category} onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })} className="input-field text-sm">
                    <option>Furniture</option>
                    <option>Electronics</option>
                    <option>Decor</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate uppercase tracking-wide mb-1.5">Base Rate/Mo ($)</label>
                  <input type="number" value={newProduct.rate} onChange={(e) => setNewProduct({ ...newProduct, rate: e.target.value })} className="input-field text-sm" placeholder="0.00" min="0" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate uppercase tracking-wide mb-1.5">Status</label>
                <select value={newProduct.status} onChange={(e) => setNewProduct({ ...newProduct, status: e.target.value })} className="input-field text-sm">
                  <option value="active">Active</option>
                  <option value="draft">Draft</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowAddModal(false)} className="btn-secondary flex-1 py-2.5 flex items-center justify-center"><span>Cancel</span></button>
                <button type="submit" className="btn-primary flex-1 py-2.5 flex items-center justify-center"><span>Add Product</span></button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
