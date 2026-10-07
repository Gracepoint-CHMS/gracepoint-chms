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
        .maybeSingle();

      if (error) {
        console.error('Error fetching member profile:', error.message);
      } else {
        setMember(data);
      }
      setLoading(false);
    }

    fetchMemberData();
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem', fontFamily: 'sans-serif' }}>
        Loading profile...
      </div>
    );
  }

  if (!member) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem', fontFamily: 'sans-serif' }}>
        <p style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>Member profile not found.</p>
        <p style={{ color: '#666', fontSize: '0.9rem' }}>
          Please make sure your registration was completed or contact the admin.
        </p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '500px', margin: '2rem auto', padding: '1.5rem', fontFamily: 'sans-serif', border: '1px solid #e5e7eb', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
      <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        {member.photo_url ? (
          <img
            src={member.photo_url}
            alt="Profile Photo"
            style={{ width: '110px', height: '110px', borderRadius: '50%', objectFit: 'cover', marginBottom: '1rem', border: '2px solid #2563eb' }}
          />
        ) : (
          <div
            style={{
              width: '100px',
              height: '100px',
              borderRadius: '50%',
              backgroundColor: '#e5e7eb',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem',
              color: '#6b7280',
              fontWeight: 'bold'
            }}
          >
            No Photo
          </div>
        )}
        <h2 style={{ margin: '0', fontSize: '1.4rem', color: '#111827' }}>
          {member.prefix || ''} {member.first_name} {member.last_name}
        </h2>
        <p style={{ margin: '0.25rem 0 0', color: '#6b7280', fontSize: '0.9rem' }}>{member.email}</p>
      </div>

      <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.95rem' }}>
        <p><strong>Phone:</strong> {member.phone || 'N/A'}</p>
        <p><strong>Address:</strong> {member.address || 'N/A'}</p>
        <p><strong>Hometown:</strong> {member.hometown || 'N/A'}</p>
        <p><strong>Core Department:</strong> {member.core_dept || 'N/A'}</p>
        <p><strong>Sub Department(s):</strong> {member.sub_dept || 'N/A'}</p>
        <p><strong>Emergency Contact Person:</strong> {member.emergency_contact_person || 'N/A'}</p>
        <p><strong>Emergency Contact Phone:</strong> {member.emergency_contact || 'N/A'}</p>
      </div>
    </div>
  );
}
