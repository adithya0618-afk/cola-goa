import { NextRequest } from 'next/server';
import db from '@/lib/db';
import { bookings, rooms, users } from '@/db/migrations/schema';
import { eq, and, or, gte, lte } from 'drizzle-orm';
import { randomUUID } from 'crypto';
import { sql } from 'drizzle-orm';

export async function GET() {
  try {
    const result = await db.select().from(bookings).orderBy(sql`created_at DESC`);
    return Response.json(result);
  } catch (e) {
    return Response.json({ error: 'DB error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, phone, email, roomId, checkInDate, checkOutDate, paymentStatus, roomAmount, totalAmount } = body;

    if (!name || !roomId || !checkInDate || !checkOutDate) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check for double booking
    const conflict = await db.select().from(bookings).where(
      and(
        eq(bookings.roomId, Number(roomId)),
        or(
          and(gte(bookings.checkInDate, checkInDate), lte(bookings.checkInDate, checkOutDate)),
          and(gte(bookings.checkOutDate, checkInDate), lte(bookings.checkOutDate, checkOutDate)),
          and(lte(bookings.checkInDate, checkInDate), gte(bookings.checkOutDate, checkOutDate))
        )
      )
    ).limit(1);

    const activeConflict = conflict.filter(b => b.status !== 'cancelled' && b.status !== 'checked_out');
    if (activeConflict.length > 0) {
      return Response.json({ error: 'Room is already booked for selected dates' }, { status: 409 });
    }

    // Upsert user
    let userId: string | null = null;
    if (email || phone) {
      const existingUser = email
        ? await db.select().from(users).where(eq(users.email, email)).limit(1)
        : await db.select().from(users).where(eq(users.phone, phone)).limit(1);

      if (existingUser.length > 0) {
        userId = existingUser[0].id;
      } else {
        const [newUser] = await db.insert(users).values({ name, phone: phone || null, email: email || null }).returning();
        userId = newUser.id;
      }
    }

    // Generate unique guest token
    const guestToken = randomUUID();

    const [booking] = await db.insert(bookings).values({
      userId,
      name,
      roomId: Number(roomId),
      checkInDate,
      checkOutDate,
      status: 'booked',
      paymentStatus: paymentStatus || 'pending',
      guestToken,
      roomAmount: roomAmount?.toString() || '0',
      serviceAmount: '0',
      totalAmount: totalAmount?.toString() || roomAmount?.toString() || '0',
    }).returning();

    // Mark room as occupied
    await db.update(rooms).set({ status: 'occupied' }).where(eq(rooms.id, Number(roomId)));

    return Response.json({ booking }, { status: 201 });
  } catch (e) {
    console.error(e);
    return Response.json({ error: 'Booking creation failed' }, { status: 500 });
  }
}
