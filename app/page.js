'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function Home() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getUser() {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
      setLoading(false);
    }
    getUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', fontFamily: 'system-ui, sans-serif' }}>
        <p>Loading portal...</p>
      </div>
    );
  }

  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: 'system-ui, sans-serif', padding: '1rem' }}>
      <div style={{ maxWidth: '48rem', margin: '0 auto', backgroundColor: '#ffffff', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '1.5rem' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1e293b', margin: '0 0 0.25rem 0' }}>
              Gracepoint CHMS
            </h1>
            <p style={{ color: '#64748b', fontSize: '0.875rem', margin: 0 }}>Member Portal</p>
          </div>
          {user && (
            <button 
              onClick={handleLogout}
              style={{ backgroundColor: '#dc2626', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '0.375rem', cursor: 'pointer', fontWeight: '500' }}
            >
              Logout
            </button>
          )}
        </div>

        {/* Content Section */}
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1e3a8a', marginBottom: '0.5rem' }}>
            Church Member
          </h2>
          <p style={{ color: '#475569', marginBottom: '1.5rem' }}>Department: General</p>

          <div style={{ backgroundColor: '#f1f5f9', padding: '1rem', borderRadius: '0.375rem', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '600', color: '#334155', margin: '0 0 1rem 0' }}>
              My Contributions & Financial Records
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem' }}>
              <div style={{ backgroundColor: 'white', padding: '1rem', borderRadius: '0.25rem', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                <p style={{ fontSize: '0.75rem', color: '#64748b', margin: '0 0 0.25rem 0', textTransform: 'uppercase' }}>Total Tithes</p>
                <p style={{ fontSize: '1.125rem', fontWeight: 'bold', color: '#16a34a', margin: 0 }}>GHS 0.00</p>
              </div>

              <div style={{ backgroundColor: 'white', padding: '1rem', borderRadius: '0.25rem', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                <p style={{ fontSize: '0.75rem', color: '#64748b', margin: '0 0 0.25rem 0', textTransform: 'uppercase' }}>Total Pledges</p>
                <p style={{ fontSize: '1.125rem', fontWeight: 'bold', color: '#2563eb', margin: 0 }}>GHS 0.00</p>
              </div>

              <div style={{ backgroundColor: 'white', padding: '1rem', borderRadius: '0.25rem', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                <p style={{ fontSize: '0.75rem', color: '#64748b', margin: '0 0 0.25rem 0', textTransform: 'uppercase' }}>Total Welfare</p>
                <p style={{ fontSize: '1.125rem', fontWeight: 'bold', color: '#d97706', margin: 0 }}>GHS 0.00</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </main>
  );
}
