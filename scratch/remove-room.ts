import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { rooms } from '../src/db/schema';
import { eq } from 'drizzle-orm';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});
const db = drizzle(pool);

async function removeRoom() {
  console.log('🧹 Removing room 98934567...');
  try {
    const deleted = await db.delete(rooms).where(eq(rooms.roomNumber, '98934567')).returning();
    console.log(`Successfully deleted ${deleted.length} room(s):`, deleted);
  } catch (error) {
    console.error('Error deleting room:', error);
  } finally {
    await pool.end();
  }
}

removeRoom();
