import { NextRequest } from 'next/server';
import db from '@/lib/db';
import { items } from '@/db/migrations/schema';
import { eq } from 'drizzle-orm';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, type, category, description, price, isAvailable } = body;

    const [item] = await db.update(items).set({
      name,
      type,
      category,
      description,
      price: price?.toString(),
      isAvailable,
    }).where(eq(items.id, Number(id))).returning();

    return Response.json({ item });
  } catch {
    return Response.json({ error: 'Update failed' }, { status: 500 });
  }
}

export async function DELETE(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await db.delete(items).where(eq(items.id, Number(id)));
    return Response.json({ success: true });
  } catch {
    return Response.json({ error: 'Delete failed' }, { status: 500 });
  }
}
