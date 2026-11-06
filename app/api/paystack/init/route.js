import { NextResponse } from 'next/server';
import { adminDb, paystack } from '../_lib';

const CATS = ['Tithe', 'Offering', 'Seed', 'Special Offering', 'Sacrifice', 'Purposive Giving', 'Welfare', 'Building Project', 'Thanksgiving', 'Missions', 'Pledge', 'Other'];

export async function POST(req) {
  try {
    if (!process.env.PAYSTACK_SECRET_KEY || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ error: 'Online giving is not set up yet.' }, { status: 503 });
    }
    const b = await req.json();
    const amount = Math.round(Number(b.amount) * 100) / 100;
    if (!(amount >= 1 && amount <= 50000)) return NextResponse.json({ error: 'Enter an amount between GHS 1 and GHS 50,000.' }, { status: 400 });
    const category = CATS.includes(b.category) ? b.category : 'Offering';
    const email = String(b.email || '').trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return NextResponse.json({ error: 'A valid email is needed for the receipt.' }, { status: 400 });
    const name = String(b.name || '').trim().slice(0, 120);
    if (!name) return NextResponse.json({ error: 'Please enter your name.' }, { status: 400 });

    const db = adminDb();
    // If the giver is logged in, trust the login (not the browser) to say who they are.
    let memberId = '';
    let giverType = 'non_member';
    const auth = req.headers.get('authorization') || '';
    if (auth.startsWith('Bearer ')) {
      const { data: u } = await db.auth.getUser(auth.slice(7));
      const authEmail = u && u.user && u.user.email;
      if (authEmail) {
        const { data: m } = await db.from('members').select('id').ilike('email', authEmail).limit(1);
        if (m && m[0]) { memberId = String(m[0].id); giverType = 'member'; }
      }
    }

    const reference = 'GP' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).slice(2, 7).toUpperCase();
    const row = {
      reference, status: 'pending', amount, currency: 'GHS', giver_type: giverType, member_id: memberId,
      giver_name: name, email, phone: String(b.phone || '').trim().slice(0, 30),
      category, purpose: String(b.purpose || '').trim().slice(0, 200)
    };
    const ins = await db.from('paystack_payments').insert(row);
    if (ins.error) return NextResponse.json({ error: 'Could not start the payment. Please try again.' }, { status: 500 });

    const origin = new URL(req.url).origin;
    const init = await paystack('/transaction/initialize', {
      method: 'POST',
      body: JSON.stringify({
        email, amount: Math.round(amount * 100), currency: 'GHS', reference,
        callback_url: origin + '/?give=done',
        metadata: { giver_name: name, category, purpose: row.purpose, giver_type: giverType }
      })
    });
    if (!init.status || !init.data) {
      await db.from('paystack_payments').update({ status: 'failed' }).eq('reference', reference);
      return NextResponse.json({ error: 'Payment service is unavailable. Please try again shortly.' }, { status: 502 });
    }
    return NextResponse.json({ url: init.data.authorization_url, reference });
  } catch (e) {
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}
