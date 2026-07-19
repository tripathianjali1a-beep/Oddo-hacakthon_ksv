'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getSession, type SessionUser } from '@/lib/session';
import type { User, UserRole } from '@/lib/types';

const roleBadge: Record<UserRole, string> = {
  admin: 'badge-red',
  vendor: 'badge-amber',
  customer: 'badge-slate',
};

export default function AdminUsersPage() {
  const router = useRouter();
  const [session, setSessionState] = useState<SessionUser | null | 'checking'>('checking');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [busyId, setBusyId] = useState<number | null>(null);
  const [error, setError] = useState('');

  const load = useCallback(() => {
    setLoading(true);
    fetch('/api/users')
      .then((r) => r.json())
      .then((data: User[]) => setUsers(data))
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const s = getSession();
    if (!s || s.role !== 'admin') { router.replace('/admin/dashboard'); return; }
    setSessionState(s);
    load();
  }, [router, load]);

  const changeRole = async (id: number, role: UserRole) => {
    setBusyId(id);
    setError('');
    try {
      const res = await fetch(`/api/users/${id}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ role }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Could not update role.'); return; }
      setUsers((prev) => prev.map((u) => (u.id === id ? data : u)));
    } catch {
      setError('Network error while updating role.');
    } finally {
      setBusyId(null);
    }
  };

  const deleteUser = async (id: number) => {
    setBusyId(id);
    setError('');
    try {
      const res = await fetch(`/api/users/${id}`, { method: 'DELETE' });
      if (!res.ok) { const d = await res.json().catch(() => ({})); setError(d.error || 'Could not delete user.'); return; }
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch {
      setError('Network error while deleting user.');
    } finally {
      setBusyId(null);
    }
  };

  if (session === 'checking' || session === null) return null;

  const filtered = users.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 md:p-8 max-w-[1440px]">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-h1 text-navy">User Management</h1>
        <p className="text-slate text-sm mt-1">Manage accounts and roles across the platform. Admin-only.</p>
      </div>

      {error && (
        <div className="mb-5 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">{error}</div>
      )}

      {/* Search */}
      <div className="card p-4 mb-5 flex items-center gap-3">
        <div className="relative flex-1">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate/50" style={{ fontSize: '18px' }}>search</span>
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-9 text-sm"
          />
        </div>
        <span className="text-xs text-slate shrink-0">{filtered.length} of {users.length}</span>
      </div>

      <div className="card rounded-xl overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-ivory border-b border-slate/10">
              <th className="table-header">User</th>
              <th className="table-header hidden md:table-cell">Joined</th>
              <th className="table-header">Role</th>
              <th className="table-header text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} className="text-center p-12 text-slate text-sm">Loading users…</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={4} className="text-center p-12 text-slate text-sm">No users found.</td></tr>
            ) : filtered.map((u) => {
              const isSelf = u.id === (session as SessionUser).id;
              return (
                <tr key={u.id} className="table-row">
                  <td className="table-cell">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-navy-container text-white text-xs flex items-center justify-center font-semibold flex-shrink-0">
                        {u.name[0]?.toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-navy text-sm">{u.name}{isSelf && <span className="text-slate font-normal text-xs"> (you)</span>}</p>
                        <p className="text-slate text-xs">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="table-cell hidden md:table-cell text-slate text-sm">
                    {new Date(u.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td className="table-cell">
                    <div className="flex items-center gap-2">
                      <span className={roleBadge[u.role]}>{u.role}</span>
                      <select
                        value={u.role}
                        disabled={busyId === u.id || isSelf}
                        onChange={(e) => changeRole(u.id, e.target.value as UserRole)}
                        className="input-field text-xs py-1.5 w-auto"
                        title={isSelf ? "You can't change your own role" : 'Change role'}
                      >
                        <option value="customer">Customer</option>
                        <option value="vendor">Vendor</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                  </td>
                  <td className="table-cell text-right">
                    <button
                      onClick={() => deleteUser(u.id)}
                      disabled={busyId === u.id || isSelf}
                      title={isSelf ? "You can't delete your own account" : 'Delete user'}
                      className="text-slate hover:text-red-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors p-1.5"
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>delete</span>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
