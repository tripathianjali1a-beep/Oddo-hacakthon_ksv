import Link from 'next/link';
import PageHero from '@/components/ui/PageHero';

const stats = [
  { n: 'Inspected', l: 'Certified fleet' },
  { n: 'Transparent', l: 'Upfront pricing' },
  { n: 'Protected', l: 'Secure deposits' },
  { n: '24/7', l: 'Concierge support' },
];

const values = [
  { icon: 'diamond', title: 'Uncompromising quality', desc: 'Every unit is inspected and certified before it ever reaches your site.' },
  { icon: 'handshake', title: 'Trust by default', desc: 'Transparent pricing, protected payments, and honest reviews — always.' },
  { icon: 'bolt', title: 'Effortless experience', desc: 'From search to return, we obsess over removing friction at every step.' },
  { icon: 'public', title: 'National, local feel', desc: 'A nationwide depot network delivered with the care of a local yard.' },
];

const timeline = [
  { year: '2019', text: 'Rentora founded with a handful of excavators and generators in New York.' },
  { year: '2021', text: 'Expanded into studio gear and furniture, and launched the vendor marketplace.' },
  { year: '2023', text: 'Expanded the depot network and introduced 24/7 concierge support.' },
  { year: '2024', text: 'Grew the vendor marketplace with verified owners nationwide.' },
];

export default function AboutPage() {
  return (
    <div className="pb-16">
      <PageHero
        eyebrow="Our story"
        title="Equipment rental, reimagined"
        subtitle="Rentora connects contractors, studios and businesses with premium, inspected equipment — booked in seconds, backed by people who care."
        icon="construction"
        crumbs={[{ label: 'Home', href: '/home' }, { label: 'About' }]}
      />

      {/* Stats */}
      <div className="max-w-[1100px] mx-auto px-6 mt-12">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s) => (
            <div key={s.l} className="card p-6 text-center">
              <p className="text-navy font-bold text-3xl font-currency">{s.n}</p>
              <p className="text-slate text-xs uppercase tracking-wide mt-1">{s.l}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Mission */}
      <div className="max-w-[1100px] mx-auto px-6 mt-14 grid lg:grid-cols-2 gap-6 items-center">
        <div className="card overflow-hidden h-72 lg:h-80">
          <img src="/images/marketing/fleet-yard.jpg" alt="Fleet of Caterpillar excavators ready for dispatch" className="w-full h-full object-cover" />
        </div>
        <div>
          <p className="text-amber text-xs font-semibold uppercase tracking-widest mb-2">Our mission</p>
          <h2 className="text-navy font-bold text-2xl md:text-3xl leading-tight">Access over ownership, without compromise</h2>
          <p className="text-slate text-sm leading-relaxed mt-4">
            We believe the right equipment should be accessible, not just owned. Whether it&apos;s an excavator for a job site or a camera kit for a weekend shoot, Rentora makes premium equipment rentals feel effortless — with the inspection standards, transparency, and service you&apos;d expect from a five-star concierge.
          </p>
          <Link href="/browse" className="btn-primary mt-6 inline-flex px-6 py-3">
            Explore listings
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>arrow_forward</span>
          </Link>
        </div>
      </div>

      {/* Values */}
      <div className="max-w-[1100px] mx-auto px-6 mt-16">
        <h2 className="text-h2 text-navy text-center mb-8">What we stand for</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {values.map((v) => (
            <div key={v.title} className="card card-hover p-6">
              <span className="w-12 h-12 rounded-xl bg-amber/10 flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-amber" style={{ fontSize: '24px' }}>{v.icon}</span>
              </span>
              <h3 className="text-navy font-semibold text-base mb-1.5">{v.title}</h3>
              <p className="text-slate text-sm leading-relaxed">{v.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Timeline */}
      <div className="max-w-[760px] mx-auto px-6 mt-16">
        <h2 className="text-h2 text-navy text-center mb-8">Our journey</h2>
        <div className="relative pl-6 border-l-2 border-amber/30 space-y-6">
          {timeline.map((t) => (
            <div key={t.year} className="relative">
              <span className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-amber ring-4 ring-ivory" />
              <div className="card p-4">
                <p className="text-amber font-bold text-sm">{t.year}</p>
                <p className="text-navy text-sm mt-1">{t.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
