import 'dotenv/config';
import pg from 'pg';
import fs from 'fs';

const { Client } = pg;
const client = new Client({ connectionString: process.env.DATABASE_URL });

async function main() {
  await client.connect();
  const sql = fs.readFileSync('src/db/migrations/0000_good_warstar.sql', 'utf8');
  const sql2 = fs.readFileSync('src/db/migrations/0001_wet_madelyne_pryor.sql', 'utf8');
  try {
    await client.query("BEGIN;");
    await client.query(sql);
    console.log("Migration 0000 succeeded");
    await client.query(sql2);
    console.log("Migration 0001 succeeded");
    await client.query("COMMIT;");
  } catch(e) {
    console.error("Migration failed:", e);
    await client.query("ROLLBACK;");
  }
  
  await client.end();
}
main().catch(console.error);
