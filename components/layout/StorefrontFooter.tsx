'use client';
import Link from 'next/link';
import { useState } from 'react';
import Logo from '@/components/ui/Logo';

const columns = [
  {
    title: 'Explore',
    links: [
      { label: 'Browse all', href: '/browse' },
      { label: 'Heavy machinery', href: '/browse?cat=Heavy Machinery' },
      { label: 'Warehouse equipment', href: '/browse?cat=Warehouse' },
      { label: 'Power & generators', href: '/browse?cat=Power' },
      { label: 'Electronics', href: '/browse?cat=Electronics' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About us', href: '/about' },
      { label: 'How it works', href: '/how-it-works' },
      { label: 'Become a vendor', href: '/login' },
      { label: 'Careers', href: '/careers' },
      { label: 'Press', href: '/press' },
    ],
  },
  {
    title: 'Support',
    links: [
      { label: 'Help center', href: '/support' },
      { label: 'Contact us', href: '/contact' },
      { label: 'Cancellation', href: '/policies/cancellation' },
      { label: 'Trust & safety', href: '/trust' },
      { label: 'Terms & privacy', href: '/legal' },
    ],
  },
];

const socials = [
  { label: 'Instagram', icon: 'photo_camera', href: '#' },
  { label: 'Twitter', icon: 'chat', href: '#' },
  { label: 'LinkedIn', icon: 'work', href: '#' },
  { label: 'YouTube', icon: 'play_circle', href: '#' },
];

const iconSym: React.CSSProperties = {
  fontFamily: "'Material Symbols Outlined'",
  fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24",
  lineHeight: 1,
  display: 'inline-block',
  fontStyle: 'normal',
};

export default function StorefrontFooter() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSent(true);
    setEmail('');
    setTimeout(() => setSent(false), 3000);
  };

  return (
    <footer className="bg-navy-container text-on-navy mt-auto">
      {/* Newsletter band */}
      <div className="border-b border-white/10">
        <div className="max-w-[1440px] mx-auto px-6 py-10 grid md:grid-cols-2 gap-6 items-center">
          <div>
            <h3 className="text-white font-bold text-2xl">Get fleet deals in your inbox</h3>
            <p className="text-on-navy text-sm mt-1.5">New listings, seasonal rates and member-only discounts. No spam, unsubscribe anytime.</p>
          </div>
          <form onSubmit={submit} className="flex flex-col sm:flex-row gap-3 md:justify-end">
            <div className="relative flex-1 sm:max-w-[20rem]">
              <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-on-navy" style={{ ...iconSym, fontSize: '18px' }}>mail</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/[0.06] border border-white/15 text-white placeholder-on-navy outline-none focus:border-amber focus:bg-white/10 transition-all text-sm"
              />
            </div>
            <button type="submit" className="btn-primary px-6 py-3 rounded-xl text-sm whitespace-nowrap">
              {sent ? 'Subscribed ✓' : 'Subscribe'}
            </button>
          </form>
        </div>
      </div>

      {/* Main footer */}
      <div className="max-w-[1440px] mx-auto px-6 py-14 grid grid-cols-2 md:grid-cols-12 gap-8 md:gap-6">
        {/* Brand */}
        <div className="col-span-2 md:col-span-4 lg:col-span-4">
          <Logo size={34} light />
          <p className="text-on-navy text-sm mt-4 leading-relaxed max-w-[22rem]">
            Rentora is a premium equipment rental marketplace connecting contractors, studios and businesses with
            inspected heavy machinery, power tools and gear — delivered to the job site.
          </p>
          <div className="flex items-center gap-2.5 mt-5">
            {socials.map((s) => (
              <a
                key={s.label}
                href={s.href}
                aria-label={s.label}
                className="w-9 h-9 rounded-full bg-white/[0.06] border border-white/10 flex items-center justify-center text-on-navy hover:text-white hover:bg-amber hover:border-amber transition-all"
              >
                <span style={{ ...iconSym, fontSize: '18px' }}>{s.icon}</span>
              </a>
            ))}
          </div>
        </div>

        {/* Link columns */}
        {columns.map((col) => (
          <div key={col.title} className="md:col-span-2 lg:col-span-2">
            <h4 className="text-white font-semibold text-sm mb-4">{col.title}</h4>
            <ul className="flex flex-col gap-2.5">
              {col.links.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-on-navy text-sm hover:text-amber transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        {/* Contact */}
        <div className="col-span-2 md:col-span-2 lg:col-span-2">
          <h4 className="text-white font-semibold text-sm mb-4">Get in touch</h4>
          <ul className="flex flex-col gap-3 text-sm">
            <li className="flex items-start gap-2.5 text-on-navy">
              <span className="material-symbols-outlined text-amber mt-0.5" style={{ ...iconSym, fontSize: '18px' }}>call</span>
              +1 (800) 555-0199
            </li>
            <li className="flex items-start gap-2.5 text-on-navy">
              <span className="material-symbols-outlined text-amber mt-0.5" style={{ ...iconSym, fontSize: '18px' }}>mail</span>
              hello@rentora.com
            </li>
            <li className="flex items-start gap-2.5 text-on-navy">
              <span className="material-symbols-outlined text-amber mt-0.5" style={{ ...iconSym, fontSize: '18px' }}>location_on</span>
              350 Fifth Avenue, New York, NY
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="max-w-[1440px] mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-on-navy text-xs">© 2024 Rentora. Premium Rental Management Platform. All rights reserved.</p>
          <div className="flex items-center gap-6 text-xs">
            <Link href="/legal" className="text-on-navy hover:text-white transition-colors">Terms</Link>
            <Link href="/legal" className="text-on-navy hover:text-white transition-colors">Privacy</Link>
            <Link href="/legal" className="text-on-navy hover:text-white transition-colors">Cookies</Link>
            <span className="flex items-center gap-1.5 text-on-navy">
              <span className="material-symbols-outlined text-amber" style={{ ...iconSym, fontSize: '15px' }}>language</span>
              English (US)
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
