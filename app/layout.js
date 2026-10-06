'use client';

import Link from 'next/link';

export default function Navbar() {
  return (
    <nav style={{
      backgroundColor: '#1a365d',
      padding: '0.8rem 1rem',
      display: 'flex',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: '0.5rem'
    }}>
      <Link href="/" style={{
        color: '#ffffff',
        fontWeight: 'bold',
        fontSize: '1.1rem',
        textDecoration: 'none'
      }}>
        Gracepoint CHMS
      </Link>
      <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
        <Link href="/register" style={{ color: '#edf2f7', textDecoration: 'none', fontSize: '0.9rem' }}>
          Register
        </Link>
        <Link href="/login" style={{ color: '#edf2f7', textDecoration: 'none', fontSize: '0.9rem' }}>
          Login
        </Link>
        <Link href="/dashboard" style={{ color: '#edf2f7', textDecoration: 'none', fontSize: '0.9rem' }}>
          Dashboard
        </Link>
      </div>
    </nav>
  );
}
