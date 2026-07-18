'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import Link from 'next/link';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

interface Address {
  id: number;
  full_name: string;
  phone: string | null;
  address_line1: string;
  address_line2: string | null;
  city: string;
  state: string | null;
  postal_code: string | null;
  country: string;
  is_default: boolean;
}

const empty = (): Omit<Address, 'id' | 'is_default'> => ({
  full_name: '', phone: '', address_line1: '', address_line2: '',
  city: '', state: '', postal_code: '', country: 'India',
});

export default function AddressesPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState(empty());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAuthenticated) { router.push('/login?redirect=/addresses'); return; }
    fetchAddresses();
  }, [isAuthenticated]);

  const getToken = () => typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

  const fetchAddresses = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/addresses/`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (res.ok) setAddresses(await res.json());
    } catch {}
    setLoading(false);
  };

  const openNew = () => { setForm(empty()); setEditId(null); setShowForm(true); setError(''); };
  const openEdit = (addr: Address) => {
    setForm({ full_name: addr.full_name, phone: addr.phone || '', address_line1: addr.address_line1, address_line2: addr.address_line2 || '', city: addr.city, state: addr.state || '', postal_code: addr.postal_code || '', country: addr.country });
    setEditId(addr.id);
    setShowForm(true);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSaving(true);
    try {
      const url = editId ? `${API_BASE}/addresses/${editId}` : `${API_BASE}/addresses/`;
      const method = editId ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Save failed');
      setShowForm(false); fetchAddresses();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Save failed');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this address?')) return;
    await fetch(`${API_BASE}/addresses/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    fetchAddresses();
  };

  const handleSetDefault = async (id: number) => {
    await fetch(`${API_BASE}/addresses/${id}/default`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    fetchAddresses();
  };

  return (
    <div className="min-h-screen bg-ivory/40 py-10 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-navy">Saved Addresses</h1>
            <p className="text-sm text-slate mt-0.5">Manage your delivery and billing addresses</p>
          </div>
          <button onClick={openNew} className="btn-primary py-2 px-4 text-xs">+ Add Address</button>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-600 text-xs p-3.5 rounded-xl">{error}</div>
        )}

        {/* Form */}
        {showForm && (
          <div className="card mb-6">
            <h3 className="font-bold text-navy mb-4 text-sm">{editId ? 'Edit Address' : 'New Address'}</h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate uppercase tracking-wider mb-1">Full Name</label>
                  <input type="text" value={form.full_name} onChange={(e) => setForm({...form, full_name: e.target.value})} required
                    className="w-full px-3 py-2 text-xs border border-slate/20 rounded-xl bg-ivory/30 outline-none focus:border-amber" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate uppercase tracking-wider mb-1">Phone</label>
                  <input type="tel" value={form.phone || ''} onChange={(e) => setForm({...form, phone: e.target.value})}
                    className="w-full px-3 py-2 text-xs border border-slate/20 rounded-xl bg-ivory/30 outline-none focus:border-amber" />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate uppercase tracking-wider mb-1">Address Line 1</label>
                <input type="text" value={form.address_line1} onChange={(e) => setForm({...form, address_line1: e.target.value})} required
                  className="w-full px-3 py-2 text-xs border border-slate/20 rounded-xl bg-ivory/30 outline-none focus:border-amber" />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate uppercase tracking-wider mb-1">Address Line 2 (optional)</label>
                <input type="text" value={form.address_line2 || ''} onChange={(e) => setForm({...form, address_line2: e.target.value})}
                  className="w-full px-3 py-2 text-xs border border-slate/20 rounded-xl bg-ivory/30 outline-none focus:border-amber" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate uppercase tracking-wider mb-1">City</label>
                  <input type="text" value={form.city} onChange={(e) => setForm({...form, city: e.target.value})} required
                    className="w-full px-3 py-2 text-xs border border-slate/20 rounded-xl bg-ivory/30 outline-none focus:border-amber" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate uppercase tracking-wider mb-1">State</label>
                  <input type="text" value={form.state || ''} onChange={(e) => setForm({...form, state: e.target.value})}
                    className="w-full px-3 py-2 text-xs border border-slate/20 rounded-xl bg-ivory/30 outline-none focus:border-amber" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate uppercase tracking-wider mb-1">PIN Code</label>
                  <input type="text" value={form.postal_code || ''} onChange={(e) => setForm({...form, postal_code: e.target.value})}
                    className="w-full px-3 py-2 text-xs border border-slate/20 rounded-xl bg-ivory/30 outline-none focus:border-amber" />
                </div>
              </div>
              <div className="flex gap-3 pt-1">
                <button type="submit" disabled={saving} className="btn-primary flex-1 py-2.5 text-xs">
                  {saving ? 'Saving...' : editId ? 'Update Address' : 'Save Address'}
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-2.5 text-xs border border-slate/20 rounded-xl text-slate hover:bg-slate/5">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Address list */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <span className="material-symbols-outlined animate-spin text-amber" style={{ fontSize: '32px' }}>refresh</span>
          </div>
        ) : addresses.length === 0 ? (
          <div className="card text-center py-14">
            <span className="material-symbols-outlined text-slate/30 mb-3 block" style={{ fontSize: '48px' }}>location_on</span>
            <p className="font-bold text-navy mb-1">No saved addresses</p>
            <p className="text-xs text-slate">Add an address to speed up checkout.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {addresses.map((addr) => (
              <div key={addr.id} className={`card ${addr.is_default ? 'border-amber/40 bg-amber/5' : ''}`}>
                <div className="flex items-start justify-between">
                  <div className="text-sm">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-navy">{addr.full_name}</span>
                      {addr.is_default && (
                        <span className="text-[10px] bg-amber/20 text-amber-700 font-semibold px-2 py-0.5 rounded-full">Default</span>
                      )}
                    </div>
                    {addr.phone && <p className="text-xs text-slate mb-0.5">{addr.phone}</p>}
                    <p className="text-xs text-slate">{addr.address_line1}{addr.address_line2 ? `, ${addr.address_line2}` : ''}</p>
                    <p className="text-xs text-slate">{addr.city}{addr.state ? `, ${addr.state}` : ''} {addr.postal_code}</p>
                    <p className="text-xs text-slate">{addr.country}</p>
                  </div>
                  <div className="flex gap-1.5 shrink-0 ml-3">
                    <button onClick={() => openEdit(addr)} className="p-1.5 text-slate hover:text-navy hover:bg-slate/10 rounded-lg transition-all">
                      <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>edit</span>
                    </button>
                    <button onClick={() => handleDelete(addr.id)} className="p-1.5 text-slate hover:text-red-600 hover:bg-red-50 rounded-lg transition-all">
                      <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>delete</span>
                    </button>
                  </div>
                </div>
                {!addr.is_default && (
                  <button onClick={() => handleSetDefault(addr.id)}
                    className="mt-3 text-[11px] font-semibold text-amber hover:underline">
                    Set as default
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
