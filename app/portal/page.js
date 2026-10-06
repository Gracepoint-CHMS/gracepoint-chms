'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';

export default function MemberPortal() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase.from('members').select('*').eq('email', user.email).single();
      if (data) setProfile(data);
    }
    setLoading(false);
  };

  const detailBoxStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '0.6rem 0',
    borderBottom: '1px solid #edf2f7',
    fontSize: '0.9rem',
  };

  if (loading) return <p style={{ textAlign: 'center', marginTop: '2rem' }}>Loading portal profile...</p>;

  return (
    <div style={{ maxWidth: '500px', margin: '1.5rem auto', padding: '1.2rem', background: '#fff', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
      <h2 style={{ textAlign: 'center', color: '#1a365d', marginBottom: '1rem' }}>Member Portal</h2>

      {profile ? (
        <div>
          <div style={{ textAlign: 'center', marginBottom: '1.2rem' }}>
            {profile.photo_url ? (
              <img src={profile.photo_url} alt="Profile" style={{ width: '90px', height: '90px', borderRadius: '50%', objectFit: 'cover' }} />
            ) : (
              <div style={{ width: '90px', height: '90px', borderRadius: '50%', backgroundColor: '#cbd5e0', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>No Pic</div>
            )}
            <h3 style={{ margin: '0.5rem 0 0.2rem', color: '#2b6cb0' }}>{profile.first_name} {profile.last_name}</h3>
            <span style={{ fontSize: '0.8rem', padding: '0.2rem 0.6rem', borderRadius: '4px', background: '#ebf8ff', color: '#2b6cb0', fontWeight: 'bold' }}>
              {profile.role || 'member'}
            </span>
          </div>

          <div style={{ background: '#f7fafc', padding: '1rem', borderRadius: '6px' }}>
            <div style={detailBoxStyle}><strong>Email:</strong> <span>{profile.email}</span></div>
            <div style={detailBoxStyle}><strong>Phone:</strong> <span>{profile.phone}</span></div>
            <div style={detailBoxStyle}><strong>Gender:</strong> <span>{profile.gender || '-'}</span></div>
            <div style={detailBoxStyle}><strong>Date of Birth:</strong> <span>{profile.date_of_birth || '-'}</span></div>
            <div style={detailBoxStyle}><strong>Marital Status:</strong> <span>{profile.marital_status || '-'}</span></div>
            <div style={detailBoxStyle}><strong>Hometown:</strong> <span>{profile.hometown || '-'}</span></div>
            <div style={detailBoxStyle}><strong>Home Address:</strong> <span>{profile.home_address || '-'}</span></div>
            <div style={detailBoxStyle}><strong>Core Dept:</strong> <span>{profile.core_department}</span></div>
            <div style={detailBoxStyle}><strong>Sub Dept:</strong> <span>{profile.sub_department || '-'}</span></div>
            <div style={detailBoxStyle}><strong>Date Joined:</strong> <span>{profile.date_joined || '-'}</span></div>
            <div style={detailBoxStyle}><strong>Date of Baptism:</strong> <span>{profile.date_of_baptism || '-'}</span></div>
            <div style={detailBoxStyle}><strong>Emergency Contact:</strong> <span>{profile.emergency_name ? `${profile.emergency_name} (${profile.emergency_phone || ''})` : '-'}</span></div>
          </div>

          <button onClick={() => supabase.auth.signOut().then(() => window.location.href = '/login')} style={{ marginTop: '1.2rem', width: '100%', padding: '0.7rem', background: '#e53e3e', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
            Sign Out
          </button>
        </div>
      ) : (
        <p style={{ textAlign: 'center', color: '#718096' }}>No active member profile found. Please log in.</p>
      )}
    </div>
  );
}
