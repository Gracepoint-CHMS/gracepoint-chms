'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

export default function Dashboard() {
  const [authenticated, setAuthenticated] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [passcodeError, setPasscodeError] = useState('');
  const [members, setMembers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePasscodeSubmit = (e) => {
    e.preventDefault();
    if (passcode === '1234') { // Change this passcode as needed
      setAuthenticated(true);
      setPasscodeError('');
      fetchMembers();
    } else {
      setPasscodeError('Invalid Passcode');
    }
  };

  const fetchMembers = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('members').select('*');
    if (!error && data) {
      setMembers(data);
    }
    setLoading(false);
  };

  const filteredMembers = members.filter((member) => {
    const term = searchTerm.toLowerCase();
    return (
      member.first_name?.toLowerCase().includes(term) ||
      member.last_name?.toLowerCase().includes(term) ||
      member.phone?.toLowerCase().includes(term) ||
      member.residence?.toLowerCase().includes(term)
    );
  });

  if (!authenticated) {
    return (
      <div style={{ maxWidth: '400px', margin: '4rem auto', textAlign: 'center' }}>
        <h2>Admin Access</h2>
        <form onSubmit={handlePasscodeSubmit} style={{ display: 'grid', gap: '1rem', marginTop: '1rem' }}>
          <input
            type="password"
            placeholder="Enter Admin Passcode"
            value={passcode}
            onChange={(e) => setPasscode(e.target.value)}
            style={{ padding: '0.5rem' }}
          />
          {passcodeError && <p style={{ color: 'red' }}>{passcodeError}</p>}
          <button type="submit" style={{ padding: '0.5rem', cursor: 'pointer' }}>
            Login
          </button>
        </form>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Member Directory</h2>
      <input
        type="text"
        placeholder="Search by name, phone, residence..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{ width: '100%', maxWidth: '400px', padding: '0.5rem', marginBottom: '1rem' }}
      />
      {loading ? (
        <p>Loading members...</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '2px solid #ccc' }}>
                <th style={{ padding: '0.5rem' }}>Photo</th>
                <th style={{ padding: '0.5rem' }}>Name</th>
                <th style={{ padding: '0.5rem' }}>Phone</th>
                <th style={{ padding: '0.5rem' }}>Gender</th>
                <th style={{ padding: '0.5rem' }}>DOB</th>
                <th style={{ padding: '0.5rem' }}>Marital Status</th>
                <th style={{ padding: '0.5rem' }}>Residence</th>
                <th style={{ padding: '0.5rem' }}>Occupation</th>
                <th style={{ padding: '0.5rem' }}>Ministry</th>
              </tr>
            </thead>
            <tbody>
              {filteredMembers.map((member) => (
                <tr key={member.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '0.5rem' }}>
                    {member.photo_url ? (
                      <img
                        src={member.photo_url}
                        alt={`${member.first_name}`}
                        style={{ width: '45px', height: '45px', borderRadius: '50%', objectFit: 'cover' }}
                      />
                    ) : (
                      'No Photo'
                    )}
                  </td>
                  <td style={{ padding: '0.5rem' }}>{member.first_name} {member.last_name}</td>
                  <td style={{ padding: '0.5rem' }}>{member.phone}</td>
                  <td style={{ padding: '0.5rem' }}>{member.gender}</td>
                  <td style={{ padding: '0.5rem' }}>{member.dob}</td>
                  <td style={{ padding: '0.5rem' }}>{member.marital_status}</td>
                  <td style={{ padding: '0.5rem' }}>{member.residence}</td>
                  <td style={{ padding: '0.5rem' }}>{member.occupation}</td>
                  <td style={{ padding: '0.5rem' }}>{member.ministry}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
