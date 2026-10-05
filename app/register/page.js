'use client';

import { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    email: '',
    gender: 'Male',
    department: 'General Assembly'
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.value ? e.target.name : e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const { error } = await supabase.from('members').insert([formData]);

    if (error) {
      setMessage('Registration failed: ' + error.message);
    } else {
      setMessage('Thank you! Your registration has been submitted successfully.');
      setFormData({
        full_name: '',
        phone: '',
        email: '',
        gender: 'Male',
        department: 'General Assembly'
      });
    }
    setLoading(false);
  };

  return (
    <main style={{ maxWidth: '500px', margin: '40px auto', padding: '20px', fontFamily: 'sans-serif' }}>
      <h2>Church Member Registration</h2>
      <p>Please fill in your details below to join Gracepoint Church.</p>

      {message && (
        <p style={{ color: message.includes('failed') ? 'red' : 'green', fontWeight: 'bold' }}>
          {message}
        </p>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '5px' }}>Full Name *</label>
          <input
            type="text"
            name="full_name"
            required
            value={formData.full_name}
            onChange={handleChange}
            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '5px' }}>Phone Number *</label>
          <input
            type="tel"
            name="phone"
            required
            value={formData.phone}
            onChange={handleChange}
            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '5px' }}>Email Address</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '5px' }}>Gender</label>
          <select
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
          >
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '5px' }}>Department / Ministry</label>
          <select
            name="department"
            value={formData.department}
            onChange={handleChange}
            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
          >
            <option value="General Assembly">General Assembly</option>
            <option value="Choir / Music">Choir / Music</option>
            <option value="Ushering">Ushering</option>
            <option value="Media & IT">Media & IT</option>
            <option value="Youth Ministry">Youth Ministry</option>
            <option value="Children Ministry">Children Ministry</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            padding: '12px',
            backgroundColor: '#0070f3',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            fontSize: '16px',
            cursor: 'pointer'
          }}
        >
          {loading ? 'Submitting...' : 'Register'}
        </button>
      </form>
    </main>
  );
}
