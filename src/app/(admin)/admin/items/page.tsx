import db from '@/lib/db';
import { items } from '@/db/migrations/schema';
import { sql } from 'drizzle-orm';
import ItemsClient from './ItemsClient';

async function getItems() {
  try { return await db.select().from(items).orderBy(sql`created_at DESC`); }
  catch { return []; }
}

export default async function ItemsPage() {
  const allItems = await getItems();
  return <ItemsClient items={allItems as any[]} />;
}
