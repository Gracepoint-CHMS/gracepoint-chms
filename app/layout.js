import Link from 'next/link';

export const metadata = {
  title: 'Gracepoint CHMS',
  description: 'Church Management System',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: 'system-ui, sans-serif', backgroundColor: '#f4f6f8' }}>
        <header style={{ background: '#0052cc', padding: '1rem 2rem', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ margin: 0, fontSize: '1.25rem' }}>Gracepoint CHMS</h1>
          <nav style={{ display: 'flex', gap: '1.2rem' }}>
            <Link href="/register" style={{ color: '#fff', textDecoration: 'none', fontWeight: 'bold' }}>Register</Link>
            <Link href="/login" style={{ color: '#fff', textDecoration: 'none', fontWeight: 'bold' }}>Login</Link>
            <Link href="/dashboard" style={{ color: '#fff', textDecoration: 'none', fontWeight: 'bold' }}>Dashboard</Link>
          </nav>
        </header>
        <main style={{ padding: '1rem' }}>{children}</main>
      </body>
    </html>
  );
}
