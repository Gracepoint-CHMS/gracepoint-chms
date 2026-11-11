import { NextResponse } from 'next/server';
import { adminDb } from '../paystack/_lib';

// Bulk SMS for the church portal (Arkesel). The old Hubtel route at /api/sms is left untouched.
// Vercel env vars: SMS_API_KEY (required), SMS_SENDER_ID (optional, default GRACEPOINT)
export const dynamic = 'force-dynamic';

function cleanPhone(p) {
  let d = String(p || '').replace(/\D/g, '');
  if (d.startsWith('00')) d = d.slice(2);
  if (d.length === 10 && d.startsWith('0')) d = '233' + d.slice(1);
  else if (d.length === 9) d = '233' + d;
  return d.length === 12 && d.startsWith('233') ? d : '';
}

async function sendBatch(numbers, message) {
  const res = await fetch('https://sms.arkesel.com/api/v2/sms/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'api-key': process.env.SMS_API_KEY },
    body: JSON.stringify({ sender: process.env.SMS_SENDER_ID || 'GRACEPOINT', message, recipients: numbers }),
    cache: 'no-store'
  });
  const out = await res.json().catch(() => ({}));
  const bad = !res.ok || (out && out.status && String(out.status).toLowerCase() !== 'success' && String(out.code || '').toLowerCase() !== 'ok');
  return { ok: !bad, error: bad ? String((out && (out.message || out.error)) || 'The SMS provider refused the message (HTTP ' + res.status + ').') : '' };
}

export async function POST(req) {
  try {
    if (!process.env.SMS_API_KEY) return NextResponse.json({ error: 'SMS is not set up yet (SMS_API_KEY is missing).' }, { status: 503 });
    const token = (req.headers.get('authorization') || '').replace(/^Bearer\s+/i, '');
    if (!token) return NextResponse.json({ error: 'Please log in again.' }, { status: 401 });
    const db = adminDb();
    const { data: u } = await db.auth.getUser(token);
    const email = u && u.user && u.user.email;
    if (!email) return NextResponse.json({ error: 'Please log in again.' }, { status: 401 });
    const { data: rows } = await db.from('members').select('role').ilike('email', email.replace(/[\\%_]/g, '\\$&')).limit(1);
    const role = rows && rows[0] && rows[0].role;
    if (!role || role === 'member') return NextResponse.json({ error: 'Only church admins can send SMS.' }, { status: 403 });

    const body = await req.json().catch(() => ({}));
    const message = String(body.message || '').trim();
    if (!message) return NextResponse.json({ error: 'The message is empty.' }, { status: 400 });
    if (message.length > 1000) return NextResponse.json({ error: 'The message is too long (limit 1000 characters).' }, { status: 400 });
    const raw = Array.isArray(body.phones) ? body.phones : [];
    const numbers = Array.from(new Set(raw.map(cleanPhone).filter(Boolean)));
    if (!numbers.length) return NextResponse.json({ error: 'No valid phone numbers to send to.' }, { status: 400 });
    if (numbers.length > 2000) return NextResponse.json({ error: 'Too many people at once (limit 2000). Send in smaller groups.' }, { status: 400 });

    let sent = 0, failed = 0, error = '';
    for (let i = 0; i < numbers.length; i += 200) {
      const chunk = numbers.slice(i, i + 200);
      const r = await sendBatch(chunk, message);
      if (r.ok) sent += chunk.length; else { failed += chunk.length; error = error || r.error; }
    }
    return NextResponse.json({ sent, failed, total: raw.length, invalid: raw.length - numbers.length, error }, { status: sent ? 200 : 502 });
  } catch (e) {
    return NextResponse.json({ error: 'Could not send: ' + (e && e.message ? e.message : 'unknown error') }, { status: 500 });
  }
}
