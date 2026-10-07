'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function DashboardPage() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function verifyAndFetch() {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        window.location.href = '/login';
        return;
      }

      const { data: member, error } = await supabase
        .from('members')
        .select('role')
        .eq('id', session.user.id)
        .single();

      if (error || (member?.role !== 'super_admin' && member?.role !== 'admin')) {
        window.location.href = '/portal';
        return;
      }

      const res = await fetch('/api/admin/members');
      const data = await res.json();
      if (data.members) setMembers(data.members);
      setLoading(false);
    }

    verifyAndFetch();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', fontFamily: 'sans-serif' }}>
        <h3>Checking access permissions...</h3>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>
        Church Members Directory
      </h1>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f3f4f6', textAlign: 'left' }}>
              <th style={{ padding: '10px' }}>Photo</th>
              <th style={{ padding: '10px' }}>Name</th>
              <th style={{ padding: '10px' }}>Email</th>
              <th style={{ padding: '10px' }}>Phone</th>
              <th style={{ padding: '10px' }}>Core Dept</th>
              <th style={{ padding: '10px' }}>Sub Dept</th>
              <th style={{ padding: '10px' }}>Role</th>
            </tr>
          </thead>
          <tbody>
            {members.map((m) => (
              <tr key={m.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                <td style={{ padding: '10px' }}>
                  {m.photo ? (
                    <img src={m.photo} alt={m.full_name} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
                  ) : (
                    '—'
                  )}
                </td>
                <td style={{ padding: '10px', fontWeight: '600' }}>{m.full_name}</td>
                <td style={{ padding: '10px' }}>{m.email}</td>
                <td style={{ padding: '10px' }}>{m.phone || '—'}</td>
                <td style={{ padding: '10px' }}>{m.core_dept || '—'}</td>
                <td style={{ padding: '10px' }}>{m.sub_dept || '—'}</td>
                <td style={{ padding: '10px' }}>{m.role}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
