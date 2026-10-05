'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

export default function DashboardPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [passcodeError, setPasscodeError] = useState('');

  const [members, setMembers] = useState([]);
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('ALL');
  const [subDeptFilter, setSubDeptFilter] = useState('ALL');

  // Modal and Editing states
  const [selectedMember, setSelectedMember] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [saving, setSaving] = useState(false);

  const ADMIN_PASSCODE = '1234';

  useEffect(() => {
    if (isAuthenticated) {
      fetchMembers();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    filterData();
  }, [searchQuery, departmentFilter, subDeptFilter, members]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (passcode === ADMIN_PASSCODE) {
      setIsAuthenticated(true);
      setPasscodeError('');
    } else {
      setPasscodeError('Invalid Passcode. Please try again.');
    }
  };

  const fetchMembers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('members')
      .select('*')
      .order('first_name', { ascending: true });

    if (error) {
      console.error('Error fetching members:', error);
    } else {
      setMembers(data || []);
      setFilteredMembers(data || []);
    }
    setLoading(false);
  };

  const filterData = () => {
    let updated = [...members];

    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      updated = updated.filter(
        (m) =>
          (m.first_name && m.first_name.toLowerCase().includes(q)) ||
          (m.last_name && m.last_name.toLowerCase().includes(q)) ||
          (m.phone && m.phone.includes(q)) ||
          (m.home_town && m.home_town.toLowerCase().includes(q))
      );
    }

    if (departmentFilter !== 'ALL') {
      updated = updated.filter(
        (m) =>
          m.core_value_department &&
          m.core_value_department.toUpperCase() === departmentFilter.toUpperCase()
      );
    }

    if (subDeptFilter !== 'ALL') {
      updated = updated.filter(
        (m) =>
          m.sub_department &&
          m.sub_department.toUpperCase() === subDeptFilter.toUpperCase()
      );
    }

    setFilteredMembers(updated);
  };

  const handleOpenDetails = (member) => {
    setSelectedMember(member);
    setEditFormData(member);
    setIsEditing(false);
  };

  const handleEditChange = (e) => {
    setEditFormData({
      ...editFormData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSaveEdit = async () => {
    setSaving(true);
    const { error } = await supabase
      .from('members')
      .update(editFormData)
      .eq('id', selectedMember.id);

    if (error) {
      alert('Error updating member: ' + error.message);
    } else {
      alert('Member details updated successfully!');
      setSelectedMember(editFormData);
      setIsEditing(false);
      fetchMembers();
    }
    setSaving(false);
  };

  const handleDeleteMember = async (id) => {
    if (!window.confirm('Are you sure you want to delete this member record?')) return;

    const { error } = await supabase.from('members').delete().eq('id', id);
    if (error) {
      alert('Error deleting record: ' + error.message);
    } else {
      setSelectedMember(null);
      fetchMembers();
    }
  };

  const exportToCSV = () => {
    if (filteredMembers.length === 0) return;

    const headers = [
      'First Name', 'Last Name', 'Phone', 'Email', 'Gender',
      'Date of Birth', 'Place of Birth', 'Home Address', 'Home Town',
      'Marital Status', 'Core Department', 'Sub Department',
      'Date Joined Church', 'Date of Baptism', 'Emergency Contact Person', 'Emergency Contact Phone'
    ];

    const rows = filteredMembers.map((m) => [
      `"${m.first_name || ''}"`,
      `"${m.last_name || ''}"`,
      `"${m.phone || ''}"`,
      `"${m.email || ''}"`,
      `"${m.gender || ''}"`,
      `"${m.date_of_birth || ''}"`,
      `"${m.place_of_birth || ''}"`,
      `"${m.home_address || ''}"`,
      `"${m.home_town || ''}"`,
      `"${m.marital_status || ''}"`,
      `"${m.core_value_department || ''}"`,
      `"${m.sub_department || ''}"`,
      `"${m.date_joined_church || ''}"`,
      `"${m.date_of_baptism || ''}"`,
      `"${m.emergency_contact_person || ''}"`,
      `"${m.emergency_contact_phone || ''}"`
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `gracepoint_members_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!isAuthenticated) {
    return (
      <div style={{ maxWidth: '400px', margin: '80px auto', padding: '24px', border: '1px solid #ddd', borderRadius: '8px', textAlign: 'center', fontFamily: 'sans-serif', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
        <h2>Admin Authentication</h2>
        <p style={{ color: '#666', fontSize: '14px' }}>Please enter passcode to access the member dashboard.</p>
        <form onSubmit={handleLogin}>
          <input
            type="password"
            placeholder="Enter Admin Passcode"
            value={passcode}
            onChange={(e) => setPasscode(e.target.value)}
            style={{ width: '100%', padding: '10px', margin: '16px 0', boxSizing: 'border-box', fontSize: '16px', textAlign: 'center' }}
          />
          {passcodeError && <p style={{ color: 'red', fontSize: '13px' }}>{passcodeError}</p>}
          <button
            type="submit"
            style={{ width: '100%', padding: '12px', backgroundColor: '#0070f3', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}
          >
            Unlock Dashboard
          </button>
        </form>
      </div>
    );
  }

  const maleCount = members.filter((m) => m.gender && m.gender.toLowerCase() === 'male').length;
  const femaleCount = members.filter((m) => m.gender && m.gender.toLowerCase() === 'female').length;

  return (
    <div style={{ maxWidth: '1100px', margin: '20px auto', padding: '0 16px', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
        <h2 style={{ margin: '10px 0' }}>Gracepoint CHMS - Member Directory</h2>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={exportToCSV}
            disabled={filteredMembers.length === 0}
            style={{
              padding: '10px 16px',
              backgroundColor: '#107c41',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              fontWeight: 'bold',
              cursor: filteredMembers.length === 0 ? 'not-allowed' : 'pointer',
            }}
          >
            Export CSV (Excel)
          </button>
          <button
            onClick={() => setIsAuthenticated(false)}
            style={{ padding: '10px 14px', backgroundColor: '#666', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
          >
            Lock
          </button>
        </div>
      </div>

      {/* Analytics Banner */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px', margin: '20px 0' }}>
        <div style={{ padding: '14px', background: '#0070f3', color: '#fff', borderRadius: '8px', textAlign: 'center' }}>
          <span style={{ fontSize: '11px', textTransform: 'uppercase', opacity: 0.9 }}>Total Members</span>
          <h3 style={{ margin: '4px 0 0', fontSize: '24px' }}>{members.length}</h3>
        </div>
        <div style={{ padding: '14px', background: '#107c41', color: '#fff', borderRadius: '8px', textAlign: 'center' }}>
          <span style={{ fontSize: '11px', textTransform: 'uppercase', opacity: 0.9 }}>Male Members</span>
          <h3 style={{ margin: '4px 0 0', fontSize: '24px' }}>{maleCount}</h3>
        </div>
        <div style={{ padding: '14px', background: '#e11d48', color: '#fff', borderRadius: '8px', textAlign: 'center' }}>
          <span style={{ fontSize: '11px', textTransform: 'uppercase', opacity: 0.9 }}>Female Members</span>
          <h3 style={{ margin: '4px 0 0', fontSize: '24px' }}>{femaleCount}</h3>
        </div>
        <div style={{ padding: '14px', background: '#7c3aed', color: '#fff', borderRadius: '8px', textAlign: 'center' }}>
          <span style={{ fontSize: '11px', textTransform: 'uppercase', opacity: 0.9 }}>Filtered Results</span>
          <h3 style={{ margin: '4px 0 0', fontSize: '24px' }}>{filteredMembers.length}</h3>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '20px', padding: '16px', background: '#f9f9f9', borderRadius: '8px', border: '1px solid #ddd' }}>
        <div>
          <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Search Name / Phone</label>
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: '100%', padding: '8px', marginTop: '4px', boxSizing: 'border-box' }}
          />
        </div>

        <div>
          <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Core Value Dept</label>
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            style={{ width: '100%', padding: '8px', marginTop: '4px', boxSizing: 'border-box' }}
          >
            <option value="ALL">All Departments</option>
            <option value="LOVE">LOVE</option>
            <option value="UNITY">UNITY</option>
            <option value="CARE">CARE</option>
            <option value="RESPECT">RESPECT</option>
          </select>
        </div>

        <div>
          <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Sub-Department</label>
          <select
            value={subDeptFilter}
            onChange={(e) => setSubDeptFilter(e.target.value)}
            style={{ width: '100%', padding: '8px', marginTop: '4px', boxSizing: 'border-box' }}
          >
            <option value="ALL">All Sub-Departments</option>
            <option value="General Assembly">General Assembly</option>
            <option value="Ushering Department">Ushering Department</option>
            <option value="Choir / Music Ministry">Choir / Music Ministry</option>
            <option value="Prayer Warriors">Prayer Warriors</option>
            <option value="Youth Ministry">Youth Ministry</option>
            <option value="Children Ministry">Children Ministry</option>
            <option value="Women Ministry">Women Ministry</option>
            <option value="Men Ministry">Men Ministry</option>
            <option value="Media & IT">Media & IT</option>
          </select>
        </div>
      </div>

      {loading ? (
        <p>Loading members...</p>
      ) : (
        <div style={{ width: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch', border: '1px solid #ccc', borderRadius: '6px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px', fontSize: '14px' }}>
            <thead>
              <tr style={{ background: '#0070f3', color: '#fff', textAlign: 'left' }}>
                <th style={{ padding: '10px', border: '1px solid #ccc' }}>Full Name</th>
                <th style={{ padding: '10px', border: '1px solid #ccc' }}>Phone</th>
                <th style={{ padding: '10px', border: '1px solid #ccc' }}>Gender</th>
                <th style={{ padding: '10px', border: '1px solid #ccc' }}>Core Dept</th>
                <th style={{ padding: '10px', border: '1px solid #ccc' }}>Sub-Dept</th>
                <th style={{ padding: '10px', border: '1px solid #ccc' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredMembers.length > 0 ? (
                filteredMembers.map((m, idx) => (
                  <tr key={m.id || idx} style={{ background: idx % 2 === 0 ? '#fff' : '#f8f9fa' }}>
                    <td style={{ padding: '10px', border: '1px solid #ccc', fontWeight: '600' }}>
                      {`${m.first_name || ''} ${m.last_name || ''}`.trim() || 'N/A'}
                    </td>
                    <td style={{ padding: '10px', border: '1px solid #ccc' }}>{m.phone || '-'}</td>
                    <td style={{ padding: '10px', border: '1px solid #ccc' }}>{m.gender || '-'}</td>
                    <td style={{ padding: '10px', border: '1px solid #ccc' }}>{m.core_value_department || '-'}</td>
                    <td style={{ padding: '10px', border: '1px solid #ccc' }}>{m.sub_department || '-'}</td>
                    <td style={{ padding: '10px', border: '1px solid #ccc' }}>
                      <button
                        onClick={() => handleOpenDetails(m)}
                        style={{ padding: '6px 10px', backgroundColor: '#0070f3', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
                      >
                        Details / Edit
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" style={{ padding: '16px', textAlign: 'center', color: '#888' }}>
                    No members matched the criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Member Details & Edit Modal */}
      {selectedMember && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '16px', zIndex: 1000 }}>
          <div style={{ background: '#fff', borderRadius: '8px', padding: '24px', maxWidth: '520px', width: '100%', maxHeight: '90vh', overflowY: 'auto', fontFamily: 'sans-serif' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0 }}>{isEditing ? 'Edit Member Details' : `${selectedMember.first_name || ''} ${selectedMember.last_name || ''}`}</h3>
              <button onClick={() => setSelectedMember(null)} style={{ border: 'none', background: 'none', fontSize: '20px', cursor: 'pointer' }}>✕</button>
            </div>

            {isEditing ? (
              /* Editable Form View */
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '13px' }}>
                <div>
                  <label style={{ fontWeight: 'bold' }}>First Name</label>
                  <input type="text" name="first_name" value={editFormData.first_name || ''} onChange={handleEditChange} style={{ width: '100%', padding: '6px', marginTop: '2px', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ fontWeight: 'bold' }}>Last Name</label>
                  <input type="text" name="last_name" value={editFormData.last_name || ''} onChange={handleEditChange} style={{ width: '100%', padding: '6px', marginTop: '2px', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ fontWeight: 'bold' }}>Phone</label>
                  <input type="text" name="phone" value={editFormData.phone || ''} onChange={handleEditChange} style={{ width: '100%', padding: '6px', marginTop: '2px', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ fontWeight: 'bold' }}>Email</label>
                  <input type="email" name="email" value={editFormData.email || ''} onChange={handleEditChange} style={{ width: '100%', padding: '6px', marginTop: '2px', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ fontWeight: 'bold' }}>Gender</label>
                  <select name="gender" value={editFormData.gender || ''} onChange={handleEditChange} style={{ width: '100%', padding: '6px', marginTop: '2px', boxSizing: 'border-box' }}>
                    <option value="">Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontWeight: 'bold' }}>Marital Status</label>
                  <select name="marital_status" value={editFormData.marital_status || ''} onChange={handleEditChange} style={{ width: '100%', padding: '6px', marginTop: '2px', boxSizing: 'border-box' }}>
                    <option value="">Select</option>
                    <option value="Single">Single</option>
                    <option value="Married">Married</option>
                    <option value="Widowed">Widowed</option>
                    <option value="Divorced">Divorced</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontWeight: 'bold' }}>Date of Birth</label>
                  <input type="date" name="date_of_birth" value={editFormData.date_of_birth || ''} onChange={handleEditChange} style={{ width: '100%', padding: '6px', marginTop: '2px', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ fontWeight: 'bold' }}>Place of Birth</label>
                  <input type="text" name="place_of_birth" value={editFormData.place_of_birth || ''} onChange={handleEditChange} style={{ width: '100%', padding: '6px', marginTop: '2px', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ fontWeight: 'bold' }}>Home Address</label>
                  <input type="text" name="home_address" value={editFormData.home_address || ''} onChange={handleEditChange} style={{ width: '100%', padding: '6px', marginTop: '2px', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ fontWeight: 'bold' }}>Home Town</label>
                  <input type="text" name="home_town" value={editFormData.home_town || ''} onChange={handleEditChange} style={{ width: '100%', padding: '6px', marginTop: '2px', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ fontWeight: 'bold' }}>Core Dept</label>
                  <select name="core_value_department" value={editFormData.core_value_department || ''} onChange={handleEditChange} style={{ width: '100%', padding: '6px', marginTop: '2px', boxSizing: 'border-box' }}>
                    <option value="">Select</option>
                    <option value="LOVE">LOVE</option>
                    <option value="UNITY">UNITY</option>
                    <option value="CARE">CARE</option>
                    <option value="RESPECT">RESPECT</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontWeight: 'bold' }}>Sub Dept</label>
                  <select name="sub_department" value={editFormData.sub_department || ''} onChange={handleEditChange} style={{ width: '100%', padding: '6px', marginTop: '2px', boxSizing: 'border-box' }}>
                    <option value="">Select</option>
                    <option value="General Assembly">General Assembly</option>
                    <option value="Ushering Department">Ushering Department</option>
                    <option value="Choir / Music Ministry">Choir / Music Ministry</option>
                    <option value="Prayer Warriors">Prayer Warriors</option>
                    <option value="Youth Ministry">Youth Ministry</option>
                    <option value="Children Ministry">Children Ministry</option>
                    <option value="Women Ministry">Women Ministry</option>
                    <option value="Men Ministry">Men Ministry</option>
                    <option value="Media & IT">Media & IT</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontWeight: 'bold' }}>Date Joined</label>
                  <input type="date" name="date_joined_church" value={editFormData.date_joined_church || ''} onChange={handleEditChange} style={{ width: '100%', padding: '6px', marginTop: '2px', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ fontWeight: 'bold' }}>Baptism Date</label>
                  <input type="date" name="date_of_baptism" value={editFormData.date_of_baptism || ''} onChange={handleEditChange} style={{ width: '100%', padding: '6px', marginTop: '2px', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ fontWeight: 'bold' }}>Emergency Contact</label>
                  <input type="text" name="emergency_contact_person" value={editFormData.emergency_contact_person || ''} onChange={handleEditChange} style={{ width: '100%', padding: '6px', marginTop: '2px', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ fontWeight: 'bold' }}>Emergency Phone</label>
                  <input type="text" name="emergency_contact_phone" value={editFormData.emergency_contact_phone || ''} onChange={handleEditChange} style={{ width: '100%', padding: '6px', marginTop: '2px', boxSizing: 'border-box' }} />
                </div>
              </div>
            ) : (
              /* Read-Only Details View */
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '14px' }}>
                <p><strong>Phone:</strong> {selectedMember.phone || '-'}</p>
                <p><strong>Email:</strong> {selectedMember.email || '-'}</p>
                <p><strong>Gender:</strong> {selectedMember.gender || '-'}</p>
                <p><strong>Marital Status:</strong> {selectedMember.marital_status || '-'}</p>
                <p><strong>Date of Birth:</strong> {selectedMember.date_of_birth || '-'}</p>
                <p><strong>Place of Birth:</strong> {selectedMember.place_of_birth || '-'}</p>
                <p><strong>Home Address:</strong> {selectedMember.home_address || '-'}</p>
                <p><strong>Home Town:</strong> {selectedMember.home_town || '-'}</p>
                <p><strong>Core Dept:</strong> {selectedMember.core_value_department || '-'}</
