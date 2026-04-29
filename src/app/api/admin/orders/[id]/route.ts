import { NextRequest } from 'next/server';
import db from '@/lib/db';
import { orders } from '@/db/schema';
import { eq } from 'drizzle-orm';
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> } // ✅ FIX
) {
  try {
    const { id } = await params; // ✅ FIX

    const body = await request.json();
    const { status } = body;

    console.log("Updating order:", id, status);

    const [updated] = await db
      .update(orders)
      .set({ status: status as any })
      .where(eq(orders.id, id))
      .returning();

    if (!updated) {
      return Response.json({ error: "Order not found" }, { status: 404 });
    }

    return Response.json({ order: updated });

  } catch (e) {
    console.error("PATCH ERROR:", e);
    return Response.json({ error: 'Update failed' }, { status: 500 });
  }
}