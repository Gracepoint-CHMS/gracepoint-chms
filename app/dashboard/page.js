'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';

export default function DashboardPage() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCoreDept, setSelectedCoreDept] = useState('');
  const [selectedSubDept, setSelectedSubDept] = useState('');

  const coreDepartments = [
    'ushering',
    'media',
    'choir',
    'protocol',
    'children',
    'evangelism',
    'prayer',
    'welfare',
  ];

  useEffect(() => {
    fetchMembers();
  }, []);

  async function fetchMembers() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('members')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching members:', error);
      } else {
        setMembers(data || []);
      }
    } catch (err) {
      console.error('Unexpected error:', err);
    } finally {
      setLoading(false);
    }
  }

  const filteredMembers = members.filter((m) => {
    const fullName = `${m.first_name || ''} ${m.last_name || ''}`.toLowerCase();
    const matchesSearch =
      fullName.includes(searchTerm.toLowerCase()) ||
      (m.phone && m.phone.includes(searchTerm));

    const matchesCore = selectedCoreDept
      ? m.core_department === selectedCoreDept
      : true;

    const matchesSub = selectedSubDept
      ? m.sub_department === selectedSubDept
      : true;

    return matchesSearch && matchesCore && matchesSub;
  });

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px', fontFamily: 'sans-serif' }}>
      <h2>Church Membership Dashboard</h2>
      
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="Search by name or phone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ padding: '8px', flex: '1', minWidth: '200px' }}
        />

        <select
          value={selectedCoreDept}
          onChange={(e) => setSelectedCoreDept(e.target.value)}
          style={{ padding: '8px' }}
        >
          <option value="">All Core Departments</option>
          {coreDepartments.map((dept) => (
            <option key={dept} value={dept}>
              {dept.charAt(0).toUpperCase() + dept.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <p>Loading members...</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#f2f2f2' }}>
                <th style={{ padding: '10px', border: '1px solid #ddd' }}>Photo</th>
                <th style={{ padding: '10px', border: '1px solid #ddd' }}>Name</th>
                <th style={{ padding: '10px', border: '1px solid #ddd' }}>Phone</th>
                <th style={{ padding: '10px', border: '1px solid #ddd' }}>Core Dept</th>
                <th style={{ padding: '10px', border: '1px solid #ddd' }}>Sub Dept</th>
              </tr>
            </thead>
            <tbody>
              {filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ padding: '10px', textAlign: 'center' }}>
                    No members found.
                  </td>
                </tr>
              ) : (
                filteredMembers.map((member) => (
                  <tr key={member.id}>
                    <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                      {member.passport_picture_url ? (
                        <img
                          src={member.passport_picture_url}
                          alt="Profile"
                          style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
                        />
                      ) : (
                        'N/A'
                      )}
                    </td>
                    <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                      {member.first_name} {member.last_name}
                    </td>
                    <td style={{ padding: '10px', border: '1px solid #ddd' }}>{member.phone}</td>
                    <td style={{ padding: '10px', border: '1px solid #ddd' }}>{member.core_department}</td>
                    <td style={{ padding: '10px', border: '1px solid #ddd' }}>{member.sub_department || '—'}</td>
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
