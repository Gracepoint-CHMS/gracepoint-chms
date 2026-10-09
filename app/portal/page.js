'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function MemberPortal() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [member, setMember] = useState(null);

  const [tithes, setTithes] = useState([]);
  const [pledges, setPledges] = useState([]);
  const [welfareRecords, setWelfareRecords] = useState([]);

  useEffect(() => {
    async function getMemberData() {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError || !session) {
          router.push('/');
          return;
        }

        const userId = session.user.id;

        const { data: memberData, error: memberError } = await supabase
          .from('members')
          .select('*')
          .eq('id', userId)
          .single();

        if (memberError) {
          console.error('Error fetching member profile:', memberError.message);
        } else {
          setMember(memberData);
        }

        const { data: tithesData } = await supabase
          .from('tithes')
          .select('*')
          .eq('member_id', userId);
        if (tithesData) setTithes(tithesData);

        const { data: pledgesData } = await supabase
          .from('pledges')
          .select('*')
          .eq('member_id', userId);
        if (pledgesData) setPledges(pledgesData);

        const { data: welfareData } = await supabase
          .from('welfare')
          .select('*')
          .eq('member_id', userId);
        if (welfareData) setWelfareRecords(welfareData);

      } catch (err) {
        console.error('Unexpected error loading portal:', err);
      } finally {
        setLoading(false);
      }
    }

    getMemberData();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-slate-600 font-medium">Loading your portal...</p>
      </div>
    );
  }

  const totalTithes = tithes.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  const totalPledges = pledges.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  const totalWelfare = welfareRecords.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

  return (
    <div className="min-h-screen bg-slate-100 pb-12">
      <header className="bg-blue-900 text-white shadow">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-lg font-bold">Gracepoint CHMS - Member Portal</h1>
          <button
            onClick={async () => {
              await supabase.auth.signOut();
              router.push('/');
            }}
            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded text-sm font-medium"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 mt-6 space-y-6">
        <div className="bg-white rounded-lg shadow p-6 flex flex-col sm:flex-row items-center gap-4">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center text-blue-900 text-2xl font-bold">
            {member?.full_name ? member.full_name.charAt(0) : 'M'}
          </div>
          <div className="text-center sm:text-left">
            <h2 className="text-xl font-bold text-slate-800">{member?.full_name || 'Church Member'}</h2>
            <p className="text-sm text-slate-500">{member?.email || member?.phone || ''}</p>
            <span className="inline-block mt-1 bg-blue-100 text-blue-800 text-xs px-2.5 py-0.5 rounded-full font-semibold">
              Department: {member?.department || 'General'}
            </span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-md font-bold text-slate-800 mb-4">My Contributions & Financial Records</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-slate-50 p-4 rounded border border-slate-200">
              <p className="text-xs text-slate-500 font-medium uppercase">Total Tithes</p>
              <p className="text-xl font-bold text-green-600 mt-1">GHS {totalTithes.toFixed(2)}</p>
            </div>
            <div className="bg-slate-50 p-4 rounded border border-slate-200">
              <p className="text-xs text-slate-500 font-medium uppercase">Total Pledges</p>
              <p className="text-xl font-bold text-blue-600 mt-1">GHS {totalPledges.toFixed(2)}</p>
            </div>
            <div className="bg-slate-50 p-4 rounded border border-slate-200">
              <p className="text-xs text-slate-500 font-medium uppercase">Total Welfare</p>
              <p className="text-xl font-bold text-amber-600 mt-1">GHS {totalWelfare.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
