import { NextRequest } from "next/server";
import db from "@/lib/db";
import { orders } from "@/db/schema";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const { items, totalAmount, roomId, bookingId } = body;

    if (!items || items.length === 0) {
      return Response.json({ error: "No items selected" }, { status: 400 });
    }

    const [order] = await db
      .insert(orders)
      .values({
        items: JSON.stringify(items), // store cart
        totalAmount: totalAmount.toString(),
        roomId: roomId ?? null,
        bookingId: bookingId ?? null,
        status: "pending",
      })
      .returning();

    return Response.json({ success: true, order }, { status: 201 });

  } catch (e) {
    console.error(e);
    return Response.json({ error: "Order failed" }, { status: 500 });
  }
}