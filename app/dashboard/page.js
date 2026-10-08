'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const EXACT_CHURCH_LOGO = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAAsACwBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=";

export default function AdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('members'); 
  const [activeFinanceView, setActiveFinanceView] = useState('hub'); 

  // Finance global ledger states
  const [openingBalance, setOpeningBalance] = useState(2484.32);
  const [isEditingBalance, setIsEditingBalance] = useState(false);
  const [newBalanceInput, setNewBalanceInput] = useState('2484.32');

  const [incomes, setIncomes] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [tithes, setTithes] = useState([]);
  const [pledges, setPledges] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [welfareData, setWelfareData] = useState({});

  // Form states
  const [incomeForm, setIncomeForm] = useState({ description: '', amount: '', date: '' });
  const [expenseForm, setExpenseForm] = useState({ description: '', qty: '', rate: '', date: '', approver: '' });
  const [titheForm, setTitheForm] = useState({ member: '', amount: '', date: '' });
  const [pledgeForm, setPledgeForm] = useState({ member: '', purpose: '', amount: '' });
  const [budgetForm, setBudgetForm] = useState({ branch: '', description: '', amount: '', date: '' });
  const [selectedWelfareMember, setSelectedWelfareMember] = useState(null);

  // Admin Data states
  const [members, setMembers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('All Departments');

  // Member management states
  const [showAddMember, setShowAddMember] = useState(false);
  const [editingMemberId, setEditingMemberId] = useState(null);
  const [newMemberForm, setNewMemberForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    photo_url: '',
    dob: '',
    date_joined: '',
    date_baptized: '',
    home_address: '',
    home_town: '',
    core_department: 'Choir',
    sub_department: 'Main'
  });

  // Non-finance tab states
  const [attendanceList, setAttendanceList] = useState([]);
  const [attendanceForm, setAttendanceForm] = useState({ service: '', date: '', count: '' });
  const [eventsList, setEventsList] = useState([]);
  const [eventForm, setEventForm] = useState({ title: '', date: '', location: '' });
  const [announcementsList, setAnnouncementsList] = useState([]);
  const [announcementForm, setAnnouncementForm] = useState({ title: '', message: '' });

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

  async function handleSaveMember(e) {
    e.preventDefault();
    if (editingMemberId !== null) {
      // Update existing
      const { error } = await supabase.from('members').update(newMemberForm).eq('id', editingMemberId);
      if (error) {
        alert('Error updating member: ' + error.message);
      } else {
        setMembers(members.map(m => m.id === editingMemberId ? { ...m, ...newMemberForm } : m));
        setEditingMemberId(null);
        setShowAddMember(false);
        resetMemberForm();
        alert('Member updated successfully!');
      }
    } else {
      // Insert new
      const { data, error } = await supabase.from('members').insert([newMemberForm]).select();
      if (error) {
        alert('Error adding member: ' + error.message);
      } else {
        if (data) setMembers([...members, data[0]]);
        setShowAddMember(false);
        resetMemberForm();
        alert('Member added successfully!');
      }
    }
  }

  function startEditMember(member) {
    setEditingMemberId(member.id);
    setNewMemberForm({
      first_name: member.first_name || '',
      last_name: member.last_name || '',
      email: member.email || '',
      phone: member.phone || '',
      photo_url: member.photo_url || '',
      dob: member.dob || '',
      date_joined: member.date_joined || '',
      date_baptized: member.date_baptized || '',
      home_address: member.home_address || '',
      home_town: member.home_town || '',
      core_department: member.core_department || 'Choir',
      sub_department: member.sub_department || 'Main'
    });
    setShowAddMember(true);
  }

  async function handleDeleteMember(id) {
    if (!confirm('Are you sure you want to delete this member?')) return;
    const { error } = await supabase.from('members').delete().eq('id', id);
    if (error) {
      alert('Error deleting member: ' + error.message);
    } else {
      setMembers(members.filter(m => m.id !== id));
      alert('Member deleted successfully.');
    }
  }

  function resetMemberForm() {
    setNewMemberForm({
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      photo_url: '',
      dob: '',
      date_joined: '',
      date_baptized: '',
      home_address: '',
      home_town: '',
      core_department: 'Choir',
      sub_department: 'Main'
    });
  }

  // Calculate totals for Balance Sheet & Ledger
  const totalIncome = incomes.reduce((acc, curr) => acc + Number(curr.amount || 0), 0) +
                      tithes.reduce((acc, curr) => acc + Number(curr.amount || 0), 0) +
                      pledges.reduce((acc, curr) => acc + Number(curr.amount || 0), 0) +
                      Object.values(welfareData).reduce((acc, curr) => acc + Number(curr || 0), 0);

  const totalExpenses = expenses.reduce((acc, curr) => acc + (Number(curr.qty || 0) * Number(curr.rate || 0)), 0);
  const closingBalance = openingBalance + totalIncome - totalExpenses;
  const netMovement = totalIncome - totalExpenses;

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
          <span style={{ fontSize: '18px', fontWeight: 'bold' }}>Gracepoint CHMS (Super Admin)</span>
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
              <option value="Protocol">Protocol</option>
            </select>

            <button onClick={() => { setShowAddMember(!showAddMember); setEditingMemberId(null); resetMemberForm(); }} style={{ width: '100%', backgroundColor: '#10b981', color: '#fff', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: 'bold', marginBottom: '20px', cursor: 'pointer' }}>
              {showAddMember ? 'Cancel' : '+ Add New Member'}
            </button>

            {showAddMember && (
              <form onSubmit={handleSaveMember} style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px', marginBottom: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                <h3 style={{ fontSize: '16px', marginBottom: '15px', color: '#2563eb' }}>{editingMemberId ? 'Edit Member Details' : 'New Member Registration'}</h3>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={labelStyle}>First Name</label>
                    <input type="text" required style={inputStyle} value={newMemberForm.first_name} onChange={(e)=>setNewMemberForm({...newMemberForm, first_name: e.target.value})} />
                  </div>
                  <div>
                    <label style={labelStyle}>Last Name</label>
                    <input type="text" required style={inputStyle} value={newMemberForm.last_name} onChange={(e)=>setNewMemberForm({...newMemberForm, last_name: e.target.value})} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={labelStyle}>Email</label>
                    <input type="email" required style={inputStyle} value={newMemberForm.email} onChange={(e)=>setNewMemberForm({...newMemberForm, email: e.target.value})} />
                  </div>
                  <div>
                    <label style={labelStyle}>Phone Number</label>
                    <input type="text" style={inputStyle} value={newMemberForm.phone} onChange={(e)=>setNewMemberForm({...newMemberForm, phone: e.target.value})} />
                  </div>
                </div>

                <label style={labelStyle}>Photo URL (Image link)</label>
                <input type="text" placeholder="https://..." style={inputStyle} value={newMemberForm.photo_url} onChange={(e)=>setNewMemberForm({...newMemberForm, photo_url: e.target.value})} />

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={labelStyle}>Date of Birth</label>
                    <input type="date" style={inputStyle} value={newMemberForm.dob} onChange={(e)=>setNewMemberForm({...newMemberForm, dob: e.target.value})} />
                  </div>
                  <div>
                    <label style={labelStyle}>Date Joined</label>
                    <input type="date" style={inputStyle} value={newMemberForm.date_joined} onChange={(e)=>setNewMemberForm({...newMemberForm, date_joined: e.target.value})} />
                  </div>
                  <div>
                    <label style={labelStyle}>Date of Baptism</label>
                    <input type="date" style={inputStyle} value={newMemberForm.date_baptized} onChange={(e)=>setNewMemberForm({...newMemberForm, date_baptized: e.target.value})} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={labelStyle}>Home Address</label>
                    <input type="text" style={inputStyle} value={newMemberForm.home_address} onChange={(e)=>setNewMemberForm({...newMemberForm, home_address: e.target.value})} />
                  </div>
                  <div>
                    <label style={labelStyle}>Home Town</label>
                    <input type="text" style={inputStyle} value={newMemberForm.home_town} onChange={(e)=>setNewMemberForm({...newMemberForm, home_town: e.target.value})} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={labelStyle}>Core Department</label>
                    <select style={inputStyle} value={newMemberForm.core_department} onChange={(e)=>setNewMemberForm({...newMemberForm, core_department: e.target.value})}>
                      <option value="Choir">Choir</option>
                      <option value="Media">Media</option>
                      <option value="Ushers">Ushers</option>
                      <option value="Protocol">Protocol</option>
                      <option value="Evangelism">Evangelism</option>
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Sub-Department / Unit</label>
                    <input type="text" placeholder="e.g. Soprano, Live Streaming" style={inputStyle} value={newMemberForm.sub_department} onChange={(e)=>setNewMemberForm({...newMemberForm, sub_department: e.target.value})} />
                  </div>
                </div>

                <button type="submit" style={primaryBtnStyle}>{editingMemberId ? 'Update Member' : 'Save Member'}</button>
              </form>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {members.filter(m => m.first_name?.toLowerCase().includes(searchTerm.toLowerCase())).map((m, idx) => (
                <div key={idx} style={{ backgroundColor: '#fff', padding: '18px 20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', display: 'grid', gridTemplateColumns: '1.2fr 1.5fr 1fr auto', gap: '15px', alignItems: 'center' }}>
                  
                  {/* Photo & Name */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {m.photo_url ? (
                      <img src={m.photo_url} alt="Profile" style={{ width: '50px', height: '50px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #2563eb' }} />
                    ) : (
                      <div style={{ width: '50px', height: '50px', borderRadius: '50%', backgroundColor: '#cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#fff', fontSize: '18px' }}>
                        {m.first_name?.[0]}
                      </div>
                    )}
                    <div>
                      <span style={{ fontWeight: 'bold', color: '#1e293b', fontSize: '15px', display: 'block' }}>{m.first_name} {m.last_name}</span>
                      <span style={{ fontSize: '12px', color: '#2563eb', fontWeight: '600', backgroundColor: '#eff6ff', padding: '2px 6px', borderRadius: '4px' }}>{m.core_department || 'Member'} ({m.sub_department || 'Main'})</span>
                    </div>
                  </div>

                  {/* Contact & Address */}
                  <div>
                    <p style={{ fontSize: '11px', color: '#64748b', fontWeight: 'bold', marginBottom: '2px' }}>CONTACT & LOCATION</p>
                    <p style={{ fontSize: '13px', color: '#1e293b', margin: 0 }}>📧 {m.email}</p>
                    <p style={{ fontSize: '13px', color: '#475569', margin: 0 }}>📞 {m.phone || 'N/A'}</p>
                    <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>🏠 {m.home_address || 'No address'}, {m.home_town || ''}</p>
                  </div>

                  {/* Important Dates */}
                  <div>
                    <p style={{ fontSize: '11px', color: '#64748b', fontWeight: 'bold', marginBottom: '2px' }}>CHURCH MILESTONES</p>
                    <p style={{ fontSize: '12px', color: '#475569', margin: 0 }}>🎂 DOB: {m.dob || 'N/A'}</p>
                    <p style={{ fontSize: '12px', color: '#475569', margin: 0 }}>📅 Joined: {m.date_joined || 'N/A'}</p>
                    <p style={{ fontSize: '12px', color: '#475569', margin: 0 }}>💧 Baptized: {m.date_baptized || 'N/A'}</p>
                  </div>

                  {/* Admin Actions */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <button onClick={() => startEditMember(m)} style={{ backgroundColor: '#2563eb', color: '#fff', border: 'none', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>✏️ Edit</button>
                    <button onClick={() => handleDeleteMember(m.id)} style={{ backgroundColor: '#dc2626', color: '#fff', border: 'none', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>🗑️ Delete</button>
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
                      <button onClick={() => { setOpeningBalance(Number(newBalanceInput) || 0); setIsEditingBalance(false); }} style={{ backgroundColor: '#2563eb', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Save</button>
                    </div>
                  )}
                </div>

                <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1e293b', marginBottom: '5px' }}>Finance Management</h2>
                <p style={{ color: '#64748b', marginBottom: '20px', fontSize: '14px' }}>Select an action below to manage church finances.</p>

                <div style={{ backgroundColor: '#fff', padding: '18px 20px', borderRadius: '12px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                  <span style={{ color: '#4b5563', fontWeight: '600' }}>Opening balance:</span>
                  <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#1e293b' }}>GHS {openingBalance.toFixed(2)}</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '15px' }}>
                  <FinanceCard title="Record Income" icon="➕" onClick={() => setActiveFinanceView('income')} />
                  <FinanceCard title="Record Expenses" icon="➖" onClick={() => setActiveFinanceView('expense')} />
                  <FinanceCard title="Record Tithes" icon="⛪" onClick={() => setActiveFinanceView('tithes')} />
                  <FinanceCard title="Create Budget" icon="📋" onClick={() => setActiveFinanceView('create-budget')} />
                  <FinanceCard title="Approve Budgets" icon="✅" onClick={() => setActiveFinanceView('budget')} />
                  <FinanceCard title="Contribution Tracker" icon="💼" onClick={() => setActiveFinanceView('tracker')} />
                  <FinanceCard title="Welfare Contribution" icon="🤝" onClick={() => setActiveFinanceView('welfare')} />
                  <FinanceCard title="Balance Sheet" icon="⚖️" onClick={() => setActiveFinanceView('balance-sheet')} />
                  <FinanceCard title="Account Report" icon="💳" onClick={() => setActiveFinanceView('report')} />
                </div>
              </div>
            )}

            {activeFinanceView === 'income' && <FinanceSubView title="Record Income" onBack={() => setActiveFinanceView('hub')}><IncomeForm incomeForm={incomeForm} setIncomeForm={setIncomeForm} incomes={incomes} setIncomes={setIncomes} /></FinanceSubView>}
            {activeFinanceView === 'expense' && <FinanceSubView title="Record Expenses" onBack={() => setActiveFinanceView('hub')}><ExpenseForm expenseForm={expenseForm} setExpenseForm={setExpenseForm} expenses={expenses} setExpenses={setExpenses} /></FinanceSubView>}
            {activeFinanceView === 'tithes' && <FinanceSubView title="Record Tithes" onBack={() => setActiveFinanceView('hub')}><TitheForm titheForm={titheForm} setTitheForm={setTitheForm} members={members} tithes={tithes} setTithes={setTithes} /></FinanceSubView>}
            {activeFinanceView === 'create-budget' && <FinanceSubView title="Create Budget Request" onBack={() => setActiveFinanceView('hub')}><CreateBudgetForm budgetForm={budgetForm} setBudgetForm={setBudgetForm} budgets={budgets} setBudgets={setBudgets} /></FinanceSubView>}
            {activeFinanceView === 'budget' && <FinanceSubView title="Approve Budgets" onBack={() => setActiveFinanceView('hub')}><BudgetApproval budgets={budgets} setBudgets={setBudgets} /></FinanceSubView>}
            {activeFinanceView === 'tracker' && <FinanceSubView title="Contribution Tracker" onBack={() => setActiveFinanceView('hub')}><ContributionTracker members={members} pledgeForm={pledgeForm} setPledgeForm={setPledgeForm} pledges={pledges} setPledges={setPledges} /></FinanceSubView>}
            {activeFinanceView === 'welfare' && <FinanceSubView title="Welfare Contribution" onBack={() => setActiveFinanceView('hub')}><WelfareMatrix members={members} welfareData={welfareData} setWelfareData={setWelfareData} selectedWelfareMember={selectedWelfareMember} setSelectedWelfareMember={setSelectedWelfareMember} /></FinanceSubView>}
            {activeFinanceView === 'balance-sheet' && <FinanceSubView title="Balance Sheet" onBack={() => setActiveFinanceView('hub')}><BalanceSheet totalIncome={totalIncome} totalExpenses={totalExpenses} closingBalance={closingBalance} /></FinanceSubView>}
            {activeFinanceView === 'report' && <FinanceSubView title="Account Report" onBack={() => setActiveFinanceView('hub')}><AccountReport openingBalance={openingBalance} closingBalance={closingBalance} netMovement={netMovement} incomes={incomes} setIncomes={setIncomes} expenses={expenses} setExpenses={setExpenses} tithes={tithes} setTithes={setTithes} pledges={pledges} setPledges={setPledges} welfareData={welfareData} setWelfareData={setWelfareData} /></FinanceSubView>}
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
              <input type="text" placeholder="e.g. Youth Vigil" style={inputStyle} value={eventForm.title} onChange={(e)=>setEventForm({...eventForm, title: e.target.value})} />
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

function IncomeForm({ incomeForm, setIncomeForm, incomes, setIncomes }) {
  return (
    <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
      <label style={labelStyle}>Source / Description</label>
      <input type="text" placeholder="e.g. Sunday Offering" style={inputStyle} value={incomeForm.description} onChange={(e)=>setIncomeForm({...incomeForm, description: e.target.value})} />
      <label style={labelStyle}>Amount (GHS)</label>
      <input type="number" placeholder="0.00" style={inputStyle} value={incomeForm.amount} onChange={(e)=>setIncomeForm({...incomeForm, amount: e.target.value})} />
      <label style={labelStyle}>Date</label>
      <input type="date" style={inputStyle} value={incomeForm.date} onChange={(e)=>setIncomeForm({...incomeForm, date: e.target.value})} />
      <button onClick={() => { if(incomeForm.description && incomeForm.amount){ setIncomes([...incomes, incomeForm]); setIncomeForm({ description: '', amount: '', date: '' }); alert('Income saved and reflected in reports!'); } }} style={primaryBtnStyle}>Save Income</button>
    </div>
  );
}

function ExpenseForm({ expenseForm, setExpenseForm, expenses, setExpenses }) {
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
      <button onClick={() => { if(expenseForm.description && expenseForm.qty && expenseForm.rate){ setExpenses([...expenses, expenseForm]); setExpenseForm({ description: '', qty: '', rate: '', date: '', approver: '' }); alert('Expense saved and reflected in reports!'); }}} style={primaryBtnStyle}>Save Expense</button>
    </div>
  );
}

function TitheForm({ titheForm, setTitheForm, members, tithes, setTithes }) {
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
      <button onClick={() => { if(titheForm.member && titheForm.amount){ setTithes([...tithes, titheForm]); setTitheForm({ member: '', amount: '', date: '' }); alert('Tithe saved and reflected in reports!'); }}} style={primaryBtnStyle}>Save Tithe</button>
    </div>
  );
}

function CreateBudgetForm({ budgetForm, setBudgetForm, budgets, setBudgets }) {
  return (
    <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
      <label style={labelStyle}>Branch Name</label>
      <input type="text" placeholder="e.g. Main Branch" style={inputStyle} value={budgetForm.branch} onChange={(e)=>setBudgetForm({...budgetForm, branch: e.target.value})} />
      <label style={labelStyle}>Description / Purpose</label>
      <textarea placeholder="Budget breakdown details" style={{ ...inputStyle, height: '70px' }} value={budgetForm.description} onChange={(e)=>setBudgetForm({...budgetForm, description: e.target.value})} />
      <label style={labelStyle}>Amount Requested (GHS)</label>
      <input type="number" placeholder="0.00" style={inputStyle} value={budgetForm.amount} onChange={(e)=>setBudgetForm({...budgetForm, amount: e.target.value})} />
      <label style={labelStyle}>Date</label>
      <input type="date" style={inputStyle} value={budgetForm.date} onChange={(e)=>setBudgetForm({...budgetForm, date: e.target.value})} />
      <button onClick={() => { if(budgetForm.branch && budgetForm.amount){ setBudgets([...budgets, { ...budgetForm, status: 'Pending' }]); setBudgetForm({ branch: '', description: '', amount: '', date: '' }); alert('Budget request submitted successfully for approval!'); }}} style={primaryBtnStyle}>Submit Budget Request</button>
    </div>
  );
}

function BudgetApproval({ budgets, setBudgets }) {
  const handleStatusChange = (index, newStatus) => {
    const updated = [...budgets];
    updated[index].status = newStatus;
    setBudgets(updated);
  };

  return (
    <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
      <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '15px' }}>Review, approve, or reject branch budget requests.</p>
      {budgets.length === 0 ? (
        <div style={{ padding: '30px', textAlign: 'center', color: '#94a3b8' }}>No budget requests found.</div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ backgroundColor: '#2563eb', color: '#fff', textAlign: 'left' }}>
                <th style={{ padding: '10px' }}>BRANCH</th>
                <th style={{ padding: '10px' }}>DESCRIPTION</th>
                <th style={{ padding: '10px' }}>AMOUNT</th>
                <th style={{ padding: '10px' }}>STATUS</th>
                <th style={{ padding: '10px' }}>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {budgets.map((b, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '10px', fontWeight: 'bold' }}>{b.branch}</td>
                  <td style={{ padding: '10px' }}>{b.description}</td>
                  <td style={{ padding: '10px' }}>GHS {Number(b.amount).toFixed(2)}</td>
                  <td style={{ padding: '10px' }}>
                    <span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold', backgroundColor: b.status === 'Approved' ? '#dcfce7' : b.status === 'Rejected' ? '#fee2e2' : '#fef3c7', color: b.status === 'Approved' ? '#16a34a' : b.status === 'Rejected' ? '#dc2626' : '#d97706' }}>
                      {b.status}
                    </span>
                  </td>
                  <td style={{ padding: '10px', display: 'flex', gap: '6px' }}>
                    <button onClick={() => handleStatusChange(idx, 'Approved')} style={{ backgroundColor: '#16a34a', color: '#fff', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}>Approve</button>
                    <button onClick={() => handleStatusChange(idx, 'Rejected')} style={{ backgroundColor: '#dc2626', color: '#fff', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}>Reject</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function ContributionTracker({ members, pledgeForm, setPledgeForm, pledges, setPledges }) {
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
      <button onClick={() => { if(pledgeForm.member && pledgeForm.amount){ setPledges([...pledges, pledgeForm]); setPledgeForm({ member: '', purpose: '', amount: '' }); alert('Pledge saved and reflected in reports!'); }}} style={primaryBtnStyle}>Create Pledge</button>
    </div>
  );
}

function WelfareMatrix({ members, welfareData, setWelfareData, selectedWelfareMember, setSelectedWelfareMember }) {
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const handleInputChange = (month, week, value) => {
    const key = `${selectedWelfareMember}-${month}-${week}`;
    setWelfareData(prev => ({ ...prev, [key]: Number(value) || 0 }));
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
              const w1 = welfareData[`${selectedWelfareMember}-${month}-W1`] || 0;
              const w2 = welfareData[`${selectedWelfareMember}-${month}-W2`] || 0;
              const w3 = welfareData[`${selectedWelfareMember}-${month}-W3`] || 0;
              const w4 = welfareData[`${selectedWelfareMember}-${month}-W4`] || 0;
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
      <button onClick={() => alert('Welfare entries saved and reflected in reports!')} style={{ ...primaryBtnStyle, marginTop: '20px' }}>Save Welfare Contributions</button>
    </div>
  );
}

function BalanceSheet({ totalIncome, totalExpenses, closingBalance }) {
  const downloadBalanceSheetPDF = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Balance Sheet Report</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 30px; color: #333; text-align: center; }
            .report-header { border-bottom: 2px solid #2563eb; padding-bottom: 15px; margin-bottom: 25px; }
            .church-logo { width: 85px; height: 85px; border-radius: 50%; object-fit: cover; margin: 0 auto 12px auto; border: 3px solid #2563eb; box-shadow: 0 3px 6px rgba(0,0,0,0.15); display: block; background: #fff; }
            .church-title { font-size: 20px; font-weight: bold; color: #1e293b; letter-spacing: 1px; }
            .report-subtitle { font-size: 14px; color: #64748b; margin-top: 5px; text-transform: uppercase; font-weight: bold; }
            .summary-box { display: flex; justify-content: space-around; margin: 30px 0; text-align: left; }
            .card { border: 1px solid #cbd5e1; padding: 20px; border-radius: 8px; width: 28%; text-align: center; background: #f8fafc; }
            .amount { font-size: 20px; font-weight: bold; margin-top: 8px; }
          </style>
        </head>
        <body>
          <div class="report-header">
            <img src="${EXACT_CHURCH_LOGO}" class="church-logo" />
            <div class="church-title">GRACEPOINT PROPHETIC CHURCH</div>
            <div style="font-size: 12px; color: #475569; margin-top: 3px; font-weight: bold;">THE JESUS HOME CHURCH</div>
            <div class="report-subtitle" style="margin-top: 10px;">Official Balance Sheet Report</div>
          </div>
          <div class="summary-box">
            <div class="card"><div>Total Income</div><div class="amount" style="color: #16a34a;">GHS ${totalIncome.toFixed(2)}</div></div>
            <div class="card"><div>Total Expenses</div><div class="amount" style="color: #dc2626;">GHS ${totalExpenses.toFixed(2)}</div></div>
            <div class="card"><div>Closing Balance</div><div class="amount" style="color: #2563eb;">GHS ${closingBalance.toFixed(2)}</div></div>
          </div>
          <script>window.onload = function() { window.print(); }</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#1e293b', margin: 0 }}>Balance Sheet Summary</h3>
        <button onClick={downloadBalanceSheetPDF} style={{ backgroundColor: '#16a34a', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}>📥 Print / Save PDF</button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
        <div style={{ padding: '15px', backgroundColor: '#f0fdf4', borderRadius: '8px' }}>
          <p style={{ fontSize: '12px', color: '#166534', margin: '0 0 5px 0' }}>Total Income</p>
          <p style={{ fontSize: '18px', fontWeight: 'bold', color: '#16a34a', margin: 0 }}>GHS {totalIncome.toFixed(2)}</p>
        </div>
        <div style={{ padding: '15px', backgroundColor: '#fef2f2', borderRadius: '8px' }}>
          <p style={{ fontSize: '12px', color: '#991b1b', margin: '0 0 5px 0' }}>Total Expenses</p>
          <p style={{ fontSize: '18px', fontWeight: 'bold', color: '#dc2626', margin: 0 }}>GHS {totalExpenses.toFixed(2)}</p>
        </div>
      </div>
      <div style={{ padding: '15px', backgroundColor: '#eff6ff', borderRadius: '8px', textAlign: 'center' }}>
        <p style={{ fontSize: '13px', color: '#1e40af', margin: '0 0 5px 0' }}>Current Closing Balance</p>
        <p style={{ fontSize: '22px', fontWeight: 'bold', color: '#2563eb', margin: 0 }}>GHS {closingBalance.toFixed(2)}</p>
      </div>
    </div>
  );
}

function AccountReport({ openingBalance, closingBalance, netMovement, incomes, setIncomes, expenses, setExpenses, tithes, setTithes, pledges, setPledges, welfareData, setWelfareData }) {
  const [editingIndex, setEditingIndex] = useState(null);
  const [editForm, setEditForm] = useState(null);

  const startEdit = (type, index, item) => {
    setEditingIndex({ type, index });
    setEditForm({ ...item });
  };

  const saveEdit = (type, index) => {
    if (type === 'tithe') {
      const updated = [...tithes];
      updated[index] = editForm;
      setTithes(updated);
    } else if (type === 'income') {
      const updated = [...incomes];
      updated[index] = editForm;
      setIncomes(updated);
    } else if (type === 'pledge') {
      const updated = [...pledges];
      updated[index] = editForm;
      setPledges(updated);
    } else if (type === 'expense') {
      const updated = [...expenses];
      updated[index] = editForm;
      setExpenses(updated);
    }
    setEditingIndex(null);
    setEditForm(null);
  };

  const handleDelete = (type, index) => {
    if (!confirm('Are you sure you want to delete this record?')) return;
    if (type === 'tithe') setTithes(tithes.filter((_, i) => i !== index));
    if (type === 'income') setIncomes(incomes.filter((_, i) => i !== index));
    if (type === 'pledge') setPledges(pledges.filter((_, i) => i !== index));
    if (type === 'expense') setExpenses(expenses.filter((_, i) => i !== index));
  };

  const downloadAccountReportPDF = () => {
    const printWindow = window.open('', '_blank');
    let rowsHtml = '';
    let currentBal = openingBalance;

    tithes.forEach(t => { currentBal += Number(t.amount||0); rowsHtml += `<tr><td>${t.date||'N/A'}</td><td>Tithe (${t.member})</td><td style="color:#16a34a;">GHS ${Number(t.amount).toFixed(2)}</td><td>-</td><td>GHS ${currentBal.toFixed(2)}</td></tr>`; });
    incomes.forEach(inc => { currentBal += Number(inc.amount||0); rowsHtml += `<tr><td>${inc.date||'N/A'}</td><td>Income (${inc.description})</td><td style="color:#16a34a;">GHS ${Number(inc.amount).toFixed(2)}</td><td>-</td><td>GHS ${currentBal.toFixed(2)}</td></tr>`; });
    pledges.forEach(p => { currentBal += Number(p.amount||0); rowsHtml += `<tr><td>Current</td><td>Pledge (${p.member} - ${p.purpose})</td><td style="color:#16a34a;">GHS ${Number(p.amount).toFixed(2)}</td><td>-</td><td>GHS ${currentBal.toFixed(2)}</td></tr>`; });
    expenses.forEach(exp => { const expT = Number(exp.qty||0)*Number(exp.rate||0); currentBal -= expT; rowsHtml += `<tr><td>${exp.date||'N/A'}</td><td>Expense (${exp.description})</td><td>-</td><td style="color:#dc2626;">GHS ${expT.toFixed(2)}</td><td>GHS ${currentBal.toFixed(2)}</td></tr>`; });

    printWindow.document.write(`
      <html>
        <head>
          <title>Official Account Statement</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 30px; color: #333; text-align: center; }
            .report-header { border-bottom: 2px solid #2563eb; padding-bottom: 15px; margin-bottom: 25px; }
            .church-logo { width: 85px; height: 85px; border-radius: 50%; object-fit: cover; margin: 0 auto 12px auto; border: 3px solid #2563eb; box-shadow: 0 3px 6px rgba(0,0,0,0.15); display: block; background: #fff; }
            .church-title { font-size: 20px; font-weight: bold; color: #1e293b; letter-spacing: 1px; }
            .report-subtitle { font-size: 14px; color: #64748b; margin-top: 5px; text-transform: uppercase; font-weight: bold; }
            .metrics { display: flex; justify-content: space-between; margin-bottom: 25px; text-align: left; }
            .m-card { border: 1px solid #cbd5e1; padding: 12px; border-radius: 6px; width: 30%; text-align: center; background: #f8fafc; font-size: 13px; }
            table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 12px; }
            th, td { border: 1px solid #cbd5e1; padding: 8px; text-align: left; }
            th { background-color: #1e293b; color: white; }
          </style>
        </head>
        <body>
          <div class="report-header">
            <img src="${EXACT_CHURCH_LOGO}" class="church-logo" />
            <div class="church-title">GRACEPOINT PROPHETIC CHURCH</div>
            <div style="font-size: 12px; color: #475569; margin-top: 3px; font-weight: bold;">THE JESUS HOME CHURCH</div>
            <div class="report-subtitle" style="margin-top: 10px;">Official Account Statement Ledger</div>
          </div>
          <div class="metrics">
            <div class="m-card">Opening Balance:<br><strong>GHS ${openingBalance.toFixed(2)}</strong></div>
            <div class="m-card">Net Movement:<br><strong style="color:${netMovement>=0?'#16a34a':'#dc2626'}">GHS ${netMovement.toFixed(2)}</strong></div>
            <div class="m-card">Closing Balance:<br><strong style="color:#0284c7">GHS ${closingBalance.toFixed(2)}</strong></div>
          </div>
          <table>
            <thead><tr><th>Date</th><th>Description</th><th>Income</th><th>Expenses</th><th>Balance</th></tr></thead>
            <tbody>
              <tr><td>Initial</td><td><strong>Opening Balance</strong></td><td>-</td><td>-</td><td><strong>GHS ${openingBalance.toFixed(2)}</strong></td></tr>
              ${rowsHtml}
            </tbody>
          </table>
          <script>window.onload = function() { window.print(); }</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  let runningBalance = openingBalance;

  return (
    <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#1e293b', margin: 0 }}>Official Account Statement Ledger (Super Admin Mode)</h3>
        <button onClick={downloadAccountReportPDF} style={{ backgroundColor: '#16a34a', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}>📥 Print / Save PDF</button>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '20px', textAlign: 'center' }}>
        <div style={{ padding: '12px', backgroundColor: '#f1f5f9', borderRadius: '8px' }}>
          <span style={{ fontSize: '11px', color: '#64748b', display: 'block' }}>Opening Balance</span>
          <strong style={{ fontSize: '14px', color: '#1e293b' }}>GHS {openingBalance.toFixed(2)}</strong>
        </div>
        <div style={{ padding: '12px', backgroundColor: '#f1f5f9', borderRadius: '8px' }}>
          <span style={{ fontSize: '11px', color: '#64748b', display: 'block' }}>Net Movement</span>
          <strong style={{ fontSize: '14px', color: netMovement >= 0 ? '#16a34a' : '#dc2626' }}>GHS {netMovement.toFixed(2)}</strong>
        </div>
        <div style={{ padding: '12px', backgroundColor: '#e0f2fe', borderRadius: '8px' }}>
          <span style={{ fontSize: '11px', color: '#0369a1', display: 'block' }}>Closing Balance</span>
          <strong style={{ fontSize: '14px', color: '#0284c7' }}>GHS {closingBalance.toFixed(2)}</strong>
        </div>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
          <thead>
            <tr style={{ backgroundColor: '#1e293b', color: '#fff', textAlign: 'left' }}>
              <th style={{ padding: '8px' }}>DATE</th>
              <th style={{ padding: '8px' }}>DESCRIPTION</th>
              <th style={{ padding: '8px' }}>INCOME</th>
              <th style={{ padding: '8px' }}>EXPENSES</th>
              <th style={{ padding: '8px' }}>BALANCE</th>
              <th style={{ padding: '8px' }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
              <td style={{ padding: '8px' }}>Initial</td>
              <td style={{ padding: '8px', fontWeight: 'bold' }}>Opening Balance</td>
              <td style={{ padding: '8px' }}>-</td>
              <td style={{ padding: '8px' }}>-</td>
              <td style={{ padding: '8px', fontWeight: 'bold' }}>GHS {openingBalance.toFixed(2)}</td>
              <td style={{ padding: '8px' }}>-</td>
            </tr>

            {/* Tithes */}
            {tithes.map((t, idx) => {
              const isEditing = editingIndex?.type === 'tithe' && editingIndex?.index === idx;
              runningBalance += Number(isEditing ? editForm.amount : (t.amount || 0));
              return (
                <tr key={`tithe-${idx}`} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '8px' }}>{isEditing ? <input type="date" value={editForm.date} onChange={(e)=>setEditForm({...editForm, date: e.target.value})} style={{width:'90px'}} /> : (t.date || 'N/A')}</td>
                  <td style={{ padding: '8px' }}>Tithe ({t.member})</td>
                  <td style={{ padding: '8px', color: '#16a34a', fontWeight: 'bold' }}>
                    {isEditing ? <input type="number" value={editForm.amount} onChange={(e)=>setEditForm({...editForm, amount: e.target.value})} style={{width:'70px'}} /> : `GHS ${Number(t.amount).toFixed(2)}`}
                  </td>
                  <td style={{ padding: '8px' }}>-</td>
                  <td style={{ padding: '8px', fontWeight: 'bold' }}>GHS {runningBalance.toFixed(2)}</td>
                  <td style={{ padding: '8px', display: 'flex', gap: '4px' }}>
                    {isEditing ? (
                      <button onClick={() => saveEdit('tithe', idx)} style={{ backgroundColor: '#16a34a', color: '#fff', border: 'none', padding: '3px 6px', borderRadius: '4px', cursor: 'pointer' }}>Save</button>
                    ) : (
                      <button onClick={() => startEdit('tithe', idx, t)} style={{ backgroundColor: '#2563eb', color: '#fff', border: 'none', padding: '3px 6px', borderRadius: '4px', cursor: 'pointer' }}>✏️</button>
                    )}
                    <button onClick={() => handleDelete('tithe', idx)} style={{ backgroundColor: '#dc2626', color: '#fff', border: 'none', padding: '3px 6px', borderRadius: '4px', cursor: 'pointer' }}>🗑️</button>
                  </td>
                </tr>
              );
            })}

            {/* Incomes */}
            {incomes.map((inc, idx) => {
              const isEditing = editingIndex?.type === 'income' && editingIndex?.index === idx;
              runningBalance += Number(isEditing ? editForm.amount : (inc.amount || 0));
              return (
                <tr key={`inc-${idx}`} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '8px' }}>{isEditing ? <input type="date" value={editForm.date} onChange={(e)=>setEditForm({...editForm, date: e.target.value})} style={{width:'90px'}} /> : (inc.date || 'N/A')}</td>
                  <td style={{ padding: '8px' }}>
                    {isEditing ? <input type="text" value={editForm.description} onChange={(e)=>setEditForm({...editForm, description: e.target.value})} style={{width:'110px'}} /> : `Income (${inc.description})`}
                  </td>
                  <td style={{ padding: '8px', color: '#16a34a', fontWeight: 'bold' }}>
                    {isEditing ? <input type="number" value={editForm.amount} onChange={(e)=>setEditForm({...editForm, amount: e.target.value})} style={{width:'70px'}} /> : `GHS ${Number(inc.amount).toFixed(2)}`}
                  </td>
                  <td style={{ padding: '8px' }}>-</td>
                  <td style={{ padding: '8px', fontWeight: 'bold' }}>GHS {runningBalance.toFixed(2)}</td>
                  <td style={{ padding: '8px', display: 'flex', gap: '4px' }}>
                    {isEditing ? (
                      <button onClick={() => saveEdit('income', idx)} style={{ backgroundColor: '#16a34a', color: '#fff', border: 'none', padding: '3px 6px', borderRadius: '4px', cursor: 'pointer' }}>Save</button>
                    ) : (
                      <button onClick={() => startEdit('income', idx, inc)} style={{ backgroundColor: '#2563eb', color: '#fff', border: 'none', padding: '3px 6px', borderRadius: '4px', cursor: 'pointer' }}>✏️</button>
                    )}
                    <button onClick={() => handleDelete('income', idx)} style={{ backgroundColor: '#dc2626', color: '#fff', border: 'none', padding: '3px 6px', borderRadius: '4px', cursor: 'pointer' }}>🗑️</button>
                  </td>
                </tr>
              );
            })}

            {/* Pledges */}
            {pledges.map((p, idx) => {
              const isEditing = editingIndex?.type === 'pledge' && editingIndex?.index === idx;
              runningBalance += Number(isEditing ? editForm.amount : (p.amount || 0));
              return (
                <tr key={`pledge-${idx}`} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '8px' }}>Current</td>
                  <td style={{ padding: '8px' }}>Pledge ({p.member} - {p.purpose})</td>
                  <td style={{ padding: '8px', color: '#16a34a', fontWeight: 'bold' }}>
                    {isEditing ? <input type="number" value={editForm.amount} onChange={(e)=>setEditForm({...editForm, amount: e.target.value})} style={{width:'70px'}} /> : `GHS ${Number(p.amount).toFixed(2)}`}
                  </td>
                  <td style={{ padding: '8px' }}>-</td>
                  <td style={{ padding: '8px', fontWeight: 'bold' }}>GHS {runningBalance.toFixed(2)}</td>
                  <td style={{ padding: '8px', display: 'flex', gap: '4px' }}>
                    {isEditing ? (
                      <button onClick={() => saveEdit('pledge', idx)} style={{ backgroundColor: '#16a34a', color: '#fff', border: 'none', padding: '3px 6px', borderRadius: '4px', cursor: 'pointer' }}>Save</button>
                    ) : (
                      <button onClick={() => startEdit('pledge', idx, p)} style={{ backgroundColor: '#2563eb', color: '#fff', border: 'none', padding: '3px 6px', borderRadius: '4px', cursor: 'pointer' }}>✏️</button>
                    )}
                    <button onClick={() => handleDelete('pledge', idx)} style={{ backgroundColor: '#dc2626', color: '#fff', border: 'none', padding: '3px 6px', borderRadius: '4px', cursor: 'pointer' }}>🗑️</button>
                  </td>
                </tr>
              );
            })}

            {/* Welfare Entries */}
            {Object.entries(welfareData).map(([key, val], idx) => {
              if (!val || Number(val) === 0) return null;
              runningBalance += Number(val);
              const [mem, mon, wk] = key.split('-');
              return (
                <tr key={`welf-${idx}`} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '8px' }}>{mon} ({wk})</td>
                  <td style={{ padding: '8px' }}>Welfare ({mem})</td>
                  <td style={{ padding: '8px', color: '#16a34a', fontWeight: 'bold' }}>GHS {Number(val).toFixed(2)}</td>
                  <td style={{ padding: '8px' }}>-</td>
                  <td style={{ padding: '8px', fontWeight: 'bold' }}>GHS {runningBalance.toFixed(2)}</td>
                  <td style={{ padding: '8px' }}>
                    <button onClick={() => { const updated = {...welfareData}; delete updated[key]; setWelfareData(updated); }} style={{ backgroundColor: '#dc2626', color: '#fff', border: 'none', padding: '3px 6px', borderRadius: '4px', cursor: 'pointer' }}>🗑️</button>
                  </td>
                </tr>
              );
            })}

            {/* Expenses */}
            {expenses.map((exp, idx) => {
              const isEditing = editingIndex?.type === 'expense' && editingIndex?.index === idx;
              const expTotal = Number(isEditing ? editForm.qty : (exp.qty || 0)) * Number(isEditing ? editForm.rate : (exp.rate || 0));
              runningBalance -= expTotal;
              return (
                <tr key={`exp-${idx}`} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '8px' }}>{isEditing ? <input type="date" value={editForm.date} onChange={(e)=>setEditForm({...editForm, date: e.target.value})} style={{width:'90px'}} /> : (exp.date || 'N/A')}</td>
                  <td style={{ padding: '8px' }}>
                    {isEditing ? <input type="text" value={editForm.description} onChange={(e)=>setEditForm({...editForm, description: e.target.value})} style={{width:'110px'}} /> : `Expense (${exp.description})`}
                  </td>
                  <td style={{ padding: '8px' }}>-</td>
                  <td style={{ padding: '8px', color: '#dc2626', fontWeight: 'bold' }}>
                    {isEditing ? (
                      <div style={{display:'flex', gap:'4px'}}>
                        <input type="number" value={editForm.qty} onChange={(e)=>setEditForm({...editForm, qty: e.target.value})} placeholder="Qty" style={{width:'40px'}} />
                        <input type="number" value={editForm.rate} onChange={(e)=>setEditForm({...editForm, rate: e.target.value})} placeholder="Rate" style={{width:'40px'}} />
                      </div>
                    ) : `GHS ${expTotal.toFixed(2)}`}
                  </td>
                  <td style={{ padding: '8px', fontWeight: 'bold' }}>GHS {runningBalance.toFixed(2)}</td>
                  <td style={{ padding: '8px', display: 'flex', gap: '4px' }}>
                    {isEditing ? (
                      <button onClick={() => saveEdit('expense', idx)} style={{ backgroundColor: '#16a34a', color: '#fff', border: 'none', padding: '3px 6px', borderRadius: '4px', cursor: 'pointer' }}>Save</button>
                    ) : (
                      <button onClick={() => startEdit('expense', idx, exp)} style={{ backgroundColor: '#2563eb', color: '#fff', border: 'none', padding: '3px 6px', borderRadius: '4px', cursor: 'pointer' }}>✏️</button>
                    )}
                    <button onClick={() => handleDelete('expense', idx)} style={{ backgroundColor: '#dc2626', color: '#fff', border: 'none', padding: '3px 6px', borderRadius: '4px', cursor: 'pointer' }}>🗑️</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
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
