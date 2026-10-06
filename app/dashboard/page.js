'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';

export default function DashboardPage() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('members')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMembers(data || []);
    } catch (err) {
      console.error('Error fetching members:', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '2rem auto', padding: '1rem' }}>
      <h2 style={{ textAlign: 'center', color: '#1a365d', marginBottom: '1.5rem' }}>
        Church Membership Dashboard
      </h2>

      {loading ? (
        <p style={{ textAlign: 'center' }}>Loading members...</p>
      ) : (
        <div style={{ overflowX: 'auto', background: '#fff', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#2b6cb0', color: '#fff' }}>
                <th style={{ padding: '12px' }}>Photo</th>
                <th style={{ padding: '12px' }}>Name</th>
                <th style={{ padding: '12px' }}>Phone</th>
                <th style={{ padding: '12px' }}>Core Dept</th>
                <th style={{ padding: '12px' }}>Sub Dept</th>
              </tr>
            </thead>
            <tbody>
              {members.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ padding: '16px', textAlign: 'center' }}>
                    No members registered yet.
                  </td>
                </tr>
              ) : (
                members.map((member) => (
                  <tr key={member.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '12px' }}>
                      {member.photo_url ? (
                        <img
                          src={member.photo_url}
                          alt="Passport"
                          style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
                        />
                      ) : (
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#cbd5e0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', color: '#4a5568' }}>
                          No Pic
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '12px', fontWeight: 'bold' }}>
                      {member.first_name} {member.last_name}
                    </td>
                    <td style={{ padding: '12px' }}>{member.phone}</td>
                    <td style={{ padding: '12px', color: '#2b6cb0', fontWeight: 'bold' }}>
                      {member.core_department || '-'}
                    </td>
                    <td style={{ padding: '12px' }}>{member.sub_department || '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
