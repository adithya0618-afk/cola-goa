import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import db from '../src/lib/db';
import { bookings, users } from '../src/db/schema';

async function inspect() {
  const rawUrl = process.env.DATABASE_URL || '';
  const maskedUrl = rawUrl.replace(/:([^:@]+)@/, ':****@');
  console.log("Using DATABASE_URL:", maskedUrl);

  try {
    const allBookings = await db.select().from(bookings);
    console.log("=== BOOKINGS ===");
    console.log(allBookings.map(b => ({ id: b.id, name: b.name, phone: b.phone, userId: b.userId, status: b.status })));
    
    const allUsers = await db.select().from(users);
    console.log("=== USERS ===");
    console.log(allUsers.map(u => ({ id: u.id, name: u.name, phone: u.phone })));
  } catch (e) {
    console.error("Error inspecting:", e);
  }
}

inspect();
