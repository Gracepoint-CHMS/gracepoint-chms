'use client';

import { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
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
    core_value_department: 'LOVE',
    sub_department: 'General Assembly',
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const { error } = await supabase.from('members').insert([formData]);

    if (error) {
      console.error('Error inserting member:', error);
      setMessage({ type: 'error', text: 'Error submitting registration. Please try again.' });
    } else {
      setMessage({ type: 'success', text: 'Registration completed successfully!' });
      setFormData({
        first_name: '',
        last_name: '',
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
        core_value_department: 'LOVE',
        sub_department: 'General Assembly',
      });
    }

    setLoading(false);
  };

  return (
    <div style={{ maxWidth: '800px', margin: '20px auto', padding: '0 16px', fontFamily: 'sans-serif' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '24px' }}>
        Gracepoint Prophetic Church - Member Registration
      </h2>

      {message && (
        <div
          style={{
            padding: '12px 16px',
            borderRadius: '6px',
            marginBottom: '20px',
            fontWeight: 'bold',
            backgroundColor: message.type === 'success' ? '#d4edda' : '#f8d7da',
            color: message.type === 'success' ? '#155724' : '#721c24',
            border: `1px solid ${message.type === 'success' ? '#c3e6cb' : '#f5c6cb'}`,
          }}
        >
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Church Department Section */}
        <fieldset style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '16px' }}>
          <legend style={{ fontWeight: 'bold', padding: '0 8px' }}>Church Department</legend>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ fontWeight: '600', fontSize: '14px' }}>Core Value Department *</label>
              <select
                name="core_value_department"
                value={formData.core_value_department}
                onChange={handleChange}
                required
                style={{ width: '100%', padding: '10px', marginTop: '6px', borderRadius: '6px', border: '1px solid #ccc', boxSizing: 'border-box' }}
              >
                <option value="LOVE">LOVE</option>
                <option value="UNITY">UNITY</option>
                <option value="CARE">CARE</option>
                <option value="RESPECT">RESPECT</option>
              </select>
            </div>

            <div>
              <label style={{ fontWeight: '600', fontSize: '14px' }}>Sub-Department / Ministry *</label>
              <select
                name="sub_department"
                value={formData.sub_department}
                onChange={handleChange}
                required
                style={{ width: '100%', padding: '10px', marginTop: '6px', borderRadius: '6px', border: '1px solid #ccc', boxSizing: 'border-box' }}
              >
                <option value="General Assembly">General Assembly</option>
                <option value="Ushering Department">Ushering Department</option>
                <option value="Choir / Music Ministry">Choir / Music Ministry</option>
                <option value="Prayer Warriors">Prayer Warriors</option>
                <option value="Youth Ministry">Youth Ministry</option>
                <option value="Children Ministry">Children Ministry</option>
                <option value="Women Ministry">Women Ministry</option>
                <option value="Men Ministry">Men Ministry</option>
                <option value="Media & IT">Media & IT</option>
              </select>
            </div>
          </div>
        </fieldset>

        {/* Personal Information Section */}
        <fieldset style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '16px' }}>
          <legend style={{ fontWeight: 'bold', padding: '0 8px' }}>Personal Information</legend>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
            <div>
              <label style={{ fontWeight: '600', fontSize: '14px' }}>First Name *</label>
              <input
                type="text"
                name="first_name"
                placeholder="First name"
                value={formData.first_name}
                onChange={handleChange}
                required
                style={{ width: '100%', padding: '10px', marginTop: '6px', borderRadius: '6px', border: '1px solid #ccc', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ fontWeight: '600', fontSize: '14px' }}>Surname *</label>
              <input
                type="text"
                name="last_name"
                placeholder="Surname"
                value={formData.last_name}
                onChange={handleChange}
                required
                style={{ width: '100%', padding: '10px', marginTop: '6px', borderRadius: '6px', border: '1px solid #ccc', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ fontWeight: '600', fontSize: '14px' }}>Phone Number *</label>
              <input
                type="tel"
                name="phone"
                placeholder="024XXXXXXX"
                value={formData.phone}
                onChange={handleChange}
                required
                style={{ width: '100%', padding: '10px', marginTop: '6px', borderRadius: '6px', border: '1px solid #ccc', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ fontWeight: '600', fontSize: '14px' }}>Gender *</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                required
                style={{ width: '100%', padding: '10px', marginTop: '6px', borderRadius: '6px', border: '1px solid #ccc', boxSizing: 'border-box' }}
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>

            <div>
              <label style={{ fontWeight: '600', fontSize: '14px' }}>Email Address</label>
              <input
                type="email"
                name="email"
                placeholder="example@mail.com"
                value={formData.email}
                onChange={handleChange}
                style={{ width: '100%', padding: '10px', marginTop: '6px', borderRadius: '6px', border: '1px solid #ccc', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ fontWeight: '600', fontSize: '14px' }}>Marital Status *</label>
              <select
                name="marital_status"
                value={formData.marital_status}
                onChange={handleChange}
                required
                style={{ width: '100%', padding: '10px', marginTop: '6px', borderRadius: '6px', border: '1px solid #ccc', boxSizing: 'border-box' }}
              >
                <option value="Single">Single</option>
                <option value="Married">Married</option>
                <option value="Divorced">Divorced</option>
                <option value="Widowed">Widowed</option>
              </select>
            </div>

            <div>
              <label style={{ fontWeight: '600', fontSize: '14px' }}>Date of Birth</label>
              <input
                type="date"
                name="date_of_birth"
                value={formData.date_of_birth}
                onChange={handleChange}
                style={{ width: '100%', padding: '10px', marginTop: '6px', borderRadius: '6px', border: '1px solid #ccc', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ fontWeight: '600', fontSize: '14px' }}>Place of Birth</label>
              <input
                type="text"
                name="place_of_birth"
                placeholder="Town / City"
                value={formData.place_of_birth}
                onChange={handleChange}
                style={{ width: '100%', padding: '10px', marginTop: '6px', borderRadius: '6px', border: '1px solid #ccc', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ fontWeight: '600', fontSize: '14px' }}>Home Address</label>
              <input
                type="text"
                name="home_address"
                placeholder="Residential Area / Digital Address"
                value={formData.home_address}
                onChange={handleChange}
                style={{ width: '100%', padding: '10px', marginTop: '6px', borderRadius: '6px', border: '1px solid #ccc', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ fontWeight: '600', fontSize: '14px' }}>Home Town</label>
              <input
                type="text"
                name="home_town"
                placeholder="Hometown"
                value={formData.home_town}
                onChange={handleChange}
                style={{ width: '100%', padding: '10px', marginTop: '6px', borderRadius: '6px', border: '1px solid #ccc', boxSizing: 'border-box' }}
              />
            </div>
          </div>
        </fieldset>

        {/* Church History & Emergency Contact Section */}
        <fieldset style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '16px' }}>
          <legend style={{ fontWeight: 'bold', padding: '0 8px' }}>Church History & Emergency Contact</legend>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
            <div>
              <label style={{ fontWeight: '600', fontSize: '14px' }}>Date Joined Church</label>
              <input
                type="date"
                name="date_joined_church"
                value={formData.date_joined_church}
                onChange={handleChange}
                style={{ width: '100%', padding: '10px', marginTop: '6px', borderRadius: '6px', border: '1px solid #ccc', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ fontWeight: '600', fontSize: '14px' }}>Date of Baptism</label>
              <input
                type="date"
                name="date_of_baptism"
                value={formData.date_of_baptism}
                onChange={handleChange}
                style={{ width: '100%', padding: '10px', marginTop: '6px', borderRadius: '6px', border: '1px solid #ccc', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ fontWeight: '600', fontSize: '14px' }}>Emergency Contact Person</label>
              <input
                type="text"
                name="emergency_contact_person"
                placeholder="Full Name"
                value={formData.emergency_contact_person}
                onChange={handleChange}
                style={{ width: '100%', padding: '10px', marginTop: '6px', borderRadius: '6px', border: '1px solid #ccc', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ fontWeight: '600', fontSize: '14px' }}>Emergency Contact Phone</label>
              <input
                type="tel"
                name="emergency_contact_phone"
                placeholder="Phone Number"
                value={formData.emergency_contact_phone}
                onChange={handleChange}
                style={{ width: '100%', padding: '10px', marginTop: '6px', borderRadius: '6px', border: '1px solid #ccc', boxSizing: 'border-box' }}
              />
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
            fontWeight: 'bold',
            border: 'none',
            borderRadius: '6px',
            fontSize: '16px',
            cursor: loading ? 'not-allowed' : 'pointer',
            marginTop: '10px',
          }}
        >
          {loading ? 'Submitting...' : 'Submit Registration'}
        </button>
      </form>
    </div>
  );
}
