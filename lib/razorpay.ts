/**
 * ============================================================================
 * Rentora Razorpay Payment Gateway Integration (`lib/razorpay.ts`)
 * ============================================================================
 * Why this file is awesome for hackathon demonstrations:
 * 1. Zero-Dependency REST implementation: We call Razorpay's `/v1/orders` API directly
 *    using standard Node `fetch`, avoiding bulky external SDKs.
 * 2. Automatic Demo Fallback: If `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` are not
 *    set in `.env.local`, the checkout automatically falls back to "demo" payment mode!
 *    This allows judges or testers to complete full orders instantly without needing
 *    actual bank credentials.
 * 3. Timing-Safe Cryptographic Verification: We verify checkout signatures using
 *    HMAC-SHA256 combined with `crypto.timingSafeEqual()` to prevent timing side-channel attacks.
 * ============================================================================
 */

import crypto from 'crypto';

const API_BASE = 'https://api.razorpay.com/v1';

export function razorpayKeyId(): string {
  return process.env.RAZORPAY_KEY_ID || '';
}

/**
 * Checks whether active Razorpay credentials are present in the environment.
 * If false, checkout flows run in frictionless demo mode (`paymentStatus: 'demo'`).
 */
export function isRazorpayConfigured(): boolean {
  return Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);
}

function authHeader(): string {
  const token = Buffer.from(`${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`).toString('base64');
  return `Basic ${token}`;
}

export interface RazorpayOrder {
  id: string;
  amount: number;   // Amount stored in INR paise (e.g., ₹100 = 10000 paise)
  currency: string;
  status: string;
}

/**
 * Creates a secure order on Razorpay servers before the frontend payment popup opens.
 * Amounts must always be converted to paise (`₹1 = 100 paise`).
 */
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

/**
 * Fetches verified order status directly from Razorpay servers during checkout settlement.
 * Used to ensure the paid amount exactly matches what our server quoted (`priceQuote`).
 */
export async function fetchRazorpayOrder(orderId: string): Promise<RazorpayOrder> {
  const res = await fetch(`${API_BASE}/orders/${orderId}`, {
    headers: { authorization: authHeader() },
  });
  if (!res.ok) throw new Error(`Razorpay order lookup failed (${res.status})`);
  return res.json() as Promise<RazorpayOrder>;
}

/**
 * Verifies the cryptographic checkout signature returned by the Razorpay frontend script.
 * Formula: HMAC-SHA256(order_id + "|" + payment_id, key_secret) === signature.
 * Uses `crypto.timingSafeEqual()` to guarantee immunity to string comparison timing attacks.
 */
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

