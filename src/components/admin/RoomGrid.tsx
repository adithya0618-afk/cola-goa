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
    bg: 'linear-gradient(135deg, #ecfdf5, #d1fae5)',
    border: '#6ee7b7',
    textColor: '#065f46',
    accentColor: '#10b981',
    label: 'Available',
    icon: Wifi,
    clickable: true,
  },
  occupied: {
    bg: 'linear-gradient(135deg, #fff1f2, #fee2e2)',
    border: '#fca5a5',
    textColor: '#991b1b',
    accentColor: '#ef4444',
    label: 'Occupied',
    icon: BedDouble,
    clickable: false,
  },
  maintenance: {
    bg: 'linear-gradient(135deg, #fffbeb, #fef3c7)',
    border: '#fcd34d',
    textColor: '#92400e',
    accentColor: '#f59e0b',
    label: 'Maintenance',
    icon: Wrench,
    clickable: false,
  },
};

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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {filterOptions.map(opt => (
            <button
              key={opt}
              suppressHydrationWarning
              onClick={() => setFilter(opt)}
              style={{
                padding: '7px 16px', borderRadius: 99, fontSize: 13, fontWeight: 600,
                border: filter === opt ? '2px solid var(--accent)' : '1.5px solid var(--border)',
                background: filter === opt ? 'var(--accent-light)' : 'var(--bg-card)',
                color: filter === opt ? 'var(--accent-dark)' : 'var(--text-secondary)',
                cursor: 'pointer', transition: 'all 0.15s',
              }}
            >
              {opt}
              {opt !== 'All' && (
                <span style={{ marginLeft: 6, background: filter === opt ? 'var(--accent)' : 'var(--bg-base)', color: filter === opt ? '#fff' : 'var(--text-secondary)', borderRadius: 99, padding: '1px 7px', fontSize: 11 }}>
                  {counts[opt.toLowerCase() as keyof typeof counts]}
                </span>
              )}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 16, fontSize: 12, color: 'var(--text-secondary)' }}>
          {[
            { color: '#10b981', label: 'Click to book' },
            { color: '#ef4444', label: 'Occupied' },
            { color: '#f59e0b', label: 'Maintenance' },
          ].map(({ color, label }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 10, height: 10, borderRadius: 3, background: color }} />
              {label}
            </div>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
        gap: 16,
      }}>
        {filtered.map(room => {
          const cfg = STATUS_CONFIG[room.status];
          const Icon = cfg.icon;

          return (
            <div
              key={room.id}
              onClick={() => cfg.clickable ? setSelectedRoom(room) : null}
              style={{
                background: cfg.bg,
                border: `2px solid ${cfg.border}`,
                borderRadius: 16,
                padding: 18,
                cursor: cfg.clickable ? 'pointer' : 'not-allowed',
                opacity: room.status === 'maintenance' ? 0.75 : 1,
                transition: 'all 0.18s ease',
                position: 'relative',
                overflow: 'hidden',
              }}
              onMouseEnter={e => {
                if (cfg.clickable) {
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.boxShadow = `0 8px 24px ${cfg.border}66`;
                }
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {/* Edit Icon */}
              <button
                suppressHydrationWarning
                onClick={(e) => { e.stopPropagation(); setEditRoom(room); }}
                style={{
                  position: 'absolute', top: 12, left: 12,
                  background: '#fff', border: 'none', borderRadius: '50%',
                  width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)', cursor: 'pointer', zIndex: 2,
                  color: '#64748b'
                }}
              >
                <Pencil size={14} />
              </button>

              {/* Status dot */}
              <div style={{
                position: 'absolute', top: 12, right: 12,
                width: 10, height: 10, borderRadius: '50%',
                background: cfg.accentColor,
                boxShadow: `0 0 0 3px ${cfg.accentColor}33`,
                animation: room.status === 'occupied' ? 'none' : 'pulse-dot 2s infinite',
              }} />

              <Icon size={24} color={cfg.accentColor} style={{ marginBottom: 10 }} />

              <div style={{ fontSize: 22, fontWeight: 900, color: cfg.textColor, lineHeight: 1 }}>
                {room.roomNumber}
              </div>
              <div style={{ fontSize: 11, fontWeight: 600, color: cfg.textColor, opacity: 0.7, marginTop: 2, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Room
              </div>

              <div style={{ marginTop: 12, paddingTop: 10, borderTop: `1px solid ${cfg.border}` }}>
                <div style={{ fontSize: 12, color: cfg.textColor, opacity: 0.8, fontWeight: 500 }}>
                  ₹{Number(room.pricePerNight).toLocaleString('en-IN')}/night
                </div>
                <div style={{ fontSize: 11, color: cfg.textColor, opacity: 0.5, marginTop: 2 }}>
                  {room.capacity ?? 2} guests
                </div>
              </div>

              <div style={{
                marginTop: 10,
                background: cfg.accentColor,
                color: '#fff',
                borderRadius: 8,
                padding: '5px 0',
                textAlign: 'center',
                fontSize: 12,
                fontWeight: 700,
              }}>
                {cfg.clickable ? '+ Book Now' : cfg.label}
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
