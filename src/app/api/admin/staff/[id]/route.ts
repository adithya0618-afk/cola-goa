import { NextRequest } from 'next/server';
import db from '@/lib/db';
import { staff } from '@/db/migrations/schema';
import { eq } from 'drizzle-orm';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, role, shift, email, phone } = body;

    const [member] = await db.update(staff).set({ name, role, shift, email, phone }).where(eq(staff.id, id)).returning();
    const { password: _, ...safe } = member as any;
    return Response.json({ staff: safe });
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
    await db.delete(staff).where(eq(staff.id, id));
    return Response.json({ success: true });
  } catch {
    return Response.json({ error: 'Delete failed' }, { status: 500 });
  }
}
