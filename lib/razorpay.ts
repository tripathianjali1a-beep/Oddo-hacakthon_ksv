// Razorpay server-side helpers (REST API, no SDK dependency).
//
// Configure test-mode keys in .env.local:
//   RAZORPAY_KEY_ID=rzp_test_xxxxxxxx
//   RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxx
//
// When the keys are absent the checkout falls back to "demo" payments so the
// flow stays demonstrable without an account.

import crypto from 'crypto';

const API_BASE = 'https://api.razorpay.com/v1';

export function razorpayKeyId(): string {
  return process.env.RAZORPAY_KEY_ID || '';
}

export function isRazorpayConfigured(): boolean {
  return Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);
}

function authHeader(): string {
  const token = Buffer.from(`${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`).toString('base64');
  return `Basic ${token}`;
}

export interface RazorpayOrder {
  id: string;
  amount: number;   // paise
  currency: string;
  status: string;
}

// Amounts are INR paise (₹1 = 100 paise).
export async function createRazorpayOrder(amountPaise: number, receipt: string): Promise<RazorpayOrder> {
  const res = await fetch(`${API_BASE}/orders`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: authHeader() },
    body: JSON.stringify({ amount: amountPaise, currency: 'INR', receipt }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Razorpay order creation failed (${res.status}): ${body.slice(0, 200)}`);
  }
  return res.json() as Promise<RazorpayOrder>;
}

export async function fetchRazorpayOrder(orderId: string): Promise<RazorpayOrder> {
  const res = await fetch(`${API_BASE}/orders/${orderId}`, {
    headers: { authorization: authHeader() },
  });
  if (!res.ok) throw new Error(`Razorpay order lookup failed (${res.status})`);
  return res.json() as Promise<RazorpayOrder>;
}

// Standard Razorpay checkout verification:
// HMAC-SHA256(order_id + "|" + payment_id, key_secret) must equal the signature.
export function verifyRazorpaySignature(orderId: string, paymentId: string, signature: string): boolean {
  if (!orderId || !paymentId || !signature) return false;
  const expected = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '')
    .update(`${orderId}|${paymentId}`)
    .digest('hex');
  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
  } catch {
    return false;
  }
}
