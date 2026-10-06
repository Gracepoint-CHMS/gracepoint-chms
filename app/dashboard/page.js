'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient'; // Adjust path based on your setup

export default function DashboardPage() {
  const [members, setMembers] = useState([]);
  const [currentUserRole, setCurrentUserRole] = useState('member'); // Default fallback role

  // Fetch current user and members list on load
  useEffect(() => {
    fetchCurrentUser();
    fetchMembers();
  }, []);

  const fetchCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase
        .from('members')
        .select('role')
        .eq('id', user.id)
        .single();
      if (data) setCurrentUserRole(data.role);
    }
  };

  const fetchMembers = async () => {
    const { data, error } = await supabase.from('members').select('*');
    if (!error && data) setMembers(data);
  };

  // A. Frontend Delete Handler[span_3](start_span)[span_3](end_span)
  const handleDelete = async (memberId) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this member?');
    if (!confirmDelete) return;

    const { error } = await supabase
      .from('members')
      .delete()
      .eq('id', memberId);

    if (error) {
      alert('Error deleting member: ' + error.message);
    } else {
      alert('Member deleted successfully.');
      // Refresh local list state[span_4](start_span)[span_4](end_span)
      setMembers((prev) => prev.filter((m) => m.id !== memberId));
    }
  };

  // B. Role Update Function (Super Admin Only)[span_5](start_span)[span_5](end_span)
  const handleRoleChange = async (memberId, newRole) => {
    // Prevent creating another super admin[span_6](start_span)[span_6](end_span)
    if (newRole === 'super_admin') {
      alert('There can only be one Super Admin.');
      return;
    }

    const { error } = await supabase
      .from('members')
      .update({ role: newRole })
      .eq('id', memberId);

    if (error) {
      alert('Failed to update role: ' + error.message);
    } else {
      alert(`Role updated to ${newRole}`);
      fetchMembers(); // Reload members list[span_7](start_span)[span_7](end_span)
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Members Dashboard</h2>
      <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid #ccc' }}>
            <th>ID</th>
            <th>Email</th>
            <th>Role</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {members.map((member) => (
            <tr key={member.id} style={{ borderBottom: '1px solid #eee' }}>
              <td>{member.id}</td>
              <td>{member.email}</td>

              {/* C. Restrict Role Promotion in Dashboard[span_8](start_span)[span_8](end_span) */}
              <td>
                {currentUserRole === 'super_admin' ? (
                  <select
                    value={member.role}
                    onChange={(e) => handleRoleChange(member.id, e.target.value)}
                    style={{ padding: '0.4rem', borderRadius: '4px' }}
                  >
                    <option value="member">Member</option>
                    <option value="sub_admin">Sub-Admin</option>
                  </select>
                ) : (
                  <span style={{ fontWeight: 'bold' }}>{member.role}</span>
                )}
              </td>

              <td>
                <button
                  onClick={() => handleDelete(member.id)}
                  style={{
                    backgroundColor: '#ff4d4f',
                    color: '#fff',
                    border: 'none',
                    padding: '0.4rem 0.8rem',
                    borderRadius: '4px',
                    cursor: 'pointer',
                  }}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
