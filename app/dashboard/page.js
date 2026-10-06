'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';

export default function Dashboard() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingMember, setEditingMember] = useState(null);
  const [saveStatus, setSaveStatus] = useState('');

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('members').select('*').order('id', { ascending: false });
    if (!error && data) {
      setMembers(data);
    }
    setLoading(false);
  };

  const handleEditClick = (member) => {
    setEditingMember({ ...member });
    setSaveStatus('');
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditingMember((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    setSaveStatus('Saving...');

    const { error } = await supabase
      .from('members')
      .update({
        first_name: editingMember.first_name,
        last_name: editingMember.last_name,
        email: editingMember.email,
        phone: editingMember.phone,
        gender: editingMember.gender,
        date_of_birth: editingMember.date_of_birth || null,
        marital_status: editingMember.marital_status,
        hometown: editingMember.hometown,
        home_address: editingMember.home_address,
        core_department: editingMember.core_department,
        sub_department: editingMember.sub_department,
        date_joined: editingMember.date_joined || null,
        date_of_baptism: editingMember.date_of_baptism || null,
        emergency_name: editingMember.emergency_name,
        emergency_phone: editingMember.emergency_phone,
        role: editingMember.role,
      })
      .eq('id', editingMember.id);

    if (error) {
      setSaveStatus(`Error: ${error.message}`);
    } else {
      setSaveStatus('Member updated successfully!');
      setTimeout(() => {
        setEditingMember(null);
        fetchMembers();
      }, 1000);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this member?')) {
      await supabase.from('members').delete().eq('id', id);
      fetchMembers();
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '0.5rem',
    borderRadius: '4px',
    border: '1px solid #ccc',
    marginBottom: '0.8rem',
  };

  return (
    <div style={{ padding: '1rem', maxWidth: '1100px', margin: '0 auto' }}>
      <h2 style={{ textAlign: 'center', color: '#1a365d', marginBottom: '1.5rem' }}>Church Membership Dashboard</h2>

      {loading ? (
        <p style={{ textAlign: 'center' }}>Loading member records...</p>
      ) : (
        <div style={{ overflowX: 'auto', background: '#fff', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '700px' }}>
            <thead>
              <tr style={{ backgroundColor: '#2b6cb0', color: '#fff' }}>
                <th style={{ padding: '0.8rem' }}>Photo</th>
                <th style={{ padding: '0.8rem' }}>Name</th>
                <th style={{ padding: '0.8rem' }}>Phone</th>
                <th style={{ padding: '0.8rem' }}>Core Dept</th>
                <th style={{ padding: '0.8rem' }}>Sub Dept</th>
                <th style={{ padding: '0.8rem' }}>Role</th>
                <th style={{ padding: '0.8rem' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {members.map((member) => (
                <tr key={member.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '0.8rem' }}>
                    {member.photo_url ? (
                      <img src={member.photo_url} alt="Profile" style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#cbd5e0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem' }}>No Pic</div>
                    )}
                  </td>
                  <td style={{ padding: '0.8rem', fontWeight: 'bold' }}>{member.first_name} {member.last_name}</td>
                  <td style={{ padding: '0.8rem' }}>{member.phone}</td>
                  <td style={{ padding: '0.8rem', color: '#2b6cb0', fontWeight: 'bold' }}>{member.core_department}</td>
                  <td style={{ padding: '0.8rem' }}>{member.sub_department || '-'}</td>
                  <td style={{ padding: '0.8rem' }}>
                    <span style={{ padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold', backgroundColor: member.role === 'super_admin' ? '#feebc8' : member.role === 'sub_admin' ? '#ebf8ff' : '#edf2f7', color: member.role === 'super_admin' ? '#c05621' : member.role === 'sub_admin' ? '#2b6cb0' : '#4a5568' }}>
                      {member.role || 'member'}
                    </span>
                  </td>
                  <td style={{ padding: '0.8rem' }}>
                    <button onClick={() => handleEditClick(member)} style={{ backgroundColor: '#3182ce', color: '#fff', border: 'none', padding: '0.4rem 0.7rem', borderRadius: '4px', cursor: 'pointer', marginRight: '0.4rem' }}>
                      Edit
                    </button>
                    <button onClick={() => handleDelete(member.id)} style={{ backgroundColor: '#e53e3e', color: '#fff', border: 'none', padding: '0.4rem 0.7rem', borderRadius: '4px', cursor: 'pointer' }}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* EDIT MEMBER MODAL */}
      {editingMember && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', zIndex: 1000 }}>
          <div style={{ backgroundColor: '#fff', borderRadius: '8px', padding: '1.5rem', width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ marginTop: 0, color: '#1a365d' }}>Edit Member Details</h3>

            {saveStatus && (
              <p style={{ padding: '0.5rem', borderRadius: '4px', backgroundColor: saveStatus.includes('Error') ? '#fed7d7' : '#c6f6d5', color: saveStatus.includes('Error') ? '#9b2c2c' : '#22543d' }}>
                {saveStatus}
              </p>
            )}

            <form onSubmit={handleSaveEdit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>First Name</label>
                  <input type="text" name="first_name" value={editingMember.first_name || ''} onChange={handleEditChange} style={inputStyle} required />
                </div>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>Last Name</label>
                  <input type="text" name="last_name" value={editingMember.last_name || ''} onChange={handleEditChange} style={inputStyle} required />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>Email</label>
                  <input type="email" name="email" value={editingMember.email || ''} onChange={handleEditChange} style={inputStyle} required />
                </div>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>Phone</label>
                  <input type="text" name="phone" value={editingMember.phone || ''} onChange={handleEditChange} style={inputStyle} required />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>Gender</label>
                  <select name="gender" value={editingMember.gender || ''} onChange={handleEditChange} style={inputStyle}>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>Role / Access Level</label>
                  <select name="role" value={editingMember.role || 'member'} onChange={handleEditChange} style={{ ...inputStyle, fontWeight: 'bold', color: '#2b6cb0' }}>
                    <option value="member">Member</option>
                    <option value="sub_admin">Sub Admin</option>
                    <option value="super_admin">Super Admin</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>Core Department</label>
                  <select name="core_department" value={editingMember.core_department || ''} onChange={handleEditChange} style={inputStyle}>
                    <option value="LOVE">LOVE</option>
                    <option value="UNITY">UNITY</option>
                    <option value="CARE">CARE</option>
                    <option value="RESPECT">RESPECT</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>Sub Department</label>
                  <input type="text" name="sub_department" value={editingMember.sub_department || ''} onChange={handleEditChange} style={inputStyle} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>Date of Birth</label>
                  <input type="date" name="date_of_birth" value={editingMember.date_of_birth || ''} onChange={handleEditChange} style={inputStyle} />
                </div>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>Marital Status</label>
                  <select name="marital_status" value={editingMember.marital_status || ''} onChange={handleEditChange} style={inputStyle}>
                    <option value="Single">Single</option>
                    <option value="Married">Married</option>
                    <option value="Divorced">Divorced</option>
                    <option value="Widowed">Widowed</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>Hometown</label>
                  <input type="text" name="hometown" value={editingMember.hometown || ''} onChange={handleEditChange} style={inputStyle} />
                </div>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>Home Address</label>
                  <input type="text" name="home_address" value={editingMember.home_address || ''} onChange={handleEditChange} style={inputStyle} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>Date Joined</label>
                  <input type="date" name="date_joined" value={editingMember.date_joined || ''} onChange={handleEditChange} style={inputStyle} />
                </div>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>Date of Baptism</label>
                  <input type="date" name="date_of_baptism" value={editingMember.date_of_baptism || ''} onChange={handleEditChange} style={inputStyle} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>Emergency Name</label>
                  <input type="text" name="emergency_name" value={editingMember.emergency_name || ''} onChange={handleEditChange} style={inputStyle} />
                </div>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>Emergency Phone</label>
                  <input type="text" name="emergency_phone" value={editingMember.emergency_phone || ''} onChange={handleEditChange} style={inputStyle} />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.8rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setEditingMember(null)} style={{ padding: '0.5rem 1rem', background: '#cbd5e0', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                  Cancel
                </button>
                <button type="submit" style={{ padding: '0.5rem 1rem', background: '#2b6cb0', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
