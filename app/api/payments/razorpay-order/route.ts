import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { priceQuote, QuoteError } from '@/lib/pricing';
import { isRazorpayConfigured, createRazorpayOrder, razorpayKeyId } from '@/lib/razorpay';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// POST /api/payments/razorpay-order — create a Razorpay order for the current
// cart. The amount is recomputed server-side from the lines; the client never
// chooses what to pay. Returns { demo: true } when Razorpay keys are absent.
export async function POST(request: Request) {
  const db = getDb();
  let body: { lines?: unknown; promoCode?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  try {
    const quote = priceQuote(
      db,
      Array.isArray(body.lines) ? body.lines : [],
      typeof body.promoCode === 'string' ? body.promoCode : undefined,
    );
    const unavailable = quote.lines.filter((l) => !l.available);
    if (unavailable.length) {
      return NextResponse.json(
        { error: `No longer available: ${unavailable.map((l) => l.item).join(', ')}.` },
        { status: 409 },
      );
    }

    if (!isRazorpayConfigured()) {
      return NextResponse.json({ demo: true, amount: quote.total, currency: 'INR' });
    }

    const rzpOrder = await createRazorpayOrder(Math.round(quote.total * 100), `luxrent-${Date.now()}`);
    return NextResponse.json({
      demo: false,
      keyId: razorpayKeyId(),
      razorpayOrderId: rzpOrder.id,
      amount: rzpOrder.amount,     // paise
      currency: rzpOrder.currency,
    });
  } catch (err) {
    if (err instanceof QuoteError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error(err);
    return NextResponse.json({ error: 'Payment initialisation failed. Please try again.' }, { status: 502 });
  }
}
