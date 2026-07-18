'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { label: 'Dashboard', href: '/admin/dashboard', icon: 'dashboard' },
  { label: 'Orders', href: '/admin/orders', icon: 'receipt_long' },
  { label: 'Schedule', href: '/admin/schedule', icon: 'calendar_today' },
  { label: 'Products', href: '/admin/products', icon: 'inventory_2' },
  { label: 'Reports', href: '/admin/reports', icon: 'assessment' },
  { label: 'Configuration', href: '/admin/configuration', icon: 'settings' },
];

const iconStyle: React.CSSProperties = {
  fontSize: '20px',
  lineHeight: 1,
  display: 'inline-block',
  flexShrink: 0,
};

const iconStyleFilled: React.CSSProperties = {
  ...iconStyle,
  fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24",
};

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside style={{ width: '256px', backgroundColor: '#131B2E', position: 'fixed', left: 0, top: 0, height: '100vh', display: 'flex', flexDirection: 'column', padding: '24px 0', zIndex: 40, fontFamily: "'Inter', sans-serif" }}>
      {/* Header */}
      <div style={{ padding: '0 20px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'rgba(217,119,6,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D97706', fontWeight: 700, fontSize: '14px', flexShrink: 0 }}>
            A
          </div>
          <div>
            <p style={{ color: '#fff', fontWeight: 600, fontSize: '14px' }}>Admin Portal</p>
            <p style={{ color: '#7C839B', fontSize: '12px' }}>Management Suite</p>
          </div>
        </div>
        <Link
          href="/admin/products"
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', width: '100%', padding: '10px', backgroundColor: '#D97706', color: '#fff', borderRadius: '6px', textDecoration: 'none', fontSize: '13px', fontWeight: 600 }}
        >
          <span style={iconStyle} className="material-symbols-outlined shrink-0">add</span>
          New Entry
        </Link>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, overflowY: 'auto', padding: '0 12px' }}>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '10px 14px', borderRadius: '6px', textDecoration: 'none',
                marginBottom: '2px', transition: 'all 0.15s',
                borderLeft: isActive ? '4px solid #D97706' : '4px solid transparent',
                backgroundColor: isActive ? 'rgba(255,255,255,0.1)' : 'transparent',
                color: isActive ? '#ffffff' : 'rgba(124,131,155,0.85)',
              }}
            >
              <span className="material-symbols-outlined shrink-0" style={isActive ? iconStyleFilled : iconStyle}>{item.icon}</span>
              <span style={{ fontSize: '13px', fontWeight: isActive ? 600 : 500 }}>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div style={{ padding: '16px 12px 0', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        {[
          { label: 'Help', href: '/admin/help', icon: 'help' },
          { label: 'Logout', href: '/login', icon: 'logout' },
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', borderRadius: '6px', textDecoration: 'none', color: 'rgba(124,131,155,0.85)', marginBottom: '2px', fontSize: '13px', fontWeight: 500, borderLeft: '4px solid transparent' }}
          >
            <span className="material-symbols-outlined shrink-0" style={iconStyle}>{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </div>
    </aside>
  );
}
