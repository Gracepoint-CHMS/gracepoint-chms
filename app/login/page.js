'use client';

import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // 1. Sign in with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;

      const userId = authData.user.id;

      // 2. Fetch the user's role from the members table
      const { data: memberData, error: memberError } = await supabase
        .from('members')
        .select('role')
        .eq('id', userId)
        .single();

      if (memberError && memberError.code !== 'PGRST116') {
        console.error('Error fetching member role:', memberError);
      }

      const role = memberData?.role || 'member';

      // 3. Route user based on their assigned role
      if (role === 'super_admin' || role === 'admin') {
        router.push('/dashboard');
      } else {
        router.push('/portal');
      }
    } catch (err) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '400px', margin: '40px auto', fontFamily: 'sans-serif' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px', textAlign: 'center' }}>
        Login to CHMS
      </h1>

      {error && (
        <div style={{ padding: '10px', backgroundColor: '#fee2e2', color: '#dc2626', borderRadius: '6px', fontSize: '14px', marginBottom: '16px' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', marginBottom: '6px' }}>
            Email Address
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc', boxSizing: 'border-box' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', marginBottom: '6px' }}>
            Password
          </label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc', boxSizing: 'border-box' }}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            backgroundColor: '#2563eb',
            color: '#ffffff',
            padding: '12px',
            borderRadius: '6px',
            border: 'none',
            fontWeight: 'bold',
            cursor: 'pointer',
          }}
        >
          {loading ? 'Signing in...' : 'Login'}
        </button>
      </form>
    </div>
  );
}
