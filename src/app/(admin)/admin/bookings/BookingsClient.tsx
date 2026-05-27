'use client';

import { useState } from 'react';
import { Search, Filter, ExternalLink, CheckCircle, LogOut, X, AlertTriangle, FileText, Printer } from 'lucide-react';
import { numberToWords, RESORT_DETAILS } from '@/lib/invoiceUtils';

interface Booking {
  id: string;
  name: string | null;
  phone: string | null;
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
  const [cancelBooking, setCancelBooking] = useState<Booking | null>(null);

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
              suppressHydrationWarning
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
                  {b.phone && (
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
                      {b.phone}
                    </div>
                  )}
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'monospace', marginTop: 2 }}>{b.id.slice(0, 8)}…</div>
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
                        onClick={() => setCancelBooking(b)}
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

      {/* Nice Cancel Confirmation Modal */}
      {cancelBooking && (
        <ConfirmCancelModal
          booking={cancelBooking}
          roomNumber={roomMap[cancelBooking.roomId ?? 0]}
          onClose={() => setCancelBooking(null)}
          onConfirm={() => {
            updateStatus(cancelBooking.id, 'cancelled');
            setCancelBooking(null);
          }}
          isUpdating={updating === cancelBooking.id}
        />
      )}
    </div>
  );
}

function ConfirmCancelModal({ booking, roomNumber, onClose, onConfirm, isUpdating }: {
  booking: Booking;
  roomNumber: number;
  onClose: () => void;
  onConfirm: () => void;
  isUpdating: boolean;
}) {
  return (
    <div className="overlay animate-fade-in" style={{ zIndex: 60 }} onClick={onClose}>
      <div 
        className="modal" 
        style={{ maxWidth: 400, textAlign: 'center', padding: 32 }} 
        onClick={e => e.stopPropagation()}
      >
        <div style={{
          width: 64, height: 64, borderRadius: '50%', background: 'var(--danger-light)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 20px'
        }}>
          <AlertTriangle size={32} color="var(--danger)" />
        </div>
        
        <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 12 }}>
          Cancel Booking?
        </h2>
        
        <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.6, marginBottom: 24 }}>
          Are you sure you want to cancel the booking for <strong style={{ color: 'var(--text-primary)' }}>{booking.name}</strong> in <strong style={{ color: 'var(--text-primary)' }}>Room {roomNumber}</strong>? This action cannot be undone.
        </p>

        <div style={{ display: 'flex', gap: 12 }}>
          <button 
            className="btn btn-outline" 
            onClick={onClose} 
            disabled={isUpdating}
            style={{ flex: 1, justifyContent: 'center' }}
          >
            No, Keep it
          </button>
          <button 
            className="btn" 
            onClick={onConfirm}
            disabled={isUpdating}
            style={{ 
              flex: 1, justifyContent: 'center', 
              background: 'var(--danger)', color: '#fff',
              boxShadow: '0 4px 12px rgba(239, 68, 68, 0.25)' 
            }}
          >
            {isUpdating ? 'Cancelling...' : 'Yes, Cancel'}
          </button>
        </div>
      </div>
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

  const subtotal = Number(inv.roomAmount) + Number(inv.serviceAmount);
  const sgst = (subtotal * 0.025);
  const cgst = (subtotal * 0.025);
  const totalWithTax = subtotal + sgst + cgst;

  return (
    <div className="overlay animate-fade-in" onClick={onClose} style={{ zIndex: 100 }}>
      {/* Print Styles */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .printable-invoice, .printable-invoice * { visibility: visible; }
          .printable-invoice { 
            position: absolute; left: 0; top: 0; width: 100%; 
            padding: 40px !important; box-shadow: none !important; border: none !important;
          }
          .no-print { display: none !important; }
        }
      `}</style>

      <div className="modal printable-invoice" style={{ maxWidth: 850, padding: 0 }} onClick={e => e.stopPropagation()}>
        {/* Modal Header (UI only) */}
        <div className="no-print" style={{ padding: '16px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fcfcfc' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <FileText size={18} color="var(--accent)" />
            <span style={{ fontWeight: 700 }}>Tax Invoice Preview</span>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex' }}><X size={20} color="var(--text-muted)" /></button>
        </div>

        <div style={{ padding: 40 }}>
          {/* Document Header */}
          <div style={{ textAlign: 'center', marginBottom: 30 }}>
            <div style={{ fontSize: 24, fontWeight: 900, letterSpacing: '2px', marginBottom: 5 }}>TAX INVOICE</div>
            <div style={{ height: 2, background: '#000', width: 100, margin: '0 auto' }}></div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40, marginBottom: 30, fontSize: 13 }}>
            {/* Left: Buyer Details */}
            <div>
              <div style={{ fontWeight: 800, textTransform: 'uppercase', color: '#666', marginBottom: 8 }}>Invoice To:</div>
              <div style={{ fontSize: 18, fontWeight: 900, marginBottom: 4 }}>{booking.name}</div>
              <div style={{ color: '#444', marginBottom: 2 }}>GSTIN: Unregistered</div>
              <div style={{ color: '#444', lineHeight: 1.5 }}>
                Room {roomNumber}, Cola Goa Resort,<br />
                Cola Beach, South Goa
              </div>
              <div style={{ marginTop: 15 }}>
                <span style={{ fontWeight: 700 }}>Order ID:</span> {booking.id.substring(0, 12).toUpperCase()}
              </div>
            </div>

            {/* Right: Seller Details */}
            <div>
              <div style={{ fontWeight: 800, textTransform: 'uppercase', color: '#666', marginBottom: 8 }}>Seller Details:</div>
              <div style={{ fontSize: 16, fontWeight: 900, marginBottom: 4 }}>{RESORT_DETAILS.name}</div>
              <div style={{ marginBottom: 2 }}><span style={{ fontWeight: 700 }}>GSTIN:</span> {RESORT_DETAILS.gstin}</div>
              <div style={{ marginBottom: 2 }}><span style={{ fontWeight: 700 }}>FSSAI:</span> {RESORT_DETAILS.fssai}</div>
              <div style={{ color: '#444', lineHeight: 1.5, marginBottom: 10 }}>{RESORT_DETAILS.address}</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', rowGap: 4 }}>
                <span style={{ fontWeight: 700 }}>Date:</span> <span>{new Date().toLocaleDateString()}</span>
                <span style={{ fontWeight: 700 }}>Category:</span> <span>{RESORT_DETAILS.serviceDescription}</span>
                <span style={{ fontWeight: 700 }}>Supply:</span> <span>{RESORT_DETAILS.state}</span>
              </div>
            </div>
          </div>

          {/* Table */}
          <table style={{ width: '100%', borderCollapse: 'collapse', border: '1.5px solid #000', marginBottom: 20 }}>
            <thead>
              <tr style={{ background: '#f8f8f8' }}>
                <th style={{ border: '1px solid #000', padding: '10px 8px', textAlign: 'center', fontSize: 11 }}>Sr No</th>
                <th style={{ border: '1px solid #000', padding: '10px 8px', textAlign: 'left', fontSize: 11, width: '40%' }}>Description</th>
                <th style={{ border: '1px solid #000', padding: '10px 8px', textAlign: 'center', fontSize: 11 }}>UOM</th>
                <th style={{ border: '1px solid #000', padding: '10px 8px', textAlign: 'center', fontSize: 11 }}>Qty</th>
                <th style={{ border: '1px solid #000', padding: '10px 8px', textAlign: 'right', fontSize: 11 }}>Unit Price</th>
                <th style={{ border: '1px solid #000', padding: '10px 8px', textAlign: 'right', fontSize: 11 }}>Amount(Rs)</th>
                <th style={{ border: '1px solid #000', padding: '10px 8px', textAlign: 'right', fontSize: 11 }}>Net Value</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ border: '1px solid #000', padding: 10, textAlign: 'center' }}>1.</td>
                <td style={{ border: '1px solid #000', padding: 10 }}>
                  <div style={{ fontWeight: 700 }}>Room Stay - Room {roomNumber}</div>
                  <div style={{ fontSize: 10, color: '#666', marginTop: 2 }}>{booking.checkInDate} to {booking.checkOutDate}</div>
                </td>
                <td style={{ border: '1px solid #000', padding: 10, textAlign: 'center' }}>OTH</td>
                <td style={{ border: '1px solid #000', padding: 10, textAlign: 'center' }}>1</td>
                <td style={{ border: '1px solid #000', padding: 10, textAlign: 'right' }}>{Number(inv.roomAmount).toLocaleString()}</td>
                <td style={{ border: '1px solid #000', padding: 10, textAlign: 'right' }}>{Number(inv.roomAmount).toLocaleString()}</td>
                <td style={{ border: '1px solid #000', padding: 10, textAlign: 'right' }}>{Number(inv.roomAmount).toLocaleString()}</td>
              </tr>
              {inv.serviceAmount > 0 && (
                <tr>
                  <td style={{ border: '1px solid #000', padding: 10, textAlign: 'center' }}>2.</td>
                  <td style={{ border: '1px solid #000', padding: 10 }}>Services & Add-ons</td>
                  <td style={{ border: '1px solid #000', padding: 10, textAlign: 'center' }}>OTH</td>
                  <td style={{ border: '1px solid #000', padding: 10, textAlign: 'center' }}>1</td>
                  <td style={{ border: '1px solid #000', padding: 10, textAlign: 'right' }}>{Number(inv.serviceAmount).toLocaleString()}</td>
                  <td style={{ border: '1px solid #000', padding: 10, textAlign: 'right' }}>{Number(inv.serviceAmount).toLocaleString()}</td>
                  <td style={{ border: '1px solid #000', padding: 10, textAlign: 'right' }}>{Number(inv.serviceAmount).toLocaleString()}</td>
                </tr>
              )}
              {/* Padding rows */}
              <tr style={{ height: 40 }}>
                <td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td>
                <td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td>
                <td style={{ border: '1px solid #000' }}></td>
              </tr>
              <tr style={{ fontWeight: 800 }}>
                <td colSpan={2} style={{ border: '1px solid #000', padding: 10, textAlign: 'center' }}>Subtotal</td>
                <td colSpan={5} style={{ border: '1px solid #000', padding: 10, textAlign: 'right' }}>₹{subtotal.toLocaleString()}</td>
              </tr>
            </tbody>
          </table>

          {/* Totals Section */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 20 }}>
            <div>
              <div style={{ border: '1px solid #000', padding: 10, fontSize: 12, height: '100%' }}>
                <div style={{ fontWeight: 800, marginBottom: 5 }}>Invoice total in words:</div>
                <div style={{ fontStyle: 'italic' }}>{numberToWords(totalWithTax)}</div>
              </div>
            </div>
            <div>
              <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #000', fontSize: 13 }}>
                <tbody>
                  <tr>
                    <td style={{ padding: 8, fontWeight: 700 }}>Taxes</td>
                    <td style={{ padding: 8, fontWeight: 700, textAlign: 'right' }}>Rate</td>
                    <td style={{ padding: 8, fontWeight: 700, textAlign: 'right' }}>Amount</td>
                  </tr>
                  <tr>
                    <td style={{ padding: 8 }}>CGST</td>
                    <td style={{ padding: 8, textAlign: 'right' }}>2.5%</td>
                    <td style={{ padding: 8, textAlign: 'right' }}>{cgst.toFixed(2)}</td>
                  </tr>
                   <tr>
                    <td style={{ padding: 8 }}>SGST</td>
                    <td style={{ padding: 8, textAlign: 'right' }}>2.5%</td>
                    <td style={{ padding: 8, textAlign: 'right' }}>{sgst.toFixed(2)}</td>
                  </tr>
                  <tr style={{ background: '#f8f8f8', fontWeight: 900, fontSize: 16 }}>
                    <td style={{ padding: 12 }}>Invoice Total</td>
                    <td colSpan={2} style={{ padding: 12, textAlign: 'right' }}>₹{totalWithTax.toLocaleString()}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div style={{ marginTop: 40, borderTop: '1px solid #000', paddingTop: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div style={{ fontSize: 11, color: '#666', maxWidth: 350 }}>
              <div style={{ fontWeight: 800, color: '#000', marginBottom: 5 }}>Details of ECO under GST:</div>
              {RESORT_DETAILS.name} (formerly known as Cola Goa Pvt Ltd)<br />
              {RESORT_DETAILS.address}<br />
              GSTIN: {RESORT_DETAILS.gstin}
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ height: 60 }}></div>
              <div style={{ fontWeight: 800, fontSize: 13, borderTop: '1px solid #000', paddingTop: 8, minWidth: 200 }}>
                Authorized Signature
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer (UI only) */}
        <div className="no-print" style={{ padding: '20px 40px', background: '#fcfcfc', borderTop: '1px solid var(--border)', display: 'flex', gap: 12 }}>
          <button className="btn btn-outline" onClick={onClose} style={{ flex: 1, height: 44 }}>Cancel</button>
          <button className="btn btn-primary" onClick={() => window.print()} style={{ flex: 2, height: 44 }}>
            <Printer size={16} /> Print Tax Invoice
          </button>
        </div>
      </div>
    </div>
  );
}
