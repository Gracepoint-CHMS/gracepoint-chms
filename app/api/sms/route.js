// app/api/sms/route.js  -  Hubtel bulk SMS for Gracepoint CHMS
// Runs ONLY on the server. The Hubtel SMS keys live in Vercel Environment Variables.
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const json = (body, status = 200) => NextResponse.json(body, { status });

// 0244123456 / +233244123456 / 244123456  ->  233244123456
function toIntl(p) {
  let d = String(p || '').replace(/[^0-9]/g, '');
  if (d.startsWith('00')) d = d.slice(2);
  if (d.startsWith('233') && d.length === 12) return d;
  if (d.startsWith('0') && d.length === 10) return '233' + d.slice(1);
  if (d.length === 9) return '233' + d;
  if (d.length >= 11 && d.length <= 15) return d; // other countries, already international
  return '';
}

export async function POST(req) {
  const id = process.env.HUBTEL_SMS_CLIENT_ID, secret = process.env.HUBTEL_SMS_CLIENT_SECRET;
  const sender = (process.env.HUBTEL_SMS_SENDER || '').trim().slice(0, 11);
  if (!id || !secret || !sender) return json({ error: 'Bulk SMS is not switched on yet. The church admin must add the Hubtel SMS keys in Vercel.' }, 503);

  // Only signed-in people with the "Send messages" permission (or the Super Admin) may send
  const token = (req.headers.get('authorization') || '').replace(/^Bearer\s+/i, '');
  if (!token) return json({ error: 'Please sign in again.' }, 401);
  const asUser = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { Authorization: 'Bearer ' + token } }
  });
  const { data: allowed, error: permErr } = await asUser.rpc('has_perm', { p: 'send_messages' });
  if (permErr || allowed !== true) return json({ error: 'You do not have permission to send SMS.' }, 403);

  const body = await req.json().catch(() => ({}));
  const content = String(body.message || '').trim();
  if (!content) return json({ error: 'Type a message first.' }, 400);
  if (content.length > 640) return json({ error: 'The message is too long (maximum 640 characters).' }, 400);
  const list = Array.isArray(body.phones) ? body.phones : [];
  const numbers = [...new Set(list.map(toIntl).filter(Boolean))];
  if (!numbers.length) return json({ error: 'No valid phone numbers were selected.' }, 400);
  if (numbers.length > 1000) return json({ error: 'Please send to 1000 people or fewer at a time.' }, 400);

  let sent = 0; const failed = [];
  let firstError = '';
  const queue = numbers.slice();
  const worker = async () => {
    while (queue.length) {
      const to = queue.shift();
      try {
        const url = 'https://smsc.hubtel.com/v1/messages/send?clientid=' + encodeURIComponent(id) + '&clientsecret=' + encodeURIComponent(secret)
          + '&from=' + encodeURIComponent(sender) + '&to=' + encodeURIComponent(to) + '&content=' + encodeURIComponent(content);
        const r = await fetch(url);
        if (r.ok) sent++;
        else { failed.push(to); if (!firstError) firstError = 'Hubtel answered ' + r.status + (r.status === 401 || r.status === 403 ? ' (check the SMS Client ID/Secret and that the sender name is approved)' : ''); }
      } catch (e) { failed.push(to); if (!firstError) firstError = e.message; }
    }
  };
  await Promise.all([worker(), worker(), worker(), worker(), worker()]);
  return json({ ok: sent > 0, sent, failed: failed.length, total: numbers.length, error: sent === 0 ? firstError || 'Nothing was sent.' : undefined });
}
