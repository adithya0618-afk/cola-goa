import db from '@/lib/db';
import { orders, bookings, rooms, orderItems, items } from '@/db/migrations/schema';
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
        guestName: bookings.name,
        roomNumber: rooms.roomNumber,
      })
      .from(orders)
      .leftJoin(bookings, eq(orders.bookingId, bookings.id))
      .leftJoin(rooms, eq(orders.roomId, rooms.id))
      .orderBy(sql`${orders.createdAt} DESC`);
    return result;
  } catch { return []; }
}

export default async function OrdersPage() {
  const allOrders = await getOrders();
  return <OrdersClient orders={allOrders as any[]} />;
}
