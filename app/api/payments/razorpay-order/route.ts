import { NextResponse } from 'next/server';
import { getClient } from '@/lib/db-client';
import { priceQuote, priceQuotePg, QuoteError } from '@/lib/pricing';
import { isRazorpayConfigured, createRazorpayOrder, razorpayKeyId } from '@/lib/razorpay';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  let body: { lines?: unknown; promoCode?: unknown };
  try { body = await request.json(); } catch { return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 }); }

  const { mode, sqlite, pool, release } = await getClient();
  try {
    const lines = Array.isArray(body.lines) ? body.lines : [];
    const promoCode = typeof body.promoCode === 'string' ? body.promoCode : undefined;
    const quote = mode === 'sqlite' && sqlite
      ? priceQuote(sqlite, lines, promoCode)
      : await priceQuotePg(pool!, lines, promoCode);

    const unavailable = quote.lines.filter((l) => !l.available);
    if (unavailable.length) return NextResponse.json({ error: `No longer available: ${unavailable.map((l) => l.item).join(', ')}.` }, { status: 409 });

    if (!isRazorpayConfigured()) return NextResponse.json({ demo: true, amount: quote.total, currency: 'INR' });

    const rzpOrder = await createRazorpayOrder(Math.round(quote.total * 100), `luxrent-${Date.now()}`);
    return NextResponse.json({ demo: false, keyId: razorpayKeyId(), razorpayOrderId: rzpOrder.id, amount: rzpOrder.amount, currency: rzpOrder.currency });
  } catch (err) {
    if (err instanceof QuoteError) return NextResponse.json({ error: err.message }, { status: err.status });
    console.error(err);
    return NextResponse.json({ error: 'Payment initialisation failed.' }, { status: 502 });
  } finally { release(); }
}
