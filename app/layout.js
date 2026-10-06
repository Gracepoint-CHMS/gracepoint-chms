import Link from 'next/link';

export const metadata = {
  title: 'Gracepoint CHMS',
  description: 'Church Management System',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: 'sans-serif', backgroundColor: '#f7fafc' }}>
        <header style={{
          backgroundColor: '#0052cc',
          padding: '0.8rem 1rem',
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <Link href="/" style={{ color: '#ffffff', fontWeight: 'bold', fontSize: '1.1rem', textDecoration: 'none' }}>
            Gracepoint CHMS
          </Link>
          <nav style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
            <Link href="/register" style={{ color: '#ffffff', textDecoration: 'none', fontSize: '0.9rem' }}>
              Register
            </Link>
            <Link href="/login" style={{ color: '#ffffff', textDecoration: 'none', fontSize: '0.9rem' }}>
              Login
            </Link>
            <Link href="/dashboard" style={{ color: '#ffffff', textDecoration: 'none', fontSize: '0.9rem' }}>
              Dashboard
            </Link>
          </nav>
        </header>
        <main style={{ padding: '1rem' }}>
          {children}
        </main>
      </body>
    </html>
  );
}
