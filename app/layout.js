'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export default function RootLayout({ children }) {
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkUserSession() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data } = await supabase
          .from('members')
          .select('role')
          .eq('id', session.user.id)
          .single();
        setRole(data?.role || 'member');
      } else {
        setRole(null);
      }
      setLoading(false);
    }

    checkUserSession();

    // Listen for auth state changes (login / logout)
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        supabase
          .from('members')
          .select('role')
          .eq('id', session.user.id)
          .single()
          .then(({ data }) => setRole(data?.role || 'member'));
      } else {
        setRole(null);
      }
    });

    return () => authListener.subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setRole(null);
    window.location.href = '/login';
  };

  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: 'sans-serif' }}>
        <nav style={{ backgroundColor: '#1d4ed8', color: '#fff', padding: '12px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: 'bold', fontSize: '18px' }}>Gracepoint CHMS</span>
          <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
            <Link href="/register" style={{ color: '#fff', textDecoration: 'none' }}>Register</Link>
            
            {!role ? (
              <Link href="/login" style={{ color: '#fff', textDecoration: 'none' }}>Login</Link>
            ) : (
              <>
                {role === 'member' && (
                  <Link href="/portal" style={{ color: '#fff', textDecoration: 'none' }}>My Portal</Link>
                )}
                {(role === 'super_admin' || role === 'admin') && (
                  <Link href="/dashboard" style={{ color: '#fff', textDecoration: 'none' }}>Dashboard</Link>
                )}
                <button 
                  onClick={handleLogout}
                  style={{ background: 'none', border: '1px solid #fff', color: '#fff', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer' }}
                >
                  Logout
                </button>
              </>
            )}
          </div>
        </nav>
        <main>{children}</main>
      </body>
    </html>
  );
}
