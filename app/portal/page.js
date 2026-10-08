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
    async function loadMemberPortal() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      // Fetch member data matching logged-in user email
      const { data: memberData } = await supabase
        .from('members')
        .select('*')
        .eq('email', user.email)
        .single();

      if (memberData) {
        setMember(memberData);
        const fullName = `${memberData.first_name} ${memberData.last_name}`;

        // Fetch from Supabase tables or fallback to localStorage
        const savedTithes = JSON.parse(localStorage.getItem('gp_tithes') || '[]');
        const savedPledges = JSON.parse(localStorage.getItem('gp_pledges') || '[]');
        const savedWelfare = JSON.parse(localStorage.getItem('gp_welfare') || '{}');

        setTithes(savedTithes);
        setPledges(savedPledges);
        setWelfareRecords(savedWelfare);
      }

      setLoading(false);
    }
    loadMemberPortal();
  }, [router]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push('/login');
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'sans-serif' }}>
        <p style={{ color: '#1d4ed8', fontWeight: '500' }}>Loading your portal...</p>
      </div>
    );
  }

  if (!member) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', fontFamily: 'sans-serif' }}>
        <h2>No member profile found for this account.</h2>
        <button onClick={handleLogout} style={{ marginTop: '15px', padding: '10px 20px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Logout</button>
      </div>
    );
  }

  const memberFullName = `${member.first_name} ${member.last_name}`;
  const myTithes = tithes.filter(t => t.member === memberFullName);
  const myPledges = pledges.filter(p => p.member === memberFullName);

  // Calculate welfare items tied to this member
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  let totalWelfare = 0;
  const myWelfareRows = [];

  months.forEach(month => {
    let mTotal = 0;
    const weeks = {};
    ['W1', 'W2', 'W3', 'W4'].forEach(week => {
      const key = `${memberFullName}-${month}-${week}`;
      const val = Number(welfareRecords[key] || 0);
      weeks[week] = val;
      mTotal += val;
    });
    if (mTotal > 0) {
      totalWelfare += mTotal;
      myWelfareRows.push({ month, ...weeks, total: mTotal });
    }
  });

  const totalTithes = myTithes.reduce((sum, t) => sum + Number(t.amount || 0), 0);
  const totalPledges = myPledges.reduce((sum, p) => sum + Number(p.amount || 0), 0);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: 'sans-serif' }}>
      
      <div style={{ backgroundColor: '#2563eb', color: '#fff', padding: '15px 25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '18px', fontWeight: 'bold' }}>Gracepoint CHMS - Member Portal</span>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => router.push('/dashboard')} style={{ background: 'transparent', color: '#fff', border: '1px solid #fff', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: '500' }}>Admin Dashboard</button>
          <button onClick={handleLogout} style={{ background: 'transparent', color: '#fff', border: '1px solid #fff', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: '500' }}>Logout</button>
        </div>
      </div>

      <div style={{ padding: '25px', maxWidth: '800px', margin: '0 auto' }}>
        
        <div style={{ backgroundColor: '#fff', padding: '25px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '20px' }}>
          {member.photo_url ? (
            <img src={member.photo_url} alt="Profile" style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #2563eb' }} />
          ) : (
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#fff', fontSize: '28px' }}>
              {member.first_name?.[0]}
            </div>
          )}
          <div>
            <h2 style={{ margin: '0 0 5px 0', color: '#1e293b' }}>{member.first_name} {member.last_name}</h2>
            <p style={{ margin: '0 0 3px 0', fontSize: '14px', color: '#64748b' }}>📧 {member.email} | 📞 {member.phone || 'N/A'}</p>
            <span style={{ fontSize: '12px', color: '#2563eb', fontWeight: 'bold', backgroundColor: '#eff6ff', padding: '3px 8px', borderRadius: '4px' }}>
              Core Department: {member.core_department || 'LOVE'}
            </span>
          </div>
        </div>

        <div style={{ backgroundColor: '#fff', padding: '25px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
          <h3 style={{ color: '#1e293b', marginBottom: '15px', borderBottom: '2px solid #f1f5f9', paddingBottom: '10px' }}>
            🔒 My Contributions & Financial Records (Read-Only)
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px', marginBottom: '20px' }}>
            <div style={{ padding: '15px', backgroundColor: '#f0fdf4', borderRadius: '8px' }}>
              <p style={{ fontSize: '11px', color: '#166534', margin: '0 0 5px 0' }}>Total Tithes</p>
              <p style={{ fontSize: '18px', fontWeight: 'bold', color: '#16a34a', margin: 0 }}>GHS {totalTithes.toFixed(2)}</p>
            </div>
            <div style={{ padding: '15px', backgroundColor: '#eff6ff', borderRadius: '8px' }}>
              <p style={{ fontSize: '11px', color: '#1e40af', margin: '0 0 5px 0' }}>Total Pledges</p>
              <p style={{ fontSize: '18px', fontWeight: 'bold', color: '#2563eb', margin: 0 }}>GHS {totalPledges.toFixed(2)}</p>
            </div>
            <div style={{ padding: '15px', backgroundColor: '#fef3c7', borderRadius: '8px' }}>
              <p style={{ fontSize: '11px', color: '#92400e', margin: '0 0 5px 0' }}>Total Welfare</p>
              <p style={{ fontSize: '18px', fontWeight: 'bold', color: '#d97706', margin: 0 }}>GHS {totalWelfare.toFixed(2)}</p>
            </div>
          </div>

          <h4 style={{ color: '#475569', fontSize: '14px', marginBottom: '10px' }}>Tithe History</h4>
          {myTithes.length === 0 ? <p style={{ fontSize: '13px', color: '#94a3b8', fontStyle: 'italic', marginBottom: '15px' }}>No tithe records found.</p> : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', marginBottom: '20px' }}>
              <thead><tr style={{ backgroundColor: '#f1f5f9', textAlign: 'left' }}><th style={{ padding: '8px' }}>Date</th><th style={{ padding: '8px' }}>Amount</th></tr></thead>
              <tbody>{myTithes.map((t, i) => <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}><td style={{ padding: '8px' }}>{t.date}</td><td style={{ padding: '8px', color: '#16a34a', fontWeight: 'bold' }}>GHS {Number(t.amount).toFixed(2)}</td></tr>)}</tbody>
            </table>
          )}

          <h4 style={{ color: '#475569', fontSize: '14px', marginBottom: '10px' }}>Welfare Contributions History</h4>
          {myWelfareRows.length === 0 ? <p style={{ fontSize: '13px', color: '#94a3b8', fontStyle: 'italic', marginBottom: '15px' }}>No welfare records found.</p> : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', marginBottom: '20px', textAlign: 'center' }}>
              <thead>
                <tr style={{ backgroundColor: '#f1f5f9' }}>
                  <th style={{ padding: '8px', textAlign: 'left' }}>Month</th>
                  <th style={{ padding: '8px' }}>W1</th>
                  <th style={{ padding: '8px' }}>W2</th>
                  <th style={{ padding: '8px' }}>W3</th>
                  <th style={{ padding: '8px' }}>W4</th>
                  <th style={{ padding: '8px' }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {myWelfareRows.map((w, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '8px', textAlign: 'left', fontWeight: 'bold' }}>{w.month}</td>
                    <td style={{ padding: '8px' }}>{w.W1}</td>
                    <td style={{ padding: '8px' }}>{w.W2}</td>
                    <td style={{ padding: '8px' }}>{w.W3}</td>
                    <td style={{ padding: '8px' }}>{w.W4}</td>
                    <td style={{ padding: '8px', fontWeight: 'bold', color: '#d97706' }}>GHS {w.total.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          <h4 style={{ color: '#475569', fontSize: '14px', marginBottom: '10px' }}>Pledge History</h4>
          {myPledges.length === 0 ? <p style={{ fontSize: '13px', color: '#94a3b8', fontStyle: 'italic' }}>No pledge records found.</p> : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead><tr style={{ backgroundColor: '#f1f5f9', textAlign: 'left' }}><th style={{ padding: '8px' }}>Purpose</th><th style={{ padding: '8px' }}>Amount</th></tr></thead>
              <tbody>{myPledges.map((p, i) => <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}><td style={{ padding: '8px' }}>{p.purpose}</td><td style={{ padding: '8px', color: '#2563eb', fontWeight: 'bold' }}>GHS {Number(p.amount).toFixed(2)}</td></tr>)}</tbody>
            </table>
          )}

        </div>

      </div>
    </div>
  );
}
