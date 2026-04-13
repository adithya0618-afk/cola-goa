import { BedDouble, CalendarCheck, DollarSign, Clock, TrendingUp, Users } from 'lucide-react';
import db from '@/lib/db';
import { rooms, bookings, payments, staff } from '@/db/migrations/schema';
import { eq, and, sql, ne, count } from 'drizzle-orm';
import Link from 'next/link';

async function getDashboardStats() {
  try {
    const [
      totalRoomsRes,
      occupiedRoomsRes,
      maintenanceRoomsRes,
      activeBookingsRes,
      revenueRes,
      pendingPaymentsRes,
      totalStaffRes,
    ] = await Promise.all([
      db.select({ count: count() }).from(rooms),
      db.select({ count: count() }).from(rooms).where(eq(rooms.status, 'occupied')),
      db.select({ count: count() }).from(rooms).where(eq(rooms.status, 'maintenance')),
      db.select({ count: count() }).from(bookings).where(
        and(ne(bookings.status, 'checked_out'), ne(bookings.status, 'cancelled'))
      ),
      db.select({ total: sql<number>`COALESCE(SUM(amount),0)` }).from(payments).where(eq(payments.status, 'success')),
      db.select({ count: count() }).from(bookings).where(eq(bookings.paymentStatus, 'pending')),
      db.select({ count: count() }).from(staff),
    ]);

    const [totalRooms] = totalRoomsRes;
    const [occupiedRooms] = occupiedRoomsRes;
    const [maintenanceRooms] = maintenanceRoomsRes;
    const [activeBookings] = activeBookingsRes;
    const [revenue] = revenueRes;
    const [pendingPayments] = pendingPaymentsRes;
    const [totalStaff] = totalStaffRes;

    return {
      totalRooms: totalRooms?.count ?? 13,
      occupiedRooms: occupiedRooms?.count ?? 0,
      maintenanceRooms: maintenanceRooms?.count ?? 0,
      availableRooms: (totalRooms?.count ?? 13) - (occupiedRooms?.count ?? 0) - (maintenanceRooms?.count ?? 0),
      activeBookings: activeBookings?.count ?? 0,
      revenue: Number(revenue?.total ?? 0),
      pendingPayments: pendingPayments?.count ?? 0,
      totalStaff: totalStaff?.count ?? 0,
    };
  } catch {
    return {
      totalRooms: 13, occupiedRooms: 0, availableRooms: 13,
      maintenanceRooms: 0, activeBookings: 0, revenue: 0, pendingPayments: 0, totalStaff: 0,
    };
  }
}

async function getRecentBookings() {
  try {
    return await db.select().from(bookings).orderBy(sql`created_at DESC`).limit(5);
  } catch { return []; }
}

export default async function DashboardPage() {
  const stats = await getDashboardStats();
  const recentBookings = await getRecentBookings();

  const statCards = [
    {
      label: 'Total Rooms', value: stats.totalRooms, icon: BedDouble,
      color: 'var(--accent)', bg: 'var(--accent-light)', suffix: '',
    },
    {
      label: 'Occupied Rooms', value: stats.occupiedRooms, icon: CalendarCheck,
      color: '#ef4444', bg: '#fee2e2', suffix: '',
    },
    {
      label: 'Available Rooms', value: stats.availableRooms, icon: TrendingUp,
      color: '#10b981', bg: '#d1fae5', suffix: '',
    },
    {
      label: 'Total Revenue', value: `₹${stats.revenue.toLocaleString('en-IN')}`, icon: DollarSign,
      color: '#8b5cf6', bg: '#ede9fe', suffix: '',
    },
    {
      label: 'Pending Payments', value: stats.pendingPayments, icon: Clock,
      color: '#f59e0b', bg: '#fef3c7', suffix: '',
    },
    {
      label: 'Staff Members', value: stats.totalStaff, icon: Users,
      color: '#06b6d4', bg: '#cffafe', suffix: '',
    },
  ];

  const occupancyPct = stats.totalRooms > 0 ? Math.round((stats.occupiedRooms / stats.totalRooms) * 100) : 0;

  const statusColor = (s: string) => {
    switch (s) {
      case 'booked': return 'badge-info';
      case 'checked_in': return 'badge-success';
      case 'checked_out': return 'badge-gray';
      case 'cancelled': return 'badge-danger';
      default: return 'badge-gray';
    }
  };

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)' }}>Dashboard Overview</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 4 }}>
          Welcome back! Here is what's happening at Cola Goa Resort.
        </p>
      </div>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 16, marginBottom: 28 }}>
        {statCards.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500, marginBottom: 8 }}>{label}</div>
                <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-primary)' }}>{value}</div>
              </div>
              <div style={{
                width: 44, height: 44, borderRadius: 12, background: bg,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Icon size={20} color={color} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20 }}>
        {/* Recent Bookings */}
        <div className="card" style={{ overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: 16, fontWeight: 700 }}>Recent Bookings</h2>
            <Link href="/admin/bookings" style={{ fontSize: 13, color: 'var(--accent)', textDecoration: 'none', fontWeight: 600 }}>
              View all →
            </Link>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Guest</th>
                <th>Room</th>
                <th>Check-In</th>
                <th>Check-Out</th>
                <th>Status</th>
                <th>Payment</th>
              </tr>
            </thead>
            <tbody>
              {recentBookings.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 32 }}>No bookings yet</td></tr>
              ) : recentBookings.map((b) => (
                <tr key={b.id}>
                  <td style={{ fontWeight: 500 }}>{b.name || '—'}</td>
                  <td>Room {b.roomId}</td>
                  <td>{b.checkInDate}</td>
                  <td>{b.checkOutDate}</td>
                  <td><span className={`badge ${statusColor(b.status ?? '')}`}>{b.status}</span></td>
                  <td><span className={`badge ${b.paymentStatus === 'paid' ? 'badge-success' : b.paymentStatus === 'partial' ? 'badge-warning' : 'badge-danger'}`}>{b.paymentStatus}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Occupancy Card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card" style={{ padding: 24 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>Occupancy Rate</h2>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 52, fontWeight: 900, color: 'var(--accent)' }}>{occupancyPct}%</div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
                {stats.occupiedRooms} of {stats.totalRooms} rooms
              </div>
            </div>
            <div style={{ marginTop: 20, background: 'var(--bg-base)', borderRadius: 99, height: 8, overflow: 'hidden' }}>
              <div style={{
                height: '100%', borderRadius: 99, width: `${occupancyPct}%`,
                background: 'linear-gradient(90deg, var(--accent), #38bdf8)',
                transition: 'width 0.6s ease',
              }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16, gap: 8 }}>
              {[
                { label: 'Occupied', value: stats.occupiedRooms, dot: '#ef4444' },
                { label: 'Available', value: stats.availableRooms, dot: '#10b981' },
                { label: 'Maintenance', value: stats.maintenanceRooms, dot: '#f59e0b' },
              ].map(({ label, value, dot }) => (
                <div key={label} style={{ flex: 1, textAlign: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'center', marginBottom: 3 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: dot }} />
                    <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{label}</span>
                  </div>
                  <div style={{ fontSize: 18, fontWeight: 700 }}>{value}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="card" style={{ padding: 24 }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>Quick Actions</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <Link href="/admin/rooms" style={{ textDecoration: 'none' }}>
                <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>+ New Booking</button>
              </Link>
              <Link href="/admin/orders" style={{ textDecoration: 'none' }}>
                <button className="btn btn-outline" style={{ width: '100%', justifyContent: 'center' }}>View Orders</button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
