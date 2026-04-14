import 'dotenv/config';
import pg from 'pg';
const { Client } = pg;
const client = new Client({ connectionString: process.env.DATABASE_URL });
async function main() {
  await client.connect();
  const res = await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema='public'");
  console.log(res.rows);
  
  const m = await client.query("SELECT * FROM __drizzle_migrations");
  console.log("Migrations:", m.rows);
  
  await client.end();
}
main().catch(console.error);
