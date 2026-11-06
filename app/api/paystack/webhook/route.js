import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { adminDb, markPaid } from '../_lib';

export async function POST(req) {
  const raw = await req.text();
  const sig = req.headers.get('x-paystack-signature') || '';
  const expected = crypto.createHmac('sha512', process.env.PAYSTACK_SECRET_KEY || '').update(raw).digest('hex');
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (!process.env.PAYSTACK_SECRET_KEY || a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    return new NextResponse('invalid', { status: 401 });
  }
  try {
    const evt = JSON.parse(raw);
    if (evt.event === 'charge.success' && evt.data && evt.data.reference) {
      await markPaid(adminDb(), evt.data.reference, evt.data);
    }
  } catch (e) { /* always answer 200 so Paystack does not keep retrying a bad body */ }
  return NextResponse.json({ ok: true });
}
