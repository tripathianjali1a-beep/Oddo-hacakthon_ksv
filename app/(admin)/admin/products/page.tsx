'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

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

const initialAttributes = [
  { id: 1, name: 'Attributes', displayType: 'Radio' },
  { id: 2, name: 'Brand', displayType: 'Radio' },
  { id: 3, name: 'Color', displayType: 'Pills' },
];

function ProductsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tabParam = searchParams.get('tab') || 'catalog';
  const [activeTab, setActiveTab] = useState<'catalog' | 'attributes' | 'pricelist'>(
    tabParam === 'attributes' ? 'attributes' : tabParam === 'pricelist' ? 'pricelist' : 'catalog'
  );

  useEffect(() => {
    const t = searchParams.get('tab');
    if (t === 'attributes') setActiveTab('attributes');
    else if (t === 'pricelist') setActiveTab('pricelist');
    else setActiveTab('catalog');
  }, [searchParams]);

  const [products, setProducts] = useState(initialProducts);
  const [attributesList, setAttributesList] = useState(initialAttributes);
  const [attrSearch, setAttrSearch] = useState('');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selected, setSelected] = useState<number[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: '', brand: '', sku: '', category: 'Furniture', rate: '', status: 'active' });
  const [page, setPage] = useState(1);
  const [toast, setToast] = useState<string | null>(null);
  const PER_PAGE = 5;

  const triggerToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

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
    triggerToast(`Product '${newProduct.name}' added to inventory.`);
  };

  const statusBadge = (s: string) => s === 'active' ? 'badge-green' : s === 'draft' ? 'badge-amber' : 'badge-slate';

  return (
    <div className="p-6 md:p-8 max-w-[1440px] relative space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-navy text-white px-5 py-3.5 rounded-xl shadow-2xl border border-amber/30 flex items-center gap-3 animate-slide-up">
          <span className="material-symbols-outlined shrink-0 text-amber" style={{ fontSize: '20px' }}>check_circle</span>
          <span className="text-sm font-semibold">{toast}</span>
        </div>
      )}

      {/* Header and Top Navigation Tabs */}
      <div className="sticky top-0 bg-white border-b border-slate/10 -mx-6 md:-mx-8 -mt-6 md:-mt-8 px-6 md:px-8 py-4 mb-6 z-10 space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-h2 text-navy">Product & Attribute Management</h1>
            <p className="text-slate text-xs mt-0.5">Manage catalog items, attribute swatches, and rental price lists.</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => triggerToast('Exporting active table data to CSV... Check your downloads.')}
              className="btn-secondary text-xs py-2 px-4 flex items-center justify-center gap-1.5"
            >
              <span className="material-symbols-outlined shrink-0" style={{fontSize:'16px'}}>download</span>
              <span>Export CSV</span>
            </button>
            {activeTab === 'catalog' && (
              <button onClick={() => setShowAddModal(true)} className="btn-primary text-xs py-2 px-4 flex items-center justify-center gap-1.5">
                <span className="material-symbols-outlined shrink-0" style={{fontSize:'16px'}}>add</span>
                <span>Add Product</span>
              </button>
            )}
            {activeTab === 'attributes' && (
              <button
                onClick={() => {
                  setAttributesList([...attributesList, { id: Date.now(), name: 'New Custom Attribute', displayType: 'Pills' }]);
                  triggerToast('Added new attribute row.');
                }}
                className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold py-2 px-4 rounded-lg flex items-center gap-1.5 shadow-sm"
              >
                <span className="material-symbols-outlined shrink-0" style={{fontSize:'16px'}}>add</span>
                <span>New Attribute</span>
              </button>
            )}
          </div>
        </div>

        {/* Tab Switcher: [ Products Catalog ] [ Attributes ] [ Price list ] */}
        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={() => { setActiveTab('catalog'); router.push('/admin/products?tab=catalog'); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'catalog' ? 'bg-navy text-white shadow-sm' : 'text-slate hover:bg-slate/10 hover:text-navy'
            }`}
          >
            Products Catalog
          </button>
          <button
            onClick={() => { setActiveTab('attributes'); router.push('/admin/products?tab=attributes'); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'attributes' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate hover:bg-slate/10 hover:text-navy'
            }`}
          >
            Attributes
          </button>
          <button
            onClick={() => { setActiveTab('pricelist'); router.push('/admin/products?tab=pricelist'); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'pricelist' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate hover:bg-slate/10 hover:text-navy'
            }`}
          >
            Price list
          </button>
        </div>
      </div>

      {/* 1. ATTRIBUTES TAB (Exact matching Image 2 bottom) */}
      {activeTab === 'attributes' && (
        <div className="card p-6 border-slate/15 shadow-md space-y-5 animate-fade-in max-w-4xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate/15">
            <div>
              <h2 className="text-lg font-black text-navy flex items-center gap-2">
                <span className="material-symbols-outlined text-purple-600" style={{ fontSize: '24px' }}>tune</span>
                <span>Attributes</span>
              </h2>
              <p className="text-xs text-slate mt-0.5">Define variant swatches, options, and how they display on the product detail page.</p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setAttributesList([...attributesList, { id: Date.now(), name: 'Size', displayType: 'Radio' }]);
                  triggerToast('Created new attribute entry.');
                }}
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-4 py-1.5 rounded-lg text-xs shadow-sm flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-sm">add</span>
                <span>New</span>
              </button>

              <div className="relative">
                <span className="material-symbols-outlined shrink-0 absolute left-3 top-1/2 -translate-y-1/2 text-slate/40" style={{ fontSize: '18px' }}>search</span>
                <input
                  type="text"
                  placeholder="Search attributes..."
                  value={attrSearch}
                  onChange={(e) => setAttrSearch(e.target.value)}
                  className="pl-9 pr-4 py-1.5 text-xs bg-ivory border border-slate/20 rounded-lg text-navy font-medium outline-none focus:border-purple-500 w-64"
                />
              </div>
            </div>
          </div>

          <div className="border border-slate/20 rounded-xl overflow-hidden bg-white shadow-sm">
            <table className="w-full text-left text-xs font-medium text-navy">
              <thead className="bg-navy text-white text-[11px] uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-6 w-12 text-center">
                    <input type="checkbox" className="rounded border-slate/50" />
                  </th>
                  <th className="py-3.5 px-6 font-bold">Attributes</th>
                  <th className="py-3.5 px-6 font-bold">Display Type</th>
                  <th className="py-3.5 px-6 w-12 text-center"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate/10 bg-white font-semibold text-navy">
                {attributesList
                  .filter((a) => a.name.toLowerCase().includes(attrSearch.toLowerCase()))
                  .map((attr) => (
                    <tr key={attr.id} className="hover:bg-amber/5 transition-colors">
                      <td className="py-4 px-6 text-center">
                        <input type="checkbox" className="rounded border-slate/30 text-purple-600" />
                      </td>
                      <td className="py-4 px-6 font-bold text-sm text-navy">{attr.name}</td>
                      <td className="py-4 px-6">
                        <select
                          value={attr.displayType}
                          onChange={(e) => {
                            setAttributesList(attributesList.map((item) => item.id === attr.id ? { ...item, displayType: e.target.value } : item));
                            triggerToast(`Updated ${attr.name} display type to ${e.target.value}`);
                          }}
                          className="px-3 py-1 bg-ivory border border-slate/20 rounded-lg text-xs font-bold text-purple-700"
                        >
                          <option value="Radio">Radio</option>
                          <option value="Pills">Pills</option>
                          <option value="Dropdown">Dropdown</option>
                          <option value="Color Swatches">Color Swatches</option>
                        </select>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <button
                          type="button"
                          onClick={() => setAttributesList(attributesList.filter((item) => item.id !== attr.id))}
                          className="text-rose-600 hover:text-rose-800"
                          title="Delete Attribute"
                        >
                          <span className="material-symbols-outlined text-sm">delete</span>
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 2. PRICE LIST TAB */}
      {activeTab === 'pricelist' && (
        <div className="card p-6 border-slate/15 shadow-md space-y-5 animate-fade-in max-w-4xl">
          <div className="flex justify-between items-center pb-4 border-b border-slate/15">
            <div>
              <h2 className="text-lg font-black text-navy">Tiered Corporate & Promo Price Lists</h2>
              <p className="text-xs text-slate mt-0.5">Manage volume discounts, duration tiers, and seasonal promotions.</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {pricingRules.map((rule, i) => (
              <div key={i} className="bg-ivory border border-slate/20 rounded-xl p-5 space-y-3 shadow-sm">
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-navy text-sm">{rule.name}</h3>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${rule.active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'}`}>
                    {rule.active ? 'Active' : 'Draft'}
                  </span>
                </div>
                <p className="text-xs text-slate">{rule.desc}</p>
                <button
                  type="button"
                  onClick={() => triggerToast(`Opened configuration for ${rule.name}`)}
                  className="text-xs font-bold text-purple-700 underline"
                >
                  Edit Rule Parameters →
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. PRODUCTS CATALOG TAB */}
      {activeTab === 'catalog' && (
        <div className="space-y-6 animate-fade-in">
          {/* Search & Filters */}
          <div className="card p-4 flex flex-wrap gap-3 items-center">
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
                      <tr><td colSpan={6} className="p-8 text-center text-slate text-sm">No matching inventory items found.</td></tr>
                    ) : (
                      paginated.map((p) => (
                        <tr key={p.id} className="border-b border-slate/10 last:border-0 hover:bg-slate/5 transition-colors">
                          <td className="p-4 text-center">
                            <input type="checkbox" checked={selected.includes(p.id)} onChange={() => toggleSelect(p.id)} className="w-4 h-4 rounded border-slate/30 text-navy focus:ring-amber" />
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <img src={p.img} alt={p.name} className="w-10 h-10 rounded-lg object-cover bg-slate/10 border border-slate/15 shrink-0" />
                              <div>
                                <p className="text-sm font-semibold text-navy">{p.name}</p>
                                <p className="text-xs text-slate font-mono">{p.sku} • {p.brand}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-4 hidden md:table-cell">
                            <div className="flex flex-wrap gap-1">
                              {p.variants.map((v, i) => (
                                <span key={i} className="text-[11px] bg-slate/10 text-slate px-2 py-0.5 rounded-full font-medium">{v}</span>
                              ))}
                            </div>
                          </td>
                          <td className="p-4 text-right">
                            <span className="text-sm font-bold font-currency text-navy">${p.rate}</span>
                          </td>
                          <td className="p-4 text-center">
                            <span className={statusBadge(p.status)}>{p.status}</span>
                          </td>
                          <td className="p-4 text-center">
                            <button onClick={() => triggerToast(`Opening configuration for ${p.name}...`)} className="text-slate hover:text-navy p-1">
                              <span className="material-symbols-outlined" style={{fontSize:'18px'}}>edit</span>
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              {totalPages > 1 && (
                <div className="p-4 border-t border-slate/10 flex justify-between items-center bg-ivory">
                  <button disabled={page === 1} onClick={() => setPage((p) => p - 1)} className="btn-secondary text-xs py-1.5 px-3 disabled:opacity-50">Previous</button>
                  <span className="text-xs text-slate font-medium">Page {page} of {totalPages}</span>
                  <button disabled={page === totalPages} onClick={() => setPage((p) => p + 1)} className="btn-secondary text-xs py-1.5 px-3 disabled:opacity-50">Next</button>
                </div>
              )}
            </div>

            {/* Quick Stats Panel */}
            <div className="space-y-6">
              <div className="card p-5 border-amber/30 shadow-md">
                <h3 className="font-bold text-navy text-sm mb-4 pb-2 border-b border-slate/10">Inventory Summary</h3>
                <div className="space-y-3 text-xs font-semibold">
                  <div className="flex justify-between text-slate"><span>Total SKUs:</span><span className="text-navy font-bold">{products.length}</span></div>
                  <div className="flex justify-between text-slate"><span>Active Leases:</span><span className="text-emerald-600 font-bold">4 Units</span></div>
                  <div className="flex justify-between text-slate"><span>In Inspection:</span><span className="text-amber font-bold">1 Unit</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate/20 space-y-4">
            <h3 className="text-lg font-bold text-navy">Add New Catalog Product</h3>
            <form onSubmit={addProduct} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate uppercase mb-1">Product Name</label>
                <input required type="text" value={newProduct.name} onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })} className="input-field text-sm" placeholder="e.g. Caterpillar 320 Excavator" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate uppercase mb-1">Brand</label>
                  <input required type="text" value={newProduct.brand} onChange={(e) => setNewProduct({ ...newProduct, brand: e.target.value })} className="input-field text-sm" placeholder="e.g. CAT" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate uppercase mb-1">SKU Code</label>
                  <input required type="text" value={newProduct.sku} onChange={(e) => setNewProduct({ ...newProduct, sku: e.target.value })} className="input-field text-sm font-mono" placeholder="CAT-320-01" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate uppercase mb-1">Category</label>
                  <select value={newProduct.category} onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })} className="input-field text-sm py-2 bg-white">
                    <option value="Furniture">Furniture</option>
                    <option value="Electronics">Electronics</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate uppercase mb-1">Base Rate ($/mo)</label>
                  <input required type="number" value={newProduct.rate} onChange={(e) => setNewProduct({ ...newProduct, rate: e.target.value })} className="input-field text-sm" placeholder="120" />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowAddModal(false)} className="btn-secondary text-xs py-2 px-4">Cancel</button>
                <button type="submit" className="btn-primary text-xs py-2 px-6">Save Product</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminProductsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate font-bold">Loading product & attribute tables...</div>}>
      <ProductsContent />
    </Suspense>
  );
}
