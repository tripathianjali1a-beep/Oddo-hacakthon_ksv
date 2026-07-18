'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Logo from '@/components/ui/Logo';
import { cartCount } from '@/lib/cart';

const navLinks = [
  { label: 'Browse', href: '/browse' },
  { label: 'Categories', href: '/browse?cat=all' },
  { label: 'Deals', href: '/browse?deals=true' },
  { label: 'Support', href: '/support' },
];

const iconSym: React.CSSProperties = {
  fontFamily: "'Material Symbols Outlined'",
  fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24",
  fontSize: '22px',
  lineHeight: 1,
  display: 'inline-block',
  fontStyle: 'normal',
  fontWeight: 'normal',
  textTransform: 'none',
  letterSpacing: 'normal',
  verticalAlign: 'middle',
};

export default function StorefrontHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const [itemCount, setItemCount] = useState(0);
  const [searchValue, setSearchValue] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Live cart badge: sync on mount, on same-tab cart changes, and across tabs.
  useEffect(() => {
    const sync = () => setItemCount(cartCount());
    sync();
    window.addEventListener('cart:changed', sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener('cart:changed', sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchValue.trim();
    setMobileOpen(false);
    router.push(q ? `/browse?search=${encodeURIComponent(q)}` : '/browse');
  };

  return (
    <header className="sticky top-0 z-50 px-3 sm:px-5 pt-3 sm:pt-4">
      <div
        className={`detach max-w-[1440px] mx-auto px-5 h-[64px] flex items-center justify-between gap-4 rounded-2xl border backdrop-blur-xl transition-all duration-300 ${
          scrolled
            ? 'bg-white/85 border-slate/15 shadow-[0_16px_40px_-12px_rgba(15,23,42,0.28)]'
            : 'bg-white/75 border-white/60 shadow-[0_10px_30px_-10px_rgba(15,23,42,0.22)]'
        }`}
      >
        {/* Brand + Search */}
        <div className="flex items-center gap-6 min-w-0">
          <Link href="/home" className="shrink-0 transition-transform hover:scale-[1.03] active:scale-95">
            <Logo size={34} />
          </Link>
          <form onSubmit={submitSearch} className="relative hidden md:flex items-center group">
            <span className="material-symbols-outlined absolute left-3 text-slate/50 group-focus-within:text-amber transition-colors" style={{ fontSize: '18px' }}>search</span>
            <input
              type="text"
              placeholder="Search excavators, cameras, gear..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="pl-10 pr-3.5 py-2.5 text-[13px] border border-slate/20 rounded-full bg-ivory/70 outline-none w-52 lg:w-72 focus:w-56 lg:focus:w-80 focus:border-amber focus:bg-white focus:shadow-[0_0_0_3px_rgba(217,119,6,0.12)] transition-all duration-300"
            />
          </form>
        </div>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative px-3.5 py-2 rounded-full text-sm transition-colors ${
                  active ? 'text-navy font-semibold' : 'text-slate font-medium hover:text-navy'
                }`}
              >
                {link.label}
                <span
                  className={`absolute left-3.5 right-3.5 -bottom-0.5 h-0.5 rounded-full bg-amber origin-left transition-transform duration-300 ${
                    active ? 'scale-x-100' : 'scale-x-0'
                  }`}
                />
              </Link>
            );
          })}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-1 shrink-0">
          <Link href="/cart" className="relative p-2.5 rounded-full text-slate hover:text-navy hover:bg-navy/[0.05] flex items-center transition-colors">
            <span style={iconSym}>shopping_cart</span>
            {itemCount > 0 && (
              <span className="absolute top-1 right-1 bg-amber text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center ring-2 ring-white">
                {itemCount}
              </span>
            )}
          </Link>
          <button className="hidden sm:flex p-2.5 rounded-full text-slate hover:text-navy hover:bg-navy/[0.05] items-center transition-colors">
            <span style={iconSym}>notifications</span>
          </button>
          <span className="hidden sm:block w-px h-6 bg-slate/15 mx-1.5" />
          <Link
            href="/login"
            className="flex items-center gap-2 pl-1 pr-1 sm:pr-3 py-1 rounded-full hover:bg-navy/[0.05] transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-navy-container to-navy flex items-center justify-center text-white text-xs font-bold ring-2 ring-amber/30">
              U
            </div>
            <span className="hidden sm:block text-navy text-sm font-semibold">Account</span>
          </Link>
          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileOpen((o) => !o)}
            className="lg:hidden p-2.5 rounded-full text-slate hover:text-navy hover:bg-navy/[0.05] flex items-center transition-colors"
            aria-label="Menu"
          >
            <span style={iconSym}>{mobileOpen ? 'close' : 'menu'}</span>
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div className="lg:hidden max-w-[1440px] mx-auto mt-2 rounded-2xl border border-slate/15 bg-white/90 backdrop-blur-xl shadow-[0_16px_40px_-12px_rgba(15,23,42,0.28)] px-5 py-3 animate-fade-in">
          <form onSubmit={submitSearch} className="relative flex items-center mb-3 md:hidden">
            <span className="material-symbols-outlined absolute left-2.5 text-slate/50" style={{ fontSize: '18px' }}>search</span>
            <input
              type="text"
              placeholder="Search…"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="pl-9 pr-3.5 py-2 text-[13px] border border-slate/20 rounded-md bg-ivory outline-none w-full focus:border-amber transition-colors"
            />
          </form>
          <nav className="flex flex-col">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`px-2 py-2.5 rounded-md text-sm ${
                  pathname === link.href ? 'text-navy font-semibold' : 'text-slate font-medium'
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
