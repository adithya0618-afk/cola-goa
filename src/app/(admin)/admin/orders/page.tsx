import db from '@/lib/db';
import { orders, bookings, rooms, orderItems, items } from '@/db/schema';
import { sql, eq } from 'drizzle-orm';
import OrdersClient from './OrdersClient';

export const dynamic = 'force-dynamic';

async function getOrders() {
  try {
    const result = await db
      .select({
        id: orders.id,
        bookingId: orders.bookingId,
        roomId: orders.roomId,
        status: orders.status,
        totalAmount: orders.totalAmount,
        createdAt: orders.createdAt,
        guestName: sql<string>`COALESCE(${bookings.name}, ${orders.guestName})`,
        guestPhone: orders.guestPhone,
        roomNumber: rooms.roomNumber,
      })
      .from(orders)
      .leftJoin(bookings, eq(orders.bookingId, bookings.id))
      .leftJoin(rooms, eq(orders.roomId, rooms.id))
      .orderBy(sql`${orders.createdAt} DESC`);
    return result;
  } catch (err) {
    console.error("GET ORDERS ERROR:", err);
    return [];
  }
}

export default async function OrdersPage() {
  try {
    // Mark all unseen orders as seen when admin accesses this page
    await db.update(orders).set({ isSeen: true }).where(eq(orders.isSeen, false));
  } catch (err) {
    console.error("FAILED TO MARK ORDERS AS SEEN:", err);
  }

  const allOrders = await getOrders();
  return <OrdersClient orders={allOrders as any[]} />;
}
