import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { orders } from '@/db/schema';
import { eq, count } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    // Basic admin token authentication check
    const token = req.cookies.get('admin_token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Count pending (non-accepted) orders
    const [pendingRes] = await db
      .select({ val: count() })
      .from(orders)
      .where(eq(orders.status, 'pending'));

    // Count unseen (non-seen) orders
    const [unseenRes] = await db
      .select({ val: count() })
      .from(orders)
      .where(eq(orders.isSeen, false));

    return NextResponse.json({
      pendingCount: pendingRes?.val || 0,
      unseenCount: unseenRes?.val || 0,
    });
  } catch (err) {
    console.error('COUNT ORDERS ERROR:', err);
    return NextResponse.json({ error: 'Failed to fetch counts' }, { status: 500 });
  }
}
