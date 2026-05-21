import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { rooms } from '@/db/schema';

export async function GET() {
  try {
    const list = await db.select().from(rooms).orderBy(rooms.roomNumber);
    return NextResponse.json(list);
  } catch (e) {
    return NextResponse.json({ error: "Failed to fetch rooms" }, { status: 500 });
  }
}
