'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function PortalPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [memberData, setMemberData] = useState(null);

  useEffect(() => {
    async function loadMember() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }
      
      const { data } = await supabase.from('members').select('*').eq('email', user.email).single();
      if (data) setMemberData(data);
      setLoading(false);
    }
    loadMember();
  }, [router]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push('/login');
  }

  if (loading) {
    return <div style={{ padding: '50px', textAlign: 'center', fontFamily: 'sans-serif' }}>Loading Portal...</div>;
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', display: 'flex', fontFamily: 'sans-serif' }}>
      {/* Clean Member Sidebar */}
      <div style={{ width: '240px', backgroundColor: '#1e293b', color: '#fff', padding: '20px' }}>
        <h2 style={{ fontSize: '16px', marginBottom: '30px' }}>Gracepoint Portal</h2>
        <button onClick={() => setActiveTab('dashboard')} style={sidebarBtnStyle(activeTab === 'dashboard')}>Dashboard</button>
        <button onClick={() => setActiveTab('profile')} style={sidebarBtnStyle(activeTab === 'profile')}>Profile</button>
        <button onClick={handleLogout} style={{ ...sidebarBtnStyle(false), color: '#ef4444', marginTop: '30px' }}>Logout</button>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, padding: '30px' }}>
        {activeTab === 'dashboard' && (
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: 'bold', marginBottom: '15px' }}>Welcome back, {memberData?.first_name || 'Member'}!</h1>
            <p style={{ color: '#64748b' }}>Here is an overview of your church portal and contributions.</p>
          </div>
        )}

        {activeTab === 'profile' && (
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: 'bold', marginBottom: '15px' }}>My Profile</h1>
            <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
              <p><strong>Name:</strong> {memberData?.first_name} {memberData?.last_name}</p>
              <p><strong>Email:</strong> {memberData?.email}</p>
              <p><strong>Phone:</strong> {memberData?.phone || 'N/A'}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function sidebarBtnStyle(active) {
  return {
    display: 'block',
    width: '100%',
    padding: '10px 15px',
    background: active ? '#2563eb' : 'transparent',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    textAlign: 'left',
    marginBottom: '8px',
    cursor: 'pointer',
    fontWeight: '500'
  };
}
