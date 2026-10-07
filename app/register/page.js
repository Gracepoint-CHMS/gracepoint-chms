'use client';

import { useState } from 'react';
import { supabase } from '../../lib/supabase';

const SUB_DEPTS_LIST = [
  'General Assembly',
  'Choir/Music department',
  'Pastoral ministry',
  'Ushering department',
  'Women ministry',
  'Men Ministry',
  'Evangelical department',
  'Children ministry',
  'Prayer Warriors',
];

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    prefix: '',
    phone: '',
    address: '',
    hometown: '',
    emergency_contact_person: '',
    emergency_contact: '',
    gender: '',
    marital_status: '',
    dob: '',
    date_joined: '',
    date_of_baptism: '',
    core_dept: '',
  });

  const [selectedSubDepts, setSelectedSubDepts] = useState([]);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [subDeptError, setSubDeptError] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubDeptCheckbox = (deptName) => {
    if (selectedSubDepts.includes(deptName)) {
      setSelectedSubDepts(selectedSubDepts.filter((item) => item !== deptName));
    } else {
      setSelectedSubDepts([...selectedSubDepts, deptName]);
    }
    if (subDeptError) setSubDeptError('');
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (selectedSubDepts.length === 0) {
      setSubDeptError('Please select at least one sub-department.');
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      // 1. Sign up user in Supabase Auth
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      });

      if (signUpError) throw signUpError;

      if (data?.user) {
        let avatarUrl = null;

        // 2. Upload Profile Photo if provided
        if (photoFile) {
          const fileExt = photoFile.name.split('.').pop();
          const fileName = `${data.user.id}-${Date.now()}.${fileExt}`;
          const filePath = `avatars/${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from('member-photos')
            .upload(filePath, photoFile);

          if (!uploadError) {
            const { data: publicUrlData } = supabase.storage
              .from('member-photos')
              .getPublicUrl(filePath);
            avatarUrl = publicUrlData.publicUrl;
          }
        }

        // 3. Insert member profile details into public.members table
        const { error: profileError } = await supabase.from('members').insert([
          {
            id: data.user.id,
            email: formData.email,
            first_name: formData.first_name.trim(),
            last_name: formData.last_name.trim(),
            prefix: formData.prefix,
            phone: formData.phone,
            address: formData.address,
            hometown: formData.hometown,
            emergency_contact_person: formData.emergency_contact_person,
            emergency_contact: formData.emergency_contact,
            gender: formData.gender,
            marital_status: formData.marital_status,
            dob: formData.dob || null,
            date_joined: formData.date_joined || null,
            date_of_baptism: formData.date_of_baptism || null,
            core_dept: formData.core_dept,
            sub_dept: selectedSubDepts.join(', '),
            photo_url: avatarUrl,
            role: 'member',
          },
        ]);

        if (profileError) throw profileError;

        setMessage({
          type: 'success',
          text: 'Registration successful! You can now log in.',
        });

        // Clear form
        setFormData({
          email: '',
          password: '',
          first_name: '',
          last_name: '',
          prefix: '',
          phone: '',
          address: '',
          hometown: '',
          emergency_contact_person: '',
          emergency_contact: '',
          gender: '',
          marital_status: '',
          dob: '',
          date_joined: '',
          date_of_baptism: '',
          core_dept: '',
        });
        setSelectedSubDepts([]);
        setPhotoFile(null);
        setPhotoPreview(null);
      }
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.message || 'An error occurred during registration.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '480px', margin: '2rem auto', padding: '1rem', fontFamily: 'sans-serif' }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem', textAlign: 'center' }}>
        Member Registration
      </h2>

      {message.text && (
        <div
          style={{
            padding: '0.75rem',
            marginBottom: '1rem',
            borderRadius: '4px',
            backgroundColor: message.type === 'error' ? '#fee2e2' : '#dcfce7',
            color: message.type === 'error' ? '#991b1b' : '#166534',
          }}
        >
          {message.text}
        </div>
      )}

      <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        
        {/* Profile Photo Upload Section */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
          <div
            style={{
              width: '96px',
              height: '96px',
              borderRadius: '50%',
              backgroundColor: '#f3f4f6',
              border: '2px dashed #ccc',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
            }}
          >
            {photoPreview ? (
              <img src={photoPreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <span style={{ fontSize: '0.75rem', color: '#6b7280', textAlign: 'center' }}>Member Photo</span>
            )}
          </div>
          <label style={{ fontSize: '0.875rem', color: '#2563eb', cursor: 'pointer', fontWeight: '500' }}>
            Upload Profile Photo
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              style={{ display: 'none' }}
            />
          </label>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Prefix</label>
          <select
            name="prefix"
            value={formData.prefix}
            onChange={handleChange}
            style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}
          >
            <option value="">Select Prefix</option>
            <option value="Mr">Mr</option>
            <option value="Mrs">Mrs</option>
            <option value="Ms">Ms</option>
            <option value="Dr">Dr</option>
            <option value="Pastor">Pastor</option>
            <option value="Prophet">Prophet</option>
            <option value="Elder">Elder</option>
            <option value="Deacon">Deacon</option>
            <option value="Deaconess">Deaconess</option>
          </select>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem' }}>First Name *</label>
            <input
              type="text"
              name="first_name"
              required
              value={formData.first_name}
              onChange={handleChange}
              placeholder="Florence"
              style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Last Name *</label>
            <input
              type="text"
              name="last_name"
              required
              value={formData.last_name}
              onChange={handleChange}
              placeholder="Serwaa"
              style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' }}
            />
          </div>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Email *</label>
          <input
            type="email"
            name="email"
            required
            value={formData.email}
            onChange={handleChange}
            placeholder="florence@gmail.com"
            style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Password *</label>
          <input
            type="password"
            name="password"
            required
            minLength={6}
            value={formData.password}
            onChange={handleChange}
            style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Phone</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="0541509621"
            style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Home Address</label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="e.g. Plot 12, Block B, Techiman"
            style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Hometown</label>
          <input
            type="text"
            name="hometown"
            value={formData.hometown}
            onChange={handleChange}
            placeholder="e.g. Wenchi"
            style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Emergency Contact Person</label>
            <input
              type="text"
              name="emergency_contact_person"
              value={formData.emergency_contact_person}
              onChange={handleChange}
              placeholder="Full Name"
              style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Emergency Contact Phone</label>
            <input
              type="tel"
              name="emergency_contact"
              value={formData.emergency_contact}
              onChange={handleChange}
              placeholder="024XXXXXXX"
              style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' }}
            />
          </div>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Date of Birth</label>
          <input
            type="date"
            name="dob"
            value={formData.dob}
            onChange={handleChange}
            style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Date Joined</label>
            <input
              type="date"
              name="date_joined"
              value={formData.date_joined}
              onChange={handleChange}
              style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Date of Baptism</label>
            <input
              type="date"
              name="date_of_baptism"
              value={formData.date_of_baptism}
              onChange={handleChange}
              style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' }}
            />
          </div>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Gender</label>
          <select
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}
          >
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Marital Status</label>
          <select
            name="marital_status"
            value={formData.marital_status}
            onChange={handleChange}
            style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}
          >
            <option value="">Select Marital Status</option>
            <option value="Single">Single</option>
            <option value="Married">Married</option>
            <option value="Divorced">Divorced</option>
            <option value="Widowed">Widowed</option>
          </select>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem', fontWeight: 'bold' }}>
            Core Department *
          </label>
          <select
            name="core_dept"
            required
            value={formData.core_dept}
            onChange={handleChange}
            style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}
          >
            <option value="">Select Core Department</option>
            <option value="LOVE">LOVE</option>
            <option value="UNITY">UNITY</option>
            <option value="CARE">CARE</option>
            <option value="RESPECT">RESPECT</option>
          </select>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            Sub Department * (Select one or more)
          </label>
          <div
            style={{
              border: subDeptError ? '1px solid #dc2626' : '1px solid #ccc',
              borderRadius: '4px',
              padding: '0.75rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
              maxHeight: '200px',
              overflowY: 'auto',
            }}
          >
            {SUB_DEPTS_LIST.map((dept) => (
              <label key={dept} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  value={dept}
                  checked={selectedSubDepts.includes(dept)}
                  onChange={() => handleSubDeptCheckbox(dept)}
                />
                {dept}
              </label>
            ))}
          </div>
          {subDeptError && (
            <span style={{ color: '#dc2626', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>
              {subDeptError}
            </span>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            padding: '0.75rem',
            backgroundColor: '#2563eb',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            fontWeight: 'bold',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1,
            marginTop: '0.5rem',
          }}
        >
          {loading ? 'Registering...' : 'Register Member'}
        </button>
      </form>
    </div>
  );
}
