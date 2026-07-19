// ============================================================================
// Rentora Enterprise Domain Model & Type Definitions
// ============================================================================
// Why this file is important for judges / code walkthroughs:
// This file acts as the single source of truth (`contract`) shared across both
// our Next.js backend API routes and our reactive frontend components. By having
// strict TypeScript definitions here, we eliminate runtime type mismatches and
// ensure our state transitions, pricing breakdowns, and inventory models stay in sync.
// ============================================================================

/**
 * ProductStatus defines the current operational state of a rental item in our catalog.
 * - 'available': Item is ready for immediate booking.
 * - 'low-stock': Inventory is running tight; alerts frontend to show urgency indicators.
 * - 'booked': All units of this item are currently checked out or reserved.
 * - 'draft': Hidden from storefront; used by store admins while preparing item listings.
 */
export type ProductStatus = 'available' | 'low-stock' | 'booked' | 'draft';

/**
 * Product represents a rentable asset (e.g., heavy machinery, studio gear, or furniture).
 * Notice how we maintain multiple tiered pricing structures (hourly, daily, weekly, monthly)
 * right alongside inventory counts (`quantity`) and dynamic add-on `attachments`.
 */
export interface Product {
  id: number;
  name: string;
  brand: string;
  sku: string;
  category: string;
  description: string;
  status: ProductStatus;
  
  // Tiered pricing rates (in INR ₹). Daily is our baseline calculation unit.
  hourly: number;
  daily: number;
  weekly: number;
  monthly: number;
  
  // Security deposit held during checkout to protect against physical damage or loss.
  deposit: number;
  
  // Total physical units owned by the organization.
  // Note: Actual real-time availability is dynamically calculated by subtracting
  // any overlapping active/reserved orders from this total quantity (`availableQuantity`).
  quantity: number;
  
  rating: number;
  reviews: number;
  image: string;
  gallery: string[];      // Additional high-resolution images for the product carousel
  specs: ProductSpec[];   // Technical specifications displayed on the product page
  attachments: Attachment[]; // Optional hardware/lens add-ons selectable during checkout
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
  price: number; // Additional per-day rate added on top of the base product rate
}

// ============================================================================
// Order Lifecycle & Finite State Machine (FSM)
// ============================================================================
// To prevent illegal state jumps (like completing an order that was never picked up),
// our orders follow a strict event-driven Finite State Machine:
//
//   [reserved] ───(Customer picks up at store / item delivered)───▶ [active]
//       │                                                              │
//       │───(Customer cancels before pickup)───▶ [cancelled]           │───(Returned to store)───▶ [returned]
//
// Once in 'returned' or 'cancelled' state, the order is considered terminal.
// ============================================================================
export type OrderStatus = 'reserved' | 'active' | 'returned' | 'cancelled';

/**
 * Order represents an individual rental transaction.
 * If a customer checks out with multiple items in their cart, we group them using `groupId`,
 * allowing individual line items to be tracked and returned separately while keeping
 * financial settlement unified.
 */
export interface Order {
  id: string;             // Unique human-readable identifier (e.g., ORD-0942)
  groupId: string;        // Shared group identifier connecting all items placed in a single checkout
  productId: number | null;
  item: string;           // Snapshot of the product name at checkout time (prevents historical drift)
  customerName: string;
  email: string;
  phone: string;
  status: OrderStatus;    // Current state in our FSM transition lifecycle
  
  startAt: string;        // ISO date representing the scheduled rental start timestamp
  endAt: string;          // ISO date representing the due return timestamp
  returnedAt: string | null; // Actual physical return timestamp recorded by staff
  
  days: number;           // Calculated duration of the rental period in days
  rate: number;           // Per-day rate charged (base daily rate + attachment add-on rate)
  addonLabel: string;     // Name of the chosen attachment add-on (e.g., "4K Lens Pack")
  
  // Financial breakdown & transparent billing parameters:
  subtotal: number;       // Rate * Days
  waiver: number;         // Damage protection fee added to protect the customer
  discount: number;       // Promotional discount amount applied (e.g., via coupon code)
  tax: number;            // Applicable GST (18% / 8% depending on config)
  deposit: number;        // Refundable security deposit collected upfront
  lateFee: number;        // Overdue penalty charged if returned after `endAt`
  refund: number;         // Net amount returned to customer: max(0, deposit - lateFee)
  total: number;          // Grand checkout amount: subtotal + waiver + tax - discount + deposit
  
  promoCode: string;      // Coupon applied during checkout (or empty string if none)
  paymentStatus: 'demo' | 'paid'; // 'demo' for instant hackathon testing without real money
  paymentRef: string;     // Razorpay transaction/payment reference ID when verified
  
  // Derived runtime flags (calculated automatically when query results are mapped):
  late: boolean;          // True if status == 'active' and current time exceeds `endAt`
  daysLate: number;       // Number of days overdue past the scheduled return date
  
  deliveryMethod: string; // 'pickup' (store visit) vs 'delivery' (shipped to address)
  address: string;        // Delivery address if `deliveryMethod` == 'delivery'
  notes: string;          // Special instructions provided by customer or notes added by staff
  createdAt: string;
}

export type UserRole = 'customer' | 'vendor' | 'admin';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;         // Role-Based Access Control (RBAC) determinant
  createdAt: string;
}

// ============================================================================
// Server-Side Pricing & Quotation Engine Contracts
// ============================================================================
// Why quote on the server?
// Never trust client-side pricing calculations! When a user changes dates or items
// in their cart, the frontend requests a secure quote from `/api/quotes`.
// The server validates real-time inventory and computes exact numbers.
// ============================================================================
export interface QuoteLineInput {
  productId: number;
  attachmentId?: string;  // Optional add-on selected by the user
  startAt: string;        // ISO start date
  endAt: string;          // ISO return date
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
  rate: number;           // Combined daily base rate + add-on rate
  subtotal: number;       // rate * days
  waiver: number;         // Damage waiver allocated to this line item
  deposit: number;        // Required security deposit for this product
  available: boolean;     // True if stock is available for the requested date window
  availableQty: number;   // Exact number of units still free across the date range
}

export interface Quote {
  lines: QuoteLine[];
  subtotal: number;
  waiver: number;
  discount: number;
  promoCode: string;      // Normalized promo code string (or empty if invalid/not provided)
  promoValid: boolean;    // True if coupon successfully reduced the subtotal
  tax: number;
  depositTotal: number;
  total: number;          // Final amount payable at payment gateway
}

// ============================================================================
// Admin & Executive Dashboard Analytics Data
// ============================================================================
export interface DashboardData {
  kpis: {
    activeRentals: number; // Currently checked out items out in the field
    overdue: number;       // Items past return due date requiring urgent follow-up
    revenueMtd: number;    // Month-to-date total revenue generated
    depositsHeld: number;  // Total refundable security deposits currently held in escrow
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
  revenueTrend: number[];  // Historical data points for the dashboard charts
}

