'use client';

import { useState } from 'react';
import { X, User, Phone, Mail, Calendar, CreditCard, CheckCircle, Loader } from 'lucide-react';

interface Room {
  id: number;
  roomNumber: string;
  pricePerNight: string;
  capacity: number | null;
  status: 'available' | 'occupied' | 'maintenance';
}

interface BookingModalProps {
  room: Room;
  onClose: () => void;
  onSuccess: () => void;
}

export default function BookingModal({ room, onClose, onSuccess }: BookingModalProps) {
  const [step, setStep] = useState<'details' | 'summary' | 'done'>('details');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [created, setCreated] = useState<{ id: string; guestToken: string } | null>(null);

  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    checkInDate: today,
    checkOutDate: tomorrow,
    paymentStatus: 'pending' as 'pending' | 'partial' | 'paid',
    advanceAmount: '',
  });

  const nights = Math.max(1,
    Math.ceil((new Date(form.checkOutDate).getTime() - new Date(form.checkInDate).getTime()) / 86400000)
  );
  const roomAmount = nights * Number(room.pricePerNight);

  function update(key: string, val: string) {
    setForm(f => ({ ...f, [key]: val }));
  }

  async function handleSubmit() {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          roomId: room.id,
          roomAmount: roomAmount.toString(),
          totalAmount: roomAmount.toString(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Booking failed');
      setCreated({ id: data.booking.id, guestToken: data.booking.guestToken });
      setStep('done');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed');
    } finally {
      setLoading(false);
    }
  }

  const paymentLabels: Record<string, string> = { pending: 'Pending', partial: 'Partial Advance', paid: 'Fully Paid' };

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal animate-fade-in" style={{ maxWidth: 520 }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{
          padding: '22px 28px', borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div>
            <div style={{ fontSize: 17, fontWeight: 700 }}>
              {step === 'done' ? '✅ Booking Confirmed' : `Book Room ${room.roomNumber}`}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
              ₹{Number(room.pricePerNight).toLocaleString('en-IN')} / night · Capacity: {room.capacity ?? 2}
            </div>
          </div>
          <button onClick={() => { if (step === 'done') onSuccess(); onClose(); }} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
            <X size={20} color="var(--text-secondary)" />
          </button>
        </div>

        <div style={{ padding: '24px 28px' }}>
          {/* STEP: Details */}
          {step === 'details' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {error && (
                <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 8, padding: '10px 14px', color: '#991b1b', fontSize: 13 }}>
                  {error}
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div className="field" style={{ gridColumn: '1/-1' }}>
                  <label className="label">Guest Full Name *</label>
                  <div style={{ position: 'relative' }}>
                    <User size={14} color="var(--text-muted)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                    <input className="input" placeholder="John Doe" value={form.name} onChange={e => update('name', e.target.value)} style={{ paddingLeft: 34 }} required />
                  </div>
                </div>

                <div className="field">
                  <label className="label">Phone *</label>
                  <div style={{ position: 'relative' }}>
                    <Phone size={14} color="var(--text-muted)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                    <input className="input" placeholder="+91 99999 00000" value={form.phone} onChange={e => update('phone', e.target.value)} style={{ paddingLeft: 34 }} required />
                  </div>
                </div>

                <div className="field">
                  <label className="label">Email</label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={14} color="var(--text-muted)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                    <input className="input" type="email" placeholder="guest@email.com" value={form.email} onChange={e => update('email', e.target.value)} style={{ paddingLeft: 34 }} />
                  </div>
                </div>

                <div className="field">
                  <label className="label">Check-In Date *</label>
                  <div style={{ position: 'relative' }}>
                    <Calendar size={14} color="var(--text-muted)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                    <input className="input" type="date" value={form.checkInDate} min={today} onChange={e => update('checkInDate', e.target.value)} style={{ paddingLeft: 34 }} required />
                  </div>
                </div>

                <div className="field">
                  <label className="label">Check-Out Date *</label>
                  <div style={{ position: 'relative' }}>
                    <Calendar size={14} color="var(--text-muted)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                    <input className="input" type="date" value={form.checkOutDate} min={form.checkInDate} onChange={e => update('checkOutDate', e.target.value)} style={{ paddingLeft: 34 }} required />
                  </div>
                </div>

                <div className="field" style={{ gridColumn: '1/-1' }}>
                  <label className="label">Payment Status</label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {(['pending', 'partial', 'paid'] as const).map(s => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => update('paymentStatus', s)}
                        style={{
                          flex: 1, padding: '9px 0', borderRadius: 10, fontSize: 13, fontWeight: 600,
                          border: form.paymentStatus === s ? '2px solid var(--accent)' : '1.5px solid var(--border)',
                          background: form.paymentStatus === s ? 'var(--accent-light)' : 'transparent',
                          color: form.paymentStatus === s ? 'var(--accent-dark)' : 'var(--text-secondary)',
                          cursor: 'pointer', transition: 'all 0.15s',
                        }}
                      >
                        {paymentLabels[s]}
                      </button>
                    ))}
                  </div>
                </div>

                {form.paymentStatus === 'partial' && (
                  <div className="field" style={{ gridColumn: '1/-1' }}>
                    <label className="label">Advance Amount (₹)</label>
                    <div style={{ position: 'relative' }}>
                      <CreditCard size={14} color="var(--text-muted)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                      <input className="input" type="number" placeholder="0" value={form.advanceAmount} onChange={e => update('advanceAmount', e.target.value)} style={{ paddingLeft: 34 }} />
                    </div>
                  </div>
                )}
              </div>

              {/* Summary bar */}
              <div style={{
                background: 'var(--bg-base)', borderRadius: 12, padding: '14px 16px',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                  {nights} night{nights !== 1 ? 's' : ''} · Room {room.roomNumber}
                </div>
                <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--accent)' }}>
                  ₹{roomAmount.toLocaleString('en-IN')}
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                <button className="btn btn-outline" onClick={onClose} style={{ flex: 1 }}>Cancel</button>
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    if (!form.name || !form.phone || !form.checkInDate || !form.checkOutDate) {
                      setError('Please fill all required fields');
                      return;
                    }
                    setStep('summary');
                  }}
                  style={{ flex: 2 }}
                >
                  Review Booking →
                </button>
              </div>
            </div>
          )}

          {/* STEP: Summary */}
          {step === 'summary' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ background: 'var(--bg-base)', borderRadius: 14, padding: 20 }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 14, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Booking Summary
                </h3>
                {[
                  ['Guest', form.name],
                  ['Phone', form.phone],
                  ['Email', form.email || '—'],
                  ['Room', `Room ${room.roomNumber}`],
                  ['Check-In', form.checkInDate],
                  ['Check-Out', form.checkOutDate],
                  ['Nights', nights.toString()],
                  ['Rate/Night', `₹${Number(room.pricePerNight).toLocaleString('en-IN')}`],
                  ['Payment Status', paymentLabels[form.paymentStatus]],
                ].map(([k, v]) => (
                  <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid var(--border)', fontSize: 14 }}>
                    <span style={{ color: 'var(--text-secondary)' }}>{k}</span>
                    <span style={{ fontWeight: 600 }}>{v}</span>
                  </div>
                ))}
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0 0', fontSize: 17, fontWeight: 800 }}>
                  <span>Total Amount</span>
                  <span style={{ color: 'var(--accent)' }}>₹{roomAmount.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {error && (
                <div style={{ background: '#fee2e2', borderRadius: 8, padding: '10px 14px', color: '#991b1b', fontSize: 13 }}>
                  {error}
                </div>
              )}

              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn btn-outline" onClick={() => setStep('details')} style={{ flex: 1 }}>← Edit</button>
                <button
                  className="btn btn-success"
                  onClick={handleSubmit}
                  disabled={loading}
                  style={{ flex: 2, justifyContent: 'center' }}
                >
                  {loading ? <><Loader size={15} style={{ animation: 'spin 1s linear infinite' }} /> Processing...</> : '✅ Confirm Booking'}
                </button>
              </div>
            </div>
          )}

          {/* STEP: Done */}
          {step === 'done' && created && (
            <div style={{ textAlign: 'center', padding: '12px 0' }}>
              <CheckCircle size={56} color="var(--success)" style={{ margin: '0 auto 16px' }} />
              <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 8 }}>Booking Confirmed!</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 20 }}>
                Room {room.roomNumber} has been booked for {form.name}.
              </p>
              <div style={{
                background: 'var(--bg-base)', borderRadius: 12, padding: '14px 20px', marginBottom: 20,
                border: '1.5px dashed var(--border)',
              }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Booking ID</div>
                <div style={{ fontSize: 13, fontWeight: 700, fontFamily: 'monospace', wordBreak: 'break-all' }}>{created.id}</div>
              </div>
              <div style={{
                background: 'var(--success-light)', borderRadius: 12, padding: '14px 20px', marginBottom: 24,
                fontSize: 13, color: '#065f46',
              }}>
                📱 Guest link will be shared via WhatsApp/Email automatically.
              </div>
              <button className="btn btn-primary" onClick={() => { onSuccess(); onClose(); }} style={{ width: '100%', justifyContent: 'center' }}>
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
