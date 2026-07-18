'use client';
import Link from 'next/link';
import { useState } from 'react';

const categoriesData = [
  {
    id: 'heavy-machinery',
    name: 'Heavy Machinery & Earthmoving',
    desc: 'Excavators, bulldozers, wheel loaders, and cranes for major construction and infrastructure projects.',
    icon: 'construction',
    itemCount: 42,
    startingPrice: '$250/day',
    image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&q=80',
    subcategories: ['Excavators', 'Cranes & Lifts', 'Bulldozers', 'Compactors', 'Generators'],
    badge: 'High Demand',
  },
  {
    id: 'power-tools',
    name: 'Commercial Power Tools',
    desc: 'Industrial-grade drilling, cutting, grinding, and fastening tools with cordless and pneumatic options.',
    icon: 'handyman',
    itemCount: 128,
    startingPrice: '$25/day',
    image: 'https://images.unsplash.com/photo-1605731009813-8e0a0b2c2f4b?w=800&q=80',
    subcategories: ['Rotary Hammers', 'Demolition Saws', 'Air Compressors', 'Welders', 'Core Drills'],
    badge: 'Popular',
  },
  {
    id: 'scaffolding',
    name: 'Scaffolding & Aerial Lifts',
    desc: 'Self-propelled scissor lifts, boom lifts, scaffolding towers, and fall protection safety kits.',
    icon: 'engineering',
    itemCount: 65,
    startingPrice: '$80/day',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
    subcategories: ['Scissor Lifts', 'Articulating Booms', 'Modular Scaffolding', 'Ladders & Hoists'],
    badge: 'Safety Certified',
  },
  {
    id: 'luxury-villas',
    name: 'Luxury Villas & Residences',
    desc: 'Exclusive high-end corporate retreats, executive accommodations, and production filming estates.',
    icon: 'villa',
    itemCount: 24,
    startingPrice: '$1,200/night',
    image: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800&q=80',
    subcategories: ['Beachfront Estates', 'Penthouse Suites', 'Corporate Retreats', 'Event Venues'],
    badge: 'Premium Fleet',
  },
  {
    id: 'electronics',
    name: 'Cinema & Audio/Visual Systems',
    desc: 'RED cinema cameras, Sony mirrorless packages, DJI enterprise drones, and concert sound rigs.',
    icon: 'videocam',
    itemCount: 89,
    startingPrice: '$60/day',
    image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&q=80',
    subcategories: ['Cinema Cameras', 'Lenses & Optics', 'Enterprise Drones', 'PA Systems', 'Lighting Rigs'],
    badge: 'Latest Tech',
  },
  {
    id: 'office-furniture',
    name: 'Executive Office & Event Furniture',
    desc: 'Herman Miller ergonomic chairs, modular lounge seating, staging podiums, and banquet tables.',
    icon: 'chair',
    itemCount: 156,
    startingPrice: '$15/day',
    image: 'https://images.unsplash.com/photo-1541558869434-2840d308329a?w=800&q=80',
    subcategories: ['Ergonomic Seating', 'Standing Desks', 'Lounge Sofas', 'Staging & Podiums'],
    badge: 'Eco-Friendly',
  },
];

export default function CategoriesPage() {
  const [selectedBadge, setSelectedBadge] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [toast, setToast] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const filteredCategories = categoriesData.filter((cat) => {
    const matchesBadge = selectedBadge === 'All' || cat.badge === selectedBadge;
    const matchesSearch =
      cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cat.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cat.subcategories.some((sub) => sub.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesBadge && matchesSearch;
  });

  const badges = ['All', 'High Demand', 'Popular', 'Safety Certified', 'Premium Fleet', 'Latest Tech', 'Eco-Friendly'];

  return (
    <div className="bg-ivory/40 min-h-screen pb-20 relative">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-navy text-white px-5 py-3.5 rounded-xl shadow-2xl border border-amber/30 flex items-center gap-3 animate-slide-up">
          <span className="material-symbols-outlined shrink-0 text-amber" style={{ fontSize: '20px' }}>check_circle</span>
          <span className="text-sm font-semibold">{toast}</span>
        </div>
      )}

      {/* Hero Banner */}
      <section className="bg-navy text-white py-16 px-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#D97706_1px,transparent_1px)] [background-size:16px_16px]" />
        <div className="max-w-4xl mx-auto relative z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-amber text-xs font-semibold uppercase tracking-widest mb-4 border border-white/10">
            <span className="material-symbols-outlined shrink-0" style={{ fontSize: '16px' }}>category</span>
            <span>Comprehensive Inventory Catalog</span>
          </span>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">Explore Equipment by Category</h1>
          <p className="text-on-navy text-base max-w-2xl mx-auto">
            From industrial earthmoving equipment to high-end cinema packages and executive suites. Every item is inspected, certified, and ready for immediate deployment.
          </p>

          {/* Search Bar inside Hero */}
          <div className="mt-8 max-w-lg mx-auto relative">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate/60 shrink-0" style={{ fontSize: '20px' }}>search</span>
            <input
              type="text"
              placeholder="Search categories, items, or equipment types..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3.5 rounded-full bg-white text-navy placeholder:text-slate text-sm font-medium shadow-xl border border-amber/20 focus:outline-none focus:ring-2 focus:ring-amber"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate hover:text-navy text-xs font-bold"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-[1440px] mx-auto px-6 py-12">
        {/* Badge Filter Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
          {badges.map((b) => (
            <button
              key={b}
              onClick={() => setSelectedBadge(b)}
              className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                selectedBadge === b
                  ? 'bg-navy text-white shadow-md scale-105'
                  : 'bg-white text-slate hover:text-navy border border-slate/15 hover:border-amber'
              }`}
            >
              {b}
            </button>
          ))}
        </div>

        {/* Categories Grid */}
        {filteredCategories.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate/15 max-w-lg mx-auto">
            <span className="material-symbols-outlined text-slate/40 text-6xl mb-3" style={{ fontSize: '64px' }}>search_off</span>
            <h3 className="text-xl font-bold text-navy mb-2">No categories found</h3>
            <p className="text-slate text-sm mb-6">We couldn&apos;t find any categories matching your search criteria.</p>
            <button
              onClick={() => { setSelectedBadge('All'); setSearchQuery(''); triggerToast('Filters reset to default.'); }}
              className="btn-primary py-2.5 px-6 text-sm"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCategories.map((cat) => (
              <div
                key={cat.id}
                className="bg-white rounded-2xl overflow-hidden border border-slate/15 shadow-sm hover:shadow-xl hover:border-amber transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  {/* Card Header Image */}
                  <div className="relative h-48 w-full overflow-hidden bg-slate/10">
                    <img
                      src={cat.image}
                      alt={cat.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    <span className="absolute top-4 right-4 bg-amber text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-md">
                      {cat.badge}
                    </span>
                    <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white">
                      <div className="flex items-center gap-2">
                        <div className="w-9 h-9 rounded-lg bg-amber/90 text-white flex items-center justify-center backdrop-blur-sm">
                          <span className="material-symbols-outlined shrink-0" style={{ fontSize: '20px' }}>{cat.icon}</span>
                        </div>
                        <span className="font-bold text-sm text-white drop-shadow">{cat.itemCount} Items Available</span>
                      </div>
                      <span className="text-xs font-semibold bg-black/50 backdrop-blur-sm px-2.5 py-1 rounded border border-white/20">
                        From {cat.startingPrice}
                      </span>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-navy group-hover:text-amber transition-colors mb-2">
                      {cat.name}
                    </h3>
                    <p className="text-slate text-xs leading-relaxed mb-5">
                      {cat.desc}
                    </p>

                    {/* Subcategories Tags */}
                    <div className="space-y-2">
                      <span className="text-[10px] font-bold text-slate uppercase tracking-wider block">Featured Sub-Categories:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {cat.subcategories.map((sub, idx) => (
                          <Link
                            key={idx}
                            href={`/browse?cat=${encodeURIComponent(sub)}`}
                            onClick={() => triggerToast(`Filtering inventory by subcategory: ${sub}`)}
                            className="bg-ivory hover:bg-amber/15 hover:text-amber text-navy text-xs font-medium px-2.5 py-1 rounded-md border border-slate/10 transition-colors"
                          >
                            {sub}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Footer Action */}
                <div className="p-6 pt-0 mt-auto">
                  <Link
                    href={`/browse?cat=${encodeURIComponent(cat.name.split(' ')[0])}`}
                    onClick={() => triggerToast(`Viewing full catalog for ${cat.name}`)}
                    className="btn-primary w-full py-3 text-sm flex items-center justify-center gap-2 shadow-md group-hover:bg-amber transition-colors"
                  >
                    <span>Browse {cat.name.split(' ')[0]} Catalog</span>
                    <span className="material-symbols-outlined shrink-0" style={{ fontSize: '18px' }}>arrow_forward</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Bottom Banner */}
        <div className="mt-16 bg-gradient-to-r from-navy to-navy-container text-white rounded-2xl p-8 md:p-12 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 border border-amber/20">
          <div>
            <span className="badge-amber mb-2">Custom Procurement</span>
            <h2 className="text-2xl md:text-3xl font-bold mt-1">Need specialized equipment not listed here?</h2>
            <p className="text-on-navy text-sm mt-2 max-w-xl">
              Our enterprise sourcing team can acquire and deliver custom heavy machinery, tailored IT racks, or bespoke architectural staging across North America within 48 hours.
            </p>
          </div>
          <Link
            href="/contact"
            onClick={() => triggerToast('Opening enterprise procurement request desk...')}
            className="btn-primary py-3.5 px-8 text-sm shrink-0 flex items-center gap-2 shadow-lg"
          >
            <span className="material-symbols-outlined shrink-0" style={{ fontSize: '20px' }}>support_agent</span>
            <span>Contact Sourcing Team</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
