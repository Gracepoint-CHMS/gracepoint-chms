'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function Home() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState('member');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('members');
  const [financeView, setFinanceView] = useState('hub');
  
  const [members, setMembers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [selectedMemberForWelfare, setSelectedMemberForWelfare] = useState(null);
  const [openingBalance, setOpeningBalance] = useState('2,484.32');

  // Comprehensive Registration Form State
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    role: 'member',
    core_department: 'LOVE',
    sub_departments: [],
    date_of_birth: '',
    date_of_baptism: '',
    date_joined: '',
    home_address: '',
    home_town: '',
    photo_url: ''
  });
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  const subDeptList = [
    'Ushering Department',
    'Choir/Music Department',
    'Prayer Warriors',
    'General Assembly',
    'Men Ministry',
    'Women Ministry',
    'Ministry Evangelical department',
    'Pastoral Ministry',
    'Children Ministry'
  ];

  useEffect(() => {
    async function getData() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session && session.user) {
        setUser(session.user);
        const { data: memberData } = await supabase
          .from('members')
          .select('*')
          .eq('email', session.user.email)
          .single();

        if (memberData) {
          setRole(memberData.role);
        }
      }

      fetchMembers();
    }
    getData();
  }, []);

  async function fetchMembers() {
    const { data: allMembers } = await supabase
      .from('members')
      .select('*');

    if (allMembers) {
      setMembers(allMembers);
    }
    setLoading(false);
  }

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  const handleSubDeptToggle = (dept) => {
    const current = formData.sub_departments;
    if (current.includes(dept)) {
      setFormData({ ...formData, sub_departments: current.filter(d => d !== dept) });
    } else {
      setFormData({ ...formData, sub_departments: [...current, dept] });
    }
  };

  const handleRegisterMember = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    const payload = {
      ...formData,
      sub_departments: formData.sub_departments.join(', ')
    };

    const { error } = await supabase
      .from('members')
      .insert([payload]);

    if (error) {
      setFormError(error.message);
    } else {
      setFormSuccess('Member successfully registered with all details!');
      setFormData({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        role: 'member',
        core_department: 'LOVE',
        sub_departments: [],
        date_of_birth: '',
        date_of_baptism: '',
        date_joined: '',
        home_address: '',
        home_town: '',
        photo_url: ''
      });
      fetchMembers();
      setTimeout(() => {
        setShowRegisterForm(false);
        setFormSuccess('');
      }, 1500);
    }
  };

  const filteredMembers = members.filter((m) => {
    const fullName = `${m.first_name || ''} ${m.last_name || ''}`.toLowerCase();
    const email = (m.email || '').toLowerCase();
    const query = searchQuery.toLowerCase();
    return fullName.includes(query) || email.includes(query);
  });

  if (loading) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', fontFamily: 'system-ui, sans-serif', color: '#64748b' }}>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: 'system-ui, sans-serif', paddingBottom: '2.5rem' }}>
      
      {/* Top Header Bar */}
      <div style={{ backgroundColor: '#2563eb', color: '#ffffff', padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 'bold', margin: 0, lineHeight: 1.2 }}>
          Gracepoint CHMS
        </h1>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <span style={{ fontSize: '0.9rem', cursor: 'pointer' }}>Language: English</span>
          <button 
            onClick={handleLogout}
            style={{ backgroundColor: 'transparent', color: '#ffffff', border: '1px solid #ffffff', padding: '0.35rem 0.85rem', borderRadius: '0.375rem', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem' }}
          >
            Logout
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div style={{ maxWidth: '44rem', margin: '1.25rem auto', padding: '0 1rem' }}>
        
        <h2 style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#0f172a', marginBottom: '1rem' }}>
          Admin Dashboard
        </h2>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem' }}>
          <button style={{ backgroundColor: '#4f46e5', color: '#ffffff', border: 'none', padding: '0.6rem 1.2rem', borderRadius: '0.375rem', fontWeight: '600', cursor: 'pointer', fontSize: '0.9rem' }}>
            My Portal
          </button>
          <button onClick={handleLogout} style={{ backgroundColor: '#ef4444', color: '#ffffff', border: 'none', padding: '0.6rem 1.2rem', borderRadius: '0.375rem', fontWeight: '600', cursor: 'pointer', fontSize: '0.9rem' }}>
            Logout
          </button>
        </div>

        <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', marginBottom: '1.25rem' }} />

        {/* Navigation Tabs */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.25rem' }}>
          {['Members', 'Contributions', 'Attendance', 'Events', 'Announcements'].map((tab) => {
            const isActive = activeTab === tab.toLowerCase();
            return (
              <button 
                key={tab}
                onClick={() => { setActiveTab(tab.toLowerCase()); setFinanceView('hub'); setShowRegisterForm(false); }}
                style={{ 
                  backgroundColor: isActive ? '#2563eb' : '#f1f5f9', 
                  color: isActive ? '#ffffff' : '#334155', 
                  border: 'none', 
                  padding: '0.65rem 1rem', 
                  borderRadius: '0.5rem', 
                  fontWeight: '600', 
                  cursor: 'pointer', 
                  fontSize: '0.9rem' 
                }}
              >
                {tab}
              </button>
            );
          })}
        </div>

        {/* Members Tab */}
        {activeTab === 'members' && (
          <div>
            {!showRegisterForm ? (
              <div>
                <div style={{ marginBottom: '0.75rem' }}>
                  <input 
                    type="text" 
                    placeholder="Search name or email..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', fontSize: '0.95rem', boxSizing: 'border-box', backgroundColor: '#ffffff' }}
                  />
                </div>
                <div style={{ marginBottom: '1.5rem' }}>
                  <button onClick={() => setShowRegisterForm(true)} style={{ width: '100%', backgroundColor: '#10b981', color: '#ffffff', border: 'none', padding: '0.75rem', borderRadius: '0.5rem', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer' }}>
                    + Add New Member
                  </button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {filteredMembers.map((m, index) => {
                    const nameStr = `${m.first_name || ''} ${m.last_name || ''}`.trim() || m.email;
                    const initials = nameStr.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
                    return (
                      <div key={m.id || index} style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '0.75rem', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                          <div style={{ width: '2.75rem', height: '2.75rem', borderRadius: '50%', backgroundColor: '#cbd5e1', color: '#334155', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                            {initials}
                          </div>
                          <div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Photo & Name</div>
                            <div style={{ fontSize: '1rem', fontWeight: 'bold', color: '#0f172a' }}>{nameStr}</div>
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Contact & Address</div>
                          <div style={{ fontSize: '0.875rem', color: '#0f172a' }}>{m.email}</div>
                          <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{m.home_address || 'No address'}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              /* Comprehensive Member Registration Form */
              <div style={{ backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '0.75rem', padding: '1.5rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#0f172a', margin: 0 }}>Register New Member</h3>
                  <button onClick={() => setShowRegisterForm(false)} style={{ background: 'none', border: 'none', fontSize: '1rem', cursor: 'pointer', color: '#64748b', fontWeight: 'bold' }}>✕ Close</button>
                </div>

                {formError && <div style={{ backgroundColor: '#fee2e2', color: '#991b1b', padding: '0.75rem', borderRadius: '0.375rem', marginBottom: '1rem', fontSize: '0.875rem' }}>{formError}</div>}
                {formSuccess && <div style={{ backgroundColor: '#d1fae5', color: '#065f46', padding: '0.75rem', borderRadius: '0.375rem', marginBottom: '1rem', fontSize: '0.875rem' }}>{formSuccess}</div>}

                <form onSubmit={handleRegisterMember} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#475569', marginBottom: '0.25rem' }}>First Name *</label>
                      <input type="text" required value={formData.first_name} onChange={(e) => setFormData({...formData, first_name: e.target.value})} style={{ width: '100%', padding: '0.65rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} placeholder="First name" />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#475569', marginBottom: '0.25rem' }}>Last Name *</label>
                      <input type="text" required value={formData.last_name} onChange={(e) => setFormData({...formData, last_name: e.target.value})} style={{ width: '100%', padding: '0.65rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} placeholder="Last name" />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#475569', marginBottom: '0.25rem' }}>Email Address *</label>
                      <input type="email" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} style={{ width: '100%', padding: '0.65rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} placeholder="Email" />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#475569', marginBottom: '0.25rem' }}>Phone Number</label>
                      <input type="text" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} style={{ width: '100%', padding: '0.65rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} placeholder="Phone" />
                    </div>
                  </div>

                  {/* Core Department (Compulsory - Select One) */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#475569', marginBottom: '0.25rem' }}>Core Department (Compulsory - Select One) *</label>
                    <select value={formData.core_department} onChange={(e) => setFormData({...formData, core_department: e.target.value})} style={{ width: '100%', padding: '0.65rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', boxSizing: 'border-box' }}>
                      <option value="LOVE">LOVE</option>
                      <option value="UNITY">UNITY</option>
                      <option value="CARE">CARE</option>
                      <option value="RESPECT">RESPECT</option>
                    </select>
                  </div>

                  {/* Sub-Departments (Multi-select) */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#475569', marginBottom: '0.25rem' }}>Sub-Departments (Select multiple as applicable)</label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', maxHeight: '10rem', overflowY: 'auto', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '0.375rem', backgroundColor: '#f8fafc' }}>
                      {subDeptList.map((dept) => (
                        <label key={dept} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', cursor: 'pointer' }}>
                          <input 
                            type="checkbox" 
                            checked={formData.sub_departments.includes(dept)} 
                            onChange={() => handleSubDeptToggle(dept)} 
                          />
                          {dept}
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Dates: DOB, Baptism, Joined */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', color: '#475569', marginBottom: '0.25rem' }}>Date of Birth</label>
                      <input type="date" value={formData.date_of_birth} onChange={(e) => setFormData({...formData, date_of_birth: e.target.value})} style={{ width: '100%', padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1', fontSize: '0.8rem', boxSizing: 'border-box' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', color: '#475569', marginBottom: '0.25rem' }}>Date of Baptism</label>
                      <input type="date" value={formData.date_of_baptism} onChange={(e) => setFormData({...formData, date_of_baptism: e.target.value})} style={{ width: '100%', padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1', fontSize: '0.8rem', boxSizing: 'border-box' }} />
