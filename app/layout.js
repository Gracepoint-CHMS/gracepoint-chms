'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import './globals.css';

export default function RootLayout({ children }) {
  const [role, setRole] = useState(null);

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
    }
    checkUserSession();

    const link = document.createElement('link');
    link.rel = 'manifest';
    link.href = '/manifest.json';
    document.head.appendChild(link);

    const meta = document.createElement('meta');
    meta.name = 'theme-color';
    meta.content = '#2563eb';
    document.head.appendChild(meta);
  }, []);

  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
