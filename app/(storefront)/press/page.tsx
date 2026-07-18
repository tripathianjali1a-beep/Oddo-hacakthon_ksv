import PageHero from '@/components/ui/PageHero';

const releases = [
  { date: 'Jun 2024', title: 'LuxRent surpasses 1,200 active listings across 42 cities', tag: 'Company' },
  { date: 'Apr 2024', title: 'Introducing 24/7 concierge support for every rental', tag: 'Product' },
  { date: 'Feb 2024', title: 'LuxRent raises Series B to expand global equipment marketplace', tag: 'Funding' },
  { date: 'Nov 2023', title: 'The LuxRent Standard: our new certification programme for owners', tag: 'Trust' },
];

const coverage = [
  { outlet: 'The Verge', quote: '“The most polished rental experience we’ve tested.”' },
  { outlet: 'Forbes', quote: '“LuxRent is quietly redefining premium access.”' },
  { outlet: 'TechCrunch', quote: '“Concierge-grade service, marketplace scale.”' },
];

export default function PressPage() {
  return (
    <div className="pb-16">
      <PageHero
        eyebrow="Press & Media"
        title="Newsroom"
        subtitle="The latest announcements, media coverage, and brand assets. For enquiries, reach our press team."
        icon="newspaper"
        crumbs={[{ label: 'Home', href: '/home' }, { label: 'Press' }]}
      />

      <div className="max-w-[1100px] mx-auto px-6 mt-14 grid lg:grid-cols-3 gap-6">
        {/* Releases */}
        <div className="lg:col-span-2">
          <h2 className="text-h2 text-navy mb-6">Press releases</h2>
          <div className="flex flex-col gap-3">
            {releases.map((r) => (
              <div key={r.title} className="card card-hover p-5 flex items-start justify-between gap-4 group cursor-pointer">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="badge-amber text-[10px]">{r.tag}</span>
                    <span className="text-slate text-xs">{r.date}</span>
                  </div>
                  <h3 className="text-navy font-semibold text-sm group-hover:text-amber transition-colors leading-snug">{r.title}</h3>
                </div>
                <span className="material-symbols-outlined text-slate group-hover:text-amber transition-colors shrink-0" style={{ fontSize: '20px' }}>arrow_outward</span>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="card p-6">
            <h3 className="text-h3 text-navy mb-4">In the press</h3>
            <div className="space-y-4">
              {coverage.map((c) => (
                <div key={c.outlet} className="border-l-2 border-amber/40 pl-3">
                  <p className="text-navy text-sm italic leading-relaxed">{c.quote}</p>
                  <p className="text-slate text-xs font-semibold mt-1">— {c.outlet}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="card detach detach-dark bg-gradient-to-br from-navy-container to-navy text-white p-6">
            <h3 className="text-white font-bold text-lg">Media enquiries</h3>
            <p className="text-white/70 text-sm mt-2">Get brand assets, executive bios, and interview requests.</p>
            <a href="mailto:press@luxrent.com" className="btn-primary w-full mt-4 py-2.5 text-sm">
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>mail</span>
              press@luxrent.com
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
