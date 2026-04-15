'use client';

import { useState } from 'react';
import { Search, Filter, ExternalLink, CheckCircle, LogOut, X } from 'lucide-react';

interface Booking {
  id: string;
  name: string | null;
  roomId: number | null;
  checkInDate: string;
  checkOutDate: string;
  status: string | null;
  paymentStatus: string | null;
  totalAmount: string | null;
  guestToken: string | null;
  createdAt: Date | null;
}

interface Room {
  id: number;
  roomNumber: number;
}

export default function BookingsClient({ bookings, rooms }: { bookings: Booking[]; rooms: Room[] }) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [updating, setUpdating] = useState<string | null>(null);
  const [checkoutBooking, setCheckoutBooking] = useState<Booking | null>(null);
  const [checkoutInvoice, setCheckoutInvoice] = useState<Record<string, unknown> | null>(null);

  const roomMap = Object.fromEntries(rooms.map(r => [r.id, r.roomNumber]));

  const filtered = bookings.filter(b => {
    const matchSearch = !search ||
      b.name?.toLowerCase().includes(search.toLowerCase()) ||
      String(roomMap[b.roomId ?? 0]).includes(search);
    const matchStatus = statusFilter === 'all' || b.status === statusFilter;
    return matchSearch && matchStatus;
  });

  async function updateStatus(id: string, status: string) {
    setUpdating(id);
    try {
      await fetch(`/api/admin/bookings/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      window.location.reload();
    } finally { setUpdating(null); }
  }

  async function handleCheckout(booking: Booking) {
    setUpdating(booking.id);
    try {
      const res = await fetch(`/api/admin/bookings/${booking.id}/checkout`, { method: 'POST' });
      const data = await res.json();
      setCheckoutInvoice(data);
      setCheckoutBooking(booking);
    } finally { setUpdating(null); }
  }

  const statusColor = (s: string | null) => {
    switch (s) {
      case 'booked': return 'badge-info';
      case 'checked_in': return 'badge-success';
      case 'checked_out': return 'badge-gray';
      case 'cancelled': return 'badge-danger';
      default: return 'badge-gray';
    }
  };

  const payColor = (s: string | null) => {
    switch (s) {
      case 'paid': return 'badge-success';
      case 'partial': return 'badge-warning';
      default: return 'badge-danger';
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800 }}>Bookings</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 4 }}>
            {filtered.length} booking{filtered.length !== 1 ? 's' : ''} found
          </p>
        </div>
        <a href="/admin/rooms">
          <button className="btn btn-primary">+ New Booking</button>
        </a>
      </div>

      {/* Filters */}
      <div className="filter-row">
        <div style={{ position: 'relative', flex: 1, minWidth: 220 }}>
          <Search size={14} color="var(--text-muted)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
          <input
            className="input"
            placeholder="Search by guest name or room..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ paddingLeft: 34 }}
          />
        </div>
        <div className="filter-pills">
          {['all', 'booked', 'checked_in', 'checked_out', 'cancelled'].map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className="btn btn-outline btn-sm"
              style={{
                background: statusFilter === s ? 'var(--accent)' : undefined,
                color: statusFilter === s ? '#fff' : undefined,
                borderColor: statusFilter === s ? 'var(--accent)' : undefined,
              }}
            >
              {s === 'all' ? 'All' : s.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>Guest</th>
              <th>Room</th>
              <th>Check-In</th>
              <th>Check-Out</th>
              <th>Total</th>
              <th>Status</th>
              <th>Payment</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={8} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 40 }}>No bookings found</td></tr>
            ) : filtered.map(b => (
              <tr key={b.id}>
                <td>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{b.name || '—'}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'monospace' }}>{b.id.slice(0, 8)}…</div>
                </td>
                <td style={{ fontWeight: 600 }}>Room {roomMap[b.roomId ?? 0] ?? b.roomId}</td>
                <td>{b.checkInDate}</td>
                <td>{b.checkOutDate}</td>
                <td style={{ fontWeight: 700, color: 'var(--accent)' }}>
                  ₹{Number(b.totalAmount ?? 0).toLocaleString('en-IN')}
                </td>
                <td><span className={`badge ${statusColor(b.status)}`}>{b.status}</span></td>
                <td><span className={`badge ${payColor(b.paymentStatus)}`}>{b.paymentStatus}</span></td>
                <td>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {b.status === 'booked' && (
                      <button
                        className="btn btn-success btn-sm"
                        disabled={updating === b.id}
                        onClick={() => updateStatus(b.id, 'checked_in')}
                      >
                        <CheckCircle size={13} /> Check-In
                      </button>
                    )}
                    {b.status === 'checked_in' && (
                      <button
                        className="btn btn-primary btn-sm"
                        disabled={updating === b.id}
                        onClick={() => handleCheckout(b)}
                      >
                        <LogOut size={13} /> Checkout
                      </button>
                    )}
                    {b.guestToken && (
                      <a href={`/guest/${b.guestToken}`} target="_blank" rel="noreferrer">
                        <button className="btn btn-outline btn-sm"><ExternalLink size={12} /> Guest Link</button>
                      </a>
                    )}
                    {(b.status === 'booked') && (
                      <button
                        className="btn btn-sm"
                        disabled={updating === b.id}
                        onClick={() => updateStatus(b.id, 'cancelled')}
                        style={{ background: '#fee2e2', color: '#991b1b', border: 'none' }}
                      >
                        <X size={12} /> Cancel
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>

      {/* Checkout Invoice Modal */}
      {checkoutBooking && checkoutInvoice && (
        <CheckoutInvoiceModal
          booking={checkoutBooking}
          invoice={checkoutInvoice as Record<string, unknown>}
          roomNumber={roomMap[checkoutBooking.roomId ?? 0]}
          onClose={() => { setCheckoutBooking(null); setCheckoutInvoice(null); window.location.reload(); }}
        />
      )}
    </div>
  );
}

function CheckoutInvoiceModal({ booking, invoice, roomNumber, onClose }: {
  booking: Booking;
  invoice: Record<string, unknown>;
  roomNumber: number;
  onClose: () => void;
}) {
  const inv = invoice as {
    roomAmount: number;
    serviceAmount: number;
    totalAmount: number;
    orders?: Array<{ id: string; totalAmount: string; status: string; createdAt: string }>;
  };

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal animate-fade-in" style={{ maxWidth: 500 }} onClick={e => e.stopPropagation()}>
        <div style={{ padding: '22px 28px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 17 }}>🧾 Checkout Invoice</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Room {roomNumber} · {booking.name}</div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} color="var(--text-secondary)" /></button>
        </div>
        <div style={{ padding: 28 }}>
          <div style={{ background: 'var(--bg-base)', borderRadius: 12, padding: 20, marginBottom: 20 }}>
            {[
              ['Check-In', booking.checkInDate],
              ['Check-Out', booking.checkOutDate],
              ['Room Amount', `₹${Number(inv.roomAmount).toLocaleString('en-IN')}`],
              ['Services / Food', `₹${Number(inv.serviceAmount).toLocaleString('en-IN')}`],
            ].map(([k, v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid var(--border)', fontSize: 14 }}>
                <span style={{ color: 'var(--text-secondary)' }}>{k}</span>
                <span style={{ fontWeight: 600 }}>{v}</span>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 12, fontSize: 18, fontWeight: 900 }}>
              <span>Grand Total</span>
              <span style={{ color: 'var(--accent)' }}>₹{Number(inv.totalAmount).toLocaleString('en-IN')}</span>
            </div>
          </div>

          {Array.isArray(inv.orders) && inv.orders.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>Orders</div>
              {inv.orders.map((o) => (
                <div key={o.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 12px', background: 'var(--bg-base)', borderRadius: 8, marginBottom: 6, fontSize: 13 }}>
                  <span>{new Date(o.createdAt).toLocaleDateString()}</span>
                  <span className={`badge ${o.status === 'completed' ? 'badge-success' : 'badge-warning'}`}>{o.status}</span>
                  <span style={{ fontWeight: 700 }}>₹{Number(o.totalAmount).toLocaleString('en-IN')}</span>
                </div>
              ))}
            </div>
          )}

          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-outline" onClick={onClose} style={{ flex: 1 }}>Close</button>
            <button className="btn btn-primary" onClick={() => window.print()} style={{ flex: 1 }}>🖨️ Print Invoice</button>
          </div>
        </div>
      </div>
    </div>
  );
}
