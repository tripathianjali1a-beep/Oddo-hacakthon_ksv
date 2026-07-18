'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import Link from 'next/link';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

interface OrderItem {
  id: number;
  product_id: number;
  quantity: number;
  unit_price: number;
  rental_days: number;
  rental_start_date: string | null;
  rental_end_date: string | null;
  subtotal: number;
  deposit_amount: number;
  product?: { name: string; images: string | null };
}

interface Order {
  id: number;
  order_number: string;
  status: string;
  delivery_method: string;
  subtotal: number;
  delivery_fee: number;
  tax_amount: number;
  late_fee: number;
  total_amount: number;
  deposit_amount: number;
  deposit_status: string | null;
  deposit_deduction: number;
  return_due_at: string | null;
  returned_at: string | null;
  created_at: string;
  items: OrderItem[];
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'badge-warning',
  quotation: 'badge-info',
  confirmed: 'badge-info',
  picked_up: 'badge-success',
  active: 'badge-success',
  late: 'badge-danger',
  returned: 'badge-success',
  completed: 'badge-success',
  cancelled: 'badge-danger',
};

function fmt(date: string | null) {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function OrdersPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<number | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/orders');
      return;
    }
    fetchOrders();
  }, [isAuthenticated]);

  const getToken = () => typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/orders/`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch {}
    setLoading(false);
  };

  const cancelOrder = async (orderId: number) => {
    if (!confirm('Cancel this order?')) return;
    try {
      await fetch(`${API_BASE}/orders/${orderId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      fetchOrders();
    } catch {}
  };

  return (
    <div className="min-h-screen bg-ivory/40 py-10 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-navy">My Rental Orders</h1>
            <p className="text-sm text-slate mt-0.5">View and manage all your rentals</p>
          </div>
          <Link href="/browse" className="btn-primary py-2 px-4 text-xs">+ New Rental</Link>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <span className="material-symbols-outlined animate-spin text-amber" style={{ fontSize: '32px' }}>refresh</span>
          </div>
        ) : orders.length === 0 ? (
          <div className="card text-center py-16">
            <span className="material-symbols-outlined text-slate/30 mb-3 block" style={{ fontSize: '56px' }}>receipt_long</span>
            <p className="font-bold text-navy mb-1">No orders yet</p>
            <p className="text-xs text-slate mb-5">Start browsing our catalog to place your first rental order.</p>
            <Link href="/browse" className="btn-primary py-2.5 px-6 text-sm inline-block">Browse Products</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="card">
                {/* Order header */}
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-navy text-sm">#{order.order_number}</span>
                      <span className={`${STATUS_COLORS[order.status] || 'badge-info'} text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase`}>
                        {order.status.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate mt-0.5">Placed {fmt(order.created_at)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-navy text-sm">₹{order.total_amount.toLocaleString()}</p>
                    <p className="text-[11px] text-slate">incl. ₹{order.deposit_amount.toLocaleString()} deposit</p>
                  </div>
                </div>

                {/* Key dates */}
                {(order.return_due_at || order.returned_at) && (
                  <div className="flex gap-4 mb-3 p-3 bg-ivory rounded-xl text-xs">
                    {order.return_due_at && (
                      <div>
                        <span className="text-slate font-medium">Return Due</span>
                        <p className="font-bold text-navy">{fmt(order.return_due_at)}</p>
                      </div>
                    )}
                    {order.returned_at && (
                      <div>
                        <span className="text-slate font-medium">Returned On</span>
                        <p className="font-bold text-navy">{fmt(order.returned_at)}</p>
                      </div>
                    )}
                    {order.late_fee > 0 && (
                      <div>
                        <span className="text-slate font-medium">Late Fee</span>
                        <p className="font-bold text-red-600">₹{order.late_fee.toLocaleString()}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Deposit status */}
                {order.deposit_status && (
                  <div className={`mb-3 p-2.5 rounded-xl text-xs flex items-center gap-2 ${
                    order.deposit_status === 'refunded' ? 'bg-emerald-50 text-emerald-700' :
                    order.deposit_status === 'held' ? 'bg-amber/10 text-amber-700' :
                    'bg-red-50 text-red-600'
                  }`}>
                    <span className="material-symbols-outlined shrink-0" style={{ fontSize: '16px' }}>
                      {order.deposit_status === 'refunded' ? 'check_circle' :
                       order.deposit_status === 'held' ? 'lock' : 'warning'}
                    </span>
                    <span>
                      Security Deposit: ₹{order.deposit_amount.toLocaleString()} —{' '}
                      {order.deposit_status === 'refunded' ? 'Fully refunded' :
                       order.deposit_status === 'held' ? 'Held until return' :
                       order.deposit_status === 'partially_refunded'
                         ? `Partially refunded (₹${order.deposit_deduction.toLocaleString()} deducted for late fee)`
                         : 'Forfeited due to late return'}
                    </span>
                  </div>
                )}

                {/* Toggle items */}
                <button
                  onClick={() => setExpanded(expanded === order.id ? null : order.id)}
                  className="text-xs font-semibold text-amber hover:underline flex items-center gap-1"
                >
                  <span>{expanded === order.id ? 'Hide' : 'View'} {order.items.length} item{order.items.length !== 1 ? 's' : ''}</span>
                  <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>
                    {expanded === order.id ? 'expand_less' : 'expand_more'}
                  </span>
                </button>

                {expanded === order.id && (
                  <div className="mt-3 space-y-2 pt-3 border-t border-slate/10">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex items-center justify-between text-xs py-1">
                        <div>
                          <p className="font-semibold text-navy">{item.product?.name || `Product #${item.product_id}`}</p>
                          <p className="text-slate">Qty {item.quantity} × ₹{item.unit_price}/day × {item.rental_days} days</p>
                          {item.rental_start_date && (
                            <p className="text-slate">{fmt(item.rental_start_date)} → {fmt(item.rental_end_date)}</p>
                          )}
                        </div>
                        <span className="font-bold text-navy">₹{item.subtotal.toLocaleString()}</span>
                      </div>
                    ))}
                    {/* Order summary */}
                    <div className="pt-2 border-t border-slate/10 text-xs space-y-1">
                      <div className="flex justify-between text-slate"><span>Subtotal</span><span>₹{order.subtotal.toLocaleString()}</span></div>
                      {order.delivery_fee > 0 && <div className="flex justify-between text-slate"><span>Delivery</span><span>₹{order.delivery_fee.toLocaleString()}</span></div>}
                      <div className="flex justify-between text-slate"><span>GST (18%)</span><span>₹{order.tax_amount.toLocaleString()}</span></div>
                      <div className="flex justify-between text-slate"><span>Security Deposit</span><span>₹{order.deposit_amount.toLocaleString()}</span></div>
                      {order.late_fee > 0 && <div className="flex justify-between text-red-600"><span>Late Fee</span><span>₹{order.late_fee.toLocaleString()}</span></div>}
                      <div className="flex justify-between font-bold text-navy pt-1 border-t border-slate/10"><span>Total</span><span>₹{order.total_amount.toLocaleString()}</span></div>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 mt-3 pt-3 border-t border-slate/10">
                  {['pending', 'quotation'].includes(order.status) && (
                    <button
                      onClick={() => cancelOrder(order.id)}
                      className="text-xs font-semibold text-red-500 hover:text-red-700 border border-red-200 rounded-xl px-3 py-1.5 hover:bg-red-50 transition-all"
                    >
                      Cancel Order
                    </button>
                  )}
                  <span className="ml-auto text-[11px] text-slate">
                    {order.delivery_method === 'delivery' ? '🚚 Delivery' : '🏪 Store Pickup'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
