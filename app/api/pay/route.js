// app/api/pay/route.js  -  Flutterwave online giving for Gracepoint CHMS
// Runs ONLY on the server. The secret keys live in Vercel Environment Variables, never in the app screen.
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const FLW = 'https://api.flutterwave.com/v3';
const TYPES = ['Tithe', 'Offering', 'Seed Offering', 'Thanksgiving', 'Welfare', 'Building Fund', 'Missions', 'Pledge', 'Other'];

const json = (body, status = 200) => NextResponse.json(body, { status });
const db = () => createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
const ready = () => !!(process.env.FLUTTERWAVE_SECRET_KEY && process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.NEXT_PUBLIC_SUPABASE_URL);

// ---- Step 1: a signed-in member asks for a payment link ----
export async function POST(req) {
  const hook = req.headers.get('verif-hash');
  if (hook) return webhook(req, hook);

  if (!ready()) return json({ error: 'Online giving is not switched on yet. The church admin must add the Flutterwave keys in Vercel.' }, 503);
  const token = (req.headers.get('authorization') || '').replace(/^Bearer\s+/i, '');
  const sb = db();
  const { data: u } = await sb.auth.getUser(token);
  const email = u && u.user && u.user.email ? u.user.email.trim().toLowerCase() : '';
  if (!email) return json({ error: 'Please sign in again.' }, 401);

  const body = await req.json().catch(() => ({}));
  const amount = Math.round(parseFloat(body.amount) * 100) / 100;
  const type = TYPES.includes(body.type) ? body.type : 'Offering';
  if (!amount || amount < 1 || amount > 100000) return json({ error: 'Enter an amount between GHS 1 and GHS 100,000.' }, 400);

  const { data: member } = await sb.from('members').select('id, first_name, last_name, email, phone').eq('email', email).maybeSingle();
  if (!member) return json({ error: 'Your member record was not found.' }, 404);

  const origin = new URL(req.url).origin;
  const tx_ref = 'GPC-' + member.id + '-' + Date.now();
  const res = await fetch(FLW + '/payments', {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + process.env.FLUTTERWAVE_SECRET_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      tx_ref, amount, currency: 'GHS',
      redirect_url: origin + '/',
      payment_options: 'mobilemoneyghana,card',
      customer: { email, name: [member.first_name, member.last_name].filter(Boolean).join(' '), phonenumber: member.phone || undefined },
      meta: { member_id: String(member.id), type },
      customizations: { title: 'Gracepoint Prophetic Church', description: type, logo: origin + '/icon-512.png' }
    })
  });
  const out = await res.json().catch(() => ({}));
  if (!res.ok || !out.data || !out.data.link) return json({ error: (out && out.message) || 'Could not start the payment.' }, 502);
  return json({ link: out.data.link, tx_ref });
}

// ---- Step 2: the member comes back from Flutterwave; confirm the payment with Flutterwave and record it ----
export async function GET(req) {
  if (!ready()) return json({ error: 'Online giving is not set up.' }, 503);
  const sp = new URL(req.url).searchParams;
  const id = sp.get('transaction_id');
  if (!id) return json({ error: 'Missing transaction.' }, 400);
  const r = await settle(id, sp.get('tx_ref'));
  return json(r.body, r.status);
}

// ---- Step 3 (backup): Flutterwave tells us directly, even if the member closed the page ----
async function webhook(req, hash) {
  if (!process.env.FLUTTERWAVE_SECRET_HASH || hash !== process.env.FLUTTERWAVE_SECRET_HASH) return json({ error: 'Bad signature.' }, 401);
  if (!ready()) return json({ error: 'Not set up.' }, 503);
  const evt = await req.json().catch(() => ({}));
  const d = evt && evt.data;
  if (!d || !d.id) return json({ ok: true });
  const r = await settle(String(d.id), d.tx_ref);
  return json(r.body, r.status === 200 ? 200 : 202);
}

async function settle(id, txRefHint) {
  const vr = await fetch(FLW + '/transactions/' + encodeURIComponent(id) + '/verify', { headers: { Authorization: 'Bearer ' + process.env.FLUTTERWAVE_SECRET_KEY } });
  const v = await vr.json().catch(() => ({}));
  const d = v && v.data;
  if (!vr.ok || !d) return { status: 502, body: { error: 'Could not confirm the payment with Flutterwave.' } };
  if (d.status !== 'successful') return { status: 200, body: { ok: false, message: 'Payment status: ' + d.status + '. Nothing was recorded.' } };
  const txRef = String(d.tx_ref || '');
  if (!txRef.startsWith('GPC-') || d.currency !== 'GHS' || (txRefHint && txRefHint !== txRef)) return { status: 400, body: { error: 'This payment does not belong to the church app.' } };

  const meta = (d.meta && typeof d.meta === 'object') ? d.meta : {};
  const memberId = String(meta.member_id || txRef.slice(4, txRef.lastIndexOf('-')));
  const type = TYPES.includes(meta.type) ? meta.type : 'Other';
  const amount = Number(d.amount);
  const sb = db();

  const { data: member } = await sb.from('members').select('id, title, first_name, last_name, email').eq('id', memberId).maybeSingle();
  const name = member ? [member.title, member.first_name, member.last_name].filter(Boolean).join(' ') : (d.customer && d.customer.name) || 'Member';
  const email = (member && member.email ? member.email : (d.customer && d.customer.email) || '').trim().toLowerCase();

  // Remember the payment once (tx_ref is unique, so refreshing the page can never double count)
  const ins = await sb.from('online_payments').insert({ tx_ref: txRef, flw_id: String(d.id), member_id: memberId, member_email: email, member_name: name, amount, currency: d.currency, type, status: 'successful', recorded: false });
  if (ins.error && ins.error.code === '23505') {
    const { data: old } = await sb.from('online_payments').select('recorded').eq('tx_ref', txRef).maybeSingle();
    if (old && old.recorded) return { status: 200, body: { ok: true, already: true, amount, type, message: 'This payment was already recorded.' } };
  } else if (ins.error) {
    return { status: 500, body: { error: 'Payment confirmed but could not be saved: ' + ins.error.message + ' (has supabase-payments.sql been run?)' } };
  }

  const date = new Date().toISOString().slice(0, 10);
  const isTithe = type === 'Tithe';
  const entry = isTithe
    ? { member_id: memberId, member_name: name, amount: String(amount), date, online: true, tx_ref: txRef }
    : { member_id: memberId, contributor: name, type, amount: String(amount), date, online: true, tx_ref: txRef };
  const field = isTithe ? 'tithes' : 'contributions';

  // 1) the church ledger (Account Report, Balance Sheet)
  let ledgerOk = false;
  for (let i = 0; i < 6 && !ledgerOk; i++) {
    const { data: row } = await sb.from('app_data').select('data, version').eq('key', 'finance').maybeSingle();
    if (!row) {
      const { error } = await sb.from('app_data').insert({ key: 'finance', data: { [field]: [entry] }, version: 1 });
      if (!error) ledgerOk = true;
    } else {
      const list = Array.isArray(row.data && row.data[field]) ? row.data[field] : [];
      if (list.some(x => x && x.tx_ref === txRef)) { ledgerOk = true; break; }
      const next = { ...(row.data || {}), [field]: [entry, ...list] };
      const { data: upd } = await sb.from('app_data').update({ data: next, version: row.version + 1, updated_at: new Date().toISOString() }).eq('key', 'finance').eq('version', row.version).select('version');
      if (upd && upd.length) ledgerOk = true;
    }
  }

  // 2) the member's own read-only records
  let memberOk = false;
  if (email) {
    const { data: mrow } = await sb.from('member_finance').select('data').eq('member_id', memberId).maybeSingle();
    const base = (mrow && mrow.data) || { tithes: [], contributions: [], incomes: [], welfare: {} };
    const list = Array.isArray(base[field]) ? base[field] : [];
    const next = list.some(x => x && x.tx_ref === txRef) ? base : { ...base, [field]: [entry, ...list] };
    const { error } = await sb.from('member_finance').upsert({ member_id: memberId, member_email: email, data: next, updated_at: new Date().toISOString() }, { onConflict: 'member_id' });
    memberOk = !error;
  }

  if (ledgerOk && memberOk) {
    await sb.from('online_payments').update({ recorded: true }).eq('tx_ref', txRef);
    return { status: 200, body: { ok: true, amount, type, message: 'Payment received. Thank you!' } };
  }
  return { status: 500, body: { error: 'Payment confirmed but the records could not be updated. Please tell the church admin (reference ' + txRef + ').' } };
}
