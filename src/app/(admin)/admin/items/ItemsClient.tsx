'use client';

import { useState } from 'react';
import { Plus, Pencil, Trash2, X, UtensilsCrossed, Search } from 'lucide-react';

interface Item {
  id: number;
  name: string;
  type: string | null;
  category: string | null;
  description: string | null;
  price: string;
  isAvailable: boolean | null;
}

const CATEGORIES = ['Breakfast', 'Lunch', 'Dinner', 'Snacks', 'Beverages', 'Spa', 'Housekeeping', 'Extras'];

export default function ItemsClient({ items }: { items: Item[] }) {
  const [list, setList] = useState<Item[]>(items);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Item | null>(null);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const emptyForm = { name: '', type: 'food', category: 'Breakfast', description: '', price: '', isAvailable: true };
  const [form, setForm] = useState(emptyForm);

  function openAdd() { setEditing(null); setForm(emptyForm); setError(''); setShowModal(true); }
  function openEdit(item: Item) {
    setEditing(item);
    setForm({ name: item.name, type: item.type ?? 'food', category: item.category ?? 'Breakfast', description: item.description ?? '', price: item.price, isAvailable: item.isAvailable ?? true });
    setError('');
    setShowModal(true);
  }

  async function handleSave() {
    setLoading(true); setError('');
    try {
      const method = editing ? 'PUT' : 'POST';
      const url = editing ? `/api/admin/items/${editing.id}` : '/api/admin/items';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      setShowModal(false);
      window.location.reload();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed');
    } finally { setLoading(false); }
  }

  async function handleDelete(id: number) {
    if (!confirm('Delete this item?')) return;
    await fetch(`/api/admin/items/${id}`, { method: 'DELETE' });
    setList(l => l.filter(i => i.id !== id));
  }

  async function toggleAvailability(item: Item) {
    await fetch(`/api/admin/items/${item.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...item, isAvailable: !item.isAvailable }),
    });
    setList(l => l.map(i => i.id === item.id ? { ...i, isAvailable: !i.isAvailable } : i));
  }

  const filtered = list.filter(item => {
    const matchSearch = !search || item.name.toLowerCase().includes(search.toLowerCase()) || item.category?.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === 'all' || item.type === typeFilter;
    return matchSearch && matchType;
  });

  return (
    <div className="animate-fade-in">
      <div className="page-header" style={{ marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800 }}>Menu & Items</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 4 }}>
            Manage food items and services available to guests
          </p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}><Plus size={15} /> Add Item</button>
      </div>

      {/* Filters */}
      <div className="filter-row">
        <div style={{ position: 'relative', flex: 1, minWidth: 220 }}>
          <Search size={14} color="var(--text-muted)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
          <input className="input" placeholder="Search items..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 34 }} />
        </div>
        <div className="filter-pills">
          {['all', 'food', 'service'].map(t => (
            <button key={t} onClick={() => setTypeFilter(t)} className="btn btn-outline btn-sm"
              style={{ background: typeFilter === t ? 'var(--accent)' : undefined, color: typeFilter === t ? '#fff' : undefined, borderColor: typeFilter === t ? 'var(--accent)' : undefined }}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="card" style={{ padding: 60, textAlign: 'center' }}>
          <UtensilsCrossed size={40} color="var(--text-muted)" style={{ margin: '0 auto 12px' }} />
          <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 6 }}>No items yet</div>
          <div style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Add food or service items to get started.</div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: 16 }}>
          {filtered.map(item => (
            <div key={item.id} className="card" style={{ padding: 18, opacity: item.isAvailable ? 1 : 0.6 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{item.name}</div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <span className={`badge ${item.type === 'food' ? 'badge-info' : 'badge-warning'}`}>{item.type}</span>
                    {item.category && <span className="badge badge-gray">{item.category}</span>}
                  </div>
                </div>
                <div style={{ fontWeight: 800, fontSize: 17, color: 'var(--accent)' }}>₹{Number(item.price).toLocaleString('en-IN')}</div>
              </div>
              {item.description && (
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 12, lineHeight: 1.5 }}>{item.description}</div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, borderTop: '1px solid var(--border)' }}>
                <button
                  onClick={() => toggleAvailability(item)}
                  style={{
                    padding: '4px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', border: 'none',
                    background: item.isAvailable ? '#d1fae5' : '#fee2e2',
                    color: item.isAvailable ? '#065f46' : '#991b1b',
                  }}
                >
                  {item.isAvailable ? '✅ Available' : '❌ Unavailable'}
                </button>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button className="btn btn-outline btn-sm" onClick={() => openEdit(item)}><Pencil size={12} /></button>
                  <button className="btn btn-sm" onClick={() => handleDelete(item.id)} style={{ background: '#fee2e2', color: '#991b1b', border: 'none' }}><Trash2 size={12} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="overlay" onClick={() => setShowModal(false)}>
          <div className="modal animate-fade-in" style={{ maxWidth: 480 }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: '22px 28px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between' }}>
              <div style={{ fontWeight: 700, fontSize: 17 }}>{editing ? 'Edit Item' : 'Add New Item'}</div>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} color="var(--text-secondary)" /></button>
            </div>
            <div style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 16 }}>
              {error && <div style={{ background: '#fee2e2', borderRadius: 8, padding: '10px 14px', color: '#991b1b', fontSize: 13 }}>{error}</div>}

              <div className="field">
                <label className="label">Item Name *</label>
                <input className="input" placeholder="e.g. Butter Chicken" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div className="field">
                  <label className="label">Type</label>
                  <select className="input" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                    <option value="food">Food</option>
                    <option value="service">Service</option>
                  </select>
                </div>
                <div className="field">
                  <label className="label">Category</label>
                  <select className="input" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div className="field">
                <label className="label">Description</label>
                <textarea className="input" rows={2} placeholder="Optional description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
              </div>

              <div className="field">
                <label className="label">Price (₹) *</label>
                <input className="input" type="number" placeholder="0" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} />
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                <button className="btn btn-outline" onClick={() => setShowModal(false)} style={{ flex: 1 }}>Cancel</button>
                <button className="btn btn-primary" onClick={handleSave} disabled={loading} style={{ flex: 2 }}>
                  {loading ? 'Saving...' : editing ? 'Update Item' : 'Add Item'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
