import { NextResponse } from 'next/server';
import { adminDb, paystack, markPaid, publicRow } from '../_lib';

export async function GET(req) {
  try {
    const reference = new URL(req.url).searchParams.get('reference') || '';
    if (!/^[A-Za-z0-9]{6,40}$/.test(reference)) return NextResponse.json({ error: 'Bad reference' }, { status: 400 });
    const db = adminDb();
    const v = await paystack('/transaction/verify/' + encodeURIComponent(reference));
    const row = await markPaid(db, reference, v && v.data);
    if (!row) return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    return NextResponse.json({ payment: publicRow(row) });
  } catch (e) {
    return NextResponse.json({ error: 'Could not check the payment.' }, { status: 500 });
  }
}
