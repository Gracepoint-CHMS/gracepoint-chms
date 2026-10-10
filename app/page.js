'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const CHURCH_LOGO = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAgAAAAIACAMAAADDyTPR...[Valid Base64]"; 

export default function Home() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState('super_admin');
  const [loading, setLoading] = useState(true);
  
  // Auth Form State
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState('');
  const [isSelfRegistering, setIsSelfRegistering] = useState(false);

  // Dashboard State
  const [activeTab, setActiveTab] = useState('members');
  const [financeView, setFinanceView] = useState('hub');
  
  const [members, setMembers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [editingMemberId, setEditingMemberId] = useState(null);
  
  const [selectedMemberForWelfare, setSelectedMemberForWelfare] = useState(null);
  const [openingBalance, setOpeningBalance] = useState(2484.32);

  // Financial Data State with Edit support
  const [incomes, setIncomes] = useState([]);
  const [incomeForm, setIncomeForm] = useState({ source: '', amount: '', date: '' });
  const [editingIncomeIndex, setEditingIncomeIndex] = useState(null);

  const [expenses, setExpenses] = useState([]);
  const [expenseForm, setExpenseForm] = useState({ description: '', amount: '', date: '' });
  const [editingExpenseIndex, setEditingExpenseIndex] = useState(null);

  const [tithes, setTithes] = useState([]);
  const [titheForm, setTitheForm] = useState({ member_name: '', amount: '', date: '' });
  const [editingTitheIndex, setEditingTitheIndex] = useState(null);

  const [budgets, setBudgets] = useState([]);
  const [budgetForm, setBudgetForm] = useState({ item: '', estimated: '', status: 'Pending' });

  const [contributions, setContributions] = useState([]);
  const [contribForm, setContribForm] = useState({ contributor: '', type: 'General', amount: '', date: '' });
  const [editingContribIndex, setEditingContribIndex] = useState(null);

  // Welfare table state (12 months x 4 weeks)
  const [welfareRecords, setWelfareRecords] = useState({});

  // Editable Financial Reports State
  const [accountReportNotes, setAccountReportNotes] = useState('All financial activities are reconciled and audited weekly.');
  const [balanceSheetNotes, setBalanceSheetNotes] = useState('Assets match total equity and liabilities.');

  const [attendanceLogs, setAttendanceLogs] = useState([]);
  const [showAttendanceForm, setShowAttendanceForm] = useState(false);
  const [attendanceForm, setAttendanceForm] = useState({ service_date: '', department: 'General', status: 'Present' });

  const [eventsList, setEventsList] = useState([]);
  const [showEventForm, setShowEventForm] = useState(false);
  const [eventForm, setEventForm] = useState({ title: '', date: '', description: '' });

  const [announcementsList, setAnnouncementsList] = useState([]);
  const [showAnnounceForm, setShowAnnounceForm] = useState(false);
  const [announceForm, setAnnounceForm] = useState({ title: '', message: '' });

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
    async function getUserData() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session && session.user) {
        setUser(session.user);
        const { data: memberData } = await supabase
          .from('members')
          .select('*')
          .eq('email', session.user.email)
          .single();

        if (memberData) {
          if (memberData.role) setRole(memberData.role);
        }
      }
      fetchMembers();
      setLoading(false);
    }
    getUserData();
  }, []);

  async function fetchMembers() {
    const { data: allMembers } = await supabase
      .from('members')
      .select('*');

    if (allMembers) {
      setMembers(allMembers);
    }
  }

  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthError('');
    const { error } = await supabase.auth.signInWithPassword({
      email: emailInput,
      password: passwordInput,
    });
    if (error) {
      setAuthError(error.message);
    } else {
      window.location.reload();
    }
  };

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

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, photo_url: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveMember = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    const subDeptsStr = Array.isArray(formData.sub_departments) 
      ? formData.sub_departments.join(', ') 
      : formData.sub_departments;

    const payload = {
      ...formData,
      sub_departments: subDeptsStr
    };

    if (editingMemberId) {
      const { error } = await supabase
        .from('members')
        .update(payload)
        .eq('id', editingMemberId);

      if (error) {
        setFormError(error.message);
      } else {
        setFormSuccess('Member details successfully updated!');
        fetchMembers();
        setTimeout(() => {
          setShowRegisterForm(false);
          setEditingMemberId(null);
          setFormSuccess('');
        }, 1500);
      }
    } else {
      const { error } = await supabase
        .from('members')
        .insert([payload]);

      if (error) {
        setFormError(error.message);
      } else {
        setFormSuccess(isSelfRegistering ? 'Self-registration successful! You can now log in.' : 'Member successfully registered with all details!');
        setFormData({
          first_name: '', last_name: '', email: '', phone: '',
          role: 'member', core_department: 'LOVE', sub_departments: [],
          date_of_birth: '', date_of_baptism: '', date_joined: '',
          home_address: '', home_town: '', photo_url: ''
        });
        fetchMembers();
        setTimeout(() => {
          setShowRegisterForm(false);
          setIsSelfRegistering(false);
          setFormSuccess('');
        }, 1500);
      }
    }
  };

  const handleDeleteMember = async (id) => {
    if (confirm('Are you sure you want to delete this member?')) {
      const { error } = await supabase.from('members').delete().eq('id', id);
      if (error) {
        alert('Error deleting member: ' + error.message);
      } else {
        fetchMembers();
      }
    }
  };

  const handleStartEditMember = (m) => {
    setEditingMemberId(m.id);
    let subs = [];
    if (m.sub_departments) {
      subs = typeof m.sub_departments === 'string' ? m.sub_departments.split(', ').map(s => s.trim()) : m.sub_departments;
    }
    setFormData({
      first_name: m.first_name || '',
      last_name: m.last_name || '',
      email: m.email || '',
      phone: m.phone || '',
      role: m.role || 'member',
      core_department: m.core_department || 'LOVE',
      sub_departments: subs,
      date_of_birth: m.date_of_birth || '',
      date_of_baptism: m.date_of_baptism || '',
      date_joined: m.date_joined || '',
      home_address: m.home_address || '',
      home_town: m.home_town || '',
      photo_url: m.photo_url || ''
    });
    setShowRegisterForm(true);
  };

  const handleWelfareChange = (memberId, month, weekIndex, val) => {
    const num = val === '' ? 0 : parseFloat(val);
    const memberRecord = welfareRecords[memberId] || {
      Jan: [0,0,0,0], Feb: [0,0,0,0], Mar: [0,0,0,0], Apr: [0,0,0,0],
      May: [0,0,0,0], Jun: [0,0,0,0], Jul: [0,0,0,0], Aug: [0,0,0,0],
      Sep: [0,0,0,0], Oct: [0,0,0,0], Nov: [0,0,0,0], Dec: [0,0,0,0]
    };
    const updatedMonthWeeks = [...memberRecord[month]];
    updatedMonthWeeks[weekIndex] = isNaN(num) ? 0 : num;
    setWelfareRecords({
      ...welfareRecords,
      [memberId]: { ...memberRecord, [month]: updatedMonthWeeks }
    });
  };

  const totalWelfareSum = Object.values(welfareRecords).reduce((grandTotal, memberMonths) => {
    const memberSum = Object.values(memberMonths).reduce((mTotal, weeks) => {
      return mTotal + weeks.reduce((wSum, w) => wSum + w, 0);
    }, 0);
    return grandTotal + memberSum;
  }, 0);

  const totalIncomeSum = incomes.reduce((acc, curr) => acc + (parseFloat(curr.amount) || 0), 0);
  const totalTitheSum = tithes.reduce((acc, curr) => acc + (parseFloat(curr.amount) || 0), 0);
  const totalContribSum = contributions.reduce((acc, curr) => acc + (parseFloat(curr.amount) || 0), 0);
  const totalExpenseSum = expenses.reduce((acc, curr) => acc + (parseFloat(curr.amount) || 0), 0);
  
  const approvedBudgetsSum = budgets
    .filter(b => b.status === 'Approved')
    .reduce((acc, curr) => acc + (parseFloat(curr.estimated) || 0), 0);

  const grossInflow = openingBalance + totalIncomeSum + totalTitheSum + totalContribSum + totalWelfareSum;
  const netBalance = grossInflow - (totalExpenseSum + approvedBudgetsSum);

  const downloadPDFReport = (title) => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>${title} - Gracepoint Prophetic Church</title>
          <style>
            body { 
              font-family: 'Segoe UI', Arial, sans-serif; 
              padding: 2.5rem; 
              color: #1e293b; 
              max-width: 800px; 
              margin: 0 auto; 
              background-color: #ffffff;
            }
            .header { 
              border-bottom: 3px solid #1e3a8a; 
              padding-bottom: 1.25rem; 
              margin-bottom: 1.75rem; 
              display: flex;
              align-items: center;
              gap: 1.5rem;
              background: linear-gradient(to bottom, #f8fafc, #ffffff);
              padding: 1.25rem;
              border-radius: 0.5rem;
              border-top: 4px solid #2563eb;
            }
            .logo { 
              width: 75px; 
              height: 75px; 
              object-fit: contain; 
            }
            .header-text {
              flex-grow: 1;
            }
            .church-name { 
              font-size: 1.35rem; 
              font-weight: 800; 
              color: #1e3a8a; 
              margin: 0 0 0.15rem 0; 
              letter-spacing: 0.5px;
            }
            .subtitle { 
              font-size: 0.95rem; 
              color: #475569; 
              font-weight: 600;
              margin-bottom: 0.35rem; 
            }
            .report-title-badge {
              display: inline-block;
              background-color: #1e3a8a;
              color: #ffffff;
              padding: 0.25rem 0.75rem;
              border-radius: 0.25rem;
              font-size: 0.85rem;
              font-weight: bold;
              text-transform: uppercase;
              letter-spacing: 1px;
            }
            .meta-date {
              font-size: 0.8rem;
              color: #64748b;
              text-align: right;
            }
            .row { 
              display: flex; 
              justify-content: space-between; 
              padding: 0.65rem 0.5rem; 
              border-bottom: 1px solid #e2e8f0; 
              font-size: 0.95rem; 
            }
            .row:nth-child(even) {
              background-color: #f8fafc;
            }
            .summary { 
              margin-top: 1.5rem; 
              font-size: 1.15rem; 
              font-weight: bold; 
              background-color: #eff6ff;
              padding: 0.85rem;
              border: 1px solid #bfdbfe;
              border-radius: 0.375rem;
            }
            .notes {
              margin-top: 2rem;
              font-size: 0.9rem;
              color: #334155;
              background-color: #f8fafc;
              padding: 1rem;
              border-left: 4px solid #2563eb;
              border-radius: 0.25rem;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <img src="${CHURCH_LOGO}" alt="Church Logo" class="logo" />
            <div class="header-text">
              <h2 class="church-name">GRACEPOINT PROPHETIC CHURCH</h2>
              <div class="subtitle">The Jesus Home Church</div>
              <span class="report-title-badge">${title}</span>
            </div>
            <div class="meta-date">
              <strong>Date:</strong> ${new Date().toLocaleDateString()}
            </div>
          </div>
          <div>
            <div class="row"><span>Opening Balance:</span><strong>GHS ${openingBalance.toFixed(2)}</strong></div>
            <div class="row"><span>Total General Incomes:</span><strong style="color: #16a34a;">+ GHS ${totalIncomeSum.toFixed(2)}</strong></div>
            <div class="row"><span>Total Tithes:</span><strong style="color: #16a34a;">+ GHS ${totalTitheSum.toFixed(2)}</strong></div>
            <div class="row"><span>Total Contributions:</span><strong style="color: #16a34a;">+ GHS ${totalContribSum.toFixed(2)}</strong></div>
            <div class="row"><span>Total Welfare Contributions:</span><strong style="color: #16a34a;">+ GHS ${totalWelfareSum.toFixed(2)}</strong></div>
            <div class="row"><span>Total Expenses:</span><strong style="color: #dc2626;">- GHS ${totalExpenseSum.toFixed(2)}</strong></div>
            <div class="row"><span>Approved Budgets (Allocated):</span><strong style="color: #dc2626;">- GHS ${approvedBudgetsSum.toFixed(2)}</strong></div>
            
            <div class="row summary">
              <span>Net Balance / Fund Balance:</span>
              <span style="color: #1e3a8a;">GHS ${netBalance.toFixed(2)}</span>
            </div>
          </div>
          <div class="notes">
            <strong>Official Notes & Remarks:</strong>
            <p style="margin: 0.5rem 0 0 0;">${title.includes('Balance') ? balanceSheetNotes : accountReportNotes}</p>
          </div>
          <script>window.print();</script>
        </body>
      </html>
    `);
    printWindow.document.close();
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
        <p>Loading application...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <main style={{ minHeight: '100vh', backgroundColor: '#f1f5f9', fontFamily: 'system-ui, sans-serif', padding: '2rem 1rem', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ width: '100%', maxWidth: '28rem', backgroundColor: '#ffffff', borderRadius: '0.75rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', overflow: 'hidden' }}>
          <div style={{ backgroundColor: '#1e3a8a', color: '#ffffff', padding: '1.5rem', textAlign: 'center' }}>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 'bold', margin: '0 0 0.25rem 0' }}>Gracepoint Prophetic Church</h1>
            <p style={{ fontSize: '0.875rem', opacity: 0.9, margin: 0 }}>The Jesus Home Church - Portal</p>
          </div>
          
          <div style={{ padding: '1.5rem' }}>
            {!isSelfRegistering ? (
              <div>
                {authError && (
                  <div style={{ backgroundColor: '#fee2e2', color: '#991b1b', padding: '0.75rem', borderRadius: '0.375rem', marginBottom: '1rem', fontSize: '0.875rem' }}>
                    {authError}
                  </div>
                )}
                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#475569', marginBottom: '0.375rem' }}>Email Address</label>
                    <input 
                      type="email" 
                      value={emailInput} 
                      onChange={(e) => setEmailInput(e.target.value)} 
                      required 
                      style={{ width: '100%', padding: '0.75rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1', fontSize: '1rem', boxSizing: 'border-box' }}
                      placeholder="Enter your email"
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#475569', marginBottom: '0.375rem' }}>Password</label>
                    <input 
                      type="password" 
                      value={passwordInput} 
                      onChange={(e) => setPasswordInput(e.target.value)} 
                      required 
                      style={{ width: '100%', padding: '0.75rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1', fontSize: '1rem', boxSizing: 'border-box' }}
                      placeholder="Enter your password"
                    />
                  </div>
                  <button 
                    type="submit" 
                    style={{ backgroundColor: '#2563eb', color: '#ffffff', border: 'none', padding: '0.75rem', borderRadius: '0.375rem', fontWeight: '600', fontSize: '1rem', cursor: 'pointer', marginTop: '0.5rem' }}
                  >
                    Login
                  </button>
                </form>

                <div style={{ marginTop: '1.25rem', textAlign: 'center', borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
                  <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0 0 0.5rem 0' }}>New member?</p>
                  <button 
                    type="button" 
                    onClick={() => { setIsSelfRegistering(true); setEditingMemberId(null); setFormData({
                      first_name: '', last_name: '', email: '', phone: '',
                      role: 'member', core_department: 'LOVE', sub_departments: [],
                      date_of_birth: '', date_of_baptism: '', date_joined: '',
                      home_address: '', home_town: '', photo_url: ''
                    }); }}
                    style={{ backgroundColor: '#10b981', color: '#ffffff', border: 'none', padding: '0.5rem 1rem', borderRadius: '0.375rem', fontWeight: 'bold', fontSize: '0.85rem', cursor: 'pointer', width: '100%' }}
                  >
                    📝 Self-Register as New Member
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#0f172a', margin: 0 }}>Member Self-Registration</h3>
                  <button type="button" onClick={() => setIsSelfRegistering(false)} style={{ background: 'none', border: 'none', color: '#2563eb', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.85rem' }}>← Back to Login</button>
                </div>

                {formError && <div style={{ backgroundColor: '#fee2e2', color: '#991b1b', padding: '0.75rem', borderRadius: '0.375rem', marginBottom: '1rem', fontSize: '0.875rem' }}>{formError}</div>}
                {formSuccess && <div style={{ backgroundColor: '#d1fae5', color: '#065f46', padding: '0.75rem', borderRadius: '0.375rem', marginBottom: '1rem', fontSize: '0.875rem' }}>{formSuccess}</div>}

                <form onSubmit={handleSaveMember} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '25rem', overflowY: 'auto', paddingRight: '0.25rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', color: '#475569', marginBottom: '0.2rem' }}>First Name *</label>
                      <input type="text" required value={formData.first_name} onChange={(e) => setFormData({...formData, first_name: e.target.value})} style={{ width: '100%', padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', color: '#475569', marginBottom: '0.2rem' }}>Last Name *</label>
                      <input type="text" required value={formData.last_name} onChange={(e) => setFormData({...formData, last_name: e.target.value})} style={{ width: '100%', padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', color: '#475569', marginBottom: '0.2rem' }}>Email *</label>
                      <input type="email" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} style={{ width: '100%', padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', color: '#475569', marginBottom: '0.2rem' }}>Phone</label>
                      <input type="text" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} style={{ width: '100%', padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', color: '#475569', marginBottom: '0.2rem' }}>Core Department *</label>
                    <select value={formData.core_department} onChange={(e) => setFormData({...formData, core_department: e.target.value})} style={{ width: '100%', padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', boxSizing: 'border-box' }}>
                      <option value="LOVE">LOVE</option>
                      <option value="UNITY">UNITY</option>
                      <option value="CARE">CARE</option>
                      <option value="RESPECT">RESPECT</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', color: '#475569', marginBottom: '0.2rem' }}>Sub-Departments</label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.3rem', maxHeight: '7rem', overflowY: 'auto', padding: '0.4rem', border: '1px solid #cbd5e1', borderRadius: '0.375rem', backgroundColor: '#f8fafc' }}>
                      {subDeptList.map((dept) => (
                        <label key={dept} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', cursor: 'pointer' }}>
                          <input type="checkbox" checked={formData.sub_departments.includes(dept)} onChange={() => handleSubDeptToggle(dept)} />
                          {dept}
                        </label>
                      ))}
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.3rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '600', color: '#475569', marginBottom: '0.2rem' }}>Birth Date</label>
                      <input type="date" value={formData.date_of_birth} onChange={(e) => setFormData({...formData, date_of_birth: e.target.value})} style={{ width: '100%', padding: '0.4rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1', fontSize: '0.75rem', boxSizing: 'border-box' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '600', color: '#475569', marginBottom: '0.2rem' }}>Baptism Date</label>
                      <input type="date" value={formData.date_of_baptism} onChange={(e) => setFormData({...formData, date_of_baptism: e.target.value})} style={{ width: '100%', padding: '0.4rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1', fontSize: '0.75rem', boxSizing: 'border-box' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '600', color: '#475569', marginBottom: '0.2rem' }}>Joined Date</label>
                      <input type="date" value={formData.date_joined} onChange={(e) => setFormData({...formData, date_joined: e.target.value})} style={{ width: '100%', padding: '0.4rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1', fontSize: '0.75rem', boxSizing: 'border-box' }} />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', color: '#475569', marginBottom: '0.2rem' }}>Home Address</label>
                      <input type="text" value={formData.home_address} onChange={(e) => setFormData({...formData, home_address: e.target.value})} style={{ width: '100%', padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', color: '#475569', marginBottom: '0.2rem' }}>Home Town</label>
                      <input type="text" value={formData.home_town} onChange={(e) => setFormData({...formData, home_town: e.target.value})} style={{ width: '100%', padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', color: '#475569', marginBottom: '0.2rem' }}>Photo Upload</label>
                    <input type="file" accept="image/*" onChange={handlePhotoUpload} style={{ width: '100%', padding: '0.4rem', fontSize: '0.75rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', boxSizing: 'border-box' }} />
                  </div>

                  <button type="submit" style={{ backgroundColor: '#10b981', color: '#ffffff', border: 'none', padding: '0.65rem', borderRadius: '0.375rem', fontWeight: 'bold', fontSize: '0.9rem', cursor: 'pointer', marginTop: '0.5rem' }}>
                    Complete Self-Registration
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </main>
    );
  }

  // Regular Member Dashboard View
  if (role === 'member') {
    const currentMemberRecord = members.find(m => m.email === user.email) || {};
    const memberTithes = tithes.filter(t => t.member_name.toLowerCase().includes((currentMemberRecord.first_name || '').toLowerCase()));
    const memberContributions = contributions.filter(c => c.contributor.toLowerCase().includes((currentMemberRecord.first_name || '').toLowerCase()));
    const memberWelfareMonths = welfareRecords[currentMemberRecord.id || 'default'] || {};
    const memberWelfareTotal = Object.values(memberWelfareMonths).reduce((mTotal, weeks) => mTotal + weeks.reduce((wSum, w) => wSum + w, 0), 0);

    return (
      <main style={{ minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: 'system-ui, sans-serif', paddingBottom: '2.5rem' }}>
        <div style={{ backgroundColor: '#1e3a8a', color: '#ffffff', padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '1.15rem', fontWeight: 'bold', margin: 0, lineHeight: 1.2 }}>Gracepoint Prophetic Church</h1>
            <span style={{ fontSize: '0.75rem', opacity: 0.85 }}>Member Financial Portal</span>
          </div>
          <button type="button" onClick={handleLogout} style={{ backgroundColor: 'transparent', color: '#ffffff', border: '1px solid #ffffff', padding: '0.35rem 0.85rem', borderRadius: '0.375rem', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem' }}>
            Logout
          </button>
        </div>

        <div style={{ maxWidth: '40rem', margin: '1.5rem auto', padding: '0 1rem' }}>
          <div style={{ backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '0.75rem', padding: '1.5rem', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#0f172a', margin: '0 0 0.5rem 0' }}>
              Welcome, {currentMemberRecord.first_name || user.email}
            </h2>
            <p style={{ fontSize: '0.9rem', color: '#64748b', margin: 0 }}>Core Department: <strong>{currentMemberRecord.core_department || 'N/A'}</strong></p>
          </div>

          <div style={{ backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '0.75rem', padding: '1.5rem', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#1e3a8a', marginBottom: '1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>My Tithes History</h3>
            {memberTithes.length > 0 ? (
              memberTithes.map((t, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px dashed #e2e8f0', fontSize: '0.9rem' }}>
                  <span>{t.date}</span>
                  <strong style={{ color: '#16a34a' }}>GHS {parseFloat(t.amount || 0).toFixed(2)}</strong>
                </div>
              ))
            ) : (
              <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>No tithe records found.</p>
            )}
          </div>

          <div style={{ backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '0.75rem', padding: '1.5rem', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#1e3a8a', marginBottom: '1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>My Contributions History</h3>
            {memberContributions.length > 0 ? (
              memberContributions.map((c, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px dashed #e2e8f0', fontSize: '0.9rem' }}>
                  <span>{c.type} ({c.date})</span>
                  <strong style={{ color: '#16a34a' }}>GHS {parseFloat(c.amount || 0).toFixed(2)}</strong>
                </div>
              ))
            ) : (
              <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>No contribution records found.</p>
            )}
          </div>

          <div style={{ backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '0.75rem', padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#1e3a8a', marginBottom: '1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>My Welfare Summary</h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem', fontWeight: 'bold' }}>
              <span>Total Welfare Paid:</span>
              <span style={{ color: '#1e3a8a' }}>GHS {memberWelfareTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: 'system-ui, sans-serif', paddingBottom: '2.5rem' }}>
      
      <div style={{ backgroundColor: '#1e3a8a', color: '#ffffff', padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.15rem', fontWeight: 'bold', margin: 0, lineHeight: 1.2 }}>
            Gracepoint Prophetic Church
          </h1>
          <span style={{ fontSize: '0.75rem', opacity: 0.85 }}>The Jesus Home Church</span>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <button 
            type="button"
            onClick={handleLogout}
            style={{ backgroundColor: 'transparent', color: '#ffffff', border: '1px solid #ffffff', padding: '0.35rem 0.85rem', borderRadius: '0.375rem', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem' }}
          >
            Logout
          </button>
        </div>
      </div>

      <div style={{ maxWidth: '44rem', margin: '1.25rem auto', padding: '0 1rem' }}>
        
        <h2 style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#0f172a', marginBottom: '1rem' }}>
          Super Admin Dashboard
        </h2>

        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem' }}>
          <button type="button" style={{ backgroundColor: '#4f46e5', color: '#ffffff', border: 'none', padding: '0.6rem 1.2rem', borderRadius: '0.375rem', fontWeight: '600', cursor: 'pointer', fontSize: '0.9rem' }}>
            My Portal
          </button>
          <button 
            type="button" 
            onClick={handleLogout} 
            style={{ backgroundColor: '#ef4444', color: '#ffffff', border: 'none', padding: '0.6rem 1.2rem', borderRadius: '0.375rem', fontWeight: '600', cursor: 'pointer', fontSize: '0.9rem' }}
          >
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
                type="button"
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
                <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '0.75rem' }}>
                  <button 
                    type="button" 
                    onClick={() => { setEditingMemberId(null); setFormData({
                      first_name: '', last_name: '', email: '', phone: '',
                      role: 'member', core_department: 'LOVE', sub_departments: [],
                      date_of_birth: '', date_of_baptism: '', date_joined: '',
                      home_address: '', home_town: '', photo_url: ''
                    }); setShowRegisterForm(true); }} 
                    style={{ flex: 1, backgroundColor: '#10b981', color: '#ffffff', border: 'none', padding: '0.75rem', borderRadius: '0.5rem', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer' }}
                  >
                    + Add New Member
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setIsSelfRegistering(true)} 
                    style={{ backgroundColor: '#4f46e5', color: '#ffffff', border: 'none', padding: '0.75rem 1rem', borderRadius: '0.5rem', fontWeight: 'bold', fontSize: '0.9rem', cursor: 'pointer' }}
                  >
                    🔗 Self-Register Link
                  </button>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {filteredMembers.map((m, index) => {
                    const nameStr = `${m.first_name || ''} ${m.last_name || ''}`.trim() || m.email;
                    const initials = nameStr.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
                    return (
                      <div key={m.id || index} style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '0.75rem', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem' }}>
                          {m.photo_url ? (
                            <img src={m.photo_url} alt="Member" style={{ width: '3rem', height: '3rem', borderRadius: '50%', objectFit: 'cover' }} />
                          ) : (
                            <div style={{ width: '3rem', height: '3rem', borderRadius: '50%', backgroundColor: '#cbd5e1', color: '#334155', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                              {initials}
                            </div>
                          )}
                          <div>
                            <div style={{ fontSize: '1.05rem', fontWeight: 'bold', color: '#0f172a' }}>{nameStr}</div>
                            <div style={{ fontSize: '0.85rem', color: '#475569' }}>Email: {m.email} | Phone: {m.phone || 'N/A'}</div>
                            <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.2rem' }}>
                              <strong>Core Dept:</strong> {m.core_department || 'N/A'} | <strong>Sub-Depts:</strong> {m.sub_departments || 'None'}
                            </div>
                            <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.1rem' }}>
                              <strong>Address:</strong> {m.home_address || 'N/A'}, {m.home_town || 'N/A'}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.1rem' }}>
                              DOB: {m.date_of_birth || 'N/A'} | Baptism: {m.date_of_baptism || 'N/A'} | Joined: {m.date_joined || 'N/A'}
                            </div>
                          </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', alignItems: 'flex-end' }}>
                          <button type="button" onClick={() => handleStartEditMember(m)} style={{ backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', padding: '0.3rem 0.6rem', borderRadius: '0.3rem', fontSize: '0.8rem', fontWeight: 'bold', cursor: 'pointer', color: '#2563eb' }}>
                            ✏️ Edit
                          </button>
                          <button type="button" onClick={() => handleDeleteMember(m.id)} style={{ backgroundColor: '#fee2e2', border: 'none', padding: '0.3rem 0.6rem', borderRadius: '0.3rem', fontSize: '0.8rem', fontWeight: 'bold', cursor: 'pointer', color: '#dc2626' }}>
                            🗑️ Delete
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div style={{ backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '0.75rem', padding: '1.5rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#0f172a', margin: 0 }}>
                    {editingMemberId ? 'Edit Member Details' : 'Register New Member'}
                  </h3>
                  <button type="button" onClick={() => { setShowRegisterForm(false); setEditingMemberId(null); }} style={{ background: 'none', border: 'none', fontSize: '1rem', cursor: 'pointer', color: '#64748b', fontWeight: 'bold' }}>✕ Close</button>
                </div>

                {formError && <div style={{ backgroundColor: '#fee2e2', color: '#991b1b', padding: '0.75rem', borderRadius: '0.375rem', marginBottom: '1rem', fontSize: '0.875rem' }}>{formError}</div>}
                {formSuccess && <div style={{ backgroundColor: '#d1fae5', color: '#065f46', padding: '0.75rem', borderRadius: '0.375rem', marginBottom: '1rem', fontSize: '0.875rem' }}>{formSuccess}</div>}

                <form onSubmit={handleSaveMember} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
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
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#475569', marginBottom: '0.25rem' }}>Upload Member Photo</label>
                    <input type="file" accept="image/*" onChange={handlePhotoUpload} style={{ width: '100%', padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', boxSizing: 'border-box' }} />
                    {formData.photo_url && <p style={{ fontSize: '0.75rem', color: '#16a34a', marginTop: '0.25rem' }}>Photo attached successfully!</p>}
                  </div>

                  <button type="submit" style={{ backgroundColor: '#2563eb', color: '#ffffff', border: 'none', padding: '0.75rem', borderRadius: '0.375rem', fontWeight: 'bold', fontSize: '0.95rem', cursor: 'pointer', marginTop: '0.5rem' }}>
                    {editingMemberId ? 'Update Member' : 'Save Member'}
                  </button>
                </form>
              </div>
            )}
          </div>
        )}

        {/* Contributions & Finance Tab */}
        {activeTab === 'contributions' && (
          <div>
            {financeView === 'hub' && (
              <div>
                <div style={{ backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '0.75rem', padding: '1rem 1.25rem', marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '600' }}>Opening Balance</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#1e3a8a' }}>GHS {openingBalance.toFixed(2)}</div>
                  </div>
                  <button type="button" onClick={() => { const val = prompt("Enter new opening balance:", openingBalance); if(val) setOpeningBalance(parseFloat(val) || 0); }} style={{ backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', padding: '0.5rem 0.85rem', borderRadius: '0.375rem', fontWeight: '600', fontSize: '0.85rem', cursor: 'pointer', color: '#1e3a8a' }}>
                    ✏️ Edit Opening Balance
                  </button>
                </div>

                <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#0f172a', margin: '0 0 0.25rem 0' }}>Finance Management Suite</h3>
                  <p style={{ fontSize: '0.875rem', color: '#64748b', margin: 0 }}>Select a finance module below.</p>
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
                    <div style={{ fontSize: '1rem', fontWeight: 'bold', color: '#1e3a8a' }}>Approve Budgets (Super Admin)</div>
                  </div>
                  <div onClick={() => setFinanceView('tracker')} style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '0.75rem', padding: '1.25rem', textAlign: 'center', cursor: 'pointer' }}>
                    <div style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>👛</div>
                    <div style={{ fontSize: '1rem', fontWeight: 'bold', color: '#1e3a8a' }}>Contribution Tracker</div>
                  </div>
                  <div onClick={() => setFinanceView('welfare')} style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '0.75rem', padding: '1.25rem', textAlign: 'center', cursor: 'pointer' }}>
                    <div style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>🤝</div>
                    <div style={{ fontSize: '1rem', fontWeight: 'bold', color: '#1e3a8a' }}>Welfare Contribution (Auto-Calculated Total)</div>
                  </div>
                  <div onClick={() => setFinanceView('reports')} style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '0.75rem', padding: '1.25rem', textAlign: 'center', cursor: 'pointer' }}>
                    <div style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>💳</div>
                    <div style={{ fontSize: '1rem', fontWeight: 'bold', color: '#1e3a8a' }}>Account Report (Editable, Edit/Delete, PDF with Logo)</div>
                  </div>
                  <div onClick={() => setFinanceView('balancesheet')} style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '0.75rem', padding: '1.25rem', textAlign: 'center', cursor: 'pointer' }}>
                    <div style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>⚖️</div>
                    <div style={{ fontSize: '1rem', fontWeight: 'bold', color: '#1e3a8a' }}>Balance Sheet (Editable, PDF with Logo)</div>
                  </div>
                </div>
              </div>
            )}

            {/* Record Income Module with Edit/Delete */}
            {financeView === 'income' && (
              <div>
                <button type="button" onClick={() => { setFinanceView('hub'); setEditingIncomeIndex(null); }} style={{ backgroundColor: '#e2e8f0', border: 'none', padding: '0.5rem 1rem', borderRadius: '0.375rem', fontWeight: 'bold', cursor: 'pointer', marginBottom: '1rem' }}>
                  ← Back to Finance Hub
                </button>
                <div style={{ backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '0.75rem', padding: '1.25rem', marginBottom: '1.25rem' }}>
                  <h3 style={{ margin: '0 0 1rem 0', color: '#0f172a' }}>{editingIncomeIndex !== null ? 'Edit Income Entry' : 'Record General Income'}</h3>
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    if (editingIncomeIndex !== null) {
                      const updated = [...incomes];
                      updated[editingIncomeIndex] = incomeForm;
                      setIncomes(updated);
                      setEditingIncomeIndex(null);
                      alert('Income updated successfully!');
                    } else {
                      setIncomes([incomeForm, ...incomes]);
                      alert('Income recorded successfully!');
                    }
                    setIncomeForm({ source: '', amount: '', date: '' });
                  }} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#475569', marginBottom: '0.25rem' }}>Income Source / Title</label>
                      <input type="text" required value={incomeForm.source} onChange={(e) => setIncomeForm({...incomeForm, source: e.target.value})} style={{ width: '100%', padding: '0.6rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} placeholder="e.g. Sunday Offering" />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#475569', marginBottom: '0.25rem' }}>Amount (GHS)</label>
                      <input type="number" required step="0.01" value={incomeForm.amount} onChange={(e) => setIncomeForm({...incomeForm, amount: e.target.value})} style={{ width: '100%', padding: '0.6rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} placeholder="0.00" />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#475569', marginBottom: '0.25rem' }}>Date</label>
                      <input type="date" required value={incomeForm.date} onChange={(e) => setIncomeForm({...incomeForm, date: e.target.value})} style={{ width: '100%', padding: '0.6rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
                    </div>
                    <button type="submit" style={{ backgroundColor: '#2563eb', color: '#ffffff', border: 'none', padding: '0.75rem', borderRadius: '0.375rem', fontWeight: 'bold', cursor: 'pointer', marginTop: '0.5rem' }}>
                      {editingIncomeIndex !== null ? 'Update Income' : 'Save Income Entry'}
                    </button>
                  </form>
                </div>
                <h4 style={{ color: '#0f172a' }}>Recorded Incomes ({incomes.length})</h4>
                {incomes.map((inc, i) => (
                  <div key={i} style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '0.5rem', padding: '0.75rem 1rem', marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span><strong>{inc.source}</strong> ({inc.date}) - <strong style={{ color: '#16a34a' }}>GHS {parseFloat(inc.amount || 0).toFixed(2)}</strong></span>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button type="button" onClick={() => { setIncomeForm(inc); setEditingIncomeIndex(i); }} style={{ backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', padding: '0.25rem 0.5rem', borderRadius: '0.25rem', cursor: 'pointer', fontSize: '0.8rem' }}>Edit</button>
                      <button type="button" onClick={() => setIncomes(incomes.filter((_, idx) => idx !== i))} style={{ backgroundColor: '#fee2e2', color: '#991b1b', border: 'none', padding: '0.25rem 0.5rem', borderRadius: '0.25rem', cursor: 'pointer', fontSize: '0.8rem' }}>Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Record Expenses Module with Edit/Delete */}
            {financeView === 'expenses' && (
              <div>
                <button type="button" onClick={() => { setFinanceView('hub'); setEditingExpenseIndex(null); }} style={{ backgroundColor: '#e2e8f0', border: 'none', padding: '0.5rem 1rem', borderRadius: '0.375rem', fontWeight: 'bold', cursor: 'pointer', marginBottom: '1rem' }}>
                  ← Back to Finance Hub
                </button>
                <div style={{ backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '0.75rem', padding: '1.25rem', marginBottom: '1.25rem' }}>
                  <h3 style={{ margin: '0 0 1rem 0', color: '#0f172a' }}>{editingExpenseIndex !== null ? 'Edit Expense Entry' : 'Record Expense'}</h3>
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    if (editingExpenseIndex !== null) {
                      const updated = [...expenses];
                      updated[editingExpenseIndex] = expenseForm;
                      setExpenses(updated);
                      setEditingExpenseIndex(null);
                      alert('Expense updated successfully!');
                    } else {
                      setExpenses([expenseForm, ...expenses]);
                      alert('Expense recorded successfully!');
                    }
                    setExpenseForm({ description: '', amount: '', date: '' });
                  }} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#475569', marginBottom: '0.25rem' }}>Expense Description</label>
                      <input type="text" required value={expenseForm.description} onChange={(e) => setExpenseForm({...expenseForm, description: e.target.value})} style={{ width: '100%', padding: '0.6rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} placeholder="e.g. Utility bills" />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#475569', marginBottom: '0.25rem' }}>Amount (GHS)</label>
                      <input type="number" required step="0.01" value={expenseForm.amount} onChange={(e) => setExpenseForm({...expenseForm, amount: e.target.value})} style={{ width: '100%', padding: '0.6rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} placeholder="0.00" />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#475569', marginBottom: '0.25rem' }}>Date</label>
                      <input type="date" required value={expenseForm.date} onChange={(e) => setExpenseForm({...expenseForm, date: e.target.value})} style={{ width: '100%', padding: '0.6rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
                    </div>
                    <button type="submit" style={{ backgroundColor: '#2563eb', color: '#ffffff', border: 'none', padding: '0.75rem', borderRadius: '0.375rem', fontWeight: 'bold', cursor: 'pointer', marginTop: '0.5rem' }}>
                      {editingExpenseIndex !== null ? 'Update Expense' : 'Save Expense Entry'}
                    </button>
                  </form>
                </div>
                <h4 style={{ color: '#0f172a' }}>Recorded Expenses ({expenses.length})</h4>
                {expenses.map((exp, i) => (
                  <div key={i} style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '0.5rem', padding: '0.75rem 1rem', marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span><strong>{exp.description}</strong> ({exp.date}) - <strong style={{ color: '#dc2626' }}>GHS {parseFloat(exp.amount || 0).toFixed(2)}</strong></span>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button type="button" onClick={() => { setExpenseForm(exp); setEditingExpenseIndex(i); }} style={{ backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', padding: '0.25rem 0.5rem', borderRadius: '0.25rem', cursor: 'pointer', fontSize: '0.8rem' }}>Edit</button>
                      <button type="button" onClick={() => setExpenses(expenses.filter((_, idx) => idx !== i))} style={{ backgroundColor: '#fee2e2', color: '#991b1b', border: 'none', padding: '0.25rem 0.5rem', borderRadius: '0.25rem', cursor: 'pointer', fontSize: '0.8rem' }}>Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Tithes Module with Edit/Delete */}
            {financeView === 'tithes' && (
              <div>
                <button type="button" onClick={() => { setFinanceView('hub'); setEditingTitheIndex(null); }} style={{ backgroundColor: '#e2e8f0', border: 'none', padding: '0.5rem 1rem', borderRadius: '0.375rem', fontWeight: 'bold', cursor: 'pointer', marginBottom: '1rem' }}>
                  ← Back to Finance Hub
                </button>
                <div style={{ backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '0.75rem', padding: '1.25rem', marginBottom: '1.25rem' }}>
                  <h3 style={{ margin: '0 0 1rem 0', color: '#0f172a' }}>{editingTitheIndex !== null ? 'Edit Tithe Entry' : 'Record Member Tithes'}</h3>
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    if (editingTitheIndex !== null) {
                      const updated = [...tithes];
                      updated[editingTitheIndex] = titheForm;
                      setTithes(updated);
                      setEditingTitheIndex(null);
                      alert('Tithe updated successfully!');
                    } else {
                      setTithes([titheForm, ...tithes]);
                      alert('Tithe recorded successfully!');
                    }
                    setTitheForm({ member_name: '', amount: '', date: '' });
                  }} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#475569', marginBottom: '0.25rem' }}>Member Name</label>
                      <input type="text" required value={titheForm.member_name} onChange={(e) => setTitheForm({...titheForm, member_name: e.target.value})} style={{ width: '100%', padding: '0.6rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} placeholder="Full name" />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#475569', marginBottom: '0.25rem' }}>Amount (GHS)</label>
                      <input type="number" required step="0.01" value={titheForm.amount} onChange={(e) => setTitheForm({...titheForm, amount: e.target.value})} style={{ width: '100%', padding: '0.6rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} placeholder="0.00" />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#475569', marginBottom: '0.25rem' }}>Date</label>
                      <input type="date" required value={titheForm.date} onChange={(e) => setTitheForm({...titheForm, date: e.target.value})} style={{ width: '100%', padding: '0.6rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
                    </div>
                    <button type="submit" style={{ backgroundColor: '#2563eb', color: '#ffffff', border: 'none', padding: '0.75rem', borderRadius: '0.375rem', fontWeight: 'bold', cursor: 'pointer', marginTop: '0.5rem' }}>
                      {editingTitheIndex !== null ? 'Update Tithe' : 'Save Tithe Entry'}
                    </button>
                  </form>
                </div>
                <h4 style={{ color: '#0f172a' }}>Recorded Tithes ({tithes.length})</h4>
                {tithes.map((t, i) => (
                  <div key={i} style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '0.5rem', padding: '0.75rem 1rem', marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span><strong>{t.member_name}</strong> ({t.date}) - <strong style={{ color: '#16a34a' }}>GHS {parseFloat(t.amount || 0).toFixed(2)}</strong></span>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button type="button" onClick={() => { setTitheForm(t); setEditingTitheIndex(i); }} style={{ backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', padding: '0.25rem 0.5rem', borderRadius: '0.25rem', cursor: 'pointer', fontSize: '0.8rem' }}>Edit</button>
                      <button type="button" onClick={() => setTithes(tithes.filter((_, idx) => idx !== i))} style={{ backgroundColor: '#fee2e2', color: '#991b1b', border: 'none', padding: '0.25rem 0.5rem', borderRadius: '0.25rem', cursor: 'pointer', fontSize: '0.8rem' }}>Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Record Budgets Module */}
            {financeView === 'budgets' && (
              <div>
                <button type="button" onClick={() => setFinanceView('hub')} style={{ backgroundColor: '#e2e8f0', border: 'none', padding: '0.5rem 1rem', borderRadius: '0.375rem', fontWeight: 'bold', cursor: 'pointer', marginBottom: '1rem' }}>
                  ← Back to Finance Hub
                </button>
                <div style={{ backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '0.75rem', padding: '1.25rem', marginBottom: '1.25rem' }}>
                  <h3 style={{ margin: '0 0 1rem 0', color: '#0f172a' }}>Record Budget Item</h3>
                  <form onSubmit={(e) => { e.preventDefault(); setBudgets([budgetForm, ...budgets]); setBudgetForm({ item: '', estimated: '', status: 'Pending' }); alert('Budget saved and sent for Super Admin approval!'); }} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#475569', marginBottom: '0.25rem' }}>Item / Project Name</label>
                      <input type="text" required value={budgetForm.item} onChange={(e) => setBudgetForm({...budgetForm, item: e.target.value})} style={{ width: '100%', padding: '0.6rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} placeholder="e.g. Sound System Upgrade" />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#475569', marginBottom: '0.25rem' }}>Estimated Cost (GHS)</label>
                      <input type="number" required step="0.01" value={budgetForm.estimated} onChange={(e) => setBudgetForm({...budgetForm, estimated: e.target.value})} style={{ width: '100%', padding: '0.6rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} placeholder="0.00" />
                    </div>
                    <button type="submit" style={{ backgroundColor: '#2563eb', color: '#ffffff', border: 'none', padding: '0.75rem', borderRadius: '0.375rem', fontWeight: 'bold', cursor: 'pointer', marginTop: '0.5rem' }}>
                      Submit Budget for Approval
                    </button>
                  </form>
                </div>
                <h4 style={{ color: '#0f172a' }}>Budgets List ({budgets.length})</h4>
                {budgets.map((b, i) => (
                  <div key={i} style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '0.5rem', padding: '0.75rem 1rem', marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span><strong>{b.item}</strong> (GHS {parseFloat(b.estimated || 0).toFixed(2)})</span>
                    <span style={{ fontWeight: 'bold', color: b.status === 'Approved' ? '#16a34a' : '#d97706' }}>{b.status}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Approve Budgets Module (Super Admin) */}
            {financeView === 'approve_budgets' && (
              <div>
                <button type="button" onClick={() => setFinanceView('hub')} style={{ backgroundColor: '#e2e8f0', border: 'none', padding: '0.5rem 1rem', borderRadius: '0.375rem', fontWeight: 'bold', cursor: 'pointer', marginBottom: '1rem' }}>
                  ← Back to Finance Hub
                </button>
                <div style={{ backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '0.75rem', padding: '1.25rem', marginBottom: '1.25rem' }}>
                  <h3 style={{ margin: '0 0 0.5rem 0', color: '#0f172a' }}>Budget Approval Portal</h3>
                  <p style={{ fontSize: '0.85rem', color: '#64748b' }}>As Super Admin, review and approve submitted church budgets below. Approved budgets automatically reflect on the Account Report.</p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {budgets.length > 0 ? (
                    budgets.map((b, i) => (
                      <div key={i} style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '0.75rem', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontWeight: 'bold', fontSize: '1rem', color: '#0f172a' }}>{b.item}</div>
                          <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Amount: GHS {parseFloat(b.estimated || 0).toFixed(2)}</div>
                        </div>
                        <div>
                          {b.status === 'Pending' ? (
                            <button 
                              type="button" 
                              onClick={() => {
                                const updated = [...budgets];
                                updated[i].status = 'Approved';
                                setBudgets(updated);
                                alert(`Budget "${b.item}" approved successfully and factored into Account Reports!`);
                              }} 
                              style={{ backgroundColor: '#10b981', color: '#ffffff', border: 'none', padding: '0.5rem 1rem', borderRadius: '0.375rem', fontWeight: 'bold', cursor: 'pointer' }}
                            >
                              Approve Budget
                            </button>
                          ) : (
                            <span style={{ backgroundColor: '#d1fae5', color: '#065f46', padding: '0.4rem 0.8rem', borderRadius: '0.375rem', fontWeight: 'bold', fontSize: '0.85rem' }}>
                              ✓ Approved
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '0.75rem', padding: '2rem', textAlign: 'center', color: '#64748b' }}>
                      <p style={{ margin: 0 }}>No budgets recorded yet.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Contribution Tracker Module with Edit/Delete */}
            {financeView === 'tracker' && (
              <div>
                <button type="button" onClick={() => { setFinanceView('hub'); setEditingContribIndex(null); }} style={{ backgroundColor: '#e2e8f0', border: 'none', padding: '0.5rem 1rem', borderRadius: '0.375rem', fontWeight: 'bold', cursor: 'pointer', marginBottom: '1rem' }}>
                  ← Back to Finance Hub
                </button>
                <div style={{ backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '0.75rem', padding: '1.25rem', marginBottom: '1.25rem' }}>
                  <h3 style={{ margin: '0 0 1rem 0', color: '#0f172a' }}>{editingContribIndex !== null ? 'Edit Contribution Entry' : 'Contribution Tracker'}</h3>
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    if (editingContribIndex !== null) {
                      const updated = [...contributions];
                      updated[editingContribIndex] = contribForm;
                      setContributions(updated);
                      setEditingContribIndex(null);
                      alert('Contribution updated successfully!');
                    } else {
                      setContributions([contribForm, ...contributions]);
                      alert('Contribution recorded successfully!');
                    }
                    setContribForm({ contributor: '', type: 'General', amount: '', date: '' });
                  }} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#475569', marginBottom: '0.25rem' }}>Contributor Name</label>
                      <input type="text" required value={contribForm.contributor} onChange={(e) => setContribForm({...contribForm, contributor: e.target.value})} style={{ width: '100%', padding: '0.6rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} placeholder="Name or anonymous" />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#475569', marginBottom: '0.25rem' }}>Contribution Type</label>
                      <select value={contribForm.type} onChange={(e) => setContribForm({...contribForm, type: e.target.value})} style={{ width: '100%', padding: '0.6rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', boxSizing: 'border-box' }}>
                        <option value="General">General Offering</option>
                        <option value="Building Fund">Building Fund</option>
                        <option value="Harvest">Harvest / Special</option>
                        <option value="Mission">Mission</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#475569', marginBottom: '0.25rem' }}>Amount (GHS)</label>
                      <input type="number" required step="0.01" value={contribForm.amount} onChange={(e) => setContribForm({...contribForm, amount: e.target.value})} style={{ width: '100%', padding: '0.6rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} placeholder="0.00" />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#475569', marginBottom: '0.25rem' }}>Date</label>
                      <input type="date" required value={contribForm.date} onChange={(e) => setContribForm({...contribForm, date: e.target.value})} style={{ width: '100%', padding: '0.6rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
                    </div>
                    <button type="submit" style={{ backgroundColor: '#2563eb', color: '#ffffff', border: 'none', padding: '0.75rem', borderRadius: '0.375rem', fontWeight: 'bold', cursor: 'pointer', marginTop: '0.5rem' }}>
                      {editingContribIndex !== null ? 'Update Contribution' : 'Save Contribution'}
                    </button>
                  </form>
                </div>
                <h4 style={{ color: '#0f172a' }}>Tracked Contributions ({contributions.length})</h4>
                {contributions.map((c, i) => (
                  <div key={i} style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '0.5rem', padding: '0.75rem 1rem', marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span><strong>{c.contributor}</strong> [{c.type}] - <strong style={{ color: '#16a34a' }}>GHS {parseFloat(c.amount || 0).toFixed(2)}</strong></span>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button type="button" onClick={() => { setContribForm(c); setEditingContribIndex(i); }} style={{ backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', padding: '0.25rem 0.5rem', borderRadius: '0.25rem', cursor: 'pointer', fontSize: '0.8rem' }}>Edit</button>
                      <button type="button" onClick={() => setContributions(contributions.filter((_, idx) => idx !== i))} style={{ backgroundColor: '#fee2e2', color: '#991b1b', border: 'none', padding: '0.25rem 0.5rem', borderRadius: '0.25rem', cursor: 'pointer', fontSize: '0.8rem' }}>Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Welfare Contribution Matrix with Auto-Total Column */}
            {financeView === 'welfare' && (
              <div>
                <button type="button" onClick={() => { setFinanceView('hub'); setSelectedMemberForWelfare(null); }} style={{ backgroundColor: '#e2e8f0', border: 'none', padding: '0.5rem 1rem', borderRadius: '0.375rem', fontWeight: 'bold', cursor: 'pointer', marginBottom: '1rem' }}>
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
                      <button type="button" onClick={() => setSelectedMemberForWelfare(null)} style={{ background: 'none', border: 'none', fontSize: '1rem', cursor: 'pointer', fontWeight: 'bold' }}>✕</button>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1rem' }}>Compulsory weekly welfare contributions with auto-calculated total column:</p>
                    
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                        <thead>
                          <tr style={{ backgroundColor: '#4f46e5', color: '#ffffff' }}>
                            <th style={{ padding: '0.5rem', border: '1px solid #cbd5e1' }}>Months</th>
                            <th style={{ padding: '0.5rem', border: '1px solid #cbd5e1' }}>1st Wk</th>
                            <th style={{ padding: '0.5rem', border: '1px solid #cbd5e1' }}>2nd Wk</th>
                            <th style={{ padding: '0.5rem', border: '1px solid #cbd5e1' }}>3rd Wk</th>
                            <th style={{ padding: '0.5rem', border: '1px solid #cbd5e1' }}>4th Wk</th>
                            <th style={{ padding: '0.5rem', border: '1px solid #cbd5e1', backgroundColor: '#3730a3' }}>Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((month) => {
                            const memberRec = welfareRecords[selectedMemberForWelfare.id || 'default'] || {};
                            const weeks = memberRec[month] || [0,0,0,0];
                            const monthTotal = weeks.reduce((sum, w) => sum + w, 0);
                            return (
                              <tr key={month}>
                                <td style={{ padding: '0.5rem', border: '1px solid #cbd5e1', fontWeight: 'bold', backgroundColor: '#f1f5f9' }}>{month}</td>
                                {weeks.map((val, idx) => (
                                  <td key={idx} style={{ padding: '0.5rem', border: '1px solid #cbd5e1', textAlign: 'center' }}>
                                    <input 
                                      type="number" 
                                      step="0.01" 
                                      value={val === 0 ? '' : val} 
                                      onChange={(e) => handleWelfareChange(selectedMemberForWelfare.id || 'default', month, idx, e.target.value)} 
                                      placeholder="0"
                                      style={{ width: '3rem', padding: '0.25rem', textAlign: 'center', border: '1px solid #cbd5e1', borderRadius: '0.25rem' }} 
                                    />
                                  </td>
                                ))}
                                <td style={{ padding: '0.5rem', border: '1px solid #cbd5e1', textAlign: 'center', fontWeight: 'bold', backgroundColor: '#eef2ff', color: '#1e3a8a' }}>
                                  {monthTotal.toFixed(2)}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    <button type="button" onClick={() => { alert('Welfare records saved successfully!'); setFinanceView('hub'); setSelectedMemberForWelfare(null); }} style={{ width: '100%', backgroundColor: '#4f46e5', color: '#ffffff', border: 'none', padding: '0.75rem', borderRadius: '0.5rem', fontWeight: 'bold', marginTop: '1.25rem', cursor: 'pointer' }}>
                      Save Welfare Records
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Account Report Module with Full Member Financial Listings */}
            {financeView === 'reports' && (
              <div style={{ backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '0.75rem', padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <button type="button" onClick={() => setFinanceView('hub')} style={{ backgroundColor: '#e2e8f0', border: 'none', padding: '0.5rem 1rem', borderRadius: '0.375rem', fontWeight: 'bold', cursor: 'pointer' }}>
                    ← Back to Hub
                  </button>
                  <button type="button" onClick={() => downloadPDFReport('Account Report')} style={{ backgroundColor: '#10b981', color: '#ffffff', border: 'none', padding: '0.5rem 1rem', borderRadius: '0.375rem', fontWeight: 'bold', cursor: 'pointer' }}>
                    📥 Download Official PDF Report
                  </button>
                </div>

                <div style={{ textAlign: 'center', marginBottom: '1.25rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem' }}>
                  <h3 style={{ margin: '0 0 0.25rem 0', color: '#1e3a8a' }}>GRACEPOINT PROPHETIC CHURCH</h3>
                  <div style={{ fontSize: '0.85rem', color: '#64748b', fontStyle: 'italic' }}>The Jesus Home Church</div>
                  <h4 style={{ margin: '0.5rem 0 0 0', color: '#0f172a' }}>Account Report</h4>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #e2e8f0' }}>
                    <span>Opening Balance:</span>
                    <strong>GHS {openingBalance.toFixed(2)}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #e2e8f0' }}>
                    <span>Total General Incomes:</span>
                    <strong style={{ color: '#16a34a' }}>+ GHS {totalIncomeSum.toFixed(2)}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #e2e8f0' }}>
                    <span>Total Tithes:</span>
                    <strong style={{ color: '#16a34a' }}>+ GHS {totalTitheSum.toFixed(2)}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #e2e8f0' }}>
                    <span>Total Contributions:</span>
                    <strong style={{ color: '#16a34a' }}>+ GHS {totalContribSum.toFixed(2)}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #e2e8f0' }}>
                    <span>Total Welfare Contributions:</span>
                    <strong style={{ color: '#16a34a' }}>+ GHS {totalWelfareSum.toFixed(2)}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #e2e8f0' }}>
                    <span>Total Expenses:</span>
                    <strong style={{ color: '#dc2626' }}>- GHS {totalExpenseSum.toFixed(2)}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #e2e8f0' }}>
                    <span>Approved Budgets (Allocated):</span>
                    <strong style={{ color: '#dc2626' }}>- GHS {approvedBudgetsSum.toFixed(2)}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', fontSize: '1.1rem', backgroundColor: '#f8fafc', fontWeight: 'bold' }}>
                    <span>Net Balance:</span>
                    <span style={{ color: '#1e3a8a' }}>GHS {netBalance.toFixed(2)}</span>
                  </div>
                </div>

                {/* Detailed Member Tracking on Report */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <h4 style={{ color: '#1e3a8a', borderBottom: '1px solid #cbd5e1', paddingBottom: '0.3rem' }}>Member Financial Contributions & Tithes Tracking</h4>
                  
                  {tithes.length > 0 && (
                    <div style={{ marginTop: '0.75rem' }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#475569' }}>Member Tithes:</div>
                      {tithes.map((t, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', padding: '0.3rem 0', borderBottom: '1px dashed #e2e8f0' }}>
                          <span><strong>{t.member_name}</strong> ({t.date})</span>
                          <span style={{ color: '#16a34a', fontWeight: 'bold' }}>+GHS {parseFloat(t.amount || 0).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {contributions.length > 0 && (
                    <div style={{ marginTop: '0.75rem' }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#475569' }}>Member Contributions:</div>
                      {contributions.map((c, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', padding: '0.3rem 0', borderBottom: '1px dashed #e2e8f0' }}>
                          <span><strong>{c.contributor}</strong> [{c.type}] ({c.date})</span>
                          <span style={{ color: '#16a34a', fontWeight: 'bold' }}>+GHS {parseFloat(c.amount || 0).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {Object.keys(welfareRecords).length > 0 && (
                    <div style={{ marginTop: '0.75rem' }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#475569' }}>Member Welfare Tracking:</div>
                      {Object.entries(welfareRecords).map(([mId, monthsData], i) => {
                        const memObj = members.find(m => (m.id || 'default') === mId) || { first_name: 'Member', last_name: '' };
                        const memName = `${memObj.first_name || ''} ${memObj.last_name || ''}`.trim() || 'Member';
                        const memTotal = Object.values(monthsData).reduce((mSum, weeks) => mSum + weeks.reduce((wSum, w) => wSum + w, 0), 0);
                        return (
                          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', padding: '0.3rem 0', borderBottom: '1px dashed #e2e8f0' }}>
                            <span><strong>{memName}</strong> (Welfare Total)</span>
                            <span style={{ color: '#16a34a', fontWeight: 'bold' }}>+GHS {memTotal.toFixed(2)}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#475569', marginBottom: '0.375rem' }}>Super Admin Editable Notes / Audit Remarks</label>
                  <textarea 
                    value={accountReportNotes} 
                    onChange={(e) => setAccountReportNotes(e.target.value)} 
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1', minHeight: '5rem', boxSizing: 'border-box' }} 
                  />
                </div>
              </div>
            )}

            {/* Balance Sheet Module */}
            {financeView === 'balancesheet' && (
              <div style={{ backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '0.75rem', padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <button type="button" onClick={() => setFinanceView('hub')} style={{ backgroundColor: '#e2e8f0', border: 'none', padding: '0.5rem 1rem', borderRadius: '0.375rem', fontWeight: 'bold', cursor: 'pointer' }}>
                    ← Back to Hub
                  </button>
                  <button type="button" onClick={() => downloadPDFReport('Balance Sheet')} style={{ backgroundColor: '#10b981', color: '#ffffff', border: 'none', padding: '0.5rem 1rem', borderRadius: '0.375rem', fontWeight: 'bold', cursor: 'pointer' }}>
                    📥 Download Official PDF Report
                  </button>
                </div>

                <div style={{ textAlign: 'center', marginBottom: '1.25rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem' }}>
                  <h3 style={{ margin: '0 0 0.25rem 0', color: '#1e3a8a' }}>GRACEPOINT PROPHETIC CHURCH</h3>
                  <div style={{ fontSize: '0.85rem', color: '#64748b', fontStyle: 'italic' }}>The Jesus Home Church</div>
                  <h4 style={{ margin: '0.5rem 0 0 0', color: '#0f172a' }}>Balance Sheet</h4>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
                  <div style={{ backgroundColor: '#f1f5f9', padding: '0.5rem', fontWeight: 'bold', color: '#1e3a8a' }}>ASSETS</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #e2e8f0' }}>
                    <span>Cash & Bank (Net Fund Balance):</span>
                    <strong>GHS {netBalance.toFixed(2)}</strong>
                  </div>
                  <div style={{ backgroundColor: '#f1f5f9', padding: '0.5rem', fontWeight: 'bold', color: '#1e3a8a', marginTop: '0.5rem' }}>LIABILITIES & EQUITY</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #e2e8f0' }}>
                    <span>Total Liabilities:</span>
                    <strong>GHS 0.00</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', fontSize: '1.1rem', backgroundColor: '#f8fafc', fontWeight: 'bold' }}>
                    <span>Total Equity / Fund:</span>
                    <span style={{ color: '#1e3a8a' }}>GHS {netBalance.toFixed(2)}</span>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#475569', marginBottom: '0.375rem' }}>Super Admin Editable Balance Sheet Remarks</label>
                  <textarea 
                    value={balanceSheetNotes} 
                    onChange={(e) => setBalanceSheetNotes(e.target.value)} 
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1', minHeight: '5rem', boxSizing: 'border-box' }} 
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Attendance Tab */}
        {activeTab === 'attendance' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#0f172a', margin: 0 }}>Service Attendance Logs</h3>
              <button type="button" onClick={() => setShowAttendanceForm(!showAttendanceForm)} style={{ backgroundColor: '#10b981', color: '#ffffff', border: 'none', padding: '0.65rem 1rem', borderRadius: '0.5rem', fontWeight: 'bold', fontSize: '0.9rem', cursor: 'pointer' }}>
                {showAttendanceForm ? 'Cancel' : '+ Log Attendance'}
              </button>
            </div>

            {showAttendanceForm && (
              <form onSubmit={(e) => { e.preventDefault(); setAttendanceLogs([attendanceForm, ...attendanceLogs]); setAttendanceForm({ service_date: '', department: 'General', status: 'Present' }); setShowAttendanceForm(false); }} style={{ backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '0.75rem', padding: '1.25rem', marginBottom: '1.25rem' }}>
                <h4 style={{ margin: '0 0 1rem 0', color: '#0f172a' }}>New Attendance Record</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#475569', marginBottom: '0.25rem' }}>Service Date</label>
                    <input type="date" required value={attendanceForm.service_date} onChange={(e) => setAttendanceForm({...attendanceForm, service_date: e.target.value})} style={{ width: '100%', padding: '0.6rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#475569', marginBottom: '0.25rem' }}>Department</label>
                    <select value={attendanceForm.department} onChange={(e) => setAttendanceForm({...attendanceForm, department: e.target.value})} style={{ width: '100%', padding: '0.6rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', boxSizing: 'border-box' }}>
                      <option value="General">General</option>
                      <option value="LOVE">LOVE</option>
                      <option value="UNITY">UNITY</option>
                      <option value="CARE">CARE</option>
                      <option value="RESPECT">RESPECT</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#475569', marginBottom: '0.25rem' }}>Status</label>
                    <select value={attendanceForm.status} onChange={(e) => setAttendanceForm({...attendanceForm, status: e.target.value})} style={{ width: '100%', padding: '0.6rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', boxSizing: 'border-box' }}>
                      <option value="Present">Present</option>
                      <option value="Absent">Absent</option>
                      <option value="Excused">Excused</option>
                    </select>
                  </div>
                  <button type="submit" style={{ backgroundColor: '#2563eb', color: '#ffffff', border: 'none', padding: '0.65rem', borderRadius: '0.375rem', fontWeight: 'bold', cursor: 'pointer', marginTop: '0.5rem' }}>
                    Save Attendance Log
                  </button>
                </div>
              </form>
            )}

            <div style={{ backgroundColor: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '0.5rem', padding: '1rem 1.25rem', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', fontWeight: 'bold', color: '#0f172a', fontSize: '0.95rem', marginBottom: '0.75rem' }}>
              <span>Service Date</span>
              <span>Department</span>
              <span>Status</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {attendanceLogs.length > 0 ? (
                attendanceLogs.map((log, i) => (
                  <div key={i} style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '0.5rem', padding: '1rem 1.25rem', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', fontSize: '0.9rem', color: '#334155' }}>
                    <span>{log.service_date}</span>
                    <span>{log.department}</span>
                    <span style={{ fontWeight: 'bold', color: log.status === 'Present' ? '#16a34a' : '#dc2626' }}>{log.status}</span>
                  </div>
                ))
              ) : (
                <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '0.75rem', padding: '2rem', textAlign: 'center', color: '#64748b' }}>
                  <p style={{ margin: 0 }}>No attendance logs recorded yet.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Events Tab */}
        {activeTab === 'events' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#0f172a', margin: 0 }}>Church Events</h3>
              <button type="button" onClick={() => setShowEventForm(!showEventForm)} style={{ backgroundColor: '#10b981', color: '#ffffff', border: 'none', padding: '0.65rem 1rem', borderRadius: '0.5rem', fontWeight: 'bold', fontSize: '0.9rem', cursor: 'pointer' }}>
                {showEventForm ? 'Cancel' : '+ Add Event'}
              </button>
            </div>

            {showEventForm && (
              <form onSubmit={(e) => { e.preventDefault(); setEventsList([eventForm, ...eventsList]); setEventForm({ title: '', date: '', description: '' }); setShowEventForm(false); }} style={{ backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '0.75rem', padding: '1.25rem', marginBottom: '1.25rem' }}>
                <h4 style={{ margin: '0 0 1rem 0', color: '#0f172a' }}>Create New Event</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#475569', marginBottom: '0.25rem' }}>Event Title</label>
                    <input type="text" required value={eventForm.title} onChange={(e) => setEventForm({...eventForm, title: e.target.value})} style={{ width: '100%', padding: '0.6rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} placeholder="Event title" />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#475569', marginBottom: '0.25rem' }}>Event Date</label>
                    <input type="date" required value={eventForm.date} onChange={(e) => setEventForm({...eventForm, date: e.target.value})} style={{ width: '100%', padding: '0.6rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#475569', marginBottom: '0.25rem' }}>Description</label>
                    <textarea value={eventForm.description} onChange={(e) => setEventForm({...eventForm, description: e.target.value})} style={{ width: '100%', padding: '0.6rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1', boxSizing: 'border-box', height: '4rem' }} placeholder="Event details..." />
                  </div>
                  <button type="submit" style={{ backgroundColor: '#2563eb', color: '#ffffff', border: 'none', padding: '0.65rem', borderRadius: '0.375rem', fontWeight: 'bold', cursor: 'pointer', marginTop: '0.5rem' }}>
                    Publish Event
                  </button>
                </div>
              </form>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {eventsList.length > 0 ? (
                eventsList.map((ev, i) => (
                  <div key={i} style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '0.75rem', padding: '1.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <h4 style={{ margin: 0, color: '#1e3a8a', fontSize: '1rem' }}>{ev.title}</h4>
                      <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '600' }}>{ev.date}</span>
                    </div>
                    <p style={{ margin: 0, fontSize: '0.9rem', color: '#334155' }}>{ev.description}</p>
                  </div>
                ))
              ) : (
                <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '0.75rem', padding: '2rem', textAlign: 'center', color: '#64748b' }}>
                  <p style={{ margin: 0 }}>No upcoming events scheduled yet.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Announcements Tab */}
        {activeTab === 'announcements' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#0f172a', margin: 0 }}>Church Announcements</h3>
              <button type="button" onClick={() => setShowAnnounceForm(!showAnnounceForm)} style={{ backgroundColor: '#10b981', color: '#ffffff', border: 'none', padding: '0.65rem 1rem', borderRadius: '0.5rem', fontWeight: 'bold', fontSize: '0.9rem', cursor: 'pointer' }}>
                {showAnnounceForm ? 'Cancel' : '+ Post Announcement'}
              </button>
            </div>

            {showAnnounceForm && (
              <form onSubmit={(e) => { e.preventDefault(); setAnnouncementsList([announceForm, ...announcementsList]); setAnnounceForm({ title: '', message: '' }); setShowAnnounceForm(false); }} style={{ backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '0.75rem', padding: '1.25rem', marginBottom: '1.25rem' }}>
                <h4 style={{ margin: '0 0 1rem 0', color: '#0f172a' }}>New Announcement</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#475569', marginBottom: '0.25rem' }}>Title</label>
                    <input type="text" required value={announceForm.title} onChange={(e) => setAnnounceForm({...announceForm, title: e.target.value})} style={{ width: '100%', padding: '0.6rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} placeholder="Announcement title" />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#475569', marginBottom: '0.25rem' }}>Message</label>
                    <textarea required value={announceForm.message} onChange={(e) => setAnnounceForm({...announceForm, message: e.target.value})} style={{ width: '100%', padding: '0.6rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1', boxSizing: 'border-box', height: '4rem' }} placeholder="Broadcast message..." />
                  </div>
                  <button type="submit" style={{ backgroundColor: '#2563eb', color: '#ffffff', border: 'none', padding: '0.65rem', borderRadius: '0.375rem', fontWeight: 'bold', cursor: 'pointer', marginTop: '0.5rem' }}>
                    Broadcast Announcement
                  </button>
                </div>
              </form>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {announcementsList.length > 0 ? (
                announcementsList.map((ann, i) => (
                  <div key={i} style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '0.75rem', padding: '1.25rem' }}>
                    <h4 style={{ margin: '0 0 0.5rem 0', color: '#1e3a8a', fontSize: '1rem' }}>{ann.title}</h4>
                    <p style={{ margin: 0, fontSize: '0.9rem', color: '#334155' }}>{ann.message}</p>
                  </div>
                ))
              ) : (
                <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '0.75rem', padding: '2rem', textAlign: 'center', color: '#64748b' }}>
                  <p style={{ margin: 0 }}>No announcements broadcasted yet.</p>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </main>
  );
}
