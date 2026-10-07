'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';

export default function AdminDashboard() {
  const router = useRouter();
  const [members, setMembers] = useState([]);
  const [contributions, setContributions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Navigation tabs: 'members' or 'contributions'
  const [activeTab, setActiveTab] = useState('members');
  
  // Search & Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  // Editing & Upload state
  const [editingMember, setEditingMember] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Add Member Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newMember, setNewMember] = useState({
    prefix: '',
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    home_address: '',
    hometown: '',
    emergency_contact_person: '',
    emergency_contact_phone: '',
    date_of_birth: '',
    date_joined: '',
    date_of_baptism: '',
    gender: '',
    marital_status: '',
    core_department: '',
    sub_department: '',
    role: 'member'
  });

  // Add Contribution Modal state
  const [showContribModal, setShowContribModal] = useState(false);
  const [newContribution, setNewContribution] = useState({
    member_email: '',
    amount: '',
    contribution_type: 'Welfare',
    week_ending: '',
    payment_method: 'Cash',
    notes: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    await Promise.all([fetchMembers(), fetchContributions()]);
    setLoading(false);
  }

  async function fetchMembers() {
    const { data, error } = await supabase
      .from('members')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setMembers(data);
  }

  async function fetchContributions() {
    const { data, error } = await supabase
      .from('contributions')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setContributions(data);
  }

  async function handleDeleteMember(id, email) {
    if (!confirm(`Are you sure you want to delete ${email}?`)) return;
    let query = supabase.from('members').delete();
    if (id) query = query.eq('id', id);
    else query = query.eq('email', email);

    const { error } = await query;
    if (error) alert('Error deleting member: ' + error.message);
    else setMembers(members.filter(m => (id ? m.id !== id : m.email !== email)));
  }

  async function handleDeleteContribution(id) {
    if (!confirm('Are you sure you want to delete this contribution record?')) return;
    const { error } = await supabase.from('contributions').delete().eq('id', id);
    if (error) alert('Error deleting contribution: ' + error.message);
    else setContributions(contributions.filter(c => c.id !== id));
  }

  async function handleAddMember(e) {
    e.preventDefault();
    const { error } = await supabase.from('members').insert([newMember]);
    if (error) {
      alert('Error adding member: ' + error.message);
    } else {
      alert('Member added successfully!');
      setShowAddModal(false);
      setNewMember({
        prefix: '', first_name: '', last_name: '', email: '', phone: '',
        home_address: '', hometown: '', emergency_contact_person: '', emergency_contact_phone: '',
        date_of_birth: '', date_joined: '', date_of_baptism: '', gender: '',
        marital_status: '', core_department: '', sub_department: '', role: 'member'
      });
      fetchMembers();
    }
  }

  async function handleAddContribution(e) {
    e.preventDefault();
    const targetMember = members.find(m => m.email === newContribution.member_email);
    
    const payload = {
      ...newContribution,
      member_id: targetMember ? targetMember.id : null,
      amount: parseFloat(newContribution.amount),
      week_ending: newContribution.week_ending ? newContribution.week_ending : null
    };

    const { error } = await supabase.from('contributions').insert([payload]);
    if (error) {
      alert('Error recording contribution: ' + error.message);
    } else {
      alert('Contribution recorded successfully!');
      setShowContribModal(false);
      setNewContribution({
        member_email: '',
        amount: '',
        contribution_type: 'Welfare',
        week_ending: '',
        payment_method: 'Cash',
        notes: ''
      });
      fetchContributions();
    }
  }

  async function handleFileUpload(e) {
    try {
      setUploading(true);
      const file = e.target.files[0];
      if (!file) return;

      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('member-photos').upload(fileName, file);
      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('member-photos').getPublicUrl(fileName);
      if (editingMember) {
        setEditingMember({ ...editingMember, photo_url: data.publicUrl });
      }
      alert('Image uploaded successfully!');
    } catch (error) {
      alert('Error uploading image: ' + error.message);
    } finally {
      setUploading(false);
    }
  }

  async function handleUpdateMember(e) {
    e.preventDefault();
    if (!editingMember) return;
    let query = supabase.from('members').update(editingMember);
    if (editingMember.id) query = query.eq('id', editingMember.id);
    else query = query.eq('email', editingMember.email);

    const { error } = await query;
    if (error) {
      alert('Error updating member: ' + error.message);
    } else {
      alert('Member updated successfully!');
      setEditingMember(null);
      fetchMembers();
    }
  }

  // Filter Members
  const filteredMembers = members.filter((m) => {
    const fullName = `${m.first_name || ''} ${m.last_name || ''}`.toLowerCase();
    const email = (m.email || '').toLowerCase();
    const matchesSearch = fullName.includes(searchQuery.toLowerCase()) || email.includes(searchQuery.toLowerCase());
    const matchesDept = departmentFilter ? m.core_department === departmentFilter : true;
    const matchesRole = roleFilter ? m.role === roleFilter : true;
    return matchesSearch && matchesDept && matchesRole;
  });

  // Filter Contributions
  const filteredContributions = contributions.filter((c) => {
    const email = (c.member_email || '').toLowerCase();
    const matchesSearch = email.includes(searchQuery.toLowerCase()) || (c.notes || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter ? c.contribution_type === typeFilter : true;
    return matchesSearch && matchesType;
  });

  // Summary Metrics for Contributions
  const totalWelfareCollected = contributions
    .filter(c => c.contribution_type === 'Welfare')
    .reduce((sum, c) => sum + Number(c.amount), 0);

  const totalTithesCollected = contributions
    .filter(c => c.contribution_type === 'Tithe')
    .reduce((sum, c) => sum + Number(c.amount), 0);

  const totalOtherGiving = contributions
    .filter(c => c.contribution_type !== 'Welfare' && c.contribution_type !== 'Tithe')
    .reduce((sum, c) => sum + Number(c.amount), 0);

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <p>Loading Admin Dashboard...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #e5e7eb', paddingBottom: '15px', flexWrap: 'wrap', gap: '10px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>Admin Dashboard</h1>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            onClick={() => router.push('/portal')}
            style={{ backgroundColor: '#4f46e5', color: '#fff', padding: '10px 15px', borderRadius: '6px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}
          >
            My Portal
          </button>
          <button
            onClick={async () => {
              await supabase.auth.signOut();
              router.push('/login');
            }}
            style={{ backgroundColor: '#ef4444', color: '#fff', padding: '10px 15px', borderRadius: '6px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}
          >
            Logout
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button
          onClick={() => setActiveTab('members')}
          style={{ padding: '10px 20px', backgroundColor: activeTab === 'members' ? '#2563eb' : '#e5e7eb', color: activeTab === 'members' ? '#fff' : '#374151', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}
        >
          Members Management ({members.length})
        </button>
        <button
          onClick={() => setActiveTab('contributions')}
          style={{ padding: '10px 20px', backgroundColor: activeTab === 'contributions' ? '#2563eb' : '#e5e7eb', color: activeTab === 'contributions' ? '#fff' : '#374151', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}
        >
          Tithes & Welfare Records ({contributions.length})
        </button>
      </div>

      {/* TAB 1: MEMBERS MANAGEMENT */}
      {activeTab === 'members' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ display: 'flex', gap: '10px', flex: '1', flexWrap: 'wrap', minWidth: '280px' }}>
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ccc', flex: '1', minWidth: '200px' }}
              />
              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}
              >
                <option value="">All Departments</option>
                <option value="LOVE">LOVE</option>
                <option value="UNITY">UNITY</option>
                <option value="CARE">CARE</option>
                <option value="RESPECT">RESPECT</option>
              </select>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}
              >
                <option value="">All Roles</option>
                <option value="super_admin">Super Admin</option>
                <option value="admin">Admin</option>
                <option value="member">Member</option>
              </select>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              style={{ backgroundColor: '#10b981', color: '#fff', padding: '10px 15px', borderRadius: '6px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}
            >
              + Add New Member
            </button>
          </div>

          {/* Members Table */}
          <div style={{ overflowX: 'auto', backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ backgroundColor: '#f3f4f6', borderBottom: '1px solid #e5e7eb' }}>
                  <th style={{ padding: '12px' }}>Avatar</th>
                  <th style={{ padding: '12px' }}>Name</th>
                  <th style={{ padding: '12px' }}>Email & Phone</th>
                  <th style={{ padding: '12px' }}>Department</th>
                  <th style={{ padding: '12px' }}>Role</th>
                  <th style={{ padding: '12px', textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredMembers.length === 0 ? (
                  <tr><td colSpan="6" style={{ padding: '20px', textAlign: 'center', color: '#6b7280' }}>No members found.</td></tr>
                ) : (
                  filteredMembers.map((m) => (
                    <tr key={m.id || m.email} style={{ borderBottom: '1px solid #e5e7eb' }}>
                      <td style={{ padding: '12px' }}>
                        {m.photo_url ? (
                          <img src={m.photo_url} alt="Profile" style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }} />
                        ) : (
                          <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#e0e7ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 'bold', color: '#3730a3' }}>
                            {m.first_name?.[0] || 'M'}
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '12px', fontWeight: '500' }}>{m.prefix} {m.first_name} {m.last_name}</td>
                      <td style={{ padding: '12px' }}>
                        <div style={{ fontSize: '13px' }}>{m.email}</div>
                        <div style={{ fontSize: '12px', color: '#6b7280' }}>{m.phone}</div>
                      </td>
                      <td style={{ padding: '12px' }}>{m.core_department} / {m.sub_department}</td>
                      <td style={{ padding: '12px' }}>
                        <span style={{ padding: '4px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold', backgroundColor: m.role === 'super_admin' ? '#fee2e2' : m.role === 'admin' ? '#e0e7ff' : '#f3f4f6', color: m.role === 'super_admin' ? '#dc2626' : m.role === 'admin' ? '#4f46e5' : '#374151' }}>
                          {m.role}
                        </span>
                      </td>
                      <td style={{ padding: '12px', textAlign: 'center' }}>
                        <button onClick={() => setEditingMember({ ...m })} style={{ marginRight: '8px', padding: '6px 10px', backgroundColor: '#f59e0b', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>Edit</button>
                        <button onClick={() => handleDeleteMember(m.id, m.email)} style={{ padding: '6px 10px', backgroundColor: '#ef4444', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>Delete</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: CONTRIBUTIONS & WELFARE MANAGEMENT */}
      {activeTab === 'contributions' && (
        <div>
          {/* Summary Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '15px', marginBottom: '20px' }}>
            <div style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', padding: '15px', borderRadius: '8px' }}>
              <h4 style={{ fontSize: '14px', color: '#1e40af', marginBottom: '5px' }}>Total Weekly Welfare</h4>
              <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#1e3a8a' }}>GHS {totalWelfareCollected.toFixed(2)}</p>
              <span style={{ fontSize: '11px', color: '#3b82f6' }}>Compulsory Weekly Contributions</span>
            </div>
            <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', padding: '15px', borderRadius: '8px' }}>
              <h4 style={{ fontSize: '14px', color: '#166534', marginBottom: '5px' }}>Total Tithes</h4>
              <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#14532d' }}>GHS {totalTithesCollected.toFixed(2)}</p>
              <span style={{ fontSize: '11px', color: '#22c55e' }}>Direct Tithe Payments</span>
            </div>
            <div style={{ backgroundColor: '#fdf4ff', border: '1px solid #f5d0fe', padding: '15px', borderRadius: '8px' }}>
              <h4 style={{ fontSize: '14px', color: '#86198f', marginBottom: '5px' }}>Other Giving & Dues</h4>
              <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#701a75' }}>GHS {totalOtherGiving.toFixed(2)}</p>
              <span style={{ fontSize: '11px', color: '#d946ef' }}>Offerings, Dues & Donations</span>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ display: 'flex', gap: '10px', flex: '1', flexWrap: 'wrap', minWidth: '280px' }}>
              <input
                type="text"
                placeholder="Search by member email or notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ccc', flex: '1', minWidth: '200px' }}
              />
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}
              >
                <option value="">All Types</option>
                <option value="Welfare">Welfare (Compulsory Weekly)</option>
                <option value="Tithe">Tithe</option>
                <option value="Offering">Offering</option>
                <option value="Donation">Donation</option>
                <option value="Departmental Dues">Departmental Dues</option>
              </select>
            </div>
            <button
              onClick={() => setShowContribModal(true)}
              style={{ backgroundColor: '#10b981', color: '#fff', padding: '10px 15px', borderRadius: '6px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}
            >
              + Record Contribution
            </button>
          </div>

          {/* Contributions Table */}
          <div style={{ overflowX: 'auto', backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ backgroundColor: '#f3f4f6', borderBottom: '1px solid #e5e7eb' }}>
                  <th style={{ padding: '12px' }}>Member Email</th>
                  <th style={{ padding: '12px' }}>Type</th>
                  <th style={{ padding: '12px' }}>Amount (GHS)</th>
                  <th style={{ padding: '12px' }}>Date / Week Ending</th>
                  <th style={{ padding: '12px' }}>Method</th>
                  <th style={{ padding: '12px' }}>Notes</th>
                  <th style={{ padding: '12px', textAlign: 'center' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredContributions.length === 0 ? (
                  <tr><td colSpan="7" style={{ padding: '20px', textAlign: 'center', color: '#6b7280' }}>No contribution records found.</td></tr>
                ) : (
                  filteredContributions.map((c) => (
                    <tr key={c.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                      <td style={{ padding: '12px', fontWeight: '500' }}>{c.member_email}</td>
                      <td style={{ padding: '12px' }}>
                        <span style={{ padding: '4px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold', backgroundColor: c.contribution_type === 'Welfare' ? '#dbeafe' : '#f0fdf4', color: c.contribution_type === 'Welfare' ? '#1e40af' : '#166534' }}>
                          {c.contribution_type}
                        </span>
                      </td>
                      <td style={{ padding: '12px', fontWeight: 'bold' }}>GHS {Number(c.amount).toFixed(2)}</td>
                      <td style={{ padding: '12px', fontSize: '13px' }}>{c.week_ending || 'N/A'}</td>
                      <td style={{ padding: '12px', fontSize: '13px' }}>{c.payment_method || 'Cash'}</td>
                      <td style={{ padding: '12px', fontSize: '13px', color: '#6b7280' }}>{c.notes || '-'}</td>
                      <td style={{ padding: '12px', textAlign: 'center' }}>
                        <button onClick={() => handleDeleteContribution(c.id)} style={{ padding: '6px 10px', backgroundColor: '#ef4444', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>Delete</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: ADD CONTRIBUTION */}
      {showContribModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: '#fff', padding: '25px', borderRadius: '8px', width: '500px', maxWidth: '90%' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '15px' }}>Record Financial Contribution</h2>
            <form onSubmit={handleAddContribution} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>Member Email *</label>
                <select required value={newContribution.member_email} onChange={(e) => setNewContribution({ ...newContribution, member_email: e.target.value })} style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}>
                  <option value="">Select Member Email</option>
                  {members.map(m => (
                    <option key={m.id || m.email} value={m.email}>{m.first_name} {m.last_name} ({m.email})</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>Contribution Type *</label>
                <select value={newContribution.contribution_type} onChange={(e) => setNewContribution({ ...newContribution, contribution_type: e.target.value })} style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}>
                  <option value="Welfare">Welfare (Compulsory Weekly)</option>
                  <option value="Tithe">Tithe</option>
                  <option value="Offering">Offering</option>
                  <option value="Donation">Donation</option>
                  <option value="Departmental Dues">Departmental Dues</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>Amount (GHS) *</label>
                <input type="number" step="0.01" required placeholder="e.g. 50.00" value={newContribution.amount} onChange={(e) => setNewContribution({ ...newContribution, amount: e.target.value })} style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>
                  {newContribution.contribution_type === 'Welfare' ? 'Week Ending Date *' : 'Transaction Date (Optional)'}
                </label>
                <input 
                  type="date" 
                  required={newContribution.contribution_type === 'Welfare'} 
                  value={newContribution.week_ending} 
                  onChange={(e) => setNewContribution({ ...newContribution, week_ending: e.target.value })} 
                  style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} 
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>Payment Method</label>
                <select value={newContribution.payment_method} onChange={(e) => setNewContribution({ ...newContribution, payment_method: e.target.value })} style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}>
                  <option value="Cash">Cash</option>
                  <option value="Mobile Money">Mobile Money</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>Notes (Optional)</label>
                <input type="text" placeholder="e.g. Special seed offering" value={newContribution.notes} onChange={(e) => setNewContribution({ ...newContribution, notes: e.target.value })} style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} />
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                <button type="submit" style={{ flex: 1, backgroundColor: '#2563eb', color: '#fff', padding: '10px', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>Save Record</button>
                <button type="button" onClick={() => setShowContribModal(false)} style={{ flex: 1, backgroundColor: '#6b7280', color: '#fff', padding: '10px', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD MEMBER */}
      {showAddModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: '#fff', padding: '25px', borderRadius: '8px', width: '600px', maxWidth: '90%', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '15px' }}>Register New Member</h2>
            <form onSubmit={handleAddMember} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>First Name *</label>
                <input type="text" required value={newMember.first_name} onChange={(e) => setNewMember({ ...newMember, first_name: e.target.value })} style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>Last Name *</label>
                <input type="text" required value={newMember.last_name} onChange={(e) => setNewMember({ ...newMember, last_name: e.target.value })} style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>Email Address *</label>
                <input type="email" required value={newMember.email} onChange={(e) => setNewMember({ ...newMember, email: e.target.value })} style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>Phone Number</label>
                <input type="text" value={newMember.phone} onChange={(e) => setNewMember({ ...newMember, phone: e.target.value })} style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>Core Department</label>
                <select value={newMember.core_department} onChange={(e) => setNewMember({ ...newMember, core_department: e.target.value })} style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}>
                  <option value="">Select Department</option>
                  <option value="LOVE">LOVE</option>
                  <option value="UNITY">UNITY</option>
                  <option value="CARE">CARE</option>
                  <option value="RESPECT">RESPECT</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>Role</label>
                <select value={newMember.role} onChange={(e) => setNewMember({ ...newMember, role: e.target.value })} style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}>
                  <option value="member">Member</option>
                  <option value="admin">Admin</option>
                  <option value="super_admin">Super Admin</option>
                </select>
              </div>
              <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '10px', marginTop: '15px' }}>
                <button type="submit" style={{ flex: 1, backgroundColor: '#2563eb', color: '#fff', padding: '10px', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>Save Member</button>
                <button type="button" onClick={() => setShowAddModal(false)} style={{ flex: 1, backgroundColor: '#6b7280', color: '#fff', padding: '10px', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT MEMBER PANEL */}
      {editingMember && (
        <div style={{ backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', padding: '20px', borderRadius: '8px', marginTop: '20px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '15px' }}>Edit Member: {editingMember.first_name} {editingMember.last_name}</h3>
          <form onSubmit={handleUpdateMember} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>First Name</label>
              <input type="text" value={editingMember.first_name || ''} onChange={(e) => setEditingMember({ ...editingMember, first_name: e.target.value })} style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>Last Name</label>
              <input type="text" value={editingMember.last_name || ''} onChange={(e) => setEditingMember({ ...editingMember, last_name: e.target.value })} style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>Email</label>
              <input type="email" value={editingMember.email || ''} onChange={(e) => setEditingMember({ ...editingMember, email: e.target.value })} style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>Phone</label>
              <input type="text" value={editingMember.phone || ''} onChange={(e) => setEditingMember({ ...editingMember, phone: e.target.value })} style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>Core Department</label>
              <select value={editingMember.core_department || ''} onChange={(e) => setEditingMember({ ...editingMember, core_department: e.target.value })} style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}>
                <option value="">Select Department</option>
                <option value="LOVE">LOVE</option>
                <option value="UNITY">UNITY</option>
                <option value="CARE">CARE</option>
                <option value="RESPECT">RESPECT</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>Role</label>
              <select value={editingMember.role || 'member'} onChange={(e) => setEditingMember({ ...editingMember, role: e.target.value })} style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}>
                <option value="member">Member</option>
                <option value="admin">Admin</option>
                <option value="super_admin">Super Admin</option>
              </select>
            </div>
            <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '10px', marginTop: '10px' }}>
              <button type="submit" style={{ backgroundColor: '#2563eb', color: '#fff', padding: '8px 16px', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>Save Changes</button>
              <button type="button" onClick={() => setEditingMember(null)} style={{ backgroundColor: '#6b7280', color: '#fff', padding: '8px 16px', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>Cancel</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
