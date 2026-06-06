import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { bookings, orders, orderItems, payments, rooms } from '../src/db/schema';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});
const db = drizzle(pool);

async function clearData() {
  console.log('🧹 Clearing Bookings, Orders, and Payments data...');

  try {
    // 1. Delete order items
    console.log('Deleting order items...');
    const deletedOrderItems = await db.delete(orderItems).returning();
    console.log(`  ... Deleted ${deletedOrderItems.length} order items`);

    // 2. Delete orders
    console.log('Deleting orders...');
    const deletedOrders = await db.delete(orders).returning();
    console.log(`  ... Deleted ${deletedOrders.length} orders`);

    // 3. Delete payments
    console.log('Deleting payments...');
    const deletedPayments = await db.delete(payments).returning();
    console.log(`  ... Deleted ${deletedPayments.length} payments`);

    // 4. Delete bookings
    console.log('Deleting bookings...');
    const deletedBookings = await db.delete(bookings).returning();
    console.log(`  ... Deleted ${deletedBookings.length} bookings`);

    // 5. Reset all rooms to 'available'
    console.log('Resetting all rooms to available status...');
    const updatedRooms = await db.update(rooms).set({ status: 'available' }).returning();
    console.log(`  ... Reset status for ${updatedRooms.length} rooms`);

    console.log('\n✨ Database bookings and orders data successfully cleared!');
  } catch (error) {
    console.error('❌ Error clearing database:', error);
  } finally {
    await pool.end();
  }
}

clearData();
