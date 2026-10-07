'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';

export default function MemberPortal() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [member, setMember] = useState(null);
  const [contributions, setContributions] = useState([]);

  useEffect(() => {
    fetchMemberData();
  }, []);

  async function fetchMemberData() {
    setLoading(true);
    // Get current authenticated user session
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      router.push('/login');
      return;
    }

    const userEmail = session.user.email;

    // Fetch member profile details
    const { data: memberData, error: memberError } = await supabase
      .from('members')
      .select('*')
      .eq('email', userEmail)
      .single();

    if (memberData) {
      setMember(memberData);
    }

    // Fetch member contributions
    const { data: contribData, error: contribError } = await supabase
      .from('contributions')
      .select('*')
      .eq('member_email', userEmail)
      .order('week_ending', { ascending: false });

    if (contribData) {
      setContributions(contribData);
    }

    setLoading(false);
  }

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', fontFamily: 'sans-serif' }}>
        <p>Loading your personal portal...</p>
      </div>
    );
  }

  // Calculate totals
  const totalWelfare = contributions
    .filter(c => c.contribution_type === 'Welfare')
    .reduce((sum, c) => sum + Number(c.amount), 0);

  const totalTithesAndOthers = contributions
    .filter(c => c.contribution_type !== 'Welfare')
    .reduce((sum, c) => sum + Number(c.amount), 0);

  const welfareRecords = contributions.filter(c => c.contribution_type === 'Welfare');
  const otherRecords = contributions.filter(c => c.contribution_type !== 'Welfare');

  return (
    <div style={{ padding: '20px', maxWidth: '900px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', borderBottom: '1px solid #e5e7eb', paddingBottom: '15px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>Welcome, {member?.first_name || 'Member'}!</h1>
          <p style={{ color: '#6b7280', fontSize: '14px' }}>Your Personal Member Portal & Giving History</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          {member && (member.role === 'admin' || member.role === 'super_admin') && (
            <button
              onClick={() => router.push('/dashboard')}
              style={{ backgroundColor: '#2563eb', color: '#fff', padding: '10px 15px', borderRadius: '6px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}
            >
              Admin Dashboard
            </button>
          )}
          <button
            onClick={async () => {
              await supabase.auth.signOut();
              router.push('/login');
            }}
            style={{ backgroundColor: '#ef4444', color: '#fff', padding: '10px 15px', borderRadius: '6px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}
          >
            Logout
          </button>
        </div>
      </div>

      {/* Member Profile Card */}
      <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', marginBottom: '25px', display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
        <div>
          {member?.photo_url ? (
            <img src={member.photo_url} alt="Profile" style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover' }} />
          ) : (
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#e0e7ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', fontWeight: 'bold', color: '#3730a3' }}>
              {member?.first_name?.[0] || 'M'}
            </div>
          )}
        </div>
        <div style={{ flex: 1 }}>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '5px' }}>{member?.prefix} {member?.first_name} {member?.last_name}</h2>
          <p style={{ color: '#4b5563', fontSize: '14px', marginBottom: '4px' }}><strong>Email:</strong> {member?.email}</p>
          <p style={{ color: '#4b5563', fontSize: '14px', marginBottom: '4px' }}><strong>Phone:</strong> {member?.phone || 'Not provided'}</p>
          <p style={{ color: '#4b5563', fontSize: '14px' }}><strong>Department:</strong> {member?.core_department || 'N/A'} ({member?.sub_department || 'General'})</p>
        </div>
      </div>

      {/* Financial Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        <div style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', padding: '20px', borderRadius: '8px' }}>
          <h3 style={{ fontSize: '15px', color: '#1e40af', marginBottom: '8px' }}>Compulsory Weekly Welfare Total</h3>
          <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#1e3a8a', marginBottom: '5px' }}>GHS {totalWelfare.toFixed(2)}</p>
          <span style={{ fontSize: '12px', color: '#3b82f6' }}>Compulsory weekly contributions tracked</span>
        </div>
        <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', padding: '20px', borderRadius: '8px' }}>
          <h3 style={{ fontSize: '15px', color: '#166534', marginBottom: '8px' }}>Tithes, Offerings & Dues Total</h3>
          <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#14532d', marginBottom: '5px' }}>GHS {totalTithesAndOthers.toFixed(2)}</p>
          <span style={{ fontSize: '12px', color: '#22c55e' }}>General offerings and tithes given</span>
        </div>
      </div>

      {/* Section 1: Compulsory Weekly Welfare History */}
      <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', marginBottom: '25px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '15px', color: '#1e40af' }}>My Weekly Welfare Contributions (Compulsory)</h3>
        {welfareRecords.length === 0 ? (
          <p style={{ color: '#6b7280', fontSize: '14px' }}>No weekly welfare records found for your account yet.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ backgroundColor: '#eff6ff', borderBottom: '1px solid #bfdbfe' }}>
                  <th style={{ padding: '10px' }}>Week Ending</th>
                  <th style={{ padding: '10px' }}>Amount (GHS)</th>
                  <th style={{ padding: '10px' }}>Payment Method</th>
                  <th style={{ padding: '10px' }}>Notes</th>
                </tr>
              </thead>
              <tbody>
                {welfareRecords.map((w) => (
                  <tr key={w.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '10px', fontWeight: '500' }}>{w.week_ending || 'N/A'}</td>
                    <td style={{ padding: '10px', fontWeight: 'bold', color: '#1e40af' }}>GHS {Number(w.amount).toFixed(2)}</td>
                    <td style={{ padding: '10px', fontSize: '13px' }}>{w.payment_method || 'Cash'}</td>
                    <td style={{ padding: '10px', fontSize: '13px', color: '#6b7280' }}>{w.notes || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Section 2: Tithes, Offerings & Dues History */}
      <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '15px', color: '#166534' }}>Tithes, Offerings & Other Contributions</h3>
        {otherRecords.length === 0 ? (
          <p style={{ color: '#6b7280', fontSize: '14px' }}>No other contribution records found.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ backgroundColor: '#f0fdf4', borderBottom: '1px solid #bbf7d0' }}>
                  <th style={{ padding: '10px' }}>Type</th>
                  <th style={{ padding: '10px' }}>Amount (GHS)</th>
                  <th style={{ padding: '10px' }}>Payment Method</th>
                  <th style={{ padding: '10px' }}>Date Recorded</th>
                  <th style={{ padding: '10px' }}>Notes</th>
                </tr>
              </thead>
              <tbody>
                {otherRecords.map((o) => (
                  <tr key={o.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '10px', fontWeight: '500' }}>{o.contribution_type}</td>
                    <td style={{ padding: '10px', fontWeight: 'bold', color: '#166534' }}>GHS {Number(o.amount).toFixed(2)}</td>
                    <td style={{ padding: '10px', fontSize: '13px' }}>{o.payment_method || 'Cash'}</td>
                    <td style={{ padding: '10px', fontSize: '13px' }}>{new Date(o.created_at).toLocaleDateString()}</td>
                    <td style={{ padding: '10px', fontSize: '13px', color: '#6b7280' }}>{o.notes || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
