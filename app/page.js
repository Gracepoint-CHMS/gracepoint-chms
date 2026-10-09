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

      // Fetch all members for admin view
      const { data: allMembers } = await supabase
        .from('members')
        .select('*');

      if (allMembers) {
        setMembers(allMembers);
      }

      setLoading(false);
    }
    getData();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.reload();
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
          <button style={{ backgroundColor: '#ffffff', color: '#2563eb', border: 'none', padding: '0.4rem 0.85rem', borderRadius: '0.375rem', fontWeight: '600', fontSize: '0.85rem', cursor: 'pointer' }}>
            My Portal
          </button>
          <button 
            onClick={handleLogout}
            style={{ backgroundColor: 'transparent', color: '#ffffff', border: '1px solid #ffffff', padding: '0.4rem 0.85rem', borderRadius: '0.375rem', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem' }}
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
                onClick={() => setActiveTab(tab.toLowerCase())}
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

        {/* Members View Content */}
        {activeTab === 'members' && (
          <div>
            {/* Search Input */}
            <div style={{ marginBottom: '0.75rem' }}>
              <input 
                type="text" 
                placeholder="Search name or email..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', fontSize: '0.95rem', boxSizing: 'border-box', backgroundColor: '#ffffff' }}
              />
            </div>

            {/* Department Filter Dropdown */}
            <div style={{ marginBottom: '1rem' }}>
              <select style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', fontSize: '0.95rem', boxSizing: 'border-box', backgroundColor: '#f1f5f9', color: '#334155' }}>
                <option>All Departments</option>
                <option>General</option>
                <option>Choir</option>
                <option>Ushers</option>
              </select>
            </div>

            {/* Add New Member Button */}
            <div style={{ marginBottom: '1.5rem' }}>
              <button style={{ width: '100%', backgroundColor: '#10b981', color: '#ffffff', border: 'none', padding: '0.75rem', borderRadius: '0.5rem', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                + Add New Member
              </button>
            </div>

            {/* Member List Cards */}
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

        {/* Other Tabs Placeholder */}
        {activeTab !== 'members' && (
          <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '0.75rem', padding: '2rem', textAlign: 'center', color: '#64748b' }}>
            <p>Management view for {activeTab} is loading...</p>
          </div>
        )}

      </div>
    </main>
  );
}
