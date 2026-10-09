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
  const [members, setMembers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showRegisterForm, setShowRegisterForm] = useState(false);

  // Form state for new member registration
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    department: 'General',
    role: 'member'
  });
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

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

  const handleRegisterMember = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    const { error } = await supabase
      .from('members')
      .insert([formData]);

    if (error) {
      setFormError(error.message);
    } else {
      setFormSuccess('Member successfully registered!');
      setFormData({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        department: 'General',
        role: 'member'
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
          <span onClick={() => setShowRegisterForm(true)} style={{ fontSize: '0.9rem', cursor: 'pointer' }}>Register</span>
          <span style={{ fontSize: '0.9rem', cursor: 'pointer', fontWeight: 'bold' }}>My Portal</span>
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
                onClick={() => { setActiveTab(tab.toLowerCase()); setShowRegisterForm(false); }}
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

        {/* Register Form View / Modal Overlay */}
        {showRegisterForm ? (
          <div style={{ backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '0.75rem', padding: '1.5rem', marginBottom: '1.5rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#0f172a', margin: 0 }}>Register New Member</h3>
              <button onClick={() => setShowRegisterForm(false)} style={{ background: 'none', border: 'none', fontSize: '1rem', cursor: 'pointer', color: '#64748b', fontWeight: 'bold' }}>✕ Close</button>
            </div>

            {formError && <div style={{ backgroundColor: '#fee2e2', color: '#991b1b', padding: '0.75rem', borderRadius: '0.375rem', marginBottom: '1rem', fontSize: '0.875rem' }}>{formError}</div>}
            {formSuccess && <div style={{ backgroundColor: '#d1fae5', color: '#065f46', padding: '0.75rem', borderRadius: '0.375rem', marginBottom: '1rem', fontSize: '0.875rem' }}>{formSuccess}</div>}

            <form onSubmit={handleRegisterMember} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#475569', marginBottom: '0.25rem' }}>First Name</label>
                  <input type="text" required value={formData.first_name} onChange={(e) => setFormData({...formData, first_name: e.target.value})} style={{ width: '100%', padding: '0.65rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} placeholder="First name" />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#475569', marginBottom: '0.25rem' }}>Last Name</label>
                  <input type="text" required value={formData.last_name} onChange={(e) => setFormData({...formData, last_name: e.target.value})} style={{ width: '100%', padding: '0.65rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} placeholder="Last name" />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#475569', marginBottom: '0.25rem' }}>Email Address</label>
                <input type="email" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} style={{ width: '100%', padding: '0.65rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} placeholder="Email address" />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#475569', marginBottom: '0.25rem' }}>Phone Number</label>
                <input type="text" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} style={{ width: '100%', padding: '0.65rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} placeholder="Phone number" />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#475569', marginBottom: '0.25rem' }}>Department</label>
                  <select value={formData.department} onChange={(e) => setFormData({...formData, department: e.target.value})} style={{ width: '100%', padding: '0.65rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', boxSizing: 'border-box' }}>
                    <option value="General">General</option>
                    <option value="Choir">Choir</option>
                    <option value="Ushers">Ushers</option>
                    <option value="Media">Media</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#475569', marginBottom: '0.25rem' }}>System Role</label>
                  <select value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})} style={{ width: '100%', padding: '0.65rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', boxSizing: 'border-box' }}>
                    <option value="member">Member</option>
                    <option value="admin">Admin</option>
                    <option value="super_admin">Super Admin</option>
                  </select>
                </div>
              </div>

              <button type="submit" style={{ backgroundColor: '#2563eb', color: '#ffffff', border: 'none', padding: '0.75rem', borderRadius: '0.375rem', fontWeight: 'bold', fontSize: '0.95rem', cursor: 'pointer', marginTop: '0.5rem' }}>
                Save Member
              </button>
            </form>
          </div>
        ) : null}

        {/* Members View Content */}
        {activeTab === 'members' && !showRegisterForm && (
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
            <div style={{ marginBottom: '1rem' }}>
              <select style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', fontSize: '0.95rem', boxSizing: 'border-box', backgroundColor: '#f1f5f9', color: '#334155' }}>
                <option>All Departments</option>
                <option>General</option>
                <option>Choir</option>
                <option>Ushers</option>
              </select>
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <button onClick={() => setShowRegisterForm(true)} style={{ width: '100%', backgroundColor: '#10b981', color: '#ffffff', border: 'none', padding: '0.75rem', borderRadius: '0.5rem', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                + Add New Member
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {filteredMembers.length > 0 ? (
                filteredMembers.map((m, index) => {
                  const nameStr = `${m.first_name || ''} ${m.last_name || ''}`.trim() || m.email;
                  const initials = nameStr.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
                  return (
                    <div key={m.id || index} style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '0.75rem', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                        <div style={{ width: '2.75rem', height: '2.75rem', borderRadius: '50%', backgroundColor: '#cbd5e1', color: '#334155', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1rem' }}>
                          {initials || 'M'}
                        </div>
                        <div>
                          <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '500', marginBottom: '0.1rem' }}>Photo & Name</div>
                          <div style={{ fontSize: '1rem', fontWeight: 'bold', color: '#0f172a' }}>{nameStr}</div>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '500', marginBottom: '0.1rem' }}>Contact & Address</div>
                        <div style={{ fontSize: '0.875rem', color: '#0f172a' }}>{m.email}</div>
                        <div style={{ fontSize: '0.875rem', color: '#64748b' }}>{m.phone || '0245914937'}</div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p style={{ textAlign: 'center', color: '#64748b', padding: '2rem' }}>No members found.</p>
              )}
            </div>
          </div>
        )}

        {/* Contributions View Content */}
        {activeTab === 'contributions' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#0f172a', margin: 0 }}>
                Contributions & Financial Records
              </h3>
              <button style={{ backgroundColor: '#10b981', color: '#ffffff', border: 'none', padding: '0.65rem 1rem', borderRadius: '0.5rem', fontWeight: 'bold', fontSize: '0.9rem', cursor: 'pointer' }}>
                + Add Contribution
              </button>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <div style={{ backgroundColor: '#ffffff', padding: '1.25rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#64748b', fontWeight: '600' }}>Total Tithes Collected</span>
                <span style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#16a34a' }}>GHS 0.00</span>
              </div>
              <div style={{ backgroundColor: '#ffffff', padding: '1.25rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#64748b', fontWeight: '600' }}>Total Pledges</span>
                <span style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#2563eb' }}>GHS 0.00</span>
              </div>
              <div style={{ backgroundColor: '#ffffff', padding: '1.25rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#64748b', fontWeight: '600' }}>Total Welfare</span>
                <span style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#d97706' }}>GHS 0.00</span>
              </div>
            </div>

            <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '0.75rem', padding: '1.5rem', textAlign: 'center', color: '#64748b' }}>
              <p style={{ margin: 0 }}>No recent contribution transactions logged yet.</p>
            </div>
          </div>
        )}

        {/* Attendance View Content */}
        {activeTab === 'attendance' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#0f172a', margin: 0 }}>
                Service Attendance Logs
              </h3>
              <button style={{ backgroundColor: '#10b981', color: '#ffffff', border: 'none', padding: '0.65rem 1rem', borderRadius: '0.5rem', fontWeight: 'bold', fontSize: '0.9rem', cursor: 'pointer' }}>
                + Log Attendance
              </button>
            </div>
            <div style={{ backgroundColor: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '0.5rem', padding: '1rem 1.25rem', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', fontWeight: 'bold', color: '#0f172a', fontSize: '0.95rem' }}>
              <span>Service Date</span>
              <span>Department</span>
              <span>Status</span>
            </div>
          </div>
        )}

        {/* Events View Content */}
        {activeTab === 'events' && (
          <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '0.75rem', padding: '2rem', textAlign: 'center', color: '#64748b' }}>
            <h3 style={{ margin: '0 0 0.5rem 0', color: '#0f172a' }}>Church Events</h3>
            <p style={{ margin: 0 }}>Manage upcoming services, programs, and calendar schedules here.</p>
          </div>
        )}

        {/* Announcements View Content */}
        {activeTab === 'announcements' && (
          <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '0.75rem', padding: '2rem', textAlign: 'center', color: '#64748b' }}>
            <h3 style={{ margin: '0 0 0.5rem 0', color: '#0f172a' }}>Church Announcements</h3>
            <p style={{ margin: 0 }}>Post updates and broadcasts for the congregation here.</p>
          </div>
        )}

      </div>
    </main>
  );
}
