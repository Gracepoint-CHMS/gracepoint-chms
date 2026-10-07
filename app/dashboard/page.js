'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';

export default function AdminDashboard() {
  const router = useRouter();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingMember, setEditingMember] = useState(null);

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
    if (!confirm(`Are you sure you want to delete ${email || 'this member'}?`)) return;

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

  async function handleUpdate(e) {
    e.preventDefault();
    if (!editingMember) return;

    const updateData = {
      prefix: editingMember.prefix || '',
      first_name: editingMember.first_name || '',
      last_name: editingMember.last_name || '',
      email: editingMember.email || '',
      phone: editingMember.phone || '',
      date_of_birth: editingMember.date_of_birth || '',
      home_address: editingMember.home_address || '',
      core_department: editingMember.core_department || '',
      sub_department: editingMember.sub_department || '',
      role: editingMember.role || 'member',
      photo_url: editingMember.photo_url || ''
    };

    let query = supabase.from('members').update(updateData);
    
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
      await fetchMembers(); // Refresh table immediately
    }
  }

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', fontFamily: 'sans-serif' }}>
        <p>Loading Admin Dashboard...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #e5e7eb', paddingBottom: '15px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>Admin Dashboard - All Members</h1>
        <div>
          <button
            onClick={() => router.push('/portal')}
            style={{ marginRight: '10px', padding: '8px 12px', backgroundColor: '#4b5563', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            My Portal
          </button>
          <button
            onClick={async () => {
              await supabase.auth.signOut();
              router.push('/login');
            }}
            style={{ padding: '8px 12px', backgroundColor: '#ef4444', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            Logout
          </button>
        </div>
      </div>

      {editingMember && (
        <div style={{ backgroundColor: '#f9fafb', border: '1px solid #d1d5db', padding: '20px', borderRadius: '8px', marginBottom: '25px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '15px', color: '#1f2937' }}>
            Edit Member: {editingMember.first_name} {editingMember.last_name}
          </h3>
          <form onSubmit={handleUpdate} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '15px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>Prefix</label>
              <input
                type="text"
                value={editingMember.prefix || ''}
                onChange={e => setEditingMember({ ...editingMember, prefix: e.target.value })}
                style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>First Name</label>
              <input
                type="text"
                value={editingMember.first_name || ''}
                onChange={e => setEditingMember({ ...editingMember, first_name: e.target.value })}
                style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>Last Name</label>
              <input
                type="text"
                value={editingMember.last_name || ''}
                onChange={e => setEditingMember({ ...editingMember, last_name: e.target.value })}
                style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>Email</label>
              <input
                type="email"
                value={editingMember.email || ''}
                onChange={e => setEditingMember({ ...editingMember, email: e.target.value })}
                style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>Phone</label>
              <input
                type="text"
                value={editingMember.phone || ''}
                onChange={e => setEditingMember({ ...editingMember, phone: e.target.value })}
                style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>Date of Birth</label>
              <input
                type="date"
                value={editingMember.date_of_birth || ''}
                onChange={e => setEditingMember({ ...editingMember, date_of_birth: e.target.value })}
                style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
              />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>Home Address</label>
              <input
                type="text"
                value={editingMember.home_address || ''}
                onChange={e => setEditingMember({ ...editingMember, home_address: e.target.value })}
                style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>Core Department</label>
              <input
                type="text"
                value={editingMember.core_department || ''}
                onChange={e => setEditingMember({ ...editingMember, core_department: e.target.value })}
                style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>Sub Department</label>
              <input
                type="text"
                value={editingMember.sub_department || ''}
                onChange={e => setEditingMember({ ...editingMember, sub_department: e.target.value })}
                style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>Photo URL</label>
              <input
                type="text"
                placeholder="Paste image link here"
                value={editingMember.photo_url || ''}
                onChange={e => setEditingMember({ ...editingMember, photo_url: e.target.value })}
                style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>Role</label>
              <select
                value={editingMember.role || 'member'}
                onChange={e => setEditingMember({ ...editingMember, role: e.target.value })}
                style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
              >
                <option value="member">Member</option>
                <option value="admin">Admin</option>
                <option value="super_admin">Super Admin</option>
              </select>
            </div>
            <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '10px', marginTop: '10px' }}>
              <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#10b981', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                Save Changes
              </button>
              <button type="button" onClick={() => setEditingMember(null)} style={{ padding: '10px 20px', backgroundColor: '#6b7280', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', borderRadius: '8px', overflow: 'hidden' }}>
          <thead>
            <tr style={{ backgroundColor: '#f3f4f6', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>
              <th style={{ padding: '12px' }}>Avatar</th>
              <th style={{ padding: '12px' }}>Name</th>
              <th style={{ padding: '12px' }}>Email & Phone</th>
              <th style={{ padding: '12px' }}>Address & DOB</th>
              <th style={{ padding: '12px' }}>Department</th>
              <th style={{ padding: '12px' }}>Role</th>
              <th style={{ padding: '12px', textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {members.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ padding: '20px', textAlign: 'center', color: '#6b7280' }}>No members found in the database.</td>
              </tr>
            ) : (
              members.map(m => (
                <tr key={m.id || m.email} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: '12px' }}>
                    {m.photo_url ? (
                      <img src={m.photo_url} alt="Avatar" style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#e0e7ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 'bold', color: '#3730a3' }}>
                        {m.first_name?.[0] || 'M'}
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '12px' }}>{m.prefix} {m.first_name} {m.last_name}</td>
                  <td style={{ padding: '12px' }}>
                    <div style={{ fontSize: '13px' }}>{m.email}</div>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>{m.phone || 'N/A'}</div>
                  </td>
                  <td style={{ padding: '12px' }}>
                    <div style={{ fontSize: '13px' }}>{m.home_address || 'N/A'}</div>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>DOB: {m.date_of_birth || 'N/A'}</div>
                  </td>
                  <td style={{ padding: '12px' }}>{m.core_department} / {m.sub_department}</td>
                  <td style={{ padding: '12px' }}>
                    <span style={{ padding: '4px 8px', borderRadius: '12px', fontSize: '12px', backgroundColor: m.role === 'super_admin' ? '#fee2e2' : '#e0e7ff', color: m.role === 'super_admin' ? '#991b1b' : '#3730a3', fontWeight: 'bold' }}>
                      {m.role}
                    </span>
                  </td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>
                    <button
                      onClick={() => setEditingMember({ ...m })}
                      style={{ marginRight: '8px', padding: '6px 10px', backgroundColor: '#f59e0b', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(m.id, m.email)}
                      style={{ padding: '6px 10px', backgroundColor: '#ef4444', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}
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
