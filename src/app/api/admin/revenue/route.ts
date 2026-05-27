import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { bookings, orders, expenses } from '@/db/schema';
import { eq, sql, desc } from 'drizzle-orm';

export async function GET() {
  try {
    // Execute all queries in parallel to minimize network roundtrip overhead
    const [
      roomsRes,
      roomTransactions,
      foodRes,
      foodTransactions,
      expRes,
      expenseList
    ] = await Promise.all([
      db.execute(sql`SELECT COALESCE(SUM(room_amount),0) AS total FROM bookings WHERE payment_status IN ('paid','partial')`),
      db.execute(sql`
        SELECT
          id,
          booking_code,
          name AS guest_name,
          phone,
          room_amount,
          total_amount,
          payment_status,
          status AS booking_status,
          check_in_date,
          check_out_date,
          created_at
        FROM bookings
        WHERE payment_status IN ('paid','partial')
        ORDER BY created_at DESC
        LIMIT 50
      `),
      db.execute(sql`SELECT COALESCE(SUM(total_amount),0) AS total FROM orders WHERE status = 'completed'`),
      db.execute(sql`
        SELECT
          o.id,
          COALESCE(b.name, o.guest_name) AS guest_name,
          r.room_number,
          o.total_amount,
          o.created_at
        FROM orders o
        LEFT JOIN bookings b ON o.booking_id = b.id
        LEFT JOIN rooms r ON o.room_id = r.id
        WHERE o.status = 'completed'
        ORDER BY o.created_at DESC
        LIMIT 50
      `),
      db.execute(sql`SELECT COALESCE(SUM(amount),0) AS total FROM expenses`),
      db.select().from(expenses).orderBy(desc(expenses.date))
    ]);

    const roomsRevenue = Number(roomsRes.rows[0]?.total || 0);
    const foodRevenue = Number(foodRes.rows[0]?.total || 0);
    const expensesTotal = Number(expRes.rows[0]?.total || 0);
    const netProfit = roomsRevenue + foodRevenue - expensesTotal;

    return NextResponse.json({
      roomsRevenue,
      foodRevenue,
      expensesTotal,
      netProfit,
      expenses: expenseList,
      roomTransactions: roomTransactions.rows,
      foodTransactions: foodTransactions.rows,
    });
  } catch (err: any) {
    console.error('[Revenue GET]', err);
    return NextResponse.json({ error: err?.message || 'Failed to fetch revenue' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { amount, description, date } = await request.json();
    if (!amount || !date) {
      return NextResponse.json({ error: 'Amount and date required' }, { status: 400 });
    }
    const [newExpense] = await db
      .insert(expenses)
      .values({ amount: String(amount), description, date })
      .returning();
    return NextResponse.json({ success: true, expense: newExpense });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { id, amount, description, date } = await request.json();
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });
    await db
      .update(expenses)
      .set({ amount: String(amount), description, date, updatedAt: new Date() })
      .where(eq(expenses.id, id));
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });
    await db.delete(expenses).where(eq(expenses.id, id));
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message }, { status: 500 });
  }
}
