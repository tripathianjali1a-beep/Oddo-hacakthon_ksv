'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getSession, clearSession, type SessionUser } from '@/lib/session';

const navItems = [
  { label: 'Dashboard', href: '/admin/dashboard', icon: 'dashboard' },
  { label: 'Orders', href: '/admin/orders', icon: 'receipt_long' },
  { label: 'Schedule', href: '/admin/schedule', icon: 'calendar_today' },
  { label: 'Products', href: '/admin/products', icon: 'inventory_2' },
  { label: 'Reports', href: '/admin/reports', icon: 'assessment' },
  { label: 'Configuration', href: '/admin/configuration', icon: 'settings' },
];

const adminOnlyItems = [
  { label: 'Users', href: '/admin/users', icon: 'group' },
];

const iconStyle: React.CSSProperties = {
  fontFamily: "'Material Symbols Outlined'",
  fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24",
  fontSize: '20px',
  lineHeight: 1,
  display: 'inline-block',
  fontStyle: 'normal',
  fontWeight: 'normal',
  textTransform: 'none',
  letterSpacing: 'normal',
  flexShrink: 0,
};

const iconStyleFilled: React.CSSProperties = {
  ...iconStyle,
  fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24",
};

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [session, setSessionState] = useState<SessionUser | null>(null);

  useEffect(() => { setSessionState(getSession()); }, []);

  const handleLogout = () => {
    clearSession();
    router.push('/login');
  };

  const items = session?.role === 'admin' ? [...navItems, ...adminOnlyItems] : navItems;

  return (
    <aside style={{ width: '256px', background: 'linear-gradient(180deg, #16203A 0%, #0F172A 100%)', position: 'fixed', left: 0, top: 0, height: '100vh', display: 'flex', flexDirection: 'column', padding: '24px 0', zIndex: 40, fontFamily: "'Inter', sans-serif", borderRight: '1px solid rgba(255,255,255,0.06)' }}>
      {/* Header */}
      <div style={{ padding: '0 20px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <div style={{ width: '38px', height: '38px', borderRadius: '12px', background: 'linear-gradient(135deg, #F59E0B, #D97706)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: '15px', flexShrink: 0, boxShadow: '0 6px 16px -6px rgba(217,119,6,0.7)' }}>
            L
          </div>
          <div>
            <p style={{ color: '#fff', fontWeight: 700, fontSize: '14px', letterSpacing: '-0.01em' }}>Rentora {session?.role === 'admin' ? 'Admin' : 'Vendor'}</p>
            <p style={{ color: '#7C839B', fontSize: '12px' }}>{session?.role === 'admin' ? 'Platform Administration' : 'Management Suite'}</p>
          </div>
        </div>
        <Link
          href="/admin/products"
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', width: '100%', padding: '11px', background: 'linear-gradient(135deg, #F59E0B, #D97706)', color: '#fff', borderRadius: '12px', textDecoration: 'none', fontSize: '13px', fontWeight: 600, boxShadow: '0 6px 16px -6px rgba(217,119,6,0.6)' }}
        >
          <span style={iconStyle} className="material-symbols-outlined">add</span>
          New Entry
        </Link>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, overflowY: 'auto', padding: '0 12px' }}>
        {items.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: 'flex', alignItems: 'center', gap: '11px',
                padding: '11px 14px', borderRadius: '12px', textDecoration: 'none',
                marginBottom: '4px', transition: 'all 0.15s',
                border: isActive ? '1px solid rgba(217,119,6,0.35)' : '1px solid transparent',
                background: isActive ? 'linear-gradient(135deg, rgba(217,119,6,0.18), rgba(217,119,6,0.05))' : 'transparent',
                color: isActive ? '#ffffff' : 'rgba(124,131,155,0.85)',
                boxShadow: isActive ? 'inset 3px 0 0 #F59E0B' : 'none',
              }}
            >
              <span className="material-symbols-outlined" style={isActive ? iconStyleFilled : iconStyle}>{item.icon}</span>
              <span style={{ fontSize: '13px', fontWeight: isActive ? 600 : 500 }}>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div style={{ padding: '16px 12px 0', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        <Link
          href="/admin/help"
          style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', borderRadius: '6px', textDecoration: 'none', color: 'rgba(124,131,155,0.85)', marginBottom: '2px', fontSize: '13px', fontWeight: 500, borderLeft: '4px solid transparent' }}
        >
          <span className="material-symbols-outlined" style={iconStyle}>help</span>
          <span>Help</span>
        </Link>
        <button
          onClick={handleLogout}
          style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', borderRadius: '6px', width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(124,131,155,0.85)', marginBottom: '2px', fontSize: '13px', fontWeight: 500, borderLeft: '4px solid transparent', fontFamily: 'inherit' }}
        >
          <span className="material-symbols-outlined" style={iconStyle}>logout</span>
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
