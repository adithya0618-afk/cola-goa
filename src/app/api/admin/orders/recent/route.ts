import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { orders, rooms } from '@/db/schema';
import { eq, sql, desc } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('admin_token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const result = await db
      .select({
        id:          orders.id,
        status:      orders.status,
        totalAmount: orders.totalAmount,
        createdAt:   orders.createdAt,
        guestName:   orders.guestName,
        roomNumber:  rooms.roomNumber,
      })
      .from(orders)
      .leftJoin(rooms, eq(orders.roomId, rooms.id))
      .orderBy(desc(orders.createdAt))
      .limit(10);

    return NextResponse.json({ orders: result });
  } catch (err) {
    console.error('RECENT ORDERS ERROR:', err);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}