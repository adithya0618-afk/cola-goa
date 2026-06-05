// ── ADD THIS to src/app/api/admin/orders/[id]/route.ts ───────────────────────
// alongside your existing PATCH handler

import { NextRequest } from 'next/server';
import db from '@/lib/db';
import { orders, rooms } from '@/db/schema';
import { eq, sql } from 'drizzle-orm';

/**
 * GET /api/admin/orders/:id
 * Used by the guest tracker to poll order status in real-time.
 * Returns only the fields the guest needs (no sensitive staff data).
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const [order] = await db
      .select({
        id:          orders.id,
        status:      orders.status,
        totalAmount: orders.totalAmount,
        createdAt:   orders.createdAt,
        roomNumber:  rooms.roomNumber,
      })
      .from(orders)
      .leftJoin(rooms, eq(orders.roomId, rooms.id))
      .where(eq(orders.id, id))
      .limit(1);

    if (!order) {
      return Response.json({ error: 'Order not found' }, { status: 404 });
    }

    return Response.json({ order });
  } catch (e) {
    console.error('GET ORDER ERROR:', e);
    return Response.json({ error: 'Failed to fetch order' }, { status: 500 });
  }
}

// Keep your existing PATCH below this ↓
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    console.log('Updating order:', id, status);

    const [updated] = await db
      .update(orders)
      .set({ status: status as any })
      .where(eq(orders.id, id))
      .returning();

    if (!updated) {
      return Response.json({ error: 'Order not found' }, { status: 404 });
    }

    return Response.json({ order: updated });
  } catch (e) {
    console.error('PATCH ERROR:', e);
    return Response.json({ error: 'Update failed' }, { status: 500 });
  }
}