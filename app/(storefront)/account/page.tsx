'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { clearAuthTokens } from '@/lib/client';
import Link from 'next/link';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export default function AccountPage() {
  const router = useRouter();
  const { user, setUser, logout, isAuthenticated } = useAuthStore();

  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const [fullName, setFullName] = useState(user?.full_name || '');
  const [phone, setPhone] = useState(user?.phone || '');

  // Password change
  const [changingPassword, setChangingPassword] = useState(false);
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/account');
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (user) {
      setFullName(user.full_name || '');
      setPhone(user.phone || '');
    }
  }, [user]);

  const getToken = () => {
    if (typeof window !== 'undefined') return localStorage.getItem('access_token');
    return null;
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSuccess('');
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ full_name: fullName, phone }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Update failed');
      setUser(data);
      setSuccess('Profile updated successfully.');
      setEditing(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (newPass !== confirmPass) { setError('New passwords do not match.'); return; }
    if (newPass.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ current_password: currentPass, new_password: newPass }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Password change failed');
      setSuccess('Password changed successfully.');
      setChangingPassword(false);
      setCurrentPass(''); setNewPass(''); setConfirmPass('');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Password change failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    clearAuthTokens();
    document.cookie = 'auth_token=; path=/; max-age=0';
    document.cookie = 'user_role=; path=/; max-age=0';
    router.push('/login');
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-ivory/40 py-10 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-navy">My Account</h1>
            <p className="text-sm text-slate mt-0.5">Manage your profile, security and preferences</p>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-1.5 text-xs font-semibold text-red-500 hover:text-red-700 border border-red-200 rounded-xl px-3 py-2 hover:bg-red-50 transition-all">
            <span className="material-symbols-outlined shrink-0" style={{ fontSize: '16px' }}>logout</span>
            Sign Out
          </button>
        </div>

        {/* Quick nav */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {[
            { href: '/orders', icon: 'receipt_long', label: 'My Orders' },
            { href: '/addresses', icon: 'location_on', label: 'Addresses' },
            { href: '/browse', icon: 'storefront', label: 'Browse Products' },
          ].map((item) => (
            <Link key={item.href} href={item.href} className="card flex flex-col items-center gap-2 py-4 text-center hover:border-amber/50 transition-all group">
              <span className="material-symbols-outlined text-amber group-hover:scale-110 transition-transform" style={{ fontSize: '28px' }}>{item.icon}</span>
              <span className="text-xs font-semibold text-navy">{item.label}</span>
            </Link>
          ))}
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-600 text-xs p-3.5 rounded-xl flex items-center gap-2">
            <span className="material-symbols-outlined shrink-0" style={{ fontSize: '16px' }}>error</span>
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs p-3.5 rounded-xl flex items-center gap-2">
            <span className="material-symbols-outlined shrink-0 text-emerald-600" style={{ fontSize: '16px' }}>check_circle</span>
            {success}
          </div>
        )}

        {/* Profile Card */}
        <div className="card mb-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-amber/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-amber" style={{ fontSize: '28px' }}>person</span>
              </div>
              <div>
                <p className="font-bold text-navy text-base">{user.full_name || 'Set your name'}</p>
                <p className="text-xs text-slate">{user.email}</p>
              </div>
            </div>
            <span className={`badge-${user.role === 'admin' ? 'info' : 'success'} text-xs`}>
              {user.role === 'admin' ? 'Admin' : 'Customer'}
            </span>
          </div>

          {!editing ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-slate/10">
                <span className="text-xs text-slate font-medium">Full Name</span>
                <span className="text-xs font-semibold text-navy">{user.full_name || '—'}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-slate/10">
                <span className="text-xs text-slate font-medium">Email</span>
                <span className="text-xs font-semibold text-navy">{user.email}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-xs text-slate font-medium">Phone</span>
                <span className="text-xs font-semibold text-navy">{user.phone || '—'}</span>
              </div>
              <button
                onClick={() => setEditing(true)}
                className="btn-primary w-full py-2.5 text-xs mt-2"
              >
                Edit Profile
              </button>
            </div>
          ) : (
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate uppercase tracking-wider mb-1">Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm border border-slate/20 rounded-xl bg-ivory/30 outline-none focus:border-amber transition-colors"
                  required
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate uppercase tracking-wider mb-1">Phone</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm border border-slate/20 rounded-xl bg-ivory/30 outline-none focus:border-amber transition-colors"
                />
              </div>
              <div className="flex gap-3">
                <button type="submit" disabled={loading} className="btn-primary flex-1 py-2.5 text-xs">
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
                <button type="button" onClick={() => setEditing(false)} className="flex-1 py-2.5 text-xs border border-slate/20 rounded-xl text-slate hover:bg-slate/5">
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Change Password Card */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-navy text-sm">Password & Security</h3>
              <p className="text-xs text-slate mt-0.5">Update your account password</p>
            </div>
            <button
              onClick={() => setChangingPassword(!changingPassword)}
              className="text-xs font-semibold text-amber hover:underline"
            >
              {changingPassword ? 'Cancel' : 'Change Password'}
            </button>
          </div>

          {changingPassword && (
            <form onSubmit={handleChangePassword} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate uppercase tracking-wider mb-1">Current Password</label>
                <input type="password" value={currentPass} onChange={(e) => setCurrentPass(e.target.value)} required
                  className="w-full px-3.5 py-2 text-sm border border-slate/20 rounded-xl bg-ivory/30 outline-none focus:border-amber transition-colors" />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate uppercase tracking-wider mb-1">New Password</label>
                <input type="password" value={newPass} onChange={(e) => setNewPass(e.target.value)} required
                  className="w-full px-3.5 py-2 text-sm border border-slate/20 rounded-xl bg-ivory/30 outline-none focus:border-amber transition-colors" />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate uppercase tracking-wider mb-1">Confirm New Password</label>
                <input type="password" value={confirmPass} onChange={(e) => setConfirmPass(e.target.value)} required
                  className="w-full px-3.5 py-2 text-sm border border-slate/20 rounded-xl bg-ivory/30 outline-none focus:border-amber transition-colors" />
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full py-2.5 text-xs">
                {loading ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
