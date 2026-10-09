'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function Home() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState('member');
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    async function getUserData() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session && session.user) {
        setUser(session.user);
        
        const { data } = await supabase
          .from('members')
          .select('role')
          .eq('email', session.user.email)
          .single();

        if (data && data.role) {
          setRole(data.role);
        }
      }
      setLoading(false);
    }
    getUserData();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthError('');
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      setAuthError(error.message);
    } else {
      window.location.reload();
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  if (loading) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', fontFamily: 'system-ui, sans-serif', color: '#64748b' }}>
        <p>Loading portal...</p>
      </div>
    );
  }

  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#f1f5f9', fontFamily: 'system-ui, sans-serif', padding: '1.5rem 1rem' }}>
      <div style={{ maxWidth: '42rem', margin: '0 auto', backgroundColor: '#ffffff', borderRadius: '0.75rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', overflow: 'hidden' }}>
        
        {/* Header Section */}
        <div style={{ backgroundColor: '#1e3a8a', color: '#ffffff', padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 'bold', margin: '0 0 0.25rem 0' }}>
              Gracepoint CHMS
            </h1>
            <p style={{ fontSize: '0.875rem', opacity: 0.9, margin: 0 }}>
              {user ? (role === 'super_admin' ? 'Super Admin Dashboard' : 'Member Portal') : 'Portal Login'}
            </p>
          </div>
          {user && (
            <button 
              onClick={handleLogout}
              style={{ backgroundColor: '#dc2626', color: '#ffffff', border: 'none', padding: '0.5rem 1rem', borderRadius: '0.375rem', cursor: 'pointer', fontWeight: '600', fontSize: '0.875rem' }}
            >
              Logout
            </button>
          )}
        </div>

        {/* Body Content */}
        <div style={{ padding: '1.5rem' }}>
          {!user ? (
            /* Login Form */
            <div>
              <h2 style={{ fontSize: '1.125rem', fontWeight: '700', color: '#1e293b', marginBottom: '1rem' }}>
                Sign In to Your Account
              </h2>
              {authError && (
                <div style={{ backgroundColor: '#fee2e2', color: '#991b1b', padding: '0.75rem', borderRadius: '0.375rem', marginBottom: '1rem', fontSize: '0.875rem' }}>
                  {authError}
                </div>
              )}
              <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#475569', marginBottom: '0.375rem' }}>Email Address</label>
                  <input 
                    type="email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    required 
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1', fontSize: '1rem', boxSizing: 'border-box' }}
                    placeholder="Enter your email"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#475569', marginBottom: '0.375rem' }}>Password</label>
                  <input 
                    type="password" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    required 
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1', fontSize: '1rem', boxSizing: 'border-box' }}
                    placeholder="Enter your password"
                  />
                </div>
                <button 
                  type="submit" 
                  style={{ backgroundColor: '#2563eb', color: '#ffffff', border: 'none', padding: '0.75rem', borderRadius: '0.375rem', fontWeight: '600', fontSize: '1rem', cursor: 'pointer', marginTop: '0.5rem' }}
                >
                  Login
                </button>
              </form>
            </div>
          ) : (
            /* Logged-In View */
            <div>
              <div style={{ marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.125rem', fontWeight: '700', color: '#1e293b', margin: '0 0 0.25rem 0' }}>
                  {user.email}
                </h2>
                <p style={{ color: '#64748b', fontSize: '0.875rem', margin: 0 }}>
                  Role: <strong style={{ color: role === 'super_admin' ? '#2563eb' : '#16a34a' }}>{role}</strong>
                </p>
              </div>

              {role === 'super_admin' ? (
                /* Super Admin View */
                <div style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '0.5rem', padding: '1.25rem' }}>
                  <h3 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#1e3a8a', margin: '0 0 1rem 0', textTransform: 'uppercase' }}>
                    Admin Controls & Management
                  </h3>
                  <p style={{ fontSize: '0.875rem', color: '#1e40af', marginBottom: '1rem' }}>
                    You have full administrative privileges to manage church members, view financial records, and update records.
                  </p>
                  <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <button style={{ backgroundColor: '#2563eb', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '0.375rem', fontWeight: '600', cursor: 'pointer' }}>
                      Manage Members
                    </button>
                    <button style={{ backgroundColor: '#16a34a', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '0.375rem', fontWeight: '600', cursor: 'pointer' }}>
                      View All Financials
                    </button>
                  </div>
                </div>
              ) : (
                /* Standard Member View */
                <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '0.5rem', padding: '1.25rem' }}>
                  <h3 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#334155', margin: '0 0 1rem 0', textTransform: 'uppercase' }}>
                    My Contributions & Financial Records
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.75rem' }}>
                    <div style={{ backgroundColor: '#ffffff', padding: '1rem', borderRadius: '0.375rem', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.875rem', color: '#64748b', fontWeight: '500' }}>Total Tithes</span>
                      <span style={{ fontSize: '1rem', fontWeight: 'bold', color: '#16a34a' }}>GHS 0.00</span>
                    </div>
                    <div style={{ backgroundColor: '#ffffff', padding: '1rem', borderRadius: '0.375rem', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.875rem', color: '#64748b', fontWeight: '500' }}>Total Pledges</span>
                      <span style={{ fontSize: '1rem', fontWeight: 'bold', color: '#2563eb' }}>GHS 0.00</span>
                    </div>
                    <div style={{ backgroundColor: '#ffffff', padding: '1rem', borderRadius: '0.375rem', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.875rem', color: '#64748b', fontWeight: '500' }}>Total Welfare</span>
                      <span style={{ fontSize: '1rem', fontWeight: 'bold', color: '#d97706' }}>GHS 0.00</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </main>
  );
}
