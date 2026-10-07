'use client';

import { useState } from 'react';
import { supabase } from '../../lib/supabase';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
    prefix: '',
    phone: '',
    gender: '',
    marital_status: '',
    core_dept: '',
    sub_dept: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      });

      if (authError) throw authError;

      const userId = authData.user?.id;

      if (userId) {
        const { error: profileError } = await supabase.from('members').insert([
          {
            id: userId,
            email: formData.email,
            full_name: formData.full_name,
            prefix: formData.prefix,
            phone: formData.phone,
            gender: formData.gender,
            marital_status: formData.marital_status,
            core_dept: formData.core_dept,
            sub_dept: formData.sub_dept,
            role: 'member',
          },
        ]);

        if (profileError) throw profileError;
      }

      setMessage({ type: 'success', text: 'Registration successful! You can now log in.' });
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to register.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '500px', margin: '40px auto', fontFamily: 'sans-serif' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px', textAlign: 'center' }}>
        Church Member Registration
      </h1>

      {message.text && (
        <div
          style={{
            padding: '10px',
            backgroundColor: message.type === 'success' ? '#dcfce7' : '#fee2e2',
            color: message.type === 'success' ? '#15803d' : '#dc2626',
            borderRadius: '6px',
            fontSize: '14px',
            marginBottom: '16px',
          }}
        >
          {message.text}
        </div>
      )}

      <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', marginBottom: '4px' }}>Full Name *</label>
          <input type="text" name="full_name" required value={formData.full_name} onChange={handleChange} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc', boxSizing: 'border-box' }} />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', marginBottom: '4px' }}>Email Address *</label>
          <input type="email" name="email" required value={formData.email} onChange={handleChange} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc', boxSizing: 'border-box' }} />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', marginBottom: '4px' }}>Password *</label>
          <input type="password" name="password" required value={formData.password} onChange={handleChange} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc', boxSizing: 'border-box' }} />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', marginBottom: '4px' }}>Phone Number</label>
          <input type="text" name="phone" value={formData.phone} onChange={handleChange} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc', boxSizing: 'border-box' }} />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            backgroundColor: '#2563eb',
            color: '#ffffff',
            padding: '12px',
            borderRadius: '6px',
            border: 'none',
            fontWeight: 'bold',
            cursor: 'pointer',
            marginTop: '10px',
          }}
        >
          {loading ? 'Submitting...' : 'Register Member'}
        </button>
      </form>
    </div>
  );
}
