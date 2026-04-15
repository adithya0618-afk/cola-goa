// Run this script to seed the database
// Usage: npx tsx src/db/seed.ts

import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';
import { rooms, staff, items, users } from './migrations/schema';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool);

const ROOMS = [
  { roomNumber: '111', pricePerNight: '3500', capacity: 2 },
  { roomNumber: '222', pricePerNight: '3500', capacity: 2 },
  { roomNumber: '333', pricePerNight: '4000', capacity: 3 },
  { roomNumber: '444', pricePerNight: '4000', capacity: 3 },
  { roomNumber: '555', pricePerNight: '4500', capacity: 2 },
  { roomNumber: '666', pricePerNight: '5000', capacity: 4 },
  { roomNumber: '777', pricePerNight: '5000', capacity: 4 },
  { roomNumber: '888', pricePerNight: '5500', capacity: 2 },
  { roomNumber: '999', pricePerNight: '5500', capacity: 2 },
  { roomNumber: 'A5', pricePerNight: '6000', capacity: 4 },
  { roomNumber: 'A6', pricePerNight: '8000', capacity: 2 },
  { roomNumber: 'A7', pricePerNight: '8000', capacity: 2 },
  { roomNumber: 'A8', pricePerNight: '12000', capacity: 4 },
];

const ITEMS = [
  { name: 'Goan Fish Curry', type: 'food' as const, category: 'Main Course', description: 'Authentic Goan style fish curry with coconut.', price: '450', isAvailable: true },
  { name: 'Prawn Balchao', type: 'food' as const, category: 'Main Course', description: 'Spicy and tangy prawn dish.', price: '550', isAvailable: true },
  { name: 'Veg Xacuti', type: 'food' as const, category: 'Main Course', description: 'Mixed vegetables in roasted coconut gravy.', price: '350', isAvailable: true },
  { name: 'Chicken Cafreal', type: 'food' as const, category: 'Main Course', description: 'Green spiced chicken shallow fried.', price: '400', isAvailable: true },
  { name: 'Kingfisher Premium', type: 'food' as const, category: 'Beverage', description: 'Chilled local beer.', price: '250', isAvailable: true },
  { name: 'Spa Massage', type: 'service' as const, category: 'Wellness', description: '60 minutes relaxing full body massage.', price: '3000', isAvailable: true },
  { name: 'Airport Pickup', type: 'service' as const, category: 'Transport', description: 'One-way transfer from Dabolim airport.', price: '1500', isAvailable: true },
  { name: 'Laundry', type: 'service' as const, category: 'Housekeeping', description: 'Per bag laundry service.', price: '200', isAvailable: true },
];

const DUMMY_USER = {
  name: 'John Doe',
  phone: '+919876543210',
  email: 'johndoe@example.com'
};

async function seed() {
  console.log('🌱 Seeding database...\n');

  // Seed rooms
  console.log('Inserting 13 rooms...');
  for (const room of ROOMS) {
    try {
      await db.insert(rooms).values({ ...room, status: 'available' }).onConflictDoNothing({ target: rooms.roomNumber });
      console.log(`  ✅ Room ${room.roomNumber} — ₹${room.pricePerNight}/night`);
    } catch (e) {
      console.error(`  ⚠️  Error inserting room ${room.roomNumber}:`, e);
    }
  }

  // Seed Items
  console.log('\nInserting food and service items...');
  for (const item of ITEMS) {
    try {
      // no unique constraint on name, so we just insert lightly or ignore if we want, but Drizzle pg doNothing needs target for PG
      // To avoid duplicates we could check first, but for simplicity we rely on seed being run once or just allow duplicates for now.
      await db.insert(items).values(item);
      console.log(`  ✅ Item ${item.name} — ₹${item.price}`);
    } catch (e) {
      console.error(`  ⚠️  Error inserting item ${item.name}:`, e);
    }
  }

  // Seed User
  console.log('\nInserting dummy user...');
  try {
    await db.insert(users).values(DUMMY_USER).onConflictDoNothing({ target: users.email });
    console.log(`  ✅ User ${DUMMY_USER.name} (${DUMMY_USER.email})`);
  } catch (e) {
    console.error(`  ⚠️  Error inserting user ${DUMMY_USER.name}:`, e);
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
    }).onConflictDoNothing({ target: staff.email });
    console.log('  ✅ Admin: admin@colagoa.com / admin123');
  } catch (e) {
    console.error('  ⚠️  Error creating admin user:', e);
  }

  console.log('\n✅ Seed complete!');
  await pool.end();
}

seed().catch(console.error);
