'use client';

import { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

export default function Register() {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    gender: '',
    dob: '',
    marital_status: '',
    residence: '',
    occupation: '',
    ministry: '',
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
      let photoUrl = null;

      if (photo) {
        const fileExt = photo.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('member-photos')
          .upload(fileName, photo);

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage
          .from('member-photos')
          .getPublicUrl(fileName);

        photoUrl = publicUrlData.publicUrl;
      }

      const { error: insertError } = await supabase.from('members').insert([
        {
          ...formData,
          photo_url: photoUrl,
        },
      ]);

      if (insertError) throw insertError;

      setMessage('Registration successful!');
      setFormData({
        first_name: '',
        last_name: '',
        phone: '',
        gender: '',
        dob: '',
        marital_status: '',
        residence: '',
        occupation: '',
        ministry: '',
      });
      setPhoto(null);
    } catch (err) {
      setMessage(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '2rem auto', padding: '1rem' }}>
      <h2>Member Registration</h2>
      {message && <p>{message}</p>}
      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem' }}>
        <div>
          <label>First Name</label>
          <input
            type="text"
            name="first_name"
            value={formData.first_name}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '0.5rem' }}
          />
        </div>
        <div>
          <label>Last Name</label>
          <input
            type="text"
            name="last_name"
            value={formData.last_name}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '0.5rem' }}
          />
        </div>
        <div>
          <label>Phone Number</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '0.5rem' }}
          />
        </div>
        <div>
          <label>Passport Photo</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            style={{ width: '100%', padding: '0.5rem' }}
          />
        </div>
        <div>
          <label>Gender</label>
          <select
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            style={{ width: '100%', padding: '0.5rem' }}
          >
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
        </div>
        <div>
          <label>Date of Birth</label>
          <input
            type="date"
            name="dob"
            value={formData.dob}
            onChange={handleChange}
            style={{ width: '100%', padding: '0.5rem' }}
          />
        </div>
        <div>
          <label>Marital Status</label>
          <select
            name="marital_status"
            value={formData.marital_status}
            onChange={handleChange}
            style={{ width: '100%', padding: '0.5rem' }}
          >
            <option value="">Select Status</option>
            <option value="Single">Single</option>
            <option value="Married">Married</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div>
          <label>Place of Residence</label>
          <input
            type="text"
            name="residence"
            value={formData.residence}
            onChange={handleChange}
            style={{ width: '100%', padding: '0.5rem' }}
          />
        </div>
        <div>
          <label>Occupation</label>
          <input
            type="text"
            name="occupation"
            value={formData.occupation}
            onChange={handleChange}
            style={{ width: '100%', padding: '0.5rem' }}
          />
        </div>
        <div>
          <label>Ministry / Department</label>
          <input
            type="text"
            name="ministry"
            value={formData.ministry}
            onChange={handleChange}
            style={{ width: '100%', padding: '0.5rem' }}
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          style={{ padding: '0.75rem', cursor: 'pointer' }}
        >
          {loading ? 'Submitting...' : 'Register Member'}
        </button>
      </form>
    </div>
  );
}
