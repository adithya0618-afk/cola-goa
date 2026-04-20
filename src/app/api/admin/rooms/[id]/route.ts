import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { rooms, bookings, users, orders, orderItems, items } from '@/db/migrations/schema';
import { eq, desc, inArray } from 'drizzle-orm';

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
    let roomOrders: any[] = [];
    if (room.status === 'occupied') {
      const activeBookings = await db
        .select()
        .from(bookings)
        .where(inArray(bookings.status, ['booked', 'checked_in']))
        .orderBy(desc(bookings.createdAt));

      // Filter local till drizzle handles multi-wheres easily in this version
      const b2 = activeBookings.find(b => b.roomId === roomId);

      if (b2) {
        activeBooking = b2;
        if (b2.userId) {
          const userArr = await db.select().from(users).where(eq(users.id, b2.userId));
          guestUser = userArr[0] || null;
        }

        // Fetch orders and items for the invoice
        const activeOrders = await db.select().from(orders).where(eq(orders.bookingId, b2.id));
        for (const order of activeOrders) {
          const oItems = await db.select().from(orderItems).where(eq(orderItems.orderId, order.id));
          
          for (const oItem of oItems) {
            const itemDef = await db.select().from(items).where(eq(items.id, oItem.itemId!));
            roomOrders.push({
              ...oItem,
              itemData: itemDef[0]
            });
          }
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
      const { bookingId, userId, name, phone, email, checkInDate, checkOutDate } = payload;
      
      if (userId) {
        // Run update query on users table
        await db.update(users)
          .set({ name, phone, email })
          .where(eq(users.id, userId));
          
        await db.update(bookings)
          .set({ name, checkInDate, checkOutDate }) // sync name cache
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
