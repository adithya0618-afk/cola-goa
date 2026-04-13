import db from '@/lib/db';
import { rooms } from '@/db/migrations/schema';
import RoomGrid from '@/components/admin/RoomGrid';
import { BedDouble } from 'lucide-react';

async function getRooms() {
  try {
    return await db.select().from(rooms).orderBy(rooms.roomNumber);
  } catch {
    return [];
  }
}

export default async function RoomsPage() {
  const allRooms = await getRooms();

  // Cast as needed for the client component
  const roomData = allRooms.map(r => ({
    id: r.id,
    roomNumber: r.roomNumber,
    pricePerNight: r.pricePerNight,
    capacity: r.capacity,
    status: (r.status ?? 'available') as 'available' | 'occupied' | 'maintenance',
  }));

  const counts = {
    total: roomData.length,
    available: roomData.filter(r => r.status === 'available').length,
    occupied: roomData.filter(r => r.status === 'occupied').length,
  };

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: 28, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800 }}>Room Management</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 4 }}>
            Click a green room to create a new booking. Blocked rooms cannot be booked.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          {[
            { label: 'Total', value: counts.total, color: 'var(--accent)', bg: 'var(--accent-light)' },
            { label: 'Available', value: counts.available, color: '#10b981', bg: '#d1fae5' },
            { label: 'Occupied', value: counts.occupied, color: '#ef4444', bg: '#fee2e2' },
          ].map(({ label, value, color, bg }) => (
            <div key={label} style={{
              background: bg, border: `1.5px solid ${color}33`,
              borderRadius: 12, padding: '10px 18px', textAlign: 'center',
            }}>
              <div style={{ fontSize: 22, fontWeight: 900, color }}>{value}</div>
              <div style={{ fontSize: 11, color, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {roomData.length === 0 ? (
        <div className="card" style={{ padding: 60, textAlign: 'center' }}>
          <BedDouble size={40} color="var(--text-muted)" style={{ margin: '0 auto 12px' }} />
          <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 6 }}>No rooms configured yet</div>
          <div style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
            Run your DB migration to seed the 13 resort rooms.
          </div>
        </div>
      ) : (
        <div className="card" style={{ padding: 28 }}>
          <RoomGrid rooms={roomData} />
        </div>
      )}
    </div>
  );
}
