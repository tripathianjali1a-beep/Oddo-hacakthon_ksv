import Link from 'next/link';
import PageHero from '@/components/ui/PageHero';

const tiers = [
  { window: '48+ hours before pickup', refund: '100%', note: 'Full refund, including deposit.', color: 'emerald' },
  { window: '24–48 hours before pickup', refund: '50%', note: 'Half the rental fee is refunded; deposit returned in full.', color: 'amber' },
  { window: 'Under 24 hours', refund: '0%', note: 'Rental fee is non-refundable; deposit returned in full.', color: 'red' },
];

const colorMap: Record<string, string> = {
  emerald: 'text-emerald-700 bg-emerald-50 border-emerald-200',
  amber: 'text-amber-700 bg-amber-50 border-amber-200',
  red: 'text-red-700 bg-red-50 border-red-200',
};

export default function CancellationPage() {
  return (
    <div className="pb-16">
      <PageHero
        eyebrow="Policies"
        title="Cancellation policy"
        subtitle="Plans change — we get it. Here's exactly what happens when you cancel a booking."
        icon="event_busy"
        crumbs={[{ label: 'Home', href: '/home' }, { label: 'Policies' }, { label: 'Cancellation' }]}
      />

      <div className="max-w-[880px] mx-auto px-6 mt-12">
        {/* Refund tiers */}
        <div className="space-y-4">
          {tiers.map((t) => (
            <div key={t.window} className="card p-6 flex items-center gap-5">
              <span className={`text-2xl font-bold font-currency w-20 text-center py-3 rounded-xl border ${colorMap[t.color]}`}>{t.refund}</span>
              <div>
                <p className="text-navy font-semibold text-sm">{t.window}</p>
                <p className="text-slate text-sm mt-0.5">{t.note}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Notes */}
        <div className="card p-6 md:p-8 mt-8">
          <h2 className="text-h3 text-navy mb-4">Good to know</h2>
          <ul className="space-y-3 text-sm text-slate">
            {[
              'Security deposits are always returned in full for cancellations, regardless of timing.',
              'Refunds are processed to your original payment method within 3–5 business days.',
              'Delivery fees are refundable only if the item has not yet been dispatched.',
              'Owner-initiated cancellations are always refunded 100%, and we help you rebook.',
              'Extenuating circumstances (emergencies, severe weather) may qualify for a full refund.',
            ].map((n) => (
              <li key={n} className="flex items-start gap-2.5">
                <span className="material-symbols-outlined text-amber mt-0.5 shrink-0" style={{ fontSize: '18px' }}>check_circle</span>
                {n}
              </li>
            ))}
          </ul>
        </div>

        {/* CTA */}
        <div className="card p-6 mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="text-navy font-semibold text-sm">Need to cancel a booking?</p>
            <p className="text-slate text-xs">Manage it from your orders, or reach our team for help.</p>
          </div>
          <div className="flex gap-2">
            <Link href="/support" className="btn-secondary px-5 py-2.5 text-sm">Help center</Link>
            <Link href="/contact" className="btn-primary px-5 py-2.5 text-sm">Contact us</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
