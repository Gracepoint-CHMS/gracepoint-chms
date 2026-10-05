'use client';

import { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

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
    date_joined_church: '',
    date_of_baptism: '',
    emergency_contact_person: '',
    emergency_contact_phone: '',
    core_value_department: 'Love',
    sub_department: 'General Assembly'
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const { error } = await supabase.from('members').insert([formData]);

    if (error) {
      setMessage('Registration failed: ' + error.message);
    } else {
      setMessage('Thank you! Your registration has been submitted successfully and linked to the Church Welfare System.');
      setFormData({
        full_name: '',
        phone: '',
        email: '',
        gender: 'Male',
        date_of_birth: '',
        place_of_birth: '',
        home_address: '',
        home_town: '',
        date_joined_church: '',
        date_of_baptism: '',
        emergency_contact_person: '',
        emergency_contact_phone: '',
        core_value_department: 'Love',
        sub_department: 'General Assembly'
      });
    }
    setLoading(false);
  };

  const inputStyle = {
    width: '100%',
    padding: '10px',
    borderRadius: '4px',
    border: '1px solid #ccc',
    marginTop: '4px'
  };

  return (
    <main style={{ maxWidth: '650px', margin: '30px auto', padding: '20px', fontFamily: 'sans-serif' }}>
      <h2>Church Member Registration</h2>
      <p style={{ color: '#555' }}>Please complete your registration details to join Gracepoint Church.</p>

      {message && (
        <p style={{ color: message.includes('failed') ? 'red' : 'green', fontWeight: 'bold', padding: '10px', borderRadius: '4px', backgroundColor: message.includes('failed') ? '#ffe6e6' : '#e6ffe6' }}>
          {message}
        </p>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        
        {/* Core Values & Sub-Departments */}
        <fieldset style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '6px' }}>
          <legend style={{ fontWeight: 'bold', padding: '0 5px' }}>Church Departments</legend>
          
          <div style={{ marginBottom: '12px' }}>
            <label style={{ fontWeight: 'bold' }}>Primary Core Value Department *</label>
            <select name="core_value_department" value={formData.core_value_department} onChange={handleChange} required style={inputStyle}>
              <option value="Love">Love Department</option>
              <option value="Unity">Unity Department</option>
              <option value="Care">Care Department</option>
              <option value="Respect">Respect Department</option>
            </select>
          </div>

          <div>
            <label style={{ fontWeight: 'bold' }}>Sub-Department / Ministry *</label>
            <select name="sub_department" value={formData.sub_department} onChange={handleChange} required style={inputStyle}>
              <option value="General Assembly">General Assembly</option>
              <option value="Choir / Music">Choir / Music</option>
              <option value="Ushering">Ushering</option>
              <option value="Youth Ministry">Youth Ministry</option>
              <option value="Children Ministry">Children Ministry</option>
              <option value="Women Ministry">Women Ministry</option>
              <option value="Men Ministry">Men Ministry</option>
              <option value="Media & IT">Media & IT</option>
            </select>
          </div>
        </fieldset>

        {/* Personal Identification */}
        <fieldset style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '6px' }}>
          <legend style={{ fontWeight: 'bold', padding: '0 5px' }}>Personal Details</legend>
          
          <div style={{ marginBottom: '12px' }}>
            <label>Full Name *</label>
            <input type="text" name="full_name" required value={formData.full_name} onChange={handleChange} style={inputStyle} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
            <div>
              <label>Phone Number *</label>
              <input type="tel" name="phone" required value={formData.phone} onChange={handleChange} style={inputStyle} />
            </div>
            <div>
              <label>Gender *</label>
              <select name="gender" value={formData.gender} onChange={handleChange} style={inputStyle}>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
          </div>

          <div style={{ marginBottom: '12px' }}>
            <label>Email Address</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} style={inputStyle} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
            <div>
              <label>Date of Birth *</label>
              <input type="date" name="date_of_birth" required value={formData.date_of_birth} onChange={handleChange} style={inputStyle} />
            </div>
            <div>
              <label>Place of Birth</label>
              <input type="text" name="place_of_birth" value={formData.place_of_birth} onChange={handleChange} style={inputStyle} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label>Home Address *</label>
              <input type="text" name="home_address" required value={formData.home_address} onChange={handleChange} style={inputStyle} />
            </div>
            <div>
              <label>Home Town</label>
              <input type="text" name="home_town" value={formData.home_town} onChange={handleChange} style={inputStyle} />
            </div>
          </div>
        </fieldset>

        {/* Church History */}
        <fieldset style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '6px' }}>
          <legend style={{ fontWeight: 'bold', padding: '0 5px' }}>Church Details</legend>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label>Date Joined Church</label>
              <input type="date" name="date_joined_church" value={formData.date_joined_church} onChange={handleChange} style={inputStyle} />
            </div>
            <div>
              <label>Date of Baptism</label>
              <input type="date" name="date_of_baptism" value={formData.date_of_baptism} onChange={handleChange} style={inputStyle} />
            </div>
          </div>
        </fieldset>

        {/* Emergency Contact */}
        <fieldset style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '6px' }}>
          <legend style={{ fontWeight: 'bold', padding: '0 5px' }}>Emergency Contact</legend>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label>Contact Person *</label>
              <input type="text" name="emergency_contact_person" required value={formData.emergency_contact_person} onChange={handleChange} style={inputStyle} />
            </div>
            <div>
              <label>Contact Phone *</label>
              <input type="tel" name="emergency_contact_phone" required value={formData.emergency_contact_phone} onChange={handleChange} style={inputStyle} />
            </div>
          </div>
        </fieldset>

        <button
          type="submit"
          disabled={loading}
          style={{
            padding: '14px',
            backgroundColor: '#0070f3',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
        >
          {loading ? 'Submitting...' : 'Register Member'}
        </button>
      </form>
    </main>
  );
}
