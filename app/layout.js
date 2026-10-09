'use client';

import './globals.css';
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

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

    // Dynamically inject the PWA manifest
    const link = document.createElement('link');
    link.rel = 'manifest';
    link.href = '/manifest.json';
    document.head.appendChild(link);

    const meta = document.createElement('meta');
    meta.name = 'theme-color';
    meta.content = '#2563eb';
    document.head.appendChild(meta);

    // Register the Service Worker for native PWA installation
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js', { scope: '/' })
          .then((reg) => console.log('Service Worker scope:', reg.scope))
          .catch((err) => console.log('Service Worker registration failed:', err));
      });
    }
  }, []);

  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
