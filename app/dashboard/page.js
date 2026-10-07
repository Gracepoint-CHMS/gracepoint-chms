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

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h3>Checking access permissions...</h3>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>
        Church Members Directory
      </h1>

      {/* 
         Here is the edit: A container with horizontal scrolling.
      */}
      <div style={{ overflowX: 'auto', width: '100%' }}>
        
        {/*
           Table must have a minWidth to enforce scrolling.
        */}
        <table style={{ minWidth: '850px', width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f3f4f6' }}>
              <th style={{ padding: '10px', textAlign: 'left' }}>Photo</th>
              <th style={{ padding: '10px', textAlign: 'left' }}>Name</th>
              <th style={{ padding: '10px', textAlign: 'left' }}>Email</th>
              <th style={{ padding: '10px', textAlign: 'left' }}>Phone</th>
              <th style={{ padding: '10px', textAlign: 'left' }}>Core Dept</th>
              <th style={{ padding: '10px', textAlign: 'left' }}>Sub Dept</th>
              <th style={{ padding: '10px', textAlign: 'left' }}>Role</th>
            </tr>
          </thead>
          <tbody>
            {members.map((m) => (
              <tr key={m.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                <td style={{ padding: '10px' }}>
                  {m.photo ? (
                    <img src={m.photo} alt={m.full_name} style={{ width: '40px', height: '40px', borderRadius: '50%' }} />
                  ) : (
                    '-'
                  )}
                </td>
                <td style={{ padding: '10px' }}>{m.prefix} {m.first_name} {m.last_name}</td>
                <td style={{ padding: '10px' }}>{m.email}</td>
                <td style={{ padding: '10px' }}>{m.phone}</td>
                <td style={{ padding: '10px' }}>{m.core_department}</td>
                <td style={{ padding: '10px' }}>{m.sub_department}</td>
                <td style={{ padding: '10px' }}>
                    <span style={{ textTransform: 'uppercase', fontSize: '12px', background: '#ddd', padding: '3px 6px', borderRadius: '4px'}}>
                        {m.role}
                    </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
