// Shared domain types for the Rentora backend + frontend.

export type ProductStatus = 'available' | 'low-stock' | 'booked' | 'draft';

export interface Product {
  id: number;
  name: string;
  brand: string;
  sku: string;
  category: string;
  description: string;
  status: ProductStatus;
  hourly: number;
  daily: number;
  weekly: number;
  monthly: number;
  deposit: number;
  quantity: number;       // units owned — availability is quantity minus overlapping rentals
  rating: number;
  reviews: number;
  image: string;
  gallery: string[];      // additional image urls
  specs: ProductSpec[];
  attachments: Attachment[];
  createdAt: string;
}

export interface ProductSpec {
  icon: string;
  label: string;
  value: string;
}

export interface Attachment {
  id: string;
  label: string;
  price: number;
}

// Lifecycle: reserved → active (picked up) → returned; reserved → cancelled.
export type OrderStatus = 'reserved' | 'active' | 'returned' | 'cancelled';

export interface Order {
  id: string;             // e.g. ORD-0942
  groupId: string;        // shared across lines placed in one checkout
  productId: number | null;
  item: string;
  customerName: string;
  email: string;
  phone: string;
  status: OrderStatus;
  startAt: string;        // ISO date (rental start)
  endAt: string;          // ISO date (due back)
  returnedAt: string | null;
  days: number;
  rate: number;           // per-day rate charged (base + addon), server-computed
  addonLabel: string;
  subtotal: number;       // rate * days
  waiver: number;
  discount: number;
  tax: number;
  deposit: number;
  lateFee: number;
  refund: number;         // deposit refunded at return (deposit - lateFee, floor 0)
  total: number;          // subtotal + waiver + tax - discount + deposit
  promoCode: string;
  paymentStatus: 'demo' | 'paid';
  paymentRef: string;     // Razorpay payment id when paid
  late: boolean;          // derived: active and past endAt
  daysLate: number;       // derived
  deliveryMethod: string;
  address: string;
  notes: string;
  createdAt: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'customer' | 'vendor';
  createdAt: string;
}

// ── Quotes (server-side pricing) ────────────────────────────
export interface QuoteLineInput {
  productId: number;
  attachmentId?: string;
  startAt: string;        // ISO date
  endAt: string;          // ISO date
}

export interface QuoteLine {
  productId: number;
  item: string;
  image: string;
  attachmentId: string;
  attachmentLabel: string;
  startAt: string;
  endAt: string;
  days: number;
  rate: number;           // per-day (base + addon)
  subtotal: number;
  waiver: number;
  deposit: number;
  available: boolean;
  availableQty: number;
}

export interface Quote {
  lines: QuoteLine[];
  subtotal: number;
  waiver: number;
  discount: number;
  promoCode: string;      // '' if none/invalid
  promoValid: boolean;
  tax: number;
  depositTotal: number;
  total: number;
}

export interface DashboardData {
  kpis: {
    activeRentals: number;
    overdue: number;
    revenueMtd: number;
    depositsHeld: number;
  };
  overdue: {
    id: string;
    customer: string;
    item: string;
    amount: number;
    daysLate: number;
    badge: string;
    badgeLabel: string;
  }[];
  activity: {
    icon: string;
    color: string;
    text: string;
    time: string;
  }[];
  revenueTrend: number[];
}
