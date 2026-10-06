'use client';

import { useState, useEffect } from 'react';

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

export default function AdminDashboard() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingMember, setEditingMember] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    core_dept: '',
    sub_dept: '',
    role: 'member',
    photo_url: '',
  });

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('members').select('*').order('name');
      if (!error && data) {
        setMembers(data);
      }
    } catch (err) {
      console.error('Error fetching members:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (member) => {
    setEditingMember(member);
    setFormData({
      name: member.name || '',
      phone: member.phone || '',
      email: member.email || '',
      core_dept: member.core_dept || '',
      sub_dept: member.sub_dept || '',
      role: member.role || 'member',
      photo_url: member.photo_url || '',
    });
  };

  const handleAdminPhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `admin-upload-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      setFormData((prev) => ({ ...prev, photo_url: urlData.publicUrl }));
    } catch (err) {
      alert('Error uploading photo: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSaveMember = async (e) => {
    e.preventDefault();
    if (!editingMember) return;

    try {
      const { error } = await supabase
        .from('members')
        .update({
          name: formData.name,
          phone: formData.phone,
          email: formData.email,
          core_dept: formData.core_dept,
          sub_dept: formData.sub_dept,
          role: formData.role,
          photo_url: formData.photo_url,
        })
        .eq('id', editingMember.id);

      if (error) {
        alert('Failed to update member: ' + error.message);
      } else {
        alert('Member updated successfully!');
        setEditingMember(null);
        fetchMembers();
      }
    } catch (err) {
      alert('Error updating record: ' + err.message);
    }
  };

  const handleDeleteMember = async (id) => {
    if (!confirm('Are you sure you want to delete this member?')) return;
    const { error } = await supabase.from('members').delete().eq('id', id);
    if (!error) fetchMembers();
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading dashboard...</div>;
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: 'sans-serif' }}>
      {/* Header Navigation */}
      <nav style={{ backgroundColor: '#0d6efd', padding: '1rem 2rem', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: '1.25rem', margin: 0 }}>Gracepoint CHMS - Admin Dashboard</h1>
        <button 
          onClick={handleSignOut} 
          style={{ background: 'transparent', border: '1px solid #fff', color: '#fff', padding: '0.4rem 0.8rem', borderRadius: '4px', cursor: 'pointer' }}
        >
          Sign Out
        </button>
      </nav>

      <div style={{ padding: '1.5rem', maxWidth: '1200px', margin: '0 auto' }}>
        <h2 style={{ color: '#0f172a', marginBottom: '1rem' }}>Church Members Directory</h2>

        {/* Members Table */}
        <div style={{ overflowX: 'auto', backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '2px solid #e2e8f0', color: '#334155' }}>
                <th style={{ padding: '0.75rem' }}>Photo</th>
                <th style={{ padding: '0.75rem' }}>Name</th>
                <th style={{ padding: '0.75rem' }}>Email</th>
                <th style={{ padding: '0.75rem' }}>Phone</th>
                <th style={{ padding: '0.75rem' }}>Core Dept</th>
                <th style={{ padding: '0.75rem' }}>Sub Dept</th>
                <th style={{ padding: '0.75rem' }}>Role</th>
                <th style={{ padding: '0.75rem' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {members.map((member) => (
                <tr key={member.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '0.75rem' }}>
                    {member.photo_url ? (
                      <img src={member.photo_url} alt={member.name} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', color: '#475569', fontWeight: 'bold' }}>
                        No Pic
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '0.75rem', fontWeight: 'bold', color: '#0f172a' }}>{member.name}</td>
                  <td style={{ padding: '0.75rem', color: '#475569' }}>{member.email}</td>
                  <td style={{ padding: '0.75rem' }}>{member.phone || 'N/A'}</td>
                  <td style={{ padding: '0.75rem', color: '#0d6efd', fontWeight: '600' }}>{member.core_dept || 'N/A'}</td>
                  <td style={{ padding: '0.75rem' }}>{member.sub_dept || 'N/A'}</td>
                  <td style={{ padding: '0.75rem' }}>
                    <span style={{ backgroundColor: '#e2e8f0', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.85rem', textTransform: 'capitalize' }}>
                      {member.role || 'member'}
                    </span>
                  </td>
                  <td style={{ padding: '0.75rem' }}>
                    <button onClick={() => handleEditClick(member)} style={{ backgroundColor: '#0d6efd', color: '#fff', border: 'none', padding: '0.35rem 0.7rem', borderRadius: '4px', cursor: 'pointer', marginRight: '0.4rem', fontSize: '0.85rem' }}>
                      Edit
                    </button>
                    <button onClick={() => handleDeleteMember(member.id)} style={{ backgroundColor: '#dc3545', color: '#fff', border: 'none', padding: '0.35rem 0.7rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem' }}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Admin Edit Modal */}
      {editingMember && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: '#fff', padding: '1.5rem', borderRadius: '8px', width: '90%', maxWidth: '480px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
            <h3 style={{ marginTop: 0, color: '#0f172a' }}>Edit Member Details & Photo</h3>
            <form onSubmit={handleSaveMember} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem' }}>
              
              {/* Photo Upload Box */}
              <div style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
                {formData.photo_url ? (
                  <img src={formData.photo_url} alt="Preview" style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #0d6efd', margin: '0 auto 0.5rem auto' }} />
                ) : (
                  <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.5rem auto', fontSize: '0.75rem', color: '#475569', fontWeight: 'bold' }}>
                    No Pic
                  </div>
                )}
                <label style={{ cursor: 'pointer', color: '#0d6efd', fontWeight: 'bold', fontSize: '0.85rem', display: 'inline-block' }}>
                  {uploading ? 'Uploading Photo...' : 'Upload / Change Photo'}
                  <input type="file" accept="image/*" onChange={handleAdminPhotoUpload} disabled={uploading} style={{ display: 'none' }} />
                </label>
              </div>

              <input type="text" placeholder="Full Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }} />
              <input type="text" placeholder="Phone Number" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }} />
              <input type="email" placeholder="Email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }} />
              <input type="text" placeholder="Core Department" value={formData.core_dept} onChange={(e) => setFormData({ ...formData, core_dept: e.target.value })} style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }} />
              <input type="text" placeholder="Sub Department" value={formData.sub_dept} onChange={(e) => setFormData({ ...formData, sub_dept: e.target.value })} style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }} />
              
              <select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })} style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}>
                <option value="member">Member</option>
                <option value="sub_admin">Sub Admin</option>
                <option value="super_admin">Super Admin</option>
              </select>

              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                <button type="submit" disabled={uploading} style={{ flex: 1, backgroundColor: '#198754', color: '#fff', border: 'none', padding: '0.65rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                  Save Changes
                </button>
                <button type="button" onClick={() => setEditingMember(null)} style={{ flex: 1, backgroundColor: '#6c757d', color: '#fff', border: 'none', padding: '0.65rem', borderRadius: '4px', cursor: 'pointer' }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
