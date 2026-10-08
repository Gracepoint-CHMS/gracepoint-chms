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
  const [activeTab, setActiveTab] = useState('finances'); // Default to Finance Management
  const [activeFinanceView, setActiveFinanceView] = useState('hub'); // 'hub', 'tracker', 'welfare', 'balance-sheet', 'expense', 'budget', 'report'
  
  // Interactive finance states
  const [selectedWelfareMember, setSelectedWelfareMember] = useState(null);
  const [expenseForm, setExpenseForm] = useState({ description: '', quantity: '', rate: '', date: '', approvedBy: '', remarks: '' });
  const [budgetFilter, setBudgetFilter] = useState('All');
  const [pledgeForm, setPledgeForm] = useState({ member: '', purpose: '', amount: '' });

  // Admin Data states
  const [members, setMembers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    async function checkAdmin() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }
      
      // Fetch members for dropdowns & member lists
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
        <p style={{ color: '#1d4ed8', fontWeight: '500' }}>Loading Super Admin Portal...</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: 'sans-serif' }}>
      
      {/* TOP HEADER BAR */}
      <div style={{ backgroundColor: '#2563eb', color: '#fff', padding: '15px 25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0 }}>Gracepoint CHMS (Super Admin)</h2>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => router.push('/portal')} style={{ background: '#1e40af', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: '6px', cursor: 'pointer', fontWeight: '500' }}>My Portal</button>
          <button onClick={handleLogout} style={{ background: '#dc2626', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: '6px', cursor: 'pointer', fontWeight: '500' }}>Logout</button>
        </div>
      </div>

      {/* ADMIN NAVIGATION TABS */}
      <div style={{ backgroundColor: '#fff', padding: '15px 25px', borderBottom: '1px solid #e2e8f0', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <button onClick={() => setActiveTab('members')} style={{ ...tabBtnStyle, backgroundColor: activeTab === 'members' ? '#2563eb' : '#f1f5f9', color: activeTab === 'members' ? '#fff' : '#475569' }}>Members</button>
        <button onClick={() => setActiveTab('contributions')} style={{ ...tabBtnStyle, backgroundColor: activeTab === 'contributions' ? '#2563eb' : '#f1f5f9', color: activeTab === 'contributions' ? '#fff' : '#475569' }}>Contributions</button>
        <button onClick={() => { setActiveTab('finances'); setActiveFinanceView('hub'); }} style={{ ...tabBtnStyle, backgroundColor: activeTab === 'finances' ? '#2563eb' : '#f1f5f9', color: activeTab === 'finances' ? '#fff' : '#475569' }}>Finance Management</button>
      </div>

      {/* MAIN ADMIN CONTENT */}
      <div style={{ padding: '25px', maxWidth: '1000px', margin: '0 auto' }}>
        
        {/* TAB 1: MEMBERS */}
        {activeTab === 'members' && (
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: 'bold', color: '#1e293b', marginBottom: '15px' }}>Manage Members</h1>
            <input 
              type="text" 
              placeholder="Search name or email..." 
              style={inputStyle} 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
            />
            <div style={{ backgroundColor: '#fff', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#1e293b', color: '#fff', textAlign: 'left' }}>
                    <th style={{ padding: '10px' }}>Name</th>
                    <th style={{ padding: '10px' }}>Email</th>
                    <th style={{ padding: '10px' }}>Phone</th>
                  </tr>
                </thead>
                <tbody>
                  {members.filter(m => m.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) || m.email?.toLowerCase().includes(searchTerm.toLowerCase())).map((m, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '10px', fontWeight: '500' }}>{m.first_name} {m.last_name}</td>
                      <td style={{ padding: '10px', color: '#64748b' }}>{m.email}</td>
                      <td style={{ padding: '10px', color: '#64748b' }}>{m.phone || 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: CONTRIBUTIONS */}
        {activeTab === 'contributions' && (
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: 'bold', color: '#1e293b', marginBottom: '15px' }}>Contributions Overview</h1>
            <p style={{ color: '#64748b' }}>Use the Finance Management section for advanced tracking and welfare matrices.</p>
          </div>
        )}

        {/* TAB 3: FINANCE MANAGEMENT SUITE */}
        {activeTab === 'finances' && (
          <div>
            {/* FINANCE HUB */}
            {activeFinanceView === 'hub' && (
              <div>
                <h1 style={{ fontSize: '22px', fontWeight: 'bold', color: '#1e293b', marginBottom: '5px' }}>Finance Management</h1>
                <p style={{ color: '#64748b', marginBottom: '20px' }}>Select an action below to manage church finances.</p>

                {/* Opening Balance Card */}
                <div style={{ backgroundColor: '#fff', padding: '18px 20px', borderRadius: '12px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                  <span style={{ color: '#4b5563', fontWeight: '600' }}>Opening Balance:</span>
                  <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#1e293b' }}>GHS 2,484.32</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '15px' }}>
                  <FinanceCard title="Contribution Tracker" icon="💼" onClick={() => setActiveFinanceView('tracker')} />
                  <FinanceCard title="Welfare Contribution" icon="🤝" onClick={() => setActiveFinanceView('welfare')} />
                  <FinanceCard title="Balance Sheet" icon="⚖️" onClick={() => setActiveFinanceView('balance-sheet')} />
                  <FinanceCard title="Account Report" icon="💳" onClick={() => setActiveFinanceView('report')} />
                  <FinanceCard title="Record Income / Expense" icon="➕" onClick={() => setActiveFinanceView('expense')} />
                  <FinanceCard title="Approve Budgets" icon="✅" onClick={() => setActiveFinanceView('budget')} />
                </div>
              </div>
            )}

            {/* 1. CONTRIBUTION TRACKER */}
            {activeFinanceView === 'tracker' && (
              <FinanceSubView title="Contribution Tracker" onBack={() => setActiveFinanceView('hub')}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
                  <MetricCard label="0 pledges" />
                  <MetricCard label="0% of target" />
                </div>
                <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', marginBottom: '20px' }}>
                  <h3 style={{ fontSize: '15px', marginBottom: '15px', color: '#1d4ed8' }}>➕ New Pledge</h3>
                  <label style={labelStyle}>Member</label>
                  <select style={inputStyle} value={pledgeForm.member} onChange={(e)=>setPledgeForm({...pledgeForm, member: e.target.value})}>
                    <option value="">Select member...</option>
                    {members.map((m, i) => (
                      <option key={i} value={`${m.first_name} ${m.last_name}`}>{m.first_name} {m.last_name}</option>
                    ))}
                  </select>
                  <label style={labelStyle}>Purpose</label>
                  <input type="text" placeholder="e.g. Building fund" style={inputStyle} value={pledgeForm.purpose} onChange={(e)=>setPledgeForm({...pledgeForm, purpose: e.target.value})} />
                  <label style={labelStyle}>Amount</label>
                  <input type="number" placeholder="0.00" style={inputStyle} value={pledgeForm.amount} onChange={(e)=>setPledgeForm({...pledgeForm, amount: e.target.value})} />
                  <button style={primaryBtnStyle}>+ Create</button>
                </div>
              </FinanceSubView>
            )}

            {/* 2. WELFARE CONTRIBUTION MATRIX */}
            {activeFinanceView === 'welfare' && (
              <FinanceSubView title="Welfare Contribution" onBack={() => setActiveFinanceView('hub')}>
                {!selectedWelfareMember ? (
                  <div>
                    <input type="text" placeholder="Search member..." style={{ ...inputStyle, marginBottom: '15px' }} />
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px' }}>
                      {members.map((m, i) => (
                        <div key={i} onClick={() => setSelectedWelfareMember(`${m.first_name} ${m.last_name}`)} style={{ backgroundColor: '#fff', padding: '15px', borderRadius: '10px', textAlign: 'center', cursor: 'pointer', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                          <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#cbd5e1', margin: '0 auto 8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#fff' }}>
                            {m.first_name?.[0]}
                          </div>
                          <p style={{ fontSize: '13px', fontWeight: '500', color: '#1e293b' }}>{m.first_name} {m.last_name}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                      <h3 style={{ fontSize: '16px', color: '#1d4ed8' }}>{selectedWelfareMember}</h3>
                      <button onClick={() => setSelectedWelfareMember(null)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontWeight: 'bold' }}>✕ Close</button>
                    </div>
                    <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '10px' }}>Click any box to enter amount</p>
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'center' }}>
                        <thead>
                          <tr style={{ backgroundColor: '#3b82f6', color: '#fff' }}>
                            <th style={{ padding: '8px' }}>Months</th>
                            <th style={{ padding: '8px' }}>1st Week</th>
                            <th style={{ padding: '8px' }}>2nd Week</th>
                            <th style={{ padding: '8px' }}>3rd Week</th>
                            <th style={{ padding: '8px' }}>4th Week</th>
                            <th style={{ padding: '8px' }}>Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((m, idx) => (
                            <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                              <td style={{ padding: '8px', fontWeight: 'bold' }}>{m}</td>
                              {[1, 2, 3, 4, 'Total'].map((w, wIdx) => (
                                <td key={wIdx} style={{ padding: '8px', border: '1px solid #e2e8f0' }}>0</td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <button style={{ ...primaryBtnStyle, marginTop: '15px' }}>Save</button>
                  </div>
                )}
              </FinanceSubView>
            )}

            {/* 3. BALANCE SHEET */}
            {activeFinanceView === 'balance-sheet' && (
              <FinanceSubView title="Balance Sheet" onBack={() => setActiveFinanceView('hub')}>
                <div style={{ backgroundColor: '#fff', padding: '15px', borderRadius: '12px', marginBottom: '15px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                  <input type="date" style={{ ...inputStyle, marginBottom: '10px' }} />
                  <input type="date" style={{ ...inputStyle, marginBottom: '10px' }} />
                  <button style={primaryBtnStyle}>Filter</button>
                </div>
                <div style={{ backgroundColor: '#fff', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#2563eb', color: '#fff', textAlign: 'left' }}>
                        <th style={{ padding: '10px' }}>Total Expenses</th>
                        <th style={{ padding: '10px' }}>Balance</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '10px', color: '#dc2626' }}>GHS 0</td>
                        <td style={{ padding: '10px', fontWeight: 'bold' }}>GHS 2,672.32</td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '10px', color: '#dc2626' }}>GHS 200</td>
                        <td style={{ padding: '10px', fontWeight: 'bold' }}>GHS 2,673.32</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </FinanceSubView>
            )}

            {/* 4. EXPENSE LOGGING */}
            {activeFinanceView === 'expense' && (
              <FinanceSubView title="Record Expenses" onBack={() => setActiveFinanceView('hub')}>
                <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                  <label style={labelStyle}>Description</label>
                  <textarea placeholder="Enter expense description" style={{ ...inputStyle, height: '70px' }} value={expenseForm.description} onChange={(e)=>setExpenseForm({...expenseForm, description: e.target.value})} />
                  
                  <label style={labelStyle}>Quantity</label>
                  <input type="number" placeholder="Enter quantity" style={inputStyle} value={expenseForm.quantity} onChange={(e)=>setExpenseForm({...expenseForm, quantity: e.target.value})} />
                  
                  <label style={labelStyle}>Rate</label>
                  <input type="number" placeholder="Enter rate per item" style={inputStyle} value={expenseForm.rate} onChange={(e)=>setExpenseForm({...expenseForm, rate: e.target.value})} />
                  
                  <label style={labelStyle}>Total Cost</label>
                  <input type="text" disabled placeholder="Auto-calculated total" style={{ ...inputStyle, backgroundColor: '#f8fafc' }} value={expenseForm.quantity && expenseForm.rate ? `GHS ${expenseForm.quantity * expenseForm.rate}` : ''} />
                  
                  <label style={labelStyle}>Date</label>
                  <input type="date" style={inputStyle} value={expenseForm.date} onChange={(e)=>setExpenseForm({...expenseForm, date: e.target.value})} />
                  
                  <label style={labelStyle}>Approved By</label>
                  <input type="text" placeholder="Name of approver" style={inputStyle} value={expenseForm.approvedBy} onChange={(e)=>setExpenseForm({...expenseForm, approvedBy: e.target.value})} />
                  
                  <label style={labelStyle}>Remarks</label>
                  <textarea placeholder="Additional notes or remarks" style={{ ...inputStyle, height: '60px' }} value={expenseForm.remarks} onChange={(e)=>setExpenseForm({...expenseForm, remarks: e.target.value})} />
                  
                  <button style={primaryBtnStyle}>Save Expense</button>
                </div>
              </FinanceSubView>
            )}

            {/* 5. BUDGET APPROVAL */}
            {activeFinanceView === 'budget' && (
              <FinanceSubView title="Admin Budget Approval" onBack={() => setActiveFinanceView('hub')}>
                <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '15px' }}>Review, approve, or adjust budget requests submitted by branches.</p>
                <div style={{ backgroundColor: '#fff', padding: '15px', borderRadius: '12px', marginBottom: '15px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                  <label style={labelStyle}>Filter by Status</label>
                  <select style={inputStyle} value={budgetFilter} onChange={(e)=>setBudgetFilter(e.target.value)}>
                    <option value="All">All</option>
                    <option value="Pending">Pending</option>
                    <option value="Approved">Approved</option>
                  </select>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                    <span style={badgeStyle}>0 Total</span>
                    <span style={{ ...badgeStyle, backgroundColor: '#fef3c7', color: '#d97706' }}>0 Pending</span>
                    <span style={{ ...badgeStyle, backgroundColor: '#dcfce7', color: '#16a34a' }}>0 Approved</span>
                  </div>
                </div>
                <div style={{ backgroundColor: '#fff', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#2563eb', color: '#fff', textAlign: 'left' }}>
                        <th style={{ padding: '10px' }}>BRANCH</th>
                        <th style={{ padding: '10px' }}>DESCRIPTION</th>
                        <th style={{ padding: '10px' }}>AMOUNT REQUESTED</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td colSpan="3" style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>No budget requests found.</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </FinanceSubView>
            )}

            {/* 6. ACCOUNT REPORT */}
            {activeFinanceView === 'report' && (
              <FinanceSubView title="Account Statement" onBack={() => setActiveFinanceView('hub')}>
                <div style={{ backgroundColor: '#fff', padding: '15px', borderRadius: '12px', marginBottom: '15px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', display: 'flex', gap: '10px' }}>
                  <button style={{ ...primaryBtnStyle, flex: 1, backgroundColor: '#1e293b' }}>Print</button>
                  <button style={{ ...primaryBtnStyle, flex: 1, backgroundColor: '#16a34a' }}>Download PDF</button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '10px', marginBottom: '15px' }}>
                  <MetricCard label="Opening Balance: GHS 2,484.32" />
                  <MetricCard label="Closing Balance: GHS 11,010.32" />
                  <MetricCard label="Net Movement: GHS 8,526" />
                </div>
                <div style={{ backgroundColor: '#fff', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#1e293b', color: '#fff', textAlign: 'left' }}>
                        <th style={{ padding: '8px' }}>DATE</th>
                        <th style={{ padding: '8px' }}>DESCRIPTION</th>
                        <th style={{ padding: '8px' }}>INCOME</th>
                        <th style={{ padding: '8px' }}>EXPENSES</th>
                        <th style={{ padding: '8px' }}>BALANCE</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '8px' }}>18 Dec 2025</td>
                        <td style={{ padding: '8px' }}>Opening Balance</td>
                        <td style={{ padding: '8px' }}>-</td>
                        <td style={{ padding: '8px' }}>-</td>
                        <td style={{ padding: '8px', fontWeight: 'bold' }}>GHS 2,484.32</td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '8px' }}>18 Dec 2025</td>
                        <td style={{ padding: '8px' }}>Income (Special Event)</td>
                        <td style={{ padding: '8px', color: '#16a34a' }}>GHS 188</td>
                        <td style={{ padding: '8px' }}>-</td>
                        <td style={{ padding: '8px', fontWeight: 'bold' }}>GHS 2,672.32</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </FinanceSubView>
            )}
          </div>
        )}

      </div>
    </div>
  );
}

// Reusable Components & Styles
function FinanceCard({ title, icon, onClick }) {
  return (
    <div onClick={onClick} style={{ backgroundColor: '#fff', padding: '22px', borderRadius: '12px', textAlign: 'center', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', transition: 'transform 0.1s' }}>
      <div style={{ fontSize: '30px', marginBottom: '8px' }}>{icon}</div>
      <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#1e293b' }}>{title}</h3>
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

function MetricCard({ label }) {
  return (
    <div style={{ backgroundColor: '#fff', padding: '15px', borderRadius: '10px', textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', fontWeight: 'bold', color: '#1e293b', fontSize: '14px' }}>
      {label}
    </div>
  );
}

const tabBtnStyle = {
  padding: '10px 16px',
  border: 'none',
  borderRadius: '8px',
  cursor: 'pointer',
  fontWeight: '600',
  fontSize: '13px'
};

const inputStyle = {
  width: '100%',
  padding: '10px',
  borderRadius: '8px',
  border: '1px solid #cbd5e1',
  marginBottom: '15px',
  fontSize: '14px',
  boxSizing: 'border-box'
};

const labelStyle = {
  display: 'block',
  fontSize: '13px',
  fontWeight: '600',
  color: '#475569',
  marginBottom: '5px'
};

const primaryBtnStyle = {
  width: '100%',
  padding: '12px',
  backgroundColor: '#2563eb',
  color: '#fff',
  border: 'none',
  borderRadius: '8px',
  fontWeight: 'bold',
  cursor: 'pointer'
};

const badgeStyle = {
  padding: '6px 12px',
  borderRadius: '6px',
  backgroundColor: '#e0f2fe',
  color: '#0369a1',
  fontSize: '12px',
  fontWeight: 'bold'
};
