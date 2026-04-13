import { NextRequest } from 'next/server';
import db from '@/lib/db';
import { orders, bookings } from '@/db/migrations/schema';
import { eq } from 'drizzle-orm';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { status } = await request.json();

    const [updated] = await db.update(orders).set({ status }).where(eq(orders.id, id)).returning();

    // When accepted/completed, update the booking's serviceAmount
    if ((status === 'completed' || status === 'accepted') && updated?.bookingId) {
      const allOrders = await db.select().from(orders).where(eq(orders.bookingId, updated.bookingId));
      const completedOrders = allOrders.filter(o => o.status === 'completed' || o.status === 'accepted');
      const serviceTotal = completedOrders.reduce((s, o) => s + Number(o.totalAmount ?? 0), 0);

      const [booking] = await db.select().from(bookings).where(eq(bookings.id, updated.bookingId)).limit(1);
      if (booking) {
        const newTotal = Number(booking.roomAmount ?? 0) + serviceTotal;
        await db.update(bookings).set({
          serviceAmount: serviceTotal.toString(),
          totalAmount: newTotal.toString(),
        }).where(eq(bookings.id, updated.bookingId));
      }
    }

    return Response.json({ order: updated });
  } catch (e) {
    console.error(e);
    return Response.json({ error: 'Update failed' }, { status: 500 });
  }
}
