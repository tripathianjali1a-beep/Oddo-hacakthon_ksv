'use client';
import { useState } from 'react';
import Link from 'next/link';

const faqCategories = [
  { id: 'all', label: 'All Topics', icon: 'explore' },
  { id: 'booking', label: 'Booking & Rentals', icon: 'calendar_month' },
  { id: 'payments', label: 'Payments & Deposits', icon: 'payments' },
  { id: 'equipment', label: 'Equipment & Condition', icon: 'build' },
  { id: 'account', label: 'Account & Verification', icon: 'verified_user' },
];

const faqs = [
  {
    id: 1,
    category: 'booking',
    question: 'How does instant booking work for luxury properties and equipment?',
    answer: 'Listings marked with "Instant Booking" can be reserved immediately without waiting for vendor pre-approval. Once your payment method and security deposit authorization are verified, your reservation date is locked and confirmation details along with check-in/pickup instructions are dispatched via email and SMS.',
  },
  {
    id: 2,
    category: 'payments',
    question: 'When is the security deposit charged and how soon is it refunded?',
    answer: 'A hold for the security deposit is placed on your card 24 hours prior to the rental start date. We do not capture the funds unless damage or late returns occur. Upon successful return and condition verification by the vendor, the hold is released immediately, typically reflecting on your bank statement within 3 to 5 business days.',
  },
  {
    id: 3,
    category: 'equipment',
    question: 'What happens if equipment experiences technical issues during my rental period?',
    answer: 'Every piece of machinery or equipment comes with 24/7 concierge support. If you experience unexpected operational faults or breakdown, contact our emergency hotline right away. We arrange immediate field dispatch for repair or provide a like-for-like replacement at zero additional charge.',
  },
  {
    id: 4,
    category: 'booking',
    question: 'Can I extend my rental period after the booking has already started?',
    answer: 'Yes! You can request an extension directly from your active orders dashboard or by reaching out to support. Extensions are subject to item availability and standard daily/weekly pricing tiers.',
  },
  {
    id: 5,
    category: 'account',
    question: 'What identity verification is required before renting heavy machinery or high-value items?',
    answer: 'For equipment valued over $10,000 or specialized machinery, renters must complete our automated identity verification by uploading a government-issued photo ID and valid insurance certificates or relevant operating permits.',
  },
  {
    id: 6,
    category: 'payments',
    question: 'Are there any cancellation fees if my project schedule changes?',
    answer: 'Cancellations made at least 48 hours before the scheduled pickup or check-in receive a 100% full refund with no penalties. Cancellations within 48 hours incur a 1-day base rental charge.',
  },
];

export default function SupportPage() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [openFaq, setOpenFaq] = useState<number | null>(1);
  const [formData, setFormData] = useState({ name: '', email: '', subject: 'General Inquiry', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const filteredFaqs = faqs.filter((faq) => {
    const matchesCat = activeCategory === 'all' || faq.category === activeCategory;
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const toggleFaq = (id: number) => {
    setOpenFaq((prev) => (prev === id ? null : id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setSubmitting(false);
    setSubmitted(true);
    setFormData({ name: '', email: '', subject: 'General Inquiry', message: '' });
    setTimeout(() => setSubmitted(false), 5000);
  };

  return (
    <div className="min-h-screen bg-ivory/50 pb-20">
      {/* Hero Banner */}
      <section className="bg-navy text-white py-16 px-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="max-w-[1440px] mx-auto relative z-10 text-center">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/10 text-amber text-xs font-semibold uppercase tracking-widest mb-4 border border-white/10">
            <span className="material-symbols-outlined shrink-0" style={{ fontSize: '16px' }}>help_center</span>
            <span>Support & Concierge</span>
          </span>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">How can we help you today?</h1>
          <p className="text-on-navy text-sm md:text-base mb-8">
            Explore our instant knowledge base, troubleshoot rentals, or connect directly with our 24/7 dedicated support team.
          </p>

          {/* Search Box */}
          <div className="relative max-w-xl mx-auto">
            <span className="material-symbols-outlined shrink-0 absolute left-4 top-1/2 -translate-y-1/2 text-slate/60" style={{ fontSize: '22px' }}>search</span>
            <input
              type="text"
              placeholder="Search questions, policies, equipment care..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-white text-navy placeholder-slate text-sm shadow-xl focus:outline-none focus:ring-2 focus:ring-amber transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate hover:text-navy p-1 flex items-center justify-center"
              >
                <span className="material-symbols-outlined shrink-0" style={{ fontSize: '18px' }}>close</span>
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-[1440px] mx-auto px-6 py-12">
        {/* Contact Channel Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16 -mt-8 relative z-20">
          <div className="bg-white rounded-xl p-6 shadow-lg border border-slate/10 flex flex-col items-start card-hover">
            <div className="w-12 h-12 rounded-xl bg-amber/10 text-amber flex items-center justify-center mb-4">
              <span className="material-symbols-outlined shrink-0" style={{ fontSize: '26px' }}>support_agent</span>
            </div>
            <h3 className="font-bold text-navy text-lg mb-1">24/7 Phone Concierge</h3>
            <p className="text-slate text-xs mb-4 leading-relaxed">Urgent assistance for active rentals, on-site breakdowns, and emergency dispatch.</p>
            <a href="tel:18005550199" className="text-amber font-semibold text-sm flex items-center gap-1 mt-auto hover:underline">
              <span>+1 (800) 555-0199</span>
              <span className="material-symbols-outlined shrink-0" style={{ fontSize: '16px' }}>arrow_forward</span>
            </a>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border border-slate/10 flex flex-col items-start card-hover">
            <div className="w-12 h-12 rounded-xl bg-navy/10 text-navy flex items-center justify-center mb-4">
              <span className="material-symbols-outlined shrink-0" style={{ fontSize: '26px' }}>chat</span>
            </div>
            <h3 className="font-bold text-navy text-lg mb-1">Live Chat Support</h3>
            <p className="text-slate text-xs mb-4 leading-relaxed">Instant messaging with our verification specialists and booking coordinators.</p>
            <button
              onClick={() => alert('Connecting you to a live concierge agent...')}
              className="text-navy font-semibold text-sm flex items-center gap-1 mt-auto hover:text-amber transition-colors"
            >
              <span>Start Live Chat</span>
              <span className="material-symbols-outlined shrink-0" style={{ fontSize: '16px' }}>arrow_forward</span>
            </button>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border border-slate/10 flex flex-col items-start card-hover">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center mb-4">
              <span className="material-symbols-outlined shrink-0" style={{ fontSize: '26px' }}>mail</span>
            </div>
            <h3 className="font-bold text-navy text-lg mb-1">Email Support Team</h3>
            <p className="text-slate text-xs mb-4 leading-relaxed">For billing documentation, vendor onboarding inquiries, and insurance verification.</p>
            <a href="mailto:support@luxrent.com" className="text-emerald-600 font-semibold text-sm flex items-center gap-1 mt-auto hover:underline">
              <span>support@luxrent.com</span>
              <span className="material-symbols-outlined shrink-0" style={{ fontSize: '16px' }}>arrow_forward</span>
            </a>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* FAQ Categories Sidebar */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-xl p-5 border border-slate/10 sticky top-24 shadow-sm">
              <h2 className="text-sm font-bold text-navy uppercase tracking-wider mb-4 pb-3 border-b border-slate/10 flex items-center gap-2">
                <span className="material-symbols-outlined shrink-0 text-amber" style={{ fontSize: '20px' }}>category</span>
                <span>Topics & Categories</span>
              </h2>
              <div className="flex flex-col gap-1.5">
                {faqCategories.map((cat) => {
                  const isActive = activeCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setActiveCategory(cat.id)}
                      className={`flex items-center gap-3 px-3.5 py-3 rounded-lg text-sm font-medium transition-all text-left ${
                        isActive
                          ? 'bg-navy text-white shadow-md font-semibold'
                          : 'text-slate hover:bg-surface-low hover:text-navy'
                      }`}
                    >
                      <span className="material-symbols-outlined shrink-0" style={{ fontSize: '20px' }}>{cat.icon}</span>
                      <span>{cat.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* FAQ Accordion List */}
          <div className="lg:col-span-8">
            <div className="mb-6 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-navy">Frequently Asked Questions</h2>
                <p className="text-xs text-slate mt-1">
                  Showing {filteredFaqs.length} {filteredFaqs.length === 1 ? 'result' : 'results'}
                  {searchQuery && ` for "${searchQuery}"`}
                </p>
              </div>
              {(activeCategory !== 'all' || searchQuery) && (
                <button
                  onClick={() => { setActiveCategory('all'); setSearchQuery(''); }}
                  className="text-xs text-amber font-semibold hover:underline flex items-center gap-1"
                >
                  <span>Reset filters</span>
                </button>
              )}
            </div>

            {filteredFaqs.length === 0 ? (
              <div className="bg-white rounded-xl p-12 text-center border border-slate/10 shadow-sm">
                <span className="material-symbols-outlined shrink-0 text-slate/30 text-5xl mb-3">search_off</span>
                <h3 className="font-bold text-navy text-base mb-1">No matching questions found</h3>
                <p className="text-xs text-slate mb-4">Try adjusting your keywords or browse all categories.</p>
                <button
                  onClick={() => { setActiveCategory('all'); setSearchQuery(''); }}
                  className="btn-secondary text-xs py-2 px-4 flex items-center justify-center gap-1.5 mx-auto"
                >
                  <span>View All FAQs</span>
                </button>
              </div>
            ) : (
              <div className="space-y-3.5">
                {filteredFaqs.map((faq) => {
                  const isOpen = openFaq === faq.id;
                  return (
                    <div
                      key={faq.id}
                      className={`bg-white rounded-xl border transition-all overflow-hidden ${
                        isOpen ? 'border-amber shadow-md' : 'border-slate/15 hover:border-slate/30'
                      }`}
                    >
                      <button
                        onClick={() => toggleFaq(faq.id)}
                        className="w-full p-5 text-left flex justify-between items-center gap-4 focus:outline-none"
                      >
                        <span className="font-semibold text-navy text-sm md:text-base leading-snug">{faq.question}</span>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-transform shrink-0 ${isOpen ? 'bg-amber text-white rotate-180' : 'bg-surface-low text-slate'}`}>
                          <span className="material-symbols-outlined shrink-0" style={{ fontSize: '20px' }}>expand_more</span>
                        </div>
                      </button>
                      {isOpen && (
                        <div className="px-5 pb-5 pt-1 text-slate text-sm leading-relaxed border-t border-slate/10 bg-ivory/30 animate-fade-in">
                          {faq.answer}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Help Request Form Box */}
            <div className="mt-14 bg-white rounded-xl p-8 border border-slate/15 shadow-sm">
              <div className="w-full">
                <h3 className="text-xl font-bold text-navy mb-1 flex items-center gap-2">
                  <span className="material-symbols-outlined shrink-0 text-amber" style={{ fontSize: '24px' }}>contact_support</span>
                  <span>Can&apos;t find what you&apos;re looking for?</span>
                </h3>
                <p className="text-xs text-slate mb-6">
                  Submit a ticket to our concierge team and receive a personalized response within 2 hours.
                </p>

                {submitted && (
                  <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 text-sm flex items-center gap-3 animate-fade-in">
                    <span className="material-symbols-outlined shrink-0" style={{ fontSize: '24px' }}>check_circle</span>
                    <div>
                      <p className="font-bold">Message sent successfully!</p>
                      <p className="text-xs">A support specialist will follow up at {formData.email || 'your email'} shortly.</p>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate uppercase tracking-wide mb-1.5">Your Name *</label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Sarah Jenkins"
                        className="input-field text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate uppercase tracking-wide mb-1.5">Email Address *</label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="sarah@example.com"
                        className="input-field text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate uppercase tracking-wide mb-1.5">Topic / Subject</label>
                    <select
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="input-field text-sm"
                    >
                      <option value="General Inquiry">General Inquiry</option>
                      <option value="Active Rental Issue">Active Rental Issue</option>
                      <option value="Billing & Security Deposit">Billing & Security Deposit</option>
                      <option value="Equipment Delivery & Pickup">Equipment Delivery & Pickup</option>
                      <option value="Vendor Onboarding">Vendor Onboarding</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate uppercase tracking-wide mb-1.5">How can we help? *</label>
                    <textarea
                      required
                      rows={4}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Please include your Order ID or equipment name if applicable..."
                      className="input-field text-sm resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn-primary px-6 py-3 text-sm flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <span className="material-symbols-outlined shrink-0 animate-spin" style={{ fontSize: '18px' }}>refresh</span>
                        <span>Sending Request...</span>
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined shrink-0" style={{ fontSize: '18px' }}>send</span>
                        <span>Submit Request</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
