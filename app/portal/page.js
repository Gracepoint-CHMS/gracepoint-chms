'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

export default function MemberPortalPage() {
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMemberData() {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        window.location.href = '/login';
        return;
      }

      const { data, error } = await supabase
        .from('members')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (error) {
        console.error('Error fetching member portal data:', error);
      } else {
        setMember(data);
      }
      setLoading(false);
    }

    fetchMemberData();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', fontFamily: 'sans-serif' }}>
        <h3>Loading your member profile...</h3>
      </div>
    );
  }

  if (!member) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', fontFamily: 'sans-serif' }}>
        <p>Member profile not found.</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '600px', margin: '40px auto', padding: '20px', fontFamily: 'sans-serif' }}>
      <div style={{ border: '1px solid #e5e7eb', borderRadius: '12px', padding: '24px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '24px' }}>
          {member.photo ? (
            <img
              src={member.photo}
              alt={member.full_name}
              style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover' }}
            />
          ) : (
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#2563eb', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: 'bold' }}>
              {member.full_name ? member.full_name.charAt(0) : 'M'}
            </div>
          )}
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: 'bold', margin: 0 }}>
              {member.prefix ? `${member.prefix} ` : ''}{member.full_name}
            </h1>
            <p style={{ color: '#6b7280', margin: '4px 0 0 0' }}>{member.email}</p>
            <span style={{ display: 'inline-block', marginTop: '6px', padding: '2px 8px', backgroundColor: '#e0e7ff', color: '#3730a3', borderRadius: '4px', fontSize: '12px', fontWeight: '600' }}>
              Role: {member.role || 'member'}
            </span>
          </div>
        </div>

        <hr style={{ border: 'none', borderTop: '1px solid #e5e7eb', margin: '20px 0' }} />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <strong style={{ display: 'block', fontSize: '12px', color: '#6b7280', textTransform: 'uppercase' }}>Phone</strong>
            <span style={{ fontSize: '15px' }}>{member.phone || 'N/A'}</span>
          </div>
          <div>
            <strong style={{ display: 'block', fontSize: '12px', color: '#6b7280', textTransform: 'uppercase' }}>Gender</strong>
            <span style={{ fontSize: '15px' }}>{member.gender || 'N/A'}</span>
          </div>
          <div>
            <strong style={{ display: 'block', fontSize: '12px', color: '#6b7280', textTransform: 'uppercase' }}>Core Department</strong>
            <span style={{ fontSize: '15px' }}>{member.core_dept || '—'}</span>
          </div>
          <div>
            <strong style={{ display: 'block', fontSize: '12px', color: '#6b7280', textTransform: 'uppercase' }}>Sub Department</strong>
            <span style={{ fontSize: '15px' }}>{member.sub_dept || '—'}</span>
          </div>
          <div>
            <strong style={{ display: 'block', fontSize: '12px', color: '#6b7280', textTransform: 'uppercase' }}>Marital Status</strong>
            <span style={{ fontSize: '15px' }}>{member.marital_status || 'N/A'}</span>
          </div>
          <div>
            <strong style={{ display: 'block', fontSize: '12px', color: '#6b7280', textTransform: 'uppercase' }}>Date Joined</strong>
            <span style={{ fontSize: '15px' }}>{member.date_joined || 'N/A'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
