'use client';

import { useState } from 'react';
import { ShoppingCart, CheckCircle, X, RefreshCw, Clock } from 'lucide-react';

interface Order {
  id: string;
  bookingId: string | null;
  roomId: number | null;
  status: string | null;
  totalAmount: string | null;
  createdAt: Date | null;
  guestName: string | null;
  roomNumber: number | null;
}

export default function OrdersClient({ orders }: { orders: Order[] }) {
  const [updating, setUpdating] = useState<string | null>(null);
  const [filter, setFilter] = useState('all');

  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter);

  async function updateOrderStatus(id: string, status: string) {
    setUpdating(id);
    try {
      await fetch(`/api/admin/orders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      window.location.reload();
    } finally { setUpdating(null); }
  }

  const statusIcon = (s: string | null) => {
    switch (s) {
      case 'pending': return <Clock size={13} />;
      case 'accepted': return <RefreshCw size={13} />;
      case 'completed': return <CheckCircle size={13} />;
      case 'rejected': return <X size={13} />;
      default: return null;
    }
  };

  const statusBadge = (s: string | null) => {
    switch (s) {
      case 'pending': return 'badge-warning';
      case 'accepted': return 'badge-info';
      case 'completed': return 'badge-success';
      case 'rejected': return 'badge-danger';
      default: return 'badge-gray';
    }
  };

  const pendingCount = orders.filter(o => o.status === 'pending').length;

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h1 style={{ fontSize: 24, fontWeight: 800 }}>Service & Food Orders</h1>
            {pendingCount > 0 && (
              <div style={{
                background: '#ef4444', color: '#fff', borderRadius: 99,
                padding: '2px 10px', fontSize: 13, fontWeight: 700,
                animation: 'pulse-dot 1.5s infinite',
              }}>
                {pendingCount} new
              </div>
            )}
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 4 }}>
            Real-time guest service requests — accept or reject below.
          </p>
        </div>
        <button className="btn btn-outline" onClick={() => window.location.reload()}>
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="filter-pills" style={{ marginBottom: 20 }}>
        {['all', 'pending', 'accepted', 'completed', 'rejected'].map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className="btn btn-outline btn-sm"
            style={{
              background: filter === s ? 'var(--accent)' : undefined,
              color: filter === s ? '#fff' : undefined,
              borderColor: filter === s ? 'var(--accent)' : undefined,
            }}
          >
            {s.charAt(0).toUpperCase() + s.slice(1)}
            {s !== 'all' && (
              <span style={{ marginLeft: 4, fontSize: 11 }}>({orders.filter(o => o.status === s).length})</span>
            )}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="card" style={{ padding: 60, textAlign: 'center' }}>
          <ShoppingCart size={40} color="var(--text-muted)" style={{ margin: '0 auto 12px' }} />
          <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 6 }}>No orders</div>
          <div style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Orders from guests will appear here in real-time.</div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(320px,1fr))', gap: 16 }}>
          {filtered.map(order => (
            <div
              key={order.id}
              className="card"
              style={{
                padding: 20,
                borderLeft: order.status === 'pending' ? '4px solid #f59e0b' : order.status === 'accepted' ? '4px solid var(--accent)' : order.status === 'completed' ? '4px solid #10b981' : '4px solid #ef4444',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>Room {order.roomNumber}</div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: 13, marginTop: 2 }}>{order.guestName || 'Guest'}</div>
                </div>
                <span className={`badge ${statusBadge(order.status)}`}>
                  {statusIcon(order.status)} {order.status}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderTop: '1px solid var(--border)', marginTop: 8 }}>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Order Total</div>
                  <div style={{ fontWeight: 800, fontSize: 18, color: 'var(--accent)' }}>
                    ₹{Number(order.totalAmount ?? 0).toLocaleString('en-IN')}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Placed at</div>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>
                    {order.createdAt ? new Date(order.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '—'}
                  </div>
                </div>
              </div>

              {order.status === 'pending' && (
                <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                  <button
                    className="btn btn-success btn-sm"
                    style={{ flex: 1, justifyContent: 'center' }}
                    disabled={updating === order.id}
                    onClick={() => updateOrderStatus(order.id, 'accepted')}
                  >
                    <CheckCircle size={13} /> Accept
                  </button>
                  <button
                    className="btn btn-danger btn-sm"
                    style={{ flex: 1, justifyContent: 'center' }}
                    disabled={updating === order.id}
                    onClick={() => updateOrderStatus(order.id, 'rejected')}
                  >
                    <X size={13} /> Reject
                  </button>
                </div>
              )}
              {order.status === 'accepted' && (
                <button
                  className="btn btn-primary btn-sm"
                  style={{ width: '100%', marginTop: 12, justifyContent: 'center' }}
                  disabled={updating === order.id}
                  onClick={() => updateOrderStatus(order.id, 'completed')}
                >
                  ✅ Mark Completed
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
