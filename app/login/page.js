'use client';

import { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [member, setMember] = useState(null);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;

      // Fetch profile for logged in user
      const { data: memberData, error: memberError } = await supabase
        .from('members')
        .select('*')
        .eq('email', email)
        .single();

      if (memberError) throw memberError;

      setMember(memberData);
    } catch (err) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setMember(null);
  };

  return (
    <div style={{ maxWidth: '500px', margin: '3rem auto', padding: '2rem', background: '#fff', borderRadius: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
      {member ? (
        <div>
          <h2 style={{ textAlign: 'center', color: '#1a365d' }}>Member Portal</h2>
          <div style={{ textAlign: 'center', margin: '1.5rem 0' }}>
            {member.photo_url ? (
              <img src={member.photo_url} alt="Profile" style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover' }} />
            ) : (
              <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: '#cbd5e0', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>No Pic</div>
            )}
            <h3 style={{ marginTop: '0.8rem', color: '#2b6cb0' }}>{member.first_name} {member.last_name}</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', background: '#f7fafc', padding: '1rem', borderRadius: '6px' }}>
            <p><strong>Email:</strong> {member.email}</p>
            <p><strong>Phone:</strong> {member.phone}</p>
            <p><strong>Core Department:</strong> {member.core_department || 'None'}</p>
            <p><strong>Sub Department:</strong> {member.sub_department || 'None'}</p>
          </div>

          <button onClick={handleLogout} style={{ marginTop: '1.5rem', width: '100%', padding: '0.8rem', background: '#e53e3e', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
            Sign Out
          </button>
        </div>
      ) : (
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          <h2 style={{ textAlign: 'center', color: '#1a365d' }}>Member Login</h2>

          {error && (
            <div style={{ padding: '0.8rem', background: '#fed7d7', color: '#9b2c2c', borderRadius: '6px', textAlign: 'center', fontWeight: 'bold' }}>
              {error}
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.3rem' }}>Email Address</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" style={{ width: '100%', padding: '0.6rem', border: '1px solid #ccc', borderRadius: '4px' }} />
          </div>

          <div>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.3rem' }}>Password</label>
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter password" style={{ width: '100%', padding: '0.6rem', border: '1px solid #ccc', borderRadius: '4px' }} />
          </div>

          <button type="submit" disabled={loading} style={{ padding: '0.8rem', background: '#2b6cb0', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>
      )}
    </div>
  );
}
