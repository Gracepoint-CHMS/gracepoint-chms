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
  const [activeTab, setActiveTab] = useState('members'); // 'members', 'contributions', 'attendance', 'events', 'announcements'
  const [activeFinanceView, setActiveFinanceView] = useState('hub'); // 'hub', 'income', 'expense', 'budget', 'tracker', 'welfare', 'balance-sheet', 'report'

  // Finance states
  const [openingBalance, setOpeningBalance] = useState('2,484.32');
  const [isEditingBalance, setIsEditingBalance] = useState(false);
  const [newBalanceInput, setNewBalanceInput] = useState('2,484.32');

  // Admin Data states
  const [members, setMembers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('All Departments');

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

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'sans-serif' }}>
        <p style={{ color: '#1d4ed8', fontWeight: '500' }}>Loading Admin Dashboard...</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: 'sans-serif' }}>
      
      {/* TOP HEADER BAR matching your layout */}
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

        {/* Action buttons row matching your screenshot */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <button onClick={() => router.push('/portal')} style={{ backgroundColor: '#4f46e5', color: '#fff', border: 'none', padding: '10px 16px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>My Portal</button>
          <button onClick={handleLogout} style={{ backgroundColor: '#ef4444', color: '#fff', border: 'none', padding: '10px 16px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Logout</button>
        </div>

        {/* NAVIGATION TABS matching your screenshot */}
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
              media value="Media">Media</option>
              <option value="Ushers">Ushers</option>
            </select>

            <button style={{ width: '100%', backgroundColor: '#10b981', color: '#fff', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: 'bold', marginBottom: '20px', cursor: 'pointer' }}>
              + Add New Member
            </button>

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

        {/* TAB 2: CONTRIBUTIONS & FINANCE MANAGEMENT INTEGRATION */}
        {activeTab === 'contributions' && (
          <div>
            {activeFinanceView === 'hub' && (
              <div>
                {/* Edit Opening Balance Bar */}
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

                {/* Opening Balance Card matching reference */}
                <div style={{ backgroundColor: '#fff', padding: '18px 20px', borderRadius: '12px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                  <span style={{ color: '#4b5563', fontWeight: '600' }}>Opening balance:</span>
                  <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#1e293b' }}>GHS {openingBalance}</span>
                </div>

                {/* Grid Cards matching your exact reference design */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '15px' }}>
                  <FinanceCard title="Record Income" icon="➕" onClick={() => setActiveFinanceView('income')} />
                  <FinanceCard title="Record Expenses" icon="➖" onClick={() => setActiveFinanceView('expense')} />
                  <FinanceCard title="Approve Budgets" icon="✅" onClick={() => setActiveFinanceView('budget')} />
                  <FinanceCard title="Contribution Tracker" icon="💼" onClick={() => setActiveFinanceView('tracker')} />
                  <FinanceCard title="Welfare Contribution" icon="🤝" onClick={() => setActiveFinanceView('welfare')} />
                  <FinanceCard title="Balance Sheet" icon="⚖️" onClick={() => setActiveFinanceView('balance-sheet')} />
                  <FinanceCard title="Account Report" icon="💳" onClick={() => setActiveFinanceView('report')} />
                </div>
              </div>
            )}

            {/* Sub-views inside Contributions */}
            {activeFinanceView === 'income' && <FinanceSubView title="Record Income" onBack={() => setActiveFinanceView('hub')}><IncomeForm /></FinanceSubView>}
            {activeFinanceView === 'expense' && <FinanceSubView title="Record Expenses" onBack={() => setActiveFinanceView('hub')}><ExpenseForm /></FinanceSubView>}
            {activeFinanceView === 'budget' && <FinanceSubView title="Approve Budgets" onBack={() => setActiveFinanceView('hub')}><BudgetApproval /></FinanceSubView>}
            {activeFinanceView === 'tracker' && <FinanceSubView title="Contribution Tracker" onBack={() => setActiveFinanceView('hub')}><ContributionTracker members={members} /></FinanceSubView>}
            {activeFinanceView === 'welfare' && <FinanceSubView title="Welfare Contribution" onBack={() => setActiveFinanceView('hub')}><WelfareMatrix members={members} /></FinanceSubView>}
            {activeFinanceView === 'balance-sheet' && <FinanceSubView title="Balance Sheet" onBack={() => setActiveFinanceView('hub')}><BalanceSheet /></FinanceSubView>}
            {activeFinanceView === 'report' && <FinanceSubView title="Account Report" onBack={() => setActiveFinanceView('hub')}><AccountReport /></FinanceSubView>}
          </div>
        )}

        {/* OTHER TABS */}
        {activeTab === 'attendance' && <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '10px' }}>Attendance module view.</div>}
        {activeTab === 'events' && <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '10px' }}>Events module view.</div>}
        {activeTab === 'announcements' && <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '10px' }}>Announcements module view.</div>}

      </div>
    </div>
  );
}

// UI Components
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

function IncomeForm() {
  return (
    <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
      <label style={labelStyle}>Source / Description</label>
      <input type="text" placeholder="e.g. Sunday Offering" style={inputStyle} />
      <label style={labelStyle}>Amount (GHS)</label>
      <input type="number" placeholder="0.00" style={inputStyle} />
      <label style={labelStyle}>Date</label>
      <input type="date" style={inputStyle} />
      <button style={primaryBtnStyle}>Save Income</button>
    </div>
  );
}

function ExpenseForm() {
  return (
    <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
      <label style={labelStyle}>Description</label>
      <textarea placeholder="Expense details" style={{ ...inputStyle, height: '70px' }} />
      <label style={labelStyle}>Quantity & Rate</label>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        <input type="number" placeholder="Qty" style={inputStyle} />
        <input type="number" placeholder="Rate" style={inputStyle} />
      </div>
      <label style={labelStyle}>Date & Approved By</label>
      <input type="date" style={inputStyle} />
      <input type="text" placeholder="Approver Name" style={inputStyle} />
      <button style={primaryBtnStyle}>Save Expense</button>
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

function ContributionTracker({ members }) {
  return (
    <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
      <h3 style={{ fontSize: '15px', color: '#2563eb', marginBottom: '15px' }}>New Pledge</h3>
      <label style={labelStyle}>Member</label>
      <select style={inputStyle}>
        <option value="">Select member...</option>
        {members.map((m, i) => <option key={i}>{m.first_name} {m.last_name}</option>)}
      </select>
      <label style={labelStyle}>Amount</label>
      <input type="number" placeholder="0.00" style={inputStyle} />
      <button style={primaryBtnStyle}>Create Pledge</button>
    </div>
  );
}

function WelfareMatrix({ members }) {
  const [selected, setSelected] = useState(null);
  return !selected ? (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px' }}>
      {members.map((m, i) => (
        <div key={i} onClick={() => setSelected(m)} style={{ backgroundColor: '#fff', padding: '15px', borderRadius: '10px', textAlign: 'center', cursor: 'pointer', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <p style={{ fontWeight: '500', fontSize: '13px' }}>{m.first_name} {m.last_name}</p>
        </div>
      ))}
    </div>
  ) : (
    <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px' }}>
      <button onClick={() => setSelected(null)} style={{ marginBottom: '10px', border: 'none', background: '#ef4444', color: '#fff', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}>Close Matrix</button>
      <h3 style={{ marginBottom: '10px' }}>Welfare for {selected.first_name}</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'center' }}>
        <thead>
          <tr style={{ backgroundColor: '#2563eb', color: '#fff' }}>
            <th style={{ padding: '6px' }}>Month</th>
            <th style={{ padding: '6px' }}>W1</th><th style={{ padding: '6px' }}>W2</th><th style={{ padding: '6px' }}>W3</th><th style={{ padding: '6px' }}>W4</th>
          </tr>
        </thead>
        <tbody>
          {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map((m, idx) => (
            <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0' }}>
              <td style={{ padding: '6px', fontWeight: 'bold' }}>{m}</td>
              {[1, 2, 3, 4].map((w, wIdx) => <td key={wIdx} style={{ border: '1px solid #cbd5e1', padding: '6px' }}>0</td>)}
            </tr>
          ))}
        </tbody>
      </table>
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
