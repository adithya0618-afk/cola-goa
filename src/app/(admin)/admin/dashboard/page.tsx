import { BedDouble, CalendarCheck, DollarSign, Clock, TrendingUp, Users, LogOut } from 'lucide-react';
import db from '@/lib/db';
import { rooms, bookings, payments, staff, orders } from '@/db/schema';
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
      pendingOrdersRes,
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
      db.select({ count: count() }).from(orders).where(eq(orders.status, 'pending')),
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
      pendingOrders: pendingOrdersRes[0]?.count ?? 0,
    };
  } catch {
    return {
      totalRooms: 13, occupiedRooms: 0, availableRooms: 13,
      maintenanceRooms: 0, activeBookings: 0, revenue: 0, pendingPayments: 0, totalStaff: 0,
      pendingOrders: 0,
    };
  }
}

async function getRecentBookings() {
  try {
    return await db.select({
      id: bookings.id,
      name: bookings.name,
      roomId: bookings.roomId,
      roomNumber: rooms.roomNumber,
      checkInDate: bookings.checkInDate,
      checkOutDate: bookings.checkOutDate,
      status: bookings.status,
      paymentStatus: bookings.paymentStatus,
    })
      .from(bookings)
      .innerJoin(rooms, eq(bookings.roomId, rooms.id))
      .orderBy(sql`bookings.created_at DESC`)
      .limit(5);
  } catch { return []; }
}

async function getTodaysCheckouts() {
  const today = new Date().toISOString().split('T')[0];
  try {
    return await db.select({
      id: bookings.id,
      name: bookings.name,
      roomNumber: rooms.roomNumber,
      status: bookings.status,
      checkOutDate: bookings.checkOutDate
    })
      .from(bookings)
      .innerJoin(rooms, eq(bookings.roomId, rooms.id))
      .where(
        and(
          eq(bookings.checkOutDate, today),
          ne(bookings.status, 'cancelled'),
          ne(bookings.status, 'checked_out')
        )
      );
  } catch {
    return [];
  }
}

export default async function DashboardPage() {
  const stats = await getDashboardStats();
  const recentBookings = await getRecentBookings();
  const todaysCheckouts = await getTodaysCheckouts();
  const todayDate = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

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
      <div className="page-header" style={{ marginBottom: 28, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)' }}>Dashboard Overview</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 4 }}>
            Welcome back! Here is what&#39;s happening at Cola Goa Resort.
          </p>
        </div>
        <Link href="/admin/rooms">
          <button className="btn btn-primary" suppressHydrationWarning>+ New Booking</button>
        </Link>
      </div>

      {/* Stat Cards */}
      <div className="stat-grid">
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

      <div className="dashboard-bottom" style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20 }}>
        {/* Recent Bookings */}
        <div className="card" style={{ overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: 16, fontWeight: 700 }}>Recent Bookings</h2>
            <Link href="/admin/bookings" style={{ fontSize: 13, color: 'var(--accent)', textDecoration: 'none', fontWeight: 600 }}>
              View all →
            </Link>
          </div>
          <div className="table-wrapper">
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
                    <td>{b.roomNumber}</td>
                    <td>{b.checkInDate}</td>
                    <td>{b.checkOutDate}</td>
                    <td><span className={`badge ${statusColor(b.status ?? '')}`}>{b.status}</span></td>
                    <td><span className={`badge ${b.paymentStatus === 'paid' ? 'badge-success' : b.paymentStatus === 'partial' ? 'badge-warning' : 'badge-danger'}`}>{b.paymentStatus}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Occupancy Card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Today's Checkouts first as requested */}
          <div className="card" style={{ padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 style={{ fontSize: 16, fontWeight: 700 }}>Today&#39;s Checkouts</h2>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' }}>{todayDate}</div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {todaysCheckouts.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '16px 0', color: 'var(--text-muted)', fontSize: 13 }}>
                  No checkouts scheduled for today.
                </div>
              ) : todaysCheckouts.map((c) => (
                <div key={c.id} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '10px 14px', background: 'var(--bg-base)', borderRadius: 10,
                  border: '1.5px solid var(--border)'
                }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 8, background: 'var(--danger-light)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                  }}>
                    <LogOut size={16} color="var(--danger)" />
                  </div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {c.name}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 1 }}>
                      Room {c.roomNumber}
                    </div>
                  </div>
                  <div className="badge badge-warning" style={{ fontSize: 10, padding: '2px 8px' }}>
                    Scheduled
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Occupancy Rate second */}
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
              <Link href="/admin/orders" style={{ textDecoration: 'none' }}>
                <button className="btn btn-primary" suppressHydrationWarning style={{ width: '100%', justifyContent: 'center', position: 'relative' }}>
                  View Orders
                  {stats.pendingOrders > 0 && (
                    <span style={{
                      position: 'absolute', top: -8, right: -8,
                      background: '#ef4444', color: 'white',
                      fontSize: 10, fontWeight: 800,
                      minWidth: 18, height: 18, borderRadius: 9,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      padding: '0 4px', border: '2px solid white',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                    }}>
                      {stats.pendingOrders}
                    </span>
                  )}
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
