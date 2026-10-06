'use client';

import { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

export default function Register() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    gender: '',
    dob: '',
    maritalStatus: '',
    hometown: '',
    homeAddress: '',
    coreDepartment: '',
    subDepartment: '',
    dateJoined: '',
    baptismDate: '',
    emergencyName: '',
    emergencyPhone: '',
  });

  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.coreDepartment) {
      setMessage({ type: 'error', text: 'Core Department is required.' });
      return;
    }

    if (!formData.email || !formData.password || formData.password.length < 6) {
      setMessage({ type: 'error', text: 'Email and password (min 6 characters) are required.' });
      return;
    }

    setSubmitting(true);
    setMessage({ type: '', text: '' });

    try {
      let photoUrl = '';

      if (file) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('passport-photos')
          .upload(fileName, file);

        if (!uploadError && uploadData) {
          const { data: publicUrlData } = supabase.storage
            .from('passport-photos')
            .getPublicUrl(fileName);
          photoUrl = publicUrlData?.publicUrl || '';
        }
      }

      // 1. Create Supabase Auth user
      const { error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      });

      if (authError) throw new Error(authError.message);

      // 2. Insert record into 'members' table using existing column names
      const { error: insertError } = await supabase.from('members').insert([
        {
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          gender: formData.gender,
          dob: formData.dob,
          marital_status: formData.maritalStatus,
          hometown: formData.hometown,
          home_address: formData.homeAddress,
          core_department: formData.coreDepartment,
          sub_department: formData.subDepartment,
          date_joined: formData.dateJoined,
          baptism_date: formData.baptismDate,
          emergency_name: formData.emergencyName,
          emergency_phone: formData.emergencyPhone,
          photo_url: photoUrl,
        },
      ]);

      if (insertError) throw new Error(insertError.message);

      setMessage({ type: 'success', text: 'Registration successful! You can now log into your portal.' });
      setFormData({
        firstName: '', lastName: '', email: '', password: '', phone: '',
        gender: '', dob: '', maritalStatus: '', hometown: '', homeAddress: '',
        coreDepartment: '', subDepartment: '', dateJoined: '', baptismDate: '',
        emergencyName: '', emergencyPhone: '',
      });
      setFile(null);
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '700px', margin: '2rem auto', padding: '2rem', background: '#fff', borderRadius: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '1.5rem', color: '#1a365d' }}>Member Registration</h2>

      {message.text && (
        <div style={{ padding: '0.8rem', marginBottom: '1.2rem', borderRadius: '6px', backgroundColor: message.type === 'error' ? '#fed7d7' : '#c6f6d5', color: message.type === 'error' ? '#9b2c2c' : '#22543d', textAlign: 'center', fontWeight: '600' }}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
        {/* Personal Details */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.3rem' }}>First Name *</label>
            <input type="text" name="firstName" required value={formData.firstName} onChange={handleChange} style={{ width: '100%', padding: '0.6rem', border: '1px solid #ccc', borderRadius: '4px' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.3rem' }}>Last Name *</label>
            <input type="text" name="lastName" required value={formData.lastName} onChange={handleChange} style={{ width: '100%', padding: '0.6rem', border: '1px solid #ccc', borderRadius: '4px' }} />
          </div>
        </div>

        {/* Account Credentials */}
        <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
          <h3 style={{ fontSize: '1rem', marginBottom: '0.8rem', color: '#2b6cb0' }}>Account Credentials (For Login)</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.3rem' }}>Email Address *</label>
              <input type="email" name="email" required value={formData.email} onChange={handleChange} placeholder="member@email.com" style={{ width: '100%', padding: '0.6rem', border: '1px solid #ccc', borderRadius: '4px' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.3rem' }}>Password *</label>
              <input type="password" name="password" required minLength={6} value={formData.password} onChange={handleChange} placeholder="At least 6 characters" style={{ width: '100%', padding: '0.6rem', border: '1px solid #ccc', borderRadius: '4px' }} />
            </div>
          </div>
        </div>

        {/* Contact & Bio */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.3rem' }}>Phone Number *</label>
            <input type="tel" name="phone" required value={formData.phone} onChange={handleChange} style={{ width: '100%', padding: '0.6rem', border: '1px solid #ccc', borderRadius: '4px' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.3rem' }}>Gender *</label>
            <select name="gender" required value={formData.gender} onChange={handleChange} style={{ width: '100%', padding: '0.6rem', border: '1px solid #ccc', borderRadius: '4px' }}>
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.3rem' }}>Date of Birth</label>
            <input type="date" name="dob" value={formData.dob} onChange={handleChange} style={{ width: '100%', padding: '0.6rem', border: '1px solid #ccc', borderRadius: '4px' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.3rem' }}>Marital Status</label>
            <select name="maritalStatus" value={formData.maritalStatus} onChange={handleChange} style={{ width: '100%', padding: '0.6rem', border: '1px solid #ccc', borderRadius: '4px' }}>
              <option value="">Select Status</option>
              <option value="Single">Single</option>
              <option value="Married">Married</option>
              <option value="Divorced">Divorced</option>
              <option value="Widowed">Widowed</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.3rem' }}>Hometown</label>
            <input type="text" name="hometown" value={formData.hometown} onChange={handleChange} style={{ width: '100%', padding: '0.6rem', border: '1px solid #ccc', borderRadius: '4px' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.3rem' }}>Home Address</label>
            <input type="text" name="homeAddress" value={formData.homeAddress} onChange={handleChange} style={{ width: '100%', padding: '0.6rem', border: '1px solid #ccc', borderRadius: '4px' }} />
          </div>
        </div>

        {/* Church & Department Details */}
        <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
          <h3 style={{ fontSize: '1rem', marginBottom: '0.8rem', color: '#2b6cb0' }}>Church & Department Details</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.3rem' }}>Core Department *</label>
              <select name="coreDepartment" required value={formData.coreDepartment} onChange={handleChange} style={{ width: '100%', padding: '0.6rem', border: '2px solid #3182ce', borderRadius: '4px', background: '#ebf8ff' }}>
                <option value="">-- Select Core Dept --</option>
                <option value="LOVE">LOVE</option>
                <option value="UNITY">UNITY</option>
                <option value="CARE">CARE</option>
                <option value="RESPECT">RESPECT</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.3rem' }}>Sub Department (Optional)</label>
              <select name="subDepartment" value={formData.subDepartment} onChange={handleChange} style={{ width: '100%', padding: '0.6rem', border: '1px solid #ccc', borderRadius: '4px' }}>
                <option value="">-- Select Sub Dept --</option>
                <option value="Ushering">Ushering</option>
                <option value="Choir / Music">Choir / Music</option>
                <option value="Prayer Warriors">Prayer Warriors</option>
                <option value="Evangelical">Evangelical</option>
                <option value="Women Ministry">Women Ministry</option>
                <option value="Men Ministry">Men Ministry</option>
                <option value="Youth Ministry">Youth Ministry</option>
                <option value="Children Ministry">Children Ministry</option>
              </select>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.3rem' }}>Date Joined</label>
            <input type="date" name="dateJoined" value={formData.dateJoined} onChange={handleChange} style={{ width: '100%', padding: '0.6rem', border: '1px solid #ccc', borderRadius: '4px' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.3rem' }}>Date of Baptism</label>
            <input type="date" name="baptismDate" value={formData.baptismDate} onChange={handleChange} style={{ width: '100%', padding: '0.6rem', border: '1px solid #ccc', borderRadius: '4px' }} />
          </div>
        </div>

        {/* Emergency Contact */}
        <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
          <h3 style={{ fontSize: '1rem', marginBottom: '0.8rem', color: '#2b6cb0' }}>Emergency Contact</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.3rem' }}>Emergency Contact Name</label>
              <input type="text" name="emergencyName" value={formData.emergencyName} onChange={handleChange} style={{ width: '100%', padding: '0.6rem', border: '1px solid #ccc', borderRadius: '4px' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.3rem' }}>Emergency Contact Phone</label>
              <input type="tel" name="emergencyPhone" value={formData.emergencyPhone} onChange={handleChange} style={{ width: '100%', padding: '0.6rem', border: '1px solid #ccc', borderRadius: '4px' }} />
            </div>
          </div>
        </div>

        {/* Photo Upload */}
        <div>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.3rem' }}>Passport Photo</label>
          <input type="file" accept="image/*" onChange={handleFileChange} style={{ width: '100%', padding: '0.4rem', border: '1px solid #ccc', borderRadius: '4px' }} />
        </div>

        <button type="submit" disabled={submitting} style={{ marginTop: '1rem', padding: '0.8rem', fontSize: '1rem', fontWeight: 'bold', color: '#fff', backgroundColor: submitting ? '#a0aec0' : '#2b6cb0', border: 'none', borderRadius: '6px', cursor: submitting ? 'not-allowed' : 'pointer' }}>
          {submitting ? 'Registering...' : 'Register Member'}
        </button>
      </form>
    </div>
  );
}
