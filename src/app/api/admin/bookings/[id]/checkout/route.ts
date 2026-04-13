import { NextRequest } from 'next/server';
import db from '@/lib/db';
import { bookings, rooms, orders } from '@/db/migrations/schema';
import { eq } from 'drizzle-orm';
import { sql } from 'drizzle-orm';

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Get booking
    const [booking] = await db.select().from(bookings).where(eq(bookings.id, id)).limit(1);
    if (!booking) return Response.json({ error: 'Booking not found' }, { status: 404 });

    // Get all orders for this booking
    const bookingOrders = await db.select().from(orders).where(eq(orders.bookingId, id));

    const serviceAmount = bookingOrders.reduce((sum, o) => sum + Number(o.totalAmount ?? 0), 0);
    const roomAmount = Number(booking.roomAmount ?? 0);
    const totalAmount = roomAmount + serviceAmount;

    // Update booking amounts, status → checked_out
    await db.update(bookings).set({
      status: 'checked_out',
      serviceAmount: serviceAmount.toString(),
      totalAmount: totalAmount.toString(),
    }).where(eq(bookings.id, id));

    // Free the room
    if (booking.roomId) {
      await db.update(rooms).set({ status: 'available' }).where(eq(rooms.id, booking.roomId));
    }

    return Response.json({
      success: true,
      roomAmount,
      serviceAmount,
      totalAmount,
      orders: bookingOrders,
    });
  } catch (e) {
    console.error(e);
    return Response.json({ error: 'Checkout failed' }, { status: 500 });
  }
}
