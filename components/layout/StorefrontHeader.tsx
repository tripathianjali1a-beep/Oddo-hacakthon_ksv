'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Logo from '@/components/ui/Logo';

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

export default function StorefrontHeader() {
  const pathname = usePathname();
  const [cartCount] = useState(2);
  const [wishlistCount] = useState(3);
  const [searchValue, setSearchValue] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

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
              placeholder="Search properties or equipment..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="pl-10 pr-3.5 py-2.5 text-[13px] border border-slate/20 rounded-full bg-ivory/70 outline-none w-52 lg:w-72 focus:w-56 lg:focus:w-80 focus:border-amber focus:bg-white focus:shadow-[0_0_0_3px_rgba(217,119,6,0.12)] transition-all duration-300"
            />
          </div>
        </div>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => {
            const active = pathname === link.href || (link.href !== '/home' && pathname.startsWith(link.href) && link.href !== '/browse');
            const isBrowseActive = link.href === '/browse' && pathname === '/browse';
            const isActive = active || isBrowseActive;
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
          {/* Wishlist Icon from Mockup */}
          <Link
            href="/browse"
            className="relative p-2.5 rounded-full text-slate hover:text-navy hover:bg-navy/[0.05] flex items-center transition-colors"
            title="Wishlist"
          >
            <span className="material-symbols-outlined shrink-0" style={iconSym}>favorite</span>
            {wishlistCount > 0 && (
              <span className="absolute top-1 right-1 bg-red-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center ring-2 ring-white">
                {wishlistCount}
              </span>
            )}
          </Link>

          {/* Cart Icon */}
          <Link href="/cart" className="relative p-2.5 rounded-full text-slate hover:text-navy hover:bg-navy/[0.05] flex items-center transition-colors" title="Shopping Cart">
            <span className="material-symbols-outlined shrink-0" style={iconSym}>shopping_cart</span>
            {cartCount > 0 && (
              <span className="absolute top-1 right-1 bg-amber text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center ring-2 ring-white">
                {cartCount}
              </span>
            )}
          </Link>

          <button className="hidden sm:flex p-2.5 rounded-full text-slate hover:text-navy hover:bg-navy/[0.05] items-center transition-colors" title="Notifications">
            <span className="material-symbols-outlined shrink-0" style={iconSym}>notifications</span>
          </button>
          <span className="hidden sm:block w-px h-6 bg-slate/15 mx-1.5" />

          {/* User Profile + Dropdown from Mockup */}
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-2 pl-1 pr-1 sm:pr-3 py-1 rounded-full hover:bg-navy/[0.05] transition-colors outline-none"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-navy-container to-navy flex items-center justify-center text-white text-xs font-bold ring-2 ring-amber/30 shrink-0">
                U
              </div>
              <span className="hidden sm:block text-navy text-sm font-semibold">Account</span>
              <span className="material-symbols-outlined text-slate text-sm shrink-0">expand_more</span>
            </button>

            {userMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border border-slate/15 py-2 z-50 animate-fade-in">
                <div className="px-4 py-2 border-b border-slate/10 mb-1">
                  <p className="text-xs font-bold text-navy">Logged in as</p>
                  <p className="text-xs text-slate truncate">customer@luxrent.com</p>
                </div>
                <Link
                  href="/login"
                  onClick={() => setUserMenuOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-navy hover:bg-ivory transition-colors"
                >
                  <span className="material-symbols-outlined text-amber shrink-0" style={{ fontSize: '18px' }}>person</span>
                  <span>My account / My Profile</span>
                </Link>
                <Link
                  href="/browse"
                  onClick={() => setUserMenuOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-navy hover:bg-ivory transition-colors"
                >
                  <span className="material-symbols-outlined text-amber shrink-0" style={{ fontSize: '18px' }}>inventory_2</span>
                  <span>My Orders</span>
                </Link>
                <Link
                  href="/admin/configuration"
                  onClick={() => setUserMenuOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-navy hover:bg-ivory transition-colors"
                >
                  <span className="material-symbols-outlined text-amber shrink-0" style={{ fontSize: '18px' }}>settings</span>
                  <span>Settings</span>
                </Link>
                <div className="border-t border-slate/10 mt-1 pt-1">
                  <Link
                    href="/login"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <span className="material-symbols-outlined text-red-600 shrink-0" style={{ fontSize: '18px' }}>logout</span>
                    <span>Logout</span>
                  </Link>
                </div>
              </div>
            )}
          </div>

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
              className="pl-9 pr-3.5 py-2 text-[13px] border border-slate/20 rounded-md bg-ivory outline-none w-full focus:border-amber transition-colors"
            />
          </div>
          <nav className="flex flex-col">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`px-2 py-2.5 rounded-md text-sm ${
                  pathname === link.href || pathname.startsWith(link.href) ? 'text-navy font-semibold' : 'text-slate font-medium'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
