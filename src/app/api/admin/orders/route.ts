import { NextRequest } from 'next/server';
import db from '@/lib/db';
import { orders, bookings, rooms } from '@/db/migrations/schema';
import { eq } from 'drizzle-orm';
import { sql } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const result = await db.select().from(orders).orderBy(sql`created_at DESC`);
    return Response.json(result);
  } catch {
    return Response.json({ error: 'DB error' }, { status: 500 });
  }
}
