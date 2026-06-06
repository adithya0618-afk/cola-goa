import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { bookings, payments } from '../src/db/schema';
import { eq, sql } from 'drizzle-orm';

async function inspect() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool);

  try {
    const results = await db.select({
      id: bookings.id,
      name: bookings.name,
      totalAmount: bookings.totalAmount,
      paymentStatus: bookings.paymentStatus,
      paidAmount: sql<string>`COALESCE((
        SELECT SUM(amount)::text
        FROM payments
        WHERE payments.booking_id = bookings.id
          AND payments.status = 'success'
      ), '0')`,
    }).from(bookings);

    console.log("=== BOOKINGS WITH PAID AMOUNTS ===");
    console.dir(results, { depth: null });
  } catch (e) {
    console.error("Error inspecting:", e);
  } finally {
    await pool.end();
  }
}

inspect();
