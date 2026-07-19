'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import type { Product } from '@/lib/types';

type ProductForm = {
  name: string; brand: string; sku: string; category: string;
  rate: string; deposit: string; quantity: string; status: string; image: string;
};

const EMPTY_FORM: ProductForm = { name: '', brand: '', sku: '', category: 'Furniture', rate: '', deposit: '', quantity: '1', status: 'available', image: '' };

// Keyword-based real-image lookup — no API key/infra required. Best-effort:
// if the keyword match is poor or the service is unreachable, the modal's
// <img onError> swaps in a neutral placeholder rather than a broken icon.
function imageKeywords(name: string, category: string): string {
  const words = name.toLowerCase().replace(/[^a-z\s]/g, ' ').split(/\s+/).filter(Boolean).slice(0, 3);
  const cat = category.toLowerCase().replace(/[^a-z\s]/g, '').split(/\s+/).filter(Boolean)[0];
  const tags = [...words, cat].filter(Boolean);
  return (tags.length ? tags : ['equipment']).map(encodeURIComponent).join(',');
}
function suggestedImageUrl(name: string, category: string, nonce: number): string {
  return `https://loremflickr.com/480/360/${imageKeywords(name, category)}?v=${nonce}`;
}

function toCsvValue(v: string | number): string {
  const s = String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}
function downloadBlob(content: string, filename: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selected, setSelected] = useState<number[]>([]);
  const [modalProduct, setModalProduct] = useState<Product | 'new' | null>(null);
  const [form, setForm] = useState<ProductForm>(EMPTY_FORM);
  const [page, setPage] = useState(1);
  const PER_PAGE = 5;

  const load = useCallback(() => {
    setLoading(true);
    fetch('/api/products?all=1')
      .then((r) => r.json())
      .then((data: Product[]) => setProducts(data))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

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

  const deleteSelected = async () => {
    await Promise.all(selected.map((id) => fetch(`/api/products/${id}`, { method: 'DELETE' })));
    setSelected([]);
    load();
  };

  const deleteOne = async (id: number) => {
    await fetch(`/api/products/${id}`, { method: 'DELETE' });
    load();
  };

  const openAdd = () => { setForm(EMPTY_FORM); setModalProduct('new'); };
  const openEdit = (p: Product) => {
    setForm({ name: p.name, brand: p.brand, sku: p.sku, category: p.category, rate: String(p.daily), deposit: String(p.deposit), quantity: String(p.quantity), status: p.status, image: p.image });
    setModalProduct(p);
  };
  const closeModal = () => setModalProduct(null);

  const saveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const body = {
      name: form.name,
      brand: form.brand,
      sku: form.sku,
      category: form.category,
      status: form.status,
      daily: parseFloat(form.rate) || 0,
      deposit: parseFloat(form.deposit) || 0,
      quantity: parseInt(form.quantity) || 1,
      image: form.image,
    };
    const isEdit = modalProduct && modalProduct !== 'new';
    await fetch(isEdit ? `/api/products/${modalProduct.id}` : '/api/products', {
      method: isEdit ? 'PUT' : 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    });
    setSaving(false);
    setModalProduct(null);
    load();
  };

  const exportCsv = () => {
    const header = ['ID', 'Name', 'Brand', 'SKU', 'Category', 'Status', 'Daily Rate', 'Deposit', 'Quantity'];
    const rows = filtered.map((p) => [p.id, p.name, p.brand, p.sku, p.category, p.status, p.daily, p.deposit, p.quantity]);
    const csv = [header, ...rows].map((r) => r.map(toCsvValue).join(',')).join('\n');
    downloadBlob(csv, `rentora-products-${new Date().toISOString().slice(0, 10)}.csv`, 'text/csv');
  };

  const statusBadge = (s: string) => s === 'available' ? 'badge-green' : s === 'draft' ? 'badge-amber' : s === 'low-stock' ? 'badge-amber' : s === 'booked' ? 'badge-red' : 'badge-slate';
  const statusLabel = (s: string) => ({ available: 'Available', draft: 'Draft', 'low-stock': 'Low Stock', booked: 'Booked' } as Record<string, string>)[s] || s;

  const statusCounts = products.reduce((acc, p) => { acc[p.status] = (acc[p.status] || 0) + 1; return acc; }, {} as Record<string, number>);
  const totalUnits = products.reduce((s, p) => s + p.quantity, 0);

  return (
    <div className="p-6 md:p-8 max-w-[1440px] relative">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-slate/10 -mx-6 md:-mx-8 -mt-6 md:-mt-8 px-6 md:px-8 py-4 mb-6 z-10 flex items-center justify-between">
        <div>
          <h1 className="text-h2 text-navy">Product Catalog</h1>
          <p className="text-slate text-xs mt-0.5">Manage inventory, variants, and rental pricing.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={exportCsv} disabled={filtered.length === 0} className="btn-secondary text-xs py-2 px-4 disabled:opacity-40">
            <span className="material-symbols-outlined" style={{fontSize:'16px'}}>download</span>
            Export CSV
          </button>
          <button onClick={openAdd} className="btn-primary text-xs py-2 px-4">
            <span className="material-symbols-outlined" style={{fontSize:'16px'}}>add</span>
            Add Product
          </button>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="card p-4 mb-5 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[220px]">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate/50" style={{fontSize:'18px'}}>search</span>
          <input type="text" placeholder="Search products, SKUs, brands..." value={search} onChange={(e) => setSearch(e.target.value)} className="input-field pl-9 text-sm" />
        </div>
        <div className="flex gap-2">
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="input-field text-sm py-2.5 w-auto">
            <option value="all">All Categories</option>
            {Array.from(new Set(products.map((p) => p.category))).map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input-field text-sm py-2.5 w-auto">
            <option value="all">All Status</option>
            <option value="available">Available</option>
            <option value="low-stock">Low Stock</option>
            <option value="booked">Booked</option>
            <option value="draft">Draft</option>
          </select>
        </div>
        {selected.length > 0 && (
          <button onClick={deleteSelected} className="btn-danger text-xs py-2 px-3 ml-auto">
            <span className="material-symbols-outlined" style={{fontSize:'16px'}}>delete</span>
            Delete ({selected.length})
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
                  <th className="table-header hidden md:table-cell">Category</th>
                  <th className="table-header text-right">Daily Rate</th>
                  <th className="table-header text-center">Status</th>
                  <th className="table-header w-16"></th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} className="text-center p-12 text-slate text-sm">Loading inventory…</td></tr>
                ) : paginated.length === 0 ? (
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
                          {product.image
                            ? <img src={product.image} alt={product.name} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                            : <span className="material-symbols-outlined text-slate w-full h-full flex items-center justify-center" style={{fontSize:'20px'}}>image_not_supported</span>
                          }
                        </div>
                        <div>
                          <p className="font-semibold text-navy text-sm">{product.name}</p>
                          <p className="text-slate text-xs">{product.brand} • {product.sku}</p>
                        </div>
                      </div>
                    </td>
                    <td className="table-cell hidden md:table-cell">
                      <span className="px-2 py-0.5 rounded bg-surface-container text-[11px] text-navy">{product.category}</span>
                    </td>
                    <td className="table-cell text-right font-currency font-medium text-navy">₹{product.daily.toLocaleString()}/day</td>
                    <td className="table-cell text-center"><span className={statusBadge(product.status)}>{statusLabel(product.status)}</span></td>
                    <td className="table-cell opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="flex items-center gap-1 justify-end">
                        <button onClick={() => openEdit(product)} title="Edit" className="text-slate hover:text-amber transition-colors p-1">
                          <span className="material-symbols-outlined" style={{fontSize:'18px'}}>edit</span>
                        </button>
                        <button onClick={() => deleteOne(product.id)} title="Delete" className="text-slate hover:text-red-500 transition-colors p-1">
                          <span className="material-symbols-outlined" style={{fontSize:'18px'}}>delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="p-4 border-t border-slate/10 flex items-center justify-between bg-ivory">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="btn-ghost text-xs py-1.5 px-3 disabled:opacity-30">
                <span className="material-symbols-outlined" style={{fontSize:'16px'}}>chevron_left</span> Prev
              </button>
              <div className="flex gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button key={p} onClick={() => setPage(p)} className={`w-8 h-8 rounded text-sm font-semibold transition-colors ${p === page ? 'bg-navy text-white' : 'hover:bg-surface-high text-navy'}`}>{p}</button>
                ))}
              </div>
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="btn-ghost text-xs py-1.5 px-3 disabled:opacity-30">
                Next <span className="material-symbols-outlined" style={{fontSize:'16px'}}>chevron_right</span>
              </button>
            </div>
          )}
        </div>

        {/* Right Sidebar */}
        <div className="space-y-5">
          {/* Catalog Summary — real numbers computed from the live catalog */}
          <div className="card p-5 rounded-xl border-l-4 border-l-navy">
            <h3 className="text-sm font-semibold text-navy mb-1 flex items-center gap-2">
              <span className="material-symbols-outlined text-amber" style={{fontSize:'20px'}}>inventory_2</span>
              Catalog Summary
            </h3>
            <p className="text-slate text-xs mb-4">Live counts from your current inventory.</p>
            <div className="space-y-2.5">
              <div className="flex justify-between items-center p-3 rounded-lg border border-slate/10 bg-ivory">
                <span className="text-sm font-semibold text-navy">Total Products</span>
                <span className="text-navy font-bold font-currency">{products.length}</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg border border-slate/10 bg-ivory">
                <span className="text-sm font-semibold text-navy">Total Units</span>
                <span className="text-navy font-bold font-currency">{totalUnits}</span>
              </div>
              {(['available', 'low-stock', 'booked', 'draft'] as const).map((s) => (
                <div key={s} className="flex justify-between items-center px-3 py-2">
                  <span className={statusBadge(s)}>{statusLabel(s)}</span>
                  <span className="text-navy text-sm font-semibold">{statusCounts[s] || 0}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Add/Edit Product Modal — rendered via portal so it always overlays the full viewport */}
      {modalProduct && (
        <ProductModal
          isEdit={modalProduct !== 'new'}
          onClose={closeModal}
          onSubmit={saveProduct}
          saving={saving}
          form={form}
          setForm={setForm}
        />
      )}
    </div>
  );
}

/* ── Add/Edit Product Modal rendered via portal so it always sits on top of
   the admin layout without being clipped by any parent stacking context ── */
function ProductModal({
  isEdit,
  onClose,
  onSubmit,
  saving,
  form,
  setForm,
}: {
  isEdit: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  saving: boolean;
  form: ProductForm;
  setForm: React.Dispatch<React.SetStateAction<ProductForm>>;
}) {
  // Guard: only render portal after client-side hydration
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  // Real-time image suggestion: debounce on name/category, skip once the
  // admin has typed their own Image URL.
  const [imageTouched, setImageTouched] = useState(isEdit && !!form.image);
  const [nonce, setNonce] = useState(0);
  const [previewBroken, setPreviewBroken] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (imageTouched || !form.name.trim()) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setPreviewBroken(false);
      setForm((f) => ({ ...f, image: suggestedImageUrl(f.name, f.category, nonce) }));
    }, 500);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.name, form.category, imageTouched, nonce]);

  const regenerate = () => { setImageTouched(false); setPreviewBroken(false); setNonce((n) => n + 1); };

  if (!mounted) return null;

  return createPortal(
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        backgroundColor: 'rgba(0,0,0,0.5)',
      }}
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        style={{
          background: '#fff',
          borderRadius: '16px',
          boxShadow: '0 25px 60px rgba(0,0,0,0.3)',
          width: '100%',
          maxWidth: '480px',
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Modal header */}
        <div className="flex justify-between items-center px-6 pt-6 pb-4 border-b border-slate/10">
          <h2 className="text-h3 text-navy">{isEdit ? 'Edit Product' : 'Add Product'}</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-high text-slate hover:text-navy transition-colors"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>close</span>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={onSubmit} className="px-6 py-5 space-y-4">
          {/* Product Name */}
          <div>
            <label className="block text-xs font-semibold text-slate uppercase tracking-wide mb-1.5">
              Product Name <span className="text-amber">*</span>
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="input-field text-sm"
              required
              placeholder="e.g. Ergonomic Chair"
            />
          </div>

          {/* Brand + SKU */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate uppercase tracking-wide mb-1.5">
                Brand <span className="text-amber">*</span>
              </label>
              <input
                type="text"
                value={form.brand}
                onChange={(e) => setForm({ ...form, brand: e.target.value })}
                className="input-field text-sm"
                required
                placeholder="Brand name"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate uppercase tracking-wide mb-1.5">
                SKU <span className="text-amber">*</span>
              </label>
              <input
                type="text"
                value={form.sku}
                onChange={(e) => setForm({ ...form, sku: e.target.value })}
                className="input-field text-sm"
                required
                placeholder="ABC-001"
              />
            </div>
          </div>

          {/* Category + Daily Rate */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate uppercase tracking-wide mb-1.5">Category</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="input-field text-sm"
              >
                <option>Furniture</option>
                <option>Electronics</option>
                <option>Heavy Machinery</option>
                <option>Power</option>
                <option>Warehouse</option>
                <option>Scaffolding</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate uppercase tracking-wide mb-1.5">Daily Rate (₹)</label>
              <input
                type="number"
                value={form.rate}
                onChange={(e) => setForm({ ...form, rate: e.target.value })}
                className="input-field text-sm"
                placeholder="0.00"
                min="0"
              />
            </div>
          </div>

          {/* Deposit + Units */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate uppercase tracking-wide mb-1.5">Deposit (₹)</label>
              <input
                type="number"
                value={form.deposit}
                onChange={(e) => setForm({ ...form, deposit: e.target.value })}
                className="input-field text-sm"
                placeholder="0.00"
                min="0"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate uppercase tracking-wide mb-1.5">Units Owned</label>
              <input
                type="number"
                value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                className="input-field text-sm"
                placeholder="1"
                min="1"
              />
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-xs font-semibold text-slate uppercase tracking-wide mb-1.5">Status</label>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              className="input-field text-sm"
            >
              <option value="available">Available</option>
              <option value="low-stock">Low Stock</option>
              <option value="draft">Draft</option>
            </select>
          </div>

          {/* Image */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate uppercase tracking-wide">Image URL</label>
              <button type="button" onClick={regenerate} className="text-[11px] text-amber font-semibold hover:underline flex items-center gap-1">
                <span className="material-symbols-outlined" style={{ fontSize: '13px' }}>refresh</span>
                Suggest image
              </button>
            </div>
            <div className="flex gap-3 items-start">
              <div className="w-16 h-16 rounded-lg bg-surface-high flex-shrink-0 overflow-hidden border border-slate/10 flex items-center justify-center">
                {form.image && !previewBroken ? (
                  <img src={form.image} alt="" className="w-full h-full object-cover" onError={() => setPreviewBroken(true)} />
                ) : (
                  <span className="material-symbols-outlined text-slate/40" style={{ fontSize: '22px' }}>image</span>
                )}
              </div>
              <div className="flex-1">
                <input
                  type="text"
                  value={form.image}
                  onChange={(e) => { setImageTouched(true); setPreviewBroken(false); setForm({ ...form, image: e.target.value }); }}
                  className="input-field text-sm"
                  placeholder="https://... or leave blank to auto-suggest"
                />
                <p className="text-[11px] text-slate mt-1 leading-relaxed">
                  {imageTouched ? 'Using your custom image.' : 'Auto-suggested from the product name — edit or click Suggest image for another.'}
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2 pb-1">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary flex-1 py-2.5"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="btn-primary flex-1 py-2.5"
            >
              {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Add Product'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
