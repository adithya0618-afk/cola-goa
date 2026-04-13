import db from '@/lib/db';
import { staff } from '@/db/migrations/schema';
import { sql } from 'drizzle-orm';
import StaffClient from './StaffClient';

async function getStaff() {
  try { return await db.select({ id: staff.id, name: staff.name, role: staff.role, shift: staff.shift, email: staff.email, phone: staff.phone }).from(staff).orderBy(sql`created_at DESC`); }
  catch { return []; }
}

export default async function StaffPage() {
  const allStaff = await getStaff();
  return <StaffClient staff={allStaff as any[]} />;
}
