'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function AdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('members'); 
  const [activeFinanceView, setActiveFinanceView] = useState('hub'); 

  // Finance states & form states
  const [openingBalance, setOpeningBalance] = useState('2,484.32');
  const [isEditingBalance, setIsEditingBalance] = useState(false);
  const [newBalanceInput, setNewBalanceInput] = useState('2,484.32');

  const [incomeForm, setIncomeForm] = useState({ description: '', amount: '', date: '' });
  const [expenseForm, setExpenseForm] = useState({ description: '', qty: '', rate: '', date: '', approver: '' });
  const [titheForm, setTitheForm] = useState({ member: '', amount: '', date: '' });
  const [pledgeForm, setPledgeForm] = useState({ member: '', purpose: '', amount: '' });

  // Welfare matrix interactive state
  const [welfareData, setWelfareData] = useState({});
  const [selectedWelfareMember, setSelectedWelfareMember] = useState(null);

  // Admin Data states
  const [members, setMembers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('All Departments');

  // New item states for non-finance tabs
  const [attendanceList, setAttendanceList] = useState([]);
  const [attendanceForm, setAttendanceForm] = useState({ service: '', date: '', count: '' });

  const [eventsList, setEventsList] = useState([]);
  const [eventForm, setEventForm] = useState({ title: '', date: '', location: '' });

  const [announcementsList, setAnnouncementsList] = useState([]);
  const [announcementForm, setAnnouncementForm] = useState({ title: '', message: '' });

  const [newMemberForm, setNewMemberForm] = useState({ first_name: '', last_name: '', email: '', phone: '', department: 'Choir' });
  const [showAddMember, setShowAddMember] = useState(false);

  useEffect(() => {
    async function checkAdmin() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }
      
      const { data: memberData } = await supabase.from('members').select('*');
      if (memberData) setMembers(memberData);

      setLoading(false);
    }
    checkAdmin();
  }, [router]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push('/login');
  }

  async function handleAddMember(e) {
    e.preventDefault();
    const { data, error } = await supabase.from('members').insert([newMemberForm]).select();
    if (error) {
      alert('Error adding member: ' + error.message);
    } else {
      if (data) setMembers([...members, data[0]]);
      setShowAddMember(false);
      setNewMemberForm({ first_name: '', last_name: '', email: '', phone: '', department: 'Choir' });
      alert('Member added successfully!');
    }
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'sans-serif' }}>
        <p style={{ color: '#1d4ed8', fontWeight: '500' }}>Loading Admin Dashboard...</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: 'sans-serif' }}>
      
      {/* TOP HEADER BAR */}
      <div style={{ backgroundColor: '#2563eb', color: '#fff', padding: '15px 25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <span style={{ fontSize: '18px', fontWeight: 'bold' }}>Gracepoint CHMS</span>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => router.push('/portal')} style={{ background: 'transparent', color: '#fff', border: '1px solid #fff', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: '500' }}>My Portal</button>
          <button onClick={handleLogout} style={{ background: 'transparent', color: '#fff', border: '1px solid #fff', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: '500' }}>Logout</button>
        </div>
      </div>

      <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#0f172a', marginBottom: '15px' }}>Admin Dashboard</h1>

        {/* Action buttons row */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <button onClick={() => router.push('/portal')} style={{ backgroundColor: '#4f46e5', color: '#fff', border: 'none', padding: '10px 16px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>My Portal</button>
          <button onClick={handleLogout} style={{ backgroundColor: '#ef4444', color: '#fff', border: 'none', padding: '10px 16px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Logout</button>
        </div>

        {/* NAVIGATION TABS */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '20px' }}>
          <button onClick={() => setActiveTab('members')} style={tabBtnStyle(activeTab === 'members')}>Members</button>
          <button onClick={() => { setActiveTab('contributions'); setActiveFinanceView('hub'); }} style={tabBtnStyle(activeTab === 'contributions')}>Contributions</button>
          <button onClick={() => setActiveTab('attendance')} style={tabBtnStyle(activeTab === 'attendance')}>Attendance</button>
          <button onClick={() => setActiveTab('events')} style={tabBtnStyle(activeTab === 'events')}>Events</button>
          <button onClick={() => setActiveTab('announcements')} style={tabBtnStyle(activeTab === 'announcements')}>Announcements</button>
        </div>

        {/* TAB 1: MEMBERS */}
        {activeTab === 'members' && (
          <div>
            <input 
              type="text" 
              placeholder="Search name or email..." 
              style={inputStyle} 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
            />
            
            <select 
              style={{ ...inputStyle, marginBottom: '15px' }} 
              value={departmentFilter} 
              onChange={(e) => setDepartmentFilter(e.target.value)}
            >
              <option value="All Departments">All Departments</option>
              <option value="Choir">Choir</option>
              <option value="Media">Media</option>
              <option value="Ushers">Ushers</option>
            </select>

            <button onClick={() => setShowAddMember(!showAddMember)} style={{ width: '100%', backgroundColor: '#10b981', color: '#fff', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: 'bold', marginBottom: '20px', cursor: 'pointer' }}>
              {showAddMember ? 'Cancel' : '+ Add New Member'}
            </button>

            {showAddMember && (
              <form onSubmit={handleAddMember} style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px', marginBottom: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                <h3 style={{ fontSize: '16px', marginBottom: '15px', color: '#2563eb' }}>New Member Registration</h3>
                <label style={labelStyle}>First Name</label>
                <input type="text" required style={inputStyle} value={newMemberForm.first_name} onChange={(e)=>setNewMemberForm({...newMemberForm, first_name: e.target.value})} />
                <label style={labelStyle}>Last Name</label>
                <input type="text" required style={inputStyle} value={newMemberForm.last_name} onChange={(e)=>setNewMemberForm({...newMemberForm, last_name: e.target.value})} />
                <label style={labelStyle}>Email</label>
                <input type="email" required style={inputStyle} value={newMemberForm.email} onChange={(e)=>setNewMemberForm({...newMemberForm, email: e.target.value})} />
                <label style={labelStyle}>Phone</label>
                <input type="text" style={inputStyle} value={newMemberForm.phone} onChange={(e)=>setNewMemberForm({...newMemberForm, phone: e.target.value})} />
                <button type="submit" style={primaryBtnStyle}>Save Member</button>
              </form>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {members.filter(m => m.first_name?.toLowerCase().includes(searchTerm.toLowerCase())).map((m, idx) => (
                <div key={idx} style={{ backgroundColor: '#fff', padding: '15px 20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', alignItems: 'center' }}>
                  <div>
                    <p style={{ fontSize: '11px', color: '#64748b', fontWeight: 'bold', marginBottom: '5px' }}>Photo & Name</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#fff' }}>
                        {m.first_name?.[0]}
                      </div>
                      <span style={{ fontWeight: '600', color: '#1e293b' }}>{m.first_name} {m.last_name}</span>
                    </div>
                  </div>
                  <div>
                    <p style={{ fontSize: '11px', color: '#64748b', fontWeight: 'bold', marginBottom: '5px' }}>Contact & Address</p>
                    <p style={{ fontSize: '13px', color: '#1e293b', margin: 0 }}>{m.email}</p>
                    <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>{m.phone || 'N/A'}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: CONTRIBUTIONS & FINANCE MANAGEMENT */}
        {activeTab === 'contributions' && (
          <div>
            {activeFinanceView === 'hub' && (
              <div>
                <div style={{ marginBottom: '15px' }}>
                  <button onClick={() => setIsEditingBalance(!isEditingBalance)} style={{ backgroundColor: '#fff', border: '1px solid #cbd5e1', padding: '8px 14px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    ✏️ Edit Opening Balance
                  </button>
                  {isEditingBalance && (
                    <div style={{ backgroundColor: '#fff', padding: '12px', borderRadius: '8px', marginTop: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', display: 'flex', gap: '10px' }}>
                      <input type="text" value={newBalanceInput} onChange={(e)=>setNewBalanceInput(e.target.value)} style={{ ...inputStyle, marginBottom: 0 }} />
                      <button onClick={() => { setOpeningBalance(newBalanceInput); setIsEditingBalance(false); }} style={{ backgroundColor: '#2563eb', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Save</button>
                    </div>
                  )}
                </div>

                <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1e293b', marginBottom: '5px' }}>Finance Management</h2>
                <p style={{ color: '#64748b', marginBottom: '20px', fontSize: '14px' }}>Select an action below to manage church finances.</p>

                <div style={{ backgroundColor: '#fff', padding: '18px 20px', borderRadius: '12px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                  <span style={{ color: '#4b5563', fontWeight: '600' }}>Opening balance:</span>
                  <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#1e293b' }}>GHS {openingBalance}</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '15px' }}>
                  <FinanceCard title="Record Income" icon="➕" onClick={() => setActiveFinanceView('income')} />
                  <FinanceCard title="Record Expenses" icon="➖" onClick={() => setActiveFinanceView('expense')} />
                  <FinanceCard title="Record Tithes" icon="⛪" onClick={() => setActiveFinanceView('tithes')} />
                  <FinanceCard title="Approve Budgets" icon="✅" onClick={() => setActiveFinanceView('budget')} />
                  <FinanceCard title="Contribution Tracker" icon="💼" onClick={() => setActiveFinanceView('tracker')} />
                  <FinanceCard title="Welfare Contribution" icon="🤝" onClick={() => setActiveFinanceView('welfare')} />
                  <FinanceCard title="Balance Sheet" icon="⚖️" onClick={() => setActiveFinanceView('balance-sheet')} />
                  <FinanceCard title="Account Report" icon="💳" onClick={() => setActiveFinanceView('report')} />
                </div>
              </div>
            )}

            {activeFinanceView === 'income' && <FinanceSubView title="Record Income" onBack={() => setActiveFinanceView('hub')}><IncomeForm incomeForm={incomeForm} setIncomeForm={setIncomeForm} /></FinanceSubView>}
            {activeFinanceView === 'expense' && <FinanceSubView title="Record Expenses" onBack={() => setActiveFinanceView('hub')}><ExpenseForm expenseForm={expenseForm} setExpenseForm={setExpenseForm} /></FinanceSubView>}
            {activeFinanceView === 'tithes' && <FinanceSubView title="Record Tithes" onBack={() => setActiveFinanceView('hub')}><TitheForm titheForm={titheForm} setTitheForm={setTitheForm} members={members} /></FinanceSubView>}
            {activeFinanceView === 'budget' && <FinanceSubView title="Approve Budgets" onBack={() => setActiveFinanceView('hub')}><BudgetApproval /></FinanceSubView>}
            {activeFinanceView === 'tracker' && <FinanceSubView title="Contribution Tracker" onBack={() => setActiveFinanceView('hub')}><ContributionTracker members={members} pledgeForm={pledgeForm} setPledgeForm={setPledgeForm} /></FinanceSubView>}
            {activeFinanceView === 'welfare' && <FinanceSubView title="Welfare Contribution" onBack={() => setActiveFinanceView('hub')}><WelfareMatrix members={members} welfareData={welfareData} setWelfareData={setWelfareData} selectedWelfareMember={selectedWelfareMember} setSelectedWelfareMember={setSelectedWelfareMember} /></FinanceSubView>}
            {activeFinanceView === 'balance-sheet' && <FinanceSubView title="Balance Sheet" onBack={() => setActiveFinanceView('hub')}><BalanceSheet /></FinanceSubView>}
            {activeFinanceView === 'report' && <FinanceSubView title="Account Report" onBack={() => setActiveFinanceView('hub')}><AccountReport /></FinanceSubView>}
          </div>
        )}

        {/* TAB 3: ATTENDANCE */}
        {activeTab === 'attendance' && (
          <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '15px' }}>Attendance Records</h2>
            <div style={{ marginBottom: '20px' }}>
              <label style={labelStyle}>Service Name</label>
              <input type="text" placeholder="e.g. Sunday Service" style={inputStyle} value={attendanceForm.service} onChange={(e)=>setAttendanceForm({...attendanceForm, service: e.target.value})} />
              <label style={labelStyle}>Date</label>
              <input type="date" style={inputStyle} value={attendanceForm.date} onChange={(e)=>setAttendanceForm({...attendanceForm, date: e.target.value})} />
              <label style={labelStyle}>Total Attendance Count</label>
              <input type="number" placeholder="0" style={inputStyle} value={attendanceForm.count} onChange={(e)=>setAttendanceForm({...attendanceForm, count: e.target.value})} />
              <button onClick={() => { if(attendanceForm.service){ setAttendanceList([...attendanceList, attendanceForm]); setAttendanceForm({ service: '', date: '', count: '' }); alert('Attendance recorded!'); }}} style={primaryBtnStyle}>Save Attendance</button>
            </div>
            {attendanceList.length > 0 && (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
                <thead>
                  <tr style={{ backgroundColor: '#2563eb', color: '#fff' }}><th style={{ padding: '8px' }}>Service</th><th style={{ padding: '8px' }}>Date</th><th style={{ padding: '8px' }}>Count</th></tr>
                </thead>
                <tbody>
                  {attendanceList.map((a, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}><td style={{ padding: '8px' }}>{a.service}</td><td style={{ padding: '8px' }}>{a.date}</td><td style={{ padding: '8px' }}>{a.count}</td></tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* TAB 4: EVENTS */}
        {activeTab === 'events' && (
          <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '15px' }}>Church Events</h2>
            <div style={{ marginBottom: '20px' }}>
              <label style={labelStyle}>Event Title</label>
              <input type="text" placeholder="e.p. Youth Vigil" style={inputStyle} value={eventForm.title} onChange={(e)=>setEventForm({...eventForm, title: e.target.value})} />
              <label style={labelStyle}>Date</label>
              <input type="date" style={inputStyle} value={eventForm.date} onChange={(e)=>setEventForm({...eventForm, date: e.target.value})} />
              <label style={labelStyle}>Location</label>
              <input type="text" placeholder="Main Auditorium" style={inputStyle} value={eventForm.location} onChange={(e)=>setEventForm({...eventForm, location: e.target.value})} />
              <button onClick={() => { if(eventForm.title){ setEventsList([...eventsList, eventForm]); setEventForm({ title: '', date: '', location: '' }); alert('Event created!'); }}} style={primaryBtnStyle}>Save Event</button>
            </div>
            {eventsList.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {eventsList.map((ev, i) => (
                  <div key={i} style={{ padding: '10px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <strong>{ev.title}</strong> - {ev.date} ({ev.location})
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 5: ANNOUNCEMENTS */}
        {activeTab === 'announcements' && (
          <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '15px' }}>Church Announcements</h2>
            <div style={{ marginBottom: '20px' }}>
              <label style={labelStyle}>Title</label>
              <input type="text" placeholder="Announcement Title" style={inputStyle} value={announcementForm.title} onChange={(e)=>setAnnouncementForm({...announcementForm, title: e.target.value})} />
              <label style={labelStyle}>Message</label>
              <textarea placeholder="Write notice here..." style={{ ...inputStyle, height: '80px' }} value={announcementForm.message} onChange={(e)=>setAnnouncementForm({...announcementForm, message: e.target.value})} />
              <button onClick={() => { if(announcementForm.title){ setAnnouncementsList([...announcementsList, announcementForm]); setAnnouncementForm({ title: '', message: '' }); alert('Announcement broadcasted!'); }}} style={primaryBtnStyle}>Post Announcement</button>
            </div>
            {announcementsList.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {announcementsList.map((an, i) => (
                  <div key={i} style={{ padding: '12px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <h4 style={{ margin: '0 0 5px 0', color: '#1d4ed8' }}>{an.title}</h4>
                    <p style={{ margin: 0, fontSize: '13px', color: '#475569' }}>{an.message}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}

function FinanceCard({ title, icon, onClick }) {
  return (
    <div onClick={onClick} style={{ backgroundColor: '#fff', padding: '22px', borderRadius: '12px', textAlign: 'center', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '45px', height: '45px', borderRadius: '50%', backgroundColor: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', marginBottom: '10px', color: '#16a34a' }}>{icon}</div>
      <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#1e293b', margin: 0 }}>{title}</h3>
    </div>
  );
}

function FinanceSubView({ title, onBack, children }) {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px', gap: '15px' }}>
        <button onClick={onBack} style={{ backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', padding: '6px 12px', cursor: 'pointer', fontWeight: 'bold' }}>← Back</button>
        <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1e293b' }}>{title}</h2>
      </div>
      {children}
    </div>
  );
}

function IncomeForm({ incomeForm, setIncomeForm }) {
  return (
    <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
      <label style={labelStyle}>Source / Description</label>
      <input type="text" placeholder="e.g. Sunday Offering" style={inputStyle} value={incomeForm.description} onChange={(e)=>setIncomeForm({...incomeForm, description: e.target.value})} />
      <label style={labelStyle}>Amount (GHS)</label>
      <input type="number" placeholder="0.00" style={inputStyle} value={incomeForm.amount} onChange={(e)=>setIncomeForm({...incomeForm, amount: e.target.value})} />
      <label style={labelStyle}>Date</label>
      <input type="date" style={inputStyle} value={incomeForm.date} onChange={(e)=>setIncomeForm({...incomeForm, date: e.target.value})} />
      <button onClick={() => alert('Income saved successfully!')} style={primaryBtnStyle}>Save Income</button>
    </div>
  );
}

function ExpenseForm({ expenseForm, setExpenseForm }) {
  return (
    <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
      <label style={labelStyle}>Description</label>
      <textarea placeholder="Expense details" style={{ ...inputStyle, height: '70px' }} value={expenseForm.description} onChange={(e)=>setExpenseForm({...expenseForm, description: e.target.value})} />
      <label style={labelStyle}>Quantity & Rate</label>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        <input type="number" placeholder="Qty" style={inputStyle} value={expenseForm.qty} onChange={(e)=>setExpenseForm({...expenseForm, qty: e.target.value})} />
        <input type="number" placeholder="Rate" style={inputStyle} value={expenseForm.rate} onChange={(e)=>setExpenseForm({...expenseForm, rate: e.target.value})} />
      </div>
      <label style={labelStyle}>Date & Approved By</label>
      <input type="date" style={inputStyle} value={expenseForm.date} onChange={(e)=>setExpenseForm({...expenseForm, date: e.target.value})} />
      <input type="text" placeholder="Approver Name" style={inputStyle} value={expenseForm.approver} onChange={(e)=>setExpenseForm({...expenseForm, approver: e.target.value})} />
      <button onClick={() => alert('Expense saved successfully!')} style={primaryBtnStyle}>Save Expense</button>
    </div>
  );
}

function TitheForm({ titheForm, setTitheForm, members }) {
  return (
    <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
      <label style={labelStyle}>Select Member</label>
      <select style={inputStyle} value={titheForm.member} onChange={(e)=>setTitheForm({...titheForm, member: e.target.value})}>
        <option value="">Choose member...</option>
        {members.map((m, i) => <option key={i} value={`${m.first_name} ${m.last_name}`}>{m.first_name} {m.last_name}</option>)}
      </select>
      <label style={labelStyle}>Amount (GHS)</label>
      <input type="number" placeholder="0.00" style={inputStyle} value={titheForm.amount} onChange={(e)=>setTitheForm({...titheForm, amount: e.target.value})} />
      <label style={labelStyle}>Date</label>
      <input type="date" style={inputStyle} value={titheForm.date} onChange={(e)=>setTitheForm({...titheForm, date: e.target.value})} />
      <button onClick={() => alert('Tithe recorded successfully!')} style={primaryBtnStyle}>Save Tithe</button>
    </div>
  );
}

function BudgetApproval() {
  return (
    <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
      <p style={{ color: '#64748b', fontSize: '13px' }}>Review and approve branch budget requests.</p>
      <div style={{ padding: '30px', textAlign: 'center', color: '#94a3b8' }}>No pending budgets.</div>
    </div>
  );
}

function ContributionTracker({ members, pledgeForm, setPledgeForm }) {
  return (
    <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
      <h3 style={{ fontSize: '15px', color: '#2563eb', marginBottom: '15px' }}>New Pledge</h3>
      <label style={labelStyle}>Member</label>
      <select style={inputStyle} value={pledgeForm.member} onChange={(e)=>setPledgeForm({...pledgeForm, member: e.target.value})}>
        <option value="">Select member...</option>
        {members.map((m, i) => <option key={i} value={`${m.first_name} ${m.last_name}`}>{m.first_name} {m.last_name}</option>)}
      </select>
      <label style={labelStyle}>Purpose</label>
      <input type="text" placeholder="e.g. Building fund" style={inputStyle} value={pledgeForm.purpose} onChange={(e)=>setPledgeForm({...pledgeForm, purpose: e.target.value})} />
      <label style={labelStyle}>Amount</label>
      <input type="number" placeholder="0.00" style={inputStyle} value={pledgeForm.amount} onChange={(e)=>setPledgeForm({...pledgeForm, amount: e.target.value})} />
      <button onClick={() => alert('Pledge created successfully!')} style={primaryBtnStyle}>Create Pledge</button>
    </div>
  );
}

function WelfareMatrix({ members, welfareData, setWelfareData, selectedWelfareMember, setSelectedWelfareMember }) {
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const handleInputChange = (month, week, value) => {
    const key = `${selectedWelfareMember}-${month}-${week}`;
    setWelfareData(prev => ({ ...prev, [key]: value }));
  };

  return !selectedWelfareMember ? (
    <div>
      <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '15px' }}>Select a member to view and enter monthly welfare contributions:</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px' }}>
        {members.map((m, i) => (
          <div key={i} onClick={() => setSelectedWelfareMember(`${m.first_name} ${m.last_name}`)} style={{ backgroundColor: '#fff', padding: '15px', borderRadius: '10px', textAlign: 'center', cursor: 'pointer', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <p style={{ fontWeight: '500', fontSize: '13px', color: '#1e293b' }}>{m.first_name} {m.last_name}</p>
          </div>
        ))}
      </div>
    </div>
  ) : (
    <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <h3 style={{ fontSize: '16px', color: '#2563eb', margin: 0 }}>Welfare Matrix: {selectedWelfareMember}</h3>
        <button onClick={() => setSelectedWelfareMember(null)} style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}>Close Matrix</button>
      </div>
      <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '15px' }}>Type amounts directly into any week box for all 12 months.</p>
      
      <div style={{ overflowX: 'auto', maxHeight: '450px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'center' }}>
          <thead>
            <tr style={{ backgroundColor: '#2563eb', color: '#fff', position: 'sticky', top: 0, zIndex: 10 }}>
              <th style={{ padding: '10px' }}>Month</th>
              <th style={{ padding: '10px' }}>W1</th>
              <th style={{ padding: '10px' }}>W2</th>
              <th style={{ padding: '10px' }}>W3</th>
              <th style={{ padding: '10px' }}>W4</th>
              <th style={{ padding: '10px' }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {months.map((month, idx) => {
              const w1 = parseFloat(welfareData[`${selectedWelfareMember}-${month}-W1`] || 0);
              const w2 = parseFloat(welfareData[`${selectedWelfareMember}-${month}-W2`] || 0);
              const w3 = parseFloat(welfareData[`${selectedWelfareMember}-${month}-W3`] || 0);
              const w4 = parseFloat(welfareData[`${selectedWelfareMember}-${month}-W4`] || 0);
              const rowTotal = w1 + w2 + w3 + w4;

              return (
                <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '10px', fontWeight: 'bold', color: '#1e293b', textAlign: 'left' }}>{month}</td>
                  {['W1', 'W2', 'W3', 'W4'].map((week) => (
                    <td key={week} style={{ padding: '6px', border: '1px solid #e2e8f0' }}>
                      <input 
                        type="number" 
                        value={welfareData[`${selectedWelfareMember}-${month}-${week}`] || ''} 
                        onChange={(e) => handleInputChange(month, week, e.target.value)}
                        placeholder="0"
                        style={{ width: '50px', textAlign: 'center', padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                      />
                    </td>
                  ))}
                  <td style={{ padding: '10px', fontWeight: 'bold', color: '#16a34a' }}>{rowTotal.toFixed(2)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <button onClick={() => alert('Welfare entries saved successfully!')} style={{ ...primaryBtnStyle, marginTop: '20px' }}>Save Welfare Contributions</button>
    </div>
  );
}

function BalanceSheet() {
  return (
    <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
      <p style={{ fontWeight: 'bold', fontSize: '16px' }}>Current Balance: GHS 2,672.32</p>
    </div>
  );
}

function AccountReport() {
  return (
    <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
      <p style={{ fontWeight: 'bold', marginBottom: '10px' }}>Financial Statement Summary</p>
      <p style={{ color: '#64748b', fontSize: '13px' }}>Opening Balance: GHS 2,484.32</p>
      <p style={{ color: '#64748b', fontSize: '13px' }}>Closing Balance: GHS 11,010.32</p>
    </div>
  );
}

function tabBtnStyle(active) {
  return {
    padding: '10px 16px',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '13px',
    backgroundColor: active ? '#2563eb' : '#f1f5f9',
    color: active ? '#fff' : '#475569'
  };
}

const inputStyle = { width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', marginBottom: '15px', fontSize: '14px', boxSizing: 'border-box' };
const labelStyle = { display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '5px' };
const primaryBtnStyle = { width: '100%', padding: '12px', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' };
