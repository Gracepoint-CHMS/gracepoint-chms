'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export default function RootLayout({ children }) {
  const [role, setRole] = useState(null);

  useEffect(() => {
    async function getUserRole() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data } = await supabase
          .from('members')
          .select('role')
          .eq('id', session.user.id)
          .single();
        setRole(data?.role || 'member');
      }
    }
    getUserRole();
  }, []);

  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: 'sans-serif' }}>
        <nav style={{ backgroundColor: '#1d4ed8', color: '#fff', padding: '12px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: 'bold', fontSize: '18px' }}>Gracepoint CHMS</span>
          <div style={{ display: 'flex', gap: '15px' }}>
            <Link href="/register" style={{ color: '#fff', textDecoration: 'none' }}>Register</Link>
            <Link href="/login" style={{ color: '#fff', textDecoration: 'none' }}>Login</Link>
            {role === 'member' && (
              <Link href="/portal" style={{ color: '#fff', textDecoration: 'none' }}>My Portal</Link>
            )}
            {(role === 'super_admin' || role === 'admin') && (
              <Link href="/dashboard" style={{ color: '#fff', textDecoration: 'none' }}>Dashboard</Link>
            )}
          </div>
        </nav>
        <main>{children}</main>
      </body>
    </html>
  );
}
