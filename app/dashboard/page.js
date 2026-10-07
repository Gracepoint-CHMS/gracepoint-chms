'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

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

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this member?')) return;

    const { error } = await supabase.from('members').delete().eq('id', id);
    if (error) {
      alert('Error deleting member: ' + error.message);
    } else {
      setMembers(members.filter((m) => m.id !== id));
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h3>Checking access permissions...</h3>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px' }}>
        Church Members Directory
      </h1>

      <div style={{ overflowX: 'auto', width: '100%', WebkitOverflowScrolling: 'touch' }}>
        <table style={{ minWidth: '950px', width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f3f4f6', textAlign: 'left' }}>
              <th style={{ padding: '12px 10px' }}>Photo</th>
              <th style={{ padding: '12px 10px' }}>Name</th>
              <th style={{ padding: '12px 10px' }}>Email</th>
              <th style={{ padding: '12px 10px' }}>Phone</th>
              <th style={{ padding: '12px 10px' }}>Core Dept</th>
              <th style={{ padding: '12px 10px' }}>Sub Dept</th>
              <th style={{ padding: '12px 10px' }}>Role</th>
              <th style={{ padding: '12px 10px', textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {members.map((m) => (
              <tr key={m.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                <td style={{ padding: '10px' }}>
                  {m.photo ? (
                    <img
                      src={m.photo}
                      alt={`${m.first_name || ''} ${m.last_name || ''}`}
                      style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
                    />
                  ) : (
                    <div
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        backgroundColor: '#e5e7eb',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '12px',
                        color: '#6b7280'
                      }}
                    >
                      N/A
                    </div>
                  )}
                </td>
                <td style={{ padding: '10px', fontWeight: '500' }}>
                  {`${m.prefix || ''} ${m.first_name || ''} ${m.last_name || ''}`.trim() || '—'}
                </td>
                <td style={{ padding: '10px' }}>{m.email || '—'}</td>
                <td style={{ padding: '10px' }}>{m.phone || '—'}</td>
                <td style={{ padding: '10px' }}>{m.core_department || '—'}</td>
                <td style={{ padding: '10px' }}>{m.sub_department || '—'}</td>
                <td style={{ padding: '10px' }}>
                  <span
                    style={{
                      textTransform: 'uppercase',
                      fontSize: '11px',
                      fontWeight: 'bold',
                      background: m.role === 'super_admin' ? '#e0e7ff' : '#f3f4f6',
                      color: m.role === 'super_admin' ? '#3730a3' : '#374151',
                      padding: '4px 8px',
                      borderRadius: '4px'
                    }}
                  >
                    {m.role}
                  </span>
                </td>
                <td style={{ padding: '10px', textAlign: 'center' }}>
                  <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                    <button
                      onClick={() => (window.location.href = `/dashboard/edit/${m.id}`)}
                      style={{
                        padding: '6px 12px',
                        backgroundColor: '#2563eb',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(m.id)}
                      style={{
                        padding: '6px 12px',
                        backgroundColor: '#dc2626',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
