'use client';
import Link from 'next/link';
import { useState } from 'react';

interface CategorySpec {
  id: string;
  name: string;
  desc: string;
  icon: string;
  itemCount: number;
  startingPrice: string;
  image: string;
  subcategories: string[];
  badge: string;
  // Deep technical & rental information
  fleetBreakdown: { model: string; count: number; specs: string }[];
  certifications: string[];
  insurancePolicy: string;
  maintenanceGuarantee: string;
  depositTerms: string;
  deliveryRange: string;
}

const categoriesData: CategorySpec[] = [
  {
    id: 'heavy-machinery',
    name: 'Heavy Machinery & Earthmoving',
    desc: 'Excavators, bulldozers, wheel loaders, and cranes for major construction, mining, and infrastructure projects.',
    icon: 'construction',
    itemCount: 42,
    startingPrice: '$250/day',
    image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&q=80',
    subcategories: ['Excavators', 'Cranes & Lifts', 'Bulldozers', 'Compactors', 'Generators'],
    badge: 'High Demand',
    fleetBreakdown: [
      { model: 'CAT 320 Hydraulic Excavator', count: 18, specs: '172 HP, 22.1 ft Dig Depth, GPS 3D Grade Control' },
      { model: 'Komatsu D61PXI-24 Bulldozer', count: 12, specs: '168 HP, Intelligent Machine Control, PAT Blade' },
      { model: 'Liebherr LTM 1060 Mobile Crane', count: 8, specs: '65-Ton Capacity, 157 ft Telescopic Boom, 6x6x6 All-Terrain' },
      { model: 'CAT C15 500kW Diesel Generator', count: 4, specs: 'Sound-Attenuated Enclosure, 24h Fuel Tank, ATS Ready' },
    ],
    certifications: ['OSHA / NCCCO Crane & Heavy Equipment Operator Certification Required', 'Tier 4 Final EPA Clean Diesel Compliant', 'Daily GPS Telematics & Remote Diagnostics Enabled'],
    insurancePolicy: 'Comprehensive $2M Commercial General Liability waiver included or COI verification.',
    maintenanceGuarantee: 'Guaranteed 4-hour on-site emergency mobile mechanic response across 50-mile radius.',
    depositTerms: '$2,500 refundable security deposit or pre-approved commercial corporate credit line.',
    deliveryRange: 'Low-boy heavy transport flatbed delivery dispatched within 24 hours nationwide.',
  },
  {
    id: 'power-tools',
    name: 'Commercial Power Tools & Site Equipment',
    desc: 'Industrial-grade rotary hammers, demolition saws, welders, and high-CFM air compressors for contractors.',
    icon: 'handyman',
    itemCount: 128,
    startingPrice: '$25/day',
    image: 'https://images.unsplash.com/photo-1605731009813-8e0a0b2c2f4b?w=800&q=80',
    subcategories: ['Rotary Hammers', 'Demolition Saws', 'Air Compressors', 'Welders', 'Core Drills'],
    badge: 'Popular',
    fleetBreakdown: [
      { model: 'Hilti TE 3000-AVR Electric Breaker', count: 45, specs: '68 Joules Impact Energy, Active Vibration Reduction' },
      { model: 'Miller Bobcat 260 Engine Driven Welder', count: 28, specs: '11,000 Watts Peak Power, CC/CV Stick/TIG/MIG' },
      { model: 'Atlas Copco XAS 185 Portable Compressor', count: 35, specs: '185 CFM @ 100 PSI, Kubota Diesel, Towable' },
      { model: 'Husqvarna K1260 Gas Cut-Off Saw', count: 20, specs: '119cc Engine, 16" Blade Capacity, Active Air Filtration' },
    ],
    certifications: ['ANSI / OSHA Jobsite Safety Standard Tested', 'Insulated & Double-Insulated Electrical Safety Rating', 'Standard PPE & Eye Protection Checklist Provided'],
    insurancePolicy: 'Accidental Damage Protection (ADP) available at 12% surcharge.',
    maintenanceGuarantee: 'Instant same-day counter swap or jobsite replacement for any tool malfunction.',
    depositTerms: '$250 standard deposit or zero deposit for verified corporate contractors.',
    deliveryRange: 'Same-day courier delivery available within city limits or instant warehouse pickup.',
  },
  {
    id: 'scaffolding',
    name: 'Scaffolding & Aerial Work Platforms',
    desc: 'Self-propelled electric scissor lifts, articulating boom lifts, modular aluminum towers, and safety harnesses.',
    icon: 'engineering',
    itemCount: 65,
    startingPrice: '$80/day',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
    subcategories: ['Scissor Lifts', 'Articulating Booms', 'Modular Scaffolding', 'Ladders & Hoists'],
    badge: 'Safety Certified',
    fleetBreakdown: [
      { model: 'JLG 1930ES Electric Scissor Lift', count: 25, specs: '19 ft Working Height, 500 lb Capacity, Non-Marking Tires' },
      { model: 'Genie Z-45/25J Articulating Boom Lift', count: 18, specs: '51 ft Working Height, 30 ft Horizontal Reach, Bi-Energy' },
      { model: 'Safeway Heavy-Duty Steel Scaffolding System', count: 15, specs: '5x5 Walk-Through Frames, Leveling Jacks, Guard Rails' },
      { model: 'Material Hoist & Roof Ladder Lift', count: 7, specs: '400 lb Capacity, 44 ft Height, Gas Powered Winch' },
    ],
    certifications: ['OSHA Subpart L & ANSI A92.22 Aerial Work Platform Standards Compliant', 'Pre-Delivery 32-Point Annual Structural Inspection Certified', 'Operator Safety Harness & Lanyard Kit Included'],
    insurancePolicy: 'Mandatory Equipment Property Damage coverage ($1M minimum limit required).',
    maintenanceGuarantee: 'Battery health monitoring and free on-site charging system diagnostics.',
    depositTerms: '$500 refundable deposit or commercial account status.',
    deliveryRange: 'Tilt-deck truck delivery with jobsite placement & stabilization setup.',
  },
  {
    id: 'luxury-villas',
    name: 'Luxury Villas & Corporate Residences',
    desc: 'Exclusive high-end architectural retreats, executive board residences, and beachfront estates for filming or summits.',
    icon: 'villa',
    itemCount: 24,
    startingPrice: '$1,200/night',
    image: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800&q=80',
    subcategories: ['Beachfront Estates', 'Penthouse Suites', 'Corporate Retreats', 'Event Venues'],
    badge: 'Premium Fleet',
    fleetBreakdown: [
      { model: 'Malibu Oceanfront Architectural Villa', count: 4, specs: '8,500 sq ft, 6 Suites, Infinity Pool, Private Helipad Access' },
      { model: 'Manhattan Skyline Penthouse Loft', count: 6, specs: '5,000 sq ft, 360° Terrace, Private Elevator, Boardroom Ready' },
      { model: 'Aspen Mountain Executive Lodge', count: 8, specs: '10,000 sq ft, 8 Bed Suites, Commercial Kitchen, Ski-in/Ski-out' },
      { model: 'Miami Palm Island Waterfront Compound', count: 6, specs: '12,000 sq ft, 100ft Private Yacht Dock, Smart Home Automation' },
    ],
    certifications: ['City Commercial Event & Hospitality Permitted', '24/7 Private Security Guard & Biometric Access Control', 'Commercial High-Speed Fiber Internet & Backup Generator'],
    insurancePolicy: '$5M Event Liability Insurance coverage required prior to key handover.',
    maintenanceGuarantee: 'On-call private concierge, daily housekeeping, and technical event supervisor.',
    depositTerms: '$5,000 security hold returned within 48 hours post check-out inspection.',
    deliveryRange: 'Complimentary executive chauffeur airport transfer included for VIP guests.',
  },
  {
    id: 'electronics',
    name: 'Cinema & Audio/Visual Broadcast Systems',
    desc: '8K RED cinema packages, Sony full-frame mirrorless rigs, DJI enterprise thermal drones, and concert line arrays.',
    icon: 'videocam',
    itemCount: 89,
    startingPrice: '$60/day',
    image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&q=80',
    subcategories: ['Cinema Cameras', 'Lenses & Optics', 'Enterprise Drones', 'PA Systems', 'Lighting Rigs'],
    badge: 'Latest Tech',
    fleetBreakdown: [
      { model: 'RED V-Raptor 8K VV Cinema Package', count: 12, specs: '8K VistaVision Sensor, PL/EF Mount, 4x 2TB PROMAG, RED TOUCH' },
      { model: 'Arri Alexa Mini LF Production Kit', count: 8, specs: 'Large Format Sensor, Arri Signature Prime Lens Set (18mm-125mm)' },
      { model: 'DJI Mavic 3 Enterprise Thermal Drone', count: 22, specs: '48MP Wide, 56x Zoom, 640x512 Thermal Camera, RTK Module' },
      { model: 'L-Acoustics K2 Concert Line Array Rig', count: 10, specs: '24x K2 Elements, LA12X Amplified Controllers, Soundcraft Vi7000' },
    ],
    certifications: ['FAA Part 107 Drone Pilot Verification Required for Enterprise Drones', 'Sensor Cleanliness & Optical Collimation Verified Before Every Rental', 'Pelican Hard Case Impact & Waterproof Protection Guaranteed'],
    insurancePolicy: 'Inland Marine / Equipment Floater insurance required covering replacement cost.',
    maintenanceGuarantee: 'Hot-swap camera body emergency replacement within 3 hours in major cities.',
    depositTerms: '$1,000 security deposit or production company credit check.',
    deliveryRange: 'Secure armored courier hand-delivery or verified studio pick-up.',
  },
  {
    id: 'office-furniture',
    name: 'Executive Office & Corporate Event Suite',
    desc: 'Herman Miller ergonomic seating, motorized standing desks, modular boardroom tables, and acoustic partitions.',
    icon: 'chair',
    itemCount: 156,
    startingPrice: '$15/day',
    image: 'https://images.unsplash.com/photo-1541558869434-2840d308329a?w=800&q=80',
    subcategories: ['Ergonomic Seating', 'Standing Desks', 'Lounge Sofas', 'Staging & Podiums'],
    badge: 'Eco-Friendly',
    fleetBreakdown: [
      { model: 'Herman Miller Aeron Ergonomic Task Chair', count: 80, specs: 'Size B & C, Fully Adjustable PostureFit SL, Pellicle Mesh' },
      { model: 'Steelcase Migration Dual Standing Desk', count: 50, specs: '48" & 60" Bamboo Top, Dual Motor Quiet Lift, Cable Troughs' },
      { model: 'Knoll Florence Modular Executive Sofa', count: 30, specs: 'Top-Grain Italian Black Leather, Chrome Frame, 3-Seater' },
      { model: 'Modular Aluminum Staging Podium Stage Set', count: 20, specs: '4x8 ft Sections, Adjustable Height (16"-32"), Black Skirting' },
    ],
    certifications: ['GREENGUARD Gold Low Chemical Emission Certified', 'BIFMA Commercial Heavy-Duty Durability Standard Approved', 'Sanitized & Steam-Cleaned Upholstery Guarantee Before Delivery'],
    insurancePolicy: 'Standard damage waiver covers incidental scuffs and regular wear.',
    maintenanceGuarantee: 'White-glove assembly, leveling, and post-event teardown included.',
    depositTerms: '$100 standard deposit or net-30 terms for registered enterprise clients.',
    deliveryRange: 'Scheduled white-glove inside delivery, floor protection, and debris removal.',
  },
];

export default function CategoriesPage() {
  const [selectedBadge, setSelectedBadge] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeModalSpec, setActiveModalSpec] = useState<CategorySpec | null>(null);
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

      {/* Hero Banner with clean responsive typography */}
      <section className="bg-navy text-white py-16 px-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#D97706_1px,transparent_1px)] [background-size:16px_16px]" />
        <div className="max-w-4xl mx-auto relative z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-amber text-xs font-semibold uppercase tracking-widest mb-4 border border-white/10">
            <span className="material-symbols-outlined shrink-0" style={{ fontSize: '16px' }}>category</span>
            <span>Comprehensive Inventory & Technical Specifications</span>
          </span>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">Explore Equipment by Category</h1>
          <p className="text-on-navy text-base mx-auto max-w-[680px]">
            From industrial earthmoving equipment to high-end cinema packages and executive suites. Every item is inspected, certified, and backed by our 4-hour on-site maintenance guarantee.
          </p>

          {/* Live Fleet Matrix Highlights */}
          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto text-left">
            <div className="bg-white/5 border border-white/10 p-3.5 rounded-xl">
              <span className="text-[11px] text-amber font-bold uppercase block">Total Fleet Size</span>
              <p className="text-xl font-extrabold text-white">400+ Units</p>
            </div>
            <div className="bg-white/5 border border-white/10 p-3.5 rounded-xl">
              <span className="text-[11px] text-amber font-bold uppercase block">Safety Standard</span>
              <p className="text-xl font-extrabold text-white">100% OSHA / ANSI</p>
            </div>
            <div className="bg-white/5 border border-white/10 p-3.5 rounded-xl">
              <span className="text-[11px] text-amber font-bold uppercase block">Emergency SLA</span>
              <p className="text-xl font-extrabold text-white">&lt; 4 Hours On-Site</p>
            </div>
            <div className="bg-white/5 border border-white/10 p-3.5 rounded-xl">
              <span className="text-[11px] text-amber font-bold uppercase block">Booking Fees</span>
              <p className="text-xl font-extrabold text-white">$0 Commercial</p>
            </div>
          </div>

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
                  <div className="relative h-52 w-full overflow-hidden bg-slate/10">
                    <img
                      src={cat.image}
                      alt={cat.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                    <span className="absolute top-4 right-4 bg-amber text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-md">
                      {cat.badge}
                    </span>
                    <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-white">
                      <div className="flex items-center gap-2">
                        <div className="w-9 h-9 rounded-lg bg-amber/90 text-white flex items-center justify-center backdrop-blur-sm shadow-md">
                          <span className="material-symbols-outlined shrink-0" style={{ fontSize: '20px' }}>{cat.icon}</span>
                        </div>
                        <span className="font-bold text-sm text-white drop-shadow">{cat.itemCount} Units Available</span>
                      </div>
                      <span className="text-xs font-bold bg-black/60 backdrop-blur-sm px-2.5 py-1 rounded border border-white/20">
                        From {cat.startingPrice}
                      </span>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-6 space-y-4">
                    <div>
                      <h3 className="text-xl font-bold text-navy group-hover:text-amber transition-colors mb-1.5">
                        {cat.name}
                      </h3>
                      <p className="text-slate text-xs leading-relaxed">
                        {cat.desc}
                      </p>
                    </div>

                    {/* Technical Summary Box */}
                    <div className="bg-ivory/80 rounded-xl p-3.5 border border-slate/15 text-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-slate font-medium">Core Fleet Spec:</span>
                        <span className="font-bold text-navy truncate max-w-[180px]">{cat.fleetBreakdown[0].model}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate font-medium">Compliance:</span>
                        <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[11px] border border-emerald-200">
                          {cat.certifications[0].split(' ')[0]} Verified
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate font-medium">Security Deposit:</span>
                        <span className="font-bold text-purple-700">{cat.depositTerms.split(' ')[0]}</span>
                      </div>
                    </div>

                    {/* Subcategories Tags */}
                    <div>
                      <span className="text-[10px] font-bold text-slate uppercase tracking-wider block mb-1.5">Available Sub-Categories:</span>
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

                {/* Card Footer Actions */}
                <div className="p-6 pt-0 mt-auto flex flex-col sm:flex-row gap-2">
                  <button
                    type="button"
                    onClick={() => { setActiveModalSpec(cat); triggerToast(`Opened technical breakdown & fleet matrix for ${cat.name}`); }}
                    className="btn-secondary flex-1 py-2.5 text-xs font-bold flex items-center justify-center gap-1.5 hover:border-purple-600 hover:text-purple-700"
                  >
                    <span className="material-symbols-outlined shrink-0 text-sm" style={{ fontSize: '16px' }}>fact_check</span>
                    <span>View Specs & Fleet Info</span>
                  </button>
                  <Link
                    href={`/browse?cat=${encodeURIComponent(cat.name.split(' ')[0])}`}
                    className="btn-primary flex-1 py-2.5 text-xs font-bold flex items-center justify-center gap-1 shadow-md group-hover:bg-amber transition-colors"
                  >
                    <span>Browse Catalog</span>
                    <span className="material-symbols-outlined shrink-0 text-sm" style={{ fontSize: '16px' }}>arrow_forward</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Technical Specification & Fleet Matrix Modal */}
        {activeModalSpec && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in overflow-y-auto">
            <div className="bg-white rounded-2xl max-w-3xl w-full p-6 md:p-8 shadow-2xl border border-slate/20 space-y-6 max-h-[90vh] overflow-y-auto relative">
              <div className="flex items-start justify-between pb-4 border-b border-slate/15">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-navy text-amber flex items-center justify-center shadow-md shrink-0">
                    <span className="material-symbols-outlined" style={{ fontSize: '28px' }}>{activeModalSpec.icon}</span>
                  </div>
                  <div>
                    <span className="px-2.5 py-0.5 rounded-full bg-amber/15 text-amber text-[10px] font-black uppercase tracking-wider">
                      {activeModalSpec.badge} • Technical Dossier
                    </span>
                    <h2 className="text-xl md:text-2xl font-black text-navy mt-0.5">{activeModalSpec.name}</h2>
                  </div>
                </div>
                <button
                  onClick={() => setActiveModalSpec(null)}
                  className="w-9 h-9 rounded-full bg-slate/10 hover:bg-rose-100 hover:text-rose-600 text-slate flex items-center justify-center transition-colors"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>close</span>
                </button>
              </div>

              {/* Description & Overview */}
              <p className="text-xs md:text-sm text-slate leading-relaxed bg-ivory p-4 rounded-xl border border-slate/15 font-medium">
                {activeModalSpec.desc}
              </p>

              {/* Fleet Matrix Table */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-navy flex items-center gap-2">
                  <span className="material-symbols-outlined text-purple-600" style={{ fontSize: '18px' }}>inventory_2</span>
                  <span>Active Models & Technical Specifications ({activeModalSpec.itemCount} Units Total)</span>
                </h3>
                <div className="border border-slate/20 rounded-xl overflow-hidden shadow-sm">
                  <table className="w-full text-left text-xs font-medium">
                    <thead className="bg-navy text-white text-[11px] uppercase tracking-wider">
                      <tr>
                        <th className="py-3 px-4 font-bold">Equipment Model</th>
                        <th className="py-3 px-4 font-bold text-center">Fleet Count</th>
                        <th className="py-3 px-4 font-bold">Key Technical Specs</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate/10 bg-white text-navy">
                      {activeModalSpec.fleetBreakdown.map((row, i) => (
                        <tr key={i} className="hover:bg-amber/5">
                          <td className="py-3 px-4 font-bold text-sm text-navy">{row.model}</td>
                          <td className="py-3 px-4 text-center font-extrabold text-purple-700">{row.count} Units</td>
                          <td className="py-3 px-4 text-slate font-medium">{row.specs}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Policies & Compliance Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-purple-50/60 border border-purple-200 rounded-xl p-4 space-y-2">
                  <h4 className="text-xs font-bold text-purple-900 uppercase flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-purple-700" style={{ fontSize: '18px' }}>verified</span>
                    <span>Safety & Certifications</span>
                  </h4>
                  <ul className="list-disc pl-4 space-y-1 text-xs text-purple-950 font-medium">
                    {activeModalSpec.certifications.map((c, i) => (
                      <li key={i}>{c}</li>
                    ))}
                  </ul>
                </div>

                <div className="bg-emerald-50/60 border border-emerald-200 rounded-xl p-4 space-y-2">
                  <h4 className="text-xs font-bold text-emerald-900 uppercase flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-emerald-700" style={{ fontSize: '18px' }}>shield</span>
                    <span>Insurance & SLA Guarantee</span>
                  </h4>
                  <p className="text-xs text-emerald-950 font-medium">
                    <strong>Insurance:</strong> {activeModalSpec.insurancePolicy}
                  </p>
                  <p className="text-xs text-emerald-950 font-medium">
                    <strong>Maintenance SLA:</strong> {activeModalSpec.maintenanceGuarantee}
                  </p>
                </div>
              </div>

              {/* Logistics Terms */}
              <div className="bg-amber/10 border border-amber/30 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="space-y-1 text-xs text-amber-950 font-medium">
                  <p><strong>Security Deposit Terms:</strong> {activeModalSpec.depositTerms}</p>
                  <p><strong>Logistics & Dispatch:</strong> {activeModalSpec.deliveryRange}</p>
                </div>
                <button
                  type="button"
                  onClick={() => triggerToast(`Downloading official PDF spec sheet for ${activeModalSpec.name}...`)}
                  className="bg-white hover:bg-navy hover:text-white text-navy border border-amber/40 text-xs font-bold px-4 py-2 rounded-lg shrink-0 flex items-center gap-1.5 transition-all shadow-sm"
                >
                  <span className="material-symbols-outlined shrink-0" style={{ fontSize: '16px' }}>download</span>
                  <span>Spec Sheet PDF</span>
                </button>
              </div>

              {/* Footer Modal Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate/15">
                <button
                  type="button"
                  onClick={() => setActiveModalSpec(null)}
                  className="btn-secondary py-2 px-5 text-xs font-bold"
                >
                  Close Dossier
                </button>
                <Link
                  href={`/browse?cat=${encodeURIComponent(activeModalSpec.name.split(' ')[0])}`}
                  onClick={() => setActiveModalSpec(null)}
                  className="btn-primary py-2 px-6 text-xs font-bold flex items-center gap-1.5 shadow-md"
                >
                  <span>Browse Available {activeModalSpec.name.split(' ')[0]} Units</span>
                  <span className="material-symbols-outlined text-sm">arrow_outward</span>
                </Link>
              </div>
            </div>
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
