import { NextRequest } from 'next/server';
import db from '@/lib/db';
import { items } from '@/db/schema';
import { sql } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const result = await db.select().from(items).orderBy(sql`created_at DESC`);
    return Response.json(result);
  } catch {
    return Response.json({ error: 'DB error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, type, category, description, price, isAvailable } = body;

    if (!name || !price) {
      return Response.json({ error: 'Name and price are required' }, { status: 400 });
    }

    const [item] = await db.insert(items).values({
      name,
      type: type || 'food',
      category,
      description,
      price: price.toString(),
      isAvailable: isAvailable !== false,
    }).returning();

    return Response.json({ item }, { status: 201 });
  } catch (e) {
    return Response.json({ error: 'Creation failed' }, { status: 500 });
  }
}
