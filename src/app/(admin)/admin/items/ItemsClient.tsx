'use client';

import { useState } from 'react';
import { Plus, Pencil, Trash2, X, UtensilsCrossed, Search } from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────────────────────
interface Item {
  id: number;
  name: string;
  type: string | null;
  /**
   * `categories` is the new multi-value field stored as a JSON array in the DB.
   * For backward-compat the API may still return `category` (string | null);
   * we normalise on load.
   */
  categories: string[];
  description: string | null;
  price: string;
  isAvailable: boolean | null;
}

// Incoming shape from the server (old schema may only have `category`)
interface RawItem {
  id: number;
  name: string;
  type: string | null;
  category?: string | null;
  categories?: string[] | null;
  description: string | null;
  price: string;
  isAvailable: boolean | null;
}

function normalise(raw: RawItem): Item {
  return {
    ...raw,
    categories: Array.isArray(raw.categories) && raw.categories.length
      ? raw.categories
      : raw.category
        ? [raw.category]
        : [],
  };
}

// ── Constants ─────────────────────────────────────────────────────────────────
const FOOD_CATEGORIES  = ['Breakfast', 'Lunch', 'Dinner', 'Snacks'];
const DRINK_CATEGORIES = [
  'Beverages',
  'Cocktails & Spirits',
  'Wines & Champagne',
  'Craft Beer',
  'Juices & Mocktails',
  'Soft Drinks',
  'Hot Beverages',
];
const SERVICE_CATEGORIES = ['Housekeeping', 'Wellness', 'Spa', 'Extras'];

const ALL_CATEGORIES = [...FOOD_CATEGORIES, ...DRINK_CATEGORIES, ...SERVICE_CATEGORIES];

const CATEGORY_GROUPS = [
  { label: '🍽️ Food',     options: FOOD_CATEGORIES },
  { label: '🍸 Drinks',   options: DRINK_CATEGORIES },
  { label: '🛁 Services', options: SERVICE_CATEGORIES },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
function categoryBadgeStyle(cat: string): { bg: string; color: string } {
  if (DRINK_CATEGORIES.includes(cat))   return { bg: '#1a1a2e', color: '#C9A84C' };
  if (SERVICE_CATEGORIES.includes(cat)) return { bg: '#F0EDFD', color: '#6D28D9' };
  return { bg: '#EBF4FD', color: '#1565C0' };
}

// ── Multi-select category picker ──────────────────────────────────────────────
function CategoryPicker({ selected, onChange }: {
  selected: string[];
  onChange: (cats: string[]) => void;
}) {
  const toggle = (cat: string) => {
    onChange(selected.includes(cat) ? selected.filter(c => c !== cat) : [...selected, cat]);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {CATEGORY_GROUPS.map(group => (
        <div key={group.label}>
          <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>
            {group.label}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {group.options.map(cat => {
              const isSelected = selected.includes(cat);
              const style = categoryBadgeStyle(cat);
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => toggle(cat)}
                  style={{
                    padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                    cursor: 'pointer', border: '1.5px solid',
                    fontFamily: 'inherit', transition: 'all 0.15s',
                    background: isSelected ? style.bg : 'transparent',
                    color: isSelected ? style.color : 'var(--text-secondary)',
                    borderColor: isSelected ? style.bg : 'var(--border)',
                  }}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>
      ))}
      {selected.length > 0 && (
        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
          Selected: {selected.join(', ')}
        </div>
      )}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function ItemsClient({ items: rawItems }: { items: RawItem[] }) {
  const [list,       setList]       = useState<Item[]>(rawItems.map(normalise));
  const [showModal,  setShowModal]  = useState(false);
  const [editing,    setEditing]    = useState<Item | null>(null);
  const [search,     setSearch]     = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [catFilter,  setCatFilter]  = useState('all');
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState('');

  const emptyForm = {
    name: '', type: 'food', categories: [] as string[],
    description: '', price: '', isAvailable: true,
  };
  const [form, setForm] = useState(emptyForm);

  function openAdd() { setEditing(null); setForm(emptyForm); setError(''); setShowModal(true); }
  function openEdit(item: Item) {
    setEditing(item);
    setForm({
      name: item.name, type: item.type ?? 'food',
      categories: item.categories,
      description: item.description ?? '', price: item.price,
      isAvailable: item.isAvailable ?? true,
    });
    setError(''); setShowModal(true);
  }

  async function handleSave() {
    if (!form.name || !form.price) { setError('Name and price are required'); return; }
    setLoading(true); setError('');
    try {
      const method = editing ? 'PUT' : 'POST';
      const url    = editing ? `/api/admin/items/${editing.id}` : '/api/admin/items';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          // Send both for backward-compat: API can store whichever field it supports
          category: form.categories[0] ?? null,
          categories: form.categories,
        }),
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
      body: JSON.stringify({
        ...item,
        category: item.categories[0] ?? null,
        categories: item.categories,
        isAvailable: !item.isAvailable,
      }),
    });
    setList(l => l.map(i => i.id === item.id ? { ...i, isAvailable: !i.isAvailable } : i));
  }

  // ── Filter logic ────────────────────────────────────────────────────────────
  const allCats = ['all', ...ALL_CATEGORIES];
  const filtered = list.filter(item => {
    const matchSearch = !search
      || item.name.toLowerCase().includes(search.toLowerCase())
      || item.categories.some(c => c.toLowerCase().includes(search.toLowerCase()));
    const matchType = typeFilter === 'all' || item.type === typeFilter;
    const matchCat  = catFilter  === 'all' || item.categories.includes(catFilter);
    return matchSearch && matchType && matchCat;
  });

  // ── Group display ────────────────────────────────────────────────────────────
  const isDrinkItem = (item: Item) => item.categories.some(c => DRINK_CATEGORIES.includes(c));

  return (
    <div className="animate-fade-in">
      <div className="page-header" style={{ marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800 }}>Menu & Items</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 4 }}>
            Manage food, drinks, and services · Items can belong to multiple categories
          </p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}><Plus size={15} /> Add Item</button>
      </div>

      {/* ── Filters ── */}
      <div className="filter-row" style={{ flexWrap: 'wrap', gap: 10, marginBottom: 20 }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: '1 1 220px', minWidth: 200 }}>
          <Search size={14} color="var(--text-muted)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
          <input className="input" placeholder="Search items or categories…" value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 34 }} />
        </div>

        {/* Type pills */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {['all', 'food', 'service'].map(t => (
            <button key={t} onClick={() => setTypeFilter(t)} className="btn btn-outline btn-sm"
              style={{ background: typeFilter === t ? 'var(--accent)' : undefined, color: typeFilter === t ? '#fff' : undefined, borderColor: typeFilter === t ? 'var(--accent)' : undefined }}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {/* Category quick-filter */}
        <select
          className="input"
          value={catFilter}
          onChange={e => setCatFilter(e.target.value)}
          style={{ flex: '0 0 auto', minWidth: 160, fontSize: 13 }}
        >
          <option value="all">All Categories</option>
          {CATEGORY_GROUPS.map(g => (
            <optgroup key={g.label} label={g.label}>
              {g.options.map(c => <option key={c} value={c}>{c}</option>)}
            </optgroup>
          ))}
        </select>
      </div>

      {/* ── Item count ── */}
      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>
        {filtered.length} item{filtered.length !== 1 ? 's' : ''} found
      </div>

      {/* ── Grid ── */}
      {filtered.length === 0 ? (
        <div className="card" style={{ padding: 60, textAlign: 'center' }}>
          <UtensilsCrossed size={40} color="var(--text-muted)" style={{ margin: '0 auto 12px' }} />
          <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 6 }}>No items found</div>
          <div style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Adjust filters or add a new item.</div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: 16 }}>
          {filtered.map(item => {
            const isDrink = isDrinkItem(item);
            return (
              <div
                key={item.id}
                className="card"
                style={{
                  padding: 18, opacity: item.isAvailable ? 1 : 0.6,
                  border: isDrink ? '1.5px solid #C9A84C33' : undefined,
                  background: isDrink ? 'linear-gradient(135deg,#1a1a2e,#1e2035)' : undefined,
                  color: isDrink ? '#fff' : undefined,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 6, color: isDrink ? '#fff' : undefined }}>
                      {isDrink ? '🍸 ' : ''}{item.name}
                    </div>
                    {/* Category chips */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                      <span className={`badge ${item.type === 'food' ? 'badge-info' : 'badge-warning'}`}>{item.type}</span>
                      {item.categories.map(cat => {
                        const s = categoryBadgeStyle(cat);
                        return (
                          <span key={cat} style={{
                            fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 20,
                            background: s.bg, color: s.color,
                          }}>
                            {cat}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                  <div style={{ fontWeight: 800, fontSize: 17, color: isDrink ? '#C9A84C' : 'var(--accent)', flexShrink: 0, marginLeft: 8 }}>
                    ₹{Number(item.price).toLocaleString('en-IN')}
                  </div>
                </div>

                {item.description && (
                  <div style={{ fontSize: 12, color: isDrink ? 'rgba(255,255,255,0.5)' : 'var(--text-secondary)', marginBottom: 12, lineHeight: 1.5 }}>
                    {item.description}
                  </div>
                )}

                {/* Multi-category info note */}
                {item.categories.length > 1 && (
                  <div style={{
                    fontSize: 10, marginBottom: 10,
                    color: isDrink ? 'rgba(201,168,76,0.7)' : 'var(--text-muted)',
                    background: isDrink ? 'rgba(201,168,76,0.08)' : '#F9FAFB',
                    borderRadius: 6, padding: '4px 8px',
                    border: isDrink ? '1px solid rgba(201,168,76,0.2)' : '1px solid var(--border)',
                  }}>
                    ✦ Appears in {item.categories.length} categories — no duplicates shown to guests
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, borderTop: `1px solid ${isDrink ? 'rgba(255,255,255,0.1)' : 'var(--border)'}` }}>
                  <button
                    onClick={() => toggleAvailability(item)}
                    style={{
                      padding: '4px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600,
                      cursor: 'pointer', border: 'none',
                      background: item.isAvailable ? '#d1fae5' : '#fee2e2',
                      color: item.isAvailable ? '#065f46' : '#991b1b',
                    }}
                  >
                    {item.isAvailable ? '✅ Available' : '❌ Unavailable'}
                  </button>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button className="btn btn-outline btn-sm" onClick={() => openEdit(item)}
                      style={isDrink ? { borderColor: 'rgba(255,255,255,0.2)', color: '#fff' } : undefined}>
                      <Pencil size={12} />
                    </button>
                    <button className="btn btn-sm" onClick={() => handleDelete(item.id)} style={{ background: '#fee2e2', color: '#991b1b', border: 'none' }}>
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Add / Edit Modal ── */}
      {showModal && (
        <div className="overlay" onClick={() => setShowModal(false)}>
          <div className="modal animate-fade-in" style={{ maxWidth: 520 }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: '22px 28px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontWeight: 700, fontSize: 17 }}>{editing ? 'Edit Item' : 'Add New Item'}</div>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} color="var(--text-secondary)" />
              </button>
            </div>

            <div style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 18, overflowY: 'auto', maxHeight: '70vh' }}>
              {error && (
                <div style={{ background: '#fee2e2', borderRadius: 8, padding: '10px 14px', color: '#991b1b', fontSize: 13 }}>
                  {error}
                </div>
              )}

              {/* Name */}
              <div className="field">
                <label className="label">Item Name *</label>
                <input
                  className="input" placeholder="e.g. Chicken Starter"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                />
              </div>

              {/* Type */}
              <div className="field">
                <label className="label">Type</label>
                <select className="input" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                  <option value="food">Food / Drink</option>
                  <option value="service">Service</option>
                </select>
              </div>

              {/* Categories (multi-select) */}
              <div className="field">
                <label className="label" style={{ marginBottom: 10 }}>
                  Categories
                  <span style={{ fontSize: 10, fontWeight: 400, color: 'var(--text-muted)', marginLeft: 6 }}>
                    Select one or more — item appears once per category, no duplicates
                  </span>
                </label>
                <CategoryPicker
                  selected={form.categories}
                  onChange={cats => setForm(f => ({ ...f, categories: cats }))}
                />
              </div>

              {/* Description */}
              <div className="field">
                <label className="label">Description</label>
                <textarea
                  className="input" rows={2}
                  placeholder="Optional description"
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                />
              </div>

              {/* Price */}
              <div className="field">
                <label className="label">Price (₹) *</label>
                <input
                  className="input" type="number" placeholder="0"
                  value={form.price}
                  onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                />
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                <button className="btn btn-outline" onClick={() => setShowModal(false)} style={{ flex: 1 }}>Cancel</button>
                <button className="btn btn-primary" onClick={handleSave} disabled={loading} style={{ flex: 2 }}>
                  {loading ? 'Saving…' : editing ? 'Update Item' : 'Add Item'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
