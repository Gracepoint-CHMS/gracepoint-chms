'use client';

import { useState, useEffect } from 'react';

export default function DashboardPage() {
  const [members, setMembers] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    coreDept: '',
    subDept: '',
    role: '',
  });
  const [newPassword, setNewPassword] = useState('');

  const fetchMembers = async () => {
    try {
      const res = await fetch('/api/admin/members');
      if (res.ok) {
        const data = await res.json();
        setMembers(data.members || []);
      }
    } catch (err) {
      console.error('Failed to fetch members:', err);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const handleEditClick = (member) => {
    setSelectedMember(member);
    setFormData({
      name: member.full_name || member.name || '',
      phone: member.phone || '',
      email: member.email || '',
      coreDept: member.core_dept || member.coreDept || '',
      subDept: member.sub_dept || member.subDept || '',
      role: member.role || 'Member',
    });
    setNewPassword('');
    setErrorMsg('');
    setIsEditModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsEditModalOpen(false);
    setSelectedMember(null);
    setNewPassword('');
    setErrorMsg('');
  };

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSaveChanges = async (e) => {
    e.preventDefault();
    if (!selectedMember) return;

    setLoading(true);
    setErrorMsg('');

    try {
      const updateRes = await fetch(`/api/admin/members/${selectedMember.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!updateRes.ok) {
        const errData = await updateRes.json();
        throw new Error(errData.message || 'Failed to update member profile.');
      }

      if (newPassword.trim().length > 0) {
        if (newPassword.trim().length < 6) {
          throw new Error('Password must be at least 6 characters long.');
        }

        const pwdRes = await fetch('/api/admin/reset-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: selectedMember.id,
            newPassword: newPassword.trim(),
          }),
        });

        const pwdData = await pwdRes.json();

        if (!pwdRes.ok) {
          throw new Error(pwdData.error || 'Failed to reset password.');
        }
      }

      setLoading(false);
      handleCloseModal();
      fetchMembers();
    } catch (err) {
      setLoading(false);
      setErrorMsg(err.message);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>Church Members Directory</h1>

      <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '8px', background: '#fff' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              <th style={{ padding: '12px' }}>Photo</th>
              <th style={{ padding: '12px' }}>Name</th>
              <th style={{ padding: '12px' }}>Email</th>
              <th style={{ padding: '12px' }}>Phone</th>
              <th style={{ padding: '12px' }}>Core Dept</th>
              <th style={{ padding: '12px' }}>Sub Dept</th>
              <th style={{ padding: '12px' }}>Role</th>
              <th style={{ padding: '12px', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {members.map((m) => (
              <tr key={m.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '12px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#cbd5e1', overflow: 'hidden' }}>
                    {m.photo ? <img src={m.photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : null}
                  </div>
                </td>
                <td style={{ padding: '12px', fontWeight: 'bold' }}>{m.full_name || m.name || '—'}</td>
                <td style={{ padding: '12px' }}>{m.email}</td>
                <td style={{ padding: '12px' }}>{m.phone || '—'}</td>
                <td style={{ padding: '12px' }}>{m.core_dept || m.coreDept || '—'}</td>
                <td style={{ padding: '12px' }}>{m.sub_dept || m.subDept || '—'}</td>
                <td style={{ padding: '12px' }}>
                  <span style={{ background: '#f1f5f9', padding: '4px 8px', borderRadius: '4px', fontSize: '12px' }}>
                    {m.role || 'Member'}
                  </span>
                </td>
                <td style={{ padding: '12px', textAlign: 'right' }}>
                  <button
                    onClick={() => handleEditClick(m)}
                    style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isEditModalOpen && selectedMember && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px'
        }}>
          <div style={{ background: '#fff', borderRadius: '12px', padding: '24px', width: '100%', maxWidth: '420px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px', textAlign: 'center' }}>Edit Member Details</h2>

            {errorMsg && (
              <div style={{ padding: '10px', background: '#fee2e2', color: '#dc2626', borderRadius: '6px', fontSize: '13px', marginBottom: '12px' }}>
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSaveChanges} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleFormChange}
                  required
                  style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '6px', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>Phone Number</label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleFormChange}
                  style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '6px', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleFormChange}
                  required
                  style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '6px', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>Core Department</label>
                <input
                  type="text"
                  name="coreDept"
                  value={formData.coreDept}
                  onChange={handleFormChange}
                  style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '6px', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>Sub Department</label>
                <input
                  type="text"
                  name="subDept"
                  value={formData.subDept}
                  onChange={handleFormChange}
                  style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '6px', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>Role</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleFormChange}
                  style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '6px', background: '#fff', boxSizing: 'border-box' }}
                >
                  <option value="Member">Member</option>
                  <option value="Super_admin">Super_admin</option>
                </select>
              </div>

              <div style={{ paddingTop: '8px', borderTop: '1px solid #eee' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>
                  Reset Password <span style={{ fontWeight: 'normal', color: '#666' }}>(Leave blank to keep current)</span>
                </label>
                <input
                  type="password"
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '6px', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '8px', paddingTop: '10px' }}>
                <button
                  type="submit"
                  disabled={loading}
                  style={{ flex: 1, background: '#059669', color: '#fff', border: 'none', padding: '10px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={loading}
                  style={{ flex: 1, background: '#6b7280', color: '#fff', border: 'none', padding: '10px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
