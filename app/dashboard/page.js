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
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [subDeptFilter, setSubDeptFilter] = useState('');

  // Modal and Editing states
  const [selectedMember, setSelectedMember] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [saving, setSaving] = useState(false);

  const ADMIN_PASSCODE = '1234';

  const handlePasscodeSubmit = (e) => {
    e.preventDefault();
    if (passcode === ADMIN_PASSCODE) {
      setIsAuthenticated(true);
      setPasscodeError('');
      fetchMembers();
    } else {
      setPasscodeError('Invalid Passcode. Please try again.');
    }
  };

  const fetchMembers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('members')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching members:', error.message);
    } else {
      setMembers(data || []);
      setFilteredMembers(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    let result = members;

    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (m) =>
          `${m.first_name || ''} ${m.last_name || ''}`.toLowerCase().includes(q) ||
          (m.phone && m.phone.toLowerCase().includes(q)) ||
          (m.email && m.email.toLowerCase().includes(q)) ||
          (m.hometown && m.hometown.toLowerCase().includes(q)) ||
          (m.home_address && m.home_address.toLowerCase().includes(q))
      );
    }

    if (departmentFilter) {
      result = result.filter((m) => m.core_department === departmentFilter);
    }

    if (subDeptFilter) {
      result = result.filter((m) => m.sub_department === subDeptFilter);
    }

    setFilteredMembers(result);
  }, [searchQuery, departmentFilter, subDeptFilter, members]);

  // Modal Handlers
  const handleOpenModal = (member) => {
    setSelectedMember(member);
    setEditFormData(member);
    setIsEditing(false);
  };

  const handleCloseModal = () => {
    setSelectedMember(null);
    setIsEditing(false);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveEdit = async () => {
    setSaving(true);
    const { id, created_at, ...updateData } = editFormData;

    const { data, error } = await supabase
      .from('members')
      .update(updateData)
      .eq('id', selectedMember.id)
      .select();

    if (error) {
      alert('Error updating record: ' + error.message);
    } else if (data && data.length > 0) {
      setMembers((prev) =>
        prev.map((m) => (m.id === selectedMember.id ? data[0] : m))
      );
      setSelectedMember(data[0]);
      setIsEditing(false);
    }
    setSaving(false);
  };

  const handleDeleteMember = async (id) => {
    if (confirm('Are you sure you want to delete this member record?')) {
      const { error } = await supabase.from('members').delete().eq('id', id);
      if (error) {
        alert('Error deleting record: ' + error.message);
      } else {
        setMembers((prev) => prev.filter((m) => m.id !== id));
        handleCloseModal();
      }
    }
  };

  if (!isAuthenticated) {
    return (
      <div style={{ maxWidth: '400px', margin: '4rem auto', padding: '2rem', border: '1px solid #ddd', borderRadius: '8px', textAlign: 'center' }}>
        <h2>Admin Access Required</h2>
        <form onSubmit={handlePasscodeSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem' }}>
          <input
            type="password"
            placeholder="Enter Admin Passcode"
            value={passcode}
            onChange={(e) => setPasscode(e.target.value)}
            style={{ padding: '0.75rem', fontSize: '1rem', borderRadius: '4px', border: '1px solid #ccc' }}
          />
          {passcodeError && <p style={{ color: 'red', margin: 0 }}>{passcodeError}</p>}
          <button type="submit" style={{ padding: '0.75rem', fontSize: '1rem', background: '#0066cc', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            Login
          </button>
        </form>
      </div>
    );
  }

  return (
    <div style={{ padding: '1.5rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h2 style={{ marginBottom: '1rem' }}>Member Directory</h2>

      {/* Quick Stats */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <div style={{ padding: '1rem', background: '#0055b3', color: '#fff', borderRadius: '6px', minWidth: '120px', textAlign: 'center' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{members.length}</div>
          <div style={{ fontSize: '0.85rem' }}>Total Members</div>
        </div>
        <div style={{ padding: '1rem', background: '#007336', color: '#fff', borderRadius: '6px', minWidth: '120px', textAlign: 'center' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
            {members.filter((m) => m.gender === 'Male').length}
          </div>
          <div style={{ fontSize: '0.85rem' }}>Males</div>
        </div>
        <div style={{ padding: '1rem', background: '#8a0052', color: '#fff', borderRadius: '6px', minWidth: '120px', textAlign: 'center' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
            {members.filter((m) => m.gender === 'Female').length}
          </div>
          <div style={{ fontSize: '0.85rem' }}>Females</div>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Search by name, phone, residence..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ flex: '1 1 250px', padding: '0.6rem', border: '1px solid #ccc', borderRadius: '4px' }}
        />
        <select
          value={departmentFilter}
          onChange={(e) => setDepartmentFilter(e.target.value)}
          style={{ padding: '0.6rem', border: '1px solid #ccc', borderRadius: '4px' }}
        >
          <option value="">All Core Depts</option>
          <option value="LOVE">LOVE</option>
          <option value="UNITY">UNITY</option>
          <option value="CARE">CARE</option>
          <option value="RESPECT">RESPECT</option>
        </select>
        <select
          value={subDeptFilter}
          onChange={(e) => setSubDeptFilter(e.target.value)}
          style={{ padding: '0.6rem', border: '1px solid #ccc', borderRadius: '4px' }}
        >
          <option value="">All Sub Depts</option>
          <option value="Ushering">Ushering</option>
          <option value="Choir / Music">Choir / Music</option>
          <option value="Prayer Warriors">Prayer Warriors</option>
          <option value="Evangelical">Evangelical</option>
          <option value="Women Ministry">Women Ministry</option>
          <option value="Men Ministry">Men Ministry</option>
          <option value="Youth Ministry">Youth Ministry</option>
          <option value="Children Ministry">Children Ministry</option>
        </select>
      </div>

      {/* Directory Table */}
      {loading ? (
        <p>Loading member data...</p>
      ) : (
        <div style={{ overflowX: 'auto', border: '1px solid #eee', borderRadius: '6px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
            <thead>
              <tr style={{ background: '#f5f5f5', borderBottom: '2px solid #ddd' }}>
                <th style={{ padding: '0.75rem' }}>Photo</th>
                <th style={{ padding: '0.75rem' }}>Name</th>
                <th style={{ padding: '0.75rem' }}>Phone</th>
                <th style={{ padding: '0.75rem' }}>Gender</th>
                <th style={{ padding: '0.75rem' }}>Core Dept</th>
                <th style={{ padding: '0.75rem' }}>Sub Dept</th>
              </tr>
            </thead>
            <tbody>
              {filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ padding: '1rem', textAlign: 'center', color: '#666' }}>
                    No members found.
                  </td>
                </tr>
              ) : (
                filteredMembers.map((member) => (
                  <tr
                    key={member.id}
                    onClick={() => handleOpenModal(member)}
                    style={{ borderBottom: '1px solid #eee', cursor: 'pointer' }}
                  >
                    <td style={{ padding: '0.5rem 0.75rem' }}>
                      {member.photo_url ? (
                        <img
                          src={member.photo_url}
                          alt={`${member.first_name}`}
                          style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
                        />
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: '#888' }}>No Photo</span>
                      )}
                    </td>
                    <td style={{ padding: '0.75rem', fontWeight: '500' }}>
                      {member.first_name} {member.last_name}
                    </td>
                    <td style={{ padding: '0.75rem' }}>{member.phone || '-'}</td>
                    <td style={{ padding: '0.75rem' }}>{member.gender || '-'}</td>
                    <td style={{ padding: '0.75rem' }}>{member.core_department || '-'}</td>
                    <td style={{ padding: '0.75rem' }}>{member.sub_department || '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Member Details / Edit Modal */}
      {selectedMember && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '1rem' }}>
          <div style={{ background: '#fff', borderRadius: '8px', maxWidth: '500px', width: '100%', maxHeight: '90vh', overflowY: 'auto', padding: '1.5rem', position: 'relative' }}>
            <button
              onClick={handleCloseModal}
              style={{ position: 'absolute', top: '1rem', right: '1rem', border: 'none', background: 'transparent', fontSize: '1.25rem', cursor: 'pointer' }}
            >
              ✕
            </button>

            {/* Passport Photo Display in Modal */}
            <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
              {selectedMember.photo_url ? (
                <img
                  src={selectedMember.photo_url}
                  alt={selectedMember.first_name}
                  style={{ width: '90px', height: '90px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #0066cc' }}
                />
              ) : (
                <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', color: '#777', fontSize: '0.8rem' }}>
                  No Photo
                </div>
              )}
              <h3 style={{ margin: '0.5rem 0 0 0' }}>{selectedMember.first_name} {selectedMember.last_name}</h3>
            </div>

            {!isEditing ? (
              <div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                  <div><strong>Phone:</strong> {selectedMember.phone || '-'}</div>
                  <div><strong>Email:</strong> {selectedMember.email || '-'}</div>
                  <div><strong>Gender:</strong> {selectedMember.gender || '-'}</div>
                  <div><strong>Marital Status:</strong> {selectedMember.marital_status || '-'}</div>
                  <div><strong>Date of Birth:</strong> {selectedMember.dob || '-'}</div>
                  <div><strong>Place of Birth:</strong> {selectedMember.pob || '-'}</div>
                  <div><strong>Home Address:</strong> {selectedMember.home_address || '-'}</div>
                  <div><strong>Home Town:</strong> {selectedMember.hometown || '-'}</div>
                  <div><strong>Core Dept:</strong> {selectedMember.core_department || '-'}</div>
                  <div><strong>Sub Dept:</strong> {selectedMember.sub_department || '-'}</div>
                  <div><strong>Date Joined:</strong> {selectedMember.date_joined || '-'}</div>
                  <div><strong>Baptism Date:</strong> {selectedMember.baptism_date || '-'}</div>
                  <div><strong>Emergency Contact:</strong> {selectedMember.emergency_name || '-'}</div>
                  <div><strong>Emergency Phone:</strong> {selectedMember.emergency_phone || '-'}</div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-start' }}>
                  <button onClick={() => setIsEditing(true)} style={{ padding: '0.5rem 1rem', background: '#0066cc', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                    Edit Record
                  </button>
                  <button onClick={() => handleDeleteMember(selectedMember.id)} style={{ padding: '0.5rem 1rem', background: '#dc3545', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                    Delete
                  </button>
                  <button onClick={handleCloseModal} style={{ padding: '0.5rem 1rem', background: '#ccc', color: '#333', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                    Close
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.85rem', marginBottom: '1rem' }}>
                  <div>
                    <label>First Name</label>
                    <input type="text" name="first_name" value={editFormData.first_name || ''} onChange={handleEditChange} style={{ width: '100%', padding: '0.4rem' }} />
                  </div>
                  <div>
                    <label>Last Name</label>
                    <input type="text" name="last_name" value={editFormData.last_name || ''} onChange={handleEditChange} style={{ width: '100%', padding: '0.4rem' }} />
                  </div>
                  <div>
                    <label>Phone</label>
                    <input type="text" name="phone" value={editFormData.phone || ''} onChange={handleEditChange} style={{ width: '100%', padding: '0.4rem' }} />
                  </div>
                  <div>
                    <label>Email</label>
                    <input type="text" name="email" value={editFormData.email || ''} onChange={handleEditChange} style={{ width: '100%', padding: '0.4rem' }} />
                  </div>
                  <div>
                    <label>Gender</label>
                    <input type="text" name="gender" value={editFormData.gender || ''} onChange={handleEditChange} style={{ width: '100%', padding: '0.4rem' }} />
                  </div>
                  <div>
                    <label>Home Address</label>
                    <input type="text" name="home_address" value={editFormData.home_address || ''} onChange={handleEditChange} style={{ width: '100%', padding: '0.4rem' }} />
                  </div>
                  <div>
                    <label>Home Town</label>
                    <input type="text" name="hometown" value={editFormData.hometown || ''} onChange={handleEditChange} style={{ width: '100%', padding: '0.4rem' }} />
                  </div>
                  <div>
                    <label>Core Department</label>
                    <select name="core_department" value={editFormData.core_department || ''} onChange={handleEditChange} style={{ width: '100%', padding: '0.4rem' }}>
                      <option value="">Select Core Dept</option>
                      <option value="LOVE">LOVE</option>
                      <option value="UNITY">UNITY</option>
                      <option value="CARE">CARE</option>
                      <option value="RESPECT">RESPECT</option>
                    </select>
                  </div>
                  <div>
                    <label>Sub Department</label>
                    <select name="sub_department" value={editFormData.sub_department || ''} onChange={handleEditChange} style={{ width: '100%', padding: '0.4rem' }}>
                      <option value="">Select Sub Dept</option>
                      <option value="Ushering">Ushering</option>
                      <option value="Choir / Music">Choir / Music</option>
                      <option value="Prayer Warriors">Prayer Warriors</option>
                      <option value="Evangelical">Evangelical</option>
                      <option value="Women Ministry">Women Ministry</option>
                      <option value="Men Ministry">Men Ministry</option>
                      <option value="Youth Ministry">Youth Ministry</option>
                      <option value="Children Ministry">Children Ministry</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button onClick={handleSaveEdit} disabled={saving} style={{ padding: '0.5rem 1rem', background: '#28a745', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button onClick={() => setIsEditing(false)} style={{ padding: '0.5rem 1rem', background: '#ccc', color: '#333', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
