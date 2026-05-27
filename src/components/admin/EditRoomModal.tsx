'use client';

import { useState, useEffect } from 'react';
import { X, CheckCircle2, User, Download, LogOut, Phone, Mail } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { numberToWords, RESORT_DETAILS } from '@/lib/invoiceUtils';

// Define specific types to replace any
interface Room {
  id: number;
  pricePerNight: string;
  capacity?: number | null;
  status: string;
  roomNumber: string;
}
interface Booking {
  id: string;
  checkInDate?: string;
  checkOutDate?: string;
}
interface GuestUser {
  id: string;
  name: string;
  phone?: string;
  email?: string;
}
interface Order {
  id: string;
  itemData?: { name: string };
  quantity: number;
  price: number;
}



interface EditRoomModalProps {
  room: Room;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditRoomModal({ room, onClose, onSuccess }: EditRoomModalProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  
  // Data State
  const [activeBooking, setActiveBooking] = useState<Booking | null>(null);
  const [guestUser, setGuestUser] = useState<GuestUser | null>(null);
  const [roomOrders, setRoomOrders] = useState<Order[]>([]);


  // Form State
  const [pricePerNight, setPricePerNight] = useState(room.pricePerNight);
  const [paymentStatus, setPaymentStatus] = useState('');
  const [capacity, setCapacity] = useState(room.capacity?.toString() || '2');
  const [status, setStatus] = useState(room.status);
  
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [checkInDate, setCheckInDate] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');

  useEffect(() => {
    const loadRoomData = async () => {
      try {
        const res = await fetch(`/api/admin/rooms/${room.id}`);
        const data = await res.json();
        setActiveBooking(data.activeBooking as Booking);
        setGuestUser(data.guestUser as GuestUser);
        setRoomOrders(data.roomOrders as Order[] || []);

        if (data.guestUser) {
          setGuestName(data.guestUser.name || '');
          setGuestPhone(data.guestUser.phone || '');
          setGuestEmail(data.guestUser.email || '');
        }
        if (data.activeBooking) {
          setCheckInDate(data.activeBooking.checkInDate || '');
          setCheckOutDate(data.activeBooking.checkOutDate || '');
          setPaymentStatus(data.activeBooking.paymentStatus || 'PENDING');
        }
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };
    loadRoomData();
  }, [room.id]);

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
            bookingId: activeBooking?.id, 
            userId: guestUser?.id, 
            name: guestName, 
            phone: guestPhone, 
            email: guestEmail,
            checkInDate,
            checkOutDate,
            paymentStatus
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
          payload: { bookingId: activeBooking?.id }
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
    
    // Header - TAX INVOICE
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('TAX INVOICE', 105, 20, { align: 'center' });
    doc.setLineWidth(0.5);
    doc.line(95, 23, 115, 23);

    // Left Column: Buyer Details
    doc.setFontSize(9);
    doc.setTextColor(100);
    doc.setFont('helvetica', 'bold');
    doc.text('Invoice To:', 14, 35);
    
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text(guestName || 'Guest', 14, 42);
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80);
    doc.text('GSTIN: Unregistered', 14, 48);
    doc.text(`Address: Room ${room.roomNumber}, Cola Goa Resort, Goa`, 14, 54);
    doc.text(`Order ID: ${activeBooking?.id?.substring(0, 12)?.toUpperCase() || 'N/A'}`, 14, 65);

    // Right Column: Seller Details
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(100);
    doc.text('Seller Details:', 120, 35);
    
    doc.setFontSize(11);
    doc.setTextColor(0);
    doc.text(RESORT_DETAILS.name, 120, 42);
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80);
    doc.text(`GSTIN: ${RESORT_DETAILS.gstin}`, 120, 48);
    doc.text(`FSSAI: ${RESORT_DETAILS.fssai}`, 120, 54);
    doc.text(RESORT_DETAILS.address, 120, 60, { maxWidth: 70 });
    
    doc.setFont('helvetica', 'bold');
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 120, 75);
    doc.text(`Supply: ${RESORT_DETAILS.state}`, 120, 81);
    doc.text(`Category: ${RESORT_DETAILS.serviceDescription}`, 120, 87);

    // Stay Details Line
    doc.setDrawColor(0);
    doc.setLineWidth(0.2);
    doc.line(14, 92, 196, 92);

    // Calculations
    const ci = activeBooking?.checkInDate ? new Date(activeBooking.checkInDate) : new Date();
    const co = activeBooking?.checkOutDate ? new Date(activeBooking.checkOutDate) : new Date();
    let nights = 1;
    if (!isNaN(ci.getTime()) && !isNaN(co.getTime()) && co > ci) {
        nights = Math.ceil((co.getTime() - ci.getTime()) / (1000 * 60 * 60 * 24));
    }
    if (nights === 0) nights = 1;

    const roomTotal = nights * Number(room.pricePerNight);
    let itemsTotal = 0;
    const tableBody: (Array<string | number>)[] = [
        [1, `Room Stay - Room ${room.roomNumber}\n(${activeBooking?.checkInDate || 'N/A'} to ${activeBooking?.checkOutDate || 'N/A'})`, 'OTH', nights, Number(room.pricePerNight).toFixed(2), roomTotal.toFixed(2), '0.00', roomTotal.toFixed(2)]
    ];

    roomOrders.forEach((o: Order, idx: number) => {
        const itemTotal = Number(o.price);
        itemsTotal += itemTotal;
        tableBody.push([
            idx + 2, 
            o.itemData?.name || 'Service/Item', 
            'OTH', 
            o.quantity, 
            (o.price / o.quantity).toFixed(2), 
            itemTotal.toFixed(2),
            '0.00',
            itemTotal.toFixed(2)
        ]);
    });

    const subtotal = roomTotal + itemsTotal;
    const cgst = subtotal * 0.025;
    const sgst = subtotal * 0.025;
    const grandTotal = subtotal + cgst + sgst;

    // Table
    autoTable(doc, {
        startY: 95,
        head: [['Sr No', 'Description', 'UOM', 'Qty', 'Unit Price', 'Amount', 'Disc', 'Net Value']],
        body: tableBody,
        theme: 'grid',
        headStyles: { fillColor: [240, 240, 240], textColor: 0, lineWidth: 0.1, lineColor: 0, fontStyle: 'bold', fontSize: 8 },
        styles: { fontSize: 8, cellPadding: 3, lineColor: 0, lineWidth: 0.1 },
        columnStyles: {
            0: { halign: 'center' },
            1: { cellWidth: 50 },
            2: { halign: 'center' },
            3: { halign: 'center' },
            4: { halign: 'right' },
            5: { halign: 'right' },
            6: { halign: 'right' },
            7: { halign: 'right' }
        }
    });

    const finalY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;

    // Totals Table Mimic
    doc.setDrawColor(0);
    doc.rect(14, finalY, 110, 25);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('Invoice total in words:', 17, finalY + 7);
    doc.setFont('helvetica', 'italic');
    doc.text(numberToWords(grandTotal), 17, finalY + 15, { maxWidth: 100 });

    doc.rect(130, finalY, 66, 25);
    doc.setFont('helvetica', 'normal');
    doc.text('Subtotal:', 133, finalY + 6);
    doc.text(subtotal.toLocaleString(), 193, finalY + 6, { align: 'right' });
    doc.text('CGST (2.5%):', 133, finalY + 11);
    doc.text(cgst.toFixed(2), 193, finalY + 11, { align: 'right' });
    doc.text('SGST (2.5%):', 133, finalY + 16);
    doc.text(sgst.toFixed(2), 193, finalY + 16, { align: 'right' });
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Invoice Total:', 133, finalY + 22);
    doc.text(`Rs. ${grandTotal.toLocaleString()}`, 193, finalY + 22, { align: 'right' });

    // Footer
    const footerY = 270;
    doc.line(14, footerY, 196, footerY);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0);
    doc.text('Details of ECO under GST:', 14, footerY + 5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100);
    doc.text(`${RESORT_DETAILS.name}\n${RESORT_DETAILS.address}\nGSTIN: ${RESORT_DETAILS.gstin}`, 14, footerY + 10);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0);
    doc.text('Authorized Signature', 160, footerY + 15);
    doc.line(150, footerY + 10, 196, footerY + 10);

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
                      <div className="field">
                        <label className="label">Payment Status</label>
                        <select className="input" value={paymentStatus} onChange={e => setPaymentStatus(e.target.value)}>
                          <option value="">Select status</option>
                          <option value="paid">Paid</option>
                          <option value="unpaid">Unpaid</option>
                          <option value="partial">Partial</option>
                        </select>
                      </div>
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
