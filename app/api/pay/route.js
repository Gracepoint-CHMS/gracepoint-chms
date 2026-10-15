// app/api/pay/route.js  -  Hubtel online giving for Gracepoint CHMS
// Runs ONLY on the server. The Hubtel keys live in Vercel Environment Variables, never in the app screen.
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const INIT_URL = 'https://payproxyapi.hubtel.com/items/initiate';
const STATUS_URL = 'https://api-txnstatus.hubtel.com/transactions/';
const TYPES = ['Tithe', 'Offering', 'Seed Offering', 'Thanksgiving', 'Welfare', 'Building Fund', 'Missions', 'Pledge', 'Other'];

const json = (body, status = 200) => NextResponse.json(body, { status });
const db = () => createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
const ready = () => !!(process.env.HUBTEL_API_ID && process.env.HUBTEL_API_KEY && process.env.HUBTEL_MERCHANT_NUMBER && process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.NEXT_PUBLIC_SUPABASE_URL);
const basic = () => 'Basic ' + Buffer.from(process.env.HUBTEL_API_ID + ':' + process.env.HUBTEL_API_KEY).toString('base64');

// ---- Step 1: a signed-in member asks for a payment link. (Hubtel's own callback also arrives here as a POST.) ----
export async function POST(req) {
  const body = await req.json().catch(() => ({}));
  if (body && body.Data && body.Data.ClientReference) return webhook(body);

  if (!ready()) return json({ error: 'Online giving is not switched on yet. The church admin must add the Hubtel keys in Vercel.' }, 503);
  const token = (req.headers.get('authorization') || '').replace(/^Bearer\s+/i, '');
  const sb = db();
  const { data: u } = await sb.auth.getUser(token);
  const email = u && u.user && u.user.email ? u.user.email.trim().toLowerCase() : '';
  if (!email) return json({ error: 'Please sign in again.' }, 401);

  const amount = Math.round(parseFloat(body.amount) * 100) / 100;
  const type = TYPES.includes(body.type) ? body.type : 'Offering';
  if (!amount || amount < 1 || amount > 100000) return json({ error: 'Enter an amount between GHS 1 and GHS 100,000.' }, 400);

  const { data: member } = await sb.from('members').select('id, title, first_name, last_name, email, phone').eq('email', email).maybeSingle();
  if (!member) return json({ error: 'Your member record was not found.' }, 404);
  const name = [member.title, member.first_name, member.last_name].filter(Boolean).join(' ');

  const origin = new URL(req.url).origin;
  const tx_ref = 'GP' + Date.now().toString(36) + Math.random().toString(36).slice(2, 10); // under 32 characters
  const saved = await sb.from('online_payments').insert({ tx_ref, member_id: String(member.id), member_email: email, member_name: name, amount, currency: 'GHS', type, status: 'pending', recorded: false });
  if (saved.error) return json({ error: 'Could not prepare the payment: ' + saved.error.message + ' (has supabase-payments.sql been run?)' }, 500);

  const res = await fetch(INIT_URL, {
    method: 'POST',
    headers: { Authorization: basic(), 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({
      totalAmount: amount,
      description: type + ' - Gracepoint Prophetic Church',
      callbackUrl: origin + '/api/pay',
      returnUrl: origin + '/?hp=' + tx_ref,
      cancellationUrl: origin + '/?hp=' + tx_ref + '&cancelled=1',
      merchantAccountNumber: process.env.HUBTEL_MERCHANT_NUMBER,
      clientReference: tx_ref,
      PayeeName: name || undefined,
      PayeeMobileNumber: member.phone || undefined,
      PayeeEmail: email
    })
  });
  const out = await res.json().catch(() => ({}));
  const link = out && out.data && out.data.checkoutUrl;
  if (!res.ok || !link) {
    await sb.from('online_payments').update({ status: 'failed' }).eq('tx_ref', tx_ref);
    return json({ error: (out && (out.message || (out.data && out.data.message))) || 'Hubtel could not start the payment.' }, 502);
  }
  return json({ link, tx_ref });
}

// ---- Step 2: the member comes back from Hubtel; check the payment and record it ----
export async function GET(req) {
  if (!ready()) return json({ error: 'Online giving is not set up.' }, 503);
  const ref = new URL(req.url).searchParams.get('ref') || '';
  if (!/^GP[a-z0-9]{6,30}$/.test(ref)) return json({ error: 'Missing payment reference.' }, 400);
  const sb = db();
  const { data: row } = await sb.from('online_payments').select('*').eq('tx_ref', ref).maybeSingle();
  if (!row) return json({ error: 'Payment not found.' }, 404);
  const done = (already) => ({ ok: true, already, amount: Number(row.amount), type: row.type, message: already ? 'This payment was already recorded.' : 'Payment received. Thank you!' });
  if (row.recorded) return json(done(true));

  // The callback from Hubtel usually arrives first. If it has not, ask Hubtel directly (a few tries).
  for (let i = 0; i < 4; i++) {
    const paid = await askHubtel(ref);
    if (paid === true) { const r = await settle(row, null); return json(r.body, r.status); }
    if (paid === false) return json({ ok: false, message: 'The payment was not completed. Nothing was recorded.' });
    await new Promise(r => setTimeout(r, 1500));
    const { data: again } = await sb.from('online_payments').select('recorded').eq('tx_ref', ref).maybeSingle();
    if (again && again.recorded) return json(done(true));
  }
  return json({ ok: false, pending: true, message: 'We are still waiting for Hubtel to confirm your payment. It will appear in your records automatically once it is confirmed.' });
}

// Hubtel's Status Check. Returns true (paid), false (failed/unpaid), or null (cannot tell).
async function askHubtel(ref) {
  try {
    const r = await fetch(STATUS_URL + encodeURIComponent(process.env.HUBTEL_MERCHANT_NUMBER) + '/status?clientReference=' + encodeURIComponent(ref), { headers: { Authorization: basic() } });
    if (!r.ok) return null;
    const j = await r.json().catch(() => ({}));
    const st = String((j && j.data && j.data.status) || '').toLowerCase();
    if (st === 'paid' || st === 'success' || st === 'successful') return true;
    if (st === 'unpaid' || st === 'failed' || st === 'refunded') return false;
    return null;
  } catch (e) { return null; }
}

// ---- Step 3: Hubtel tells us directly, even if the member closed the page ----
async function webhook(evt) {
  if (!ready()) return json({ error: 'Not set up.' }, 503);
  const d = evt.Data || {};
  const ref = String(d.ClientReference || '');
  if (!/^GP[a-z0-9]{6,30}$/.test(ref)) return json({ ok: true });
  const sb = db();
  const { data: row } = await sb.from('online_payments').select('*').eq('tx_ref', ref).maybeSingle();
  if (!row) return json({ ok: true }); // not one of ours
  const good = String(evt.ResponseCode) === '0000' && String(d.Status || evt.Status).toLowerCase() === 'success';
  if (!good) { if (!row.recorded) await sb.from('online_payments').update({ status: 'failed' }).eq('tx_ref', ref); return json({ ok: true }); }
  // The amount Hubtel says was paid must cover what we asked for
  if (Number(d.Amount) + 0.009 < Number(row.amount)) return json({ ok: true, note: 'Amount mismatch.' });
  // Where we can, double check with Hubtel before recording
  const check = await askHubtel(ref);
  if (check === false) return json({ ok: true });
  const r = await settle(row, String(d.CheckoutId || d.SalesInvoiceId || ''));
  return json(r.body, 200);
}

async function settle(row, hubtelId) {
  const txRef = row.tx_ref;
  const memberId = String(row.member_id);
  const type = TYPES.includes(row.type) ? row.type : 'Other';
  const amount = Number(row.amount);
  const name = row.member_name || 'Member';
  const email = String(row.member_email || '').trim().toLowerCase();
  if (row.recorded) return { status: 200, body: { ok: true, already: true, amount, type, message: 'This payment was already recorded.' } };
  const sb = db();
  await sb.from('online_payments').update({ status: 'successful', flw_id: hubtelId || row.flw_id || null }).eq('tx_ref', txRef);

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
