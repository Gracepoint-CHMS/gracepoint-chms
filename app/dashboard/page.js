'use client';

import { useState, useEffect } from 'react';

export default function DashboardPage() {
  const [members, setMembers] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Form state for member editing
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    coreDept: '',
    subDept: '',
    role: '',
  });
  const [newPassword, setNewPassword] = useState('');

  // Fetch all members on mount
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

  // Open Edit Modal
  const handleEditClick = (member) => {
    setSelectedMember(member);
    setFormData({
      name: member.name || '',
      phone: member.phone || '',
      email: member.email || '',
      coreDept: member.core_dept || '',
      subDept: member.sub_dept || '',
      role: member.role || 'Member',
    });
    setNewPassword('');
    setErrorMsg('');
    setIsEditModalOpen(true);
  };

  // Close Modal
  const handleCloseModal = () => {
    setIsEditModalOpen(false);
    setSelectedMember(null);
    setNewPassword('');
    setErrorMsg('');
  };

  // Handle Form Change
  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Save Member Details & Reset Password
  const handleSaveChanges = async (e) => {
    e.preventDefault();
    if (!selectedMember) return;

    setLoading(true);
    setErrorMsg('');

    try {
      // 1. Update basic member info
      const updateRes = await fetch(`/api/admin/members/${selectedMember.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!updateRes.ok) {
        const errData = await updateRes.json();
        throw new Error(errData.message || 'Failed to update member profile.');
      }

      // 2. If a new password was provided, trigger password reset API route
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
      fetchMembers(); // Refresh directory list
    } catch (err) {
      setLoading(false);
      setErrorMsg(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Church Members Directory</h1>
      </div>

      {/* Directory Table */}
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-sm border border-slate-200 overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
            <tr>
              <th className="p-3">Photo</th>
              <th className="p-3">Name</th>
              <th className="p-3">Email</th>
              <th className="p-3">Phone</th>
              <th className="p-3">Core Dept</th>
              <th className="p-3">Sub Dept</th>
              <th className="p-3">Role</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {members.map((m) => (
              <tr key={m.id} className="hover:bg-slate-50">
                <td className="p-3">
                  <img
                    src={m.photo || '/placeholder.png'}
                    alt={m.name}
                    className="w-10 h-10 rounded-full object-cover border border-slate-200"
                  />
                </td>
                <td className="p-3 font-semibold text-slate-800">{m.name}</td>
                <td className="p-3">{m.email}</td>
                <td className="p-3">{m.phone}</td>
                <td className="p-3 text-blue-600 font-medium">{m.core_dept || m.coreDept}</td>
                <td className="p-3">{m.sub_dept || m.subDept}</td>
                <td className="p-3">
                  <span className="px-2 py-1 rounded bg-slate-100 text-xs font-medium text-slate-600">
                    {m.role || 'Member'}
                  </span>
                </td>
                <td className="p-3 text-right space-x-2">
                  <button
                    onClick={() => handleEditClick(m)}
                    className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Member Modal */}
      {isEditModalOpen && selectedMember && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4 text-center">Edit Member Details</h2>

            {/* Photo Header */}
            <div className="flex flex-col items-center mb-4">
              <div className="w-20 h-20 rounded-full overflow-hidden mb-2 border-2 border-blue-500">
                <img
                  src={selectedMember.photo || '/placeholder.png'}
                  alt={selectedMember.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <button type="button" className="text-sm text-blue-600 hover:underline font-medium">
                Upload / Change Photo
              </button>
            </div>

            {errorMsg && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 text-sm rounded-md">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSaveChanges} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleFormChange}
                  required
                  className="w-full p-2 border border-slate-300 rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Phone Number</label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleFormChange}
                  className="w-full p-2 border border-slate-300 rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleFormChange}
                  required
                  className="w-full p-2 border border-slate-300 rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Core Department</label>
                <input
                  type="text"
                  name="coreDept"
                  value={formData.coreDept}
                  onChange={handleFormChange}
                  className="w-full p-2 border border-slate-300 rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Sub Department</label>
                <input
                  type="text"
                  name="subDept"
                  value={formData.subDept}
                  onChange={handleFormChange}
                  className="w-full p-2 border border-slate-300 rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Role</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleFormChange}
                  className="w-full p-2 border border-slate-300 rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="Member">Member</option>
                  <option value="Super_admin">Super_admin</option>
                </select>
              </div>

              {/* Password Reset Section */}
              <div className="pt-2 border-t border-slate-200">
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Reset Password <span className="text-slate-400 font-normal">(Leave blank to keep current)</span>
                </label>
                <input
                  type="password"
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-emerald-700 text-white py-2 rounded-md font-medium text-sm hover:bg-emerald-800 disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={loading}
                  className="flex-1 bg-slate-500 text-white py-2 rounded-md font-medium text-sm hover:bg-slate-600 disabled:opacity-50"
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
