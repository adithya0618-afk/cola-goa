import { Client } from 'pg';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function run() {
  const connectionString = process.env.DATABASE_URL;
  console.log("Connecting to:", connectionString?.replace(/:([^:@]+)@/, ':****@'));

  // Test 1: Connect with ssl: { rejectUnauthorized: false }
  console.log("\n--- Test 1: ssl rejectUnauthorized: false ---");
  const client1 = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });
  try {
    await client1.connect();
    console.log("Test 1 success!");
    const res = await client1.query("SELECT id, name, phone, status FROM bookings LIMIT 5");
    console.log("Bookings:", res.rows);
    await client1.end();
    return;
  } catch (err: any) {
    console.error("Test 1 failed:", err.message);
  }

  // Test 2: Connect with raw connection string only (using sslmode from URL)
  console.log("\n--- Test 2: connectionString only ---");
  const client2 = new Client({ connectionString });
  try {
    await client2.connect();
    console.log("Test 2 success!");
    const res = await client2.query("SELECT id, name, phone, status FROM bookings LIMIT 5");
    console.log("Bookings:", res.rows);
    await client2.end();
    return;
  } catch (err: any) {
    console.error("Test 2 failed:", err.message);
  }

  // Test 3: Connect with ssl: false
  console.log("\n--- Test 3: ssl: false ---");
  const client3 = new Client({
    connectionString: connectionString?.replace("sslmode=require", "sslmode=disable"),
    ssl: false
  });
  try {
    await client3.connect();
    console.log("Test 3 success!");
    const res = await client3.query("SELECT id, name, phone, status FROM bookings LIMIT 5");
    console.log("Bookings:", res.rows);
    await client3.end();
    return;
  } catch (err: any) {
    console.error("Test 3 failed:", err.message);
  }
}

run();
