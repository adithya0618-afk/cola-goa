'use client';

import { useState } from 'react';
import { Users, Plus, Pencil, Trash2, X, Mail, Phone, Shield } from 'lucide-react';

interface Staff {
  id: string;
  name: string | null;
  role: string | null;
  shift: string | null;
  email: string | null;
  phone: string | null;
}

const ROLES = ['receptionist', 'admin', 'housekeeping', 'food_staff', 'manager', 'security'];
const SHIFTS = ['morning', 'evening', 'night', 'full_day'];

const roleColors: Record<string, string> = {
  admin: 'badge-danger',
  receptionist: 'badge-info',
  manager: 'badge-warning',
  housekeeping: 'badge-success',
  food_staff: 'badge-warning',
  security: 'badge-gray',
};

export default function StaffClient({ staff }: { staff: Staff[] }) {
  const [list, setList] = useState(staff);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Staff | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const emptyForm = { name: '', role: 'receptionist', shift: 'morning', email: '', phone: '', password: '' };
  const [form, setForm] = useState(emptyForm);

  function openAdd() { setEditing(null); setForm(emptyForm); setError(''); setShowModal(true); }
  function openEdit(s: Staff) {
    setEditing(s);
    setForm({ name: s.name ?? '', role: s.role ?? 'receptionist', shift: s.shift ?? 'morning', email: s.email ?? '', phone: s.phone ?? '', password: '' });
    setError(''); setShowModal(true);
  }

  async function handleSave() {
    setLoading(true); setError('');
    try {
      const method = editing ? 'PUT' : 'POST';
      const url = editing ? `/api/admin/staff/${editing.id}` : '/api/admin/staff';
      const body = editing ? { name: form.name, role: form.role, shift: form.shift, email: form.email, phone: form.phone } : form;
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      setShowModal(false);
      window.location.reload();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed');
    } finally { setLoading(false); }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this staff member?')) return;
    await fetch(`/api/admin/staff/${id}`, { method: 'DELETE' });
    setList(l => l.filter(s => s.id !== id));
  }

  const initials = (name: string | null) => (name || 'U').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  const avatarColors = ['#0ea5e9', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4'];

  return (
    <div className="animate-fade-in">
      <div className="page-header" style={{ marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800 }}>Staff Management</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 4 }}>{list.length} staff members</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}><Plus size={15} /> Add Staff</button>
      </div>

      {list.length === 0 ? (
        <div className="card" style={{ padding: 60, textAlign: 'center' }}>
          <Users size={40} color="var(--text-muted)" style={{ margin: '0 auto 12px' }} />
          <div style={{ fontWeight: 700, fontSize: 16 }}>No staff members yet</div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 16 }}>
          {list.map((member, i) => (
            <div key={member.id} className="card" style={{ padding: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 14,
                  background: avatarColors[i % avatarColors.length],
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontWeight: 800, fontSize: 17,
                }}>
                  {initials(member.name)}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 16 }}>{member.name}</div>
                  <span className={`badge ${roleColors[member.role ?? ''] ?? 'badge-gray'}`}>
                    <Shield size={11} /> {member.role}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 7, padding: '12px 0', borderTop: '1px solid var(--border)' }}>
                {member.email && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-secondary)' }}>
                    <Mail size={13} /> {member.email}
                  </div>
                )}
                {member.phone && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-secondary)' }}>
                    <Phone size={13} /> {member.phone}
                  </div>
                )}
                {member.shift && (
                  <div style={{ fontSize: 12, marginTop: 2 }}>
                    <span className="badge badge-gray">⏰ {member.shift} shift</span>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
                <button className="btn btn-outline btn-sm" onClick={() => openEdit(member)} style={{ flex: 1 }}><Pencil size={12} /> Edit</button>
                <button className="btn btn-sm" onClick={() => handleDelete(member.id)} style={{ background: '#fee2e2', color: '#991b1b', border: 'none' }}><Trash2 size={12} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="overlay" onClick={() => setShowModal(false)}>
          <div className="modal animate-fade-in" style={{ maxWidth: 480 }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: '22px 28px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between' }}>
              <div style={{ fontWeight: 700, fontSize: 17 }}>{editing ? 'Edit Staff' : 'Add Staff Member'}</div>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} color="var(--text-secondary)" /></button>
            </div>
            <div style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 16 }}>
              {error && <div style={{ background: '#fee2e2', borderRadius: 8, padding: '10px 14px', color: '#991b1b', fontSize: 13 }}>{error}</div>}

              <div className="field">
                <label className="label">Full Name *</label>
                <input className="input" placeholder="John Doe" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div className="field">
                  <label className="label">Role</label>
                  <select className="input" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
                    {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div className="field">
                  <label className="label">Shift</label>
                  <select className="input" value={form.shift} onChange={e => setForm(f => ({ ...f, shift: e.target.value }))}>
                    {SHIFTS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              <div className="field">
                <label className="label">Email *</label>
                <input className="input" type="email" placeholder="staff@colagoa.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
              </div>
              <div className="field">
                <label className="label">Phone</label>
                <input className="input" placeholder="+91 99999 00000" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
              </div>
              {!editing && (
                <div className="field">
                  <label className="label">Password *</label>
                  <input className="input" type="password" placeholder="••••••••" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
                </div>
              )}

              <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                <button className="btn btn-outline" onClick={() => setShowModal(false)} style={{ flex: 1 }}>Cancel</button>
                <button className="btn btn-primary" onClick={handleSave} disabled={loading} style={{ flex: 2 }}>
                  {loading ? 'Saving...' : editing ? 'Update Staff' : 'Add Staff'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
