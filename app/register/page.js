'use client';

import { useState } from 'react';
import { supabase } from '../../lib/supabase';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    email: '',
    gender: 'Male',
    date_of_birth: '',
    place_of_birth: '',
    home_address: '',
    home_town: '',
    marital_status: 'Single',
    date_joined_church: '',
    date_of_baptism: '',
    emergency_contact_person: '',
    emergency_contact_phone: '',
    core_value_department: 'Love',
    sub_department: 'Youth Ministry',
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    // Safely split full_name into first_name and last_name
    const trimmedName = (formData.full_name || '').trim();
    const nameParts = trimmedName.split(/\s+/);
    
    // First word as first_name, remaining words joined as last_name
    const firstName = nameParts[0] || '';
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';

    // Map fields so both legacy/duplicate schema columns are satisfied
    const payload = {
      first_name: firstName,
      last_name: lastName,
      full_name: trimmedName,
      phone: formData.phone,
      phone_number: formData.phone,
      email: formData.email,
      gender: formData.gender,
      date_of_birth: formData.date_of_birth || null,
      dob: formData.date_of_birth || null,
      place_of_birth: formData.place_of_birth,
      home_address: formData.home_address,
      address: formData.home_address,
      home_town: formData.home_town,
      marital_status: formData.marital_status,
      date_joined_church: formData.date_joined_church || null,
      date_of_baptism: formData.date_of_baptism || null,
      emergency_contact_person: formData.emergency_contact_person,
      emergency_contact_phone: formData.emergency_contact_phone,
      core_value_department: formData.core_value_department,
      department: formData.sub_department || formData.core_value_department,
      status: 'Active',
    };

    const { data, error } = await supabase.from('members').insert([payload]);

    setLoading(false);

    if (error) {
      console.error('Submission Error:', error);
      setMessage('Error submitting form. Please try again.');
    } else {
      setMessage('Registration successful! Welcome to Gracepoint Church.');
      setFormData({
        full_name: '',
        phone: '',
        email: '',
        gender: 'Male',
        date_of_birth: '',
        place_of_birth: '',
        home_address: '',
        home_town: '',
        marital_status: 'Single',
        date_joined_church: '',
        date_of_baptism: '',
        emergency_contact_person: '',
        emergency_contact_phone: '',
        core_value_department: 'Love',
        sub_department: 'Youth Ministry',
      });
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '40px auto', padding: '20px' }}>
      <h2>Gracepoint Prophetic Church - Member Registration</h2>
      {message && <p style={{ fontWeight: 'bold', color: message.includes('Error') ? 'red' : 'green' }}>{message}</p>}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <fieldset style={{ border: '1px solid #ddd', padding: '16px', borderRadius: '8px' }}>
          <legend style={{ fontWeight: 'bold', padding: '0 5px' }}>Church Department</legend>
          <div style={{ marginBottom: '12px' }}>
            <label>Core Value Department</label>
            <select name="core_value_department" value={formData.core_value_department} onChange={handleChange} style={{ width: '100%', padding: '8px', marginTop: '4px' }}>
              <option value="Love">Love</option>
              <option value="Faith">Faith</option>
              <option value="Grace">Grace</option>
              <option value="Hope">Hope</option>
            </select>
          </div>
          <div>
            <label>Sub-Department / Ministry</label>
            <select name="sub_department" value={formData.sub_department} onChange={handleChange} style={{ width: '100%', padding: '8px', marginTop: '4px' }}>
              <option value="Youth Ministry">Youth Ministry</option>
              <option value="Children Ministry">Children Ministry</option>
              <option value="Women Ministry">Women Ministry</option>
              <option value="Men Ministry">Men Ministry</option>
              <option value="Media & IT">Media & IT</option>
            </select>
          </div>
        </fieldset>

        <fieldset style={{ border: '1px solid #ddd', padding: '16px', borderRadius: '8px' }}>
          <legend style={{ fontWeight: 'bold', padding: '0 5px' }}>Personal Information</legend>
          <div style={{ marginBottom: '12px' }}>
            <label>Full Name *</label>
            <input type="text" name="full_name" required value={formData.full_name} onChange={handleChange} placeholder="e.g. Mathew Duut" style={{ width: '100%', padding: '8px', marginTop: '4px' }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
            <div>
              <label>Phone Number *</label>
              <input type="tel" name="phone" required value={formData.phone} onChange={handleChange} style={{ width: '100%', padding: '8px', marginTop: '4px' }} />
            </div>
            <div>
              <label>Gender *</label>
              <select name="gender" value={formData.gender} onChange={handleChange} style={{ width: '100%', padding: '8px', marginTop: '4px' }}>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
          </div>

          <div style={{ marginBottom: '12px' }}>
            <label>Email Address</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} style={{ width: '100%', padding: '8px', marginTop: '4px' }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
            <div>
              <label>Date of Birth</label>
              <input type="date" name="date_of_birth" value={formData.date_of_birth} onChange={handleChange} style={{ width: '100%', padding: '8px', marginTop: '4px' }} />
            </div>
            <div>
              <label>Marital Status</label>
              <select name="marital_status" value={formData.marital_status} onChange={handleChange} style={{ width: '100%', padding: '8px', marginTop: '4px' }}>
                <option value="Single">Single</option>
                <option value="Married">Married</option>
                <option value="Widowed">Widowed</option>
                <option value="Divorced">Divorced</option>
              </select>
            </div>
          </div>

          <div style={{ marginBottom: '12px' }}>
            <label>Home Address</label>
            <input type="text" name="home_address" value={formData.home_address} onChange={handleChange} style={{ width: '100%', padding: '8px', marginTop: '4px' }} />
          </div>
        </fieldset>

        <button type="submit" disabled={loading} style={{ padding: '12px', background: '#0070f3', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
          {loading ? 'Submitting...' : 'Register Member'}
        </button>
      </form>
    </div>
  );
}
