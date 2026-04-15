'use client';

import { useState, useEffect } from 'react';
import { X, CheckCircle2, BedDouble, User, Settings2, Download, LogOut, Wrench, Phone, Mail } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface EditRoomModalProps {
  room: any;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditRoomModal({ room, onClose, onSuccess }: EditRoomModalProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  
  // Data State
  const [roomData, setRoomData] = useState<any>(null);
  const [activeBooking, setActiveBooking] = useState<any>(null);
  const [guestUser, setGuestUser] = useState<any>(null);
  const [roomOrders, setRoomOrders] = useState<any[]>([]);

  // Form State
  const [pricePerNight, setPricePerNight] = useState(room.pricePerNight);
  const [capacity, setCapacity] = useState(room.capacity?.toString() || '2');
  const [status, setStatus] = useState(room.status);
  
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [checkInDate, setCheckInDate] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');

  useEffect(() => {
    fetchRoomDetails();
  }, [room.id]);

  const fetchRoomDetails = async () => {
    try {
      const res = await fetch(`/api/admin/rooms/${room.id}`);
      const data = await res.json();
      
      setRoomData(data.room);
      setActiveBooking(data.activeBooking);
      setGuestUser(data.guestUser);
      setRoomOrders(data.roomOrders || []);

      if (data.guestUser) {
        setGuestName(data.guestUser.name || '');
        setGuestPhone(data.guestUser.phone || '');
        setGuestEmail(data.guestUser.email || '');
      }
      if (data.activeBooking) {
        setCheckInDate(data.activeBooking.checkInDate || '');
        setCheckOutDate(data.activeBooking.checkOutDate || '');
      }
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleUpdateRoom = async () => {
    setSaving(true);
    try {
      await fetch(`/api/admin/rooms/${room.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_room',
          payload: { pricePerNight, capacity: parseInt(capacity), status }
        })
      });
      onSuccess();
      onClose();
    } catch (e) {
      console.error(e);
      setSaving(false);
    }
  };

  const handleUpdateGuest = async () => {
    setSaving(true);
    try {
      await fetch(`/api/admin/rooms/${room.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_guest',
          payload: { 
            bookingId: activeBooking.id, 
            userId: guestUser.id, 
            name: guestName, 
            phone: guestPhone, 
            email: guestEmail,
            checkInDate,
            checkOutDate
          }
        })
      });
      setSaving(false);
      setSuccessMsg('Guest details updated successfully.');
      setTimeout(() => setSuccessMsg(''), 3500);
    } catch (e) {
      console.error(e);
      setSaving(false);
    }
  };

  const handleCheckout = async () => {
    // Validate if checking out early
    if (activeBooking?.checkOutDate) {
      const scheduledCheckOut = new Date(activeBooking.checkOutDate);
      // Set to 11 AM local hotel time
      scheduledCheckOut.setHours(11, 0, 0, 0);
      
      const now = new Date();
      if (now < scheduledCheckOut) {
        const proceed = confirm(`⚠️ WARNING: You are checking out this guest early!\n\nTheir scheduled check-out is not until ${activeBooking.checkOutDate} at 11:00 AM.\n\nClick OK if you still want to process the check-out and free the room.`);
        if (!proceed) return;
      } else {
        if (!confirm('Are you sure you want to process check-out? This will free the room.')) return;
      }
    } else {
      if (!confirm('Are you sure you want to process check-out? This will free the room.')) return;
    }
    
    setSaving(true);
    try {
      await fetch(`/api/admin/rooms/${room.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'checkout',
          payload: { bookingId: activeBooking.id }
        })
      });
      onSuccess();
      onClose();
    } catch (e) {
      console.error(e);
      setSaving(false);
    }
  };

  const generateInvoice = () => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(22);
    doc.setTextColor(14, 165, 233);
    doc.text('Cola Goa Resort', 14, 22);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text('Tax Invoice / Bill of Supply', 14, 30);
    doc.text(`Invoice Date: ${new Date().toLocaleDateString()}`, 14, 36);
    doc.text(`Booking Ref: ${activeBooking?.bookingCode || activeBooking?.id?.substring(0,8) || 'N/A'}`, 14, 42);

    // Guest Info
    doc.setFontSize(12);
    doc.setTextColor(40);
    doc.text('Bill To:', 140, 22);
    doc.setFontSize(10);
    doc.setTextColor(80);
    doc.text(guestName || 'Guest', 140, 30);
    doc.text(guestPhone || 'No Phone', 140, 36);
    doc.text(guestEmail || 'No Email', 140, 42);

    // Line
    doc.setDrawColor(200);
    doc.line(14, 48, 196, 48);

    // Stay Details
    doc.setFontSize(12);
    doc.setTextColor(40);
    doc.text(`Room: ${room.roomNumber}`, 14, 60);
    doc.setFontSize(10);
    doc.text(`Check In: ${activeBooking?.checkInDate || 'N/A'}`, 14, 68);
    doc.text(`Check Out: ${activeBooking?.checkOutDate || 'N/A'}`, 14, 74);
    doc.text(`Rate: INR ${room.pricePerNight}/night`, 14, 80);

    // Room charges calculation (simplified for presentation)
    // You would normally parse dates to calculate exact nights
    const ci = new Date(activeBooking?.checkInDate);
    const co = new Date(activeBooking?.checkOutDate);
    let nights = 1;
    if (!isNaN(ci.getTime()) && !isNaN(co.getTime()) && co > ci) {
        nights = Math.ceil((co.getTime() - ci.getTime()) / (1000 * 60 * 60 * 24));
    }
    if (nights === 0) nights = 1; // Minimum 1 night
    const roomTotal = nights * Number(room.pricePerNight);

    const tableData = [
      ['Room Charges', `${nights} Nights`, `₹${room.pricePerNight}`, `₹${roomTotal}`]
    ];

    let itemsTotal = 0;
    roomOrders.forEach((o: any) => {
        const itemTotal = Number(o.price); // Price usually includes quantity logic in your schema, assuming fixed here for now
        itemsTotal += itemTotal;
        tableData.push([
            o.itemData?.name || 'Service/Item', 
            `Qty: ${o.quantity}`, 
            `₹${o.price / o.quantity}`, 
            `₹${itemTotal}`
        ]);
    });

    const grandTotal = roomTotal + itemsTotal;

    autoTable(doc, {
        startY: 90,
        head: [['Description', 'Details', 'Unit Price', 'Total']],
        body: tableData,
        theme: 'striped',
        headStyles: { fillColor: [14, 165, 233] },
        styles: { fontSize: 10, cellPadding: 5 }
    });

    const finalY = (doc as any).lastAutoTable.finalY || 90;

    doc.setFontSize(12);
    doc.setTextColor(40);
    doc.text(`Total Amount: Rs. ${grandTotal.toLocaleString('en-IN')}/-`, 140, finalY + 15);

    // Footer
    doc.setFontSize(9);
    doc.setTextColor(150);
    doc.text('Thank you for staying with Cola Goa Beach Resort!', 14, 280);
    doc.text('This is a computer-generated invoice and does not require a signature.', 14, 285);

    doc.save(`Invoice_Room_${room.roomNumber}_${guestName.replace(/\s+/g, '_')}.pdf`);
  };

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal animate-fade-in" style={{ maxWidth: 640 }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{
          padding: '22px 28px', borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div>
            <div style={{ fontSize: 17, fontWeight: 700 }}>
              Edit Room {room.roomNumber}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
              ₹{Number(room.pricePerNight).toLocaleString('en-IN')} / night · Capacity: {room.capacity ?? 2}
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
            <X size={20} color="var(--text-secondary)" />
          </button>
        </div>

        <div style={{ padding: '20px 28px' }}>
          {successMsg && (
            <div 
              className="animate-slide-in"
              style={{ 
                background: '#d1fae5', color: '#065f46', 
                padding: '12px 16px', borderRadius: 10, 
                marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10,
                fontSize: 14, fontWeight: 600, border: '1px solid #34d399'
              }}
            >
              <CheckCircle2 size={18} />
              {successMsg}
            </div>
          )}
          {loading ? (
            <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: 14 }}>
              Loading securely...
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              
              {/* IF OCCUPIED: Guest Details */}
              {activeBooking && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                    <div className="field" style={{ gridColumn: '1/-1' }}>
                      <label className="label">Guest Full Name *</label>
                      <div style={{ position: 'relative' }}>
                        <User size={14} color="var(--text-muted)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                        <input 
                          className="input" 
                          value={guestName} 
                          onChange={e => setGuestName(e.target.value)} 
                          style={{ paddingLeft: 34 }} 
                        />
                      </div>
                    </div>

                    <div className="field">
                      <label className="label">Phone *</label>
                      <div style={{ position: 'relative' }}>
                        <Phone size={14} color="var(--text-muted)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                        <input 
                          className="input" 
                          value={guestPhone} 
                          onChange={e => setGuestPhone(e.target.value)} 
                          style={{ paddingLeft: 34 }} 
                        />
                      </div>
                    </div>

                    <div className="field">
                      <label className="label">Email</label>
                      <div style={{ position: 'relative' }}>
                        <Mail size={14} color="var(--text-muted)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                        <input 
                          className="input" 
                          type="email" 
                          value={guestEmail} 
                          onChange={e => setGuestEmail(e.target.value)} 
                          style={{ paddingLeft: 34 }} 
                        />
                      </div>
                    </div>

                    <div className="field">
                      <label className="label">Check-In Date</label>
                      <input 
                        className="input" 
                        type="date" 
                        value={checkInDate} 
                        onChange={e => setCheckInDate(e.target.value)} 
                      />
                    </div>

                    <div className="field">
                      <label className="label">Check-Out Date</label>
                      <input 
                        className="input" 
                        type="date" 
                        value={checkOutDate} 
                        onChange={e => setCheckOutDate(e.target.value)} 
                      />
                    </div>
                  </div>

                  <button 
                    className="btn btn-outline" 
                    onClick={handleUpdateGuest}
                    disabled={saving}
                    style={{ width: '100%', justifyContent: 'center' }}
                  >
                    Save Guest Edits
                  </button>
                  
                  <div style={{ height: 1, background: 'var(--border)', margin: '4px 0' }}></div>
                </div>
              )}

              {/* ALWAYS SHOW: Room Configuration */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div className="field" style={{ gridColumn: '1/-1' }}>
                    <label className="label">Status Mode</label>
                    <select
                      className="input"
                      value={status}
                      onChange={e => setStatus(e.target.value)}
                      disabled={room.status === 'occupied'}
                      style={{ 
                        opacity: room.status === 'occupied' ? 0.6 : 1,
                        cursor: room.status === 'occupied' ? 'not-allowed' : 'pointer'
                      }}
                    >
                      <option value="available">Available</option>
                      <option value="occupied" disabled>Occupied (Locked)</option>
                      <option value="maintenance">Maintenance</option>
                    </select>
                  </div>

                  <div className="field">
                    <label className="label">Price Per Night</label>
                    <input 
                      className="input" 
                      type="number" 
                      value={pricePerNight} 
                      onChange={e => setPricePerNight(e.target.value)} 
                    />
                  </div>

                  <div className="field">
                    <label className="label">Capacity</label>
                    <input 
                      className="input" 
                      type="number" 
                      value={capacity} 
                      onChange={e => setCapacity(e.target.value)} 
                    />
                  </div>
                </div>

                <button 
                  className="btn btn-outline" 
                  onClick={handleUpdateRoom}
                  disabled={saving}
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  Save Configuration
                </button>
              </div>

              {/* Critical Actions at Bottom */}
              {activeBooking && (
                <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                  <button
                    className="btn btn-outline"
                    onClick={generateInvoice}
                    disabled={saving}
                    style={{ flex: 1, color: 'var(--accent)', borderColor: 'var(--accent)', justifyContent: 'center' }}
                  >
                    <Download size={14} style={{ marginRight: 6 }} /> Download PDF
                  </button>
                  <button
                    className="btn"
                    onClick={handleCheckout}
                    disabled={saving}
                    style={{ 
                      flex: 1, 
                      justifyContent: 'center',
                      background: '#ef4444', 
                      color: 'white', 
                      border: 'none',
                      opacity: saving ? 0.7 : 1
                    }}
                  >
                    <LogOut size={14} style={{ marginRight: 6 }} /> Check-Out
                  </button>
                </div>
              )}

            </div>
          )}
        </div>
      </div>
    </div>
  );
}
