'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';

export default function DashboardPage() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingMember, setEditingMember] = useState(null);

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('members')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMembers(data || []);
    } catch (err) {
      console.error('Error fetching members:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this member?')) return;

    try {
      const { error } = await supabase.from('members').delete().eq('id', id);
      if (error) throw error;
      setMembers(members.filter((m) => m.id !== id));
      alert('Member deleted successfully.');
    } catch (err) {
      alert(`Error deleting member: ${err.message}`);
    }
  };

  const handleEditClick = (member) => {
    setEditingMember({ ...member });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditingMember((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from('members')
        .update({
          first_name: editingMember.first_name,
          last_name: editingMember.last_name,
          phone: editingMember.phone,
          core_department: editingMember.core_department,
          sub_department: editingMember.sub_department,
        })
        .eq('id', editingMember.id);

      if (error) throw error;

      alert('Member updated successfully!');
      setEditingMember(null);
      fetchMembers();
    } catch (err) {
      alert(`Error updating member: ${err.message}`);
    }
  };

  return (
    <div style={{ maxWidth: '1050px', margin: '2rem auto', padding: '1rem' }}>
      <h2 style={{ textAlign: 'center', color: '#1a365d', marginBottom: '1.5rem' }}>
        Church Membership Dashboard
      </h2>

      {/* Edit Modal / Inline Form */}
      {editingMember && (
        <div style={{ background: '#f7fafc', border: '2px solid #3182ce', padding: '1.5rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
          <h3 style={{ marginTop: 0, color: '#2b6cb0' }}>Edit Member Details</h3>
          <form onSubmit={handleUpdate} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ fontWeight: 'bold' }}>First Name</label>
              <input type="text" name="first_name" value={editingMember.first_name || ''} onChange={handleEditChange} style={{ width: '100%', padding: '0.5rem', marginTop: '0.2rem' }} required />
            </div>
            <div>
              <label style={{ fontWeight: 'bold' }}>Last Name</label>
              <input type="text" name="last_name" value={editingMember.last_name || ''} onChange={handleEditChange} style={{ width: '100%', padding: '0.5rem', marginTop: '0.2rem' }} required />
            </div>
            <div>
              <label style={{ fontWeight: 'bold' }}>Phone</label>
              <input type="text" name="phone" value={editingMember.phone || ''} onChange={handleEditChange} style={{ width: '100%', padding: '0.5rem', marginTop: '0.2rem' }} required />
            </div>
            <div>
              <label style={{ fontWeight: 'bold' }}>Core Department</label>
              <select name="core_department" value={editingMember.core_department || ''} onChange={handleEditChange} style={{ width: '100%', padding: '0.5rem', marginTop: '0.2rem' }} required>
                <option value="">Select Core Dept</option>
                <option value="LOVE">LOVE</option>
                <option value="UNITY">UNITY</option>
                <option value="CARE">CARE</option>
                <option value="RESPECT">RESPECT</option>
              </select>
            </div>
            <div style={{ gridColumn: 'span 2', display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
              <button type="submit" style={{ padding: '0.6rem 1.2rem', background: '#38a169', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                Save Changes
              </button>
              <button type="button" onClick={() => setEditingMember(null)} style={{ padding: '0.6rem 1.2rem', background: '#e53e3e', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <p style={{ textAlign: 'center' }}>Loading members...</p>
      ) : (
        <div style={{ overflowX: 'auto', background: '#fff', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#2b6cb0', color: '#fff' }}>
                <th style={{ padding: '12px' }}>Photo</th>
                <th style={{ padding: '12px' }}>Name</th>
                <th style={{ padding: '12px' }}>Phone</th>
                <th style={{ padding: '12px' }}>Core Dept</th>
                <th style={{ padding: '12px' }}>Sub Dept</th>
                <th style={{ padding: '12px', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {members.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ padding: '16px', textAlign: 'center' }}>
                    No members registered yet.
                  </td>
                </tr>
              ) : (
                members.map((member) => (
                  <tr key={member.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '12px' }}>
                      {member.photo_url ? (
                        <img src={member.photo_url} alt="Passport" style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#cbd5e0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', color: '#4a5568' }}>
                          No Pic
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '12px', fontWeight: 'bold' }}>
                      {member.first_name} {member.last_name}
                    </td>
                    <td style={{ padding: '12px' }}>{member.phone}</td>
                    <td style={{ padding: '12px', color: '#2b6cb0', fontWeight: 'bold' }}>
                      {member.core_department || '-'}
                    </td>
                    <td style={{ padding: '12px' }}>{member.sub_department || '-'}</td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <button
                        onClick={() => handleEditClick(member)}
                        style={{ padding: '0.4rem 0.8rem', marginRight: '0.5rem', background: '#3182ce', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(member.id)}
                        style={{ padding: '0.4rem 0.8rem', background: '#e53e3e', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
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
      )}
    </div>
  );
}
