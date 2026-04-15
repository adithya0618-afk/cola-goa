'use client';

import { useState } from 'react';
import { CreditCard, Search } from 'lucide-react';

interface Payment {
  id: string;
  bookingId: string | null;
  amount: string;
  paymentMethod: string | null;
  status: string | null;
  transactionRef: string | null;
  createdAt: Date | null;
  guestName: string | null;
}

export default function PaymentsClient({ payments }: { payments: Payment[] }) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const filtered = payments.filter(p => {
    const matchSearch = !search || p.guestName?.toLowerCase().includes(search.toLowerCase()) || p.transactionRef?.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' || p.status === filter;
    return matchSearch && matchFilter;
  });

  const total = payments.reduce((s, p) => s + (p.status === 'success' ? Number(p.amount) : 0), 0);
  const pending = payments.filter(p => p.status === 'pending').length;

  const statusBadge = (s: string | null) => s === 'success' ? 'badge-success' : s === 'pending' ? 'badge-warning' : 'badge-danger';
  const methodIcon = (m: string | null) => m === 'cash' ? '💵' : m === 'card' ? '💳' : '📱';

  return (
    <div className="animate-fade-in">
      <div className="page-header" style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800 }}>Payment Tracking</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 4 }}>Track all transactions and payment statuses</p>
      </div>

      {/* Summary */}
      <div className="stat-grid">
        {[
          { label: 'Total Collected', value: `₹${total.toLocaleString('en-IN')}`, bg: '#d1fae5', color: '#065f46' },
          { label: 'Total Transactions', value: payments.length, bg: 'var(--accent-light)', color: 'var(--accent-dark)' },
          { label: 'Pending', value: pending, bg: '#fef3c7', color: '#92400e' },
          { label: 'Failed', value: payments.filter(p => p.status === 'failed').length, bg: '#fee2e2', color: '#991b1b' },
        ].map(({ label, value, bg, color }) => (
          <div key={label} className="card" style={{ padding: 20 }}>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8 }}>{label}</div>
            <div style={{ fontSize: 26, fontWeight: 800, color }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="filter-row">
        <div style={{ position: 'relative', flex: 1, minWidth: 220 }}>
          <Search size={14} color="var(--text-muted)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
          <input className="input" placeholder="Search by guest or reference..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 34 }} />
        </div>
        <div className="filter-pills">
          {['all', 'success', 'pending', 'failed'].map(s => (
            <button key={s} suppressHydrationWarning onClick={() => setFilter(s)} className="btn btn-outline btn-sm"
              style={{ background: filter === s ? 'var(--accent)' : undefined, color: filter === s ? '#fff' : undefined, borderColor: filter === s ? 'var(--accent)' : undefined }}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="card" style={{ overflow: 'hidden' }}>
        {filtered.length === 0 ? (
          <div style={{ padding: 60, textAlign: 'center', color: 'var(--text-muted)' }}>
            <CreditCard size={36} style={{ margin: '0 auto 12px', display: 'block' }} />
            No payments found
          </div>
        ) : (
          <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Guest</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Status</th>
                <th>Ref</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id}>
                  <td style={{ fontWeight: 500 }}>{p.guestName || '—'}</td>
                  <td style={{ fontWeight: 800, color: 'var(--accent)' }}>₹{Number(p.amount).toLocaleString('en-IN')}</td>
                  <td>{methodIcon(p.paymentMethod)} {p.paymentMethod || '—'}</td>
                  <td><span className={`badge ${statusBadge(p.status)}`}>{p.status}</span></td>
                  <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{p.transactionRef || '—'}</td>
                  <td style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                    {p.createdAt ? new Date(p.createdAt).toLocaleDateString('en-IN') : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        )}
      </div>
    </div>
  );
}
