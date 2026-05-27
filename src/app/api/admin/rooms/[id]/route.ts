import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { rooms, bookings, users, orders, orderItems, items } from '@/db/schema';
import { eq, desc, inArray, and, sql } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const roomId = parseInt(id);
    const roomArr = await db.select().from(rooms).where(eq(rooms.id, roomId));
    
    if (roomArr.length === 0) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }
    const room = roomArr[0];

    // If occupied, fetch its active booking & user details
    let activeBooking = null;
    let guestUser = null;
    const roomOrders: any[] = [];
    if (room.status === 'occupied') {
      const activeBookings = await db
        .select()
        .from(bookings)
        .where(
          and(
            eq(bookings.roomId, roomId),
            inArray(bookings.status, ['booked', 'checked_in'])
          )
        )
        .orderBy(desc(bookings.createdAt))
        .limit(1);

      const b2 = activeBookings[0] || null;

      if (b2) {
        activeBooking = b2;
        
        // Fetch guest details and all order items in parallel
        const [userRes, details] = await Promise.all([
          b2.userId ? db.select().from(users).where(eq(users.id, b2.userId)).limit(1) : Promise.resolve([]),
          db.execute(sql`
            SELECT 
              oi.id as "oi_id",
              oi.order_id as "oi_orderId",
              oi.item_id as "oi_itemId",
              oi.quantity as "oi_quantity",
              oi.price as "oi_price",
              oi.created_at as "oi_createdAt",
              i.id as "i_id",
              i.name as "i_name",
              i.type as "i_type",
              i.category as "i_category",
              i.description as "i_description",
              i.image as "i_image",
              i.price as "i_price",
              i.is_available as "i_isAvailable",
              i.created_at as "i_createdAt"
            FROM order_items oi
            INNER JOIN orders o ON oi.order_id = o.id
            LEFT JOIN items i ON oi.item_id = i.id
            WHERE o.booking_id = ${b2.id}::uuid
          `)
        ]);

        if (userRes && userRes.length > 0) {
          guestUser = userRes[0];
        }

        for (const row of details.rows as any[]) {
          roomOrders.push({
            id: row.oi_id,
            orderId: row.oi_orderId,
            itemId: row.oi_itemId,
            quantity: row.oi_quantity,
            price: row.oi_price,
            createdAt: row.oi_createdAt,
            itemData: row.i_id ? {
              id: row.i_id,
              name: row.i_name,
              type: row.i_type,
              category: row.i_category,
              description: row.i_description,
              image: row.i_image,
              price: row.i_price,
              isAvailable: row.i_isAvailable,
              createdAt: row.i_createdAt
            } : null
          });
        }
      }
    }

    return NextResponse.json({
      room,
      activeBooking,
      guestUser,
      roomOrders,
      success: true
    });
  } catch (error: any) {
    console.error('Error fetching room details:', error);
    return NextResponse.json({ error: 'Failed to fetch details' }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const roomId = parseInt(id);
    const body = await request.json();
    const { action, payload } = body;

    // 1. Update basic room configs
    if (action === 'update_room') {
      const { pricePerNight, capacity, status } = payload;
      
      const currentRoomArr = await db.select().from(rooms).where(eq(rooms.id, roomId));
      if (!currentRoomArr.length) throw new Error('Not found');

      // Maintenance Validation
      if (status === 'maintenance' && currentRoomArr[0].status === 'occupied') {
         return NextResponse.json({ error: 'Cannot put occupied room under maintenance.' }, { status: 400 });
      }

      await db.update(rooms)
        .set({ pricePerNight, capacity, status })
        .where(eq(rooms.id, roomId));
        
      return NextResponse.json({ success: true });
    }

    // 2. Update guest details directly in active booking
    if (action === 'update_guest') {
      const { bookingId, userId, name, phone, email, checkInDate, checkOutDate, paymentStatus } = payload;
      
      if (userId) {
        // Run update query on users table
        await db.update(users)
          .set({ name, phone, email })
          .where(eq(users.id, userId));
          
        await db.update(bookings)
          .set({ name, checkInDate, checkOutDate, paymentStatus }) // sync name cache
          .where(eq(bookings.id, bookingId));
      }

      return NextResponse.json({ success: true });
    }

    // 3. Process Checkout
    if (action === 'checkout') {
      const { bookingId } = payload;

      await db.update(bookings)
        .set({ status: 'checked_out' })
        .where(eq(bookings.id, bookingId));

      await db.update(rooms)
        .set({ status: 'available' })
        .where(eq(rooms.id, roomId));

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error: any) {
    console.error('Error in room patch route:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
