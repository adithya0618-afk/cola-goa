'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Wallet, DollarSign, Plus, Pencil, Trash2, X, BedDouble, ShoppingBag, Utensils } from 'lucide-react';

interface Expense {
  id: number;
  amount: string;
  description: string | null;
  date: string;
  createdAt: string | null;
  updatedAt: string | null;
}

interface RoomTransaction {
  id: string;
  booking_code: string | null;
  guest_name: string | null;
  phone: string | null;
  room_amount: string;
  total_amount: string;
  payment_status: string;
  booking_status: string;
  check_in_date: string;
  check_out_date: string;
  created_at: string;
}

interface FoodTransaction {
  id: string;
  guest_name: string | null;
  room_number: string | null;
  total_amount: string;
  created_at: string;
}

interface RevenueData {
  roomsRevenue: number;
  foodRevenue: number;
  expensesTotal: number;
  netProfit: number;
  expenses: Expense[];
  roomTransactions: RoomTransaction[];
  foodTransactions: FoodTransaction[];
}

const paymentBadge = (s: string) =>
  s === 'paid' ? 'badge-success' : s === 'partial' ? 'badge-warning' : 'badge-danger';

export default function RevenuePage() {
  const [data, setData] = useState<RevenueData>({
    roomsRevenue: 0,
    foodRevenue: 0,
    expensesTotal: 0,
    netProfit: 0,
    expenses: [],
    roomTransactions: [],
    foodTransactions: [],
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'rooms' | 'food' | 'expenses'>('rooms');
  const [showModal, setShowModal] = useState(false);
  const [editExpense, setEditExpense] = useState<Expense | null>(null);
  const [form, setForm] = useState({ amount: '', description: '', date: '' });
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    try {
      const res = await fetch('/api/admin/revenue');
      if (res.ok) setData(await res.json());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const openAdd = () => {
    setEditExpense(null);
    setForm({ amount: '', description: '', date: new Date().toISOString().split('T')[0] });
    setShowModal(true);
  };

  const openEdit = (exp: Expense) => {
    setEditExpense(exp);
    setForm({ amount: String(exp.amount), description: exp.description || '', date: exp.date?.split('T')[0] || '' });
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const method = editExpense ? 'PUT' : 'POST';
      const body = editExpense
        ? { id: editExpense.id, ...form, amount: Number(form.amount) }
        : { ...form, amount: Number(form.amount) };
      await fetch('/api/admin/revenue', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      setShowModal(false);
      fetchData();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this expense?')) return;
    await fetch('/api/admin/revenue', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    fetchData();
  };

  const fmt = (n: number) => `₹${n.toLocaleString('en-IN')}`;
  const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

  const stats = [
    { label: 'Rooms Revenue', value: fmt(data.roomsRevenue), bg: '#d1fae5', color: '#065f46', icon: DollarSign },
    { label: 'Food Revenue', value: fmt(data.foodRevenue), bg: '#dbeafe', color: '#1e3a8a', icon: Wallet },
    { label: 'Total Expenses', value: fmt(data.expensesTotal), bg: '#fee2e2', color: '#991b1b', icon: TrendingDown },
    {
      label: 'Net Profit',
      value: fmt(data.netProfit),
      bg: data.netProfit >= 0 ? '#d1fae5' : '#fee2e2',
      color: data.netProfit >= 0 ? '#065f46' : '#991b1b',
      icon: TrendingUp,
    },
  ];

  const tabs = [
    { key: 'rooms', label: 'Room Transactions', icon: BedDouble },
    { key: 'food', label: 'Food Transactions', icon: Utensils },
    { key: 'expenses', label: 'Expenses', icon: ShoppingBag },
  ] as const;

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="page-header" style={{ marginBottom: 24, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800 }}>Revenue & Expenses</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 4 }}>
            Track income from rooms, food orders, and manage expenses
          </p>
        </div>
        <button className="btn btn-primary" onClick={openAdd} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Plus size={16} /> Add Expense
        </button>
      </div>

      {/* Stat Cards */}
      <div className="stat-grid" style={{ marginBottom: 28 }}>
        {stats.map(({ label, value, bg, color, icon: Icon }) => (
          <div key={label} className="card" style={{ padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 600 }}>{label}</div>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={18} color={color} />
              </div>
            </div>
            <div style={{ fontSize: 26, fontWeight: 800, color }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="filter-row" style={{ marginBottom: 16 }}>
        <div className="filter-pills">
          {tabs.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              suppressHydrationWarning
              className="btn btn-outline btn-sm"
              onClick={() => setActiveTab(key)}
              style={{
                background: activeTab === key ? 'var(--accent)' : undefined,
                color: activeTab === key ? '#fff' : undefined,
                borderColor: activeTab === key ? 'var(--accent)' : undefined,
                display: 'flex', alignItems: 'center', gap: 6,
              }}
            >
              <Icon size={13} /> {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Room Transactions Tab ─────────────────────────────────────── */}
      {activeTab === 'rooms' && (
        <div className="card" style={{ overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', fontWeight: 700, fontSize: 15 }}>
            Paid / Partial Bookings — Room Revenue
          </div>
          {loading ? (
            <div style={{ padding: 60, textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</div>
          ) : data.roomTransactions.length === 0 ? (
            <div style={{ padding: 60, textAlign: 'center', color: 'var(--text-muted)' }}>
              <BedDouble size={36} style={{ margin: '0 auto 12px', display: 'block' }} />
              No paid bookings yet.
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Guest</th>
                    <th>Booking Code</th>
                    <th>Stay</th>
                    <th>Room Amount</th>
                    <th>Payment</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {data.roomTransactions.map(tx => (
                    <tr key={tx.id}>
                      <td style={{ fontWeight: 500 }}>{tx.guest_name || '—'}</td>
                      <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{tx.booking_code || '—'}</td>
                      <td style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                        {fmtDate(tx.check_in_date)} → {fmtDate(tx.check_out_date)}
                      </td>
                      <td style={{ fontWeight: 800, color: '#065f46' }}>
                        ₹{Number(tx.room_amount).toLocaleString('en-IN')}
                      </td>
                      <td>
                        <span className={`badge ${paymentBadge(tx.payment_status)}`}>
                          {tx.payment_status}
                        </span>
                      </td>
                      <td style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                        {fmtDate(tx.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── Food Transactions Tab ─────────────────────────────────────── */}
      {activeTab === 'food' && (
        <div className="card" style={{ overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', fontWeight: 700, fontSize: 15 }}>
            Completed Orders — Food & Service Revenue
          </div>
          {loading ? (
            <div style={{ padding: 60, textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</div>
          ) : !data.foodTransactions || data.foodTransactions.length === 0 ? (
            <div style={{ padding: 60, textAlign: 'center', color: 'var(--text-muted)' }}>
              <Utensils size={36} style={{ margin: '0 auto 12px', display: 'block' }} />
              No completed food orders yet.
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Guest</th>
                    <th>Room Number</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {data.foodTransactions.map(tx => (
                    <tr key={tx.id}>
                      <td style={{ fontWeight: 500 }}>{tx.guest_name || 'Walk-in Guest'}</td>
                      <td style={{ fontWeight: 600 }}>{tx.room_number ? `Room ${tx.room_number}` : '—'}</td>
                      <td style={{ fontWeight: 800, color: '#1e3a8a' }}>
                        ₹{Number(tx.total_amount).toLocaleString('en-IN')}
                      </td>
                      <td>
                        <span className="badge badge-success">
                          Completed
                        </span>
                      </td>
                      <td style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                        {fmtDate(tx.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── Expenses Tab ──────────────────────────────────────────────── */}
      {activeTab === 'expenses' && (
        <div className="card" style={{ overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', fontWeight: 700, fontSize: 15 }}>
            Expense Records
          </div>
          {loading ? (
            <div style={{ padding: 60, textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</div>
          ) : data.expenses.length === 0 ? (
            <div style={{ padding: 60, textAlign: 'center', color: 'var(--text-muted)' }}>
              <TrendingDown size={36} style={{ margin: '0 auto 12px', display: 'block' }} />
              No expenses yet. Click <strong>Add Expense</strong> to get started.
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Description</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.expenses.map(exp => (
                    <tr key={exp.id}>
                      <td style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{fmtDate(exp.date)}</td>
                      <td style={{ fontWeight: 500 }}>{exp.description || <span style={{ color: 'var(--text-muted)' }}>—</span>}</td>
                      <td style={{ fontWeight: 800, color: '#dc2626' }}>
                        ₹{Number(exp.amount).toLocaleString('en-IN')}
                      </td>
                      <td>
                        {exp.updatedAt
                          ? <span className="badge badge-success">Edited</span>
                          : <span className="badge badge-warning">Original</span>}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                          <button className="btn btn-outline btn-sm" onClick={() => openEdit(exp)}
                            style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <Pencil size={13} /> Edit
                          </button>
                          <button className="btn btn-sm" onClick={() => handleDelete(exp.id)}
                            style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#fee2e2', color: '#dc2626', border: '1px solid #fecaca' }}>
                            <Trash2 size={13} /> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div className="card" style={{ width: '100%', maxWidth: 440, padding: 28, position: 'relative' }}>
            <button onClick={() => setShowModal(false)}
              style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
              <X size={20} />
            </button>
            <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 20 }}>
              {editExpense ? 'Edit Expense' : 'Add Expense'}
            </h2>
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: 'var(--text-secondary)' }}>Amount (₹) *</label>
                <input className="input" type="number" placeholder="e.g. 5000" value={form.amount}
                  onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} required min="0" step="0.01" />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: 'var(--text-secondary)' }}>Description</label>
                <input className="input" type="text" placeholder="e.g. Electricity bill" value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: 'var(--text-secondary)' }}>Date *</label>
                <input className="input" type="date" value={form.date}
                  onChange={e => setForm(f => ({ ...f, date: e.target.value }))} required />
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={saving}>
                  {saving ? 'Saving...' : editExpense ? 'Update' : 'Add Expense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
