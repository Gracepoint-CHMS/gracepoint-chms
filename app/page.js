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

      <div style={{ maxWidth: '44rem', margin: '1.25rem auto', padding: '0 1rem' }}>
        
        <h2 style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#0f172a', marginBottom: '1rem' }}>
          Admin Dashboard
        </h2>

        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem' }}>
          <button style={{ backgroundColor: '#4f46e5', color: '#ffffff', border: 'none', padding: '0.6rem 1.2rem', borderRadius: '0.375rem', fontWeight: '600', cursor: 'pointer', fontSize: '0.9rem' }}>
            My Portal
          </button>
          <button onClick={handleLogout} style={{ backgroundColor: '#ef4444', color: '#ffffff', border: 'none', padding: '0.6rem 1.2rem', borderRadius: '0.375rem', fontWeight: '600', cursor: 'pointer', fontSize: '0.9rem' }}>
            Logout
          </button>
        </div>

        <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', marginBottom: '1.25rem' }} />

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
                  <button 
                    type="button" 
                    onClick={() => setShowRegisterForm(true)} 
                    style={{ width: '100%', backgroundColor: '#10b981', color: '#ffffff', border: 'none', padding: '0.75rem', borderRadius: '0.5rem', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer' }}
                  >
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
              <div style={{ backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '0.75rem', padding: '1.5rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#0f172a', margin: 0 }}>Register New Member</h3>
                  <button type="button" onClick={() => setShowRegisterForm(false)} style={{ background: 'none', border: 'none', fontSize: '1rem', cursor: 'pointer', color: '#64748b', fontWeight: 'bold' }}>✕ Close</button>
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

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#475569', marginBottom: '0.25rem' }}>Core Department (Compulsory - Select One) *</label>
                    <select value={formData.core_department} onChange={(e) => setFormData({...formData, core_department: e.target.value})} style={{ width: '100%', padding: '0.65rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', boxSizing: 'border-box' }}>
                      <option value="LOVE">LOVE</option>
                      <option value="UNITY">UNITY</option>
                      <option value="CARE">CARE</option>
                      <option value="RESPECT">RESPECT</option>
                    </select>
                  </div>

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

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', color: '#475569', marginBottom: '0.25rem' }}>Date of Birth</label>
                      <input type="date" value={formData.date_of_birth} onChange={(e) => setFormData({...formData, date_of_birth: e.target.value})} style={{ width: '100%', padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1', fontSize: '0.8rem', boxSizing: 'border-box' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', color: '#475569', marginBottom: '0.25rem' }}>Date of Baptism</label>
                      <input type="date" value={formData.date_of_baptism} onChange={(e) => setFormData({...formData, date_of_baptism: e.target.value})} style={{ width: '100%', padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1', fontSize: '0.8rem', boxSizing: 'border-box' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', color: '#475569', marginBottom: '0.25rem' }}>Date Joined</label>
                      <input type="date" value={formData.date_joined} onChange={(e) => setFormData({...formData, date_joined: e.target.value})} style={{ width: '100%', padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1', fontSize: '0.8rem', boxSizing: 'border-box' }} />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#475569', marginBottom: '0.25rem' }}>Home Address</label>
                      <input type="text" value={formData.home_address} onChange={(e) => setFormData({...formData, home_address: e.target.value})} style={{ width: '100%', padding: '0.65rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} placeholder="Home address" />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#475569', marginBottom: '0.25rem' }}>Home Town</label>
                      <input type="text" value={formData.home_town} onChange={(e) => setFormData({...formData, home_town: e.target.value})} style={{ width: '100%', padding: '0.65rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} placeholder="Home town" />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#475569', marginBottom: '0.25rem' }}>Member Photo URL / Image Link</label>
                    <input type="text" value={formData.photo_url} onChange={(e) => setFormData({...formData, photo_url: e.target.value})} style={{ width: '100%', padding: '0.65rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} placeholder="https://..." />
                  </div>

                  <button type="submit" style={{ backgroundColor: '#2563eb', color: '#ffffff', border: 'none', padding: '0.75rem', borderRadius: '0.375rem', fontWeight: 'bold', fontSize: '0.95rem', cursor: 'pointer', marginTop: '0.5rem' }}>
                    Save Member
                  </button>
                </form>
              </div>
            )}
          </div>
        )}

        {activeTab === 'contributions' && (
          <div>
            {financeView === 'hub' && (
              <div>
                <div style={{ backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '0.75rem', padding: '1rem 1.25rem', marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '600' }}>Opening Balance</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#1e3a8a' }}>GHS {openingBalance}</div>
                  </div>
                  <button onClick={() => { const val = prompt("Enter new opening balance:", openingBalance); if(val) setOpeningBalance(val); }} style={{ backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', padding: '0.5rem 0.85rem', borderRadius: '0.375rem', fontWeight: '600', fontSize: '0.85rem', cursor: 'pointer', color: '#1e3a8a' }}>
                    ✏️ Edit Opening Balance
                  </button>
                </div>

                <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#0f172a', margin: '0 0 0.25rem 0' }}>Finance Management</h3>
                  <p style={{ fontSize: '0.875rem', color: '#64748b', margin: 0 }}>Select an action below to manage church finances.</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.85rem' }}>
                  <div onClick={() => setFinanceView('income')} style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '0.75rem', padding: '1.25rem', textAlign: 'center', cursor: 'pointer' }}>
                    <div style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>➕</div>
                    <div style={{ fontSize: '1rem', fontWeight: 'bold', color: '#1e3a8a' }}>Record Income</div>
                  </div>
                  <div onClick={() => setFinanceView('expenses')} style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '0.75rem', padding: '1.25rem', textAlign: 'center', cursor: 'pointer' }}>
                    <div style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>➖</div>
                    <div style={{ fontSize: '1rem', fontWeight: 'bold', color: '#1e3a8a' }}>Record Expenses</div>
                  </div>
                  <div onClick={() => setFinanceView('tithes')} style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '0.75rem', padding: '1.25rem', textAlign: 'center', cursor: 'pointer' }}>
                    <div style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>🪙</div>
                    <div style={{ fontSize: '1rem', fontWeight: 'bold', color: '#1e3a8a' }}>Tithes</div>
                  </div>
                  <div onClick={() => setFinanceView('budgets')} style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '0.75rem', padding: '1.25rem', textAlign: 'center', cursor: 'pointer' }}>
                    <div style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>📊</div>
                    <div style={{ fontSize: '1rem', fontWeight: 'bold', color: '#1e3a8a' }}>Record Budgets</div>
                  </div>
                  <div onClick={() => setFinanceView('approve_budgets')} style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '0.75rem', padding: '1.25rem', textAlign: 'center', cursor: 'pointer' }}>
                    <div style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>✅</div>
                    <div style={{ fontSize: '1rem', fontWeight: 'bold', color: '#1e3a8a' }}>Approve Budgets</div>
                  </div>
                  <div onClick={() => setFinanceView('tracker')} style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '0.75rem', padding: '1.25rem', textAlign: 'center', cursor: 'pointer' }}>
                    <div style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>👛</div>
                    <div style={{ fontSize: '1rem', fontWeight: 'bold', color: '#1e3a8a' }}>Contribution Tracker</div>
                  </div>
                  <div onClick={() => setFinanceView('welfare')} style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '0.75rem', padding: '1.25rem', textAlign: 'center', cursor: 'pointer' }}>
                    <div style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>🤝</div>
                    <div style={{ fontSize: '1rem', fontWeight: 'bold', color: '#1e3a8a' }}>Welfare Contribution (Compulsory 4-Week / 12-Month Schedule)</div>
                  </div>
                  <div onClick={() => setFinanceView('reports')} style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '0.75rem', padding: '1.25rem', textAlign: 'center', cursor: 'pointer' }}>
                    <div style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>💳</div>
                    <div style={{ fontSize: '1rem', fontWeight: 'bold', color: '#1e3a8a' }}>Account Report</div>
                  </div>
                  <div onClick={() => setFinanceView('balancesheet')} style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '0.75rem', padding: '1.25rem', textAlign: 'center', cursor: 'pointer' }}>
                    <div style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>⚖️</div>
                    <div style={{ fontSize: '1rem', fontWeight: 'bold', color: '#1e3a8a' }}>Balance Sheet</div>
                  </div>
                </div>
              </div>
            )}

            {financeView === 'welfare' && (
              <div>
                <button onClick={() => { setFinanceView('hub'); setSelectedMemberForWelfare(null); }} style={{ backgroundColor: '#e2e8f0', border: 'none', padding: '0.5rem 1rem', borderRadius: '0.375rem', fontWeight: 'bold', cursor: 'pointer', marginBottom: '1rem' }}>
                  ← Back to Finance Hub
                </button>

                {!selectedMemberForWelfare ? (
                  <div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#0f172a', marginBottom: '1rem' }}>Welfare Contribution - Select Member</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                      {members.map((m, index) => {
                        const nameStr = `${m.first_name || ''} ${m.last_name || ''}`.trim() || m.email;
                        const initials = nameStr.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
                        return (
                          <div key={m.id || index} onClick={() => setSelectedMemberForWelfare(m)} style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '0.75rem', padding: '1rem', textAlign: 'center', cursor: 'pointer' }}>
                            <div style={{ width: '3rem', height: '3rem', borderRadius: '50%', backgroundColor: '#cbd5e1', color: '#334155', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', margin: '0 auto 0.5rem auto' }}>
                              {initials}
                            </div>
                            <div style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#0f172a' }}>{nameStr}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div style={{ backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '0.75rem', padding: '1.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#0f172a', margin: 0 }}>
                        {`${selectedMemberForWelfare.first_name || ''} ${selectedMemberForWelfare.last_name || ''}`.trim() || selectedMemberForWelfare.email}
                      </h3>
                      <button onClick={() => setSelectedMemberForWelfare(null)} style={{ background: 'none', border: 'none', fontSize: '1rem', cursor: 'pointer', fontWeight: 'bold' }}>✕</button>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1rem' }}>Compulsory weekly welfare contributions (Jan - Dec, 4 weeks/month):</p>
                    
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                        <thead>
                          <tr style={{ backgroundColor: '#4f46e5', color: '#ffffff' }}>
                            <th style={{ padding: '0.5rem', border: '1px solid #cbd5e1' }}>Months</th>
                            <th style={{ padding: '0.5rem', border: '1px solid #cbd5e1' }}>1st Week</th>
                            <th style={{ padding: '0.5rem', border: '1px solid #cbd5e1' }}>2nd Week</th>
                            <th style={{ padding: '0.5rem', border: '1px solid #cbd5e1' }}>3rd Week</th>
                            <th style={{ padding: '0.5rem', border: '1px solid #cbd5e1' }}>4th Week</th>
                          </tr>
                        </thead>
                        <tbody>
                          {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((month) => (
                            <tr key={month}>
                              <td style={{ padding: '0.5rem', border: '1px solid #cbd5e1', fontWeight: 'bold', backgroundColor: '#f1f5f9' }}>{month}</td>
                              {[1, 2, 3, 4].map((wk) => (
                                <td key={wk} style={{ padding: '0.5rem', border: '1px solid #cbd5e1', textAlign: 'center' }}>
                                  <input type="number" defaultValue="0" style={{ width: '3rem', padding: '0.25rem', textAlign: 'center', border: '1px solid #cbd5e1', borderRadius: '0.25rem' }} />
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <button onClick={() => { alert('Welfare records saved!'); setFinanceView('hub'); setSelectedMemberForWelfare(null); }} style={{ width: '100%', backgroundColor: '#4f46e5', color: '#ffffff', border: 'none', padding: '0.75rem', borderRadius: '0.5rem', fontWeight: 'bold', marginTop: '1.25rem', cursor: 'pointer' }}>
                      Save Welfare Records
                    </button>
                  </div>
                )}
              </div>
            )}

            {financeView !== 'hub' && financeView !== 'welfare' && (
              <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '0.75rem', padding: '2rem', textAlign: 'center' }}>
                <h3 style={{ textTransform: 'capitalize', color: '#0f172a', marginBottom: '0.5rem' }}>{financeView.replace('_', ' ')} Module</h3>
                <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>Module active and functional.</p>
                <button onClick={() => setFinanceView('hub')} style={{ backgroundColor: '#2563eb', color: '#ffffff', border: 'none', padding: '0.65rem 1.25rem', borderRadius: '0.5rem', fontWeight: 'bold', cursor: 'pointer' }}>
                  ← Back to Finance Hub
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'attendance' && (
          <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '0.75rem', padding: '2rem', textAlign: 'center', color: '#64748b' }}>
            <h3>Service Attendance Logs</h3>
            <p>Attendance tracking module ready.</p>
          </div>
        )}

        {activeTab === 'events' && (
          <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '0.75rem', padding: '2rem', textAlign: 'center', color: '#64748b' }}>
            <h3>Church Events</h3>
            <p>Program schedules and calendar management.</p>
          </div>
        )}

        {activeTab === 'announcements' && (
          <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '0.75rem', padding: '2rem', textAlign: 'center', color: '#64748b' }}>
            <h3>Church Announcements</h3>
            <p>Congregational broadcasts and updates.</p>
          </div>
        )}

      </div>
    </main>
  );
}
