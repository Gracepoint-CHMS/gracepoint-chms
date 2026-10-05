import Link from 'next/link';

export const metadata = {
  title: 'Gracepoint CHMS',
  description: 'Church Management System',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, fontFamily: 'sans-serif' }}>
        <header
          style={{
            backgroundColor: '#0070f3',
            padding: '12px 24px',
            display: 'flex',
            justify: 'space-between',
            alignItems: 'center',
            color: '#fff',
          }}
        >
          <h1 style={{ margin: 0, fontSize: '20px' }}>Gracepoint CHMS</h1>
          <nav style={{ display: 'flex', gap: '16px' }}>
            <Link href="/register" style={{ color: '#fff', textDecoration: 'none', fontWeight: 'bold' }}>
              Register
            </Link>
            <Link href="/dashboard" style={{ color: '#fff', textDecoration: 'none', fontWeight: 'bold' }}>
              Dashboard
            </Link>
          </nav>
        </header>

        <main>{children}</main>
      </body>
    </html>
  );
}
