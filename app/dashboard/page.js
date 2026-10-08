'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';

export default function AdminDashboard() {
  const router = useRouter();
  const [members, setMembers] = useState([]);
  const [contributions, setContributions] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [events, setEvents] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  
  // Navigation tabs
  const [activeTab, setActiveTab] = useState('members');
  
  // Search & Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  // Editing state
  const [editingMember, setEditingMember] = useState(null);

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showContribModal, setShowContribModal] = useState(false);
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);

  // Form states
  const [newMember, setNewMember] = useState({
    prefix: '', first_name: '', last_name: '', email: '', phone: '',
    home_address: '', hometown: '', emergency_contact_person: '', emergency_contact_phone: '',
    date_of_birth: '', date_joined: '', date_of_baptism: '', gender: '',
    marital_status: '', core_department: '', sub_department: '', role: 'member', photo_url: ''
  });

  const [newContribution, setNewContribution] = useState({
    member_email: '', amount: '', contribution_type: 'Welfare', week_ending: '', payment_method: 'Cash', notes: ''
  });

  const [newAttendance, setNewAttendance] = useState({
    member_email: '', service_date: '', department: 'General', status: 'Present'
  });

  const [newEvent, setNewEvent] = useState({
    title: '', description: '', event_date: '', start_time: '', location: ''
  });

  const [newAnnouncement, setNewAnnouncement] = useState({
    title: '', content: '', author: 'Leadership'
  });

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    await Promise.all([
      fetchMembers(),
      fetchContributions(),
      fetchAttendance(),
      fetchEvents(),
      fetchAnnouncements()
    ]);
    setLoading(false);
  }

  async function fetchMembers() {
    const { data } = await supabase.from('members').select('*').order('created_at', { ascending: false });
    if (data) setMembers(data);
  }

  async function fetchContributions() {
    const { data } = await supabase.from('contributions').select('*').order('created_at', { ascending: false });
    if (data) setContributions(data);
  }

  async function fetchAttendance() {
    const { data } = await supabase.from('attendance').select('*').order('service_date', { ascending: false });
    if (data) setAttendance(data);
  }

  async function fetchEvents() {
    const { data } = await supabase.from('events').select('*').order('event_date', { ascending: true });
    if (data) setEvents(data);
  }

  async function fetchAnnouncements() {
    const { data } = await supabase.from('announcements').select('*').order('created_at', { ascending: false });
    if (data) setAnnouncements(data);
  }

  // Deletions
  async function handleDeleteMember(id, email) {
    if (!confirm(`Are you sure you want to delete ${email}?`)) return;
    let query = supabase.from('members').delete();
    if (id) query = query.eq('id', id);
    else query = query.eq('email', email);
    const { error } = await query;
    if (error) alert('Error: ' + error.message);
    else setMembers(members.filter(m => (id ? m.id !== id : m.email !== email)));
  }

  async function handleDeleteContribution(id) {
    if (!confirm('Delete this contribution record?')) return;
    const { error } = await supabase.from('contributions').delete().eq('id', id);
    if (error) alert('Error: ' + error.message);
    else setContributions(contributions.filter(c => c.id !== id));
  }

  async function handleDeleteAttendance(id) {
    if (!confirm('Delete this attendance record?')) return;
    const { error } = await supabase.from('attendance').delete().eq('id', id);
    if (error) alert('Error: ' + error.message);
    else setAttendance(attendance.filter(a => a.id !== id));
  }

  async function handleDeleteEvent(id) {
    if (!confirm('Delete this event?')) return;
    const { error } = await supabase.from('events').delete().eq('id', id);
    if (error) alert('Error: ' + error.message);
    else setEvents(events.filter(e => e.id !== id));
  }

  async function handleDeleteAnnouncement(id) {
    if (!confirm('Delete this announcement?')) return;
    const { error } = await supabase.from('announcements').delete().eq('id', id);
    if (error) alert('Error: ' + error.message);
    else setAnnouncements(announcements.filter(a => a.id !== id));
  }

  // Image Upload Handler using MEMBER-PHOTOS bucket
  async function handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('MEMBER-PHOTOS')
      .upload(filePath, file);

    if (uploadError) {
      alert('Error uploading image: ' + uploadError.message);
      setUploading(false);
      return;
    }

    const { data: publicUrlData } = supabase.storage
      .from('MEMBER-PHOTOS')
      .getPublicUrl(filePath);

    setEditingMember({
      ...editingMember,
      photo_url: publicUrlData.publicUrl
    });
    setUploading(false);
  }

  // Add Handlers
  async function handleAddMember(e) {
    e.preventDefault();
    const { error } = await supabase.from('members').insert([newMember]);
    if (error) alert('Error: ' + error.message);
    else {
      alert('Member added successfully!');
      setShowAddModal(false);
      fetchMembers();
    }
  }

  async function handleUpdateMember(e) {
    e.preventDefault();
    let query = supabase.from('members').update(editingMember);
    if (editingMember.id) query = query.eq('id', editingMember.id);
    else query = query.eq('email', editingMember.email);

    const { error } = await query;
    if (error) alert('Error updating member: ' + error.message);
    else {
      alert('Member updated successfully!');
      setEditingMember(null);
      fetchMembers();
    }
  }

  async function handleAddContribution(e) {
    e.preventDefault();
    const targetMember = members.find(m => m.email === newContribution.member_email);
    const payload = {
      ...newContribution,
      member_id: targetMember ? targetMember.id : null,
      amount: parseFloat(newContribution.amount),
      week_ending: newContribution.week_ending || null
    };
    const { error } = await supabase.from('contributions').insert([payload]);
    if (error) alert('Error: ' + error.message);
    else {
      alert('Contribution recorded!');
      setShowContribModal(false);
      fetchContributions();
    }
  }

  async function handleAddAttendance(e) {
    e.preventDefault();
    const targetMember = members.find(m => m.email === newAttendance.member_email);
    const payload = {
      ...newAttendance,
      member_id: targetMember ? targetMember.id : null
    };
    const { error } = await supabase.from('attendance').insert([payload]);
    if (error) alert('Error: ' + error.message);
    else {
      alert('Attendance logged successfully!');
      setShowAttendanceModal(false);
      fetchAttendance();
    }
  }

  async function handleAddEvent(e) {
    e.preventDefault();
    const { error } = await supabase.from('events').insert([newEvent]);
    if (error) alert('Error: ' + error.message);
    else {
      alert('Event published!');
      setShowEventModal(false);
      fetchEvents();
    }
  }

  async function handleAddAnnouncement(e) {
    e.preventDefault();
    const { error } = await supabase.from('announcements').insert([newAnnouncement]);
    if (error) alert('Error: ' + error.message);
    else {
      alert('Announcement broadcasted!');
      setShowAnnouncementModal(false);
      fetchAnnouncements();
    }
  }

  // Filters
  const filteredMembers = members.filter(m => {
    const fullName = `${m.first_name || ''} ${m.last_name || ''}`.toLowerCase();
    const email = (m.email || '').toLowerCase();
    return (fullName.includes(searchQuery.toLowerCase()) || email.includes(searchQuery.toLowerCase())) &&
      (departmentFilter ? m.core_department === departmentFilter : true) &&
      (roleFilter ? m.role === roleFilter : true);
  });

  const filteredContributions = contributions.filter(c => {
    const email = (c.member_email || '').toLowerCase();
    return (email.includes(searchQuery.toLowerCase()) || (c.notes || '').toLowerCase().includes(searchQuery.toLowerCase())) &&
      (typeFilter ? c.contribution_type === typeFilter : true);
  });

  // Summary Metrics
  const totalWelfare = contributions.filter(c => c.contribution_type === 'Welfare').reduce((sum, c) => sum + Number(c.amount), 0);
  const totalTithes = contributions.filter(c => c.contribution_type === 'Tithe').reduce((sum, c) => sum + Number(c.amount), 0);
  const totalOther = contributions.filter(c => c.contribution_type !== 'Welfare' && c.contribution_type !== 'Tithe').reduce((sum, c) => sum + Number(c.amount), 0);

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center' }}><p>Loading Admin Dashboard...</p></div>;
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #e5e7eb', paddingBottom: '15px', flexWrap: 'wrap', gap: '10px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>Admin Dashboard</h1>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => router.push('/portal')} style={{ backgroundColor: '#4f46e5', color: '#fff', padding: '10px 15px', borderRadius: '6px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>My Portal</button>
          <button onClick={async () => { await supabase.auth.signOut(); router.push('/login'); }} style={{ backgroundColor: '#ef4444', color: '#fff', padding: '10px 15px', borderRadius: '6px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>Logout</button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {['members', 'contributions', 'attendance', 'events', 'announcements'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{ padding: '10px 16px', backgroundColor: activeTab === tab ? '#2563eb' : '#e5e7eb', color: activeTab === tab ? '#fff' : '#374151', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', textTransform: 'capitalize' }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* TAB 1: MEMBERS */}
      {activeTab === 'members' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ display: 'flex', gap: '10px', flex: '1', flexWrap: 'wrap', minWidth: '280px' }}>
              <input type="text" placeholder="Search name or email..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ccc', flex: '1' }} />
              <select value={departmentFilter} onChange={(e) => setDepartmentFilter(e.target.value)} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}>
                <option value="">All Departments</option>
                <option value="LOVE">LOVE</option>
                <option value="UNITY">UNITY</option>
                <option value="CARE">CARE</option>
                <option value="RESPECT">RESPECT</option>
              </select>
            </div>
            <button onClick={() => setShowAddModal(true)} style={{ backgroundColor: '#10b981', color: '#fff', padding: '10px 15px', borderRadius: '6px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>+ Add New Member</button>
          </div>

          <div style={{ overflowX: 'auto', backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ backgroundColor: '#f3f4f6', borderBottom: '1px solid #e5e7eb' }}>
                  <th style={{ padding: '12px' }}>Photo & Name</th>
                  <th style={{ padding: '12px' }}>Contact & Address</th>
                  <th style={{ padding: '12px' }}>Background</th>
                  <th style={{ padding: '12px' }}>Department</th>
                  <th style={{ padding: '12px' }}>Role</th>
                  <th style={{ padding: '12px', textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredMembers.map(m => (
                  <tr key={m.id || m.email} style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '12px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      {m.photo_url ? (
                        <img src={m.photo_url} alt="Profile" style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold', color: '#6b7280' }}>
                          {(m.first_name?.[0] || '') + (m.last_name?.[0] || '')}
                        </div>
                      )}
                      <div>{m.prefix} {m.first_name} {m.last_name}</div>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <div>{m.email}</div>
                      <div style={{ fontSize: '12px', color: '#6b7280' }}>{m.phone}</div>
                      <div style={{ fontSize: '11px', color: '#4b5563' }}>📍 {m.home_address || 'N/A'}, {m.hometown || ''}</div>
                    </td>
                    <td style={{ padding: '12px', fontSize: '12px', color: '#4b5563' }}>
                      <div>Gender: {m.gender || 'N/A'}</div>
                      <div>Marital: {m.marital_status || 'N/A'}</div>
                      <div>Emergency: {m.emergency_contact_person || 'N/A'} ({m.emergency_contact_phone || 'N/A'})</div>
                    </td>
                    <td style={{ padding: '12px' }}>{m.core_department} / {m.sub_department}</td>
                    <td style={{ padding: '12px' }}><span style={{ padding: '4px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold', backgroundColor: '#f3f4f6' }}>{m.role}</span></td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <button onClick={() => setEditingMember({ ...m })} style={{ marginRight: '8px', padding: '6px 10px', backgroundColor: '#f59e0b', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>Edit</button>
                      <button onClick={() => handleDeleteMember(m.id, m.email)} style={{ padding: '6px 10px', backgroundColor: '#ef4444', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: CONTRIBUTIONS */}
      {activeTab === 'contributions' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '15px', marginBottom: '20px' }}>
            <div style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', padding: '15px', borderRadius: '8px' }}>
              <h4 style={{ fontSize: '14px', color: '#1e40af', marginBottom: '5px' }}>Total Weekly Welfare</h4>
              <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#1e3a8a' }}>GHS {totalWelfare.toFixed(2)}</p>
            </div>
            <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', padding: '15px', borderRadius: '8px' }}>
              <h4 style={{ fontSize: '14px', color: '#166534', marginBottom: '5px' }}>Total Tithes</h4>
              <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#14532d' }}>GHS {totalTithes.toFixed(2)}</p>
            </div>
            <div style={{ backgroundColor: '#fdf4ff', border: '1px solid #f5d0fe', padding: '15px', borderRadius: '8px' }}>
              <h4 style={{ fontSize: '14px', color: '#86198f', marginBottom: '5px' }}>Other Giving & Dues</h4>
              <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#701a75' }}>GHS {totalOther.toFixed(2)}</p>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', flexWrap: 'wrap', gap: '10px' }}>
            <input type="text" placeholder="Search email or notes..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ccc', flex: '1', minWidth: '200px' }} />
            <button onClick={() => setShowContribModal(true)} style={{ backgroundColor: '#10b981', color: '#fff', padding: '10px 15px', borderRadius: '6px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>+ Record Contribution</button>
          </div>

          <div style={{ overflowX: 'auto', backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ backgroundColor: '#f3f4f6', borderBottom: '1px solid #e5e7eb' }}>
                  <th style={{ padding: '12px' }}>Email</th>
                  <th style={{ padding: '12px' }}>Type</th>
                  <th style={{ padding: '12px' }}>Amount</th>
                  <th style={{ padding: '12px' }}>Week Ending</th>
                  <th style={{ padding: '12px' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredContributions.map(c => (
                  <tr key={c.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '12px' }}>{c.member_email}</td>
                    <td style={{ padding: '12px' }}>{c.contribution_type}</td>
                    <td style={{ padding: '12px', fontWeight: 'bold' }}>GHS {Number(c.amount).toFixed(2)}</td>
                    <td style={{ padding: '12px' }}>{c.week_ending || 'N/A'}</td>
                    <td style={{ padding: '12px' }}><button onClick={() => handleDeleteContribution(c.id)} style={{ padding: '6px 10px', backgroundColor: '#ef4444', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>Delete</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: ATTENDANCE */}
      {activeTab === 'attendance' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 'bold' }}>Service Attendance Logs</h2>
            <button onClick={() => setShowAttendanceModal(true)} style={{ backgroundColor: '#10b981', color: '#fff', padding: '10px 15px', borderRadius: '6px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>+ Log Attendance</button>
          </div>
          <div style={{ overflowX: 'auto', backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ backgroundColor: '#f3f4f6', borderBottom: '1px solid #e5e7eb' }}>
                  <th style={{ padding: '12px' }}>Service Date</th>
                  <th style={{ padding: '12px' }}>Member Email</th>
                  <th style={{ padding: '12px' }}>Department</th>
                  <th style={{ padding: '12px' }}>Status</th>
                  <th style={{ padding: '12px', textAlign: 'center' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {attendance.map(a => (
                  <tr key={a.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '12px' }}>{a.service_date}</td>
                    <td style={{ padding: '12px' }}>{a.member_email || 'General'}</td>
                    <td style={{ padding: '12px' }}>{a.department || 'General'}</td>
                    <td style={{ padding: '12px', color: '#166534', fontWeight: 'bold' }}>{a.status}</td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <button onClick={() => handleDeleteAttendance(a.id)} style={{ padding: '6px 10px', backgroundColor: '#ef4444', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: EVENTS */}
      {activeTab === 'events' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 'bold' }}>Upcoming Church Events</h2>
            <button onClick={() => setShowEventModal(true)} style={{ backgroundColor: '#10b981', color: '#fff', padding: '10px 15px', borderRadius: '6px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>+ Create Event</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '15px' }}>
            {events.map(ev => (
              <div key={ev.id} style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '8px' }}>{ev.title}</h3>
                <p style={{ fontSize: '13px', color: '#4b5563', marginBottom: '8px' }}>{ev.description}</p>
                <div style={{ fontSize: '12px', color: '#2563eb', fontWeight: 'bold' }}>📅 {ev.event_date} {ev.start_time ? `at ${ev.start_time}` : ''}</div>
                <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>📍 {ev.location || 'Church Auditorium'}</div>
                <button onClick={() => handleDeleteEvent(ev.id)} style={{ marginTop: '12px', padding: '6px 10px', backgroundColor: '#ef4444', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}>Delete Event</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: ANNOUNCEMENTS */}
      {activeTab === 'announcements' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 'bold' }}>Broadcast Announcements</h2>
            <button onClick={() => setShowAnnouncementModal(true)} style={{ backgroundColor: '#10b981', color: '#fff', padding: '10px 15px', borderRadius: '6px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>+ Post Announcement</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {announcements.map(an => (
              <div key={an.id} style={{ backgroundColor: '#fff', padding: '15px', borderRadius: '8px', borderLeft: '4px solid #4f46e5', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 'bold' }}>{an.title}</h3>
                <p style={{ fontSize: '13px', color: '#374151', margin: '6px 0' }}>{an.content}</p>
                <div style={{ fontSize: '11px', color: '#6b7280' }}>Posted by {an.author} on {new Date(an.created_at).toLocaleDateString()}</div>
                <button onClick={() => handleDeleteAnnouncement(an.id)} style={{ marginTop: '8px', padding: '4px 8px', backgroundColor: '#ef4444', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '10px' }}>Delete</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL: EDIT MEMBER */}
      {editingMember && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, overflowY: 'auto', padding: '20px' }}>
          <div style={{ backgroundColor: '#fff', padding: '25px', borderRadius: '8px', width: '500px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3>Edit Member Details</h3>
            <form onSubmit={handleUpdateMember} style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
              <div style={{ textAlign: 'center', marginBottom: '10px' }}>
                {editingMember.photo_url ? (
                  <img src={editingMember.photo_url} alt="Profile Preview" style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', margin: '0 auto', border: '2px solid #e5e7eb' }} />
                ) : (
                  <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', color: '#6b7280', fontSize: '14px' }}>No Photo</div>
                )}
              </div>

              <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Upload New Profile Photo</label>
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleImageUpload} 
                style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px', width: '100%', boxSizing: 'border-box', backgroundColor: '#f9fafb' }} 
              />
              {uploading && <p style={{ fontSize: '12px', color: '#2563eb', margin: '0' }}>Uploading image to storage...</p>}

              <label style={{ fontSize: '12px', fontWeight: 'bold' }}>First Name</label>
              <input type="text" value={editingMember.first_name || ''} onChange={e => setEditingMember({...editingMember, first_name: e.target.value})} style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} />
              
              <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Last Name</label>
              <input type="text" value={editingMember.last_name || ''} onChange={e => setEditingMember({...editingMember, last_name: e.target.value})} style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} />
              
              <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Phone</label>
              <input type="text" value={editingMember.phone || ''} onChange={e => setEditingMember({...editingMember, phone: e.target.value})} style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} />
              
              <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Home Address</label>
              <input type="text" value={editingMember.home_address || ''} onChange={e => setEditingMember({...editingMember, home_address: e.target.value})} style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} />

              <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Hometown</label>
              <input type="text" value={editingMember.hometown || ''} onChange={e => setEditingMember({...editingMember, hometown: e.target.value})} style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} />

              <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Emergency Contact Person</label>
              <input type="text" value={editingMember.emergency_contact_person || ''} onChange={e => setEditingMember({...editingMember, emergency_contact_person: e.target.value})} style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} />

              <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Emergency Contact Phone</label>
              <input type="text" value={editingMember.emergency_contact_phone || ''} onChange={e => setEditingMember({...editingMember, emergency_contact_phone: e.target.value})} style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} />

              <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Role</label>
              <select value={editingMember.role || 'member'} onChange={e => setEditingMember({...editingMember, role: e.target.value})} style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}>
                <option value="member">Member</option>
                <option value="admin">Admin</option>
                <option value="super_admin">Super Admin</option>
              </select>

              <button type="submit" style={{ backgroundColor: '#2563eb', color: '#fff', padding: '10px', border: 'none', borderRadius: '4px', fontWeight: 'bold', marginTop: '10px', cursor: 'pointer' }}>Update Member</button>
              <button type="button" onClick={() => setEditingMember(null)} style={{ backgroundColor: '#6b7280', color: '#fff', padding: '8px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Cancel</button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: LOG ATTENDANCE */}
      {showAttendanceModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ backgroundColor: '#fff', padding: '25px', borderRadius: '8px', width: '450px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3>Log Attendance</h3>
            <form onSubmit={handleAddAttendance} style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
              <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Member Email</label>
              <input type="email" required placeholder="member@email.com" value={newAttendance.member_email} onChange={e => setNewAttendance({...newAttendance, member_email: e.target.value})} style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} />

              <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Service Date</label>
              <input type="date" required value={newAttendance.service_date} onChange={e => setNewAttendance({...newAttendance, service_date: e.target.value})} style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} />

              <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Department / Group</label>
              <select value={newAttendance.department} onChange={e => setNewAttendance({...newAttendance, department: e.target.value})} style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}>
                <option value="General">General Service</option>
                <option value="LOVE">LOVE</option>
                <option value="UNITY">UNITY</option>
                <option value="CARE">CARE</option>
                <option value="RESPECT">RESPECT</option>
              </select>

              <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Status</label>
              <select value={newAttendance.status} onChange={e => setNewAttendance({...newAttendance, status: e.target.value})} style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}>
                <option value="Present">Present</option>
                <option value="Absent">Absent</option>
                <option value="Excused">Excused</option>
              </select>

              <button type="submit" style={{ backgroundColor: '#10b981', color: '#fff', padding: '10px', border: 'none', borderRadius: '4px', fontWeight: 'bold', marginTop: '10px', cursor: 'pointer' }}>Save Attendance</button>
              <button type="button" onClick={() => setShowAttendanceModal(false)} style={{ backgroundColor: '#6b7280', color: '#fff', padding: '8px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Cancel</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
