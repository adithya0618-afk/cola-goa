import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import db from '@/lib/db';
import { staff } from '@/db/migrations/schema';
import { sql, eq } from 'drizzle-orm';

export async function GET() {
  try {
    const result = await db.select({
      id: staff.id, name: staff.name, role: staff.role,
      shift: staff.shift, email: staff.email, phone: staff.phone,
    }).from(staff).orderBy(sql`created_at DESC`);
    return Response.json(result);
  } catch {
    return Response.json({ error: 'DB error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, role, shift, email, phone, password } = body;

    if (!name || !email || !password) {
      return Response.json({ error: 'Name, email and password are required' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const [member] = await db.insert(staff).values({
      name, role, shift, email, phone, password: hashedPassword,
    }).returning();

    const { password: _, ...safe } = member as any;
    return Response.json({ staff: safe }, { status: 201 });
  } catch (e: any) {
    if (e?.code === '23505') return Response.json({ error: 'Email already exists' }, { status: 409 });
    return Response.json({ error: 'Creation failed' }, { status: 500 });
  }
}
