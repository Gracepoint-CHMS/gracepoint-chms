'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';

export default function AdminDashboard() {
  const router = useRouter();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Search & Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

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

  useEffect(() => {
    fetchMembers();
  }, []);

  async function fetchMembers() {
    setLoading(true);
    const { data, error } = await supabase
      .from('members')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching members:', error.message);
    } else if (data) {
      setMembers(data);
    }
    setLoading(false);
  }

  async function handleDelete(id, email) {
    if (!confirm(`Are you sure you want to delete ${email}?`)) return;

    let query = supabase.from('members').delete();
    if (id) {
      query = query.eq('id', id);
    } else {
      query = query.eq('email', email);
    }

    const { error } = await query;

    if (error) {
      alert('Error deleting member: ' + error.message);
    } else {
      setMembers(members.filter(m => (id ? m.id !== id : m.email !== email)));
    }
  }

  async function handleAddMember(e) {
    e.preventDefault();
    const { error } = await supabase
      .from('members')
      .insert([newMember]);

    if (error) {
      alert('Error adding member: ' + error.message);
    } else {
      alert('Member added successfully!');
      setShowAddModal(false);
      setNewMember({
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
      fetchMembers();
    }
  }

  async function handleFileUpload(e) {
    try {
      setUploading(true);
      const file = e.target.files[0];
      if (!file) return;

      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('member-photos')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage.from('member-photos').getPublicUrl(filePath);

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

  async function handleUpdate(e) {
    e.preventDefault();
    if (!editingMember) return;

    let query = supabase.from('members').update(editingMember);
    if (editingMember.id) {
      query = query.eq('id', editingMember.id);
    } else {
      query = query.eq('email', editingMember.email);
    }

    const { error } = await query;

    if (error) {
      alert('Error updating member: ' + error.message);
    } else {
      alert('Member updated successfully!');
      setEditingMember(null);
      await fetchMembers();
    }
  }

  // Filter logic for search & dropdowns
  const filteredMembers = members.filter((m) => {
    const fullName = `${m.first_name || ''} ${m.last_name || ''}`.toLowerCase();
    const email = (m.email || '').toLowerCase();
    const matchesSearch = fullName.includes(searchQuery.toLowerCase()) || email.includes(searchQuery.toLowerCase());
    const matchesDept = departmentFilter ? m.core_department === departmentFilter : true;
    const matchesRole = roleFilter ? m.role === roleFilter : true;
    return matchesSearch && matchesDept && matchesRole;
  });

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <p>Loading Admin Dashboard...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #e5e7eb', paddingBottom: '15px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>Admin Dashboard - Church Members</h1>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => setShowAddModal(true)}
            style={{ backgroundColor: '#10b981', color: '#fff', padding: '10px 15px', borderRadius: '6px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}
          >
            + Add New Member
          </button>
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

      {/* Search and Filters Bar */}
      <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Search by name or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ccc', flex: '1', minWidth: '220px' }}
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

      {/* Add New Member Modal */}
      {showAddModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: '#fff', padding: '25px', borderRadius: '8px', width: '600px', maxWidth: '90%', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '15px' }}>Register / Add New Member</h2>
            <form onSubmit={handleAddMember} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>Prefix</label>
                <select value={newMember.prefix} onChange={(e) => setNewMember({ ...newMember, prefix: e.target.value })} style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}>
                  <option value="">Select Prefix</option>
                  <option value="Mr">Mr</option>
                  <option value="Mrs">Mrs</option>
                  <option value="Ms">Ms</option>
                  <option value="Prophet">Prophet</option>
                  <option value="Osofo Maame">Osofo Maame</option>
                  <option value="Pastor">Pastor</option>
                </select>
              </div>
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
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>Gender</label>
                <select value={newMember.gender} onChange={(e) => setNewMember({ ...newMember, gender: e.target.value })} style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}>
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>Marital Status</label>
                <select value={newMember.marital_status} onChange={(e) => setNewMember({ ...newMember, marital_status: e.target.value })} style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}>
                  <option value="">Select Marital Status</option>
                  <option value="Single">Single</option>
                  <option value="Married">Married</option>
                  <option value="Widowed">Widowed</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>Date of Birth</label>
                <input type="date" value={newMember.date_of_birth} onChange={(e) => setNewMember({ ...newMember, date_of_birth: e.target.value })} style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>Date Joined</label>
                <input type="date" value={newMember.date_joined} onChange={(e) => setNewMember({ ...newMember, date_joined: e.target.value })} style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>Date of Baptism</label>
                <input type="date" value={newMember.date_of_baptism} onChange={(e) => setNewMember({ ...newMember, date_of_baptism: e.target.value })} style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>Home Address</label>
                <input type="text" placeholder="e.g. Plot 12, Block B, Techiman" value={newMember.home_address} onChange={(e) => setNewMember({ ...newMember, home_address: e.target.value })} style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>Hometown</label>
                <input type="text" placeholder="e.g. Wenchi" value={newMember.hometown} onChange={(e) => setNewMember({ ...newMember, hometown: e.target.value })} style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>Core Department</label>
                <select value={newMember.core_department} onChange={(e) => setNewMember({ ...newMember, core_department: e.target.value })} style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}>
                  <option value="">Select Core Department</option>
                  <option value="LOVE">LOVE</option>
                  <option value="UNITY">UNITY</option>
                  <option value="CARE">CARE</option>
                  <option value="RESPECT">RESPECT</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>Sub Department</label>
                <input type="text" placeholder="e.g. Ushering department" value={newMember.sub_department} onChange={(e) => setNewMember({ ...newMember, sub_department: e.target.value })} style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} />
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

      {/* Edit Member Panel */}
      {editingMember && (
        <div style={{ backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '15px' }}>Edit Member: {editingMember.first_name} {editingMember.last_name}</h3>
          <form onSubmit={handleUpdate} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>Prefix</label>
              <input type="text" value={editingMember.prefix || ''} onChange={(e) => setEditingMember({ ...editingMember, prefix: e.target.value })} style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} />
            </div>
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
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>Date of Birth</label>
              <input type="date" value={editingMember.date_of_birth || ''} onChange={(e) => setEditingMember({ ...editingMember, date_of_birth: e.target.value })} style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>Date Joined</label>
              <input type="date" value={editingMember.date_joined || ''} onChange={(e) => setEditingMember({ ...editingMember, date_joined: e.target.value })} style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>Date of Baptism</label>
              <input type="date" value={editingMember.date_of_baptism || ''} onChange={(e) => setEditingMember({ ...editingMember, date_of_baptism: e.target.value })} style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>Home Address</label>
              <input type="text" value={editingMember.home_address || ''} onChange={(e) => setEditingMember({ ...editingMember, home_address: e.target.value })} style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>Hometown</label>
              <input type="text" value={editingMember.hometown || ''} onChange={(e) => setEditingMember({ ...editingMember, hometown: e.target.value })} style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>Core Department</label>
              <select value={editingMember.core_department || ''} onChange={(e) => setEditingMember({ ...editingMember, core_department: e.target.value })} style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}>
                <option value="">Select Core Department</option>
                <option value="LOVE">LOVE</option>
                <option value="UNITY">UNITY</option>
                <option value="CARE">CARE</option>
                <option value="RESPECT">RESPECT</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>Sub Department</label>
              <input type="text" value={editingMember.sub_department || ''} onChange={(e) => setEditingMember({ ...editingMember, sub_department: e.target.value })} style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>Role</label>
              <select value={editingMember.role || 'member'} onChange={(e) => setEditingMember({ ...editingMember, role: e.target.value })} style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}>
                <option value="member">Member</option>
                <option value="admin">Admin</option>
                <option value="super_admin">Super Admin</option>
              </select>
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>Profile Photo</label>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <input type="file" accept="image/*" onChange={handleFileUpload} style={{ padding: '6px' }} />
                {uploading && <span>Uploading...</span>}
              </div>
            </div>
            <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '10px', marginTop: '10px' }}>
              <button type="submit" style={{ backgroundColor: '#2563eb', color: '#fff', padding: '8px 16px', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>Save Changes</button>
              <button type="button" onClick={() => setEditingMember(null)} style={{ backgroundColor: '#6b7280', color: '#fff', padding: '8px 16px', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Members Table */}
      <div style={{ overflowX: 'auto', backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: '#f3f4f6', borderBottom: '1px solid #e5e7eb' }}>
              <th style={{ padding: '12px' }}>Avatar</th>
              <th style={{ padding: '12px' }}>Name</th>
              <th style={{ padding: '12px' }}>Email & Phone</th>
              <th style={{ padding: '12px' }}>Address & Hometown</th>
              <th style={{ padding: '12px' }}>Department</th>
              <th style={{ padding: '12px' }}>Role</th>
              <th style={{ padding: '12px', textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredMembers.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ padding: '20px', textAlign: 'center', color: '#6b7280' }}>No members found.</td>
              </tr>
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
                  <td style={{ padding: '12px' }}>
                    <div style={{ fontSize: '13px' }}>{m.home_address || 'N/A'}</div>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>Hometown: {m.hometown || 'N/A'}</div>
                  </td>
                  <td style={{ padding: '12px' }}>{m.core_department} / {m.sub_department}</td>
                  <td style={{ padding: '12px' }}>
                    <span style={{ padding: '4px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold', backgroundColor: m.role === 'super_admin' ? '#fee2e2' : m.role === 'admin' ? '#e0e7ff' : '#f3f4f6', color: m.role === 'super_admin' ? '#dc2626' : m.role === 'admin' ? '#4f46e5' : '#374151' }}>
                      {m.role}
                    </span>
                  </td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>
                    <button
                      onClick={() => setEditingMember({ ...m })}
                      style={{ marginRight: '8px', padding: '6px 10px', backgroundColor: '#f59e0b', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(m.id, m.email)}
                      style={{ padding: '6px 10px', backgroundColor: '#ef4444', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
