'use client';

import { useState, useCallback } from 'react';
import { BedDouble, Wrench, Clock, Wifi } from 'lucide-react';
import BookingModal from './BookingModal';
import EditRoomModal from './EditRoomModal';
import { Pencil } from 'lucide-react';

interface Room {
  id: number;
  roomNumber: string;
  pricePerNight: string;
  capacity: number | null;
  status: 'available' | 'occupied' | 'maintenance';
}

interface RoomGridProps {
  rooms: Room[];
}

const STATUS_CONFIG = {
  available: {
    bg: 'linear-gradient(135deg, #f0fdf4, #dcfce7)',
    border: '#bbf7d0',
    textColor: '#14532d',
    accentColor: '#22c55e',
    label: 'Available',
    icon: Wifi,
    clickable: true,
  },
  occupied: {
    bg: 'linear-gradient(135deg, #fff1f2, #ffe4e6)',
    border: '#fecdd3',
    textColor: '#881337',
    accentColor: '#f43f5e',
    label: 'Occupied',
    icon: BedDouble,
    clickable: false,
  },
  maintenance: {
    bg: 'linear-gradient(135deg, #fffbeb, #fef3c7)',
    border: '#fde68a',
    textColor: '#78350f',
    accentColor: '#f59e0b',
    label: 'Maintenance',
    icon: Wrench,
    clickable: false,
  },
};

const CATEGORIES = [
  { name: 'Beach Front', rooms: ['111', '222', '333', '444', '555', '666'] },
  { name: 'Honey moon', rooms: ['777', '888', '999'] },
  { name: 'Sea view', rooms: ['A6', 'A7', 'A8'] },
  { name: 'Luxury', rooms: ['A5'] },
];

export default function RoomGrid({ rooms }: RoomGridProps) {
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [editRoom, setEditRoom] = useState<Room | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleSuccess = useCallback(() => {
    // Just refresh the whole page immediately
    window.location.reload();
  }, []);

  const filterOptions = ['All', 'Available', 'Occupied', 'Maintenance'] as const;
  const [filter, setFilter] = useState<typeof filterOptions[number]>('All');

  const filtered = filter === 'All' ? rooms : rooms.filter(r => r.status === filter.toLowerCase());
  const counts = {
    available: rooms.filter(r => r.status === 'available').length,
    occupied: rooms.filter(r => r.status === 'occupied').length,
    maintenance: rooms.filter(r => r.status === 'maintenance').length,
  };

  return (
    <div key={refreshKey}>
      {/* Legend & Filter */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {filterOptions.map(opt => (
            <button
              key={opt}
              suppressHydrationWarning
              onClick={() => setFilter(opt)}
              style={{
                padding: '8px 18px', borderRadius: 12, fontSize: 13, fontWeight: 700,
                border: filter === opt ? '2px solid var(--accent)' : '1.5px solid var(--border)',
                background: filter === opt ? 'var(--accent-light)' : 'var(--bg-card)',
                color: filter === opt ? 'var(--accent-dark)' : 'var(--text-secondary)',
                cursor: 'pointer', transition: 'all 0.2s',
                boxShadow: filter === opt ? '0 4px 12px var(--accent-light)' : 'none',
              }}
            >
              {opt}
              {opt !== 'All' && (
                <span style={{ marginLeft: 8, background: filter === opt ? 'var(--accent)' : 'var(--bg-base)', color: filter === opt ? '#fff' : 'var(--text-secondary)', borderRadius: 6, padding: '1px 6px', fontSize: 11 }}>
                  {counts[opt.toLowerCase() as keyof typeof counts]}
                </span>
              )}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 16, fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600 }}>
          {[
            { color: '#22c55e', label: 'Ready to Book' },
            { color: '#f43f5e', label: 'Occupied' },
            { color: '#f59e0b', label: 'Maintenance' },
          ].map(({ color, label }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: color, boxShadow: `0 0 0 3px ${color}22` }} />
              {label}
            </div>
          ))}
        </div>
      </div>

      {/* Categorized Room Sections */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
        {CATEGORIES.map(cat => {
          const catRooms = filtered.filter(r => cat.rooms.includes(r.roomNumber));
          if (catRooms.length === 0 && filter !== 'All') return null;

          return (
            <div key={cat.name}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)' }}>{cat.name}</h2>
                <div style={{ height: 1, flex: 1, background: 'linear-gradient(90deg, var(--border), transparent)' }} />
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)' }}>{catRooms.length} Rooms</span>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))',
                gap: 16,
              }}>
                {catRooms.map(room => {
                  const cfg = STATUS_CONFIG[room.status];
                  const Icon = cfg.icon;

                  return (
                    <div
                      key={room.id}
                      onClick={() => cfg.clickable ? setSelectedRoom(room) : null}
                      style={{
                        background: cfg.bg,
                        border: `1px solid ${cfg.border}`,
                        borderRadius: 18,
                        padding: '18px 16px',
                        cursor: cfg.clickable ? 'pointer' : 'default',
                        opacity: room.status === 'maintenance' ? 0.8 : 1,
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        position: 'relative',
                        overflow: 'hidden',
                        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)',
                      }}
                      onMouseEnter={e => {
                        if (cfg.clickable) {
                          e.currentTarget.style.transform = 'translateY(-6px) scale(1.02)';
                          e.currentTarget.style.boxShadow = `0 20px 25px -5px ${cfg.accentColor}22, 0 10px 10px -5px ${cfg.accentColor}11`;
                          e.currentTarget.style.borderColor = cfg.accentColor;
                        }
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.transform = 'none';
                        e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)';
                        e.currentTarget.style.borderColor = cfg.border;
                      }}
                    >
                      {/* Decorative background element */}
                      <div style={{
                        position: 'absolute', top: -20, right: -20, width: 80, height: 80,
                        borderRadius: '50%', background: `${cfg.accentColor}11`, zIndex: 0 
                      }} />

                      {/* Edit Icon moved to top right */}
                      <button
                        suppressHydrationWarning
                        onClick={(e) => { e.stopPropagation(); setEditRoom(room); }}
                        style={{
                          position: 'absolute', top: 16, right: 16,
                          background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(0,0,0,0.05)', borderRadius: 10,
                          width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.08)', cursor: 'pointer', zIndex: 5,
                          color: cfg.accentColor,
                          backdropFilter: 'blur(8px)',
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.background = '#fff';
                          e.currentTarget.style.transform = 'scale(1.1) rotate(5deg)';
                          e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.12)';
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.background = 'rgba(255,255,255,0.7)';
                          e.currentTarget.style.transform = 'scale(1) rotate(0deg)';
                        }}
                      >
                        <Pencil size={16} />
                      </button>

                      <div style={{ position: 'relative', zIndex: 1 }}>
                        <Icon size={22} color={cfg.accentColor} style={{ marginBottom: 12 }} />

                        <div style={{ 
                          fontSize: 9, fontWeight: 800, color: cfg.textColor, 
                          opacity: 0.5, textTransform: 'uppercase', letterSpacing: '0.1em', 
                          marginBottom: 2 
                        }}>
                          {cat.name} Room
                        </div>
                        <div style={{ fontSize: 32, fontWeight: 900, color: cfg.textColor, lineHeight: 1, letterSpacing: '-0.02em' }}>
                          {room.roomNumber}
                        </div>

                        <div style={{ marginTop: 16, paddingTop: 12, borderTop: `1px dashed ${cfg.accentColor}33` }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                            <div style={{ fontSize: 14, fontWeight: 800, color: cfg.textColor }}>
                              ₹{Number(room.pricePerNight).toLocaleString('en-IN')}
                            </div>
                            <div style={{ fontSize: 11, color: cfg.textColor, opacity: 0.5 }}>/ night</div>
                          </div>
                          <div style={{ fontSize: 11, color: cfg.textColor, opacity: 0.6, marginTop: 2, fontWeight: 500 }}>
                            Up to {room.capacity ?? 2} guests
                          </div>
                        </div>

                        <div style={{
                          marginTop: 14,
                          background: cfg.accentColor,
                          color: '#fff',
                          borderRadius: 10,
                          padding: '7px 0',
                          textAlign: 'center',
                          fontSize: 12,
                          fontWeight: 800,
                          boxShadow: `0 4px 10px ${cfg.accentColor}33`,
                          transition: 'transform 0.2s'
                        }}>
                          {cfg.clickable ? 'Book Now' : cfg.label}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Occupied rooms legend row */}
      {rooms.some(r => r.status === 'occupied') && (
        <div style={{
          marginTop: 24, padding: '14px 20px',
          background: '#fff1f2', border: '1px solid #fca5a5',
          borderRadius: 12, fontSize: 13, color: '#991b1b',
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <Clock size={15} />
          <strong>{counts.occupied} room{counts.occupied !== 1 ? 's' : ''} currently occupied</strong> — blocked from new bookings.
        </div>
      )}

      {/* Booking Modal */}
      {selectedRoom && (
        <BookingModal
          room={selectedRoom}
          onClose={() => setSelectedRoom(null)}
          onSuccess={handleSuccess}
        />
      )}

      {/* Edit Room & Invoice Modal */}
      {editRoom && (
        <EditRoomModal
          room={editRoom}
          onClose={() => setEditRoom(null)}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  );
}
