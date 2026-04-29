import { NextRequest } from 'next/server';
import db from '@/lib/db';
import { orders, orderItems } from '@/db/schema';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("ORDER BODY:", body); // 👈 DEBUG

    const { items, totalAmount, roomId, bookingId } = body;

    if (!items || items.length === 0) {
      return Response.json({ error: 'No items' }, { status: 400 });
    }
    
    const [order] = await db.insert(orders).values({
      roomId,
      bookingId,
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