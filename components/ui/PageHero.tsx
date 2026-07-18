import Link from 'next/link';

interface Crumb { label: string; href?: string; }

export default function PageHero({
  eyebrow,
  title,
  subtitle,
  icon,
  crumbs,
  children,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  icon?: string;
  crumbs?: Crumb[];
  children?: React.ReactNode;
}) {
  return (
    <section className="detach detach-dark relative overflow-hidden rounded-[28px] mx-3 sm:mx-5 mt-2 bg-gradient-to-br from-navy-container via-navy to-navy-container shadow-[0_24px_60px_-24px_rgba(15,23,42,0.5)]">
      {/* glow */}
      <div className="absolute -top-16 -right-10 w-72 h-72 rounded-full bg-amber/20 blur-[100px]" />
      <div className="absolute -bottom-20 -left-10 w-72 h-72 rounded-full bg-blue-500/15 blur-[100px]" />
      {/* grid texture */}
      <div
        className="absolute inset-0 opacity-[0.05]"
        style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '44px 44px' }}
      />

      <div className="relative z-10 max-w-[1100px] mx-auto px-6 sm:px-10 py-12 md:py-16 text-center">
        {crumbs && (
          <nav className="flex items-center justify-center gap-1.5 text-xs text-white/50 mb-5">
            {crumbs.map((c, i) => (
              <span key={c.label} className="flex items-center gap-1.5">
                {c.href ? <Link href={c.href} className="hover:text-white transition-colors">{c.label}</Link> : <span className="text-white/80">{c.label}</span>}
                {i < crumbs.length - 1 && <span className="material-symbols-outlined" style={{ fontSize: '13px' }}>chevron_right</span>}
              </span>
            ))}
          </nav>
        )}

        {icon && (
          <span className="inline-flex w-14 h-14 rounded-2xl bg-amber/15 border border-amber/25 items-center justify-center mb-5">
            <span className="material-symbols-outlined text-amber" style={{ fontSize: '28px' }}>{icon}</span>
          </span>
        )}

        {eyebrow && <p className="text-amber text-xs font-semibold uppercase tracking-widest mb-3">{eyebrow}</p>}
        <h1 className="text-white font-bold text-3xl md:text-5xl leading-tight tracking-tight">{title}</h1>
        {subtitle && <p className="text-white/70 text-base md:text-lg mt-4 max-w-[42rem] mx-auto leading-relaxed">{subtitle}</p>}

        {children && <div className="mt-8">{children}</div>}
      </div>
    </section>
  );
}
