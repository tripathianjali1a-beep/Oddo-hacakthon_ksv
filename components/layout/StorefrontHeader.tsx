'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import Logo from '@/components/ui/Logo';
import { useAuthStore, useCartStore } from '@/lib/store';
import { clearAuthTokens } from '@/lib/client';

const navLinks = [
  { label: 'Browse', href: '/browse' },
  { label: 'Categories', href: '/categories' },
  { label: 'Deals', href: '/deals' },
  { label: 'Support', href: '/support' },
];

const iconSym: React.CSSProperties = {
  fontSize: '22px',
  lineHeight: 1,
  display: 'inline-block',
  verticalAlign: 'middle',
};

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export default function StorefrontHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { itemCount, setItems } = useCartStore();

  const [searchValue, setSearchValue] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Fetch real cart count when authenticated
  const syncCart = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`${API_BASE}/cart/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const items = await res.json();
        setItems(items);
      }
    } catch {}
  }, [isAuthenticated, setItems]);

  useEffect(() => { syncCart(); }, [syncCart]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLogout = () => {
    logout();
    clearAuthTokens();
    document.cookie = 'auth_token=; path=/; max-age=0';
    document.cookie = 'user_role=; path=/; max-age=0';
    setUserMenuOpen(false);
    router.push('/login');
  };

  const handleSearch = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && searchValue.trim()) {
      router.push(`/browse?search=${encodeURIComponent(searchValue.trim())}`);
    }
  };

  const initials = user?.full_name
    ? user.full_name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
    : 'U';

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/80 backdrop-blur-xl border-b border-slate/15 shadow-[0_4px_20px_rgba(15,23,42,0.06)]'
          : 'bg-white/95 backdrop-blur-md border-b border-transparent'
      }`}
    >
      <div className="max-w-[1440px] mx-auto px-6 h-[68px] flex items-center justify-between gap-4">
        {/* Brand + Search */}
        <div className="flex items-center gap-6 min-w-0">
          <Link href="/home" className="shrink-0 transition-transform hover:scale-[1.03] active:scale-95">
            <Logo size={34} />
          </Link>
          <div className="relative hidden md:flex items-center group">
            <span className="material-symbols-outlined absolute left-3 text-slate/50 group-focus-within:text-amber transition-colors shrink-0" style={{ fontSize: '18px' }}>search</span>
            <input
              type="text"
              placeholder="Search products..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onKeyDown={handleSearch}
              className="pl-10 pr-3.5 py-2.5 text-[13px] border border-slate/20 rounded-full bg-ivory/70 outline-none w-52 lg:w-72 focus:w-56 lg:focus:w-80 focus:border-amber focus:bg-white focus:shadow-[0_0_0_3px_rgba(217,119,6,0.12)] transition-all duration-300"
            />
          </div>
        </div>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive = pathname === link.href || (link.href !== '/home' && pathname.startsWith(link.href) && link.href.length > 1);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative px-3.5 py-2 rounded-full text-sm transition-colors ${
                  isActive ? 'text-navy font-semibold' : 'text-slate font-medium hover:text-navy'
                }`}
              >
                {link.label}
                <span
                  className={`absolute left-3.5 right-3.5 -bottom-0.5 h-0.5 rounded-full bg-amber origin-left transition-transform duration-300 ${
                    isActive ? 'scale-x-100' : 'scale-x-0'
                  }`}
                />
              </Link>
            );
          })}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-1 shrink-0 relative">
          {/* Cart Icon */}
          <Link href="/cart" className="relative p-2.5 rounded-full text-slate hover:text-navy hover:bg-navy/[0.05] flex items-center transition-colors" title="Shopping Cart">
            <span className="material-symbols-outlined shrink-0" style={iconSym}>shopping_cart</span>
            {itemCount > 0 && (
              <span className="absolute top-1 right-1 bg-amber text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center ring-2 ring-white">
                {itemCount > 9 ? '9+' : itemCount}
              </span>
            )}
          </Link>

          <span className="hidden sm:block w-px h-6 bg-slate/15 mx-1.5" />

          {/* User menu */}
          {isAuthenticated && user ? (
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 pl-1 pr-1 sm:pr-3 py-1 rounded-full hover:bg-navy/[0.05] transition-colors outline-none"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-navy-container to-navy flex items-center justify-center text-white text-xs font-bold ring-2 ring-amber/30 shrink-0">
                  {initials}
                </div>
                <span className="hidden sm:block text-navy text-sm font-semibold max-w-[100px] truncate">
                  {user.full_name?.split(' ')[0] || 'Account'}
                </span>
                <span className="material-symbols-outlined text-slate text-sm shrink-0">expand_more</span>
              </button>

              {userMenuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border border-slate/15 py-2 z-50 animate-fade-in">
                    <div className="px-4 py-2 border-b border-slate/10 mb-1">
                      <p className="text-xs font-bold text-navy truncate">{user.full_name || 'Account'}</p>
                      <p className="text-xs text-slate truncate">{user.email}</p>
                    </div>
                    <Link href="/account" onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-navy hover:bg-ivory transition-colors">
                      <span className="material-symbols-outlined text-amber shrink-0" style={{ fontSize: '18px' }}>person</span>
                      My Profile
                    </Link>
                    <Link href="/orders" onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-navy hover:bg-ivory transition-colors">
                      <span className="material-symbols-outlined text-amber shrink-0" style={{ fontSize: '18px' }}>receipt_long</span>
                      My Orders
                    </Link>
                    <Link href="/addresses" onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-navy hover:bg-ivory transition-colors">
                      <span className="material-symbols-outlined text-amber shrink-0" style={{ fontSize: '18px' }}>location_on</span>
                      Addresses
                    </Link>
                    {user.role === 'admin' && (
                      <Link href="/admin/dashboard" onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-amber hover:bg-amber/10 transition-colors">
                        <span className="material-symbols-outlined text-amber shrink-0" style={{ fontSize: '18px' }}>admin_panel_settings</span>
                        Admin Dashboard
                      </Link>
                    )}
                    <div className="border-t border-slate/10 mt-1 pt-1">
                      <button onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors">
                        <span className="material-symbols-outlined text-red-600 shrink-0" style={{ fontSize: '18px' }}>logout</span>
                        Sign Out
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <Link href="/login" className="btn-primary py-2 px-4 text-xs">Sign In</Link>
          )}

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileOpen((o) => !o)}
            className="lg:hidden p-2.5 rounded-full text-slate hover:text-navy hover:bg-navy/[0.05] flex items-center transition-colors"
            aria-label="Menu"
          >
            <span className="material-symbols-outlined shrink-0" style={iconSym}>{mobileOpen ? 'close' : 'menu'}</span>
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-slate/10 bg-white px-6 py-3 animate-fade-in">
          <div className="relative flex items-center mb-3 md:hidden">
            <span className="material-symbols-outlined absolute left-2.5 text-slate/50 shrink-0" style={{ fontSize: '18px' }}>search</span>
            <input
              type="text"
              placeholder="Search…"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onKeyDown={handleSearch}
              className="pl-9 pr-3.5 py-2 text-[13px] border border-slate/20 rounded-md bg-ivory outline-none w-full focus:border-amber transition-colors"
            />
          </div>
          <nav className="flex flex-col">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} onClick={() => setMobileOpen(false)}
                className={`px-2 py-2.5 rounded-md text-sm ${pathname === link.href || pathname.startsWith(link.href) ? 'text-navy font-semibold' : 'text-slate font-medium'}`}>
                {link.label}
              </Link>
            ))}
            {isAuthenticated ? (
              <>
                <Link href="/account" onClick={() => setMobileOpen(false)} className="px-2 py-2.5 text-sm text-slate font-medium">My Account</Link>
                <Link href="/orders" onClick={() => setMobileOpen(false)} className="px-2 py-2.5 text-sm text-slate font-medium">My Orders</Link>
                <button onClick={handleLogout} className="px-2 py-2.5 text-sm text-red-500 font-medium text-left">Sign Out</button>
              </>
            ) : (
              <Link href="/login" onClick={() => setMobileOpen(false)} className="px-2 py-2.5 text-sm text-amber font-semibold">Sign In</Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
