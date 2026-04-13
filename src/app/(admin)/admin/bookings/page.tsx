import db from '@/lib/db';
import { bookings, rooms } from '@/db/migrations/schema';
import { sql } from 'drizzle-orm';
import BookingsClient from './BookingsClient';

async function getBookings() {
  try {
    return await db.select({
      id: bookings.id,
      name: bookings.name,
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
    }).from(bookings).orderBy(sql`${bookings.createdAt} DESC`);
  } catch { return []; }
}

async function getRooms() {
  try { return await db.select().from(rooms).orderBy(rooms.roomNumber); }
  catch { return []; }
}

export default async function BookingsPage() {
  const [allBookings, allRooms] = await Promise.all([getBookings(), getRooms()]);
  return <BookingsClient bookings={allBookings as any[]} rooms={allRooms as any[]} />;
}
