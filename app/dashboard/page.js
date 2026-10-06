'use client';

import { useState, useEffect } from 'react';

export default function EditMemberModal({ member, isOpen, onClose, onRefresh }) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    coreDept: '',
    subDept: '',
    role: '',
  });
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Populate form fields when a member is selected
  useEffect(() => {
    if (member) {
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
    }
  }, [member]);

  if (!isOpen || !member) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      // 1. Update basic member information in Supabase / DB
      const updateRes = await fetch(`/api/admin/members/${member.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!updateRes.ok) {
        const errData = await updateRes.json();
        throw new Error(errData.message || 'Failed to update member profile.');
      }

      // 2. If a new password was provided, reset it via the admin API endpoint
      if (newPassword.trim().length > 0) {
        if (newPassword.trim().length < 6) {
          throw new Error('Password must be at least 6 characters long.');
        }

        const pwdRes = await fetch('/api/admin/reset-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: member.id,
            newPassword: newPassword.trim(),
          }),
        });

        const pwdData = await pwdRes.json();

        if (!pwdRes.ok) {
          throw new Error(pwdData.error || 'Failed to reset member password.');
        }
      }

      // Success
      setLoading(false);
      onRefresh(); // Refresh member list in parent component
      onClose();   // Close modal
    } catch (err) {
      setLoading(false);
      setErrorMsg(err.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4 text-center">Edit Member Details</h2>

        {/* Profile Image Header */}
        <div className="flex flex-col items-center mb-4">
          <div className="w-20 h-20 rounded-full overflow-hidden mb-2 border-2 border-blue-500">
            <img
              src={member.photo || '/placeholder.png'}
              alt={member.name}
              className="w-full h-full object-cover"
            />
          </div>
          <button
            type="button"
            className="text-sm text-blue-600 hover:underline font-medium"
          >
            Upload / Change Photo
          </button>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 text-sm rounded-md">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Full Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Phone Number</label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Core Department</label>
            <input
              type="text"
              name="coreDept"
              value={formData.coreDept}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Sub Department</label>
            <input
              type="text"
              name="subDept"
              value={formData.subDept}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Role</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
            >
              <option value="Member">Member</option>
              <option value="Super_admin">Super_admin</option>
            </select>
          </div>

          {/* New Password Field */}
          <div className="pt-2 border-t border-gray-100">
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              Reset Password <span className="text-gray-400 font-normal">(Leave blank to keep current)</span>
            </label>
            <input
              type="password"
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 outline-none"
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
              onClick={onClose}
              disabled={loading}
              className="flex-1 bg-gray-500 text-white py-2 rounded-md font-medium text-sm hover:bg-gray-600 disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
