'use client';

import { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const [formData, setFormData] = useState({
    title: 'Mr',
    fullName: '',
    gender: 'Male',
    dob: '',
    phone: '',
    email: '',
    address: '',
    maritalStatus: 'Single',
    emergencyContact: '',
    coreDept: '',
    subDept: '',
    photoUrl: '',
    password: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploadingPhoto(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `member-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('member-photos')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('member-photos')
        .getPublicUrl(filePath);

      setFormData((prev) => ({ ...prev, photoUrl: urlData.publicUrl }));
    } catch (err) {
      alert('Error uploading photo: ' + err.message);
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    const fullFormattedName = `${formData.title} ${formData.fullName}`.trim();

    try {
      // 1. Sign up user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: fullFormattedName,
          },
        },
      });

      if (authError) throw authError;

      const userId = authData.user?.id;

      // 2. Prepare payload matching database columns safely
      const memberPayload = {
        id: userId,
        full_name: fullFormattedName,
        email: formData.email,
        phone: formData.phone,
        gender: formData.gender,
        date_of_birth: formData.dob || null,
        address: formData.address,
        marital_status: formData.maritalStatus,
        emergency_contact: formData.emergencyContact,
        core_department: formData.coreDept,
        sub_department: formData.subDept,
        photo_url: formData.photoUrl,
        role: 'member',
      };

      const { error: dbError } = await supabase.from('members').insert([memberPayload]);

      if (dbError) {
        // Fallback check in case short column names (core_dept, sub_dept, name) are used
        const fallbackPayload = {
          id: userId,
          name: fullFormattedName,
          email: formData.email,
          phone: formData.phone,
          core_dept: formData.coreDept,
          sub_dept: formData.subDept,
          photo_url: formData.photoUrl,
          role: 'member',
        };
        const { error: fallbackError } = await supabase.from('members').insert([fallbackPayload]);
        if (fallbackError) throw dbError;
      }

      alert('Registration successful! You can now log in.');
      router.push('/login');
    } catch (err) {
      console.error('Registration error:', err);
      setErrorMsg(err.message || 'Failed to complete registration.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', padding: '2rem 1rem', fontFamily: 'sans-serif' }}>
      <div style={{ backgroundColor: '#fff', padding: '2rem', borderRadius: '12px', maxWidth: '640px', margin: '0 auto', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
        <h2 style={{ color: '#0f172a', marginTop: 0, textAlign: 'center', fontSize: '1.5rem' }}>Gracepoint CHMS - Registration</h2>
        <p style={{ textAlign: 'center', color: '#64748b', marginTop: '-0.5rem', marginBottom: '1.5rem', fontSize: '0.9rem' }}>Fill in your complete details to join the database</p>

        {errorMsg && (
          <div style={{ backgroundColor: '#f8d7da', color: '#842029', padding: '0.75rem', borderRadius: '6px', marginBottom: '1.25rem', fontSize: '0.9rem' }}>
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          {/* Photo Upload Section */}
          <div style={{ textAlign: 'center', padding: '1rem', backgroundColor: '#f1f5f9', borderRadius: '8px', border: '1px dashed #cbd5e1' }}>
            {formData.photoUrl ? (
              <img src={formData.photoUrl} alt="Preview" style={{ width: '90px', height: '90px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #0d6efd', margin: '0 auto 0.5rem auto' }} />
            ) : (
              <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.5rem auto', fontSize: '0.75rem', color: '#475569', fontWeight: 'bold' }}>
                No Photo
              </div>
            )}
            <label style={{ cursor: 'pointer', color: '#0d6efd', fontWeight: 'bold', fontSize: '0.85rem', display: 'inline-block' }}>
              {uploadingPhoto ? 'Uploading Profile Photo...' : 'Upload Profile Photo'}
              <input type="file" accept="image/*" onChange={handlePhotoUpload} disabled={uploadingPhoto} style={{ display: 'none' }} />
            </label>
          </div>

          {/* Name & Title */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '0.75rem' }}>
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#334155' }}>Title / Prefix</label>
              <select name="title" value={formData.title} onChange={handleChange} style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #cbd5e1', marginTop: '0.25rem' }}>
                <option value="Mr">Mr.</option>
                <option value="Mrs">Mrs.</option>
                <option value="Ms">Ms.</option>
                <option value="Prophet">Prophet</option>
                <option value="Pastor">Pastor</option>
                <option value="Apostle">Apostle</option>
                <option value="Evangelist">Evangelist</option>
                <option value="Deacon">Deacon</option>
                <option value="Deaconess">Deaconess</option>
                <option value="Elder">Elder</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#334155' }}>Full Name *</label>
              <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} required placeholder="e.g. Mathew Duut" style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #cbd5e1', marginTop: '0.25rem' }} />
            </div>
          </div>

          {/* Contact Details */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#334155' }}>Email Address *</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="name@domain.com" style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #cbd5e1', marginTop: '0.25rem' }} />
            </div>
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#334155' }}>Phone Number *</label>
              <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required placeholder="+233 24 000 0000" style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #cbd5e1', marginTop: '0.25rem' }} />
            </div>
          </div>

          {/* Demographics */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#334155' }}>Gender</label>
              <select name="gender" value={formData.gender} onChange={handleChange} style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #cbd5e1', marginTop: '0.25rem' }}>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#334155' }}>Date of Birth</label>
              <input type="date" name="dob" value={formData.dob} onChange={handleChange} style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #cbd5e1', marginTop: '0.25rem' }} />
            </div>
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#334155' }}>Marital Status</label>
              <select name="maritalStatus" value={formData.maritalStatus} onChange={handleChange} style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #cbd5e1', marginTop: '0.25rem' }}>
                <option value="Single">Single</option>
                <option value="Married">Married</option>
                <option value="Widowed">Widowed</option>
                <option value="Divorced">Divorced</option>
              </select>
            </div>
          </div>

          {/* Departments */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#334155' }}>Core Department</label>
              <input type="text" name="coreDept" value={formData.coreDept} onChange={handleChange} placeholder="e.g. CARE" style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #cbd5e1', marginTop: '0.25rem' }} />
            </div>
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#334155' }}>Sub Department</label>
              <input type="text" name="subDept" value={formData.subDept} onChange={handleChange} placeholder="e.g. Men Ministry" style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #cbd5e1', marginTop: '0.25rem' }} />
            </div>
          </div>

          {/* Address & Emergency Contact */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#334155' }}>Residential Address</label>
              <input type="text" name="address" value={formData.address} onChange={handleChange} placeholder="e.g. Techiman, Ghana" style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #cbd5e1', marginTop: '0.25rem' }} />
            </div>
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#334155' }}>Emergency Contact Phone</label>
              <input type="tel" name="emergencyContact" value={formData.emergencyContact} onChange={handleChange} placeholder="Relative / Contact person" style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #cbd5e1', marginTop: '0.25rem' }} />
            </div>
          </div>

          {/* Password */}
          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#334155' }}>Account Password *</label>
            <input type="password" name="password" value={formData.password} onChange={handleChange} required placeholder="••••••••" style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #cbd5e1', marginTop: '0.25rem' }} />
          </div>

          <button type="submit" disabled={loading || uploadingPhoto} style={{ backgroundColor: '#0d6efd', color: '#fff', border: 'none', padding: '0.85rem', borderRadius: '6px', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer', marginTop: '0.5rem' }}>
            {loading ? 'Submitting Registration...' : 'Complete Member Registration'}
          </button>
        </form>
      </div>
    </div>
  );
}
