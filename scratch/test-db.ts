import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { Pool } from 'pg';

async function testConnection() {
  console.log('Testing connection to Supabase...');
  console.log('URL:', process.env.DATABASE_URL?.replace(/:[^:]*@/, ':****@')); // Hide password

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    const client = await pool.connect();
    console.log('✅ Successfully connected to the database.');
    
    const res = await client.query('SELECT current_database(), now();');
    console.log('Database Info:', res.rows[0]);
    
    const tables = await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';");
    console.log('Tables found:', tables.rows.map(r => r.table_name));
    
    client.release();
  } catch (err) {
    console.error('❌ Connection failed:', err);
  } finally {
    await pool.end();
  }
}

testConnection();
