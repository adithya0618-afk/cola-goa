import { NextRequest } from 'next/server';
import db from '@/lib/db';
import { orders, orderItems, rooms } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("ORDER BODY:", body); // 👈 DEBUG

    const { items, totalAmount, roomId, roomNumber, guestName, guestPhone, bookingId } = body;

    if (!items || items.length === 0) {
      return Response.json({ error: 'No items' }, { status: 400 });
    }

    let resolvedRoomId = roomId;

    if (roomNumber && typeof roomNumber === "string" && roomNumber.trim() !== "") {
      const trimmedRoom = roomNumber.trim();
      const [existingRoom] = await db
        .select()
        .from(rooms)
        .where(eq(rooms.roomNumber, trimmedRoom))
        .limit(1);

      if (existingRoom) {
        resolvedRoomId = existingRoom.id;
      } else {
        // Create new room dynamically
        const [newRoom] = await db
          .insert(rooms)
          .values({
            roomNumber: trimmedRoom,
            pricePerNight: "100.00",
            status: "available",
          })
          .returning();
        resolvedRoomId = newRoom.id;
      }
    }
    
    const [order] = await db.insert(orders).values({
      roomId: resolvedRoomId ?? null,
      bookingId: bookingId ?? null,
      guestName: guestName ?? null,
      guestPhone: guestPhone ?? null,
      status: 'pending',
      totalAmount: totalAmount.toString(),
    }).returning();

    await db.insert(orderItems).values(
      items.map((i: any) => ({
        orderId: order.id,
        itemId: i.id,
        quantity: i.qty,
        price: i.price.toString(),
      }))
    );

    return Response.json({ order });

  } catch (e) {
    console.error("ORDER ERROR:", e); // 👈 VERY IMPORTANT
    return Response.json({ error: 'Order failed' }, { status: 500 });
  }
}