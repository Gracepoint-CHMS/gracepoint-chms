'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

export default function DashboardPage() {
  const [members, setMembers] = useState([]);
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('ALL');
  const [subDeptFilter, setSubDeptFilter] = useState('ALL');

  useEffect(() => {
    fetchMembers();
  }, []);

  useEffect(() => {
    filterData();
  }, [searchQuery, departmentFilter, subDeptFilter, members]);

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
      updated = updated.filter((m) => m.core_value_department === departmentFilter);
    }

    if (subDeptFilter !== 'ALL') {
      updated = updated.filter((m) => m.sub_department === subDeptFilter);
    }

    setFilteredMembers(updated);
  };

  const exportToCSV = () => {
    if (filteredMembers.length === 0) return;

    const headers = [
      'First Name',
      'Last Name',
      'Phone',
      'Gender',
      'Core Department',
      'Sub Department',
      'Home Address',
      'Home Town',
      'Marital Status'
    ];

    const rows = filteredMembers.map((m) => [
      `"${m.first_name || ''}"`,
      `"${m.last_name || ''}"`,
      `"${m.phone || ''}"`,
      `"${m.gender || ''}"`,
      `"${m.core_value_department || ''}"`,
      `"${m.sub_department || ''}"`,
      `"${m.home_address || ''}"`,
      `"${m.home_town || ''}"`,
      `"${m.marital_status || ''}"`
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

  return (
    <div style={{ maxWidth: '1100px', margin: '20px auto', padding: '0 16px', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
        <h2 style={{ margin: '10px 0' }}>Gracepoint CHMS - Member Directory</h2>
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
      </div>

      {/* Filter Toolbar */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '12px',
          margin: '20px 0',
          padding: '16px',
          background: '#f9f9f9',
          borderRadius: '8px',
          border: '1px solid #ddd',
        }}
      >
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

      <p style={{ fontWeight: 'bold', color: '#555' }}>
        Total Members Found: {filteredMembers.length}
      </p>

      {loading ? (
        <p>Loading members...</p>
      ) : (
        <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px', minWidth: '600px' }}>
            <thead>
              <tr style={{ background: '#0070f3', color: '#fff', textAlign: 'left' }}>
                <th style={{ padding: '10px', border: '1px solid #ccc' }}>Full Name</th>
                <th style={{ padding: '10px', border: '1px solid #ccc' }}>Phone</th>
                <th style={{ padding: '10px', border: '1px solid #ccc' }}>Gender</th>
                <th style={{ padding: '10px', border: '1px solid #ccc' }}>Core Dept</th>
                <th style={{ padding: '10px', border: '1px solid #ccc' }}>Sub-Dept</th>
                <th style={{ padding: '10px', border: '1px solid #ccc' }}>Home Town</th>
              </tr>
            </thead>
            <tbody>
              {filteredMembers.length > 0 ? (
                filteredMembers.map((m, idx) => (
                  <tr key={m.id || idx} style={{ background: idx % 2 === 0 ? '#fff' : '#f4f4f4' }}>
                    <td style={{ padding: '10px', border: '1px solid #ccc', fontWeight: '500' }}>
                      {`${m.first_name || ''} ${m.last_name || ''}`}
                    </td>
                    <td style={{ padding: '10px', border: '1px solid #ccc' }}>{m.phone || '-'}</td>
                    <td style={{ padding: '10px', border: '1px solid #ccc' }}>{m.gender || '-'}</td>
                    <td style={{ padding: '10px', border: '1px solid #ccc' }}>{m.core_value_department || '-'}</td>
                    <td style={{ padding: '10px', border: '1px solid #ccc' }}>{m.sub_department || '-'}</td>
                    <td style={{ padding: '10px', border: '1px solid #ccc' }}>{m.home_town || '-'}</td>
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
    </div>
  );
}
