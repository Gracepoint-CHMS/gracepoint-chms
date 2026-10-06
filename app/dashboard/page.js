'use client';

import { useState, useEffect } from 'react';

// Safe fallback import for Supabase client setup
let supabase;
try {
  supabase = require('../../lib/supabaseClient').supabase || require('../../lib/supabaseClient').default;
} catch (e1) {
  try {
    supabase = require('../../lib/supabase').supabase || require('../../lib/supabase').default;
  } catch (e2) {
    try {
      supabase = require('../lib/supabaseClient').supabase || require('../lib/supabaseClient').default;
    } catch (e3) {
      supabase = require('@/lib/supabaseClient').supabase || require('@/lib/supabaseClient').default;
    }
  }
}

export default function DashboardPage() {
  const [members, setMembers] = useState([]);
  const [currentUserRole, setCurrentUserRole] = useState('member');

  useEffect(() => {
    fetchCurrentUser();
    fetchMembers();
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('members')
          .select('role')
          .eq('id', user.id)
          .single();
        if (data && data.role) setCurrentUserRole(data.role);
      }
    } catch (err) {
      console.error('Error fetching current user:', err);
    }
  };

  const fetchMembers = async () => {
    try {
      const { data, error } = await supabase.from('members').select('*');
      if (!error && data) setMembers(data);
    } catch (err) {
      console.error('Error fetching members:', err);
    }
  };

  // Delete Member Handler
  const handleDelete = async (memberId) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this member?');
    if (!confirmDelete) return;

    try {
      const { error } = await supabase
        .from('members')
        .delete()
        .eq('id', memberId);

      if (error) {
        alert('Error deleting member: ' + error.message);
      } else {
        alert('Member deleted successfully.');
        setMembers((prev) => prev.filter((m) => m.id !== memberId));
      }
    } catch (err) {
      alert('Delete operation failed: ' + err.message);
    }
  };

  // Role Update Handler (Super Admin Only)
  const handleRoleChange = async (memberId, newRole) => {
    if (newRole === 'super_admin') {
      alert('There can only be one Super Admin.');
      return;
    }

    try {
      const { error } = await supabase
        .from('members')
        .update({ role: newRole })
        .eq('id', memberId);

      if (error) {
        alert('Failed to update role: ' + error.message);
      } else {
        alert(`Role updated to ${newRole}`);
        fetchMembers();
      }
    } catch (err) {
      alert('Role update failed: ' + err.message);
    }
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h2>Members Dashboard</h2>
      <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', marginTop: '1rem' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #ccc', paddingBottom: '0.5rem' }}>
            <th style={{ padding: '0.5rem' }}>ID</th>
            <th style={{ padding: '0.5rem' }}>Email</th>
            <th style={{ padding: '0.5rem' }}>Role</th>
            <th style={{ padding: '0.5rem' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {members.length === 0 ? (
            <tr>
              <td colSpan="4" style={{ padding: '1rem', textAlign: 'center' }}>
                No members found or loading...
              </td>
            </tr>
          ) : (
            members.map((member) => (
              <tr key={member.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '0.5rem' }}>{member.id}</td>
                <td style={{ padding: '0.5rem' }}>{member.email}</td>

                {/* Restrict Role Promotion in Dashboard UI */}
                <td style={{ padding: '0.5rem' }}>
                  {currentUserRole === 'super_admin' ? (
                    <select
                      value={member.role || 'member'}
                      onChange={(e) => handleRoleChange(member.id, e.target.value)}
                      style={{ padding: '0.4rem', borderRadius: '4px' }}
                    >
                      <option value="member">Member</option>
                      <option value="sub_admin">Sub-Admin</option>
                    </select>
                  ) : (
                    <span style={{ fontWeight: 'bold' }}>{member.role || 'member'}</span>
                  )}
                </td>

                <td style={{ padding: '0.5rem' }}>
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
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
