'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { supabase } from '../../../../lib/supabase';

export default function EditMemberPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id;

  const [form, setForm] = useState({
    prefix: '',
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    core_department: '',
    sub_department: '',
    role: 'member',
    photo_url: ''
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    async function fetchMember() {
      if (!id) return;

      const { data, error } = await supabase
        .from('members')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        alert('Error fetching member details: ' + error.message);
        router.push('/dashboard');
        return;
      }

      if (data) {
        setForm({
          prefix: data.prefix || '',
          first_name: data.first_name || '',
          last_name: data.last_name || '',
          email: data.email || '',
          phone: data.phone || '',
          core_department: data.core_department || '',
          sub_department: data.sub_department || '',
          role: data.role || 'member',
          photo_url: data.photo_url || ''
        });
      }
      setLoading(false);
    }

    fetchMember();
  }, [id, router]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `${id}-${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('member-photos')
      .upload(fileName, file, { upsert: true });

    if (uploadError) {
      alert('Photo upload failed: ' + uploadError.message);
      setUploading(false);
      return;
    }

    const { data: publicUrlData } = supabase.storage
      .from('member-photos')
      .getPublicUrl(fileName);

    setForm((prev) => ({ ...prev, photo_url: publicUrlData.publicUrl }));
    setUploading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    const { error } = await supabase
      .from('members')
      .update(form)
      .eq('id', id);

    setSaving(false);

    if (error) {
      alert('Failed to update member: ' + error.message);
    } else {
      alert('Member updated successfully!');
      router.push('/dashboard');
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <p>Loading member details...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <button
        onClick={() => router.push('/dashboard')}
        style={{
          marginBottom: '20px',
          padding: '8px 16px',
          backgroundColor: '#6b7280',
          color: '#fff',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        ← Back to Dashboard
      </button>

      <h1 style={{ fontSize: '22px', fontWeight: 'bold', marginBottom: '20px' }}>
        Edit Member Details
      </h1>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {/* Photo Display & Upload Section */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '10px' }}>
          <div style={{
            width: '70px',
            height: '70px',
            borderRadius: '50%',
            backgroundColor: '#e5e7eb',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid #ccc'
          }}>
            {form.photo_url ? (
              <img
                src={form.photo_url}
                alt="Profile"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <span style={{ color: '#6b7280', fontSize: '11px', textAlign: 'center' }}>No Photo</span>
            )}
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '14px', marginBottom: '4px', fontWeight: 'bold' }}>
              Profile Photo
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              disabled={uploading}
              style={{ fontSize: '13px' }}
            />
            {uploading && <p style={{ fontSize: '12px', color: '#2563eb' }}>Uploading photo...</p>}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <div style={{ flex: '1' }}>
            <label style={{ display: 'block', fontSize: '14px', marginBottom: '4px' }}>Prefix</label>
            <input
              type="text"
              name="prefix"
              value={form.prefix}
              onChange={handleChange}
              style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
            />
          </div>
          <div style={{ flex: '2' }}>
            <label style={{ display: 'block', fontSize: '14px', marginBottom: '4px' }}>First Name</label>
            <input
              type="text"
              name="first_name"
              value={form.first_name}
              onChange={handleChange}
              required
              style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
            />
          </div>
          <div style={{ flex: '2' }}>
            <label style={{ display: 'block', fontSize: '14px', marginBottom: '4px' }}>Last Name</label>
            <input
              type="text"
              name="last_name"
              value={form.last_name}
              onChange={handleChange}
              required
              style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
            />
          </div>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '14px', marginBottom: '4px' }}>Email</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '14px', marginBottom: '4px' }}>Phone Number</label>
          <input
            type="text"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <div style={{ flex: '1' }}>
            <label style={{ display: 'block', fontSize: '14px', marginBottom: '4px' }}>Core Department</label>
            <input
              type="text"
              name="core_department"
              value={form.core_department}
              onChange={handleChange}
              style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
            />
          </div>
          <div style={{ flex: '1' }}>
            <label style={{ display: 'block', fontSize: '14px', marginBottom: '4px' }}>Sub Department</label>
            <input
              type="text"
              name="sub_department"
              value={form.sub_department}
              onChange={handleChange}
              style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
            />
          </div>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '14px', marginBottom: '4px' }}>Role</label>
          <select
            name="role"
            value={form.role}
            onChange={handleChange}
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          >
            <option value="member">Member</option>
            <option value="admin">Admin</option>
            <option value="super_admin">Super Admin</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={saving || uploading}
          style={{
            marginTop: '10px',
            padding: '10px',
            backgroundColor: saving || uploading ? '#9ca3af' : '#2563eb',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            fontWeight: 'bold',
            cursor: saving || uploading ? 'not-allowed' : 'pointer'
          }}
        >
          {saving ? 'Saving...' : 'Update Member'}
        </button>
      </form>
    </div>
  );
}
