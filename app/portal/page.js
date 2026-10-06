'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

// Safe relative import to prevent Vercel module resolution errors
let supabase;
try {
  supabase = require('../../lib/supabaseClient').supabase;
} catch (e1) {
  try {
    supabase = require('../../lib/supabase').supabase;
  } catch (e2) {
    supabase = require('@/lib/supabaseClient').supabase;
  }
}

export default function MemberPortalPage() {
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchMemberProfile();
  }, []);

  const fetchMemberProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from('members')
          .select('*')
          .eq('email', user.email)
          .single();

        if (data) setMember(data);
      }
    } catch (err) {
      console.error('Error fetching member profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = async (e) => {
    try {
      const file = e.target.files[0];
      if (!file) return;

      setUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${member.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const publicUrl = urlData.publicUrl;

      const { error: updateError } = await supabase
        .from('members')
        .update({ photo_url: publicUrl })
        .eq('id', member.id);

      if (updateError) throw updateError;

      setMember((prev) => ({ ...prev, photo_url: publicUrl }));
      alert('Profile photo updated successfully!');
    } catch (err) {
      alert('Error uploading photo: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading profile...</div>;
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f4f6f9', fontFamily: 'sans-serif' }}>
      {/* Top Header Navigation */}
      <nav style={{ backgroundColor: '#0d6efd', padding: '1rem 2rem', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: '1.2rem', margin: 0 }}>Gracepoint CHMS</h1>
        <div>
          <Link href="/dashboard" style={{ color: '#fff', marginRight: '1rem', textDecoration: 'none', fontWeight: 'bold' }}>
            Dashboard
          </Link>
          <button 
            onClick={handleSignOut} 
            style={{ background: 'transparent', border: '1px solid #fff', color: '#fff', padding: '0.3rem 0.8rem', borderRadius: '4px', cursor: 'pointer' }}
          >
            Sign Out
          </button>
        </div>
      </nav>

      {/* Member Profile Card */}
      <div style={{ maxWidth: '420px', margin: '2rem auto', padding: '1.5rem', backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', textAlign: 'center' }}>
        <h2 style={{ color: '#1a365d', marginBottom: '1.5rem' }}>Member Portal</h2>

        {/* Profile Photo Display & Upload Controls */}
        <div style={{ position: 'relative', width: '110px', height: '110px', margin: '0 auto 1rem auto' }}>
          {member?.photo_url ? (
            <img 
              src={member.photo_url} 
              alt={member?.name || 'Member Photo'} 
              style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #0d6efd', margin: '0 auto' }} 
            />
          ) : (
            <div style={{ width: '100px', height: '100px', borderRadius: '50%', backgroundColor: '#cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#334155', fontWeight: 'bold', margin: '0 auto' }}>
              No Pic
            </div>
          )}

          <label style={{ display: 'block', marginTop: '0.5rem', fontSize: '0.8rem', color: '#0d6efd', cursor: 'pointer', fontWeight: 'bold' }}>
            {uploading ? 'Uploading...' : 'Change Photo'}
            <input type="file" accept="image/*" onChange={handlePhotoUpload} disabled={uploading} style={{ display: 'none' }} />
          </label>
        </div>

        <h3 style={{ color: '#0f172a', marginBottom: '1.2rem', marginTop: '0.5rem' }}>{member?.name || 'Member'}</h3>

        {/* Member Profile Details */}
        <div style={{ backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '6px', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.95rem' }}>
          <div><strong>Email:</strong> {member?.email}</div>
          <div><strong>Phone:</strong> {member?.phone || 'N/A'}</div>
          <div><strong>Core Department:</strong> {member?.core_dept || 'N/A'}</div>
          <div><strong>Sub Department:</strong> {member?.sub_dept || 'N/A'}</div>
          <div><strong>Role:</strong> <span style={{ textTransform: 'capitalize', fontWeight: 'bold', color: '#0d6efd' }}>{member?.role || 'member'}</span></div>
        </div>

        {/* Sign Out Button */}
        <button 
          onClick={handleSignOut} 
          style={{ width: '100%', backgroundColor: '#dc3545', color: '#fff', border: 'none', padding: '0.75rem', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', marginTop: '1.5rem' }}
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}
