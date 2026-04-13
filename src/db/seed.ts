// Run this script to seed the database with 13 rooms and a default admin user
// Usage: npx tsx src/db/seed.ts

import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';
import { rooms, staff } from './migrations/schema';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool);

const ROOMS = [
  { roomNumber: 101, pricePerNight: '3500', capacity: 2 },
  { roomNumber: 102, pricePerNight: '3500', capacity: 2 },
  { roomNumber: 103, pricePerNight: '4000', capacity: 3 },
  { roomNumber: 104, pricePerNight: '4000', capacity: 3 },
  { roomNumber: 105, pricePerNight: '4500', capacity: 2 },
  { roomNumber: 201, pricePerNight: '5000', capacity: 4 },
  { roomNumber: 202, pricePerNight: '5000', capacity: 4 },
  { roomNumber: 203, pricePerNight: '5500', capacity: 2 },
  { roomNumber: 204, pricePerNight: '5500', capacity: 2 },
  { roomNumber: 205, pricePerNight: '6000', capacity: 4 },
  { roomNumber: 301, pricePerNight: '8000', capacity: 2 },
  { roomNumber: 302, pricePerNight: '8000', capacity: 2 },
  { roomNumber: 303, pricePerNight: '12000', capacity: 4 },
];

async function seed() {
  console.log('🌱 Seeding database...\n');

  // Seed rooms
  console.log('Inserting 13 rooms...');
  for (const room of ROOMS) {
    try {
      await db.insert(rooms).values({ ...room, status: 'available' }).onConflictDoNothing();
      console.log(`  ✅ Room ${room.roomNumber} — ₹${room.pricePerNight}/night`);
    } catch (e) {
      console.log(`  ⚠️  Room ${room.roomNumber} already exists`);
    }
  }

  // Seed default admin
  console.log('\nCreating default admin user...');
  const hashedPassword = await bcrypt.hash('admin123', 12);
  try {
    await db.insert(staff).values({
      name: 'Admin User',
      email: 'admin@colagoa.com',
      password: hashedPassword,
      role: 'admin',
      shift: 'full_day',
    }).onConflictDoNothing();
    console.log('  ✅ Admin: admin@colagoa.com / admin123');
  } catch {
    console.log('  ⚠️  Admin user already exists');
  }

  console.log('\n✅ Seed complete!');
  await pool.end();
}

seed().catch(console.error);
