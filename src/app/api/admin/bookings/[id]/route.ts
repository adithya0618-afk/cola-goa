import { NextRequest } from 'next/server';
import db from '@/lib/db';
import { bookings, rooms, orders, users } from '@/db/schema';
import { eq, sum } from 'drizzle-orm';
import { sendSMS } from '@/lib/sms';
import { RESORT_DETAILS } from '@/lib/invoiceUtils';

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

    // SMS Check-In automation
    if (status === 'checked_in' && updated) {
      try {
        let roomNumber = '—';
        if (updated.roomId) {
          const [room] = await db.select().from(rooms).where(eq(rooms.id, updated.roomId)).limit(1);
          if (room) roomNumber = room.roomNumber;
        }

        let guestPhone = updated.phone;
        if (!guestPhone && updated.userId) {
          const [user] = await db.select().from(users).where(eq(users.id, updated.userId)).limit(1);
          if (user) guestPhone = user.phone;
        }

        if (guestPhone) {
          const message = `[${RESORT_DETAILS.name}] Thank you for checking in. Your Room ${roomNumber} is ready. We wish you a pleasant stay. For any food orders or services, please use your guest link: https://cola-goa-git-main-adssymedias-projects.vercel.app/guest || ''}`;
          await sendSMS(guestPhone, message);
        } else {
          console.warn(`[SMS Check-In] No phone number found for booking ID: ${id}`);
        }
      } catch (err) {
        console.error('[SMS Check-In] Failed to send SMS:', err);
      }
    }

    return Response.json({ booking: updated });
  } catch (e) {
    return Response.json({ error: 'Update failed' }, { status: 500 });
  }
}
