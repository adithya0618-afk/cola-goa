// ════════════════════════════════════════════════════════════════════════════
// MIGRATION GUIDE — Multi-Category Support
// ════════════════════════════════════════════════════════════════════════════
//
// STEP 1 — Add `categories` column to your DB schema (Drizzle example)
// ─────────────────────────────────────────────────────────────────────
// In your schema file (e.g. db/schema.ts), add alongside the existing `category`:
//
//   import { text, boolean, serial, pgTable } from 'drizzle-orm/pg-core';
//
//   export const items = pgTable('items', {
//     id:          serial('id').primaryKey(),
//     name:        text('name').notNull(),
//     type:        text('type'),
//     category:    text('category'),                        // keep for compat
//     categories:  text('categories').default('[]'),        // JSON array as text
//     description: text('description'),
//     price:       text('price').notNull(),
//     isAvailable: boolean('is_available').default(true),
//   });
//
// Then run:  npx drizzle-kit generate && npx drizzle-kit push
//
// STEP 2 — One-time data migration (run once in a script or migration file)
// ─────────────────────────────────────────────────────────────────────────
// import db from '@/lib/db';
// import { items } from '@/db/schema';
// import { isNull } from 'drizzle-orm';
//
// async function migrate() {
//   const rows = await db.select().from(items);
//   for (const row of rows) {
//     if (!row.categories || row.categories === '[]') {
//       await db.update(items)
//         .set({ categories: JSON.stringify(row.category ? [row.category] : []) })
//         .where(eq(items.id, row.id));
//     }
//   }
//   console.log('Migration done');
// }
// migrate();
//
// ════════════════════════════════════════════════════════════════════════════
// UPDATED API ROUTES
// ════════════════════════════════════════════════════════════════════════════

// ── GET /api/admin/items  (replace existing) ──────────────────────────────────
import { NextRequest } from 'next/server';
import db from '@/lib/db';
import { items } from '@/db/schema';
import { sql, eq } from 'drizzle-orm';

export async function GET() {
  try {
    const result = await db.select().from(items).orderBy(sql`created_at DESC`);
    // Normalise categories field for the client
    const normalised = result.map(item => ({
      ...item,
      categories: (() => {
        try { return JSON.parse((item as any).categories || '[]'); }
        catch { return (item as any).category ? [(item as any).category] : []; }
      })(),
    }));
    return Response.json(normalised);
  } catch {
    return Response.json({ error: 'DB error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, type, category, categories, description, price, isAvailable } = body;

    if (!name || !price) {
      return Response.json({ error: 'Name and price are required' }, { status: 400 });
    }

    // Resolve categories array
    const cats: string[] = Array.isArray(categories) && categories.length
      ? categories
      : category ? [category] : [];

    const [item] = await db.insert(items).values({
      name,
      type: type || 'food',
      category: cats[0] ?? null,                // backward-compat single value
      categories: JSON.stringify(cats),          // new multi-value field
      description,
      price: price.toString(),
      isAvailable: isAvailable !== false,
    } as any).returning();

    return Response.json({ item }, { status: 201 });
  } catch (e) {
    console.error(e);
    return Response.json({ error: 'Creation failed' }, { status: 500 });
  }
}


// ── PUT /api/admin/items/[id]  (replace existing PUT) ────────────────────────
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, type, category, categories, description, price, isAvailable } = body;

    const cats: string[] = Array.isArray(categories) && categories.length
      ? categories
      : category ? [category] : [];

    const [item] = await db.update(items).set({
      name,
      type,
      category: cats[0] ?? null,
      categories: JSON.stringify(cats),
      description,
      price: price?.toString(),
      isAvailable,
    } as any).where(eq(items.id, Number(id))).returning();

    return Response.json({ item });
  } catch {
    return Response.json({ error: 'Update failed' }, { status: 500 });
  }
}
export async function DELETE(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> } // ✅ FIX
) {
  try {
    const { id } = await params; // ✅ FIX

    await db.delete(items).where(eq(items.id, Number(id)));

    return Response.json({ success: true });
  } catch {
    return Response.json({ error: 'Delete failed' }, { status: 500 });
  }
}
