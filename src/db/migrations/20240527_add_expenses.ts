import { drizzle } from 'drizzle-orm/postgres-js';
import { pgTable, serial, numeric, text, timestamp, date } from 'drizzle-orm/pg-core';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
// Removed PgDatabase import as it is not exported

export async function up(db: any) {
  await db.execute(`
    CREATE TABLE expenses (
      id SERIAL PRIMARY KEY,
      amount NUMERIC NOT NULL,
      description TEXT,
      date DATE NOT NULL,
      created_at TIMESTAMP DEFAULT now(),
      updated_at TIMESTAMP
    );
  `);
}

export async function down(db: any) {
  await db.execute('DROP TABLE IF EXISTS expenses;');
}
