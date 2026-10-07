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
    prefix: '',
    first_name: '',
    last_name: '',
    phone: '',
    address: '',
    hometown: '',
    core_dept: '',
    sub_dept: '',
    emergency_contact_person: '',
    emergency_contact: '',
  });
  const [photo, setPhoto] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setPhoto(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      // 1. Register Auth account in Supabase
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      });

      if (authError) throw authError;

      const user = authData.user;
      if (!user) throw new Error('Could not complete account signup. Please try again.');

      // 2. Upload Profile Picture if selected
      let photoUrl = '';
      if (photo) {
        const fileExt = photo.name.split('.').pop();
        const fileName = `${user.id}-${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(fileName, photo);

        if (!uploadError) {
          const { data: publicUrlData } = supabase.storage
            .from('avatars')
            .getPublicUrl(fileName);
          photoUrl = publicUrlData.publicUrl;
        }
      }

      // 3. Save profile record directly into the `members` table
      const { error: dbError } = await supabase.from('members').insert([
        {
          id: user.id,
          prefix: formData.prefix,
          first_name: formData.first_name,
          last_name: formData.last_name,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          hometown: formData.hometown,
          core_dept: formData.core_dept,
          sub_dept: formData.sub_dept,
          emergency_contact_person: formData.emergency_contact_person,
          emergency_contact: formData.emergency_contact,
          photo_url: photoUrl,
        },
      ]);

      if (dbError) throw dbError;

      setMessage('Registration successful! Redirecting to My Portal...');
      setTimeout(() => {
        window.location.href = '/portal';
      }, 1500);
    } catch (err) {
      console.error(err);
      setMessage(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '500px', margin: '2rem auto', padding: '1.5rem', fontFamily: 'sans-serif' }}>
      <h2>Member Registration</h2>
      {message && (
        <p style={{ padding: '0.75rem', background: '#f3f4f6', borderRadius: '4px', marginBottom: '1rem' }}>
          {message}
        </p>
      )}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
        <input name="prefix" placeholder="Prefix (Mr/Mrs/Dr/Rev)" onChange={handleChange} required />
        <input name="first_name" placeholder="First Name" onChange={handleChange} required />
        <input name="last_name" placeholder="Last Name" onChange={handleChange} required />
        <input name="email" type="email" placeholder="Email" onChange={handleChange} required />
        <input name="password" type="password" placeholder="Password" onChange={handleChange} required />
        <input name="phone" placeholder="Phone Number" onChange={handleChange} />
        <input name="address" placeholder="Residential Address" onChange={handleChange} />
        <input name="hometown" placeholder="Hometown" onChange={handleChange} />

        <select name="sub_dept" onChange={handleChange} required style={{ padding: '0.5rem' }}>
          <option value="">Select Ministry / Department</option>
          {SUB_DEPTS_LIST.map((dept, idx) => (
            <option key={idx} value={dept}>
              {dept}
            </option>
          ))}
        </select>

        <input name="emergency_contact_person" placeholder="Emergency Contact Person" onChange={handleChange} />
        <input name="emergency_contact" placeholder="Emergency Contact Phone" onChange={handleChange} />

        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.3rem' }}>Profile Photo:</label>
          <input type="file" accept="image/*" onChange={handleFileChange} />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            padding: '0.75rem',
            background: '#2563eb',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            marginTop: '0.5rem',
          }}
        >
          {loading ? 'Registering...' : 'Register Member'}
        </button>
      </form>
    </div>
  );
}
