import { createClient } from '@supabase/supabase-js';

export function adminDb() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}

export async function paystack(path, opts = {}) {
  const res = await fetch('https://api.paystack.co' + path, {
    ...opts,
    headers: {
      Authorization: 'Bearer ' + process.env.PAYSTACK_SECRET_KEY,
      'Content-Type': 'application/json',
      ...(opts.headers || {})
    },
    cache: 'no-store'
  });
  return res.json();
}

// Safe to call many times for the same payment (webhook + browser return): it only ever records it once.
export async function markPaid(db, reference, txn) {
  const { data: row } = await db.from('paystack_payments').select('*').eq('reference', reference).maybeSingle();
  if (!row) return null;
  if (row.status === 'paid') return row;
  if (!txn || txn.status !== 'success') return row;
  const paidAmount = Number(txn.amount) / 100;
  if (String(txn.currency || 'GHS') !== 'GHS' || Math.abs(paidAmount - Number(row.amount)) > 0.009) {
    const { data } = await db.from('paystack_payments').update({ status: 'amount_mismatch' }).eq('reference', reference).select().maybeSingle();
    return data || row;
  }
  const { data } = await db.from('paystack_payments').update({
    status: 'paid',
    paid_at: txn.paid_at || new Date().toISOString(),
    channel: txn.channel || null
  }).eq('reference', reference).neq('status', 'paid').select().maybeSingle();
  return data || row;
}

export function publicRow(r) {
  if (!r) return null;
  return {
    reference: r.reference, member_id: r.member_id || '', status: r.status, amount: r.amount, category: r.category,
    purpose: r.purpose, giver_name: r.giver_name, giver_type: r.giver_type, paid_at: r.paid_at
  };
}
