import PageHero from '@/components/ui/PageHero';

const perks = [
  { icon: 'payments', title: 'Competitive pay & equity' },
  { icon: 'health_and_safety', title: 'Full health coverage' },
  { icon: 'flight', title: 'Annual travel credit' },
  { icon: 'laptop_mac', title: 'Remote-first culture' },
  { icon: 'school', title: 'Learning budget' },
  { icon: 'self_improvement', title: 'Wellness stipend' },
];

const roles = [
  { title: 'Senior Frontend Engineer', team: 'Engineering', location: 'Remote · Global', type: 'Full-time' },
  { title: 'Product Designer', team: 'Design', location: 'New York, NY', type: 'Full-time' },
  { title: 'Operations Lead', team: 'Operations', location: 'London, UK', type: 'Full-time' },
  { title: 'Customer Concierge', team: 'Support', location: 'Remote · US', type: 'Full-time' },
  { title: 'Growth Marketer', team: 'Marketing', location: 'Remote · EU', type: 'Contract' },
];

export default function CareersPage() {
  return (
    <div className="pb-16">
      <PageHero
        eyebrow="Careers"
        title="Build the future of rentals"
        subtitle="We're a small, ambitious team on a mission to make premium access effortless. Come build with us."
        icon="rocket_launch"
        crumbs={[{ label: 'Home', href: '/home' }, { label: 'Careers' }]}
      />

      {/* Perks */}
      <div className="max-w-[1100px] mx-auto px-6 mt-14">
        <h2 className="text-h2 text-navy text-center mb-8">Why you&apos;ll love it here</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {perks.map((p) => (
            <div key={p.title} className="card p-5 flex items-center gap-3">
              <span className="w-10 h-10 rounded-xl bg-amber/10 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-amber" style={{ fontSize: '20px' }}>{p.icon}</span>
              </span>
              <p className="text-navy font-semibold text-sm">{p.title}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Open roles */}
      <div className="max-w-[900px] mx-auto px-6 mt-16">
        <h2 className="text-h2 text-navy mb-1">Open positions</h2>
        <p className="text-slate text-sm mb-6">{roles.length} roles across every team.</p>
        <div className="flex flex-col gap-3">
          {roles.map((r) => (
            <div key={r.title} className="card card-hover p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group cursor-pointer">
              <div>
                <h3 className="text-navy font-semibold text-base group-hover:text-amber transition-colors">{r.title}</h3>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <span className="badge-navy text-[10px]">{r.team}</span>
                  <span className="text-slate text-xs flex items-center gap-1"><span className="material-symbols-outlined" style={{ fontSize: '14px' }}>location_on</span>{r.location}</span>
                  <span className="text-slate text-xs flex items-center gap-1"><span className="material-symbols-outlined" style={{ fontSize: '14px' }}>schedule</span>{r.type}</span>
                </div>
              </div>
              <span className="btn-secondary text-xs py-2 px-4 shrink-0 self-start sm:self-auto">
                Apply
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>arrow_forward</span>
              </span>
            </div>
          ))}
        </div>
        <div className="card p-6 text-center mt-6">
          <p className="text-slate text-sm">Don&apos;t see your role? We&apos;re always meeting great people.</p>
          <a href="mailto:careers@luxrent.com" className="btn-ghost mt-2 inline-flex text-amber">careers@luxrent.com</a>
        </div>
      </div>
    </div>
  );
}
