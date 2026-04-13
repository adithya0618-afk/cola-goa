import { NextRequest } from 'next/server';
import db from '@/lib/db';
import { bookings, rooms, orders } from '@/db/migrations/schema';
import { eq, sum } from 'drizzle-orm';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, paymentStatus } = body;

    const updates: Record<string, unknown> = {};
    if (status) updates.status = status;
    if (paymentStatus) updates.paymentStatus = paymentStatus;

    const [updated] = await db.update(bookings).set(updates as any).where(eq(bookings.id, id)).returning();

    // If cancelled, free the room
    if (status === 'cancelled' && updated?.roomId) {
      await db.update(rooms).set({ status: 'available' }).where(eq(rooms.id, updated.roomId));
    }

    return Response.json({ booking: updated });
  } catch (e) {
    return Response.json({ error: 'Update failed' }, { status: 500 });
  }
}
