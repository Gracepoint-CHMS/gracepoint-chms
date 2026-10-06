'use client';

import { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    coreDept: '',
    subDept: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      // 1. Sign up user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
          },
        },
      });

      if (authError) throw authError;

      const userId = authData.user?.id;

      // 2. Insert into the database table with matching column names
      const { error: dbError } = await supabase.from('members').insert([
        {
          id: userId,
          full_name: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          core_department: formData.coreDept,
          sub_department: formData.subDept,
          role: 'member',
        },
      ]);

      if (dbError) {
        // Fallback check if table uses shorter column names (core_dept/sub_dept/name)
        const { error: fallbackError } = await supabase.from('members').insert([
          {
            id: userId,
            name: formData.fullName,
            email: formData.email,
            phone: formData.phone,
            core_dept: formData.coreDept,
            sub_dept: formData.subDept,
            role: 'member',
          },
        ]);

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
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc', padding: '1rem', fontFamily: 'sans-serif' }}>
      <div style={{ backgroundColor: '#fff', padding: '2rem', borderRadius: '8px', maxWidth: '420px', width: '100%', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
        <h2 style={{ color: '#0f172a', marginTop: 0, textAlign: 'center' }}>Member Registration</h2>

        {errorMsg && (
          <div style={{ backgroundColor: '#f8d7da', color: '#842029', padding: '0.75rem', borderRadius: '4px', marginBottom: '1rem', fontSize: '0.9rem' }}>
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#334155' }}>Full Name</label>
            <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} required placeholder="e.g. Mathew Duut" style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #cbd5e1', marginTop: '0.25rem' }} />
          </div>

          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#334155' }}>Email Address</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="name@domain.com" style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #cbd5e1', marginTop: '0.25rem' }} />
          </div>

          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#334155' }}>Phone Number</label>
            <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="+233..." style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #cbd5e1', marginTop: '0.25rem' }} />
          </div>

          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#334155' }}>Core Department</label>
            <input type="text" name="coreDept" value={formData.coreDept} onChange={handleChange} placeholder="e.g. CARE" style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #cbd5e1', marginTop: '0.25rem' }} />
          </div>

          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#334155' }}>Sub Department</label>
            <input type="text" name="subDept" value={formData.subDept} onChange={handleChange} placeholder="e.g. Men Ministry" style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #cbd5e1', marginTop: '0.25rem' }} />
          </div>

          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#334155' }}>Password</label>
            <input type="password" name="password" value={formData.password} onChange={handleChange} required placeholder="••••••••" style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #cbd5e1', marginTop: '0.25rem' }} />
          </div>

          <button type="submit" disabled={loading} style={{ backgroundColor: '#0d6efd', color: '#fff', border: 'none', padding: '0.75rem', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', marginTop: '0.5rem' }}>
            {loading ? 'Registering...' : 'Register Member'}
          </button>
        </form>
      </div>
    </div>
  );
}
