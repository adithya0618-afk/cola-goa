import db from '@/lib/db';
import { bookings, rooms, users, payments } from '@/db/schema';
import { sql, eq } from 'drizzle-orm';
import BookingsClient from './BookingsClient';

export const dynamic = 'force-dynamic';

async function getBookings() {
  try {
    return await db.select({
      id: bookings.id,
      name: bookings.name,
      phone: sql<string>`COALESCE(${bookings.phone}, ${users.phone})`,
      roomId: bookings.roomId,
      checkInDate: bookings.checkInDate,
      checkOutDate: bookings.checkOutDate,
      status: bookings.status,
      paymentStatus: bookings.paymentStatus,
      totalAmount: bookings.totalAmount,
      roomAmount: bookings.roomAmount,
      serviceAmount: bookings.serviceAmount,
      guestToken: bookings.guestToken,
      createdAt: bookings.createdAt,
      paidAmount: sql<string>`COALESCE((
        SELECT SUM(amount)::text
        FROM payments
        WHERE payments.booking_id = bookings.id
          AND payments.status = 'success'
      ), '0')`,
    })
    .from(bookings)
    .leftJoin(users, eq(bookings.userId, users.id))
    .orderBy(sql`${bookings.createdAt} DESC`)
    .limit(300);
  } catch (e) {
    console.error("Failed to fetch bookings:", e);
    return [];
  }
}

async function getRooms() {
  try { return await db.select().from(rooms).orderBy(rooms.roomNumber); }
  catch { return []; }
}

export default async function BookingsPage() {
  const [allBookings, allRooms] = await Promise.all([getBookings(), getRooms()]);
  return <BookingsClient bookings={allBookings as any[]} rooms={allRooms as any[]} />;
}
