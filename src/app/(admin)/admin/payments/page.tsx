import db from '@/lib/db';
import { payments, bookings } from '@/db/migrations/schema';
import { sql, eq } from 'drizzle-orm';
import PaymentsClient from './PaymentsClient';

async function getPayments() {
  try {
    return await db.select({
      id: payments.id,
      bookingId: payments.bookingId,
      amount: payments.amount,
      paymentMethod: payments.paymentMethod,
      status: payments.status,
      transactionRef: payments.transactionRef,
      createdAt: payments.createdAt,
      guestName: bookings.name,
    })
      .from(payments)
      .leftJoin(bookings, eq(payments.bookingId, bookings.id))
      .orderBy(sql`${payments.createdAt} DESC`);
  } catch { return []; }
}

export default async function PaymentsPage() {
  const allPayments = await getPayments();
  return <PaymentsClient payments={allPayments as any[]} />;
}
