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
  
  // Contributions state pulled or filtered for this member
  const [tithes, setTithes] = useState([]);
  const [pledges, setPledges] = useState([]);

  useEffect(() => {
    async function loadMemberPortal() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      // Fetch member data matching logged-in user email
      const { data: memberData, error } = await supabase
        .from('members')
        .select('*')
        .eq('email', user.email)
        .single();

      if (memberData) {
        setMember(memberData);
        const fullName = `${memberData.first_name} ${memberData.last_name}`;

        // Dummy/Simulated or real fetch for tithes and pledges tied to this member name
        // (You can also replace these with database queries if you store tithes in a separate Supabase table)
        setTithes([
          { date: '2026-06-05', amount: 150, member: fullName },
          { date: '2026-07-03', amount: 200, member: fullName }
        ]);
        setPledges([
          { purpose: 'Building Fund', amount: 500, member: fullName }
        ]);
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

  const totalTithes = myTithes.reduce((sum, t) => sum + Number(t.amount || 0), 0);
  const totalPledges = myPledges.reduce((sum, p) => sum + Number(p.amount || 0), 0);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: 'sans-serif' }}>
      
      {/* TOP HEADER BAR */}
      <div style={{ backgroundColor: '#2563eb', color: '#fff', padding: '15px 25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '18px', fontWeight: 'bold' }}>Gracepoint CHMS - Member Portal</span>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => router.push('/dashboard')} style={{ background: 'transparent', color: '#fff', border: '1px solid #fff', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: '500' }}>Admin Dashboard</button>
          <button onClick={handleLogout} style={{ background: 'transparent', color: '#fff', border: '1px solid #fff', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: '500' }}>Logout</button>
        </div>
      </div>

      <div style={{ padding: '25px', maxWidth: '800px', margin: '0 auto' }}>
        
        {/* Profile Card */}
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

        {/* Read-Only Contributions Summary Section */}
        <div style={{ backgroundColor: '#fff', padding: '25px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
          <h3 style={{ color: '#1e293b', marginBottom: '15px', borderBottom: '2px solid #f1f5f9', paddingBottom: '10px' }}>
            🔒 My Contributions & Financial Records (Read-Only)
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
            <div style={{ padding: '15px', backgroundColor: '#f0fdf4', borderRadius: '8px' }}>
              <p style={{ fontSize: '12px', color: '#166534', margin: '0 0 5px 0' }}>Total Tithes Contributed</p>
              <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#16a34a', margin: 0 }}>GHS {totalTithes.toFixed(2)}</p>
            </div>
            <div style={{ padding: '15px', backgroundColor: '#eff6ff', borderRadius: '8px' }}>
              <p style={{ fontSize: '12px', color: '#1e40af', margin: '0 0 5px 0' }}>Total Pledges Recorded</p>
              <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#2563eb', margin: 0 }}>GHS {totalPledges.toFixed(2)}</p>
            </div>
          </div>

          <h4 style={{ color: '#475569', fontSize: '14px', marginBottom: '10px' }}>Tithe History</h4>
          {myTithes.length === 0 ? (
            <p style={{ fontSize: '13px', color: '#94a3b8', fontStyle: 'italic' }}>No tithe records found.</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', marginBottom: '20px' }}>
              <thead>
                <tr style={{ backgroundColor: '#f1f5f9', textAlign: 'left' }}>
                  <th style={{ padding: '8px' }}>Date</th>
                  <th style={{ padding: '8px' }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {myTithes.map((t, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '8px' }}>{t.date}</td>
                    <td style={{ padding: '8px', color: '#16a34a', fontWeight: 'bold' }}>GHS {Number(t.amount).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          <h4 style={{ color: '#475569', fontSize: '14px', marginBottom: '10px' }}>Pledge History</h4>
          {myPledges.length === 0 ? (
            <p style={{ fontSize: '13px', color: '#94a3b8', fontStyle: 'italic' }}>No pledge records found.</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ backgroundColor: '#f1f5f9', textAlign: 'left' }}>
                  <th style={{ padding: '8px' }}>Purpose</th>
                  <th style={{ padding: '8px' }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {myPledges.map((p, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '8px' }}>{p.purpose}</td>
                    <td style={{ padding: '8px', color: '#2563eb', fontWeight: 'bold' }}>GHS {Number(p.amount).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

        </div>

      </div>
    </div>
  );
}
