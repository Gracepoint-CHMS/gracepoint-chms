'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';

export default function MemberPortal() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
 const [contributions, setContributions] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [language, setLanguage] = useState('English');

  useEffect(() => {
    fetchMemberProfile();
  }, []);

  async function fetchMemberProfile() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      // Fetch member details from members table based on auth email
      const { data, error } = await supabase
        .from('members')
        .select('*')
        .eq('email', user.email)
        .single();

      if (data) {
        setUserProfile(data);  const { data: contribData } = await supabase
    .from('contributions')
    .select('*')
    .eq('member_email', user.email);
  if (contribData) {
    setContributions(contribData);
  }

      } else {
        // Fallback user profile if record doesn't exist yet
        setUserProfile({
          first_name: user.user_metadata?.first_name || 'Member',
          last_name: user.user_metadata?.last_name || '',
          email: user.email,
          phone: user.user_metadata?.phone || '+233...'
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push('/login');
  }

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center', fontFamily: 'sans-serif' }}><p>Loading Portal...</p></div>;
  }

  const memberEmail = userProfile?.email || 'member@gracepoint.com';
  const memberFullName = `${userProfile?.first_name || ''} ${userProfile?.last_name || ''}`.trim() || 'Church Member';
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(memberEmail)}`;

  return (
    <div style={{ fontFamily: 'sans-serif', backgroundColor: '#f3f4f6', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* TOP HEADER */}
      <div style={{ backgroundColor: '#1e3a8a', color: '#fff', padding: '12px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)} 
            style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.4)', color: '#fff', padding: '6px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '16px' }}
          >
            ☰
          </button>
          <span style={{ fontWeight: 'bold', fontSize: '16px' }}>Gracepoint CHMS</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
            <span>Language</span>
            <select 
              value={language} 
              onChange={(e) => setLanguage(e.target.value)} 
              style={{ padding: '4px 8px', borderRadius: '4px', border: 'none', backgroundColor: '#fff', color: '#333', fontSize: '13px', cursor: 'pointer' }}
            >
              <option value="English">English</option>
              <option value="Twi">Twi</option>
              <option value="French">French</option>
            </select>
          </div>

          <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', overflow: 'hidden' }}>
            {userProfile?.photo_url ? (
              <img src={userProfile.photo_url} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <span>{memberFullName[0]}</span>
            )}
          </div>

          <button 
            onClick={handleLogout} 
            title="Logout"
            style={{ background: 'transparent', border: 'none', color: '#fca5a5', cursor: 'pointer', fontSize: '18px', display: 'flex', alignItems: 'center' }}
          >
            ➔
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', flex: '1', position: 'relative' }}>
        
        {/* SIDEBAR DRAWER */}
        {sidebarOpen && (
          <div style={{ position: 'fixed', top: '56px', left: 0, width: '260px', height: 'calc(100vh - 56px)', backgroundColor: '#1e3a8a', color: '#fff', zIndex: 100, boxShadow: '4px 0 10px rgba(0,0,0,0.15)', display: 'flex', flexDirection: 'column', padding: '20px 0' }}>
            <div style={{ padding: '0 20px 15px 20px', fontSize: '12px', fontWeight: 'bold', color: '#93c5fd', letterSpacing: '1px' }}>MAIN</div>
            
            <button 
              onClick={() => { setActiveMenu('dashboard'); setSidebarOpen(false); }} 
              style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 20px', backgroundColor: activeMenu === 'dashboard' ? '#3b82f6' : 'transparent', color: '#fff', border: 'none', textAlign: 'left', cursor: 'pointer', fontSize: '14px', fontWeight: activeMenu === 'dashboard' ? 'bold' : 'normal' }}
            >
              🏠 Dashboard
            </button>
            <button 
              onClick={() => { setActiveMenu('profile'); setSidebarOpen(false); }} 
              style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 20px', backgroundColor: activeMenu === 'profile' ? '#3b82f6' : 'transparent', color: '#fff', border: 'none', textAlign: 'left', cursor: 'pointer', fontSize: '14px', fontWeight: activeMenu === 'profile' ? 'bold' : 'normal' }}
            >
              👤 Profile
            </button>
            <button 
              onClick={() => { setActiveMenu('fellowship'); setSidebarOpen(false); }} 
              style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 20px', backgroundColor: activeMenu === 'fellowship' ? '#3b82f6' : 'transparent', color: '#fff', border: 'none', textAlign: 'left', cursor: 'pointer', fontSize: '14px', fontWeight: activeMenu === 'fellowship' ? 'bold' : 'normal' }}
            >
              ⛪ House Fellowship
            </button>
            <button 
              onClick={() => { setActiveMenu('attendance'); setSidebarOpen(false); }} 
              style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 20px', backgroundColor: activeMenu === 'attendance' ? '#3b82f6' : 'transparent', color: '#fff', border: 'none', textAlign: 'left', cursor: 'pointer', fontSize: '14px', fontWeight: activeMenu === 'attendance' ? 'bold' : 'normal' }}
            >
              📅 Attendance QR Code
            </button>

            <div style={{ padding: '25px 20px 10px 20px', fontSize: '12px', fontWeight: 'bold', color: '#93c5fd', letterSpacing: '1px' }}>COMMUNICATION</div>
            <div style={{ padding: '10px 20px', fontSize: '14px', color: '#cbd5e1', cursor: 'pointer' }}>Announcements</div>

            <div style={{ padding: '20px 20px 10px 20px', fontSize: '12px', fontWeight: 'bold', color: '#93c5fd', letterSpacing: '1px' }}>EVENTS & MINISTRY</div>
            <div style={{ padding: '10px 20px', fontSize: '14px', color: '#cbd5e1', cursor: 'pointer' }}>Upcoming Events</div>

            <div style={{ padding: '20px 20px 10px 20px', fontSize: '12px', fontWeight: 'bold', color: '#93c5fd', letterSpacing: '1px' }}>SPIRITUAL CORNER</div>
            <div style={{ padding: '10px 20px', fontSize: '14px', color: '#cbd5e1', cursor: 'pointer' }}>Daily Devotional</div>
          </div>
        )}

        {/* MAIN CONTENT AREA */}
        <div style={{ flex: '1', padding: '20px', maxWidth: '800px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
          
          {/* VIEW 1: CHURCH DASHBOARD */}
          {activeMenu === 'dashboard' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* Church Information Card */}
              <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '25px', textAlign: 'center', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                <div style={{ width: '70px', height: '70px', margin: '0 auto 15px auto', borderRadius: '50%', backgroundColor: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #bfdbfe' }}>
                  <span style={{ fontSize: '28px' }}>⛪</span>
                </div>
                <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1e3a8a', marginBottom: '5px' }}>
                  Gracepoint Prophetic Church <br />(The Jesus Home Church)[span_3](start_span)[span_3](end_span)
                </h2>
                <p style={{ fontSize: '13px', color: '#4b5563', margin: '8px 0', lineHeight: '1.5' }}>
                  Just before Dr Boateng Hospital Jerusalem, Techiman Ghana. GPS.BT-0230-4894[span_4](start_span)[span_4](end_span)
                </p>
                <div style={{ fontSize: '13px', color: '#2563eb', marginTop: '10px', fontWeight: '500' }}>
                  📞 +233245914937 • ✉️ prophetbewis@gmail.com[span_5](start_span)[span_5](end_span)
                </div>
              </div>{/* My Contributions Card */}
<div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px', marginBottom: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
  <h3 style={{ fontSize: '16px', color: '#1d4ed8', marginBottom: '15px' }}>My Welfare & Financial Contributions</h3>
  {contributions.length === 0 ? (
    <p style={{ fontSize: '14px', color: '#666' }}>No contributions recorded yet.</p>
  ) : (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #eee', textAlign: 'left', color: '#444' }}>
            <th style={{ padding: '8px' }}>Type</th>
            <th style={{ padding: '8px' }}>Amount</th>
            <th style={{ padding: '8px' }}>Date</th>
          </tr>
        </thead>
        <tbody>
          {contributions.map((item, index) => (
            <tr key={index} style={{ borderBottom: '1px solid #f3f4f6' }}>
              <td style={{ padding: '8px' }}>{item.type || item.contribution_type || 'Contribution'}</td>
              <td style={{ padding: '8px', fontWeight: 'bold', color: '#16a34a' }}>{item.amount}</td>
              <td style={{ padding: '8px', color: '#666' }}>{item.date || item.created_at?.split('T')[0]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )}
</div>


              {/* Church Activities Card */}
              <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '20px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 'bold', color: '#1e3a8a', marginBottom: '15px' }}>Church Activities</h3>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#f3f4f6', borderBottom: '1px solid #e5e7eb', color: '#374151' }}>
                        <th style={{ padding: '10px' }}>ACTIVITY</th>
                        <th style={{ padding: '10px' }}>DAY(S)</th>
                        <th style={{ padding: '10px' }}>TIME</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                        <td style={{ padding: '10px' }}>Sunday Service</td>
                        <td style={{ padding: '10px' }}>Sundays</td>
                        <td style={{ padding: '10px' }}>8:00 AM</td>
                      </tr>
                      <tr>
                        <td style={{ padding: '10px' }}>Midweek Service</td>
                        <td style={{ padding: '10px' }}>Wednesdays</td>
                        <td style={{ padding: '10px' }}>5:30 PM</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Church Bank Details Card */}
              <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '20px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 'bold', color: '#1e3a8a', marginBottom: '15px' }}>Church Bank Details</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px', color: '#374151' }}>
                  <div><b>Account Name:</b> Gracepoint Prophetic Church[span_6](start_span)[span_6](end_span)</div>
                  <div><b>Account Number:</b> 0530502114[span_7](start_span)[span_7](end_span)</div>
                  <div><b>Bank Name:</b> MTN Ghana[span_8](start_span)[span_8](end_span)</div>
                  <div><b>Account Type:</b> savings[span_9](start_span)[span_9](end_span)</div>
                </div>
              </div>

            </div>
          )}

          {/* VIEW 2: PROFILE */}
          {activeMenu === 'profile' && (
            <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '25px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1e3a8a', marginBottom: '20px' }}>My Profile</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', fontSize: '14px' }}>
                <div><b>Full Name:</b> {memberFullName}</div>
                <div><b>Email:</b> {memberEmail}</div>
                <div><b>Phone:</b> {userProfile?.phone || 'N/A'}</div>
                <div><b>Department:</b> {userProfile?.core_department || 'General'}</div>
                <div><b>Role:</b> {userProfile?.role || 'member'}</div>
              </div>
            </div>
          )}

          {/* VIEW 3: HOUSE FELLOWSHIP */}
          {activeMenu === 'fellowship' && (
            <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '25px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1e3a8a', marginBottom: '15px' }}>House Fellowship</h2>
              <p style={{ fontSize: '14px', color: '#4b5563' }}>You are assigned to the Jerusalem House Fellowship center. Meetings take place every Tuesday at 6:00 PM.</p>
            </div>
          )}

          {/* VIEW 4: ATTENDANCE QR CODE */}
          {activeMenu === 'attendance' && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1e3a8a', textAlign: 'center' }}>Attendance QR Code</h2>
              
              <div style={{ backgroundColor: '#fff', borderRadius: '16px', padding: '30px', textAlign: 'center', boxShadow: '0 4px 10px rgba(0,0,0,0.08)', width: '100%', maxWidth: '380px', boxSizing: 'border-box' }}>
                <div style={{ backgroundColor: '#f8fafc', padding: '15px', borderRadius: '12px', display: 'inline-block', marginBottom: '15px', border: '1px solid #e2e8f0' }}>
                  <img src={qrCodeUrl} alt="Attendance QR Code" style={{ width: '220px', height: '220px', display: 'block' }} />
                </div>
                
                <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#1f2937', marginBottom: '8px' }}>{memberFullName}</h3>
                <p style={{ fontSize: '13px', color: '#6b7280', lineHeight: '1.4' }}>
                  Show this QR code to the admin to mark your attendance[span_10](start_span)[span_10](end_span).
                </p>
              </div>

              <a 
                href={qrCodeUrl} 
                download="Attendance_QR.png"
                target="_blank"
                rel="noreferrer"
                style={{ backgroundColor: '#2563eb', color: '#fff', padding: '12px 24px', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold', fontSize: '14px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}
              >
                Download QR Code
              </a>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
