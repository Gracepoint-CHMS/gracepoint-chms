'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const card = { backgroundColor: 'white', padding: '1rem', borderRadius: '0.5rem' };
const label = { fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' };
const input = { width: '100%', padding: '0.75rem', marginBottom: '0.75rem', border: '1px solid #cbd5e1', borderRadius: '0.5rem', fontSize: '1rem', boxSizing: 'border-box' };
const primaryBtn = { width: '100%', padding: '0.75rem', backgroundColor: '#1e3a8a', color: 'white', border: 'none', borderRadius: '0.5rem', fontSize: '1rem' };

export default function Home() {
  const [user, setUser] = useState(null);
  const [member, setMember] = useState(null);
  const [memberCount, setMemberCount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  async function loadProfile(u) {
    const { data } = await supabase
      .from('members')
      .select('*')
      .eq('id', u.id)
      .maybeSingle();
    setMember(data);

    if (data?.role === 'admin') {
      const { count } = await supabase
        .from('members')
        .select('*', { count: 'exact', head: true });
      setMemberCount(count);
    }
  }

  useEffect(() => {
    async function init() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        await loadProfile(session.user);
      }
      setLoading(false);
    }
    init();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
      return;
    }
    setUser(data.user);
    await loadProfile(data.user);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setMember(null);
    setMemberCount(null);
  };

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}><p>Loading portal...</p></div>;
  }

  const isAdmin = member?.role === 'admin';

  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#f8fafc', padding: '1rem', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ maxWidth: '48rem', margin: '0 auto', backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>Gracepoint CHMS</h1>
            <p style={{ color: '#64748b', fontSize: '0.875rem', margin: 0 }}>
              {isAdmin ? 'Admin Dashboard' : 'Member Portal'}
            </p>
          </div>
          {user && (
            <button onClick={handleLogout} style={{ backgroundColor: '#dc2626', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '0.5rem' }}>
              Logout
            </button>
          )}
        </div>

        {!user ? (
          <form onSubmit={handleLogin}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Sign in</h2>
            <input style={input} type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <input style={input} type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            {error && <p style={{ color: '#dc2626', marginBottom: '0.75rem' }}>{error}</p>}
            <button type="submit" style={primaryBtn}>Login</button>
          </form>
        ) : (
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#1e3a8a', marginBottom: '0.25rem' }}>
              {member?.full_name || member?.name || user.email}
            </h2>
            <p style={{ color: '#475569', marginBottom: '1.5rem' }}>
              Department: {member?.department || 'General'} · Role: {member?.role || 'member'}
            </p>

            {isAdmin && (
              <div style={{ backgroundColor: '#eff6ff', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.75rem' }}>Admin Overview</h3>
                <div style={card}>
                  <p style={label}>Total members</p>
                  <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1e3a8a' }}>
                    {memberCount ?? '—'}
                  </p>
                </div>
              </div>
            )}

            <div style={{ backgroundColor: '#f1f5f9', padding: '1rem', borderRadius: '0.5rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>My Contributions &amp; Financial Records</h3>
              <div style={{ display: 'grid', gap: '0.75rem' }}>
                <div style={card}><p style={label}>Total Tithes</p><p style={{ fontSize: '1.125rem', fontWeight: 'bold', color: '#16a34a' }}>GHS 0.00</p></div>
                <div style={card}><p style={label}>Total Pledges</p><p style={{ fontSize: '1.125rem', fontWeight: 'bold', color: '#2563eb' }}>GHS 0.00</p></div>
                <div style={card}><p style={label}>Total Welfare</p><p style={{ fontSize: '1.125rem', fontWeight: 'bold', color: '#d97706' }}>GHS 0.00</p></div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
