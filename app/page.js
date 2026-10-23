'use client';

import { useEffect, useRef, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const CHURCH_LOGO = "/icon-512.png";

// Separate client used ONLY to create login accounts, so an admin adding a member is not signed out.
const authOnlyClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } }
);

const OPTIONAL_MEMBER_COLUMNS = ['title', 'gender', 'marital_status', 'occupation', 'number_of_children'];
const stripOptional = (p) => { const o = { ...p }; OPTIONAL_MEMBER_COLUMNS.forEach(k => { delete o[k]; }); return o; };
const missingOptional = (msg) => /title|gender|marital_status|occupation|number_of_children/i.test(msg || '');

const EMPTY_FORM = {
  first_name: '', last_name: '', email: '', phone: '', password: '',
  emergency_contact_name: '', emergency_contact_phone: '',
  title: '', role: 'member', core_department: 'LOVE', sub_departments: [],
  date_of_birth: '', date_of_baptism: '', date_joined: '',
  home_address: '', home_town: '', photo_url: '',
  gender: '', marital_status: '', occupation: '', number_of_children: ''
};


// A simple "add / list / delete" screen used for Services, Visitors and New Converts.
function RecordTab({ title, addLabel, fields, titleKey, items, onAdd, onDelete, canDelete, emptyText, theme }) {
  const blank = () => fields.reduce((o, f) => ({ ...o, [f.key]: f.options ? f.options[0] : '' }), {});
  const [show, setShow] = useState(false);
  const [form, setForm] = useState(blank());
  const box = { width: '100%', padding: '0.6rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1', boxSizing: 'border-box', backgroundColor: '#ffffff' };
  const lab = { display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#475569', marginBottom: '0.25rem' };
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#0f172a', margin: 0 }}>{title}</h3>
        <button type="button" onClick={() => setShow(!show)} style={{ backgroundColor: '#10b981', color: '#ffffff', border: 'none', padding: '0.65rem 1rem', borderRadius: '0.5rem', fontWeight: 'bold', fontSize: '0.9rem', cursor: 'pointer' }}>
          {show ? 'Cancel' : addLabel}
        </button>
      </div>

      {show && (
        <form
          onSubmit={(e) => { e.preventDefault(); onAdd({ ...form, recorded_on: new Date().toISOString().slice(0, 10) }); setForm(blank()); setShow(false); }}
          style={{ backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '0.75rem', padding: '1.25rem', marginBottom: '1.25rem' }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {fields.map(f => (
              <div key={f.key}>
                <label style={lab}>{f.label}{f.required ? ' *' : ''}</label>
                {f.options ? (
                  <select value={form[f.key]} onChange={(e) => setForm({ ...form, [f.key]: e.target.value })} style={box}>
                    {f.options.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                ) : f.type === 'textarea' ? (
                  <textarea value={form[f.key]} onChange={(e) => setForm({ ...form, [f.key]: e.target.value })} style={{ ...box, minHeight: '4rem' }} />
                ) : (
                  <input type={f.type || 'text'} required={!!f.required} value={form[f.key]} onChange={(e) => setForm({ ...form, [f.key]: e.target.value })} style={box} />
                )}
              </div>
            ))}
            <button type="submit" style={{ backgroundColor: (theme || '#2563eb'), color: '#ffffff', border: 'none', padding: '0.7rem', borderRadius: '0.375rem', fontWeight: 'bold', cursor: 'pointer', marginTop: '0.5rem' }}>Save</button>
          </div>
        </form>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {items.length > 0 ? items.map((item, i) => (
          <div key={i} style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '0.75rem', padding: '1.1rem 1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
              <h4 style={{ margin: 0, color: (theme || '#1e3a8a'), fontSize: '1rem' }}>{item[titleKey]}</h4>
              {canDelete && (
                <button type="button" onClick={() => { if (window.confirm('Delete this record?')) onDelete(i); }} style={{ backgroundColor: '#fee2e2', color: '#991b1b', border: 'none', padding: '0.25rem 0.6rem', borderRadius: '0.25rem', cursor: 'pointer', fontSize: '0.8rem' }}>Delete</button>
              )}
            </div>
            {fields.filter(f => f.key !== titleKey && item[f.key]).map(f => (
              <div key={f.key} style={{ fontSize: '0.88rem', color: '#334155', padding: '0.1rem 0', wordBreak: 'break-word' }}><strong style={{ color: '#64748b' }}>{f.label}:</strong> {f.type === 'url' ? <a href={item[f.key]} target="_blank" rel="noopener noreferrer" style={{ color: (theme || '#1e3a8a') }}>Open link</a> : item[f.key]}</div>
            ))}
          </div>
        )) : (
          <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '0.75rem', padding: '2rem', textAlign: 'center', color: '#64748b' }}>
            <p style={{ margin: 0 }}>{emptyText}</p>
          </div>
        )}
      </div>
    </div>
  );
}


const DEFAULT_SETTINGS = {
  name: 'Gracepoint Prophetic Church',
  tagline: 'The Jesus Home Church',
  phone: '',
  address: '',
  whatsapp: '',
  facebook: '',
  youtube: '',
  website: '',
  email: '',
  logo_url: '',
  theme_color: '#1e3a8a',
  services: [],
  bank: { account_number: '', account_name: '', bank_name: '', account_type: '', note: '' }
};

// Only colours that stay readable with white text on top
const THEME_PALETTE = [
  '#1e3a8a', '#1d4ed8', '#2563eb', '#0369a1', '#0e7490', '#0f766e',
  '#047857', '#15803d', '#4d7c0f', '#a16207', '#b45309', '#c2410c',
  '#b91c1c', '#be123c', '#9d174d', '#86198f', '#6b21a8', '#5b21b6',
  '#4338ca', '#334155', '#1f2937', '#7c2d12', '#134e4a', '#312e81'
];

const ASSET_CATEGORIES = ['Furniture (chairs, tables)', 'Musical Instruments', 'Sound & Media Equipment', 'Electrical & Electronics', 'Kitchen & Utensils', 'Vehicles', 'Building & Land', 'Stationery & Books', 'Other'];
const ASSET_CONDITIONS = ['New', 'Good', 'Fair', 'Needs repair', 'Out of service'];
const CONDITION_COLORS = { 'New': '#16a34a', 'Good': '#2563eb', 'Fair': '#ca8a04', 'Needs repair': '#ea580c', 'Out of service': '#dc2626' };

const sBox = { width: '100%', padding: '0.65rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1', boxSizing: 'border-box', backgroundColor: '#ffffff', fontSize: '0.95rem' };
const sLab = { display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#475569', marginBottom: '0.3rem' };

// ---------- Settings Suite (Super Admin) ----------
function SettingsPanel({ settings, onSave, onUploadLogo, message, theme }) {
  const [name, setName] = useState(settings.name);
  const [tagline, setTagline] = useState(settings.tagline);
  const [phone, setPhone] = useState(settings.phone);
  const [address, setAddress] = useState(settings.address);
  const [whatsapp, setWhatsapp] = useState(settings.whatsapp);
  const [links, setLinks] = useState({ facebook: settings.facebook || '', youtube: settings.youtube || '', website: settings.website || '', email: settings.email || '' });
  const [bank, setBank] = useState(settings.bank);
  const [svc, setSvc] = useState({ activity: '', days: '', time: '' });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');

  useEffect(() => {
    setName(settings.name); setTagline(settings.tagline); setPhone(settings.phone);
    setAddress(settings.address); setWhatsapp(settings.whatsapp); setBank(settings.bank);
    setLinks({ facebook: settings.facebook || '', youtube: settings.youtube || '', website: settings.website || '', email: settings.email || '' });
  }, [settings]);

  const card = { backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '0.75rem', padding: '1.25rem', marginBottom: '1.25rem' };
  const h = { margin: '0 0 1rem 0', fontSize: '1.1rem', fontWeight: 'bold', color: theme };
  const btn = { width: '100%', backgroundColor: theme, color: '#ffffff', border: 'none', padding: '0.7rem', borderRadius: '0.375rem', fontWeight: 'bold', cursor: 'pointer', marginTop: '0.5rem', marginBottom: '1rem' };

  return (
    <div>
      <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#0f172a', margin: '0 0 1rem 0' }}>Settings</h3>

      {message && (
        <div style={{ backgroundColor: message.startsWith('Could not') ? '#fee2e2' : '#dcfce7', color: message.startsWith('Could not') ? '#991b1b' : '#166534', padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '1rem', fontSize: '0.9rem' }}>{message}</div>
      )}

      <div style={card}>
        <h4 style={h}>Dashboard Theme</h4>
        <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: 0 }}>Tap a colour. It changes the header bars, buttons and headings for everyone.</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '0.75rem' }}>
          {THEME_PALETTE.map(c => (
            <button key={c} type="button" onClick={() => onSave({ theme_color: c }, 'Theme colour saved.')} aria-label={c}
              style={{ width: '2.4rem', height: '2.4rem', borderRadius: '50%', backgroundColor: c, border: settings.theme_color === c ? '3px solid #0f172a' : '2px solid #ffffff', boxShadow: '0 0 0 1px #cbd5e1', cursor: 'pointer', color: '#ffffff', fontWeight: 'bold', padding: 0 }}>
              {settings.theme_color === c ? '✓' : ''}
            </button>
          ))}
        </div>
      </div>

      <div style={card}>
        <h4 style={h}>Church Branding &amp; Address</h4>

        <label style={sLab}>Church name</label>
        <input style={sBox} value={name} onChange={(e) => setName(e.target.value)} />
        <button type="button" style={btn} onClick={() => onSave({ name: name.trim() || DEFAULT_SETTINGS.name }, 'Church name saved.')}>Save Name</button>

        <label style={sLab}>Tagline (shown under the name)</label>
        <input style={sBox} value={tagline} onChange={(e) => setTagline(e.target.value)} />
        <button type="button" style={btn} onClick={() => onSave({ tagline: tagline.trim() }, 'Tagline saved.')}>Save Tagline</button>

        <label style={sLab}>Church phone</label>
        <input style={sBox} type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
        <button type="button" style={btn} onClick={() => onSave({ phone: phone.trim() }, 'Phone saved.')}>Save Phone</button>

        <label style={sLab}>Church logo</label>
        <input type="file" accept="image/*" style={sBox} onChange={(e) => { const f = e.target.files && e.target.files[0]; setFile(f || null); setPreview(f ? URL.createObjectURL(f) : ''); }} />
        {(preview || settings.logo_url) && (
          <img src={preview || settings.logo_url} alt="Logo preview" style={{ width: '7rem', height: '7rem', objectFit: 'contain', border: '1px solid #cbd5e1', borderRadius: '0.5rem', marginTop: '0.75rem', backgroundColor: '#ffffff' }} />
        )}
        <button type="button" style={btn} onClick={() => { if (!file) { onSave({}, 'Could not upload: please choose a logo file first.'); return; } onUploadLogo(file); setFile(null); setPreview(''); }}>Upload Logo</button>

        <label style={sLab}>Church address</label>
        <textarea style={{ ...sBox, minHeight: '5rem' }} value={address} onChange={(e) => setAddress(e.target.value)} />
        <button type="button" style={{ ...btn, marginBottom: 0 }} onClick={() => onSave({ address: address.trim() }, 'Address saved.')}>Save Address</button>
      </div>

      <div style={card}>
        <h4 style={h}>Church Details</h4>

        <label style={sLab}>Church WhatsApp group link</label>
        <input style={sBox} value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="https://chat.whatsapp.com/..." />
        <button type="button" style={btn} onClick={() => onSave({ whatsapp: whatsapp.trim() }, 'WhatsApp link saved.')}>Save WhatsApp Link</button>

        <h4 style={{ ...h, marginTop: '0.5rem' }}>Church Activities &amp; Service Times</h4>
        {(settings.services || []).map((sv, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderBottom: '1px dashed #e2e8f0', fontSize: '0.9rem' }}>
            <span><strong>{sv.activity}</strong> - {sv.days} - {sv.time}</span>
            <button type="button" onClick={() => onSave({ services: settings.services.filter((_, idx) => idx !== i) }, 'Service removed.')} style={{ backgroundColor: '#fee2e2', color: '#991b1b', border: 'none', padding: '0.25rem 0.6rem', borderRadius: '0.25rem', cursor: 'pointer', fontSize: '0.8rem' }}>Delete</button>
          </div>
        ))}
        <div style={{ marginTop: '0.75rem' }}>
          <input style={{ ...sBox, marginBottom: '0.5rem' }} placeholder="e.g. Sunday Worship Service" value={svc.activity} onChange={(e) => setSvc({ ...svc, activity: e.target.value })} />
          <input style={{ ...sBox, marginBottom: '0.5rem' }} placeholder="e.g. Sunday" value={svc.days} onChange={(e) => setSvc({ ...svc, days: e.target.value })} />
          <input style={sBox} placeholder="e.g. 8:00am - 10:30am" value={svc.time} onChange={(e) => setSvc({ ...svc, time: e.target.value })} />
          <button type="button" style={{ ...btn, marginBottom: 0 }} onClick={() => { if (!svc.activity.trim()) return; onSave({ services: [...(settings.services || []), { activity: svc.activity.trim(), days: svc.days.trim(), time: svc.time.trim() }] }, 'Service added.'); setSvc({ activity: '', days: '', time: '' }); }}>Add Service</button>
        </div>
      </div>

      <div style={card}>
        <h4 style={h}>Social &amp; Contact Links</h4>
        <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: 0 }}>Shown to members on their dashboard so they can find your pages and videos.</p>
        <label style={sLab}>Church email</label>
        <input style={{ ...sBox, marginBottom: '0.75rem' }} type="email" value={links.email} onChange={(e) => setLinks({ ...links, email: e.target.value })} />
        <label style={sLab}>Website</label>
        <input style={{ ...sBox, marginBottom: '0.75rem' }} value={links.website} onChange={(e) => setLinks({ ...links, website: e.target.value })} placeholder="https://" />
        <label style={sLab}>Facebook page</label>
        <input style={{ ...sBox, marginBottom: '0.75rem' }} value={links.facebook} onChange={(e) => setLinks({ ...links, facebook: e.target.value })} placeholder="https://facebook.com/..." />
        <label style={sLab}>YouTube channel</label>
        <input style={sBox} value={links.youtube} onChange={(e) => setLinks({ ...links, youtube: e.target.value })} placeholder="https://youtube.com/..." />
        <button type="button" style={{ ...btn, marginBottom: 0 }} onClick={() => onSave({ facebook: links.facebook.trim(), youtube: links.youtube.trim(), website: links.website.trim(), email: links.email.trim() }, 'Links saved.')}>Save Links</button>
      </div>

      <div style={card}>
        <h4 style={h}>Giving / Bank Details</h4>
        <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: 0 }}>Members see these on their dashboard (read-only) so they know where to give.</p>
        <label style={sLab}>Account number</label>
        <input style={{ ...sBox, marginBottom: '0.75rem' }} value={bank.account_number} onChange={(e) => setBank({ ...bank, account_number: e.target.value })} />
        <label style={sLab}>Account name</label>
        <input style={{ ...sBox, marginBottom: '0.75rem' }} value={bank.account_name} onChange={(e) => setBank({ ...bank, account_name: e.target.value })} />
        <label style={sLab}>Bank / Mobile Money network</label>
        <input style={{ ...sBox, marginBottom: '0.75rem' }} value={bank.bank_name} onChange={(e) => setBank({ ...bank, bank_name: e.target.value })} />
        <label style={sLab}>Account type</label>
        <input style={{ ...sBox, marginBottom: '0.75rem' }} value={bank.account_type} onChange={(e) => setBank({ ...bank, account_type: e.target.value })} />
        <label style={sLab}>Note to givers (optional)</label>
        <input style={sBox} value={bank.note} onChange={(e) => setBank({ ...bank, note: e.target.value })} placeholder="e.g. Use your name as the reference" />
        <button type="button" style={{ ...btn, marginBottom: 0 }} onClick={() => onSave({ bank }, 'Bank details saved.')}>Save Bank Details</button>
      </div>
    </div>
  );
}

// ---------- Church Facilities Management Suite ----------
function AssetsTab({ items, onAdd, onUpdate, onDelete, isSuper, theme, onPrint }) {
  const blank = { name: '', category: ASSET_CATEGORIES[0], quantity: '1', condition: 'Good', location: '', date_acquired: '', unit_value: '', source: 'Purchased', supplier: '', serial: '', notes: '' };
  const [show, setShow] = useState(false);
  const [form, setForm] = useState(blank);
  const [editIndex, setEditIndex] = useState(null);
  const [search, setSearch] = useState('');
  const [cat, setCat] = useState('All');
  const [cond, setCond] = useState('All');
  const [lendIndex, setLendIndex] = useState(null);
  const [loan, setLoan] = useState({ borrower: '', expected_return: '', note: '' });

  const num = (v) => parseFloat(v) || 0;
  const totalQty = items.reduce((a, i) => a + num(i.quantity), 0);
  const totalValue = items.reduce((a, i) => a + num(i.quantity) * num(i.unit_value), 0);
  const attention = items.filter(i => i.condition === 'Needs repair' || i.condition === 'Out of service').length;
  const longRepairs = items.filter(i => (i.condition === 'Needs repair' || i.condition === 'Out of service') && daysSince(i.condition_since || i.recorded_on) > 30);
  const overdueLoans = items.filter(i => { const l = currentLoan(i); return l && l.expected_return && l.expected_return < todayStr(); });
  const nextTag = () => 'FAC-' + String(Math.max(0, ...items.map(i => parseInt(String(i.tag || '').replace(/\D/g, ''), 10) || 0)) + 1).padStart(4, '0');

  const shown = items.map((it, index) => ({ it, index })).filter(({ it }) =>
    (cat === 'All' || it.category === cat) &&
    (cond === 'All' || it.condition === cond) &&
    (!search.trim() || (String(it.name) + ' ' + String(it.location || '') + ' ' + String(it.tag || '')).toLowerCase().includes(search.trim().toLowerCase()))
  );

  const stat = (label, value) => (
    <div style={{ flex: '1 1 45%', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '0.6rem', padding: '0.75rem' }}>
      <div style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase' }}>{label}</div>
      <div style={{ fontSize: '1.15rem', fontWeight: 'bold', color: theme }}>{value}</div>
    </div>
  );

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', gap: '0.5rem', flexWrap: 'wrap' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#0f172a', margin: 0 }}>Church Facilities &amp; Assets</h3>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button type="button" onClick={() => onPrint(shown.map(s => s.it))} style={{ backgroundColor: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1', padding: '0.6rem 0.9rem', borderRadius: '0.5rem', fontWeight: 'bold', fontSize: '0.85rem', cursor: 'pointer' }}>🖨 Print / PDF</button>
          <button type="button" onClick={() => { setShow(!show); setEditIndex(null); setForm(blank); }} style={{ backgroundColor: '#10b981', color: '#ffffff', border: 'none', padding: '0.6rem 0.9rem', borderRadius: '0.5rem', fontWeight: 'bold', fontSize: '0.85rem', cursor: 'pointer' }}>{show ? 'Cancel' : '+ Add Item'}</button>
        </div>
      </div>

      {(longRepairs.length > 0 || overdueLoans.length > 0) && (
        <div style={{ backgroundColor: '#fff7ed', border: '1px solid #fdba74', color: '#9a3412', borderRadius: '0.6rem', padding: '0.75rem 1rem', marginBottom: '1rem', fontSize: '0.88rem', lineHeight: 1.6 }}>
          {longRepairs.length > 0 && <div>⚠ Waiting for repair for over 30 days: <strong>{longRepairs.map(i => i.name).join(', ')}</strong></div>}
          {overdueLoans.length > 0 && <div>⏰ Overdue to be returned: <strong>{overdueLoans.map(i => i.name + ' (' + currentLoan(i).borrower + ')').join(', ')}</strong></div>}
        </div>
      )}

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem', marginBottom: '1rem' }}>
        {stat('Records', items.length)}
        {stat('Total quantity', totalQty)}
        {stat('Estimated value', 'GHS ' + totalValue.toFixed(2))}
        {stat('Needs attention', attention)}
        {stat('Out on loan', items.filter(i => currentLoan(i)).length)}
      </div>

      {show && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (editIndex !== null) {
              const old = items[editIndex];
              onUpdate(editIndex, { ...form, tag: old.tag, loans: old.loans || [], condition_since: form.condition !== old.condition ? todayStr() : (old.condition_since || todayStr()) });
            } else { onAdd({ ...form, tag: nextTag(), recorded_on: todayStr(), condition_since: todayStr(), loans: [] }); }
            setForm(blank); setEditIndex(null); setShow(false);
          }}
          style={{ backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '0.75rem', padding: '1.25rem', marginBottom: '1.25rem' }}
        >
          <h4 style={{ margin: '0 0 1rem 0', color: '#0f172a' }}>{editIndex !== null ? 'Edit Item' : 'Add Item'}</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div><label style={sLab}>Item name *</label><input style={sBox} required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Plastic chairs, Keyboard, Speaker" /></div>
            <div><label style={sLab}>Category</label><select style={sBox} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>{ASSET_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div><label style={sLab}>Quantity *</label><input style={sBox} type="number" min="1" required value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} /></div>
              <div><label style={sLab}>Condition</label><select style={sBox} value={form.condition} onChange={(e) => setForm({ ...form, condition: e.target.value })}>{ASSET_CONDITIONS.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
            </div>
            <div><label style={sLab}>Location (where it is kept)</label><input style={sBox} value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="e.g. Main auditorium, Store room" /></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div><label style={sLab}>Date acquired</label><input style={sBox} type="date" value={form.date_acquired} onChange={(e) => setForm({ ...form, date_acquired: e.target.value })} /></div>
              <div><label style={sLab}>Value each (GHS)</label><input style={sBox} type="number" min="0" step="0.01" value={form.unit_value} onChange={(e) => setForm({ ...form, unit_value: e.target.value })} /></div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div><label style={sLab}>Source</label><select style={sBox} value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })}><option>Purchased</option><option>Donated</option><option>Other</option></select></div>
              <div><label style={sLab}>Supplier / Donor</label><input style={sBox} value={form.supplier} onChange={(e) => setForm({ ...form, supplier: e.target.value })} /></div>
            </div>
            <div><label style={sLab}>Serial number (if any)</label><input style={sBox} value={form.serial} onChange={(e) => setForm({ ...form, serial: e.target.value })} /></div>
            <div><label style={sLab}>Notes</label><textarea style={{ ...sBox, minHeight: '4rem' }} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
            <button type="submit" style={{ backgroundColor: theme, color: '#ffffff', border: 'none', padding: '0.75rem', borderRadius: '0.375rem', fontWeight: 'bold', cursor: 'pointer' }}>{editIndex !== null ? 'Update Item' : 'Save Item'}</button>
          </div>
        </form>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
        <input style={sBox} placeholder="Search name, location or tag..." value={search} onChange={(e) => setSearch(e.target.value)} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
          <select style={sBox} value={cat} onChange={(e) => setCat(e.target.value)}><option value="All">All categories</option>{ASSET_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}</select>
          <select style={sBox} value={cond} onChange={(e) => setCond(e.target.value)}><option value="All">All conditions</option>{ASSET_CONDITIONS.map(c => <option key={c} value={c}>{c}</option>)}</select>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {shown.length > 0 ? shown.map(({ it, index }) => (
          <div key={index} style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '0.75rem', padding: '1rem 1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
              <div>
                <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{it.tag}</div>
                <h4 style={{ margin: 0, color: theme, fontSize: '1rem' }}>{it.name} <span style={{ color: '#0f172a' }}>x {it.quantity}</span></h4>
              </div>
              <span style={{ backgroundColor: CONDITION_COLORS[it.condition] || '#64748b', color: '#ffffff', fontSize: '0.72rem', fontWeight: 'bold', padding: '0.2rem 0.55rem', borderRadius: '999px', whiteSpace: 'nowrap' }}>{it.condition}</span>
            </div>
            <div style={{ fontSize: '0.86rem', color: '#334155', marginTop: '0.4rem', lineHeight: 1.6 }}>
              <div>{it.category}{it.location ? ' - ' + it.location : ''}</div>
              {it.date_acquired ? <div>Acquired: {it.date_acquired} ({it.source}{it.supplier ? ': ' + it.supplier : ''})</div> : null}
              {num(it.unit_value) > 0 ? <div>Value: GHS {num(it.unit_value).toFixed(2)} each, GHS {(num(it.unit_value) * num(it.quantity)).toFixed(2)} total</div> : null}
              {it.serial ? <div>Serial: {it.serial}</div> : null}
              {it.notes ? <div style={{ color: '#64748b' }}>{it.notes}</div> : null}
            </div>
            {(() => {
              const cl = currentLoan(it);
              const late = cl && cl.expected_return && cl.expected_return < todayStr();
              return (
                <div style={{ marginTop: '0.5rem' }}>
                  {cl ? (
                    <div style={{ fontSize: '0.86rem', color: late ? '#b91c1c' : '#334155' }}>
                      📤 Lent to <strong>{cl.borrower}</strong> on {cl.date_out}{cl.expected_return ? ' (due ' + cl.expected_return + ')' : ''}{late ? ' - OVERDUE' : ''}
                      <button type="button" onClick={() => onUpdate(index, { ...it, loans: (it.loans || []).map(l => (l === cl ? { ...l, returned_on: todayStr() } : l)) })} style={{ marginLeft: '0.6rem', backgroundColor: '#dcfce7', color: '#166534', border: 'none', padding: '0.2rem 0.6rem', borderRadius: '0.25rem', cursor: 'pointer', fontSize: '0.8rem' }}>Mark returned</button>
                    </div>
                  ) : lendIndex === index ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '0.5rem', padding: '0.75rem' }}>
                      <input style={sBox} placeholder="Borrower's name" value={loan.borrower} onChange={(e) => setLoan({ ...loan, borrower: e.target.value })} />
                      <input style={sBox} type="date" value={loan.expected_return} onChange={(e) => setLoan({ ...loan, expected_return: e.target.value })} />
                      <input style={sBox} placeholder="Note (optional)" value={loan.note} onChange={(e) => setLoan({ ...loan, note: e.target.value })} />
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button type="button" onClick={() => { if (!loan.borrower.trim()) return; onUpdate(index, { ...it, loans: [...(it.loans || []), { ...loan, borrower: loan.borrower.trim(), date_out: todayStr() }] }); setLendIndex(null); setLoan({ borrower: '', expected_return: '', note: '' }); }} style={{ backgroundColor: theme, color: '#ffffff', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '0.3rem', cursor: 'pointer', fontSize: '0.85rem' }}>Save loan</button>
                        <button type="button" onClick={() => setLendIndex(null)} style={{ backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', padding: '0.4rem 0.8rem', borderRadius: '0.3rem', cursor: 'pointer', fontSize: '0.85rem' }}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <button type="button" onClick={() => { setLendIndex(index); setLoan({ borrower: '', expected_return: '', note: '' }); }} style={{ backgroundColor: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', padding: '0.25rem 0.7rem', borderRadius: '0.25rem', cursor: 'pointer', fontSize: '0.8rem' }}>Lend out</button>
                  )}
                  {(it.loans || []).filter(l => l.returned_on).length > 0 && (
                    <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.3rem' }}>Past loans: {(it.loans || []).filter(l => l.returned_on).map(l => l.borrower + ' (' + l.date_out + ' to ' + l.returned_on + ')').join('; ')}</div>
                  )}
                </div>
              );
            })()}
            {isSuper && (
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.6rem' }}>
                <button type="button" onClick={() => { setForm({ ...blank, ...it }); setEditIndex(index); setShow(true); }} style={{ backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', padding: '0.25rem 0.7rem', borderRadius: '0.25rem', cursor: 'pointer', fontSize: '0.8rem' }}>Edit</button>
                <button type="button" onClick={() => { if (window.confirm('Delete this item?')) onDelete(index); }} style={{ backgroundColor: '#fee2e2', color: '#991b1b', border: 'none', padding: '0.25rem 0.7rem', borderRadius: '0.25rem', cursor: 'pointer', fontSize: '0.8rem' }}>Delete</button>
              </div>
            )}
          </div>
        )) : (
          <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '0.75rem', padding: '2rem', textAlign: 'center', color: '#64748b' }}>
            <p style={{ margin: 0 }}>{items.length === 0 ? 'No facilities or assets recorded yet.' : 'No items match your search.'}</p>
          </div>
        )}
      </div>
    </div>
  );
}


const DEFAULT_ACCOUNT_NOTES = 'All financial activities are reconciled and audited weekly.';
const DEFAULT_BALANCE_NOTES = 'Assets match total equity and liabilities.';

// Records are saved in sections. Each section is one row in the app_data table.
const SECTION_DEFS = {
  finance: ['incomes', 'expenses', 'tithes', 'budgets', 'contributions', 'welfareRecords', 'welfareDates', 'openingBalance', 'accountReportNotes', 'balanceSheetNotes', 'deptBudgets'],
  attendance: ['attendanceLogs'],
  events: ['eventsList'],
  announcements: ['announcementsList'],
  services: ['servicesList'],
  visitors: ['visitorsList'],
  converts: ['convertsList'],
  assets: ['assetsList'],
  leaders: ['leadersList'],
  rotas: ['rotasList'],
  videos: ['videosList'],
  fellowships: ['fellowshipsList', 'branchesList', 'groupsList'],
  pledges: ['pledgesList']
};
const SECTION_WRITE_PERM = {
  finance: 'access_finance', attendance: 'record_attendance', events: 'register_events',
  announcements: 'post_announcements', services: 'register_services', visitors: 'record_visitors',
  converts: 'record_new_converts', assets: 'manage_facilities',
  leaders: 'manage_leaders', rotas: 'manage_rotas', videos: 'manage_videos',
  fellowships: 'manage_fellowships', pledges: 'access_finance'
};
const SECTION_LABELS = { finance: 'Finance', attendance: 'Attendance', events: 'Events', announcements: 'Announcements', services: 'Services', visitors: 'Visitors', converts: 'New Converts', assets: 'Facilities', leaders: 'Leaders', rotas: 'Duty Rotas', videos: 'Videos', fellowships: 'Fellowships', pledges: 'Pledges' };
const FIELD_DEFAULTS = {
  incomes: [], expenses: [], tithes: [], budgets: [], contributions: [],
  welfareRecords: {}, welfareDates: {}, openingBalance: 2484.32,
  accountReportNotes: DEFAULT_ACCOUNT_NOTES, balanceSheetNotes: DEFAULT_BALANCE_NOTES,
  attendanceLogs: [], eventsList: [], announcementsList: [], servicesList: [],
  visitorsList: [], convertsList: [], assetsList: [], leadersList: [], rotasList: [], videosList: [],
  fellowshipsList: [], branchesList: [], pledgesList: [], deptBudgets: [], groupsList: []
};

const pickSection = (vals, key) => {
  const o = {};
  SECTION_DEFS[key].forEach(f => { o[f] = vals[f] === undefined ? FIELD_DEFAULTS[f] : vals[f]; });
  return o;
};
const canWriteSectionFn = (key, isSuper, perms) => !!isSuper || !!(perms && perms[SECTION_WRITE_PERM[key]]);
const canReadSectionFn = (key, isSuper, perms) =>
  !!isSuper || ['events', 'announcements', 'leaders', 'rotas', 'videos', 'fellowships'].includes(key) ||
  (key === 'finance' ? !!(perms && (perms.access_finance || perms.view_balance_sheet)) : !!(perms && perms[SECTION_WRITE_PERM[key]]));

// When two admins change the same section, keep BOTH people's additions and removals.
function mergeSection(base, local, server) {
  const out = { ...server };
  Object.keys(local).forEach(f => {
    const b = base[f];
    const l = local[f];
    const sv = server[f];
    if (Array.isArray(l)) {
      const baseJ = (b || []).map(x => JSON.stringify(x));
      const localJ = l.map(x => JSON.stringify(x));
      const added = l.filter((x, i) => !baseJ.includes(localJ[i]));
      const removed = baseJ.filter(x => !localJ.includes(x));
      const kept = (sv || []).filter(x => !removed.includes(JSON.stringify(x)));
      const keptJ = kept.map(x => JSON.stringify(x));
      out[f] = [...added.filter(x => !keptJ.includes(JSON.stringify(x))), ...kept];
    } else {
      out[f] = JSON.stringify(l) !== JSON.stringify(b) ? l : sv;
    }
  });
  return out;
}

const todayStr = () => new Date().toISOString().slice(0, 10);
const currentLoan = (it) => (it.loans || []).find(l => !l.returned_on);
const daysSince = (d) => (d ? Math.floor((Date.now() - new Date(d).getTime()) / 86400000) : 0);


// ---------- Reports (Reports & Communication) ----------
// ---------- Reports: a list of report cards; each opens a window with date filters, figures, a chart and a logo PDF ----------
function ReportChart({ type, labels, values, color }) {
  if (!labels.length) return <div style={{ color: '#94a3b8', fontSize: '0.85rem', padding: '1.5rem 0', textAlign: 'center' }}>No data for this period.</div>;
  const max = Math.max(1, ...values);
  if (type === 'hbar') {
    return (
      <div>
        {labels.map((l, i) => (
          <div key={l + i} style={{ marginBottom: '0.55rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: '#334155', gap: '0.5rem' }}><span>{l}</span><strong>{values[i]}</strong></div>
            <div style={{ height: '0.6rem', backgroundColor: '#e2e8f0', borderRadius: '0.4rem', overflow: 'hidden' }}>
              <div style={{ width: (values[i] / max * 100) + '%', height: '100%', backgroundColor: color, borderRadius: '0.4rem' }} />
            </div>
          </div>
        ))}
      </div>
    );
  }
  const W = 320, H = 180, L = 38, R = 10, T = 10, B = 44;
  const n = labels.length;
  const xs = (i) => (n === 1 ? L + (W - L - R) / 2 : L + i * (W - L - R) / (n - 1));
  const ys = (v) => T + (H - T - B) * (1 - v / max);
  const pts = values.map((v, i) => xs(i) + ',' + ys(v)).join(' ');
  const step = Math.ceil(n / 7);
  const fmtTick = (v) => (v >= 1000 ? (Math.round(v / 100) / 10) + 'k' : String(Math.round(v * 10) / 10));
  return (
    <svg viewBox={'0 0 ' + W + ' ' + H} style={{ width: '100%', height: 'auto' }}>
      {[0, 0.25, 0.5, 0.75, 1].map(f => (
        <g key={f}>
          <line x1={L} x2={W - R} y1={ys(max * f)} y2={ys(max * f)} stroke="#e2e8f0" strokeWidth="1" />
          <text x={L - 4} y={ys(max * f) + 3} fontSize="9" fill="#64748b" textAnchor="end">{fmtTick(max * f)}</text>
        </g>
      ))}
      {n > 1 && <polygon points={xs(0) + ',' + ys(0) + ' ' + pts + ' ' + xs(n - 1) + ',' + ys(0)} fill={color} opacity="0.15" />}
      {n > 1 && <polyline points={pts} fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" />}
      {values.map((v, i) => <circle key={i} cx={xs(i)} cy={ys(v)} r="3.5" fill="#ffffff" stroke={color} strokeWidth="2" />)}
      {labels.map((l, i) => (i % step === 0 || i === n - 1) ? (
        <text key={i} x={xs(i)} y={H - B + 12} fontSize="9" fill="#64748b" textAnchor="end" transform={'rotate(-40 ' + xs(i) + ' ' + (H - B + 12) + ')'}>{l}</text>
      ) : null)}
    </svg>
  );
}

function ReportsTab({ members, fin, attendance, assets, visitors, converts, services, events, fellowships, branches, pledges, onBackupExcel, onBackupJson, theme, openPrint, churchName }) {
  const num = (v) => parseFloat(v) || 0;
  const sum = (arr, f) => (arr || []).reduce((a, x) => a + num(x[f]), 0);
  const thisYear = String(new Date().getFullYear());
  const thisMonth = new Date().getMonth() + 1;
  const [open, setOpen] = useState(null);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const esc = (v) => String(v == null ? '' : v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const money = (n) => 'GHS ' + num(n).toFixed(2);
  const card = { backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '0.75rem', padding: '1.1rem 1.25rem', marginBottom: '1rem' };
  const h = { margin: '0 0 0.6rem 0', fontSize: '1.05rem', fontWeight: 'bold', color: theme };
  const row = (k, v) => (<div key={k} style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem', fontSize: '0.92rem', padding: '0.25rem 0', borderBottom: '1px dashed #e2e8f0' }}><span>{k}</span><strong>{v}</strong></div>);

  const inRange = (d) => {
    const s = String(d || '').slice(0, 10);
    if (!from && !to) return true;
    if (!s) return false;
    if (from && s < from) return false;
    if (to && s > to) return false;
    return true;
  };
  const tally = (list, keyFn, valFn) => {
    const o = {};
    (list || []).forEach(x => {
      let k = String(keyFn(x) == null || keyFn(x) === '' ? 'Not set' : keyFn(x)).trim() || 'Not set';
      k = k.charAt(0).toUpperCase() + k.slice(1).toLowerCase();
      o[k] = (o[k] || 0) + (valFn ? valFn(x) : 1);
    });
    return Object.entries(o).sort((a, b) => b[1] - a[1]);
  };
  const byMonth = (list, dateKey, valFn) => {
    const o = {};
    (list || []).forEach(x => { const s = String(x[dateKey] || '').slice(0, 7); if (s.length === 7) o[s] = (o[s] || 0) + (valFn ? valFn(x) : 1); });
    const keys = Object.keys(o).sort();
    return { labels: keys, values: keys.map(k => Math.round(o[k] * 100) / 100) };
  };
  const dateLabel = from || to ? 'Period: ' + (from || 'beginning') + ' to ' + (to || 'today') : 'Period: all records';
  const tableFor = (title, head, rows) => ({ title, head, rows });

  const defs = [];
  defs.push({ id: 'members', label: 'Members', icon: '👥', build: () => {
    const inP = members.filter(m => inRange(m.date_joined));
    const kids = members.reduce((a, m) => a + num(m.number_of_children), 0);
    const g = byMonth(members.filter(m => inRange(m.date_joined)), 'date_joined');
    return {
      stats: [['Total Members', members.length], ['Registered (selected period)', inP.length], ['Total children', kids], ['Admins / Sub-admins', members.filter(m => m.role && m.role !== 'member').length]],
      groups: [['Gender', tally(members, m => m.gender)], ['Marital status', tally(members, m => m.marital_status)], ['Occupation', tally(members, m => m.occupation)]],
      chart: { title: 'Member growth over time', type: 'line', color: '#2563eb', ...g },
      table: tableFor('Members', ['Name', 'Phone', 'Gender', 'Marital', 'Occupation', 'Children', 'Joined'], (from || to ? inP : members).map(m => [displayName(m), m.phone, m.gender, m.marital_status, m.occupation, m.number_of_children, m.date_joined]))
    };
  } });
  if (visitors) defs.push({ id: 'visitors', label: 'Visitors', icon: '🙋', build: () => {
    const l = visitors.filter(v => inRange(v.date_visited));
    return { stats: [['Total visitors', l.length]], groups: [['Invited by', tally(l, v => v.invited_by)]], chart: { title: 'Visitors over time', type: 'line', color: '#0d9488', ...byMonth(l, 'date_visited') },
      table: tableFor('Visitors', ['Name', 'Phone', 'Date', 'Invited by', 'Area'], l.map(v => [v.visitor_name, v.phone, v.date_visited, v.invited_by, v.address])) };
  } });
  if (services || attendance) defs.push({ id: 'services', label: 'Service Register', icon: '📅', build: () => {
    const s = (services || []).filter(x => inRange(x.service_date));
    const a = (attendance || []).filter(x => inRange(x.service_date));
    const men = sum(a, 'men_count'), women = sum(a, 'women_count'), kids = sum(a, 'children_count');
    const chart = a.length ? { title: 'Attendance over time', type: 'line', color: '#7c3aed', ...byMonth(a, 'service_date', x => num(x.men_count) + num(x.women_count) + num(x.children_count)) }
      : { title: 'Services over time', type: 'line', color: '#7c3aed', ...byMonth(s, 'service_date') };
    return { stats: [['Services registered', s.length], ['Attendance records', a.length], ['Men', men], ['Women', women], ['Children', kids], ['Total attendance', men + women + kids]],
      groups: [['Services by type', tally(s, x => x.service_type)]], chart,
      table: tableFor('Services', ['Service', 'Date', 'Type', 'Preacher', 'Theme'], s.map(x => [x.service_name, x.service_date, x.service_type, x.preacher, x.theme])) };
  } });
  if (events) defs.push({ id: 'events', label: 'Events Register', icon: '🗓️', build: () => {
    const l = events.filter(e => inRange(e.date));
    return { stats: [['Total events', l.length]], groups: [], chart: { title: 'Events over time', type: 'line', color: '#ea580c', ...byMonth(l, 'date') },
      table: tableFor('Events', ['Event', 'Date', 'Description'], l.map(e => [e.title, e.date, e.description])) };
  } });
  if (fin) {
    defs.push({ id: 'income', label: 'Income', icon: '💰', build: () => {
      const t = fin.tithes.filter(x => inRange(x.date)), c = fin.contributions.filter(x => inRange(x.date)), o = fin.incomes.filter(x => inRange(x.date));
      const all = [...t, ...c, ...o];
      const total = sum(t, 'amount') + sum(c, 'amount') + sum(o, 'amount');
      return { stats: [['Total records', all.length], ['Total tithes', money(sum(t, 'amount'))], ['Member contributions', money(sum(c, 'amount'))], ['Other income', money(sum(o, 'amount'))], ['Grand total', money(total)]],
        groups: [['Contributions by type', tally(c, x => x.type, x => num(x.amount)).map(([k, v]) => [k, money(v)])], ['Other income by source', tally(o, x => x.source, x => num(x.amount)).map(([k, v]) => [k, money(v)])]],
        chart: { title: 'Income over time', type: 'line', color: '#16a34a', ...byMonth(all, 'date', x => num(x.amount)) },
        table: tableFor('Income records', ['Type', 'Name / source', 'Amount', 'Date'], [...t.map(x => ['Tithe', x.member_name, money(x.amount), x.date]), ...c.map(x => [x.type || 'Contribution', x.contributor, money(x.amount), x.date]), ...o.map(x => ['Income', x.source, money(x.amount), x.date])]) };
    } });
    defs.push({ id: 'expenses', label: 'Expenses', icon: '💳', build: () => {
      const l = fin.expenses.filter(x => inRange(x.date));
      return { stats: [['Total expenses', l.length], ['Total cost', money(sum(l, 'amount'))]], groups: [], chart: { title: 'Expenses over time', type: 'line', color: '#dc2626', ...byMonth(l, 'date', x => num(x.amount)) },
        table: tableFor('Expenses', ['Description', 'Amount', 'Date'], l.map(x => [x.description, money(x.amount), x.date])) };
    } });
  }
  if (visitors || converts) defs.push({ id: 'evangelism', label: 'Evangelism', icon: '📡', build: () => {
    const v = (visitors || []).filter(x => inRange(x.date_visited)), c = (converts || []).filter(x => inRange(x.date_of_conversion));
    return { stats: [['Visitors reached', v.length], ['New converts', c.length], ['Joined as members', c.filter(x => x.follow_up === 'Joined as member').length]],
      groups: [['Follow-up status', tally(c, x => x.follow_up)]], chart: { title: 'New converts over time', type: 'line', color: '#2563eb', ...byMonth(c, 'date_of_conversion') },
      table: tableFor('New converts', ['Name', 'Phone', 'Date', 'Follow-up', 'Area'], c.map(x => [x.convert_name, x.phone, x.date_of_conversion, x.follow_up, x.address])) };
  } });
  defs.push({ id: 'departments', label: 'Departments', icon: '🗂️', build: () => {
    const core = CORE_DEPARTMENTS.map(d => [d, members.filter(m => m.core_department === d).length]);
    const sub = SUB_DEPARTMENTS.map(d => [d, members.filter(m => String(m.sub_departments || '').includes(d)).length]);
    const both = [...core, ...sub].filter(([, c]) => c > 0);
    return { stats: [['Core departments', core.length], ['Sub-departments', sub.length]], groups: [['Core departments', core], ['Sub-departments', sub]],
      chart: { title: 'Members per department', type: 'hbar', color: '#6366f1', labels: both.map(x => x[0]), values: both.map(x => x[1]) },
      table: tableFor('Department members', ['Name', 'Core department', 'Sub-departments'], members.map(m => [displayName(m), m.core_department, m.sub_departments])) };
  } });
  if (assets) defs.push({ id: 'facilities', label: 'Facilities', icon: '🪑', build: () => ({
    stats: [['Asset records', assets.length], ['Total quantity', sum(assets, 'quantity')], ['Needing repair / out of service', assets.filter(i => i.condition === 'Needs repair' || i.condition === 'Out of service').length]],
    groups: [['By condition', tally(assets, i => i.condition)]], chart: { title: 'Items by condition', type: 'hbar', color: '#0891b2', labels: tally(assets, i => i.condition).map(x => x[0]), values: tally(assets, i => i.condition).map(x => x[1]) },
    table: tableFor('Assets', ['Item', 'Quantity', 'Condition'], assets.map(i => [i.item_name || i.name, i.quantity, i.condition])) }) });

  if (fellowships) defs.push({ id: 'fellowships', label: 'House Fellowship', icon: '🏠', build: () => {
    const assigned = new Set();
    fellowships.forEach(f => (f.member_ids || []).forEach(id => assigned.add(String(id))));
    const rows = fellowships.map(f => [f.name, (f.member_ids || []).length]);
    return { stats: [['Fellowships', fellowships.length], ['Members assigned', assigned.size], ['Not in a fellowship', members.filter(m => !assigned.has(String(m.id))).length]],
      groups: [['Members per fellowship', rows]],
      chart: { title: 'Members per fellowship', type: 'hbar', color: '#0d9488', labels: rows.map(r => r[0]), values: rows.map(r => r[1]) },
      table: tableFor('Fellowships', ['Name', 'Leader', 'Day', 'Time', 'Place', 'Members'], fellowships.map(f => [f.name, f.leader_name, f.meeting_day, f.meeting_time, f.location, (f.member_ids || []).length])) };
  } });
  if (branches) defs.push({ id: 'branches', label: 'Branches', icon: '🌿', build: () => ({
    stats: [['Total branches', branches.length]], groups: [],
    chart: { title: 'Branches', type: 'hbar', color: '#2563eb', labels: branches.map(b => b.name), values: branches.map(() => 1) },
    table: tableFor('Branches', ['Name', 'Pastor / overseer', 'Phone', 'Location', 'Established'], branches.map(b => [b.name, b.pastor, b.phone, b.location, b.established])) }) });
  if (pledges) defs.push({ id: 'pledges', label: 'Pledges', icon: '🤝', build: () => {
    const paidOf = (p) => (p.payments || []).reduce((a, x) => a + num(x.amount), 0);
    const pledged = sum(pledges, 'amount'), paid = pledges.reduce((a, p) => a + paidOf(p), 0);
    const per = {};
    pledges.forEach(p => { const k = p.project || 'General'; per[k] = (per[k] || 0) + paidOf(p); });
    return { stats: [['Pledges', pledges.length], ['Total pledged', money(pledged)], ['Total paid', money(paid)], ['Balance', money(pledged - paid)]],
      groups: [['Paid per project', Object.entries(per).map(([k, v]) => [k, money(v)])]],
      chart: { title: 'Paid per project (GHS)', type: 'hbar', color: '#16a34a', labels: Object.keys(per), values: Object.values(per).map(v => Math.round(v)) },
      table: tableFor('Pledges', ['Member', 'Project', 'Pledged', 'Paid', 'Balance', 'Due'], pledges.map(p => [p.member_name, p.project, money(p.amount), money(paidOf(p)), money(num(p.amount) - paidOf(p)), p.due_date])) };
  } });

  const printSummary = () => {
    let html = `<h3>Membership</h3><table><tbody><tr><td>Total members</td><td>${members.length}</td></tr><tr><td>Admins / Sub-admins</td><td>${members.filter(m => m.role && m.role !== 'member').length}</td></tr><tr><td>Joined this year</td><td>${members.filter(m => String(m.date_joined || '').startsWith(thisYear)).length}</td></tr><tr><td>Birthdays this month</td><td>${members.filter(m => m.date_of_birth && parseInt(String(m.date_of_birth).slice(5, 7), 10) === thisMonth).length}</td></tr></tbody></table>`;
    if (attendance) { const att = attendance.map(a => num(a.men_count) + num(a.women_count) + num(a.children_count)); const t = att.reduce((a, b) => a + b, 0); html += `<h3>Attendance</h3><table><tbody><tr><td>Services recorded</td><td>${att.length}</td></tr><tr><td>Total attendance</td><td>${t}</td></tr><tr><td>Average per service</td><td>${att.length ? (t / att.length).toFixed(1) : 0}</td></tr></tbody></table>`; }
    if (fin) html += `<h3>Finance</h3><table><tbody><tr><td>Total tithes</td><td>${money(sum(fin.tithes, 'amount'))}</td></tr><tr><td>Member contributions</td><td>${money(sum(fin.contributions, 'amount'))}</td></tr><tr><td>General incomes</td><td>${money(sum(fin.incomes, 'amount'))}</td></tr><tr><td>Expenses</td><td>${money(sum(fin.expenses, 'amount'))}</td></tr></tbody></table>`;
    if (visitors || converts) html += `<h3>Evangelism</h3><table><tbody><tr><td>Visitors recorded</td><td>${(visitors || []).length}</td></tr><tr><td>New converts recorded</td><td>${(converts || []).length}</td></tr></tbody></table>`;
    if (assets) html += `<h3>Facilities</h3><table><tbody><tr><td>Asset records</td><td>${assets.length}</td></tr><tr><td>Total quantity</td><td>${sum(assets, 'quantity')}</td></tr></tbody></table>`;
    openPrint('Church Summary Report', html);
  };

  const cur = defs.find(d => d.id === open);
  const data = cur ? cur.build() : null;
  const download = () => {
    const stats = `<table><tbody>${data.stats.map(([k, v]) => `<tr><td>${esc(k)}</td><td><strong>${esc(v)}</strong></td></tr>`).join('')}</tbody></table>`;
    const groups = data.groups.filter(g => g[1].length).map(([t, e]) => `<h3>${esc(t)}</h3><table><tbody>${e.map(([k, v]) => `<tr><td>${esc(k)}</td><td>${esc(v)}</td></tr>`).join('')}</tbody></table>`).join('');
    const tbl = data.table.rows.length ? `<h3>${esc(data.table.title)} (${data.table.rows.length})</h3><table><thead><tr>${data.table.head.map(x => `<th>${esc(x)}</th>`).join('')}</tr></thead><tbody>${data.table.rows.map(r => `<tr>${r.map(c => `<td>${esc(c)}</td>`).join('')}</tr>`).join('')}</tbody></table>` : '';
    openPrint(cur.label + ' Report', `<div class="sub">${esc(dateLabel)}</div>${stats}${groups}${tbl}`);
  };
  const dateBox = { padding: '0.55rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', fontSize: '0.9rem', backgroundColor: '#ffffff', flex: 1, minWidth: 0 };

  return (
    <div>
      <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#0f172a', margin: '0 0 1rem 0' }}>Reports</h3>
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
        <button type="button" onClick={printSummary} style={{ backgroundColor: theme, color: '#ffffff', border: 'none', padding: '0.7rem 1rem', borderRadius: '0.5rem', fontWeight: 'bold', cursor: 'pointer' }}>🖨 Summary Report (PDF)</button>
      </div>
      {onBackupExcel && (
        <div style={{ ...card, backgroundColor: '#f0fdf4', borderColor: '#bbf7d0' }}>
          <h4 style={h}>💾 Backup & Export (Super Admin)</h4>
          <p style={{ fontSize: '0.82rem', color: '#475569', margin: '0 0 0.6rem 0' }}>Download a copy of all church records. Keep it somewhere safe, because it contains private information.</p>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button type="button" onClick={onBackupExcel} style={{ backgroundColor: '#16a34a', color: '#ffffff', border: 'none', padding: '0.65rem 1rem', borderRadius: '0.5rem', fontWeight: 'bold', cursor: 'pointer' }}>📊 Excel backup</button>
            <button type="button" onClick={onBackupJson} style={{ backgroundColor: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1', padding: '0.65rem 1rem', borderRadius: '0.5rem', fontWeight: 'bold', cursor: 'pointer' }}>🗄️ Full data file</button>
          </div>
        </div>
      )}
      {defs.map(d => (
        <button key={d.id} type="button" onClick={() => { setOpen(d.id); }} style={{ display: 'flex', alignItems: 'center', gap: '0.9rem', width: '100%', textAlign: 'left', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '0.9rem', padding: '0.9rem 1rem', marginBottom: '0.7rem', cursor: 'pointer', fontSize: '1rem', fontWeight: 'bold', color: '#0f172a' }}>
          <span style={{ width: '2.6rem', height: '2.6rem', borderRadius: '0.7rem', backgroundColor: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem' }}>{d.icon}</span>
          <span>{d.label}</span>
        </button>
      ))}
      <p style={{ fontSize: '0.8rem', color: '#64748b' }}>Reports show only the sections you have permission to see. Every report downloads as a PDF with the church logo.</p>

      {cur && data && (
        <div onClick={() => setOpen(null)} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15,23,42,0.55)', zIndex: 60, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
          <div onClick={(e) => e.stopPropagation()} style={{ backgroundColor: '#ffffff', width: '100%', maxWidth: '40rem', maxHeight: '90vh', overflowY: 'auto', borderRadius: '1.2rem 1.2rem 0 0', padding: '1.25rem', boxSizing: 'border-box' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.3rem', color: '#0f172a' }}>{cur.label} Report</h3>
              <button type="button" onClick={() => setOpen(null)} aria-label="Close" style={{ background: 'none', border: 'none', fontSize: '1.6rem', cursor: 'pointer', color: '#475569' }}>×</button>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
              <div style={{ flex: 1 }}><div style={{ fontSize: '0.72rem', color: '#64748b', marginBottom: '0.15rem' }}>From</div><input type="date" value={from} onChange={(e) => setFrom(e.target.value)} style={{ ...dateBox, width: '100%', boxSizing: 'border-box' }} /></div>
              <div style={{ flex: 1 }}><div style={{ fontSize: '0.72rem', color: '#64748b', marginBottom: '0.15rem' }}>To</div><input type="date" value={to} onChange={(e) => setTo(e.target.value)} style={{ ...dateBox, width: '100%', boxSizing: 'border-box' }} /></div>
            </div>
            {(from || to) && <button type="button" onClick={() => { setFrom(''); setTo(''); }} style={{ background: 'none', border: 'none', color: theme, fontWeight: 'bold', cursor: 'pointer', marginBottom: '0.75rem', padding: 0 }}>Clear dates</button>}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem', marginBottom: '1rem' }}>
              {data.stats.map(([k, v]) => (
                <div key={k} style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '0.8rem', padding: '0.8rem' }}>
                  <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{k}</div>
                  <div style={{ fontSize: '1.35rem', fontWeight: 'bold', color: '#0f172a', wordBreak: 'break-word' }}>{v}</div>
                </div>
              ))}
            </div>
            {data.groups.filter(g => g[1].length).map(([t, e]) => (
              <div key={t} style={{ ...card, backgroundColor: '#f8fafc', padding: '0.9rem 1rem' }}>
                <h4 style={h}>{t}</h4>
                {e.map(([k, v]) => row(k, v))}
              </div>
            ))}
            <div style={{ ...card, backgroundColor: '#f8fafc', padding: '0.9rem 1rem' }}>
              <h4 style={h}>{data.chart.title}</h4>
              <ReportChart type={data.chart.type} labels={data.chart.labels} values={data.chart.values} color={data.chart.color} />
            </div>
            <button type="button" onClick={download} style={{ width: '100%', backgroundColor: theme, color: '#ffffff', border: 'none', padding: '0.8rem', borderRadius: '0.6rem', fontWeight: 'bold', fontSize: '0.95rem', cursor: 'pointer' }}>📥 Download {cur.label} Report (PDF with logo)</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ---------- Messages (opens the phone's own SMS / email / WhatsApp apps) ----------
function MessagesTab({ members, theme, churchName }) {
  const [audience, setAudience] = useState('all');
  const [subject, setSubject] = useState('');
  const [msg, setMsg] = useState('');
  const [copied, setCopied] = useState('');
  const [smsSign, setSmsSign] = useState(true);
  const inGroup = (m) => {
    if (audience === 'all') return true;
    if (audience === 'admins') return !!(m.role && m.role !== 'member');
    if (audience.startsWith('core:')) return m.core_department === audience.slice(5);
    if (audience.startsWith('sub:')) return String(m.sub_departments || '').includes(audience.slice(4));
    return false;
  };
  const countCore = (d) => members.filter(m => m.core_department === d).length;
  const countSub = (d) => members.filter(m => String(m.sub_departments || '').includes(d)).length;
  const pick = members.filter(inGroup);
  const phones = pick.map(m => String(m.phone || '').replace(/\s+/g, '')).filter(Boolean);
  const emails = pick.map(m => String(m.email || '').trim()).filter(Boolean);
  const month = new Date().getMonth() + 1;
  const bdays = members.filter(m => m.date_of_birth && parseInt(String(m.date_of_birth).slice(5, 7), 10) === month)
    .sort((a, b) => parseInt(String(a.date_of_birth).slice(8, 10), 10) - parseInt(String(b.date_of_birth).slice(8, 10), 10));
  const box = { width: '100%', padding: '0.65rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1', boxSizing: 'border-box', backgroundColor: '#ffffff', fontSize: '0.95rem' };
  const lab = { display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#475569', marginBottom: '0.3rem' };
  const btn = (bg) => ({ display: 'inline-block', backgroundColor: bg, color: '#ffffff', textDecoration: 'none', border: 'none', padding: '0.65rem 0.9rem', borderRadius: '0.5rem', fontWeight: 'bold', fontSize: '0.88rem', cursor: 'pointer' });
  const copy = async (text, what) => { try { await navigator.clipboard.writeText(text); setCopied(what + ' copied'); } catch (e) { prompt('Copy:', text); } };
  const body = msg || '';
  const [smsBusy, setSmsBusy] = useState(false);
  const [smsMsg, setSmsMsg] = useState('');
  const sendBulkSms = async () => {
    if (!body.trim() || !phones.length) return;
    const full = body.trim() + (smsSign ? ' - ' + churchName : '');
    if (!window.confirm('Send this SMS to ' + phones.length + ' people now? Hubtel will charge your SMS credit.')) return;
    setSmsBusy(true); setSmsMsg('Sending...');
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch('/api/sms', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + (session ? session.access_token : '') }, body: JSON.stringify({ message: full, phones }) });
      const out = await res.json().catch(() => ({}));
      if (res.ok && out.sent) setSmsMsg('Sent to ' + out.sent + ' of ' + out.total + ' people.' + (out.failed ? ' ' + out.failed + ' could not be sent' + (out.error ? ' (' + out.error + ')' : '') + '.' : ''));
      else setSmsMsg('Could not send: ' + (out.error || 'please try again.'));
    } catch (e) { setSmsMsg('Could not send: ' + e.message); }
    setSmsBusy(false);
  };
  return (
    <div>
      <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#0f172a', margin: '0 0 0.5rem 0' }}>Messages</h3>
      <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: 0 }}>Write one message, pick who gets it, then send it with your phone's SMS, email or WhatsApp. Use <b>Send SMS from app</b> to text everyone at once through Hubtel (uses your Hubtel SMS credit), or use the buttons below to send with your own phone.</p>

      <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '0.75rem', padding: '1.25rem', marginBottom: '1.25rem' }}>
        <label style={lab}>Send to</label>
        <select style={{ ...box, marginBottom: '0.75rem' }} value={audience} onChange={(e) => setAudience(e.target.value)}>
          <option value="all">All members</option>
          <option value="admins">Admins and Sub-admins</option>
          <optgroup label="Core Departments">
            {CORE_DEPARTMENTS.map(d => <option key={d} value={'core:' + d}>{d + ' (' + countCore(d) + ')'}</option>)}
          </optgroup>
          <optgroup label="Sub-Departments / Ministries">
            {SUB_DEPARTMENTS.map(d => <option key={d} value={'sub:' + d}>{d + ' (' + countSub(d) + ')'}</option>)}
          </optgroup>
        </select>
        <div style={{ fontSize: '0.85rem', color: '#475569', marginBottom: '0.75rem' }}>{pick.length} people selected - {phones.length} with phone numbers, {emails.length} with emails</div>
        <label style={lab}>Subject (for email)</label>
        <input style={{ ...box, marginBottom: '0.75rem' }} value={subject} onChange={(e) => setSubject(e.target.value)} placeholder={churchName} />
        <label style={lab}>Message</label>
        <textarea style={{ ...box, minHeight: '7rem' }} value={msg} onChange={(e) => setMsg(e.target.value)} placeholder="Type your message here..." />
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', color: '#475569', marginTop: '0.6rem' }}><input type="checkbox" checked={smsSign} onChange={(e) => setSmsSign(e.target.checked)} /> Add "- {churchName}" at the end of the SMS</label>
        <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.3rem' }}>{body.length} characters (one SMS is 160; longer messages use more credit)</div>
        <button type="button" disabled={smsBusy || !phones.length || !body.trim()} onClick={sendBulkSms} style={{ ...btn(smsBusy || !phones.length || !body.trim() ? '#94a3b8' : '#f5a623'), width: '100%', marginTop: '0.7rem', padding: '0.8rem' }}>{smsBusy ? 'Sending...' : '📲 Send SMS from app to ' + phones.length + ' people'}</button>
        {smsMsg && <div style={{ marginTop: '0.6rem', padding: '0.6rem', borderRadius: '0.4rem', fontSize: '0.88rem', backgroundColor: /^Could not/.test(smsMsg) ? '#fee2e2' : '#dcfce7', color: /^Could not/.test(smsMsg) ? '#991b1b' : '#166534' }}>{smsMsg}</div>}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.9rem' }}>
          <a href={phones.length && body ? 'sms:' + phones.join(',') + '?body=' + encodeURIComponent(body) : undefined} style={btn(phones.length && body ? '#2563eb' : '#94a3b8')}>💬 SMS</a>
          <a href={emails.length && body ? 'mailto:?bcc=' + encodeURIComponent(emails.join(',')) + '&subject=' + encodeURIComponent(subject || churchName) + '&body=' + encodeURIComponent(body) : undefined} style={btn(emails.length && body ? '#7c3aed' : '#94a3b8')}>✉️ Email</a>
          <a href={body ? 'https://wa.me/?text=' + encodeURIComponent(body) : undefined} target="_blank" rel="noopener noreferrer" style={btn(body ? '#16a34a' : '#94a3b8')}>🟢 WhatsApp</a>
          <button type="button" onClick={() => copy(phones.join(', '), 'Phone numbers')} style={btn('#475569')}>Copy numbers</button>
        </div>
        {copied && <div style={{ marginTop: '0.6rem', fontSize: '0.85rem', color: '#166534' }}>{copied}</div>}
      </div>

      <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '0.75rem', padding: '1.25rem' }}>
        <h4 style={{ margin: '0 0 0.75rem 0', color: theme }}>🎂 Birthdays this month ({bdays.length})</h4>
        {bdays.length > 0 ? bdays.map(m => {
          const nm = displayName(m);
          const wish = 'Happy birthday ' + (m.first_name || '') + '! God bless you. - ' + churchName;
          return (
            <div key={m.id || m.email} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.4rem 0', borderBottom: '1px dashed #e2e8f0', fontSize: '0.9rem' }}>
              <span>{nm} ({String(m.date_of_birth).slice(8, 10)}/{String(m.date_of_birth).slice(5, 7)})</span>
              {m.phone ? <a href={'sms:' + String(m.phone).replace(/\s+/g, '') + '?body=' + encodeURIComponent(wish)} style={{ backgroundColor: '#eff6ff', color: '#1d4ed8', textDecoration: 'none', padding: '0.25rem 0.6rem', borderRadius: '0.3rem', fontSize: '0.8rem' }}>Send wishes</a> : null}
            </div>
          );
        }) : <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>No birthdays this month.</p>}
      </div>
    </div>
  );
}


const CORE_DEPARTMENTS = ['LOVE', 'UNITY', 'CARE', 'RESPECT'];
const SUB_DEPARTMENTS = [
  'Ushering Department',
  'Choir/Music Department',
  'Prayer Warriors',
  'General Assembly',
  'Men Ministry',
  'Women Ministry',
  'Ministry Evangelical department',
  'Pastoral Ministry',
  'Children Ministry',
  'Media/IT Department'
];

// ---------- Shared helpers for the newer screens ----------
const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const todayISO = () => new Date().toISOString().slice(0, 10);

// Amount in words for receipts, e.g. 50 -> "Fifty Ghana Cedis only"
const amountInWords = (value) => {
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  const below1000 = (x) => {
    let out = '';
    if (x >= 100) { out += ones[Math.floor(x / 100)] + ' Hundred'; x %= 100; if (x) out += ' and '; }
    if (x >= 20) { out += tens[Math.floor(x / 10)]; if (x % 10) out += '-' + ones[x % 10]; }
    else if (x > 0) out += ones[x];
    return out;
  };
  const words = (n) => {
    if (n === 0) return 'Zero';
    const scales = [[1e9, 'Billion'], [1e6, 'Million'], [1e3, 'Thousand']];
    let out = '';
    for (const [size, name] of scales) {
      if (n >= size) { out += (out ? ' ' : '') + below1000(Math.floor(n / size)) + ' ' + name; n %= size; }
    }
    if (n > 0) { const rest = below1000(n); out += (out ? (n < 100 ? ' and ' : ' ') : '') + rest; }
    return out;
  };
  const total = Math.round((parseFloat(value) || 0) * 100);
  const cedis = Math.floor(total / 100), pesewas = total % 100;
  let text = '';
  if (cedis > 0 || pesewas === 0) text = words(cedis) + (cedis === 1 ? ' Ghana Cedi' : ' Ghana Cedis');
  if (pesewas > 0) text += (text ? ' and ' : '') + words(pesewas) + (pesewas === 1 ? ' Pesewa' : ' Pesewas');
  return text + ' only';
};
const RECEIPT_REG_NO = 'CG043590523';
const waNumber = (phone) => {
  const d = String(phone || '').replace(/[^0-9]/g, '');
  if (!d) return '';
  return d.startsWith('0') ? '233' + d.slice(1) : d;
};
const formBox = { width: '100%', padding: '0.6rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1', boxSizing: 'border-box', backgroundColor: '#ffffff' };
const formLab = { display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#475569', marginBottom: '0.25rem' };
const cardBox = { backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '0.75rem', padding: '1rem 1.25rem', marginBottom: '0.9rem' };
const greenBtn = { backgroundColor: '#10b981', color: '#ffffff', border: 'none', padding: '0.65rem 1rem', borderRadius: '0.5rem', fontWeight: 'bold', fontSize: '0.9rem', cursor: 'pointer' };
const sortedMembers = (members) => [...members].sort((a, b) => String((a.first_name || '') + (a.last_name || '')).localeCompare(String((b.first_name || '') + (b.last_name || ''))));
const memberNo = (m) => 'GPC-' + String(m.id || '').replace(/-/g, '').slice(0, 6).toUpperCase();

function qrSvgString(text, px) {
  const m = makeQrMatrix(text);
  const q = 2, t = m.length + q * 2;
  let d = '';
  m.forEach((row, y) => row.forEach((v, x) => { if (v) d += 'M' + (x + q) + ',' + (y + q) + 'h1v1h-1z'; }));
  return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + t + ' ' + t + '" width="' + px + '" height="' + px + '" shape-rendering="crispEdges"><rect width="' + t + '" height="' + t + '" fill="#fff"/><path d="' + d + '" fill="#000"/></svg>';
}

// ---------- Backup workbook (opens in Excel, WPS, Google Sheets) ----------
function buildWorkbookXml(sheets) {
  const x = (v) => String(v == null ? '' : (typeof v === 'object' ? JSON.stringify(v) : v)).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const omit = ['photo_url', 'password'];
  const body = sheets.map(s => {
    const cols = [];
    s.rows.forEach(r => Object.keys(r || {}).forEach(k => { if (!omit.includes(k) && !cols.includes(k)) cols.push(k); }));
    const cell = (v) => '<Cell><Data ss:Type="String">' + x(v).slice(0, 30000) + '</Data></Cell>';
    const head = '<Row>' + cols.map(cell).join('') + '</Row>';
    const rows = s.rows.map(r => '<Row>' + cols.map(c => cell((r || {})[c])).join('') + '</Row>').join('');
    const name = s.name.replace(/[\[\]:*?\/\\]/g, ' ').slice(0, 31);
    return '<Worksheet ss:Name="' + x(name) + '"><Table>' + (cols.length ? head : '<Row><Cell><Data ss:Type="String">No records</Data></Cell></Row>') + rows + '</Table></Worksheet>';
  }).join('');
  return '<?xml version="1.0"?><?mso-application progid="Excel.Sheet"?><Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">' + body + '</Workbook>';
}
function saveTextFile(text, filename, mime) {
  const blob = new Blob([text], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

// ---------- Activity log summary: what changed between the saved copy and the new copy ----------
const ACTIVITY_LABEL_KEYS = ['member_name', 'contributor', 'source', 'description', 'title', 'name', 'visitor_name', 'convert_name', 'leader_name', 'rota_name', 'service_name', 'item', 'project'];
function summarizeChange(base, local) {
  const parts = [];
  const J = (v) => JSON.stringify(v);
  const labelOf = (it) => { for (const k of ACTIVITY_LABEL_KEYS) { if (it && it[k]) return String(it[k]); } return 'entry'; };
  Object.keys(local || {}).forEach(f => {
    const b = base ? base[f] : undefined;
    const l = local[f];
    const nice = f.replace(/List$/, '').replace(/([A-Z])/g, ' $1').toLowerCase();
    if (Array.isArray(l)) {
      const bArr = Array.isArray(b) ? b : [];
      const bs = new Set(bArr.map(J)), ls = new Set(l.map(J));
      const added = l.filter(i => !bs.has(J(i)));
      const removed = bArr.filter(i => !ls.has(J(i)));
      if (added.length && removed.length && added.length === removed.length) parts.push('Edited ' + added.length + ' ' + nice + ': ' + added.slice(0, 3).map(labelOf).join(', '));
      else {
        if (added.length) parts.push('Added ' + nice + ': ' + added.slice(0, 3).map(labelOf).join(', ') + (added.length > 3 ? ' +' + (added.length - 3) + ' more' : ''));
        if (removed.length) parts.push('Removed ' + nice + ': ' + removed.slice(0, 3).map(labelOf).join(', ') + (removed.length > 3 ? ' +' + (removed.length - 3) + ' more' : ''));
      }
    } else if (J(b) !== J(l)) {
      parts.push('Changed ' + nice);
    }
  });
  return parts.join('; ').slice(0, 400);
}

// ---------- House Fellowship ----------
function FellowshipsTab({ items, onChange, members, theme, canDelete }) {
  const blank = { name: '', leader_id: '', leader_name: '', meeting_day: 'Wednesday', meeting_time: '', location: '', notes: '', member_ids: [] };
  const [show, setShow] = useState(false);
  const [form, setForm] = useState(blank);
  const [editIndex, setEditIndex] = useState(null);
  const [find, setFind] = useState('');
  const sorted = sortedMembers(members);
  const nameOf = (id) => { const m = members.find(x => String(x.id) === String(id)); return m ? displayName(m) : ''; };
  const assigned = new Set();
  items.forEach(f => (f.member_ids || []).forEach(id => assigned.add(String(id))));
  const unassigned = members.filter(m => !assigned.has(String(m.id))).length;
  const toggle = (id) => {
    const cur = form.member_ids || [];
    setForm({ ...form, member_ids: cur.includes(id) ? cur.filter(x => x !== id) : [...cur, id] });
  };
  const shown = sorted.filter(m => displayName(m).toLowerCase().includes(find.toLowerCase()));
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#0f172a', margin: 0 }}>House Fellowships</h3>
        <button type="button" onClick={() => { setShow(!show); setForm(blank); setEditIndex(null); }} style={greenBtn}>{show ? 'Cancel' : '+ Add Fellowship'}</button>
      </div>
      <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: 0 }}>{items.length} fellowship(s) - {unassigned} member(s) not yet in any fellowship.</p>

      {show && (
        <form onSubmit={(e) => {
          e.preventDefault();
          const leaderName = form.leader_id ? nameOf(form.leader_id) : form.leader_name;
          const item = { ...form, leader_name: leaderName };
          if (editIndex !== null) { const next = [...items]; next[editIndex] = item; onChange(next); }
          else onChange([item, ...items]);
          setForm(blank); setEditIndex(null); setShow(false);
        }} style={{ ...cardBox, border: '1px solid #cbd5e1', padding: '1.25rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div><label style={formLab}>Fellowship name *</label><input style={formBox} required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Zion House Fellowship" /></div>
            <div>
              <label style={formLab}>Fellowship leader</label>
              <select style={formBox} value={form.leader_id} onChange={(e) => setForm({ ...form, leader_id: e.target.value })}>
                <option value="">-- Select member --</option>
                {sorted.map(m => <option key={m.id} value={m.id}>{displayName(m)}</option>)}
              </select>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              <div><label style={formLab}>Meeting day</label><select style={formBox} value={form.meeting_day} onChange={(e) => setForm({ ...form, meeting_day: e.target.value })}>{DAYS.map(d => <option key={d} value={d}>{d}</option>)}</select></div>
              <div><label style={formLab}>Time</label><input style={formBox} value={form.meeting_time} onChange={(e) => setForm({ ...form, meeting_time: e.target.value })} placeholder="e.g. 6:00 PM" /></div>
            </div>
            <div><label style={formLab}>Meeting place / area</label><input style={formBox} value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} /></div>
            <div>
              <label style={formLab}>Members in this fellowship ({(form.member_ids || []).length} selected)</label>
              <input style={{ ...formBox, marginBottom: '0.4rem' }} value={find} onChange={(e) => setFind(e.target.value)} placeholder="Search name..." />
              <div style={{ maxHeight: '14rem', overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: '0.375rem', padding: '0.4rem' }}>
                {shown.map(m => (
                  <label key={m.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.3rem 0.2rem', fontSize: '0.9rem' }}>
                    <input type="checkbox" checked={(form.member_ids || []).includes(String(m.id))} onChange={() => toggle(String(m.id))} />
                    <span>{displayName(m)}</span>
                  </label>
                ))}
              </div>
            </div>
            <div><label style={formLab}>Notes</label><textarea style={{ ...formBox, minHeight: '4rem' }} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
            <button type="submit" style={{ backgroundColor: theme, color: '#ffffff', border: 'none', padding: '0.75rem', borderRadius: '0.375rem', fontWeight: 'bold', cursor: 'pointer' }}>{editIndex !== null ? 'Update Fellowship' : 'Save Fellowship'}</button>
          </div>
        </form>
      )}

      {items.length === 0 && !show && <p style={{ color: '#64748b' }}>No house fellowships yet.</p>}
      {items.map((f, i) => (
        <div key={i} style={cardBox}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem' }}>
            <div>
              <div style={{ fontWeight: 'bold', fontSize: '1.05rem', color: '#0f172a' }}>{f.name}</div>
              <div style={{ fontSize: '0.85rem', color: '#475569' }}>Leader: {f.leader_name || 'Not set'}</div>
              <div style={{ fontSize: '0.85rem', color: '#475569' }}>{f.meeting_day}{f.meeting_time ? ' at ' + f.meeting_time : ''}{f.location ? ' - ' + f.location : ''}</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', alignItems: 'flex-end' }}>
              <button type="button" onClick={() => { setForm({ ...blank, ...f, member_ids: (f.member_ids || []).map(String) }); setEditIndex(i); setShow(true); }} style={{ backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', padding: '0.3rem 0.6rem', borderRadius: '0.3rem', fontSize: '0.8rem', fontWeight: 'bold', cursor: 'pointer' }}>✏️ Edit</button>
              {canDelete && <button type="button" onClick={() => { if (confirm('Delete this fellowship?')) onChange(items.filter((_, idx) => idx !== i)); }} style={{ backgroundColor: '#fee2e2', border: 'none', padding: '0.3rem 0.6rem', borderRadius: '0.3rem', fontSize: '0.8rem', fontWeight: 'bold', cursor: 'pointer', color: '#dc2626' }}>🗑️ Delete</button>}
            </div>
          </div>
          <div style={{ fontSize: '0.85rem', color: theme, fontWeight: 'bold', marginTop: '0.6rem' }}>{(f.member_ids || []).length} member(s)</div>
          <div style={{ fontSize: '0.82rem', color: '#64748b' }}>{(f.member_ids || []).map(nameOf).filter(Boolean).join(', ') || 'No members assigned yet.'}</div>
          {f.notes ? <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.3rem' }}>{f.notes}</div> : null}
        </div>
      ))}
    </div>
  );
}

// ---------- Follow-up of visitors and new converts ----------
function FollowUpTab({ visitors, converts, setVisitors, setConverts, theme }) {
  const [showDone, setShowDone] = useState(false);
  const vPending = (visitors || []).map((v, i) => ({ v, i })).filter(x => !x.v.followed_up);
  const vDone = (visitors || []).map((v, i) => ({ v, i })).filter(x => x.v.followed_up);
  const cPending = (converts || []).map((c, i) => ({ c, i })).filter(x => !x.c.followed_up && (x.c.follow_up || 'New') === 'New');
  const cDone = (converts || []).map((c, i) => ({ c, i })).filter(x => x.c.followed_up || (x.c.follow_up && x.c.follow_up !== 'New'));
  const markVisitor = (i) => {
    const note = prompt('Short note about the follow-up (optional):', '');
    if (note === null) return;
    setVisitors(visitors.map((v, idx) => idx === i ? { ...v, followed_up: todayISO(), follow_note: note } : v));
  };
  const markConvert = (i) => {
    const note = prompt('Short note about the follow-up (optional):', '');
    if (note === null) return;
    setConverts(converts.map((c, idx) => idx === i ? { ...c, followed_up: todayISO(), follow_note: note, follow_up: c.follow_up && c.follow_up !== 'New' ? c.follow_up : 'Contacted' } : c));
  };
  const actions = (phone) => (
    <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
      {phone ? <a href={'tel:' + String(phone).replace(/\s+/g, '')} style={{ backgroundColor: '#eff6ff', color: '#1d4ed8', textDecoration: 'none', padding: '0.35rem 0.7rem', borderRadius: '0.4rem', fontSize: '0.82rem', fontWeight: 'bold' }}>📞 Call</a> : null}
      {phone ? <a href={'https://wa.me/' + waNumber(phone)} target="_blank" rel="noopener noreferrer" style={{ backgroundColor: '#dcfce7', color: '#166534', textDecoration: 'none', padding: '0.35rem 0.7rem', borderRadius: '0.4rem', fontSize: '0.82rem', fontWeight: 'bold' }}>🟢 WhatsApp</a> : null}
    </div>
  );
  const rowCard = (key, title, sub, phone, done, onDone, note) => (
    <div key={key} style={cardBox}>
      <div style={{ fontWeight: 'bold', color: '#0f172a' }}>{title}</div>
      <div style={{ fontSize: '0.82rem', color: '#64748b' }}>{sub}</div>
      {note ? <div style={{ fontSize: '0.8rem', color: '#475569', marginTop: '0.2rem' }}>Note: {note}</div> : null}
      {done ? <div style={{ fontSize: '0.82rem', color: '#16a34a', marginTop: '0.4rem', fontWeight: 'bold' }}>✔ Followed up on {done}</div> : (
        <div>
          {actions(phone)}
          <button type="button" onClick={onDone} style={{ marginTop: '0.5rem', backgroundColor: theme, color: '#ffffff', border: 'none', padding: '0.45rem 0.9rem', borderRadius: '0.4rem', fontWeight: 'bold', fontSize: '0.82rem', cursor: 'pointer' }}>✔ Mark followed up</button>
        </div>
      )}
    </div>
  );
  return (
    <div>
      <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#0f172a', margin: '0 0 0.25rem 0' }}>Follow-up</h3>
      <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: 0 }}>People who still need a call or visit. Mark them when done.</p>
      {visitors && (
        <div>
          <h4 style={{ color: theme, margin: '1rem 0 0.5rem 0' }}>Visitors to follow up ({vPending.length})</h4>
          {vPending.length === 0 && <p style={{ color: '#64748b', fontSize: '0.9rem' }}>No visitors waiting.</p>}
          {vPending.map(({ v, i }) => rowCard('v' + i, v.visitor_name, 'Visited ' + (v.date_visited || '') + (v.invited_by ? ' - invited by ' + v.invited_by : '') + (v.address ? ' - ' + v.address : ''), v.phone, null, () => markVisitor(i)))}
        </div>
      )}
      {converts && (
        <div>
          <h4 style={{ color: theme, margin: '1rem 0 0.5rem 0' }}>New converts to follow up ({cPending.length})</h4>
          {cPending.length === 0 && <p style={{ color: '#64748b', fontSize: '0.9rem' }}>No new converts waiting.</p>}
          {cPending.map(({ c, i }) => rowCard('c' + i, c.convert_name, 'Converted ' + (c.date_of_conversion || '') + (c.address ? ' - ' + c.address : ''), c.phone, null, () => markConvert(i)))}
        </div>
      )}
      <button type="button" onClick={() => setShowDone(!showDone)} style={{ marginTop: '1rem', backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', padding: '0.5rem 1rem', borderRadius: '0.5rem', fontWeight: 'bold', cursor: 'pointer' }}>{showDone ? 'Hide' : 'Show'} completed ({(visitors ? vDone.length : 0) + (converts ? cDone.length : 0)})</button>
      {showDone && (
        <div style={{ marginTop: '0.75rem' }}>
          {visitors && vDone.map(({ v, i }) => rowCard('vd' + i, v.visitor_name, 'Visitor - ' + (v.date_visited || ''), v.phone, v.followed_up, null, v.follow_note))}
          {converts && cDone.map(({ c, i }) => rowCard('cd' + i, c.convert_name, 'New convert - ' + (c.follow_up || ''), c.phone, c.followed_up || 'earlier', null, c.follow_note))}
        </div>
      )}
    </div>
  );
}

// ---------- Pledges and giving goals ----------
function PledgesTab({ items, onChange, members, theme, isSuper, onReceipt }) {
  const blank = { project: '', member_id: '', member_name: '', amount: '', due_date: '', goal: '', payments: [] };
  const [show, setShow] = useState(false);
  const [form, setForm] = useState(blank);
  const [pay, setPay] = useState({});
  const sorted = sortedMembers(members);
  const num = (v) => parseFloat(v) || 0;
  const paidOf = (p) => (p.payments || []).reduce((a, x) => a + num(x.amount), 0);
  const projects = {};
  items.forEach(p => {
    const k = p.project || 'General';
    if (!projects[k]) projects[k] = { pledged: 0, paid: 0, goal: 0 };
    projects[k].pledged += num(p.amount); projects[k].paid += paidOf(p);
    if (num(p.goal) > projects[k].goal) projects[k].goal = num(p.goal);
  });
  const bar = (paid, total) => (
    <div style={{ height: '0.6rem', backgroundColor: '#e2e8f0', borderRadius: '0.4rem', overflow: 'hidden', margin: '0.3rem 0' }}>
      <div style={{ width: Math.min(100, total ? paid / total * 100 : 0) + '%', height: '100%', backgroundColor: paid >= total && total > 0 ? '#16a34a' : theme }} />
    </div>
  );
  const addPayment = (i) => {
    const amt = num((pay[i] || {}).amount);
    if (amt <= 0) { alert('Enter the amount paid.'); return; }
    const entry = { amount: String(amt), date: (pay[i] || {}).date || todayISO() };
    onChange(items.map((p, idx) => idx === i ? { ...p, payments: [...(p.payments || []), entry] } : p));
    setPay({ ...pay, [i]: { amount: '', date: '' } });
  };
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#0f172a', margin: 0 }}>Pledges & Giving Goals</h3>
        <button type="button" onClick={() => { setShow(!show); setForm(blank); }} style={greenBtn}>{show ? 'Cancel' : '+ Add Pledge'}</button>
      </div>
      <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: 0 }}>This screen only tracks promises and progress. When money is received, also record it under Finance so it appears in the Account Report.</p>

      {Object.keys(projects).length > 0 && (
        <div style={{ ...cardBox, backgroundColor: '#f8fafc' }}>
          <h4 style={{ margin: '0 0 0.5rem 0', color: theme }}>Projects</h4>
          {Object.entries(projects).map(([k, v]) => {
            const target = v.goal || v.pledged;
            return (
              <div key={k} style={{ marginBottom: '0.8rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}><strong>{k}</strong><span>GHS {v.paid.toFixed(2)} / {target.toFixed(2)}</span></div>
                {bar(v.paid, target)}
                <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Pledged GHS {v.pledged.toFixed(2)}{v.goal ? ' - Goal GHS ' + v.goal.toFixed(2) : ''} - {target ? Math.min(100, v.paid / target * 100).toFixed(0) : 0}% reached</div>
              </div>
            );
          })}
        </div>
      )}

      {show && (
        <form onSubmit={(e) => {
          e.preventDefault();
          const m = members.find(x => String(x.id) === String(form.member_id));
          onChange([{ ...form, member_name: m ? displayName(m) : form.member_name, recorded_on: todayISO() }, ...items]);
          setForm(blank); setShow(false);
        }} style={{ ...cardBox, border: '1px solid #cbd5e1', padding: '1.25rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div><label style={formLab}>Project / purpose *</label><input style={formBox} required value={form.project} onChange={(e) => setForm({ ...form, project: e.target.value })} placeholder="e.g. Church building" /></div>
            <div>
              <label style={formLab}>Member *</label>
              <select style={formBox} required value={form.member_id} onChange={(e) => setForm({ ...form, member_id: e.target.value })}>
                <option value="">-- Select member --</option>
                {sorted.map(m => <option key={m.id} value={m.id}>{displayName(m)}</option>)}
              </select>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              <div><label style={formLab}>Amount pledged (GHS) *</label><input style={formBox} type="number" min="1" step="0.01" required value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} /></div>
              <div><label style={formLab}>Due date</label><input style={formBox} type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} /></div>
            </div>
            <div><label style={formLab}>Project goal, all members (GHS, optional)</label><input style={formBox} type="number" min="0" step="0.01" value={form.goal} onChange={(e) => setForm({ ...form, goal: e.target.value })} /></div>
            <button type="submit" style={{ backgroundColor: theme, color: '#ffffff', border: 'none', padding: '0.75rem', borderRadius: '0.375rem', fontWeight: 'bold', cursor: 'pointer' }}>Save Pledge</button>
          </div>
        </form>
      )}

      {items.length === 0 && !show && <p style={{ color: '#64748b' }}>No pledges recorded yet.</p>}
      {items.map((p, i) => {
        const paid = paidOf(p), total = num(p.amount);
        const overdue = p.due_date && p.due_date < todayISO() && paid < total;
        return (
          <div key={i} style={cardBox}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem' }}>
              <div>
                <div style={{ fontWeight: 'bold', color: '#0f172a' }}>{p.member_name || 'Member'}</div>
                <div style={{ fontSize: '0.85rem', color: '#475569' }}>{p.project}{p.due_date ? ' - due ' + p.due_date : ''}{overdue ? ' (overdue)' : ''}</div>
              </div>
              {isSuper && <button type="button" onClick={() => { if (confirm('Delete this pledge?')) onChange(items.filter((_, idx) => idx !== i)); }} style={{ backgroundColor: '#fee2e2', border: 'none', padding: '0.3rem 0.6rem', borderRadius: '0.3rem', fontSize: '0.8rem', fontWeight: 'bold', cursor: 'pointer', color: '#dc2626', alignSelf: 'flex-start' }}>🗑️</button>}
            </div>
            {bar(paid, total)}
            <div style={{ fontSize: '0.85rem', display: 'flex', justifyContent: 'space-between' }}><span>Paid GHS {paid.toFixed(2)} of {total.toFixed(2)}</span><strong style={{ color: paid >= total ? '#16a34a' : '#b45309' }}>{paid >= total ? 'Completed' : 'Balance ' + (total - paid).toFixed(2)}</strong></div>
            {(p.payments || []).length > 0 && <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.3rem', display: 'flex', flexWrap: 'wrap', gap: '0.35rem 0.9rem' }}>{(p.payments || []).map((x, j) => <span key={j}>{x.date}: GHS {num(x.amount).toFixed(2)} {onReceipt ? <button type="button" onClick={() => onReceipt('Pledge', { member_id: p.member_id, member_name: p.member_name, project: p.project, amount: x.amount, date: x.date, pledged: p.amount, paidToDate: (p.payments || []).slice(0, j + 1).reduce((a, y) => a + num(y.amount), 0) })} style={{ marginLeft: '0.2rem', backgroundColor: '#ecfdf5', color: '#166534', border: '1px solid #86efac', padding: '0.1rem 0.4rem', borderRadius: '0.25rem', cursor: 'pointer', fontSize: '0.72rem' }}>Receipt</button> : null}</span>)}</div>}
            {paid < total && (
              <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.6rem', flexWrap: 'wrap' }}>
                <input type="number" min="0" step="0.01" placeholder="Amount paid" value={(pay[i] || {}).amount || ''} onChange={(e) => setPay({ ...pay, [i]: { ...(pay[i] || {}), amount: e.target.value } })} style={{ ...formBox, flex: 1, minWidth: '6rem', width: 'auto' }} />
                <input type="date" value={(pay[i] || {}).date || ''} onChange={(e) => setPay({ ...pay, [i]: { ...(pay[i] || {}), date: e.target.value } })} style={{ ...formBox, flex: 1, minWidth: '8rem', width: 'auto' }} />
                <button type="button" onClick={() => addPayment(i)} style={{ backgroundColor: theme, color: '#ffffff', border: 'none', padding: '0.5rem 0.9rem', borderRadius: '0.4rem', fontWeight: 'bold', cursor: 'pointer' }}>+ Payment</button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ---------- Activity log (Super Admin only) ----------
function ActivityTab({ theme }) {
  const [rows, setRows] = useState(null);
  const [err, setErr] = useState('');
  const [q, setQ] = useState('');
  const load = async () => {
    setErr('');
    const { data, error } = await supabase.from('activity_log').select('*').order('created_at', { ascending: false }).limit(300);
    if (error) { setErr('Could not load the activity log: ' + error.message + ' (has supabase-batch3.sql been run?)'); setRows([]); }
    else setRows(data || []);
  };
  useEffect(() => { load(); }, []);
  const shown = (rows || []).filter(r => (r.actor_name + ' ' + r.actor_email + ' ' + r.action + ' ' + r.detail).toLowerCase().includes(q.toLowerCase()));
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#0f172a', margin: 0 }}>Activity Log</h3>
        <button type="button" onClick={load} style={{ backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', padding: '0.5rem 0.9rem', borderRadius: '0.5rem', fontWeight: 'bold', cursor: 'pointer' }}>↻ Refresh</button>
      </div>
      <input style={{ ...formBox, marginBottom: '0.75rem' }} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by person, area or words..." />
      {err && <div style={{ backgroundColor: '#fee2e2', color: '#991b1b', padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '0.75rem', fontSize: '0.85rem' }}>{err}</div>}
      {rows === null && <p style={{ color: '#64748b' }}>Loading...</p>}
      {rows && rows.length === 0 && !err && <p style={{ color: '#64748b' }}>Nothing recorded yet. Changes made from now on will appear here.</p>}
      {shown.map(r => (
        <div key={r.id} style={{ ...cardBox, padding: '0.7rem 1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem', fontSize: '0.78rem', color: '#64748b' }}>
            <span>{new Date(r.created_at).toLocaleString()}</span>
            <strong style={{ color: theme }}>{r.action}</strong>
          </div>
          <div style={{ fontSize: '0.9rem', color: '#0f172a', marginTop: '0.2rem' }}>{r.detail}</div>
          <div style={{ fontSize: '0.78rem', color: '#64748b' }}>by {r.actor_name || r.actor_email}</div>
        </div>
      ))}
    </div>
  );
}


// ---------- Birthdays and anniversaries ----------
function celebrations(members, withinDays) {
  const out = [];
  const now = new Date();
  const t0 = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const kinds = [['date_of_birth', 'Birthday'], ['date_joined', 'Membership anniversary'], ['date_of_baptism', 'Baptism anniversary']];
  members.forEach(m => {
    kinds.forEach(([field, kind]) => {
      const v = String(m[field] || '');
      if (!/^\d{4}-\d{2}-\d{2}/.test(v)) return;
      const y0 = parseInt(v.slice(0, 4), 10), mo = parseInt(v.slice(5, 7), 10), d = parseInt(v.slice(8, 10), 10);
      let next = new Date(t0.getFullYear(), mo - 1, d);
      if (next < t0) next = new Date(t0.getFullYear() + 1, mo - 1, d);
      const daysAway = Math.round((next - t0) / 86400000);
      const years = next.getFullYear() - y0;
      if (daysAway > withinDays) return;
      if (kind !== 'Birthday' && years < 1) return;
      out.push({ m, kind, daysAway, years, label: String(mo).padStart(2, '0') + '/' + String(d).padStart(2, '0') });
    });
  });
  return out.sort((a, b) => a.daysAway - b.daysAway || String(a.m.first_name || '').localeCompare(String(b.m.first_name || '')));
}
function greetingText(c, churchName) {
  const first = c.m.first_name || '';
  if (c.kind === 'Birthday') return 'Happy birthday ' + first + '! May God bless you and grant you another wonderful year. - ' + churchName;
  if (c.kind === 'Membership anniversary') return 'Happy ' + c.years + '-year anniversary as part of ' + churchName + ', ' + first + '! Thank you for being family. God bless you.';
  return 'Happy ' + c.years + '-year baptism anniversary, ' + first + '! May you keep walking with Christ. - ' + churchName;
}

// ---------- Admin home: today's celebrations, quick numbers, attendance trend ----------
function HomeDashboard({ members, attendance, money, followUps, theme, churchName, goTo }) {
  const num = (v) => parseFloat(v) || 0;
  const cel = celebrations(members, 7);
  const today = cel.filter(c => c.daysAway === 0);
  const soon = cel.filter(c => c.daysAway > 0);
  const card = { backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '0.75rem', padding: '1rem 1.25rem', marginBottom: '1rem' };
  const h = { margin: '0 0 0.6rem 0', fontSize: '1.05rem', fontWeight: 'bold', color: theme };
  const tile = (label, value, tab) => (
    <button key={label} type="button" onClick={tab ? () => goTo(tab) : undefined} style={{ textAlign: 'left', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '0.8rem', padding: '0.8rem', cursor: tab ? 'pointer' : 'default' }}>
      <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{label}</div>
      <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#0f172a' }}>{value}</div>
    </button>
  );
  const ym = new Date().toISOString().slice(0, 7);
  const yr = String(new Date().getFullYear());
  const tiles = [tile('Members', members.length, 'members'), tile('Joined this year', members.filter(m => String(m.date_joined || '').startsWith(yr)).length, 'members')];
  const totals = (attendance || []).map(a => ({ d: String(a.service_date || ''), t: num(a.men_count) + num(a.women_count) + num(a.children_count) })).filter(x => x.d);
  if (attendance) {
    const last = [...totals].sort((a, b) => b.d.localeCompare(a.d))[0];
    tiles.push(tile('Last service attendance', last ? last.t : '-', 'attendance'));
  }
  if (money) tiles.push(tile('Income this month', 'GHS ' + [...money.tithes, ...money.contributions, ...money.incomes].filter(x => String(x.date || '').startsWith(ym)).reduce((a, x) => a + num(x.amount), 0).toFixed(2), 'contributions'));
  if (followUps !== null) tiles.push(tile('Waiting for follow-up', followUps, 'followup'));

  // weekly attendance for the last 8 weeks (weeks start on Monday)
  const weekStart = (d) => { const dt = new Date(d + 'T00:00:00'); const day = (dt.getDay() + 6) % 7; dt.setDate(dt.getDate() - day); return dt.toISOString().slice(0, 10); };
  const labels = [], values = [];
  if (attendance) {
    const now = new Date();
    const thisWeek = weekStart(new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12).toISOString().slice(0, 10));
    const byWeek = {};
    totals.forEach(x => { const w = weekStart(x.d); byWeek[w] = (byWeek[w] || 0) + x.t; });
    for (let i = 7; i >= 0; i--) {
      const dt = new Date(thisWeek + 'T00:00:00'); dt.setDate(dt.getDate() - i * 7);
      const k = dt.toISOString().slice(0, 10);
      labels.push(k.slice(5)); values.push(byWeek[k] || 0);
    }
  }
  const trendNote = (() => {
    if (!attendance || values.length < 2) return '';
    const withData = values.filter(v => v > 0);
    if (withData.length < 2) return '';
    const last = values[values.length - 1] || values[values.length - 2];
    const prev = values.slice(0, -1).filter(v => v > 0);
    const avg = prev.reduce((a, b) => a + b, 0) / prev.length;
    const diff = Math.round((last - avg) / avg * 100);
    return 'Latest week is ' + Math.abs(diff) + '% ' + (diff >= 0 ? 'above' : 'below') + ' the average of the earlier weeks.';
  })();

  const celRow = (c, i) => {
    const phone = String(c.m.phone || '').replace(/\s+/g, '');
    const msg = greetingText(c, churchName);
    return (
      <div key={c.kind + c.m.id + i} style={{ padding: '0.5rem 0', borderBottom: '1px dashed #e2e8f0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem', fontSize: '0.92rem' }}>
          <span><strong>{displayName(c.m)}</strong> - {c.kind}{c.kind !== 'Birthday' ? ' (' + c.years + ' yrs)' : ''}</span>
          <span style={{ color: '#64748b', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>{c.daysAway === 0 ? 'Today' : c.daysAway === 1 ? 'Tomorrow' : c.label}</span>
        </div>
        {phone ? (
          <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.35rem', flexWrap: 'wrap' }}>
            <a href={'sms:' + phone + '?body=' + encodeURIComponent(msg)} style={{ backgroundColor: '#eff6ff', color: '#1d4ed8', textDecoration: 'none', padding: '0.3rem 0.65rem', borderRadius: '0.4rem', fontSize: '0.8rem', fontWeight: 'bold' }}>💬 SMS</a>
            <a href={'https://wa.me/' + waNumber(phone) + '?text=' + encodeURIComponent(msg)} target="_blank" rel="noopener noreferrer" style={{ backgroundColor: '#dcfce7', color: '#166534', textDecoration: 'none', padding: '0.3rem 0.65rem', borderRadius: '0.4rem', fontSize: '0.8rem', fontWeight: 'bold' }}>🟢 WhatsApp</a>
          </div>
        ) : <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.2rem' }}>No phone number saved.</div>}
      </div>
    );
  };

  return (
    <div>
      <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#0f172a', margin: '0 0 1rem 0' }}>Home</h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem', marginBottom: '1rem' }}>{tiles}</div>

      <div style={card}>
        <h4 style={h}>🎉 Celebrating today ({today.length})</h4>
        {today.length === 0 && <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>No birthdays or anniversaries today.</p>}
        {today.map(celRow)}
      </div>

      <div style={card}>
        <h4 style={h}>📅 Coming up in the next 7 days ({soon.length})</h4>
        {soon.length === 0 && <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>Nothing in the next 7 days.</p>}
        {soon.map(celRow)}
      </div>

      {attendance && (
        <div style={card}>
          <h4 style={h}>Weekly attendance (last 8 weeks)</h4>
          {values.some(v => v > 0) ? <ReportChart type="line" labels={labels} values={values} color={theme} /> : <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>Record attendance to see the weekly trend here.</p>}
          {trendNote && <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.85rem', color: '#475569' }}>{trendNote}</p>}
        </div>
      )}
    </div>
  );
}

// ---------- Prayer requests: member side ----------
const PRAYER_CATEGORIES = ['Healing', 'Family', 'Finance & work', 'Guidance', 'Thanksgiving', 'Salvation', 'Other'];
function MemberPrayer({ user, member, theme }) {
  const [rows, setRows] = useState(null);
  const [form, setForm] = useState({ request: '', category: 'Healing', confidential: false });
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);
  const email = String((user && user.email) || '').toLowerCase();
  const load = async () => {
    const { data, error } = await supabase.from('prayer_requests').select('*').eq('member_email', email).order('created_at', { ascending: false });
    if (error) { setMsg('Could not load your requests: ' + error.message + ' (has supabase-batch4.sql been run?)'); setRows([]); } else setRows(data || []);
  };
  useEffect(() => { if (email) load(); }, [email]);
  const submit = async (e) => {
    e.preventDefault();
    if (!form.request.trim()) return;
    setBusy(true); setMsg('');
    const { error } = await supabase.from('prayer_requests').insert({ member_id: String((member && member.id) || ''), member_email: email, member_name: displayName(member || {}), request: form.request.trim(), category: form.category, confidential: !!form.confidential, status: 'new' });
    setBusy(false);
    if (error) { setMsg('Could not send: ' + error.message); return; }
    setForm({ request: '', category: 'Healing', confidential: false });
    setMsg('Your prayer request has been sent. We are praying with you.');
    load();
  };
  const remove = async (id) => {
    if (!confirm('Remove this request?')) return;
    await supabase.from('prayer_requests').delete().eq('id', id);
    load();
  };
  const statusLook = { new: ['Received', '#fef3c7', '#92400e'], praying: ['We are praying', '#dbeafe', '#1e40af'], answered: ['Answered 🙌', '#dcfce7', '#166534'] };
  return (
    <div>
      <div style={{ ...cardBox, border: '2px solid ' + theme }}>
        <h3 style={{ margin: '0 0 0.4rem 0', color: theme, fontSize: '1.1rem' }}>🙏 Send a Prayer Request</h3>
        <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '0 0 0.8rem 0' }}>Our pastors and prayer team will pray with you. Tick "Confidential" if only the Super Admin should see it.</p>
        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
          <select style={formBox} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>{PRAYER_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}</select>
          <textarea style={{ ...formBox, minHeight: '6rem' }} required maxLength={1500} placeholder="Write your prayer request here..." value={form.request} onChange={(e) => setForm({ ...form, request: e.target.value })} />
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.88rem', color: '#334155' }}><input type="checkbox" checked={form.confidential} onChange={(e) => setForm({ ...form, confidential: e.target.checked })} /> Confidential (Super Admin only)</label>
          <button type="submit" disabled={busy} style={{ backgroundColor: theme, color: '#ffffff', border: 'none', padding: '0.75rem', borderRadius: '0.5rem', fontWeight: 'bold', cursor: 'pointer' }}>{busy ? 'Sending...' : 'Send Request'}</button>
        </form>
        {msg && <div style={{ marginTop: '0.7rem', padding: '0.7rem', borderRadius: '0.5rem', fontSize: '0.88rem', backgroundColor: msg.startsWith('Could not') ? '#fee2e2' : '#dcfce7', color: msg.startsWith('Could not') ? '#991b1b' : '#166534' }}>{msg}</div>}
      </div>
      <h4 style={{ color: theme, margin: '1rem 0 0.5rem 0' }}>My requests</h4>
      {rows === null && <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Loading...</p>}
      {rows && rows.length === 0 && <p style={{ color: '#64748b', fontSize: '0.9rem' }}>You have not sent any requests yet.</p>}
      {(rows || []).map(r => {
        const look = statusLook[r.status] || statusLook.new;
        return (
          <div key={r.id} style={cardBox}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem', alignItems: 'center' }}>
              <span style={{ fontSize: '0.78rem', color: '#64748b' }}>{new Date(r.created_at).toLocaleDateString()} - {r.category}{r.confidential ? ' - confidential' : ''}</span>
              <span style={{ backgroundColor: look[1], color: look[2], padding: '0.15rem 0.6rem', borderRadius: '1rem', fontSize: '0.75rem', fontWeight: 'bold' }}>{look[0]}</span>
            </div>
            <div style={{ fontSize: '0.92rem', color: '#0f172a', marginTop: '0.4rem', whiteSpace: 'pre-wrap' }}>{r.request}</div>
            {r.admin_note ? <div style={{ fontSize: '0.85rem', color: theme, marginTop: '0.4rem' }}>Note from the prayer team: {r.admin_note}</div> : null}
            {r.status === 'new' && <button type="button" onClick={() => remove(r.id)} style={{ marginTop: '0.5rem', background: 'none', border: 'none', color: '#dc2626', fontWeight: 'bold', cursor: 'pointer', padding: 0, fontSize: '0.8rem' }}>Remove</button>}
          </div>
        );
      })}
    </div>
  );
}

// ---------- Prayer requests: prayer team / admin side ----------
function PrayerAdmin({ members, theme, isSuper }) {
  const [rows, setRows] = useState(null);
  const [err, setErr] = useState('');
  const [filter, setFilter] = useState('open');
  const [notes, setNotes] = useState({});
  const load = async () => {
    setErr('');
    const { data, error } = await supabase.from('prayer_requests').select('*').order('created_at', { ascending: false }).limit(300);
    if (error) { setErr('Could not load prayer requests: ' + error.message + ' (has supabase-batch4.sql been run?)'); setRows([]); } else setRows(data || []);
  };
  useEffect(() => { load(); }, []);
  const update = async (id, patch) => {
    const { error } = await supabase.from('prayer_requests').update({ ...patch, updated_at: new Date().toISOString() }).eq('id', id);
    if (error) alert('Could not update: ' + error.message); else load();
  };
  const remove = async (id) => {
    if (!confirm('Delete this prayer request?')) return;
    const { error } = await supabase.from('prayer_requests').delete().eq('id', id);
    if (error) alert('Could not delete: ' + error.message); else load();
  };
  const shown = (rows || []).filter(r => filter === 'all' ? true : filter === 'open' ? r.status !== 'answered' : r.status === filter);
  const phoneOf = (email) => { const m = members.find(x => String(x.email || '').toLowerCase() === String(email || '').toLowerCase()); return m ? String(m.phone || '').replace(/\s+/g, '') : ''; };
  const pill = (on) => ({ backgroundColor: on ? theme : '#f1f5f9', color: on ? '#ffffff' : '#334155', border: 'none', padding: '0.45rem 0.8rem', borderRadius: '0.5rem', fontWeight: '600', cursor: 'pointer', fontSize: '0.82rem' });
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#0f172a', margin: 0 }}>Prayer Requests</h3>
        <button type="button" onClick={load} style={{ backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', padding: '0.5rem 0.9rem', borderRadius: '0.5rem', fontWeight: 'bold', cursor: 'pointer' }}>↻ Refresh</button>
      </div>
      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.9rem' }}>
        {[['open', 'Open'], ['new', 'New'], ['praying', 'Praying'], ['answered', 'Answered'], ['all', 'All']].map(([k, t]) => <button key={k} type="button" onClick={() => setFilter(k)} style={pill(filter === k)}>{t}</button>)}
      </div>
      {err && <div style={{ backgroundColor: '#fee2e2', color: '#991b1b', padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '0.75rem', fontSize: '0.85rem' }}>{err}</div>}
      {rows === null && <p style={{ color: '#64748b' }}>Loading...</p>}
      {rows && shown.length === 0 && !err && <p style={{ color: '#64748b' }}>No prayer requests here.</p>}
      {shown.map(r => {
        const phone = phoneOf(r.member_email);
        return (
          <div key={r.id} style={cardBox}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem' }}>
              <div>
                <div style={{ fontWeight: 'bold', color: '#0f172a' }}>{r.member_name || r.member_email}{r.confidential ? ' 🔒' : ''}</div>
                <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{new Date(r.created_at).toLocaleString()} - {r.category} - {r.status}</div>
              </div>
              {isSuper && <button type="button" onClick={() => remove(r.id)} style={{ backgroundColor: '#fee2e2', border: 'none', padding: '0.3rem 0.6rem', borderRadius: '0.3rem', fontSize: '0.8rem', fontWeight: 'bold', cursor: 'pointer', color: '#dc2626', alignSelf: 'flex-start' }}>🗑️</button>}
            </div>
            <div style={{ fontSize: '0.92rem', color: '#0f172a', margin: '0.5rem 0', whiteSpace: 'pre-wrap' }}>{r.request}</div>
            <input style={{ ...formBox, marginBottom: '0.5rem' }} placeholder="Short note to the member (optional)" value={notes[r.id] !== undefined ? notes[r.id] : (r.admin_note || '')} onChange={(e) => setNotes({ ...notes, [r.id]: e.target.value })} />
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
              {r.status !== 'praying' && <button type="button" onClick={() => update(r.id, { status: 'praying', admin_note: notes[r.id] !== undefined ? notes[r.id] : r.admin_note })} style={{ backgroundColor: '#dbeafe', color: '#1e40af', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '0.4rem', fontWeight: 'bold', fontSize: '0.8rem', cursor: 'pointer' }}>🙏 Praying</button>}
              {r.status !== 'answered' && <button type="button" onClick={() => update(r.id, { status: 'answered', admin_note: notes[r.id] !== undefined ? notes[r.id] : r.admin_note })} style={{ backgroundColor: '#dcfce7', color: '#166534', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '0.4rem', fontWeight: 'bold', fontSize: '0.8rem', cursor: 'pointer' }}>🙌 Answered</button>}
              {r.status !== 'new' && <button type="button" onClick={() => update(r.id, { status: 'new' })} style={{ backgroundColor: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1', padding: '0.4rem 0.8rem', borderRadius: '0.4rem', fontWeight: 'bold', fontSize: '0.8rem', cursor: 'pointer' }}>Reopen</button>}
              <button type="button" onClick={() => update(r.id, { admin_note: notes[r.id] !== undefined ? notes[r.id] : r.admin_note })} style={{ backgroundColor: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1', padding: '0.4rem 0.8rem', borderRadius: '0.4rem', fontWeight: 'bold', fontSize: '0.8rem', cursor: 'pointer' }}>Save note</button>
              {phone && <a href={'tel:' + phone} style={{ backgroundColor: '#eff6ff', color: '#1d4ed8', textDecoration: 'none', padding: '0.4rem 0.8rem', borderRadius: '0.4rem', fontWeight: 'bold', fontSize: '0.8rem' }}>📞 Call</a>}
              {phone && <a href={'https://wa.me/' + waNumber(phone)} target="_blank" rel="noopener noreferrer" style={{ backgroundColor: '#dcfce7', color: '#166534', textDecoration: 'none', padding: '0.4rem 0.8rem', borderRadius: '0.4rem', fontWeight: 'bold', fontSize: '0.8rem' }}>🟢 WhatsApp</a>}
            </div>
          </div>
        );
      })}
    </div>
  );
}


// ---------- Batch 5: install help, welfare requests, dept budgets, sermons, groups, absentees, RSVP, volunteers ----------
const dayName = (iso) => { try { return new Date(iso + 'T12:00:00').toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }); } catch (e) { return iso; } };
const smallBtn = (bg, fg) => ({ backgroundColor: bg || '#f1f5f9', color: fg || '#334155', border: bg ? 'none' : '1px solid #cbd5e1', padding: '0.3rem 0.65rem', borderRadius: '0.35rem', fontSize: '0.8rem', fontWeight: 'bold', cursor: 'pointer', textDecoration: 'none', display: 'inline-block' });
const noteBox = (bad) => ({ marginTop: '0.7rem', padding: '0.7rem', borderRadius: '0.5rem', fontSize: '0.88rem', backgroundColor: bad ? '#fee2e2' : '#dcfce7', color: bad ? '#991b1b' : '#166534' });
const isBad = (m) => /^(Could not|Please)/.test(String(m || ''));

// Send an SMS through the church's Hubtel account (server route /api/sms). Returns a message to show.
async function sendAppSms(phones, message) {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    const res = await fetch('/api/sms', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + (session ? session.access_token : '') }, body: JSON.stringify({ message, phones }) });
    const out = await res.json().catch(() => ({}));
    if (res.ok && out.sent) return 'Sent to ' + out.sent + ' of ' + out.total + ' people.' + (out.failed ? ' ' + out.failed + ' could not be sent.' : '');
    return 'Could not send: ' + (out.error || 'please try again.');
  } catch (e) { return 'Could not send: ' + e.message; }
}

// ---------- 1) Install help on the login screen ----------
function InstallHelp({ theme }) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState('');
  const [os, setOs] = useState('');
  const [standalone, setStandalone] = useState(false);
  useEffect(() => {
    try {
      const ua = navigator.userAgent || '';
      setOs((/iPhone|iPad|iPod/i.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1)) ? 'ios' : /Android/i.test(ua) ? 'android' : '');
      setStandalone(!!((window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) || navigator.standalone === true));
    } catch (e) {}
  }, []);
  if (standalone) return null;
  const cur = tab || os || 'android';
  const steps = cur === 'ios'
    ? ['Open this page in Safari (the blue compass icon).', 'Tap the Share button (a square with an arrow pointing up) at the bottom of the screen.', 'Scroll down and tap "Add to Home Screen".', 'Tap "Add". The Gracepoint icon now appears on your home screen.']
    : ['Open this page in Chrome.', 'Tap the three dots menu at the top right.', 'Tap "Install app" (or "Add to Home screen").', 'Tap "Install". The Gracepoint icon now appears on your phone.'];
  const pill = (on) => ({ flex: 1, backgroundColor: on ? theme : '#f1f5f9', color: on ? '#ffffff' : '#334155', border: 'none', padding: '0.5rem', borderRadius: '0.4rem', fontWeight: 'bold', fontSize: '0.85rem', cursor: 'pointer' });
  return (
    <div style={{ marginTop: '1rem', textAlign: 'center' }}>
      <button type="button" onClick={() => setOpen(!open)} style={{ background: 'none', border: 'none', color: theme, fontWeight: 'bold', fontSize: '0.88rem', cursor: 'pointer' }}>📲 {open ? 'Hide install help' : 'Install this app on your phone'}</button>
      {open && (
        <div style={{ textAlign: 'left', marginTop: '0.6rem', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '0.6rem', padding: '0.9rem' }}>
          <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.7rem' }}>
            <button type="button" onClick={() => setTab('ios')} style={pill(cur === 'ios')}>iPhone</button>
            <button type="button" onClick={() => setTab('android')} style={pill(cur === 'android')}>Android</button>
          </div>
          <ol style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.88rem', color: '#334155', lineHeight: 1.6 }}>
            {steps.map((s, i) => <li key={i}>{s}</li>)}
          </ol>
          {cur === 'ios' && <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '0.6rem 0 0 0' }}>On an iPhone, the app is installed from the browser, not from the App Store. It does not work from a private tab.</p>}
        </div>
      )}
    </div>
  );
}

// ---------- 2) Welfare / benevolence requests ----------
const WELFARE_CATEGORIES = ['Funeral / Bereavement', 'Medical / Hospital bill', 'School fees', 'Rent / Housing', 'Food / Basic needs', 'Emergency', 'Other'];
const WELFARE_LOOK = { new: ['Received', '#fef3c7', '#92400e'], approved: ['Approved', '#dbeafe', '#1e40af'], paid: ['Help given 🙏', '#dcfce7', '#166534'], declined: ['Not approved', '#fee2e2', '#991b1b'] };

function MemberWelfare({ user, member, theme }) {
  const blank = { category: WELFARE_CATEGORIES[0], description: '', amount_requested: '' };
  const [rows, setRows] = useState(null);
  const [form, setForm] = useState(blank);
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);
  const email = String((user && user.email) || '').toLowerCase();
  const load = async () => {
    const { data, error } = await supabase.from('welfare_requests').select('*').eq('member_email', email).order('created_at', { ascending: false });
    if (error) { setMsg('Could not load your requests: ' + error.message + ' (has supabase-batch5.sql been run?)'); setRows([]); } else setRows(data || []);
  };
  useEffect(() => { if (email) load(); }, [email]);
  const submit = async (e) => {
    e.preventDefault();
    if (!form.description.trim()) return;
    setBusy(true); setMsg('');
    const amt = parseFloat(form.amount_requested);
    const { error } = await supabase.from('welfare_requests').insert({ member_id: String((member && member.id) || ''), member_email: email, member_name: displayName(member || {}), phone: (member && member.phone) || '', category: form.category, description: form.description.trim(), amount_requested: amt > 0 ? amt : null, status: 'new' });
    setBusy(false);
    if (error) { setMsg('Could not send: ' + error.message); return; }
    setForm(blank);
    setMsg('Your request has been sent to the welfare team. They will contact you.');
    load();
  };
  const remove = async (id) => {
    if (!confirm('Cancel this request?')) return;
    await supabase.from('welfare_requests').delete().eq('id', id);
    load();
  };
  return (
    <div>
      <div style={{ ...cardBox, border: '2px solid ' + theme }}>
        <h3 style={{ margin: '0 0 0.4rem 0', color: theme, fontSize: '1.1rem' }}>🤝 Ask for Welfare Help</h3>
        <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '0 0 0.8rem 0' }}>If you or your family is in need, tell the welfare team. Your request is private: only the welfare team and the Super Admin can see it.</p>
        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
          <select style={formBox} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>{WELFARE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}</select>
          <textarea style={{ ...formBox, minHeight: '6rem' }} required maxLength={1500} placeholder="Tell us about the need..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <input style={formBox} type="number" min="0" step="0.01" placeholder="Amount needed in GHS (optional)" value={form.amount_requested} onChange={(e) => setForm({ ...form, amount_requested: e.target.value })} />
          <button type="submit" disabled={busy} style={{ backgroundColor: theme, color: '#ffffff', border: 'none', padding: '0.75rem', borderRadius: '0.5rem', fontWeight: 'bold', cursor: 'pointer' }}>{busy ? 'Sending...' : 'Send Request'}</button>
        </form>
        {msg && <div style={noteBox(isBad(msg))}>{msg}</div>}
      </div>
      <h4 style={{ color: theme, margin: '1rem 0 0.5rem 0' }}>My requests</h4>
      {rows === null && <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Loading...</p>}
      {rows && rows.length === 0 && <p style={{ color: '#64748b', fontSize: '0.9rem' }}>You have not made any request.</p>}
      {(rows || []).map(r => {
        const look = WELFARE_LOOK[r.status] || WELFARE_LOOK.new;
        return (
          <div key={r.id} style={cardBox}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem', alignItems: 'center' }}>
              <span style={{ fontSize: '0.78rem', color: '#64748b' }}>{new Date(r.created_at).toLocaleDateString()} - {r.category}</span>
              <span style={{ backgroundColor: look[1], color: look[2], padding: '0.15rem 0.6rem', borderRadius: '1rem', fontSize: '0.75rem', fontWeight: 'bold' }}>{look[0]}</span>
            </div>
            <div style={{ fontSize: '0.92rem', color: '#0f172a', marginTop: '0.4rem', whiteSpace: 'pre-wrap' }}>{r.description}</div>
            {r.amount_given ? <div style={{ fontSize: '0.85rem', color: '#166534', marginTop: '0.3rem' }}>Support given: GHS {Number(r.amount_given).toFixed(2)}</div> : null}
            {r.admin_note ? <div style={{ fontSize: '0.85rem', color: theme, marginTop: '0.3rem' }}>Note from the welfare team: {r.admin_note}</div> : null}
            {r.status === 'new' && <button type="button" onClick={() => remove(r.id)} style={{ marginTop: '0.5rem', background: 'none', border: 'none', color: '#dc2626', fontWeight: 'bold', cursor: 'pointer', padding: 0, fontSize: '0.8rem' }}>Cancel request</button>}
          </div>
        );
      })}
    </div>
  );
}

function WelfareAdmin({ members, theme, isSuper, onRecordExpense, onReceipt }) {
  const [rows, setRows] = useState(null);
  const [err, setErr] = useState('');
  const [filter, setFilter] = useState('open');
  const [edit, setEdit] = useState({});
  const load = async () => {
    setErr('');
    const { data, error } = await supabase.from('welfare_requests').select('*').order('created_at', { ascending: false }).limit(300);
    if (error) { setErr('Could not load welfare requests: ' + error.message + ' (has supabase-batch5.sql been run?)'); setRows([]); } else setRows(data || []);
  };
  useEffect(() => { load(); }, []);
  const patch = async (id, p) => {
    const { error } = await supabase.from('welfare_requests').update({ ...p, updated_at: new Date().toISOString() }).eq('id', id);
    if (error) alert('Could not update: ' + error.message); else load();
  };
  const remove = async (id) => {
    if (!confirm('Delete this request?')) return;
    const { error } = await supabase.from('welfare_requests').delete().eq('id', id);
    if (error) alert('Could not delete: ' + error.message); else load();
  };
  const shown = (rows || []).filter(r => filter === 'all' ? true : filter === 'open' ? (r.status === 'new' || r.status === 'approved') : r.status === filter);
  const given = (rows || []).filter(r => r.status === 'paid').reduce((s, r) => s + Number(r.amount_given || 0), 0);
  const pill = (on) => ({ backgroundColor: on ? theme : '#f1f5f9', color: on ? '#ffffff' : '#334155', border: 'none', padding: '0.45rem 0.8rem', borderRadius: '0.5rem', fontWeight: '600', cursor: 'pointer', fontSize: '0.82rem' });
  const ed = (r) => edit[r.id] || { amount: r.amount_given || r.amount_requested || '', note: r.admin_note || '' };
  const setEd = (r, p) => setEdit({ ...edit, [r.id]: { ...ed(r), ...p } });
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#0f172a', margin: 0 }}>Welfare Requests</h3>
        <button type="button" onClick={load} style={smallBtn()}>↻ Refresh</button>
      </div>
      <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: 0 }}>{(rows || []).length} request(s) - total support given so far: <strong>GHS {given.toFixed(2)}</strong></p>
      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.9rem' }}>
        {[['open', 'Open'], ['new', 'New'], ['approved', 'Approved'], ['paid', 'Helped'], ['declined', 'Declined'], ['all', 'All']].map(([k, t]) => <button key={k} type="button" onClick={() => setFilter(k)} style={pill(filter === k)}>{t}</button>)}
      </div>
      {err && <div style={noteBox(true)}>{err}</div>}
      {rows === null && <p style={{ color: '#64748b' }}>Loading...</p>}
      {rows && shown.length === 0 && !err && <p style={{ color: '#64748b' }}>No requests here.</p>}
      {shown.map(r => {
        const look = WELFARE_LOOK[r.status] || WELFARE_LOOK.new;
        const e = ed(r);
        const phone = String(r.phone || '').replace(/\s+/g, '');
        return (
          <div key={r.id} style={cardBox}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem' }}>
              <div>
                <div style={{ fontWeight: 'bold', color: '#0f172a' }}>{r.member_name || r.member_email}</div>
                <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{new Date(r.created_at).toLocaleDateString()} - {r.category}{r.amount_requested ? ' - asks GHS ' + Number(r.amount_requested).toFixed(2) : ''}</div>
              </div>
              <span style={{ backgroundColor: look[1], color: look[2], padding: '0.15rem 0.6rem', borderRadius: '1rem', fontSize: '0.75rem', fontWeight: 'bold', alignSelf: 'flex-start' }}>{look[0]}</span>
            </div>
            <div style={{ fontSize: '0.92rem', color: '#0f172a', margin: '0.5rem 0', whiteSpace: 'pre-wrap' }}>{r.description}</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '0.4rem', marginBottom: '0.5rem' }}>
              <input style={formBox} type="number" step="0.01" min="0" placeholder="GHS given" value={e.amount} onChange={(ev) => setEd(r, { amount: ev.target.value })} />
              <input style={formBox} placeholder="Note to the member (optional)" value={e.note} onChange={(ev) => setEd(r, { note: ev.target.value })} />
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
              {r.status !== 'approved' && r.status !== 'paid' && <button type="button" onClick={() => patch(r.id, { status: 'approved', admin_note: e.note })} style={smallBtn('#dbeafe', '#1e40af')}>Approve</button>}
              {r.status !== 'paid' && <button type="button" onClick={() => {
                const amt = parseFloat(e.amount);
                if (!(amt > 0)) { alert('Enter the amount given first.'); return; }
                patch(r.id, { status: 'paid', amount_given: amt, admin_note: e.note });
                if (onRecordExpense && confirm('Also record GHS ' + amt.toFixed(2) + ' as a welfare expense in the church accounts?')) onRecordExpense('Welfare support - ' + (r.member_name || 'member') + ' (' + r.category + ')', amt);
              }} style={smallBtn('#dcfce7', '#166534')}>Mark helped</button>}
              {r.status !== 'declined' && r.status !== 'paid' && <button type="button" onClick={() => patch(r.id, { status: 'declined', admin_note: e.note })} style={smallBtn('#fee2e2', '#991b1b')}>Decline</button>}
              <button type="button" onClick={() => patch(r.id, { admin_note: e.note })} style={smallBtn()}>Save note</button>
              {onReceipt && r.status === 'paid' && Number(r.amount_given) > 0 ? <button type="button" onClick={() => onReceipt('Welfare', { member_id: r.member_id, member_name: r.member_name || r.member_email, category: r.category, amount: r.amount_given, date: String(r.updated_at || r.created_at || '').slice(0, 10) })} style={smallBtn('#ecfdf5', '#166534')}>🧾 Voucher</button> : null}
              {phone ? <a href={'tel:' + phone} style={smallBtn('#eff6ff', '#1d4ed8')}>📞 Call</a> : null}
              {phone ? <a href={'https://wa.me/' + waNumber(phone)} target="_blank" rel="noopener noreferrer" style={smallBtn('#dcfce7', '#166534')}>🟢 WhatsApp</a> : null}
              {isSuper && <button type="button" onClick={() => remove(r.id)} style={smallBtn('#fee2e2', '#dc2626')}>🗑️</button>}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ---------- 3) Department budget vs actual spending ----------
const BUDGET_DEPTS = ['General / Church', ...CORE_DEPARTMENTS, ...SUB_DEPARTMENTS, 'Welfare', 'Facilities & Maintenance', 'Other'];
function BudgetVsActual({ deptBudgets, onChange, expenses, theme, canEdit, openPrint }) {
  const thisYear = String(new Date().getFullYear());
  const [year, setYear] = useState(thisYear);
  const [form, setForm] = useState({ dept: BUDGET_DEPTS[0], amount: '' });
  const years = Array.from(new Set([thisYear, ...(deptBudgets || []).map(b => String(b.year)), ...(expenses || []).map(x => String(x.date || '').slice(0, 4)).filter(y => /^\d{4}$/.test(y))])).sort().reverse();
  const spentBy = {};
  let unassigned = 0;
  (expenses || []).forEach(x => {
    if (String(x.date || '').slice(0, 4) !== year) return;
    const amt = parseFloat(x.amount || 0) || 0;
    if (x.department) spentBy[x.department] = (spentBy[x.department] || 0) + amt; else unassigned += amt;
  });
  const budgetsThisYear = (deptBudgets || []).filter(b => String(b.year) === year);
  const rows = budgetsThisYear.map(b => {
    const budget = parseFloat(b.amount || 0) || 0;
    const spent = spentBy[b.dept] || 0;
    return { dept: b.dept, budget, spent, left: budget - spent, pct: budget > 0 ? (spent / budget) * 100 : (spent > 0 ? 999 : 0) };
  }).sort((a, b) => b.pct - a.pct);
  const unbudgeted = Object.keys(spentBy).filter(d => !budgetsThisYear.some(b => b.dept === d)).map(d => ({ dept: d, spent: spentBy[d] }));
  const totBudget = rows.reduce((s, r) => s + r.budget, 0), totSpent = rows.reduce((s, r) => s + r.spent, 0);
  const money = (n) => 'GHS ' + Number(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const colorFor = (p) => p >= 100 ? '#dc2626' : p >= 80 ? '#f59e0b' : '#16a34a';
  const save = (e) => {
    e.preventDefault();
    const amt = parseFloat(form.amount);
    if (!(amt >= 0)) return;
    const rest = (deptBudgets || []).filter(b => !(String(b.year) === year && b.dept === form.dept));
    onChange([{ dept: form.dept, year, amount: amt }, ...rest]);
    setForm({ ...form, amount: '' });
  };
  const print = () => {
    const tr = rows.map(r => '<tr><td>' + r.dept + '</td><td style="text-align:right">' + money(r.budget) + '</td><td style="text-align:right">' + money(r.spent) + '</td><td style="text-align:right">' + money(r.left) + '</td><td style="text-align:right">' + (r.pct > 900 ? 'no budget' : r.pct.toFixed(0) + '%') + '</td></tr>').join('');
    openPrint('Budget vs Actual ' + year, '<h2>Budget vs Actual Spending - ' + year + '</h2><table><tr><th>Department</th><th>Budget</th><th>Spent</th><th>Left</th><th>Used</th></tr>' + tr + '<tr><th>Total</th><th style="text-align:right">' + money(totBudget) + '</th><th style="text-align:right">' + money(totSpent) + '</th><th style="text-align:right">' + money(totBudget - totSpent) + '</th><th></th></tr></table>' + (unassigned > 0 ? '<p>Expenses with no department chosen: ' + money(unassigned) + '</p>' : ''));
  };
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem', marginBottom: '0.6rem' }}>
        <h3 style={{ margin: 0, color: '#0f172a' }}>Budget vs Actual</h3>
        <div style={{ display: 'flex', gap: '0.4rem' }}>
          <select style={{ ...formBox, width: 'auto' }} value={year} onChange={(e) => setYear(e.target.value)}>{years.map(y => <option key={y} value={y}>{y}</option>)}</select>
          <button type="button" onClick={print} style={smallBtn('#2563eb', '#ffffff')}>⬇ PDF</button>
        </div>
      </div>
      <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: 0 }}>Set a yearly budget for each department. Spending comes from Record Expenses (choose the department when you record an expense).</p>
      {canEdit && (
        <form onSubmit={save} style={{ ...cardBox, display: 'grid', gridTemplateColumns: '2fr 1fr auto', gap: '0.4rem', alignItems: 'end' }}>
          <div><label style={formLab}>Department</label><select style={formBox} value={form.dept} onChange={(e) => setForm({ ...form, dept: e.target.value })}>{BUDGET_DEPTS.map(d => <option key={d} value={d}>{d}</option>)}</select></div>
          <div><label style={formLab}>{year} budget (GHS)</label><input style={formBox} type="number" min="0" step="0.01" required value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} /></div>
          <button type="submit" style={{ ...greenBtn, padding: '0.6rem 0.9rem' }}>Save</button>
        </form>
      )}
      <div style={{ ...cardBox, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', textAlign: 'center', gap: '0.4rem' }}>
        <div><div style={{ fontSize: '0.72rem', color: '#64748b' }}>BUDGET</div><div style={{ fontWeight: 'bold', color: '#0f172a' }}>{money(totBudget)}</div></div>
        <div><div style={{ fontSize: '0.72rem', color: '#64748b' }}>SPENT</div><div style={{ fontWeight: 'bold', color: '#dc2626' }}>{money(totSpent)}</div></div>
        <div><div style={{ fontSize: '0.72rem', color: '#64748b' }}>LEFT</div><div style={{ fontWeight: 'bold', color: totBudget - totSpent < 0 ? '#dc2626' : '#16a34a' }}>{money(totBudget - totSpent)}</div></div>
      </div>
      {rows.length === 0 && <p style={{ color: '#64748b' }}>No department budgets set for {year} yet.</p>}
      {rows.map(r => (
        <div key={r.dept} style={cardBox}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem', fontWeight: 'bold', color: '#0f172a' }}>
            <span>{r.dept}{r.pct >= 100 ? ' ⚠️ over budget' : r.pct >= 80 ? ' ⚠️ nearly used' : ''}</span>
            {canEdit && <button type="button" onClick={() => { if (confirm('Remove the ' + year + ' budget for ' + r.dept + '?')) onChange((deptBudgets || []).filter(b => !(String(b.year) === year && b.dept === r.dept))); }} style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', fontSize: '0.8rem' }}>Remove</button>}
          </div>
          <div style={{ height: '0.6rem', backgroundColor: '#e2e8f0', borderRadius: '1rem', margin: '0.5rem 0', overflow: 'hidden' }}>
            <div style={{ width: Math.min(100, r.pct) + '%', height: '100%', backgroundColor: colorFor(r.pct) }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.83rem', color: '#475569', flexWrap: 'wrap', gap: '0.3rem' }}>
            <span>Spent {money(r.spent)} of {money(r.budget)}</span>
            <span style={{ color: colorFor(r.pct), fontWeight: 'bold' }}>{r.pct > 900 ? 'No budget' : r.pct.toFixed(0) + '% used'} - {r.left >= 0 ? money(r.left) + ' left' : money(-r.left) + ' over'}</span>
          </div>
        </div>
      ))}
      {unbudgeted.length > 0 && <div style={cardBox}><strong style={{ color: '#92400e' }}>Spending with no budget set:</strong> {unbudgeted.map(u => u.dept + ' (' + money(u.spent) + ')').join(', ')}</div>}
      {unassigned > 0 && <div style={cardBox}><strong style={{ color: '#92400e' }}>Expenses with no department chosen:</strong> {money(unassigned)}. Edit those expenses and pick a department to count them here.</div>}
    </div>
  );
}

// ---------- 4) Sermons: search, series, summary and private notes ----------
function MemberSermons({ videos, user, theme }) {
  const email = String((user && user.email) || '').toLowerCase();
  const [q, setQ] = useState('');
  const [series, setSeries] = useState('');
  const [notes, setNotes] = useState({});
  const [open, setOpen] = useState('');
  const [msg, setMsg] = useState('');
  const keyOf = (v) => String(v.title || '') + '|' + String(v.video_date || '');
  useEffect(() => {
    if (!email) return;
    (async () => {
      const { data } = await supabase.from('sermon_notes').select('video_key, note').eq('member_email', email);
      const o = {}; (data || []).forEach(r => { o[r.video_key] = r.note; }); setNotes(o);
    })();
  }, [email]);
  const saveNote = async (v) => {
    const k = keyOf(v);
    const text = String(notes[k] || '').trim();
    setMsg('Saving...');
    const res = text
      ? await supabase.from('sermon_notes').upsert({ member_email: email, video_key: k, video_title: v.title, note: text, updated_at: new Date().toISOString() }, { onConflict: 'member_email,video_key' })
      : await supabase.from('sermon_notes').delete().eq('member_email', email).eq('video_key', k);
    setMsg(res.error ? 'Could not save your note: ' + res.error.message + ' (has supabase-batch5.sql been run?)' : 'Your note is saved.');
  };
  const allSeries = Array.from(new Set((videos || []).map(v => String(v.series || '').trim()).filter(Boolean)));
  const needle = q.trim().toLowerCase();
  const shown = (videos || []).filter(v => (!series || String(v.series || '') === series) && (!needle || [v.title, v.speaker, v.topic, v.series, v.description, v.notes].some(x => String(x || '').toLowerCase().includes(needle))));
  return (
    <div style={{ backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '0.75rem', padding: '1.25rem 1.5rem', marginBottom: '1rem' }}>
      <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: theme, margin: '0 0 0.75rem 0' }}>Sermons &amp; Videos</h3>
      <input style={{ ...formBox, marginBottom: '0.5rem' }} placeholder="Search by title, speaker, topic or series..." value={q} onChange={(e) => setQ(e.target.value)} />
      {allSeries.length > 0 && (
        <select style={{ ...formBox, marginBottom: '0.7rem' }} value={series} onChange={(e) => setSeries(e.target.value)}>
          <option value="">All series</option>
          {allSeries.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      )}
      {shown.length === 0 && <p style={{ margin: 0, fontSize: '0.9rem', color: '#64748b' }}>{(videos || []).length ? 'No sermon matches your search.' : 'No sermons have been added yet.'}</p>}
      {shown.slice(0, 40).map((v, i) => {
        const k = keyOf(v);
        const isOpen = open === k;
        return (
          <div key={k + i} style={{ padding: '0.6rem 0', borderBottom: '1px dashed #e2e8f0' }}>
            <div style={{ fontWeight: '600', color: '#0f172a' }}>{v.title}{v.video_date ? <span style={{ fontWeight: 'normal', fontSize: '0.8rem', color: '#64748b' }}>  ({v.video_date})</span> : null}</div>
            <div style={{ fontSize: '0.82rem', color: '#64748b' }}>{[v.speaker, v.series ? 'Series: ' + v.series : '', v.topic ? 'Topic: ' + v.topic : ''].filter(Boolean).join(' - ')}</div>
            {v.notes ? <div style={{ fontSize: '0.88rem', color: '#334155', margin: '0.35rem 0', whiteSpace: 'pre-wrap' }}>{v.notes}</div> : null}
            <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.3rem', flexWrap: 'wrap' }}>
              <a href={v.video_url} target="_blank" rel="noopener noreferrer" style={{ ...smallBtn(theme, '#ffffff'), padding: '0.35rem 0.8rem' }}>▶ Watch</a>
              <button type="button" onClick={() => { setOpen(isOpen ? '' : k); setMsg(''); }} style={smallBtn()}>📝 {notes[k] ? 'My notes' : 'Take notes'}</button>
            </div>
            {isOpen && (
              <div style={{ marginTop: '0.5rem' }}>
                <textarea style={{ ...formBox, minHeight: '6rem' }} maxLength={4000} placeholder="Your private notes on this sermon..." value={notes[k] || ''} onChange={(e) => setNotes({ ...notes, [k]: e.target.value })} />
                <button type="button" onClick={() => saveNote(v)} style={{ ...greenBtn, marginTop: '0.4rem', padding: '0.5rem 0.9rem' }}>Save my notes</button>
                {msg && <div style={noteBox(isBad(msg))}>{msg}</div>}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ---------- 5) Groups and classes (Sunday School, Bible class) with their own registers ----------
const GROUP_KINDS = ['Sunday School', 'Bible Class', 'Youth Class', 'Discipleship Class', 'Other'];
function GroupsTab({ items, onChange, members, theme, canDelete }) {
  const blank = { name: '', kind: GROUP_KINDS[0], teacher_id: '', teacher_name: '', meeting_day: 'Sunday', meeting_time: '', notes: '', member_ids: [], sessions: [] };
  const [show, setShow] = useState(false);
  const [form, setForm] = useState(blank);
  const [editIndex, setEditIndex] = useState(null);
  const [find, setFind] = useState('');
  const [reg, setReg] = useState(null); // { index, date, ids }
  const sorted = sortedMembers(members);
  const nameOf = (id) => { const m = members.find(x => String(x.id) === String(id)); return m ? displayName(m) : ''; };
  const toggle = (id) => { const cur = form.member_ids || []; setForm({ ...form, member_ids: cur.includes(id) ? cur.filter(x => x !== id) : [...cur, id] }); };
  const shown = sorted.filter(m => displayName(m).toLowerCase().includes(find.toLowerCase()));
  const rate = (g) => {
    const s = g.sessions || [];
    const n = (g.member_ids || []).length;
    if (!s.length || !n) return null;
    const present = s.reduce((t, x) => t + (x.present_ids || []).filter(id => (g.member_ids || []).map(String).includes(String(id))).length, 0);
    return Math.round((present / (s.length * n)) * 100);
  };
  const missing = (g) => {
    const last = [...(g.sessions || [])].sort((a, b) => String(b.date).localeCompare(String(a.date))).slice(0, 3);
    if (last.length < 3) return [];
    return (g.member_ids || []).filter(id => last.every(x => !(x.present_ids || []).map(String).includes(String(id))));
  };
  const saveRegister = () => {
    const g = items[reg.index];
    const sessions = [...(g.sessions || []).filter(s => s.date !== reg.date), { date: reg.date, present_ids: reg.ids }];
    const next = [...items]; next[reg.index] = { ...g, sessions };
    onChange(next); setReg(null);
  };
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#0f172a', margin: 0 }}>Groups &amp; Classes</h3>
        <button type="button" onClick={() => { setShow(!show); setForm(blank); setEditIndex(null); }} style={greenBtn}>{show ? 'Cancel' : '+ Add Group'}</button>
      </div>
      <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: 0 }}>Sunday School, Bible classes and other groups, each with its own register.</p>

      {show && (
        <form onSubmit={(e) => {
          e.preventDefault();
          const item = { ...form, teacher_name: form.teacher_id ? nameOf(form.teacher_id) : form.teacher_name };
          if (editIndex !== null) { const next = [...items]; next[editIndex] = item; onChange(next); } else onChange([item, ...items]);
          setForm(blank); setEditIndex(null); setShow(false);
        }} style={{ ...cardBox, border: '1px solid #cbd5e1', padding: '1.25rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div><label style={formLab}>Group name *</label><input style={formBox} required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Youth Bible Class" /></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              <div><label style={formLab}>Type</label><select style={formBox} value={form.kind} onChange={(e) => setForm({ ...form, kind: e.target.value })}>{GROUP_KINDS.map(k => <option key={k} value={k}>{k}</option>)}</select></div>
              <div><label style={formLab}>Teacher / leader</label><select style={formBox} value={form.teacher_id} onChange={(e) => setForm({ ...form, teacher_id: e.target.value })}><option value="">-- Select --</option>{sorted.map(m => <option key={m.id} value={m.id}>{displayName(m)}</option>)}</select></div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              <div><label style={formLab}>Meeting day</label><select style={formBox} value={form.meeting_day} onChange={(e) => setForm({ ...form, meeting_day: e.target.value })}>{DAYS.map(d => <option key={d} value={d}>{d}</option>)}</select></div>
              <div><label style={formLab}>Time</label><input style={formBox} value={form.meeting_time} onChange={(e) => setForm({ ...form, meeting_time: e.target.value })} placeholder="e.g. 8:30 AM" /></div>
            </div>
            <div>
              <label style={formLab}>Members ({(form.member_ids || []).length} selected)</label>
              <input style={{ ...formBox, marginBottom: '0.4rem' }} value={find} onChange={(e) => setFind(e.target.value)} placeholder="Search name..." />
              <div style={{ maxHeight: '14rem', overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: '0.375rem', padding: '0.4rem' }}>
                {shown.map(m => (
                  <label key={m.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.3rem 0.2rem', fontSize: '0.9rem' }}>
                    <input type="checkbox" checked={(form.member_ids || []).includes(String(m.id))} onChange={() => toggle(String(m.id))} />
                    <span>{displayName(m)}</span>
                  </label>
                ))}
              </div>
            </div>
            <div><label style={formLab}>Notes</label><textarea style={{ ...formBox, minHeight: '4rem' }} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
            <button type="submit" style={{ backgroundColor: theme, color: '#ffffff', border: 'none', padding: '0.75rem', borderRadius: '0.375rem', fontWeight: 'bold', cursor: 'pointer' }}>{editIndex !== null ? 'Update Group' : 'Save Group'}</button>
          </div>
        </form>
      )}

      {items.length === 0 && !show && <p style={{ color: '#64748b' }}>No groups or classes yet.</p>}
      {items.map((g, i) => {
        const r = rate(g), miss = missing(g);
        const taking = reg && reg.index === i;
        return (
          <div key={i} style={cardBox}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem' }}>
              <div>
                <div style={{ fontWeight: 'bold', fontSize: '1.05rem', color: '#0f172a' }}>{g.name} <span style={{ fontWeight: 'normal', fontSize: '0.78rem', color: '#64748b' }}>({g.kind})</span></div>
                <div style={{ fontSize: '0.85rem', color: '#475569' }}>Teacher: {g.teacher_name || 'Not set'} - {g.meeting_day}{g.meeting_time ? ' at ' + g.meeting_time : ''}</div>
                <div style={{ fontSize: '0.85rem', color: theme, fontWeight: 'bold', marginTop: '0.3rem' }}>{(g.member_ids || []).length} member(s) - {(g.sessions || []).length} session(s){r !== null ? ' - ' + r + '% average attendance' : ''}</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', alignItems: 'flex-end' }}>
                <button type="button" onClick={() => { setForm({ ...blank, ...g, member_ids: (g.member_ids || []).map(String) }); setEditIndex(i); setShow(true); }} style={smallBtn()}>✏️ Edit</button>
                {canDelete && <button type="button" onClick={() => { if (confirm('Delete this group and its registers?')) onChange(items.filter((_, idx) => idx !== i)); }} style={smallBtn('#fee2e2', '#dc2626')}>🗑️ Delete</button>}
              </div>
            </div>
            <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '0.3rem' }}>{(g.member_ids || []).map(nameOf).filter(Boolean).join(', ') || 'No members yet.'}</div>
            {miss.length > 0 && <div style={{ fontSize: '0.82rem', color: '#92400e', backgroundColor: '#fef3c7', padding: '0.4rem 0.6rem', borderRadius: '0.4rem', marginTop: '0.5rem' }}>⚠️ Missed the last 3 sessions: {miss.map(nameOf).filter(Boolean).join(', ')}</div>}
            {!taking && <button type="button" onClick={() => setReg({ index: i, date: todayISO(), ids: ((g.sessions || []).find(s => s.date === todayISO()) || {}).present_ids || [] })} style={{ ...greenBtn, marginTop: '0.6rem', padding: '0.5rem 0.9rem' }}>✅ Take Register</button>}
            {taking && (
              <div style={{ marginTop: '0.7rem', border: '1px solid #cbd5e1', borderRadius: '0.5rem', padding: '0.7rem' }}>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <input type="date" style={{ ...formBox, width: 'auto' }} value={reg.date} onChange={(e) => setReg({ ...reg, date: e.target.value, ids: ((g.sessions || []).find(s => s.date === e.target.value) || {}).present_ids || [] })} />
                  <span style={{ fontSize: '0.85rem', color: '#475569' }}>{reg.ids.length} present</span>
                </div>
                <div style={{ maxHeight: '13rem', overflowY: 'auto' }}>
                  {(g.member_ids || []).map(String).map(id => (
                    <label key={id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.3rem 0', fontSize: '0.92rem' }}>
                      <input type="checkbox" checked={reg.ids.map(String).includes(id)} onChange={() => setReg({ ...reg, ids: reg.ids.map(String).includes(id) ? reg.ids.filter(x => String(x) !== id) : [...reg.ids, id] })} />
                      <span>{nameOf(id)}</span>
                    </label>
                  ))}
                  {(g.member_ids || []).length === 0 && <p style={{ color: '#64748b', fontSize: '0.85rem' }}>Add members to this group first (Edit).</p>}
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                  <button type="button" onClick={saveRegister} style={{ ...greenBtn, padding: '0.5rem 0.9rem' }}>Save Register</button>
                  <button type="button" onClick={() => setReg(null)} style={smallBtn()}>Cancel</button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ---------- 6) Absentee alerts (from QR check-ins) ----------
function AbsenteeTab({ members, theme, churchName, canSms }) {
  const [rows, setRows] = useState(null);
  const [err, setErr] = useState('');
  const [limit, setLimit] = useState(3);
  const [smsMsg, setSmsMsg] = useState('');
  const [busy, setBusy] = useState(false);
  const load = async () => {
    setErr('');
    const since = new Date(); since.setDate(since.getDate() - 180);
    const { data, error } = await supabase.from('attendance_checkins').select('member_id, service_date').gte('service_date', since.toISOString().slice(0, 10)).order('service_date', { ascending: false }).limit(8000);
    if (error) { setErr('Could not load check-ins: ' + error.message); setRows([]); } else setRows(data || []);
  };
  useEffect(() => { load(); }, []);
  const calc = () => {
    const byDate = {};
    (rows || []).forEach(r => { (byDate[r.service_date] = byDate[r.service_date] || new Set()).add(String(r.member_id)); });
    // a "service day" is a date with at least 3 people checked in (ignores test scans)
    const dates = Object.keys(byDate).filter(d => byDate[d].size >= 3).sort().reverse();
    const out = [];
    members.forEach(m => {
      let misses = 0, last = '';
      for (const d of dates) { if (byDate[d].has(String(m.id))) { last = d; break; } misses++; }
      if (dates.length >= limit && misses >= limit) out.push({ m, misses, last });
    });
    return { dates, out: out.sort((a, b) => b.misses - a.misses) };
  };
  const { dates, out } = rows ? calc() : { dates: [], out: [] };
  const msgFor = (m) => 'Hello ' + (m.first_name || '') + ', we have missed you at church. We are praying for you and hope to see you soon. God bless you. - ' + churchName;
  const phones = out.map(o => String(o.m.phone || '').replace(/\s+/g, '')).filter(Boolean);
  const pill = (on) => ({ backgroundColor: on ? theme : '#f1f5f9', color: on ? '#ffffff' : '#334155', border: 'none', padding: '0.45rem 0.8rem', borderRadius: '0.5rem', fontWeight: '600', cursor: 'pointer', fontSize: '0.82rem' });
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#0f172a', margin: 0 }}>Absentee Alerts</h3>
        <button type="button" onClick={load} style={smallBtn()}>↻ Refresh</button>
      </div>
      <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: 0 }}>Members who have not checked in (QR attendance) for several services in a row. Based on {dates.length} service day(s) in the last 6 months.</p>
      <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', marginBottom: '0.9rem', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '0.85rem', color: '#475569' }}>Missed at least</span>
        {[2, 3, 4, 6].map(n => <button key={n} type="button" onClick={() => setLimit(n)} style={pill(limit === n)}>{n}</button>)}
        <span style={{ fontSize: '0.85rem', color: '#475569' }}>services in a row</span>
      </div>
      {err && <div style={noteBox(true)}>{err}</div>}
      {rows === null && <p style={{ color: '#64748b' }}>Loading...</p>}
      {rows && dates.length < limit && !err && <p style={{ color: '#64748b' }}>Not enough QR check-in history yet. Alerts appear after at least {limit} services have been scanned with 3 or more people.</p>}
      {rows && dates.length >= limit && (
        <div>
          <div style={{ ...cardBox, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
            <strong>{out.length} member(s) to follow up</strong>
            {canSms && phones.length > 0 && <button type="button" disabled={busy} onClick={async () => { if (!confirm('Send the "we miss you" SMS to ' + phones.length + ' people?')) return; setBusy(true); setSmsMsg('Sending...'); setSmsMsg(await sendAppSms(phones, 'Hello, we have missed you at church. We are praying for you and hope to see you soon. God bless you. - ' + churchName)); setBusy(false); }} style={{ ...greenBtn, backgroundColor: '#f5a623', padding: '0.5rem 0.9rem' }}>{busy ? 'Sending...' : '📲 SMS all ' + phones.length}</button>}
          </div>
          {smsMsg && <div style={noteBox(isBad(smsMsg))}>{smsMsg}</div>}
          {out.map(({ m, misses, last }) => {
            const phone = String(m.phone || '').replace(/\s+/g, '');
            return (
              <div key={m.id} style={cardBox}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <div>
                    <div style={{ fontWeight: 'bold', color: '#0f172a' }}>{displayName(m)}</div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{last ? 'Last seen ' + dayName(last) : 'No check-in in the last 6 months'}</div>
                  </div>
                  <span style={{ alignSelf: 'flex-start', backgroundColor: misses >= 4 ? '#fee2e2' : '#fef3c7', color: misses >= 4 ? '#991b1b' : '#92400e', padding: '0.15rem 0.6rem', borderRadius: '1rem', fontSize: '0.75rem', fontWeight: 'bold' }}>Missed {misses}</span>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.5rem' }}>
                  {phone ? <a href={'tel:' + phone} style={smallBtn('#eff6ff', '#1d4ed8')}>📞 Call</a> : <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>No phone number</span>}
                  {phone ? <a href={'sms:' + phone + '?body=' + encodeURIComponent(msgFor(m))} style={smallBtn('#eff6ff', '#1d4ed8')}>💬 SMS</a> : null}
                  {phone ? <a href={'https://wa.me/' + waNumber(phone) + '?text=' + encodeURIComponent(msgFor(m))} target="_blank" rel="noopener noreferrer" style={smallBtn('#dcfce7', '#166534')}>🟢 WhatsApp</a> : null}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ---------- 7) Event RSVP ----------
const eventKey = (ev) => String(ev.title || '') + '|' + String(ev.date || '');
function MemberEvents({ events, user, member, theme }) {
  const email = String((user && user.email) || '').toLowerCase();
  const [mine, setMine] = useState({});
  const [guests, setGuests] = useState({});
  const [msg, setMsg] = useState('');
  const load = async () => {
    if (!email) return;
    const { data } = await supabase.from('event_rsvps').select('event_key, guests').eq('member_email', email);
    const o = {}; (data || []).forEach(r => { o[r.event_key] = r.guests || 0; }); setMine(o);
  };
  useEffect(() => { load(); }, [email]);
  const go = async (ev) => {
    const k = eventKey(ev);
    const g = Math.max(0, Math.min(20, parseInt(guests[k] || 0, 10) || 0));
    setMsg('');
    const { error } = await supabase.from('event_rsvps').upsert({ event_key: k, event_title: ev.title, event_date: ev.date || null, member_id: String((member && member.id) || ''), member_email: email, member_name: displayName(member || {}), phone: (member && member.phone) || '', guests: g }, { onConflict: 'event_key,member_email' });
    if (error) setMsg('Could not RSVP: ' + error.message + ' (has supabase-batch5.sql been run?)'); else { setMsg("You're on the list. See you there!"); load(); }
  };
  const cancel = async (ev) => {
    await supabase.from('event_rsvps').delete().eq('member_email', email).eq('event_key', eventKey(ev));
    setMsg('Your RSVP was cancelled.'); load();
  };
  const today = todayISO();
  return (
    <div style={{ backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '0.75rem', padding: '1.25rem 1.5rem', marginBottom: '1rem' }}>
      <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: theme, margin: '0 0 0.75rem 0' }}>Church Events</h3>
      {msg && <div style={{ ...noteBox(isBad(msg)), marginTop: 0, marginBottom: '0.7rem' }}>{msg}</div>}
      {events.length > 0 ? events.slice(0, 10).map((ev, i) => {
        const k = eventKey(ev);
        const going = Object.prototype.hasOwnProperty.call(mine, k);
        const past = ev.date && ev.date < today;
        return (
          <div key={i} style={{ padding: '0.6rem 0', borderBottom: '1px dashed #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '600', color: '#0f172a' }}><span>{ev.title}</span><span style={{ fontSize: '0.8rem', color: '#64748b' }}>{ev.date}</span></div>
            {ev.description ? <div style={{ fontSize: '0.9rem', color: '#334155' }}>{ev.description}</div> : null}
            {!past && (going
              ? <div style={{ marginTop: '0.4rem', display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}><span style={{ color: '#166534', fontWeight: 'bold', fontSize: '0.88rem' }}>✓ You are going{mine[k] ? ' (+' + mine[k] + ' guest' + (mine[k] > 1 ? 's' : '') + ')' : ''}</span><button type="button" onClick={() => cancel(ev)} style={smallBtn('#fee2e2', '#991b1b')}>Cancel</button></div>
              : <div style={{ marginTop: '0.4rem', display: 'flex', gap: '0.4rem', alignItems: 'center', flexWrap: 'wrap' }}>
                  <input type="number" min="0" max="20" style={{ ...formBox, width: '6.5rem' }} placeholder="Guests" value={guests[k] || ''} onChange={(e) => setGuests({ ...guests, [k]: e.target.value })} />
                  <button type="button" onClick={() => go(ev)} style={{ ...greenBtn, padding: '0.45rem 0.9rem' }}>I will attend</button>
                </div>)}
          </div>
        );
      }) : <p style={{ margin: 0, fontSize: '0.9rem', color: '#64748b' }}>No upcoming events right now.</p>}
    </div>
  );
}

function RsvpAdmin({ events, theme, openPrint, churchName }) {
  const [rows, setRows] = useState(null);
  const [err, setErr] = useState('');
  const [sel, setSel] = useState('');
  const load = async () => {
    setErr('');
    const { data, error } = await supabase.from('event_rsvps').select('*').order('created_at', { ascending: true }).limit(3000);
    if (error) { setErr('Could not load RSVPs: ' + error.message + ' (has supabase-batch5.sql been run?)'); setRows([]); } else setRows(data || []);
  };
  useEffect(() => { load(); }, []);
  const keys = Array.from(new Set([...(events || []).map(eventKey), ...(rows || []).map(r => r.event_key)]));
  const label = (k) => { const p = k.split('|'); return p[0] + (p[1] ? ' (' + p[1] + ')' : ''); };
  const cur = sel || keys[0] || '';
  const list = (rows || []).filter(r => r.event_key === cur);
  const heads = list.reduce((s, r) => s + 1 + (r.guests || 0), 0);
  const print = () => {
    const tr = list.map((r, i) => '<tr><td>' + (i + 1) + '</td><td>' + (r.member_name || '') + '</td><td>' + (r.phone || '') + '</td><td>' + (r.guests || 0) + '</td><td></td></tr>').join('');
    openPrint('RSVP list', '<h2>' + label(cur) + ' - RSVP List</h2><p>' + list.length + ' member(s), ' + heads + ' people expected including guests.</p><table><tr><th>#</th><th>Name</th><th>Phone</th><th>Guests</th><th>Present</th></tr>' + tr + '</table>');
  };
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#0f172a', margin: 0 }}>Event RSVPs</h3>
        <button type="button" onClick={load} style={smallBtn()}>↻ Refresh</button>
      </div>
      {err && <div style={noteBox(true)}>{err}</div>}
      {rows === null && <p style={{ color: '#64748b' }}>Loading...</p>}
      {rows && keys.length === 0 && !err && <p style={{ color: '#64748b' }}>No events yet. Add an event first (Meetings → Events).</p>}
      {keys.length > 0 && (
        <div>
          <select style={{ ...formBox, marginBottom: '0.7rem' }} value={cur} onChange={(e) => setSel(e.target.value)}>{keys.map(k => <option key={k} value={k}>{label(k)}</option>)}</select>
          <div style={{ ...cardBox, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div><strong>{list.length}</strong> member(s) - <strong>{heads}</strong> people expected</div>
            <div style={{ display: 'flex', gap: '0.4rem' }}>
              <button type="button" disabled={!list.length} onClick={print} style={smallBtn('#2563eb', '#ffffff')}>⬇ PDF list</button>
              <button type="button" disabled={!list.length} onClick={() => { try { navigator.clipboard.writeText(list.map(r => r.phone).filter(Boolean).join(', ')); alert('Phone numbers copied.'); } catch (e) {} }} style={smallBtn()}>Copy numbers</button>
            </div>
          </div>
          {list.length === 0 && <p style={{ color: '#64748b' }}>No one has said they will attend yet.</p>}
          {list.map((r, i) => (
            <div key={r.id} style={{ ...cardBox, display: 'flex', justifyContent: 'space-between', gap: '0.5rem', padding: '0.6rem 1rem', marginBottom: '0.4rem' }}>
              <span><strong>{i + 1}. {r.member_name}</strong>{r.guests ? ' +' + r.guests : ''}</span>
              <span style={{ fontSize: '0.82rem', color: '#64748b' }}>{r.phone}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ---------- 8) Volunteer availability ----------
function nextSundays(n) {
  const out = []; const d = new Date(); d.setHours(12, 0, 0, 0);
  d.setDate(d.getDate() + ((7 - d.getDay()) % 7));
  for (let i = 0; i < n; i++) { out.push(d.toISOString().slice(0, 10)); d.setDate(d.getDate() + 7); }
  return out;
}
function MemberVolunteer({ user, member, theme }) {
  const email = String((user && user.email) || '').toLowerCase();
  const [rows, setRows] = useState(null);
  const [date, setDate] = useState('');
  const [duty, setDuty] = useState('Any');
  const [note, setNote] = useState('');
  const [msg, setMsg] = useState('');
  const load = async () => {
    const { data, error } = await supabase.from('volunteer_availability').select('*').eq('member_email', email).gte('avail_date', todayISO()).order('avail_date', { ascending: true });
    if (error) { setMsg('Could not load: ' + error.message + ' (has supabase-batch5.sql been run?)'); setRows([]); } else setRows(data || []);
  };
  useEffect(() => { if (email) load(); }, [email]);
  const add = async (d) => {
    const when = d || date;
    if (!when) { setMsg('Please pick a date.'); return; }
    setMsg('');
    const { error } = await supabase.from('volunteer_availability').upsert({ member_id: String((member && member.id) || ''), member_email: email, member_name: displayName(member || {}), phone: (member && member.phone) || '', avail_date: when, duty, note: note.trim() }, { onConflict: 'member_email,avail_date' });
    if (error) setMsg('Could not save: ' + error.message); else { setMsg('Thank you! You are marked available on ' + dayName(when) + '.'); setDate(''); setNote(''); load(); }
  };
  const remove = async (id) => { await supabase.from('volunteer_availability').delete().eq('id', id); load(); };
  const have = new Set((rows || []).map(r => r.avail_date));
  return (
    <div>
      <div style={{ ...cardBox, border: '2px solid ' + theme }}>
        <h3 style={{ margin: '0 0 0.4rem 0', color: theme, fontSize: '1.1rem' }}>🙋 I Can Serve</h3>
        <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '0 0 0.8rem 0' }}>Tell the rota team the days you are free to serve. They will use this when they plan the duty roster.</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.8rem' }}>
          {nextSundays(6).map(d => <button key={d} type="button" onClick={() => add(d)} disabled={have.has(d)} style={{ ...smallBtn(have.has(d) ? '#dcfce7' : '#f1f5f9', have.has(d) ? '#166534' : '#334155'), border: '1px solid #cbd5e1' }}>{have.has(d) ? '✓ ' : ''}{dayName(d).replace(/,? \d{4}$/, '')}</button>)}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          <label style={formLab}>Or choose another date</label>
          <input type="date" style={formBox} min={todayISO()} value={date} onChange={(e) => setDate(e.target.value)} />
          <select style={formBox} value={duty} onChange={(e) => setDuty(e.target.value)}><option value="Any">I can serve anywhere</option>{SUB_DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}</select>
          <input style={formBox} placeholder="Note (optional), e.g. only after 10am" value={note} onChange={(e) => setNote(e.target.value)} />
          <button type="button" onClick={() => add()} style={{ backgroundColor: theme, color: '#ffffff', border: 'none', padding: '0.75rem', borderRadius: '0.5rem', fontWeight: 'bold', cursor: 'pointer' }}>Save my availability</button>
        </div>
        {msg && <div style={noteBox(isBad(msg))}>{msg}</div>}
      </div>
      <h4 style={{ color: theme, margin: '1rem 0 0.5rem 0' }}>My upcoming availability</h4>
      {rows === null && <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Loading...</p>}
      {rows && rows.length === 0 && <p style={{ color: '#64748b', fontSize: '0.9rem' }}>You have not marked any date yet.</p>}
      {(rows || []).map(r => (
        <div key={r.id} style={{ ...cardBox, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem', padding: '0.7rem 1rem', marginBottom: '0.5rem' }}>
          <span><strong>{dayName(r.avail_date)}</strong><br /><span style={{ fontSize: '0.8rem', color: '#64748b' }}>{r.duty === 'Any' ? 'Anywhere' : r.duty}{r.note ? ' - ' + r.note : ''}</span></span>
          <button type="button" onClick={() => remove(r.id)} style={smallBtn('#fee2e2', '#991b1b')}>Remove</button>
        </div>
      ))}
    </div>
  );
}

function VolunteerAdmin({ members, rotas, theme }) {
  const [rows, setRows] = useState(null);
  const [err, setErr] = useState('');
  const [sel, setSel] = useState('');
  const [copied, setCopied] = useState('');
  const load = async () => {
    setErr('');
    const { data, error } = await supabase.from('volunteer_availability').select('*').gte('avail_date', todayISO()).order('avail_date', { ascending: true }).limit(3000);
    if (error) { setErr('Could not load availability: ' + error.message + ' (has supabase-batch5.sql been run?)'); setRows([]); } else setRows(data || []);
  };
  useEffect(() => { load(); }, []);
  const dates = Array.from(new Set((rows || []).map(r => r.avail_date)));
  const cur = sel && dates.includes(sel) ? sel : dates[0] || '';
  const avail = (rows || []).filter(r => r.avail_date === cur);
  const dutyRotas = (rotas || []).filter(r => r.rota_date === cur);
  const bookedText = dutyRotas.map(r => String(r.assigned || '').toLowerCase()).join(' | ');
  const isBooked = (r) => {
    const m = members.find(x => String(x.id) === String(r.member_id));
    const nm = String(m ? displayName(m) : r.member_name || '').toLowerCase();
    const first = String((m && m.first_name) || '').toLowerCase();
    return !!bookedText && ((nm && bookedText.includes(nm)) || (first && bookedText.includes(first)));
  };
  const free = avail.filter(r => !isBooked(r));
  const byDuty = {};
  free.forEach(r => { (byDuty[r.duty || 'Any'] = byDuty[r.duty || 'Any'] || []).push(r); });
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#0f172a', margin: 0 }}>Volunteers Available</h3>
        <button type="button" onClick={load} style={smallBtn()}>↻ Refresh</button>
      </div>
      <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: 0 }}>Members who said they can serve. Those already named on the duty rota for the same date are marked, so you can pick from the free ones.</p>
      {err && <div style={noteBox(true)}>{err}</div>}
      {rows === null && <p style={{ color: '#64748b' }}>Loading...</p>}
      {rows && dates.length === 0 && !err && <p style={{ color: '#64748b' }}>No one has marked availability yet.</p>}
      {dates.length > 0 && (
        <div>
          <select style={{ ...formBox, marginBottom: '0.7rem' }} value={cur} onChange={(e) => setSel(e.target.value)}>{dates.map(d => <option key={d} value={d}>{dayName(d)} ({(rows || []).filter(r => r.avail_date === d).length})</option>)}</select>
          <div style={{ ...cardBox, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span><strong>{free.length}</strong> free - {avail.length - free.length} already on the rota</span>
            <button type="button" disabled={!free.length} onClick={() => { const t = free.map(r => r.member_name).join(', '); try { navigator.clipboard.writeText(t); setCopied('Names copied. Paste them into a Duty Rota entry.'); } catch (e) { prompt('Copy:', t); } }} style={smallBtn(theme, '#ffffff')}>Copy free names</button>
          </div>
          {copied && <div style={noteBox(false)}>{copied}</div>}
          {Object.keys(byDuty).map(d => (
            <div key={d} style={cardBox}>
              <div style={{ fontWeight: 'bold', color: theme, marginBottom: '0.3rem' }}>{d === 'Any' ? 'Can serve anywhere' : d}</div>
              {byDuty[d].map(r => (
                <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem', padding: '0.3rem 0', borderBottom: '1px dashed #e2e8f0', fontSize: '0.9rem' }}>
                  <span>{r.member_name}{r.note ? <span style={{ color: '#64748b', fontSize: '0.8rem' }}> - {r.note}</span> : null}</span>
                  {r.phone ? <a href={'tel:' + String(r.phone).replace(/\s+/g, '')} style={{ color: theme, textDecoration: 'none', fontSize: '0.82rem' }}>📞 {r.phone}</a> : null}
                </div>
              ))}
            </div>
          ))}
          {avail.length - free.length > 0 && (
            <div style={{ ...cardBox, backgroundColor: '#f8fafc' }}>
              <div style={{ fontWeight: 'bold', color: '#64748b', marginBottom: '0.3rem' }}>Already on the duty rota for this date</div>
              {avail.filter(isBooked).map(r => <div key={r.id} style={{ fontSize: '0.88rem', color: '#64748b' }}>{r.member_name}</div>)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}


// ---------- Church Leaders: pick the member, department fills in from the lists ----------
function LeadersTab({ items, onAdd, onDelete, canDelete, members, theme }) {
  const blank = { member_id: '', leader_name: '', position: '', department: '', phone: '', email: '', since: '', notes: '', photo_url: '' };
  const [show, setShow] = useState(false);
  const [form, setForm] = useState(blank);
  const [manual, setManual] = useState(false);
  const box = { width: '100%', padding: '0.6rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1', boxSizing: 'border-box', backgroundColor: '#ffffff' };
  const lab = { display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#475569', marginBottom: '0.25rem' };
  const sorted = [...members].sort((a, b) => String((a.first_name || '') + (a.last_name || '')).localeCompare(String((b.first_name || '') + (b.last_name || ''))));
  const fullName = (m) => displayName(m);

  const pickMember = (id) => {
    if (id === '__other') { setManual(true); setForm({ ...blank, position: form.position }); return; }
    setManual(false);
    const m = members.find(x => String(x.id) === id);
    if (!m) { setForm({ ...blank, position: form.position }); return; }
    setForm({ ...form, member_id: id, leader_name: fullName(m), phone: m.phone || '', email: m.email || '', department: m.core_department || form.department, photo_url: m.photo_url || '' });
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#0f172a', margin: 0 }}>Church Leaders</h3>
        <button type="button" onClick={() => { setShow(!show); setForm(blank); setManual(false); }} style={{ backgroundColor: '#10b981', color: '#ffffff', border: 'none', padding: '0.65rem 1rem', borderRadius: '0.5rem', fontWeight: 'bold', fontSize: '0.9rem', cursor: 'pointer' }}>{show ? 'Cancel' : '+ Add Leader'}</button>
      </div>

      {show && (
        <form
          onSubmit={(e) => { e.preventDefault(); onAdd({ ...form, recorded_on: new Date().toISOString().slice(0, 10) }); setForm(blank); setManual(false); setShow(false); }}
          style={{ backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '0.75rem', padding: '1.25rem', marginBottom: '1.25rem' }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div>
              <label style={lab}>Select member *</label>
              <select style={box} required value={manual ? '__other' : form.member_id} onChange={(e) => pickMember(e.target.value)}>
                <option value="">-- Choose a member --</option>
                {sorted.map(m => <option key={m.id} value={String(m.id)}>{fullName(m) || m.email}</option>)}
                <option value="__other">Not in the member list (type the name)</option>
              </select>
            </div>
            {manual && (
              <div><label style={lab}>Name *</label><input style={box} required value={form.leader_name} onChange={(e) => setForm({ ...form, leader_name: e.target.value })} /></div>
            )}
            <div>
              <label style={lab}>Position / Title *</label>
              <input style={box} required list="leader-positions" value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} placeholder="e.g. Elder, Secretary" />
              <datalist id="leader-positions">
                {['Pastor', 'Assistant Pastor', 'Elder', 'Deacon', 'Deaconess', 'Secretary', 'Treasurer', 'Choir Master', 'Head Usher', 'Department Head', 'Youth Leader', "Women's Leader", "Men's Leader"].map(p => <option key={p} value={p} />)}
              </datalist>
            </div>
            <div>
              <label style={lab}>Department / Ministry</label>
              <select style={box} value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })}>
                <option value="">-- Choose department --</option>
                <optgroup label="Core Departments">
                  {CORE_DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                </optgroup>
                <optgroup label="Sub-Departments / Ministries">
                  {SUB_DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                </optgroup>
              </select>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div><label style={lab}>Phone</label><input style={box} type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
              <div><label style={lab}>Email</label><input style={box} type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
            </div>
            <div><label style={lab}>Serving since</label><input style={box} type="date" value={form.since} onChange={(e) => setForm({ ...form, since: e.target.value })} /></div>
            <div><label style={lab}>Notes</label><textarea style={{ ...box, minHeight: '4rem' }} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
            <button type="submit" style={{ backgroundColor: theme, color: '#ffffff', border: 'none', padding: '0.75rem', borderRadius: '0.375rem', fontWeight: 'bold', cursor: 'pointer' }}>Save</button>
          </div>
        </form>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {items.length > 0 ? items.map((l, i) => (
          <div key={i} style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '0.75rem', padding: '1rem 1.25rem', display: 'flex', gap: '0.9rem', alignItems: 'flex-start' }}>
            {l.photo_url ? (
              <img src={l.photo_url} alt={l.leader_name} style={{ width: '3.2rem', height: '3.2rem', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
            ) : (
              <div style={{ width: '3.2rem', height: '3.2rem', borderRadius: '50%', backgroundColor: '#cbd5e1', color: '#334155', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', flexShrink: 0 }}>{String(l.leader_name || '?').trim().charAt(0).toUpperCase()}</div>
            )}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem' }}>
                <h4 style={{ margin: 0, color: theme, fontSize: '1rem' }}>{l.leader_name}</h4>
                {canDelete && (
                  <button type="button" onClick={() => { if (window.confirm('Remove this leader?')) onDelete(i); }} style={{ backgroundColor: '#fee2e2', color: '#991b1b', border: 'none', padding: '0.25rem 0.6rem', borderRadius: '0.25rem', cursor: 'pointer', fontSize: '0.8rem' }}>Delete</button>
                )}
              </div>
              <div style={{ fontSize: '0.88rem', color: '#334155', lineHeight: 1.6 }}>
                <div><strong>{l.position}</strong>{l.department ? ' - ' + l.department : ''}</div>
                {l.phone ? <div>📞 {l.phone}</div> : null}
                {l.email ? <div style={{ wordBreak: 'break-word' }}>✉️ {l.email}</div> : null}
                {l.since ? <div>Serving since: {l.since}</div> : null}
                {l.notes ? <div style={{ color: '#64748b' }}>{l.notes}</div> : null}
              </div>
            </div>
          </div>
        )) : (
          <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '0.75rem', padding: '2rem', textAlign: 'center', color: '#64748b' }}>
            <p style={{ margin: 0 }}>No leaders recorded yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ---------- Small QR code generator (byte mode, error correction level M, versions 1-10) ----------
const QR_ECC_PER_BLOCK_M = [-1, 10, 16, 26, 18, 24, 16, 18, 22, 22, 26];
const QR_NUM_BLOCKS_M = [-1, 1, 1, 1, 2, 2, 4, 4, 4, 5, 5];

function qrRawModules(ver) {
  let result = (16 * ver + 128) * ver + 64;
  if (ver >= 2) {
    const numAlign = Math.floor(ver / 7) + 2;
    result -= (25 * numAlign - 10) * numAlign - 55;
    if (ver >= 7) result -= 36;
  }
  return result;
}
function qrDataCodewords(ver) {
  return Math.floor(qrRawModules(ver) / 8) - QR_ECC_PER_BLOCK_M[ver] * QR_NUM_BLOCKS_M[ver];
}
function qrAlignPositions(ver) {
  if (ver === 1) return [];
  const numAlign = Math.floor(ver / 7) + 2;
  const size = ver * 4 + 17;
  const step = Math.ceil((ver * 4 + 4) / (numAlign * 2 - 2)) * 2;
  const result = [6];
  for (let pos = size - 7; result.length < numAlign; pos -= step) result.splice(1, 0, pos);
  return result;
}
function qrGfMul(x, y) {
  let z = 0;
  for (let i = 7; i >= 0; i--) {
    z = (z << 1) ^ ((z >>> 7) * 0x11d);
    z ^= ((y >>> i) & 1) * x;
  }
  return z;
}
function qrRsDivisor(degree) {
  const result = [];
  for (let i = 0; i < degree - 1; i++) result.push(0);
  result.push(1);
  let root = 1;
  for (let i = 0; i < degree; i++) {
    for (let j = 0; j < result.length; j++) {
      result[j] = qrGfMul(result[j], root);
      if (j + 1 < result.length) result[j] ^= result[j + 1];
    }
    root = qrGfMul(root, 0x02);
  }
  return result;
}
function qrRsRemainder(data, divisor) {
  const result = divisor.map(() => 0);
  for (const b of data) {
    const factor = b ^ result.shift();
    result.push(0);
    divisor.forEach((coef, i) => { result[i] ^= qrGfMul(coef, factor); });
  }
  return result;
}
function qrUtf8Bytes(text) {
  const out = [];
  const enc = unescape(encodeURIComponent(text));
  for (let i = 0; i < enc.length; i++) out.push(enc.charCodeAt(i));
  return out;
}

function makeQrMatrix(text) {
  const bytes = qrUtf8Bytes(text);
  let ver = 1;
  for (; ver <= 10; ver++) {
    const lenBits = ver < 10 ? 8 : 16;
    if (4 + lenBits + bytes.length * 8 <= qrDataCodewords(ver) * 8) break;
  }
  if (ver > 10) throw new Error('Text too long for the QR code');

  // 1) bit stream
  const bits = [];
  const put = (val, len) => { for (let i = len - 1; i >= 0; i--) bits.push((val >>> i) & 1); };
  put(0x4, 4);
  put(bytes.length, ver < 10 ? 8 : 16);
  bytes.forEach(b => put(b, 8));
  const capBits = qrDataCodewords(ver) * 8;
  put(0, Math.min(4, capBits - bits.length));
  put(0, (8 - (bits.length % 8)) % 8);
  for (let pad = 0xec; bits.length < capBits; pad ^= 0xec ^ 0x11) put(pad, 8);
  const data = [];
  for (let i = 0; i < bits.length; i += 8) {
    let v = 0;
    for (let j = 0; j < 8; j++) v = (v << 1) | bits[i + j];
    data.push(v);
  }

  // 2) error correction + interleave
  const numBlocks = QR_NUM_BLOCKS_M[ver];
  const blockEcc = QR_ECC_PER_BLOCK_M[ver];
  const rawCodewords = Math.floor(qrRawModules(ver) / 8);
  const numShort = numBlocks - (rawCodewords % numBlocks);
  const shortLen = Math.floor(rawCodewords / numBlocks);
  const blocks = [];
  const div = qrRsDivisor(blockEcc);
  for (let i = 0, k = 0; i < numBlocks; i++) {
    const dat = data.slice(k, k + shortLen - blockEcc + (i < numShort ? 0 : 1));
    k += dat.length;
    const ecc = qrRsRemainder(dat, div);
    if (i < numShort) dat.push(0);
    blocks.push(dat.concat(ecc));
  }
  const all = [];
  for (let i = 0; i < blocks[0].length; i++) {
    blocks.forEach((blk, j) => { if (i !== shortLen - blockEcc || j >= numShort) all.push(blk[i]); });
  }

  // 3) draw
  const size = ver * 4 + 17;
  const modules = [];
  const isFn = [];
  for (let i = 0; i < size; i++) { modules.push(new Array(size).fill(false)); isFn.push(new Array(size).fill(false)); }
  const setFn = (x, y, dark) => { modules[y][x] = dark; isFn[y][x] = true; };

  for (let i = 0; i < size; i++) { setFn(6, i, i % 2 === 0); setFn(i, 6, i % 2 === 0); }
  const finder = (cx, cy) => {
    for (let dy = -4; dy <= 4; dy++) for (let dx = -4; dx <= 4; dx++) {
      const dist = Math.max(Math.abs(dx), Math.abs(dy));
      const xx = cx + dx, yy = cy + dy;
      if (xx >= 0 && xx < size && yy >= 0 && yy < size) setFn(xx, yy, dist !== 2 && dist !== 4);
    }
  };
  finder(3, 3); finder(size - 4, 3); finder(3, size - 4);
  const ap = qrAlignPositions(ver);
  const n = ap.length;
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
    if ((i === 0 && j === 0) || (i === 0 && j === n - 1) || (i === n - 1 && j === 0)) continue;
    for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) setFn(ap[i] + dx, ap[j] + dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1);
  }
  const drawFormat = (mask) => {
    const fdata = (0 << 3) | mask; // level M = 00
    let rem = fdata;
    for (let i = 0; i < 10; i++) rem = (rem << 1) ^ ((rem >>> 9) * 0x537);
    const fbits = ((fdata << 10) | rem) ^ 0x5412;
    const bit = (i) => ((fbits >>> i) & 1) !== 0;
    for (let i = 0; i <= 5; i++) setFn(8, i, bit(i));
    setFn(8, 7, bit(6)); setFn(8, 8, bit(7)); setFn(7, 8, bit(8));
    for (let i = 9; i < 15; i++) setFn(14 - i, 8, bit(i));
    for (let i = 0; i < 8; i++) setFn(size - 1 - i, 8, bit(i));
    for (let i = 8; i < 15; i++) setFn(8, size - 15 + i, bit(i));
    setFn(8, size - 8, true);
  };
  drawFormat(0);
  if (ver >= 7) {
    let rem = ver;
    for (let i = 0; i < 12; i++) rem = (rem << 1) ^ ((rem >>> 11) * 0x1f25);
    const vbits = (ver << 12) | rem;
    for (let i = 0; i < 18; i++) {
      const bit = ((vbits >>> i) & 1) !== 0;
      const a = size - 11 + (i % 3), b = Math.floor(i / 3);
      setFn(a, b, bit); setFn(b, a, bit);
    }
  }

  // codewords in zigzag
  let bitIdx = 0;
  for (let right = size - 1; right >= 1; right -= 2) {
    if (right === 6) right = 5;
    for (let vert = 0; vert < size; vert++) {
      for (let j = 0; j < 2; j++) {
        const x = right - j;
        const upward = ((right + 1) & 2) === 0;
        const y = upward ? size - 1 - vert : vert;
        if (!isFn[y][x] && bitIdx < all.length * 8) {
          modules[y][x] = ((all[bitIdx >>> 3] >>> (7 - (bitIdx & 7))) & 1) !== 0;
          bitIdx++;
        }
      }
    }
  }

  // masks
  const applyMask = (mask) => {
    for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
      let inv;
      switch (mask) {
        case 0: inv = (x + y) % 2 === 0; break;
        case 1: inv = y % 2 === 0; break;
        case 2: inv = x % 3 === 0; break;
        case 3: inv = (x + y) % 3 === 0; break;
        case 4: inv = (Math.floor(x / 3) + Math.floor(y / 2)) % 2 === 0; break;
        case 5: inv = (x * y) % 2 + (x * y) % 3 === 0; break;
        case 6: inv = ((x * y) % 2 + (x * y) % 3) % 2 === 0; break;
        default: inv = ((x + y) % 2 + (x * y) % 3) % 2 === 0;
      }
      if (!isFn[y][x] && inv) modules[y][x] = !modules[y][x];
    }
  };
  const penalty = () => {
    let p = 0;
    const lines = [];
    for (let y = 0; y < size; y++) lines.push(modules[y].map(v => (v ? '1' : '0')).join(''));
    for (let x = 0; x < size; x++) { let s = ''; for (let y = 0; y < size; y++) s += modules[y][x] ? '1' : '0'; lines.push(s); }
    lines.forEach(s => {
      let run = 1;
      for (let i = 1; i <= s.length; i++) {
        if (i < s.length && s[i] === s[i - 1]) run++;
        else { if (run >= 5) p += 3 + (run - 5); run = 1; }
      }
      p += 40 * ((s.match(/(?=00001011101)/g) || []).length + (s.match(/(?=10111010000)/g) || []).length);
    });
    for (let y = 0; y < size - 1; y++) for (let x = 0; x < size - 1; x++) {
      const c = modules[y][x];
      if (c === modules[y][x + 1] && c === modules[y + 1][x] && c === modules[y + 1][x + 1]) p += 3;
    }
    let dark = 0;
    modules.forEach(r => r.forEach(v => { if (v) dark++; }));
    const total = size * size;
    p += (Math.ceil(Math.abs(dark * 20 - total * 10) / total) - 1) * 10;
    return p;
  };
  let best = 0, bestPen = Infinity;
  for (let m = 0; m < 8; m++) {
    applyMask(m); drawFormat(m);
    const pen = penalty();
    if (pen < bestPen) { bestPen = pen; best = m; }
    applyMask(m);
  }
  applyMask(best); drawFormat(best);
  return modules;
}


const TITLES = ['Mr.', 'Mrs.', 'Miss', 'Prophet', 'Pastor', 'Apostle', 'Rev.', 'Evangelist', 'Elder', 'Deacon', 'Deaconess'];
const displayName = (m) => [m && m.title, m && m.first_name, m && m.last_name].filter(Boolean).join(' ').trim();

function QRCodeSvg({ text, size }) {
  let matrix = null;
  try { matrix = makeQrMatrix(text); } catch (e) { matrix = null; }
  if (!matrix) return <div style={{ color: '#991b1b' }}>Could not make the QR code.</div>;
  const quiet = 4;
  const total = matrix.length + quiet * 2;
  let d = '';
  matrix.forEach((row, y) => row.forEach((v, x) => { if (v) d += 'M' + (x + quiet) + ',' + (y + quiet) + 'h1v1h-1z'; }));
  return (
    <svg viewBox={'0 0 ' + total + ' ' + total} width={size || 240} height={size || 240} shapeRendering="crispEdges" style={{ backgroundColor: '#ffffff', maxWidth: '100%', height: 'auto' }}>
      <path d={d} fill="#000000" />
    </svg>
  );
}

function downloadQrPng(text, filename, caption) {
  const matrix = makeQrMatrix(text);
  const scale = 10, quiet = 4, n = matrix.length;
  const w = (n + quiet * 2) * scale;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = w + 70;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#000000';
  matrix.forEach((row, y) => row.forEach((v, x) => { if (v) ctx.fillRect((x + quiet) * scale, (y + quiet) * scale, scale, scale); }));
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 28px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(caption || '', w / 2, w + 20);
  canvas.toBlob((blob) => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  }, 'image/png');
}

// ---------- QR Check-in (admins): scan a member's QR code or search by name ----------
function CheckinTab({ members, serviceOptions, date, setDate, service, setService, checkins, onCheckin, onDelete, canDelete, theme, message }) {
  const [search, setSearch] = useState('');
  const [scanning, setScanning] = useState(false);
  const [scanMsg, setScanMsg] = useState('');
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const timerRef = useRef(null);
  const busyRef = useRef(false);

  const stop = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
    if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    setScanning(false);
  };
  useEffect(() => stop, []);

  const handleScanned = async (id) => {
    const m = members.find(x => String(x.id) === String(id));
    if (!m) return 'This QR code does not belong to a registered member.';
    return await onCheckin(m);
  };

  const start = async () => {
    setScanMsg('');
    if (typeof window === 'undefined' || !('BarcodeDetector' in window)) {
      setScanMsg('This browser cannot scan QR codes. Please use "Search member" below.');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      streamRef.current = stream;
      setScanning(true);
      setTimeout(async () => {
        const v = videoRef.current;
        if (!v) return;
        v.srcObject = stream;
        try { await v.play(); } catch (e) { /* ignore */ }
        const detector = new window.BarcodeDetector({ formats: ['qr_code'] });
        timerRef.current = setInterval(async () => {
          if (busyRef.current) return;
          try {
            const codes = await detector.detect(v);
            if (codes && codes.length) {
              const raw = codes[0].rawValue || '';
              if (raw.startsWith('GPC:')) {
                busyRef.current = true;
                setScanMsg(await handleScanned(raw.slice(4)));
                setTimeout(() => { busyRef.current = false; }, 2500);
              }
            }
          } catch (e) { /* keep scanning */ }
        }, 400);
      }, 150);
    } catch (e) {
      setScanMsg('Could not open the camera: ' + e.message);
    }
  };

  const box = { width: '100%', padding: '0.65rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1', boxSizing: 'border-box', backgroundColor: '#ffffff', fontSize: '0.95rem' };
  const lab = { display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#475569', marginBottom: '0.3rem' };
  const q = search.trim().toLowerCase();
  const matches = q ? members.filter(m => (displayName(m) + ' ' + (m.phone || '') + ' ' + (m.email || '')).toLowerCase().includes(q)).slice(0, 8) : [];
  const done = new Set(checkins.map(c => String(c.member_id)));

  return (
    <div>
      <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#0f172a', margin: '0 0 0.5rem 0' }}>QR Check-in</h3>
      <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: 0 }}>Choose the service, then scan each member's QR code (from their Attendance page) or search for them by name.</p>

      <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '0.75rem', padding: '1.25rem', marginBottom: '1.25rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
          <div><label style={lab}>Date</label><input style={box} type="date" value={date} onChange={(e) => setDate(e.target.value)} /></div>
          <div><label style={lab}>Service</label><select style={box} value={service} onChange={(e) => setService(e.target.value)}>{serviceOptions.map(o => <option key={o} value={o}>{o}</option>)}</select></div>
        </div>

        {scanning ? (
          <div>
            <video ref={videoRef} playsInline muted style={{ width: '100%', borderRadius: '0.5rem', backgroundColor: '#000000' }} />
            <button type="button" onClick={stop} style={{ marginTop: '0.6rem', backgroundColor: '#dc2626', color: '#ffffff', border: 'none', padding: '0.65rem 1rem', borderRadius: '0.5rem', fontWeight: 'bold', cursor: 'pointer' }}>Stop scanning</button>
          </div>
        ) : (
          <button type="button" onClick={start} style={{ backgroundColor: theme, color: '#ffffff', border: 'none', padding: '0.75rem 1rem', borderRadius: '0.5rem', fontWeight: 'bold', cursor: 'pointer', width: '100%' }}>📷 Scan member QR code</button>
        )}
        {scanMsg && <div style={{ marginTop: '0.75rem', padding: '0.7rem', borderRadius: '0.5rem', backgroundColor: /^(Could not|This |No )/.test(scanMsg) ? '#fee2e2' : '#dcfce7', color: /^(Could not|This |No )/.test(scanMsg) ? '#991b1b' : '#166534', fontSize: '0.9rem' }}>{scanMsg}</div>}

        <div style={{ marginTop: '1.25rem' }}>
          <label style={lab}>Search member</label>
          <input style={box} placeholder="Type a name, phone or email..." value={search} onChange={(e) => setSearch(e.target.value)} />
          {matches.map(m => (
            <div key={m.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderBottom: '1px dashed #e2e8f0', fontSize: '0.92rem' }}>
              <span>{displayName(m) || m.email}</span>
              {done.has(String(m.id)) ? <span style={{ color: '#16a34a', fontWeight: '600' }}>✓ Present</span> : (
                <button type="button" onClick={async () => { setScanMsg(await onCheckin(m)); setSearch(''); }} style={{ backgroundColor: '#dcfce7', color: '#166534', border: 'none', padding: '0.35rem 0.8rem', borderRadius: '0.35rem', cursor: 'pointer', fontWeight: '600' }}>Mark present</button>
              )}
            </div>
          ))}
        </div>
        {message && <div style={{ marginTop: '0.75rem', color: '#991b1b', fontSize: '0.85rem' }}>{message}</div>}
      </div>

      <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '0.75rem', padding: '1.25rem' }}>
        <h4 style={{ margin: '0 0 0.75rem 0', color: theme }}>Present on {date} - {service} ({checkins.length})</h4>
        {checkins.length > 0 ? checkins.map(c => (
          <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.4rem 0', borderBottom: '1px dashed #e2e8f0', fontSize: '0.9rem' }}>
            <span>{c.member_name} <span style={{ color: '#64748b', fontSize: '0.78rem' }}>{c.checked_in_at ? new Date(c.checked_in_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</span></span>
            {canDelete && <button type="button" onClick={() => { if (window.confirm('Remove this check-in?')) onDelete(c.id); }} style={{ backgroundColor: '#fee2e2', color: '#991b1b', border: 'none', padding: '0.2rem 0.55rem', borderRadius: '0.25rem', cursor: 'pointer', fontSize: '0.78rem' }}>Remove</button>}
          </div>
        )) : <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>Nobody has been checked in yet.</p>}
      </div>
    </div>
  );
}

// Member photos are kept inside the members table, so a photo that is too big makes the whole list slow.
// This shrinks any picture to a small, sharp JPEG (about 40 to 80 KB) before it is saved.
const PHOTO_AUTOLOAD_LIMIT = 150000; // photos bigger than this are not loaded into the list (shrink them first)
function shrinkImageDataUrl(src, maxSide = 480, quality = 0.75) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, maxSide / Math.max(img.width, img.height));
      const w = Math.max(1, Math.round(img.width * scale));
      const h = Math.max(1, Math.round(img.height * scale));
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, w, h);
      ctx.drawImage(img, 0, 0, w, h);
      try { resolve(canvas.toDataURL('image/jpeg', quality)); } catch (e) { reject(e); }
    };
    img.onerror = () => reject(new Error('Could not read the picture'));
    img.src = src;
  });
}

export default function Home() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState('member');
  const [loading, setLoading] = useState(true);
  
  // Auth Form State
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState('');
  const [isSelfRegistering, setIsSelfRegistering] = useState(false);

  // Dashboard State
  const [activeTab, setActiveTab] = useState('dashboard');
  const [financeView, setFinanceView] = useState('hub');
  
  const [members, setMembers] = useState([]);
  const [memberLoadError, setMemberLoadError] = useState('');
  const [shrinking, setShrinking] = useState(false);
  const [shrinkMsg, setShrinkMsg] = useState('');
  const memberColsRef = useRef(null);
  const [myRecord, setMyRecord] = useState(null);
  const photoRunRef = useRef(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [editingMemberId, setEditingMemberId] = useState(null);
  
  const [selectedMemberForWelfare, setSelectedMemberForWelfare] = useState(null);
  const [openingBalance, setOpeningBalance] = useState(2484.32);

  // Admin Permissions State (Admin Email -> { category: { permissionKey: boolean } })
  const [adminPermissions, setAdminPermissions] = useState({});
  const [selectedAdminEmail, setSelectedAdminEmail] = useState('');

  // Saved-finance state
  const [financeLoaded, setFinanceLoaded] = useState(false);
  const [memberFinance, setMemberFinance] = useState(null);
  const [saveError, setSaveError] = useState('');
  const lastSnapRef = useRef('');
  const lastRowsRef = useRef('');
  const pendingSaveRef = useRef(false);
  const [myPermissions, setMyPermissions] = useState({});
  const [permMessage, setPermMessage] = useState('');
  const [welfareLocked, setWelfareLocked] = useState({});
  const [viewAsMember, setViewAsMember] = useState(false);
  const [memberPage, setMemberPage] = useState('dashboard');
  const [memberMenuOpen, setMemberMenuOpen] = useState(false);
  const [payForm, setPayForm] = useState({ amount: '', type: 'Offering' });
  const [payBusy, setPayBusy] = useState(false);
  const [stmtYear, setStmtYear] = useState(String(new Date().getFullYear()));
  const [payMsg, setPayMsg] = useState('');
  const [profileEdit, setProfileEdit] = useState(false);
  const [profileForm, setProfileForm] = useState({});
  const [profileMsg, setProfileMsg] = useState('');
  const [myCheckins, setMyCheckins] = useState([]);
  const [checkins, setCheckins] = useState([]);
  const [checkinDate, setCheckinDate] = useState(todayStr());
  const [checkinService, setCheckinService] = useState('Sunday Service');
  const [checkinMsg, setCheckinMsg] = useState('');
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [settingsMsg, setSettingsMsg] = useState('');
  const [assetsList, setAssetsList] = useState([]);
  const [leadersList, setLeadersList] = useState([]);
  const [fellowshipsList, setFellowshipsList] = useState([]);
  const [branchesList, setBranchesList] = useState([]);
  const [pledgesList, setPledgesList] = useState([]);
  const [deptBudgets, setDeptBudgets] = useState([]);
  const [groupsList, setGroupsList] = useState([]);
  const [fDept, setFDept] = useState('');
  const [fSub, setFSub] = useState('');
  const [fGender, setFGender] = useState('');
  const [fMarital, setFMarital] = useState('');
  const [rotasList, setRotasList] = useState([]);
  const [videosList, setVideosList] = useState([]);
  const [servicesList, setServicesList] = useState([]);
  const [visitorsList, setVisitorsList] = useState([]);
  const [convertsList, setConvertsList] = useState([]);
  const [board, setBoard] = useState({ events: [], announcements: [], leaders: [], rotas: [], videos: [], fellowships: [] });
  const baseRef = useRef({});

  // Financial Data State with Edit/Delete restricted to Super Admin
  const [incomes, setIncomes] = useState([]);
  const [incomeForm, setIncomeForm] = useState({ source: '', amount: '', date: '', member_id: '', member_name: '' });
  const [editingIncomeIndex, setEditingIncomeIndex] = useState(null);

  const [expenses, setExpenses] = useState([]);
  const [expenseForm, setExpenseForm] = useState({ description: '', amount: '', date: '', department: '' });
  const [editingExpenseIndex, setEditingExpenseIndex] = useState(null);

  const [tithes, setTithes] = useState([]);
  const [titheForm, setTitheForm] = useState({ member_id: '', member_name: '', amount: '', date: '' });
  const [editingTitheIndex, setEditingTitheIndex] = useState(null);

  const [budgets, setBudgets] = useState([]);
  const [budgetForm, setBudgetForm] = useState({ item: '', estimated: '', status: 'Pending', date: todayStr() });

  const [contributions, setContributions] = useState([]);
  const [contribForm, setContribForm] = useState({ member_id: '', contributor: '', type: 'General', amount: '', date: '' });
  const [editingContribIndex, setEditingContribIndex] = useState(null);

  // Welfare table state (12 months x 4 weeks + date metadata)
  const [welfareRecords, setWelfareRecords] = useState({});
  const [welfareDates, setWelfareDates] = useState({});

  // Editable Financial Reports State
  const [accountReportNotes, setAccountReportNotes] = useState('All financial activities are reconciled and audited weekly.');
  const [balanceSheetNotes, setBalanceSheetNotes] = useState('Assets match total equity and liabilities.');
  const [notesMsg, setNotesMsg] = useState('');

  // Updated Attendance Module State with Service Type & Demographics (Men, Women, Children)
  const [attendanceLogs, setAttendanceLogs] = useState([]);
  const [showAttendanceForm, setShowAttendanceForm] = useState(false);
  const [attendanceForm, setAttendanceForm] = useState({
    service_date: '',
    service_type: 'Sunday Service',
    department: 'General',
    men_count: '',
    women_count: '',
    children_count: '',
    status: 'Present'
  });

  const [eventsList, setEventsList] = useState([]);
  const [showEventForm, setShowEventForm] = useState(false);
  const [eventForm, setEventForm] = useState({ title: '', date: '', description: '' });

  const [announcementsList, setAnnouncementsList] = useState([]);
  const [showAnnounceForm, setShowAnnounceForm] = useState(false);
  const [announceForm, setAnnounceForm] = useState({ title: '', message: '' });

  const [formData, setFormData] = useState({ ...EMPTY_FORM });
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  const subDeptList = SUB_DEPARTMENTS;

  // 'soon: true' = the screen for this permission has not been built in the app yet
  const permissionSchema = {
    'User & Membership': [
      { key: 'register_members', label: 'Register & edit members' },
      { key: 'record_visitors', label: 'Record visitors' },
      { key: 'record_new_converts', label: 'Record new converts' }
    ],
    'Administration & Leadership': [
      { key: 'manage_leaders', label: 'Manage church leaders directory' },
      { key: 'manage_fellowships', label: 'Manage house fellowships & branches' }
    ],
    'Reports & Communication': [
      { key: 'view_reports', label: 'View reports' },
      { key: 'send_messages', label: 'Send messages to members' },
      { key: 'manage_prayer', label: 'View & manage prayer requests' }
    ],
    'Videos & Integrations': [
      { key: 'manage_videos', label: 'Manage sermon videos & links' }
    ],
    'Services & Events': [
      { key: 'register_services', label: 'Register services' },
      { key: 'register_events', label: 'Register events' },
      { key: 'manage_rotas', label: 'Manage duty rotas' },
      { key: 'record_attendance', label: 'Record attendance' }
    ],
    'Communication': [
      { key: 'post_announcements', label: 'Post announcements' }
    ],
    'Operations': [
      { key: 'manage_facilities', label: 'Manage church facilities & assets' }
    ],
    'Finance': [
      { key: 'access_finance', label: 'Access finance (record Tithes, Welfare, Incomes, Contributions)' },
      { key: 'view_balance_sheet', label: 'View Account Report & Balance Sheet (read-only)' },
      { key: 'manage_welfare', label: 'View & manage member welfare requests' }
    ]
  };

  // Super Admin can do everything. Sub-admins can only do what the Super Admin has switched on.
  const can = (key) => role === 'super_admin' || !!myPermissions[key];

  // Church identity and look (set in the Settings suite)
  const themeColor = settings.theme_color || DEFAULT_SETTINGS.theme_color;
  const logoSrc = settings.logo_url || CHURCH_LOGO;
  const churchName = settings.name || DEFAULT_SETTINGS.name;
  const churchTagline = settings.tagline || '';

  useEffect(() => {
    async function getUserData() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session && session.user) {
        setUser(session.user);
        const { data: memberRows } = await supabase
          .from('members')
          .select('*')
          .ilike('email', String(session.user.email || '').trim().replace(/[\\%_]/g, '\\$&'))
          .limit(10);
        // If a person has more than one row, use the most complete one
        const filledCount = (r) => Object.keys(r).filter((k) => r[k] !== null && r[k] !== '').length;
        const memberData = (memberRows || []).slice().sort((a, b) => filledCount(b) - filledCount(a))[0] || null;

        if (memberData) {
          setMyRecord(memberData);
          if (memberData.role) setRole(memberData.role);
          // remember every column except the (large) photo, so the members list can load without photos
          memberColsRef.current = Object.keys(memberData).filter((k) => k !== 'photo_url').join(',');
        }
        const isAdminRole = !!(memberData && memberData.role && memberData.role !== 'member');
        await loadSettings();
        if (isAdminRole) {
          const isSuperRole = memberData.role === 'super_admin';
          const perms = await loadPermissions(isSuperRole, session.user.email);
          await loadSections(isSuperRole, perms);
        } else {
          await loadMemberData(session.user.email);
        }
      }
      fetchMembers();
      setLoading(false);
    }
    getUserData();
  }, []);


  const fieldSetters = {
    incomes: setIncomes, expenses: setExpenses, tithes: setTithes, budgets: setBudgets, contributions: setContributions,
    welfareRecords: setWelfareRecords, welfareDates: setWelfareDates, openingBalance: setOpeningBalance,
    accountReportNotes: setAccountReportNotes, balanceSheetNotes: setBalanceSheetNotes,
    attendanceLogs: setAttendanceLogs, eventsList: setEventsList, announcementsList: setAnnouncementsList,
    servicesList: setServicesList, visitorsList: setVisitorsList, convertsList: setConvertsList, assetsList: setAssetsList,
    leadersList: setLeadersList, rotasList: setRotasList, videosList: setVideosList,
    fellowshipsList: setFellowshipsList, branchesList: setBranchesList, pledgesList: setPledgesList,
    deptBudgets: setDeptBudgets, groupsList: setGroupsList
  };

  const makeMemberRows = () => members
    .filter(m => m.id && m.email)
    .map(m => {
      const id = String(m.id);
      return {
        member_id: id,
        member_email: String(m.email).trim().toLowerCase(),
        data: {
          tithes: tithes.filter(t => String(t.member_id) === id),
          contributions: contributions.filter(c => String(c.member_id) === id),
          incomes: incomes.filter(i => i.member_id && String(i.member_id) === id),
          welfare: welfareRecords[id] || {},
          welfare_updated: welfareDates[id] || null
        }
      };
    });

  // Load every section this person is allowed to see
  async function loadSections(isSuper, perms) {
    const { data, error } = await supabase.from('app_data').select('key, data, version');
    if (error) {
      setSaveError('Could not load saved records: ' + error.message + ' (Has supabase-security.sql been run in Supabase?)');
      return false;
    }
    const rows = {};
    (data || []).forEach(r => { rows[r.key] = r; });
    Object.keys(SECTION_DEFS).forEach(key => {
      if (!canReadSectionFn(key, isSuper, perms)) return;
      const r = rows[key];
      const dataObj = pickSection({ ...((r && r.data) || {}) }, key);
      SECTION_DEFS[key].forEach(f => fieldSetters[f](dataObj[f]));
      baseRef.current[key] = { data: JSON.parse(JSON.stringify(dataObj)), version: r ? r.version : 0 };
    });
    setSaveError('');
    setFinanceLoaded(true);
    return true;
  }

  // Members read their own record plus the shared events and announcements
  async function loadMemberData(email) {
    // A member may have more than one saved row (e.g. a duplicate member entry with the same email), so read them all and merge
    const { data: mfRows, error } = await supabase
      .from('member_finance')
      .select('data')
      .eq('member_email', String(email || '').trim().toLowerCase());
    if (error) setSaveError('Could not load your records: ' + error.message);
    const merged = { tithes: [], contributions: [], incomes: [], welfare: {} };
    const seen = { tithes: new Set(), contributions: new Set(), incomes: new Set() };
    (mfRows || []).forEach((r) => {
      const d = (r && r.data) || {};
      ['tithes', 'contributions', 'incomes'].forEach((k) => {
        (d[k] || []).forEach((item) => {
          const sig = JSON.stringify(item);
          if (!seen[k].has(sig)) { seen[k].add(sig); merged[k].push(item); }
        });
      });
      Object.entries(d.welfare || {}).forEach(([month, weeks]) => {
        const sum = (a) => (a || []).reduce((x, y) => x + (Number(y) || 0), 0);
        if (!merged.welfare[month] || sum(weeks) > sum(merged.welfare[month])) merged.welfare[month] = weeks;
      });
    });
    setMemberFinance(merged);
    const { data: rows } = await supabase.from('app_data').select('key, data').in('key', ['events', 'announcements', 'leaders', 'rotas', 'videos', 'fellowships']);
    const get = (k, f) => { const r = (rows || []).find(x => x.key === k); return (r && r.data && r.data[f]) || []; };
    setBoard({ events: get('events', 'eventsList'), announcements: get('announcements', 'announcementsList'), leaders: get('leaders', 'leadersList'), rotas: get('rotas', 'rotasList'), videos: get('videos', 'videosList'), fellowships: get('fellowships', 'fellowshipsList') });
  }

  const logActivity = async (action, detail) => {
    try {
      if (!user) return;
      const me = members.find(m => String(m.email || '').toLowerCase() === String(user.email || '').toLowerCase());
      await supabase.from('activity_log').insert({ actor_email: String(user.email || '').toLowerCase(), actor_name: me ? displayName(me) : '', action, detail: String(detail || '').slice(0, 500) });
    } catch (e) { /* the log is optional */ }
  };

  // Save one section. If another admin saved first, merge both people's changes and try again.
  async function saveSection(key, valsIn) {
    let vals = valsIn;
    for (let attempt = 0; attempt < 4; attempt++) {
      const local = pickSection(vals, key);
      const base = baseRef.current[key];
      let ok = false;
      let conflict = false;
      let errMsg = '';
      if (base.version === 0) {
        const { error } = await supabase.from('app_data').insert({ key, data: local, version: 1 });
        if (!error) ok = true; else if (error.code === '23505') conflict = true; else errMsg = error.message;
      } else {
        const { data, error } = await supabase
          .from('app_data')
          .update({ data: local, version: base.version + 1, updated_at: new Date().toISOString() })
          .eq('key', key)
          .eq('version', base.version)
          .select('version');
        if (error) errMsg = error.message; else if (data && data.length) ok = true; else conflict = true;
      }
      if (errMsg) return errMsg;
      if (ok && base.version !== 0) { const msg = summarizeChange(base.data, local); if (msg) logActivity(SECTION_LABELS[key] || key, msg); }
      if (ok) { baseRef.current[key] = { data: JSON.parse(JSON.stringify(local)), version: base.version === 0 ? 1 : base.version + 1 }; return ''; }
      const { data: srv, error: e2 } = await supabase.from('app_data').select('data, version').eq('key', key).maybeSingle();
      if (e2 || !srv) return e2 ? e2.message : 'You do not have permission to save this section.';
      const serverData = pickSection({ ...(srv.data || {}) }, key);
      const merged = mergeSection(base.data, local, serverData);
      baseRef.current[key] = { data: JSON.parse(JSON.stringify(serverData)), version: srv.version };
      SECTION_DEFS[key].forEach(f => fieldSetters[f](merged[f]));
      vals = { ...vals, ...merged };
    }
    return 'Another admin keeps changing the same records. Please try again in a moment.';
  }

  const startPayment = async () => {
    const amt = parseFloat(payForm.amount);
    if (!amt || amt < 1) { setPayMsg('Please enter an amount of at least GHS 1.'); return; }
    setPayBusy(true);
    setPayMsg('Opening the secure Hubtel checkout...');
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch('/api/pay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + (session ? session.access_token : '') },
        body: JSON.stringify({ amount: amt, type: payForm.type })
      });
      const out = await res.json().catch(() => ({}));
      if (!res.ok || !out.link) { setPayMsg('Could not start the payment: ' + (out.error || 'please try again.')); setPayBusy(false); return; }
      window.location.href = out.link;
    } catch (e) {
      setPayMsg('Could not start the payment: ' + e.message);
      setPayBusy(false);
    }
  };

  // When Hubtel sends the member back to the app, confirm the payment and refresh their records
  useEffect(() => {
    if (!user || typeof window === 'undefined') return;
    const p = new URLSearchParams(window.location.search);
    const txRef = p.get('hp'), cancelled = p.get('cancelled');
    if (!txRef || !/^GP[a-z0-9]{6,30}$/.test(txRef)) return;
    window.history.replaceState({}, '', window.location.pathname);
    const tell = (m) => { setPayMsg(m); setMemberPage('giving'); try { alert(m); } catch (e) {} };
    if (cancelled) { tell('The payment was not completed. Nothing was charged.'); return; }
    setPayMsg('Confirming your payment...');
    (async () => {
      try {
        const res = await fetch('/api/pay?ref=' + encodeURIComponent(txRef));
        const out = await res.json().catch(() => ({}));
        if (res.ok && out.ok) { tell('Payment of GHS ' + Number(out.amount).toFixed(2) + ' (' + out.type + ') received. Thank you and God bless you!'); await loadMemberData(user.email); }
        else tell(out.error || out.message || 'We could not confirm the payment yet. If money left your account, please tell the church admin.');
      } catch (e) { tell('Could not confirm the payment: ' + e.message); }
    })();
  }, [user]);

  const saveNotesNow = async () => {
    setNotesMsg('Saving...');
    const err = await saveSection('finance', { incomes, expenses, tithes, budgets, contributions, welfareRecords, welfareDates, openingBalance, accountReportNotes, balanceSheetNotes, deptBudgets });
    setNotesMsg(err ? 'Could not save: ' + err : 'Remarks saved successfully.');
    setTimeout(() => setNotesMsg(''), 4000);
  };

  // Auto-save (admins only), a moment after any change
  useEffect(() => {
    if (!financeLoaded || !user || role === 'member') return;
    const isSuper = role === 'super_admin';
    const vals = {
      incomes, expenses, tithes, budgets, contributions, welfareRecords, welfareDates, openingBalance,
      accountReportNotes, balanceSheetNotes, attendanceLogs, eventsList, announcementsList,
      servicesList, visitorsList, convertsList, assetsList, leadersList, rotasList, videosList,
      fellowshipsList, branchesList, pledgesList, deptBudgets, groupsList
    };
    const dirty = Object.keys(SECTION_DEFS).filter(key => {
      if (!canWriteSectionFn(key, isSuper, myPermissions)) return false;
      const b = baseRef.current[key];
      if (!b) return false;
      return JSON.stringify(pickSection(vals, key)) !== JSON.stringify(b.data);
    });
    const mayWriteMembers = canWriteSectionFn('finance', isSuper, myPermissions) && !!baseRef.current.finance;
    const rows = mayWriteMembers ? makeMemberRows() : [];
    const rowsJSON = JSON.stringify(rows);
    const rowsChanged = rows.length > 0 && rowsJSON !== lastRowsRef.current;
    if (dirty.length === 0 && !rowsChanged) { pendingSaveRef.current = false; return; }
    pendingSaveRef.current = true;
    const timer = setTimeout(async () => {
      let failed = '';
      for (const key of dirty) {
        const err = await saveSection(key, vals);
        if (err) { failed = err; break; }
      }
      if (!failed && rowsChanged) {
        const { error } = await supabase
          .from('member_finance')
          .upsert(rows.map(r => ({ ...r, updated_at: new Date().toISOString() })), { onConflict: 'member_id' });
        if (error) failed = error.message; else lastRowsRef.current = rowsJSON;
      }
      pendingSaveRef.current = false;
      setSaveError(failed ? 'Could not save: ' + failed : '');
    }, 800);
    return () => clearTimeout(timer);
  }, [financeLoaded, user, role, myPermissions, members, incomes, expenses, tithes, budgets, contributions, welfareRecords, welfareDates, openingBalance, accountReportNotes, balanceSheetNotes, attendanceLogs, eventsList, announcementsList, servicesList, visitorsList, convertsList, assetsList, leadersList, rotasList, videosList, fellowshipsList, branchesList, pledgesList, deptBudgets, groupsList]);

  // Pick up other admins' latest entries when a records screen is opened
  useEffect(() => {
    if (['contributions', 'attendance', 'events', 'announcements', 'services', 'visitors', 'new_converts', 'facilities', 'leaders', 'rotas', 'reports', 'messages', 'videos', 'fellowships', 'branches', 'followup', 'pledges', 'dashboard', 'prayer'].includes(activeTab) && financeLoaded && role !== 'member' && !pendingSaveRef.current) {
      loadSections(role === 'super_admin', myPermissions);
    }
  }, [activeTab]);


  async function loadPermissions(isSuper, email) {
    if (isSuper) {
      const { data } = await supabase.from('admin_permissions').select('email, permissions');
      const map = {};
      (data || []).forEach(r => { map[String(r.email).toLowerCase()] = r.permissions || {}; });
      setAdminPermissions(map);
      return {};
    } else {
      const { data } = await supabase
        .from('admin_permissions')
        .select('permissions')
        .eq('email', String(email || '').trim().toLowerCase())
        .maybeSingle();
      const mine = (data && data.permissions) || {};
      setMyPermissions(mine);
      return mine;
    }
  }

  const savePermissions = async () => {
    setPermMessage('');
    const email = String(selectedAdminEmail || '').trim().toLowerCase();
    if (!email) return;
    const { error } = await supabase
      .from('admin_permissions')
      .upsert({ email, permissions: adminPermissions[email] || {}, updated_at: new Date().toISOString() }, { onConflict: 'email' });
    if (!error) logActivity('Permissions', 'Saved permissions for ' + email);
    setPermMessage(error ? 'Could not save permissions: ' + error.message : 'Permissions saved. They apply the next time that admin opens the app.');
  };

  const changeAccountRole = async (newRole) => {
    setPermMessage('');
    const email = String(selectedAdminEmail || '').trim().toLowerCase();
    const target = members.find(m => String(m.email || '').toLowerCase() === email);
    if (!target || target.role === 'super_admin') return;
    const { error } = await supabase.from('members').update({ role: newRole }).eq('id', target.id);
    if (!error) logActivity('Permissions', 'Changed role of ' + displayName(target) + ' to ' + newRole);
    if (error) setPermMessage('Could not change role: ' + error.message);
    else { setPermMessage(newRole === 'admin' ? 'Now a Sub-Admin. Tick what they may do, then press Save Permissions.' : 'Now a regular member.'); fetchMembers(); }
  };

  // Opening  .../?register=1  shows the self-registration form on the login screen
  useEffect(() => {
    if (typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('register') === '1') {
      setIsSelfRegistering(true);
    }
  }, []);


  async function loadSettings() {
    const { data } = await supabase.from('church_settings').select('data').eq('id', 1).maybeSingle();
    const d = (data && data.data) || {};
    setSettings({ ...DEFAULT_SETTINGS, ...d, bank: { ...DEFAULT_SETTINGS.bank, ...(d.bank || {}) }, services: d.services || [] });
  }

  const saveSettings = async (patch, okMsg) => {
    if (okMsg && okMsg.startsWith('Could not')) { setSettingsMsg(okMsg); return; }
    const next = { ...settings, ...patch };
    setSettings(next);
    const { error } = await supabase
      .from('church_settings')
      .upsert({ id: 1, data: next, updated_at: new Date().toISOString() });
    setSettingsMsg(error ? 'Could not save: ' + error.message : okMsg);
  };

  const uploadLogo = async (file) => {
    if (!file) return;
    if (!file.type || !file.type.startsWith('image/')) { setSettingsMsg('Could not upload: please choose an image file.'); return; }
    if (file.size > 2 * 1024 * 1024) { setSettingsMsg('Could not upload: the image is bigger than 2 MB.'); return; }
    const ext = (file.name.split('.').pop() || 'png').toLowerCase().replace(/[^a-z0-9]/g, '');
    const path = 'logo-' + Date.now() + '.' + ext;
    const { error } = await supabase.storage.from('church-assets').upload(path, file, { upsert: true, contentType: file.type });
    if (error) { setSettingsMsg('Could not upload logo: ' + error.message); return; }
    const { data } = supabase.storage.from('church-assets').getPublicUrl(path);
    await saveSettings({ logo_url: data.publicUrl }, 'Logo updated. It now shows in the headers and reports.');
  };



  // Shared professional letterhead for every printed report
  const letterheadCss = () => `
      .lh{text-align:center;padding:4px 0 0}
      .lh-top{display:flex;align-items:center;justify-content:space-between;gap:14px}
      .lh-top img{width:84px;height:84px;object-fit:contain;flex:none}
      .lh-mid{flex:1}
      .lh-name{font-family:Georgia,'Times New Roman',serif;font-size:25px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:${themeColor};margin:0;line-height:1.15}
      .lh-tag{font-family:Georgia,'Times New Roman',serif;font-style:italic;font-size:14px;color:#b45309;margin:3px 0 0}
      .lh-contact{font-size:11px;color:#475569;margin-top:6px;line-height:1.5}
      .lh-rule{height:0;border-top:4px solid ${themeColor};border-bottom:1.5px solid #d4a017;padding-top:2px;margin:10px 0 8px}
      .lh-title{display:flex;justify-content:space-between;align-items:center;font-size:12px;color:#475569;margin-bottom:12px}
      .lh-title b{background:${themeColor};color:#fff;padding:4px 14px;border-radius:3px;font-size:12px;letter-spacing:1.2px;text-transform:uppercase}
  `;
  const letterheadHtml = (title) => {
    const esc2 = (v) => String(v == null ? '' : v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const logo = logoSrc.startsWith('http') ? logoSrc : window.location.origin + logoSrc;
    const bits = [settings.address, settings.phone && ('Tel: ' + settings.phone), settings.email, settings.website].filter(Boolean).map(esc2);
    return `<div class="lh"><div class="lh-top"><img src="${logo}" alt="" /><div class="lh-mid"><h1 class="lh-name">${esc2(churchName)}</h1>${churchTagline ? `<div class="lh-tag">${esc2(churchTagline)}</div>` : ''}${bits.length ? `<div class="lh-contact">${bits.join(' &nbsp;•&nbsp; ')}</div>` : ''}</div><img src="${logo}" alt="" /></div><div class="lh-rule"></div><div class="lh-title"><span>${new Date().toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })}</span><b>${esc2(title)}</b><span></span></div></div>`;
  };

  // Opens a branded print window (used by the Reports screens)
  const openPrintWindow = (title, bodyHtml) => {
    const logo = logoSrc.startsWith('http') ? logoSrc : window.location.origin + logoSrc;
    const esc = (v) => String(v == null ? '' : v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const w = window.open('', '_blank');
    if (!w) { alert('Please allow pop-ups for this site to print.'); return; }
    w.document.write(`<html><head><title>${esc(title)} - ${esc(churchName)}</title><style>
      body{font-family:'Segoe UI',Arial,sans-serif;padding:24px;color:#0f172a}
      .head{display:flex;align-items:center;gap:16px;border-bottom:3px solid ${themeColor};padding-bottom:12px;margin-bottom:16px}
      .head img{width:70px;height:70px;object-fit:contain} h2{margin:0;color:${themeColor}} h3{color:${themeColor};margin:18px 0 6px}
      .sub{color:#64748b;font-size:13px} table{width:100%;border-collapse:collapse;font-size:12px}
      th,td{border:1px solid #cbd5e1;padding:6px;text-align:left} th{background:#f1f5f9} .tot{margin-top:12px;font-weight:bold}
      @page{size:A4;margin:12mm} body{padding:0}
      ${letterheadCss()}
      table.wrap{border-collapse:collapse;width:100%} table.wrap>thead>tr>td,table.wrap>tbody>tr>td{border:0;padding:0}
      table.wrap>thead{display:table-header-group} tr{page-break-inside:avoid}
    </style></head><body>
      <table class="wrap"><thead><tr><td>
        ${letterheadHtml(title.toUpperCase())}
      </td></tr></thead><tbody><tr><td>
      ${bodyHtml}
      </td></tr></tbody></table>
      <script>window.onload = function() { window.print(); };</script>
    </body></html>`);
    w.document.close();
  };

  const printAssetRegister = (list) => {
    const esc = (v) => String(v == null ? '' : v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const logo = logoSrc.startsWith('http') ? logoSrc : window.location.origin + logoSrc;
    const totalValue = list.reduce((a, i) => a + (parseFloat(i.quantity) || 0) * (parseFloat(i.unit_value) || 0), 0);
    const rows = list.map(i => `<tr><td>${esc(i.tag)}</td><td>${esc(i.name)}</td><td>${esc(i.category)}</td><td>${esc(i.quantity)}</td><td>${esc(i.condition)}</td><td>${esc(i.location)}</td><td>${currentLoan(i) ? esc('Lent to ' + currentLoan(i).borrower) : ''}</td><td>${i.unit_value ? esc((parseFloat(i.quantity) || 0) * (parseFloat(i.unit_value) || 0)) : ''}</td></tr>`).join('');
    const w = window.open('', '_blank');
    if (!w) { alert('Please allow pop-ups for this site to print.'); return; }
    w.document.write(`<html><head><title>Asset Register - ${esc(churchName)}</title><style>
      body{font-family:'Segoe UI',Arial,sans-serif;padding:24px;color:#0f172a}
      .head{display:flex;align-items:center;gap:16px;border-bottom:3px solid ${themeColor};padding-bottom:12px;margin-bottom:16px}
      .head img{width:70px;height:70px;object-fit:contain}
      h2{margin:0;color:${themeColor}} .sub{color:#64748b;font-size:13px}
      table{width:100%;border-collapse:collapse;font-size:12px} th,td{border:1px solid #cbd5e1;padding:6px;text-align:left}
      th{background:#f1f5f9} .tot{margin-top:12px;font-weight:bold}
      @page{size:A4;margin:12mm} body{padding:0}
      ${letterheadCss()}
      table.wrap{border-collapse:collapse;width:100%} table.wrap>thead>tr>td,table.wrap>tbody>tr>td{border:0;padding:0}
      table.wrap>thead{display:table-header-group} tr{page-break-inside:avoid}
    </style></head><body>
      <table class="wrap"><thead><tr><td>
        ${letterheadHtml('FACILITIES & ASSET REGISTER')}
      </td></tr></thead><tbody><tr><td>
      <table><thead><tr><th>Tag</th><th>Item</th><th>Category</th><th>Qty</th><th>Condition</th><th>Location</th><th>Out on loan</th><th>Total value (GHS)</th></tr></thead><tbody>${rows || '<tr><td colspan="8">No items</td></tr>'}</tbody></table>
      <div class="tot">Estimated total value: GHS ${totalValue.toFixed(2)}</div>
      </td></tr></tbody></table>
      <script>window.onload = function() { window.print(); };</script>
    </body></html>`);
    w.document.close();
  };


  // ----- QR check-in (admins) -----
  const loadCheckins = async (date) => {
    const { data, error } = await supabase
      .from('attendance_checkins')
      .select('*')
      .eq('service_date', date)
      .order('checked_in_at', { ascending: false });
    if (error) { setCheckinMsg('Could not load check-ins: ' + error.message + ' (Has supabase-portal.sql been run?)'); return; }
    setCheckinMsg('');
    setCheckins((data || []).filter(c => c.service_name === checkinService));
  };

  const checkInMember = async (m) => {
    const row = {
      member_id: String(m.id),
      member_email: String(m.email || '').trim().toLowerCase(),
      member_name: displayName(m) || m.email,
      service_date: checkinDate,
      service_name: checkinService,
      recorded_by: user ? user.email : ''
    };
    const { error } = await supabase.from('attendance_checkins').insert(row);
    if (error) {
      if (error.code === '23505') return row.member_name + ' is already checked in for this service.';
      return 'Could not check in: ' + error.message;
    }
    await loadCheckins(checkinDate);
    return '✓ ' + row.member_name + ' marked present.';
  };

  const deleteCheckin = async (id) => {
    const { error } = await supabase.from('attendance_checkins').delete().eq('id', id);
    if (error) setCheckinMsg('Could not remove: ' + error.message);
    else loadCheckins(checkinDate);
  };

  useEffect(() => {
    if (activeTab === 'checkin' && user && role !== 'member') loadCheckins(checkinDate);
  }, [activeTab, checkinDate, checkinService, user]);

  // ----- member profile (limited fields, saved through a safe database function) -----
  const saveProfile = async () => {
    setProfileMsg('');
    const { error } = await supabase.rpc('update_my_profile', {
      p_phone: profileForm.phone || '',
      p_home_address: profileForm.home_address || '',
      p_home_town: profileForm.home_town || '',
      p_emergency_contact_name: profileForm.emergency_contact_name || '',
      p_emergency_contact_phone: profileForm.emergency_contact_phone || ''
    });
    if (error) { setProfileMsg('Could not save: ' + error.message + ' (Has supabase-portal.sql been run?)'); return; }
    setProfileMsg('Profile updated.');
    setProfileEdit(false);
    fetchMembers();
  };

  // member's own attendance history
  useEffect(() => {
    if (!user || memberPage !== 'attendance') return;
    const me = members.find(m => String(m.email || '').toLowerCase() === String(user.email || '').toLowerCase());
    if (!me) return;
    supabase.from('attendance_checkins').select('service_date, service_name, checked_in_at').eq('member_id', String(me.id)).order('service_date', { ascending: false }).limit(60)
      .then(({ data }) => setMyCheckins(data || []));
  }, [memberPage, members, user]);

  // Photos are loaded separately, a few at a time, so one heavy photo can never block the members list.
  async function loadMemberPhotos(list) {
    const token = ++photoRunRef.current;
    const ids = list
      .filter((m) => typeof m.photo_size === 'number' && m.photo_size > 0 && m.photo_size <= PHOTO_AUTOLOAD_LIMIT)
      .map((m) => m.id);
    for (let i = 0; i < ids.length; i += 5) {
      if (token !== photoRunRef.current) return;
      try {
        const { data } = await supabase.from('members').select('id, photo_url').in('id', ids.slice(i, i + 5));
        if (data && data.length && token === photoRunRef.current) {
          const map = {};
          data.forEach((r) => { map[r.id] = r.photo_url; });
          setMembers((prev) => prev.map((m) => (map[m.id] !== undefined ? { ...m, photo_url: map[m.id] } : m)));
        }
      } catch (e) { /* skip this batch */ }
    }
  }

  async function getMemberColumns() {
    if (memberColsRef.current) return memberColsRef.current;
    try {
      const { data } = await supabase.from('members').select('*').limit(1);
      if (data && data[0]) {
        memberColsRef.current = Object.keys(data[0]).filter((k) => k !== 'photo_url').join(',');
        return memberColsRef.current;
      }
    } catch (e) { /* fall back to all columns */ }
    return '*';
  }

  async function fetchMembers() {
    // Try up to 3 times. An empty answer or an error can come from an expired session or a slow
    // connection, so we renew the session and wait a moment between tries.
    let lastMessage = '';
    for (let attempt = 1; attempt <= 3; attempt++) {
      const cols = await getMemberColumns();
      const { data: allMembers, error } = await supabase
        .from('members')
        .select(cols)
        .limit(5000);

      if (!error && allMembers && allMembers.length > 0) {
        setMembers((prev) => {
          const keep = {};
          prev.forEach((p) => { if (p.photo_url) keep[p.id] = p.photo_url; });
          return allMembers.map((m) => (keep[m.id] && m.photo_size !== 0 ? { ...m, photo_url: keep[m.id] } : m));
        });
        setMemberLoadError('');
        loadMemberPhotos(allMembers);
        return;
      }
      lastMessage = error && error.message ? error.message : 'The list came back empty';
      if (attempt < 3) {
        try { await supabase.auth.refreshSession(); } catch (e) { /* ignore */ }
        await new Promise((resolve) => setTimeout(resolve, 1200 * attempt));
      }
    }
    setMemberLoadError(lastMessage);
  }

  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthError('');
    const { error } = await supabase.auth.signInWithPassword({
      email: emailInput,
      password: passwordInput,
    });
    if (error) {
      setAuthError(error.message);
    } else {
      window.location.reload();
    }
  };

  const handleLogout = async () => {
    setViewAsMember(false);
    await supabase.auth.signOut();
    window.location.reload();
  };

  const handleSubDeptToggle = (dept) => {
    const current = formData.sub_departments;
    if (current.includes(dept)) {
      setFormData({ ...formData, sub_departments: current.filter(d => d !== dept) });
    } else {
      setFormData({ ...formData, sub_departments: [...current, dept] });
    }
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        let result = reader.result;
        // shrink the picture so it never slows the members list down
        try { result = await shrinkImageDataUrl(result); } catch (err) { /* keep the original if it can't be shrunk */ }
        setFormData((prev) => ({ ...prev, photo_url: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  // One-time tidy-up: shrinks the big photos that were saved before photos were limited in size.
  const shrinkMemberPhotos = async () => {
    if (role !== 'super_admin' || shrinking) return;
    const big = members.filter((m) => typeof m.photo_size === 'number' && m.photo_size > PHOTO_AUTOLOAD_LIMIT);
    if (big.length === 0) return;
    setShrinking(true);
    let done = 0;
    let failed = 0;
    for (let i = 0; i < big.length; i++) {
      setShrinkMsg('Shrinking photo ' + (i + 1) + ' of ' + big.length + '. Please keep this page open...');
      try {
        const { data, error } = await supabase.from('members').select('photo_url').eq('id', big[i].id).single();
        if (error || !data || !data.photo_url || String(data.photo_url).indexOf('data:image') !== 0) throw new Error('skip');
        const small = await shrinkImageDataUrl(data.photo_url);
        if (small.length >= data.photo_url.length) throw new Error('already small');
        const { error: upErr } = await supabase.from('members').update({ photo_url: small }).eq('id', big[i].id);
        if (upErr) throw upErr;
        done++;
      } catch (err) { failed++; }
    }
    setShrinking(false);
    setShrinkMsg('Finished: ' + done + ' photo(s) shrunk' + (failed ? ', ' + failed + ' could not be shrunk' : '') + '.');
    fetchMembers();
  };

  const handleSaveMember = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    const subDeptsStr = Array.isArray(formData.sub_departments) 
      ? formData.sub_departments.join(', ') 
      : formData.sub_departments;

    // The password is used only to create the login account. It is never saved in the members table.
    const { password, ...memberFields } = formData;
    const payload = {
      ...memberFields,
      email: (memberFields.email || '').trim().toLowerCase(),
      sub_departments: subDeptsStr,
      number_of_children: memberFields.number_of_children === '' || memberFields.number_of_children == null ? null : parseInt(memberFields.number_of_children, 10)
    };

    if (editingMemberId) {
      let { error } = await supabase
        .from('members')
        .update(payload)
        .eq('id', editingMemberId);
      if (error && missingOptional(error.message)) {
        ({ error } = await supabase.from('members').update(stripOptional(payload)).eq('id', editingMemberId));
      }

      if (error) {
        setFormError(error.message);
      } else {
        logActivity('Members', 'Updated member ' + displayName(payload));
        setFormSuccess('Member details successfully updated!');
        fetchMembers();
        setTimeout(() => {
          setShowRegisterForm(false);
          setEditingMemberId(null);
          setFormSuccess('');
        }, 1500);
      }
    } else {
      if (!password || password.length < 6) {
        setFormError('Please enter a password of at least 6 characters.');
        return;
      }

      // 1) Create the login account (uses a separate client so the admin stays signed in)
      const { error: signUpError } = await authOnlyClient.auth.signUp({
        email: payload.email,
        password: password
      });
      if (signUpError) {
        setFormError('Could not create the login account: ' + signUpError.message);
        return;
      }

      // 2) Save the member details
      let { error } = await supabase
        .from('members')
        .insert([payload]);
      if (error && missingOptional(error.message)) {
        ({ error } = await supabase.from('members').insert([stripOptional(payload)]));
      }

      if (error) {
        setFormError('Login account was created, but saving member details failed: ' + error.message);
      } else {
        logActivity('Members', 'Registered member ' + displayName(payload));
        setFormSuccess(isSelfRegistering ? 'Self-registration successful! You can now log in.' : 'Member successfully registered with all details!');
        setFormData({ ...EMPTY_FORM });
        fetchMembers();
        setTimeout(() => {
          setShowRegisterForm(false);
          setIsSelfRegistering(false);
          setFormSuccess('');
        }, 1500);
      }
    }
  };

  const handleDeleteMember = async (id) => {
    if (role !== 'super_admin') {
      alert('Permission denied. Only Super Admin can delete members.');
      return;
    }
    if (confirm('Are you sure you want to delete this member?')) {
      const gone = members.find(m => m.id === id);
      const { error } = await supabase.from('members').delete().eq('id', id);
      if (error) {
        alert('Error deleting member: ' + error.message);
      } else {
        logActivity('Members', 'Deleted member ' + (gone ? displayName(gone) : id));
        fetchMembers();
      }
    }
  };

  const handleStartEditMember = async (m) => {
    // If this member's photo was not loaded into the list yet, fetch it now so saving can never erase it.
    let photoNow = m.photo_url;
    if (photoNow === undefined) {
      try {
        const { data } = await supabase.from('members').select('photo_url').eq('id', m.id).single();
        photoNow = (data && data.photo_url) || '';
      } catch (e) { photoNow = ''; }
    }
    setEditingMemberId(m.id);
    let subs = [];
    if (m.sub_departments) {
      subs = typeof m.sub_departments === 'string' ? m.sub_departments.split(', ').map(s => s.trim()) : m.sub_departments;
    }
    setFormData({
      title: m.title || '',
      first_name: m.first_name || '',
      last_name: m.last_name || '',
      email: m.email || '',
      phone: m.phone || '',
      password: '',
      emergency_contact_name: m.emergency_contact_name || '',
      emergency_contact_phone: m.emergency_contact_phone || '',
      role: m.role || 'member',
      core_department: m.core_department || 'LOVE',
      sub_departments: subs,
      date_of_birth: m.date_of_birth || '',
      date_of_baptism: m.date_of_baptism || '',
      date_joined: m.date_joined || '',
      home_address: m.home_address || '',
      home_town: m.home_town || '',
      photo_url: photoNow || '',
      gender: m.gender || '',
      marital_status: m.marital_status || '',
      occupation: m.occupation || '',
      number_of_children: m.number_of_children == null ? '' : String(m.number_of_children)
    });
    setShowRegisterForm(true);
  };

  const handleWelfareChange = (memberId, month, weekIndex, val) => {
    const num = val === '' ? 0 : parseFloat(val);
    const memberRecord = welfareRecords[memberId] || {
      Jan: [0,0,0,0], Feb: [0,0,0,0], Mar: [0,0,0,0], Apr: [0,0,0,0],
      May: [0,0,0,0], Jun: [0,0,0,0], Jul: [0,0,0,0], Aug: [0,0,0,0],
      Sep: [0,0,0,0], Oct: [0,0,0,0], Nov: [0,0,0,0], Dec: [0,0,0,0]
    };
    const updatedMonthWeeks = [...memberRecord[month]];
    updatedMonthWeeks[weekIndex] = isNaN(num) ? 0 : num;
    setWelfareRecords({
      ...welfareRecords,
      [memberId]: { ...memberRecord, [month]: updatedMonthWeeks }
    });
    setWelfareDates({
      ...welfareDates,
      [memberId]: new Date().toISOString().split('T')[0]
    });
  };

  const totalWelfareSum = Object.values(welfareRecords).reduce((grandTotal, memberMonths) => {
    const memberSum = Object.values(memberMonths).reduce((mTotal, weeks) => {
      return mTotal + weeks.reduce((wSum, w) => wSum + w, 0);
    }, 0);
    return grandTotal + memberSum;
  }, 0);

  const totalIncomeSum = incomes.reduce((acc, curr) => acc + (parseFloat(curr.amount) || 0), 0);
  const totalTitheSum = tithes.reduce((acc, curr) => acc + (parseFloat(curr.amount) || 0), 0);
  const totalContribSum = contributions.reduce((acc, curr) => acc + (parseFloat(curr.amount) || 0), 0);
  const totalExpenseSum = expenses.reduce((acc, curr) => acc + (parseFloat(curr.amount) || 0), 0);
  
  const approvedBudgetsSum = budgets
    .filter(b => b.status === 'Approved')
    .reduce((acc, curr) => acc + (parseFloat(curr.estimated) || 0), 0);

  const grossInflow = openingBalance + totalIncomeSum + totalTitheSum + totalContribSum + totalWelfareSum;
  const netBalance = grossInflow - (totalExpenseSum + approvedBudgetsSum);

  const downloadPDFReport = (title) => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>${title} - ${churchName}</title>
          <style>
            body { 
              font-family: 'Segoe UI', Arial, sans-serif; 
              padding: 2.5rem; 
              color: #1e293b; 
              max-width: 800px; 
              margin: 0 auto; 
              background-color: #ffffff;
            }
            .header { 
              border-bottom: 3px solid ${themeColor}; 
              padding-bottom: 1.25rem; 
              margin-bottom: 1.75rem; 
              display: flex;
              align-items: center;
              gap: 1.5rem;
              background: linear-gradient(to bottom, #f8fafc, #ffffff);
              padding: 1.25rem;
              border-radius: 0.5rem;
              border-top: 4px solid #2563eb;
            }
            .logo { 
              width: 75px; 
              height: 75px; 
              object-fit: contain; 
            }
            .header-text {
              flex-grow: 1;
            }
            .church-name { 
              font-size: 1.35rem; 
              font-weight: 800; 
              color: ${themeColor}; 
              margin: 0 0 0.15rem 0; 
              letter-spacing: 0.5px;
            }
            .subtitle { 
              font-size: 0.95rem; 
              color: #475569; 
              font-weight: 600;
              margin-bottom: 0.35rem; 
            }
            .report-title-badge {
              display: inline-block;
              background-color: ${themeColor};
              color: #ffffff;
              padding: 0.25rem 0.75rem;
              border-radius: 0.25rem;
              font-size: 0.85rem;
              font-weight: bold;
              text-transform: uppercase;
              letter-spacing: 1px;
            }
            .meta-date {
              font-size: 0.8rem;
              color: #64748b;
              text-align: right;
            }
            .row { 
              display: flex; 
              justify-content: space-between; 
              padding: 0.65rem 0.5rem; 
              border-bottom: 1px solid #e2e8f0; 
              font-size: 0.95rem; 
            }
            .row:nth-child(even) {
              background-color: #f8fafc;
            }
            .summary { 
              margin-top: 1.5rem; 
              font-size: 1.15rem; 
              font-weight: bold; 
              background-color: #eff6ff;
              padding: 0.85rem;
              border: 1px solid #bfdbfe;
              border-radius: 0.375rem;
            }
            .notes {
              margin-top: 2rem;
              font-size: 0.9rem;
              color: #334155;
              background-color: #f8fafc;
              padding: 1rem;
              border-left: 4px solid #2563eb;
              border-radius: 0.25rem;
            }
            @page { size: A4; margin: 12mm; }
            ${letterheadCss()}
            table.wrap { border-collapse: collapse; width: 100%; }
            table.wrap > thead > tr > td, table.wrap > tbody > tr > td { padding: 0; border: 0; }
            table.wrap > thead { display: table-header-group; }
            .row { page-break-inside: avoid; }
          </style>
        </head>
        <body>
          <table class="wrap"><thead><tr><td>
          ${letterheadHtml(title)}
          </td></tr></thead><tbody><tr><td>
          <div>
            <div class="row"><span>Opening Balance:</span><strong>GHS ${openingBalance.toFixed(2)}</strong></div>
            <div class="row"><span>Total General Incomes:</span><strong style="color: #16a34a;">+ GHS ${totalIncomeSum.toFixed(2)}</strong></div>
            <div class="row"><span>Total Tithes:</span><strong style="color: #16a34a;">+ GHS ${totalTitheSum.toFixed(2)}</strong></div>
            <div class="row"><span>Total Contributions:</span><strong style="color: #16a34a;">+ GHS ${totalContribSum.toFixed(2)}</strong></div>
            <div class="row"><span>Total Welfare Contributions:</span><strong style="color: #16a34a;">+ GHS ${totalWelfareSum.toFixed(2)}</strong></div>
            <div class="row"><span>Total Expenses:</span><strong style="color: #dc2626;">- GHS ${totalExpenseSum.toFixed(2)}</strong></div>
            <div class="row"><span>Approved Budgets (Allocated):</span><strong style="color: #dc2626;">- GHS ${approvedBudgetsSum.toFixed(2)}</strong></div>
            
            <div class="row summary">
              <span>Net Balance / Fund Balance:</span>
              <span style="color: ${themeColor};">GHS ${netBalance.toFixed(2)}</span>
            </div>
          </div>
          <div class="notes">
            <strong>Official Notes & Remarks:</strong>
            <p style="margin: 0.5rem 0 0 0;">${title.includes('Balance') ? balanceSheetNotes : accountReportNotes}</p>
          </div>
          </td></tr></tbody></table>
          <script>window.onload = function() { window.print(); };</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const filteredMembers = members.filter((m) => {
    const fullName = displayName(m).toLowerCase();
    const email = (m.email || '').toLowerCase();
    const query = searchQuery.toLowerCase();
    const textOk = fullName.includes(query) || email.includes(query) || String(m.occupation || '').toLowerCase().includes(query) || String(m.phone || '').replace(/\s+/g, '').includes(query.replace(/\s+/g, ''));
    if (!textOk) return false;
    if (fDept && m.core_department !== fDept) return false;
    if (fSub && !String(m.sub_departments || '').includes(fSub)) return false;
    if (fGender && m.gender !== fGender) return false;
    if (fMarital && m.marital_status !== fMarital) return false;
    return true;
  });

  const printIdCards = (list) => {
    if (!list.length) { alert('There are no members to print.'); return; }
    const esc = (v) => String(v == null ? '' : v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    const logo = logoSrc.startsWith('http') ? logoSrc : window.location.origin + logoSrc;
    const cards = list.map(m => {
      let qr = '';
      try { qr = qrSvgString('GPC:' + m.id, 86); } catch (e) { qr = ''; }
      const ini = esc((((m.first_name || '') + ' ' + (m.last_name || '')).trim() || '?').split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2));
      const photo = m.photo_url ? '<img class="ph" src="' + esc(m.photo_url) + '" />' : '<div class="ph ini">' + ini + '</div>';
      return '<div class="card"><div class="top"><img src="' + esc(logo) + '" /><div><b>' + esc(churchName) + '</b><br/><small>MEMBER ID CARD</small></div></div>'
        + '<div class="mid">' + photo + '<div class="info"><div class="nm">' + esc(displayName(m)) + '</div><div>' + esc(m.core_department || '') + '</div><div class="sm">' + esc(m.sub_departments || '') + '</div><div class="sm">No: ' + esc(memberNo(m)) + '</div>' + (m.phone ? '<div class="sm">Tel: ' + esc(m.phone) + '</div>' : '') + '</div><div class="qr">' + qr + '</div></div>'
        + '<div class="bot">' + esc(churchTagline || churchName) + '</div></div>';
    }).join('');
    const w = window.open('', '_blank');
    if (!w) { alert('Please allow pop-ups for this site to print.'); return; }
    w.document.write('<html><head><title>Member ID Cards</title><style>'
      + '@page{size:A4;margin:10mm} body{font-family:Segoe UI,Arial,sans-serif;margin:0;color:#0f172a}'
      + '.sheet{display:grid;grid-template-columns:repeat(2,86mm);gap:6mm;justify-content:center}'
      + '.card{width:86mm;height:54mm;border:1px solid #94a3b8;border-radius:3mm;overflow:hidden;display:flex;flex-direction:column;page-break-inside:avoid;background:#fff}'
      + '.top{background:' + themeColor + ';color:#fff;display:flex;align-items:center;gap:2.5mm;padding:1.8mm 3mm;font-size:9pt}.top img{width:9mm;height:9mm;object-fit:contain;background:#fff;border-radius:50%}.top small{font-size:6.5pt;letter-spacing:.6px}'
      + '.mid{flex:1;display:flex;align-items:center;gap:2.5mm;padding:2mm 3mm}.ph{width:19mm;height:23mm;object-fit:cover;border-radius:1.5mm;border:1px solid #cbd5e1;flex:none}.ini{display:flex;align-items:center;justify-content:center;background:#e2e8f0;font-weight:bold;font-size:14pt;color:#334155}'
      + '.info{flex:1;font-size:7.5pt;min-width:0}.nm{font-weight:bold;font-size:9.5pt;margin-bottom:.6mm;color:' + themeColor + '}.sm{color:#475569;font-size:6.5pt}.qr{flex:none}'
      + '.bot{background:#f1f5f9;text-align:center;font-size:6pt;color:#475569;padding:1mm}'
      + '</style></head><body><div class="sheet">' + cards + '</div><script>window.onload=function(){window.print();};<\/script></body></html>');
    w.document.close();
  };

  const printGivingStatement = (member, src, year) => {
    const esc = (v) => String(v == null ? '' : v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const num = (v) => parseFloat(v) || 0;
    const money = (n) => 'GHS ' + num(n).toFixed(2);
    const inYear = (d) => String(d || '').startsWith(String(year));
    const byDate = (a, b) => String(a.date || '').localeCompare(String(b.date || ''));
    const t = (src.tithes || []).filter(x => inYear(x.date)).sort(byDate);
    const c = [...(src.contributions || []).map(x => ({ date: x.date, type: x.type || 'Contribution', amount: x.amount })), ...(src.incomes || []).map(x => ({ date: x.date, type: x.source || 'General income', amount: x.amount }))].filter(x => inYear(x.date)).sort(byDate);
    const welMonths = Object.entries(src.welfare || {}).map(([m, w]) => [m, (Array.isArray(w) ? w : []).reduce((a, b) => a + num(b), 0)]).filter(([, v]) => v > 0);
    const tT = t.reduce((a, x) => a + num(x.amount), 0), cT = c.reduce((a, x) => a + num(x.amount), 0), wT = welMonths.reduce((a, [, v]) => a + v, 0);
    let html = '<div class="sub"><strong>' + esc(displayName(member)) + '</strong> - ' + esc(memberNo(member)) + '<br/>Statement period: 1 January ' + esc(year) + ' to 31 December ' + esc(year) + '</div>';
    html += '<h3>Tithes</h3>' + (t.length ? '<table><thead><tr><th>Date</th><th>Amount</th></tr></thead><tbody>' + t.map(x => '<tr><td>' + esc(x.date) + (x.online ? ' (online)' : '') + '</td><td>' + money(x.amount) + '</td></tr>').join('') + '</tbody></table>' : '<p>No tithes recorded for ' + esc(year) + '.</p>');
    html += '<h3>Contributions and other giving</h3>' + (c.length ? '<table><thead><tr><th>Date</th><th>Type</th><th>Amount</th></tr></thead><tbody>' + c.map(x => '<tr><td>' + esc(x.date) + '</td><td>' + esc(x.type) + '</td><td>' + money(x.amount) + '</td></tr>').join('') + '</tbody></table>' : '<p>No contributions recorded for ' + esc(year) + '.</p>');
    html += '<h3>Welfare (from the welfare tracker)</h3>' + (welMonths.length ? '<table><thead><tr><th>Month</th><th>Amount</th></tr></thead><tbody>' + welMonths.map(([m, v]) => '<tr><td>' + esc(m) + '</td><td>' + money(v) + '</td></tr>').join('') + '</tbody></table>' : '<p>No welfare recorded.</p>');
    html += '<h3>Summary</h3><table><tbody><tr><td>Total tithes</td><td>' + money(tT) + '</td></tr><tr><td>Total contributions and other giving</td><td>' + money(cT) + '</td></tr><tr><td>Total welfare</td><td>' + money(wT) + '</td></tr><tr><td><strong>Grand total</strong></td><td><strong>' + money(tT + cT + wT) + '</strong></td></tr></tbody></table>';
    html += '<p style="margin-top:22px;font-size:12px;color:#475569">Thank you for your faithful giving. This statement was produced from the church records on ' + new Date().toLocaleDateString() + '. For any correction, please contact the church office.</p>';
    openPrintWindow('Giving Statement ' + year, html);
  };

  // One-page receipt for a single tithe, contribution, pledge payment or welfare support
  const printReceipt = (kind, row) => {
    const esc = (v) => String(v == null ? '' : v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const amtNum = parseFloat(row.amount) || 0;
    const amt = amtNum.toFixed(2);
    let who = '', purpose = '', title = 'Official Receipt', fromLabel = 'Received from', extra = '', sign1 = 'Received by (Finance)', thanks = 'Thank you for your faithful giving. God bless you.';
    if (kind === 'Tithe') { who = row.member_name; purpose = 'Tithe'; }
    else if (kind === 'Contribution') { who = row.contributor; purpose = row.type || 'Contribution'; }
    else if (kind === 'Pledge') {
      who = row.member_name; purpose = 'Pledge payment - ' + (row.project || 'General');
      extra = '<tr><td style="border:0;padding:8px 0;color:#475569">Pledge position</td><td style="border:0;padding:8px 0;font-size:13px">Pledged GHS ' + (parseFloat(row.pledged) || 0).toFixed(2) + ' &middot; paid to date GHS ' + (parseFloat(row.paidToDate) || 0).toFixed(2) + ' &middot; balance GHS ' + Math.max(0, (parseFloat(row.pledged) || 0) - (parseFloat(row.paidToDate) || 0)).toFixed(2) + '</td></tr>';
    } else if (kind === 'Welfare') {
      title = 'Welfare Support Voucher'; fromLabel = 'Paid to'; who = row.member_name; purpose = 'Welfare support - ' + (row.category || 'Support');
      sign1 = 'Authorised by (Church office)'; thanks = 'This support was given in love by the church family. We are praying with you. God bless you.';
    }
    const seed = [kind, row.member_id || who || '', row.date || '', amt].join('|');
    let h = 0; for (let k = 0; k < seed.length; k++) { h = (h * 31 + seed.charCodeAt(k)) % 1000000; }
    const ref = (kind === 'Welfare' ? 'WSV-' : 'RCT-') + String(row.date || '').replace(/-/g, '') + '-' + String(h).padStart(6, '0');
    const cell = 'border:0;padding:8px 0';
    const html = '<div style="max-width:640px;margin:10px auto;border:2px solid ' + themeColor + ';border-radius:8px;padding:22px">'
      + '<p style="text-align:right;margin:0 0 14px;font-size:12px;color:#475569">' + (kind === 'Welfare' ? 'Voucher' : 'Receipt') + ' No: <strong>' + esc(ref) + '</strong></p>'
      + '<table style="width:100%;border-collapse:collapse;font-size:14px">'
      + '<tr><td style="' + cell + ';width:36%;color:#475569">' + fromLabel + '</td><td style="' + cell + '"><strong>' + esc(who || '') + '</strong></td></tr>'
      + '<tr><td style="' + cell + ';color:#475569">Purpose</td><td style="' + cell + '">' + esc(purpose) + '</td></tr>'
      + '<tr><td style="' + cell + ';color:#475569">Date</td><td style="' + cell + '">' + esc(row.date || '') + '</td></tr>'
      + '<tr><td style="' + cell + ';color:#475569">Amount</td><td style="' + cell + ';font-size:20px"><strong>GHS ' + amt + '</strong></td></tr>'
      + '<tr><td style="' + cell + ';color:#475569">Amount in words</td><td style="' + cell + ';font-style:italic">' + esc(amountInWords(amtNum)) + '</td></tr>'
      + extra
      + '</table>'
      + '<p style="margin:26px 0 4px;font-size:13px;color:#334155">' + esc(thanks) + '</p>'
      + '<div style="display:flex;justify-content:space-between;margin-top:42px;font-size:12px;color:#475569"><span style="border-top:1px solid #94a3b8;padding-top:4px;min-width:180px;text-align:center">' + esc(sign1) + '</span><span style="border-top:1px solid #94a3b8;padding-top:4px;min-width:180px;text-align:center">' + (kind === 'Welfare' ? 'Received by (Member)' : 'Church stamp') + '</span></div>'
      + '<p style="margin:22px 0 0;padding-top:8px;border-top:1px solid #e2e8f0;text-align:center;font-size:10.5px;color:#64748b">' + esc(churchName) + ' LBG &middot; Registration No. ' + RECEIPT_REG_NO + '</p>'
      + '</div>';
    openPrintWindow(title, html);
  };

  const downloadBackupExcel = () => {
    const nameOf = (id) => { const m = members.find(x => String(x.id) === String(id)); return m ? displayName(m) : ''; };
    const sheets = [
      { name: 'Members', rows: members.map(m => ({ ...m, full_name: displayName(m) })) },
      { name: 'Tithes', rows: tithes }, { name: 'Contributions', rows: contributions }, { name: 'Other income', rows: incomes },
      { name: 'Expenses', rows: expenses }, { name: 'Budgets', rows: budgets }, { name: 'Dept budgets', rows: deptBudgets },
      { name: 'Welfare', rows: Object.entries(welfareRecords || {}).map(([id, rec]) => ({ member: nameOf(id), member_id: id, last_updated: (welfareDates || {})[id] || '', records: rec })) },
      { name: 'Attendance', rows: attendanceLogs }, { name: 'Services', rows: servicesList }, { name: 'Events', rows: eventsList },
      { name: 'Visitors', rows: visitorsList }, { name: 'New converts', rows: convertsList },
      { name: 'Facilities', rows: assetsList }, { name: 'Leaders', rows: leadersList }, { name: 'Duty rotas', rows: rotasList }, { name: 'Videos', rows: videosList },
      { name: 'Fellowships', rows: fellowshipsList.map(f => ({ ...f, member_ids: undefined, members: (f.member_ids || []).map(nameOf).join(', ') })) },
      { name: 'Branches', rows: branchesList }, { name: 'Groups', rows: groupsList.map(g => ({ ...g, member_ids: undefined, sessions: undefined, members: (g.member_ids || []).map(nameOf).join(', '), sessions_held: (g.sessions || []).length })) },
      { name: 'Pledges', rows: pledgesList.map(p => ({ ...p, payments: undefined, paid: (p.payments || []).reduce((a, x) => a + (parseFloat(x.amount) || 0), 0), payment_dates: (p.payments || []).map(x => x.date + ' ' + x.amount).join('; ') })) }
    ];
    saveTextFile(buildWorkbookXml(sheets), 'Gracepoint-backup-' + new Date().toISOString().slice(0, 10) + '.xls', 'application/vnd.ms-excel');
    logActivity('Backup', 'Downloaded the Excel backup');
  };
  const downloadBackupJson = () => {
    const all = { exported_at: new Date().toISOString(), members, incomes, expenses, tithes, budgets, contributions, welfareRecords, welfareDates, openingBalance, accountReportNotes, balanceSheetNotes, attendanceLogs, eventsList, announcementsList, servicesList, visitorsList, convertsList, assetsList, leadersList, rotasList, videosList, fellowshipsList, branchesList, pledgesList, deptBudgets, groupsList };
    saveTextFile(JSON.stringify(all, null, 1), 'Gracepoint-backup-' + new Date().toISOString().slice(0, 10) + '.json', 'application/json');
    logActivity('Backup', 'Downloaded the full data backup');
  };

  if (loading) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', fontFamily: 'system-ui, sans-serif', color: '#64748b' }}>
        <p>Loading application...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <main style={{ minHeight: '100vh', backgroundColor: '#f1f5f9', fontFamily: 'system-ui, sans-serif', padding: '2rem 1rem', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ width: '100%', maxWidth: '28rem', backgroundColor: '#ffffff', borderRadius: '0.75rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', overflow: 'hidden' }}>
          <div style={{ backgroundColor: themeColor, color: '#ffffff', padding: '1.5rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
            <img src={logoSrc} alt="Logo" style={{ width: '44px', height: '44px', borderRadius: '50%', background: '#ffffff', objectFit: 'contain', padding: '2px' }} />
            <div>
              <h1 style={{ fontSize: '1.25rem', fontWeight: 'bold', margin: '0 0 0.25rem 0' }}>{churchName}</h1>
              <p style={{ fontSize: '0.875rem', opacity: 0.9, margin: 0 }}>{churchTagline} - Portal</p>
            </div>
          </div>
          
          <div style={{ padding: '1.5rem' }}>
            {!isSelfRegistering ? (
              <div>
                {authError && (
                  <div style={{ backgroundColor: '#fee2e2', color: '#991b1b', padding: '0.75rem', borderRadius: '0.375rem', marginBottom: '1rem', fontSize: '0.875rem' }}>
                    {authError}
                  </div>
                )}
                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#475569', marginBottom: '0.375rem' }}>Email Address</label>
                    <input 
                      type="email" 
                      value={emailInput} 
                      onChange={(e) => setEmailInput(e.target.value)} 
                      required 
                      style={{ width: '100%', padding: '0.75rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1', fontSize: '1rem', boxSizing: 'border-box' }}
                      placeholder="Enter your email"
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#475569', marginBottom: '0.375rem' }}>Password</label>
                    <input 
                      type="password" 
                      value={passwordInput} 
                      onChange={(e) => setPasswordInput(e.target.value)} 
                      required 
                      style={{ width: '100%', padding: '0.75rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1', fontSize: '1rem', boxSizing: 'border-box' }}
                      placeholder="Enter your password"
                    />
                  </div>
                  <button 
                    type="submit" 
                    style={{ backgroundColor: themeColor, color: '#ffffff', border: 'none', padding: '0.75rem', borderRadius: '0.375rem', fontWeight: '600', fontSize: '1rem', cursor: 'pointer', marginTop: '0.5rem' }}
                  >
                    Login
                  </button>
                </form>

                <div style={{ marginTop: '1.25rem', textAlign: 'center', borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
                  <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0 0 0.5rem 0' }}>New member?</p>
                  <button 
                    type="button" 
                    onClick={() => { setIsSelfRegistering(true); setEditingMemberId(null); setFormData({ ...EMPTY_FORM }); }}
                    style={{ backgroundColor: '#10b981', color: '#ffffff', border: 'none', padding: '0.5rem 1rem', borderRadius: '0.375rem', fontWeight: 'bold', fontSize: '0.85rem', cursor: 'pointer', width: '100%' }}
                  >
                    📝 Self-Register as New Member
                  </button>
                </div>
                <InstallHelp theme={themeColor} />
              </div>
            ) : (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#0f172a', margin: 0 }}>Member Self-Registration</h3>
                  <button type="button" onClick={() => setIsSelfRegistering(false)} style={{ background: 'none', border: 'none', color: '#2563eb', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.85rem' }}>← Back to Login</button>
                </div>

                {formError && <div style={{ backgroundColor: '#fee2e2', color: '#991b1b', padding: '0.75rem', borderRadius: '0.375rem', marginBottom: '1rem', fontSize: '0.875rem' }}>{formError}</div>}
                {formSuccess && <div style={{ backgroundColor: '#d1fae5', color: '#065f46', padding: '0.75rem', borderRadius: '0.375rem', marginBottom: '1rem', fontSize: '0.875rem' }}>{formSuccess}</div>}

                <form onSubmit={handleSaveMember} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '25rem', overflowY: 'auto', paddingRight: '0.25rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', color: '#475569', marginBottom: '0.2rem' }}>Title</label>
                    <select value={formData.title || ''} onChange={(e) => setFormData({...formData, title: e.target.value})} style={{ width: '100%', padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1', boxSizing: 'border-box', backgroundColor: '#ffffff' }}>
                      <option value="">-- Select title --</option>
                      {TITLES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', color: '#475569', marginBottom: '0.2rem' }}>First Name *</label>
                      <input type="text" required value={formData.first_name} onChange={(e) => setFormData({...formData, first_name: e.target.value})} style={{ width: '100%', padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', color: '#475569', marginBottom: '0.2rem' }}>Last Name *</label>
                      <input type="text" required value={formData.last_name} onChange={(e) => setFormData({...formData, last_name: e.target.value})} style={{ width: '100%', padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', color: '#475569', marginBottom: '0.2rem' }}>Email *</label>
                      <input type="email" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} style={{ width: '100%', padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', color: '#475569', marginBottom: '0.2rem' }}>Phone</label>
                      <input type="text" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} style={{ width: '100%', padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', color: '#475569', marginBottom: '0.2rem' }}>Password * (min. 6 characters)</label>
                    <input type="password" required minLength={6} autoComplete="new-password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} style={{ width: '100%', padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} placeholder="Create a password" />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', color: '#475569', marginBottom: '0.2rem' }}>Emergency Contact Person *</label>
                      <input type="text" required value={formData.emergency_contact_name} onChange={(e) => setFormData({...formData, emergency_contact_name: e.target.value})} style={{ width: '100%', padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} placeholder="Full name" />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', color: '#475569', marginBottom: '0.2rem' }}>Emergency Contact Number *</label>
                      <input type="tel" required value={formData.emergency_contact_phone} onChange={(e) => setFormData({...formData, emergency_contact_phone: e.target.value})} style={{ width: '100%', padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} placeholder="Phone number" />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', color: '#475569', marginBottom: '0.2rem' }}>Core Department *</label>
                    <select value={formData.core_department} onChange={(e) => setFormData({...formData, core_department: e.target.value})} style={{ width: '100%', padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', boxSizing: 'border-box' }}>
                      <option value="LOVE">LOVE</option>
                      <option value="UNITY">UNITY</option>
                      <option value="CARE">CARE</option>
                      <option value="RESPECT">RESPECT</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', color: '#475569', marginBottom: '0.2rem' }}>Sub-Departments</label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.3rem', maxHeight: '7rem', overflowY: 'auto', padding: '0.4rem', border: '1px solid #cbd5e1', borderRadius: '0.375rem', backgroundColor: '#f8fafc' }}>
                      {subDeptList.map((dept) => (
                        <label key={dept} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', cursor: 'pointer' }}>
                          <input type="checkbox" checked={formData.sub_departments.includes(dept)} onChange={() => handleSubDeptToggle(dept)} />
                          {dept}
                        </label>
                      ))}
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.3rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '600', color: '#475569', marginBottom: '0.2rem' }}>Birth Date</label>
                      <input type="date" value={formData.date_of_birth} onChange={(e) => setFormData({...formData, date_of_birth: e.target.value})} style={{ width: '100%', padding: '0.4rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1', fontSize: '0.75rem', boxSizing: 'border-box' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '600', color: '#475569', marginBottom: '0.2rem' }}>Baptism Date</label>
                      <input type="date" value={formData.date_of_baptism} onChange={(e) => setFormData({...formData, date_of_baptism: e.target.value})} style={{ width: '100%', padding: '0.4rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1', fontSize: '0.75rem', boxSizing: 'border-box' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '600', color: '#475569', marginBottom: '0.2rem' }}>Joined Date</label>
                      <input type="date" value={formData.date_joined} onChange={(e) => setFormData({...formData, date_joined: e.target.value})} style={{ width: '100%', padding: '0.4rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1', fontSize: '0.75rem', boxSizing: 'border-box' }} />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', color: '#475569', marginBottom: '0.2rem' }}>Home Address</label>
                      <input type="text" value={formData.home_address} onChange={(e) => setFormData({...formData, home_address: e.target.value})} style={{ width: '100%', padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', color: '#0f172a', marginBottom: '0.2rem' }}>Home Town</label>
                      <input type="text" value={formData.home_town} onChange={(e) => setFormData({...formData, home_town: e.target.value})} style={{ width: '100%', padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', color: '#475569', marginBottom: '0.25rem' }}>Gender</label>
                      <select value={formData.gender || ''} onChange={(e) => setFormData({...formData, gender: e.target.value})} style={{ width: '100%', padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1', boxSizing: 'border-box', backgroundColor: '#ffffff' }}>
                        <option value="">-- Select --</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', color: '#475569', marginBottom: '0.25rem' }}>Marital Status</label>
                      <select value={formData.marital_status || ''} onChange={(e) => setFormData({...formData, marital_status: e.target.value})} style={{ width: '100%', padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1', boxSizing: 'border-box', backgroundColor: '#ffffff' }}>
                        <option value="">-- Select --</option>
                        <option value="Single">Single</option>
                        <option value="Married">Married</option>
                        <option value="Divorced">Divorced</option>
                        <option value="Widowed">Widowed</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', color: '#475569', marginBottom: '0.25rem' }}>Occupation</label>
                      <input type="text" value={formData.occupation || ''} onChange={(e) => setFormData({...formData, occupation: e.target.value})} style={{ width: '100%', padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1', boxSizing: 'border-box', backgroundColor: '#ffffff' }} placeholder="e.g. Teacher, Trader, Student" />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', color: '#475569', marginBottom: '0.25rem' }}>Number of Children</label>
                      <input type="number" min="0" value={formData.number_of_children} onChange={(e) => setFormData({...formData, number_of_children: e.target.value})} style={{ width: '100%', padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1', boxSizing: 'border-box', backgroundColor: '#ffffff' }} placeholder="0" />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', color: '#475569', marginBottom: '0.2rem' }}>Photo Upload</label>
                    <input type="file" accept="image/*" onChange={handlePhotoUpload} style={{ width: '100%', padding: '0.4rem', fontSize: '0.75rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', boxSizing: 'border-box' }} />
                  </div>

                  <button type="submit" style={{ backgroundColor: '#10b981', color: '#ffffff', border: 'none', padding: '0.65rem', borderRadius: '0.375rem', fontWeight: 'bold', fontSize: '0.9rem', cursor: 'pointer', marginTop: '0.5rem' }}>
                    Complete Self-Registration
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </main>
    );
  }

  // Regular Member Dashboard View
  if (role === 'member' || viewAsMember) {
    const _myRows = members.filter(m => String(m.email || '').trim().toLowerCase() === String(user.email || '').trim().toLowerCase());
    const _filled = (r) => Object.keys(r).filter((k) => r[k] !== null && r[k] !== '').length;
    const currentMemberRecord = _myRows.slice().sort((a, b) => _filled(b) - _filled(a))[0] || myRecord || {};
    // Members read their saved records. Admins viewing their own portal use the records already loaded.
    const myId = String(currentMemberRecord.id || '');
    const mf = role === 'member'
      ? (memberFinance || { tithes: [], contributions: [], incomes: [], welfare: {} })
      : {
          tithes: tithes.filter(t => myId && String(t.member_id) === myId),
          contributions: contributions.filter(c => myId && String(c.member_id) === myId),
          incomes: incomes.filter(i => myId && i.member_id && String(i.member_id) === myId),
          welfare: (myId && welfareRecords[myId]) || {}
        };
    const byDateDesc = (a, b) => String(b.date || '').localeCompare(String(a.date || ''));

    const memberTithes = [...(mf.tithes || [])].sort(byDateDesc);
    const memberContributions = [
      ...(mf.contributions || []).map(c => ({ type: c.type || 'Contribution', amount: c.amount, date: c.date })),
      ...(mf.incomes || []).map(i => ({ type: i.source || 'General Income', amount: i.amount, date: i.date }))
    ].sort(byDateDesc);

    const memberWelfareMonths = mf.welfare || {};
    const memberWelfareTotal = Object.values(memberWelfareMonths).reduce((mTotal, weeks) => mTotal + weeks.reduce((wSum, w) => wSum + w, 0), 0);
    const memberTitheTotal = memberTithes.reduce((a, t) => a + (parseFloat(t.amount) || 0), 0);
    const memberContribTotal = memberContributions.reduce((a, c) => a + (parseFloat(c.amount) || 0), 0);

    return (
      <main style={{ minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: 'system-ui, sans-serif', paddingBottom: '2.5rem' }}>
        <div style={{ backgroundColor: themeColor, color: '#ffffff', padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button type="button" aria-label="Menu" onClick={() => setMemberMenuOpen(true)} style={{ backgroundColor: 'rgba(255,255,255,0.15)', color: '#ffffff', border: '1px solid rgba(255,255,255,0.4)', borderRadius: '0.4rem', padding: '0.4rem 0.65rem', fontSize: '1.2rem', cursor: 'pointer', lineHeight: 1 }}>☰</button>
            <img src={logoSrc} alt="Logo" style={{ width: '44px', height: '44px', borderRadius: '50%', background: '#ffffff', objectFit: 'contain', padding: '2px' }} />
            <div>
              <h1 style={{ fontSize: '1.15rem', fontWeight: 'bold', margin: 0, lineHeight: 1.2 }}>{churchName}</h1>
              <span style={{ fontSize: '0.75rem', opacity: 0.85 }}>Member Portal</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {role !== 'member' && (
              <button type="button" onClick={() => setViewAsMember(false)} style={{ backgroundColor: '#ffffff', color: themeColor, border: '1px solid #ffffff', padding: '0.35rem 0.85rem', borderRadius: '0.375rem', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem' }}>
                Admin Dashboard
              </button>
            )}
          <button type="button" onClick={handleLogout} style={{ backgroundColor: 'transparent', color: '#ffffff', border: '1px solid #ffffff', padding: '0.35rem 0.85rem', borderRadius: '0.375rem', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem' }}>
            Logout
          </button>
          </div>
        </div>

        {memberMenuOpen && (() => {
          const groups = [
            ['MAIN', [['dashboard', '🏠 Dashboard'], ['profile', '👤 Profile'], ['attendance', '📅 Attendance (QR)']]],
            ['MY GIVING', [['giving', '💳 Give Online & My Records']]],
            ['COMMUNICATION', [['communication', '📢 Announcements']]],
            ['EVENTS & MINISTRY', [['ministry', '⛪ Events, Duty Roster & Leaders'], ['volunteer', '🙋 I Can Serve (Volunteer)']]],
            ['SPIRITUAL CORNER', [['spiritual', '🎬 Sermons & Videos'], ['prayer', '🙏 Prayer Requests']]],
            ['SUPPORT', [['welfare', '🤝 Welfare Request']]]
          ];
          return (
            <div style={{ position: 'fixed', top: 0, bottom: 0, left: 0, right: 0, zIndex: 50 }}>
              <div onClick={() => setMemberMenuOpen(false)} style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(15,23,42,0.55)' }} />
              <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: '17.5rem', maxWidth: '85%', backgroundColor: themeColor, color: '#ffffff', overflowY: 'auto', padding: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem', paddingBottom: '0.9rem', borderBottom: '1px solid rgba(255,255,255,0.25)', marginBottom: '0.5rem' }}>
                  {currentMemberRecord.photo_url ? <img src={currentMemberRecord.photo_url} alt="Me" style={{ width: '2.8rem', height: '2.8rem', borderRadius: '50%', objectFit: 'cover' }} /> : <img src={logoSrc} alt="Logo" style={{ width: '2.8rem', height: '2.8rem', borderRadius: '50%', background: '#ffffff', objectFit: 'contain', padding: '2px' }} />}
                  <div style={{ fontWeight: 'bold', fontSize: '0.95rem', lineHeight: 1.2 }}>{displayName(currentMemberRecord) || user.email}</div>
                </div>
                {groups.map(([label, items]) => (
                  <div key={label} style={{ marginTop: '0.9rem' }}>
                    <div style={{ fontSize: '0.72rem', letterSpacing: '0.08em', opacity: 0.7, marginBottom: '0.3rem' }}>{label}</div>
                    {items.map(([id, text]) => (
                      <button key={id} type="button" onClick={() => { setMemberPage(id); setMemberMenuOpen(false); }} style={{ display: 'block', width: '100%', textAlign: 'left', backgroundColor: memberPage === id ? 'rgba(255,255,255,0.25)' : 'transparent', color: '#ffffff', border: 'none', padding: '0.7rem 0.75rem', borderRadius: '0.5rem', fontSize: '0.95rem', cursor: 'pointer', marginBottom: '0.15rem' }}>{text}</button>
                    ))}
                  </div>
                ))}
                <button type="button" onClick={handleLogout} style={{ display: 'block', width: '100%', marginTop: '1.5rem', backgroundColor: 'rgba(255,255,255,0.15)', color: '#ffffff', border: '1px solid rgba(255,255,255,0.4)', padding: '0.7rem', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: '600' }}>Logout</button>
              </div>
            </div>
          );
        })()}

        <div style={{ maxWidth: '40rem', margin: '1.5rem auto', padding: '0 1rem' }}>
          <div style={{ display: memberPage === 'profile' ? 'block' : 'none' }}>
            <div style={{ backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '0.75rem', padding: '1.5rem', marginBottom: '1rem' }}>
              <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                {currentMemberRecord.photo_url ? (
                  <img src={currentMemberRecord.photo_url} alt="Profile" style={{ width: '7rem', height: '7rem', borderRadius: '50%', objectFit: 'cover', border: '3px solid ' + themeColor }} />
                ) : (
                  <div style={{ width: '7rem', height: '7rem', borderRadius: '50%', backgroundColor: '#cbd5e1', color: '#334155', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '2rem' }}>{String(currentMemberRecord.first_name || user.email || '?').charAt(0).toUpperCase()}</div>
                )}
                <h2 style={{ margin: '0.75rem 0 0 0', color: themeColor, fontSize: '1.4rem' }}>{displayName(currentMemberRecord) || user.email}</h2>
              </div>

              {profileMsg && <div style={{ marginBottom: '0.75rem', padding: '0.7rem', borderRadius: '0.5rem', fontSize: '0.88rem', backgroundColor: profileMsg.startsWith('Could not') ? '#fee2e2' : '#dcfce7', color: profileMsg.startsWith('Could not') ? '#991b1b' : '#166534' }}>{profileMsg}</div>}

              {!profileEdit ? (
                <div>
                  {[
                    ['Email', currentMemberRecord.email || user.email],
                    ['Phone', currentMemberRecord.phone],
                    ['Date of birth', currentMemberRecord.date_of_birth],
                    ['Home address', currentMemberRecord.home_address],
                    ['Home town', currentMemberRecord.home_town],
                    ['Core department', currentMemberRecord.core_department],
                    ['Sub-departments', Array.isArray(currentMemberRecord.sub_departments) ? currentMemberRecord.sub_departments.join(', ') : currentMemberRecord.sub_departments],
                    ['Baptism date', currentMemberRecord.date_of_baptism],
                    ['Date joined', currentMemberRecord.date_joined],
                    ['Gender', currentMemberRecord.gender],
                    ['Marital status', currentMemberRecord.marital_status],
                    ['Occupation', currentMemberRecord.occupation],
                    ['Number of children', currentMemberRecord.number_of_children],
                    ['Emergency contact', [currentMemberRecord.emergency_contact_name, currentMemberRecord.emergency_contact_phone].filter(Boolean).join(' - ')]
                  ].map(([k, v]) => (
                    <div key={k} style={{ backgroundColor: '#f8fafc', borderRadius: '0.5rem', padding: '0.7rem 0.9rem', marginBottom: '0.5rem' }}>
                      <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: '600' }}>{k}</div>
                      <div style={{ fontSize: '0.98rem', color: '#0f172a', wordBreak: 'break-word' }}>{v || 'Not set'}</div>
                    </div>
                  ))}
                  <button type="button" onClick={() => { setProfileMsg(''); setProfileForm({ phone: currentMemberRecord.phone || '', home_address: currentMemberRecord.home_address || '', home_town: currentMemberRecord.home_town || '', emergency_contact_name: currentMemberRecord.emergency_contact_name || '', emergency_contact_phone: currentMemberRecord.emergency_contact_phone || '' }); setProfileEdit(true); }} style={{ width: '100%', backgroundColor: themeColor, color: '#ffffff', border: 'none', padding: '0.75rem', borderRadius: '0.5rem', fontWeight: 'bold', cursor: 'pointer', marginTop: '0.5rem' }}>Edit Profile</button>
                  <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '0.6rem 0 0 0' }}>To change your name, email or department, please ask a church admin.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {[['phone', 'Phone', 'tel'], ['home_address', 'Home address', 'text'], ['home_town', 'Home town', 'text'], ['emergency_contact_name', 'Emergency contact person', 'text'], ['emergency_contact_phone', 'Emergency contact number', 'tel']].map(([k, label, type]) => (
                    <div key={k}>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#475569', marginBottom: '0.25rem' }}>{label}</label>
                      <input type={type} value={profileForm[k] || ''} onChange={(e) => setProfileForm({ ...profileForm, [k]: e.target.value })} style={{ width: '100%', padding: '0.65rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
                    </div>
                  ))}
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button type="button" onClick={saveProfile} style={{ flex: 1, backgroundColor: themeColor, color: '#ffffff', border: 'none', padding: '0.7rem', borderRadius: '0.5rem', fontWeight: 'bold', cursor: 'pointer' }}>Save</button>
                    <button type="button" onClick={() => setProfileEdit(false)} style={{ flex: 1, backgroundColor: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1', padding: '0.7rem', borderRadius: '0.5rem', fontWeight: 'bold', cursor: 'pointer' }}>Cancel</button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div style={{ display: memberPage === 'attendance' ? 'block' : 'none' }}>
            <div style={{ backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '0.75rem', padding: '1.5rem', marginBottom: '1rem', textAlign: 'center' }}>
              <h2 style={{ margin: '0 0 1rem 0', color: themeColor, fontSize: '1.4rem' }}>Attendance QR Code</h2>
              {currentMemberRecord.id ? (
                <div>
                  <div style={{ display: 'inline-block', padding: '0.5rem', border: '1px solid #e2e8f0', borderRadius: '0.5rem' }}>
                    <QRCodeSvg text={'GPC:' + currentMemberRecord.id} size={240} />
                  </div>
                  <div style={{ marginTop: '0.9rem', fontSize: '1.1rem', color: '#0f172a' }}>{displayName(currentMemberRecord)}</div>
                  <p style={{ fontSize: '0.9rem', color: '#64748b' }}>Show this QR code to the admin to mark your attendance.</p>
                  <button type="button" onClick={() => downloadQrPng('GPC:' + currentMemberRecord.id, 'attendance-qr-' + (currentMemberRecord.first_name || 'member') + '.png', displayName(currentMemberRecord))} style={{ backgroundColor: themeColor, color: '#ffffff', border: 'none', padding: '0.7rem 1.2rem', borderRadius: '0.5rem', fontWeight: 'bold', cursor: 'pointer' }}>Download QR Code</button>
                </div>
              ) : (
                <p style={{ color: '#64748b' }}>Your member record was not found, so no QR code can be shown. Please contact the church admin.</p>
              )}
            </div>
            <div style={{ backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '0.75rem', padding: '1.25rem 1.5rem', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: themeColor, margin: '0 0 0.75rem 0' }}>My attendance ({myCheckins.length})</h3>
              {myCheckins.length > 0 ? myCheckins.map((c, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px dashed #e2e8f0', fontSize: '0.92rem' }}><span>{c.service_name}</span><span style={{ color: '#64748b' }}>{c.service_date}</span></div>
              )) : <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>No attendance recorded yet.</p>}
            </div>
          </div>

          <div style={{ display: memberPage === 'dashboard' ? 'block' : 'none' }}>
          <div style={{ backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '0.75rem', padding: '1.5rem', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#0f172a', margin: '0 0 0.5rem 0' }}>
              Welcome, {displayName(currentMemberRecord) || user.email}
            </h2>
            <p style={{ fontSize: '0.9rem', color: '#64748b', margin: 0 }}>Core Department: <strong>{currentMemberRecord.core_department || 'N/A'}</strong></p>
          </div>
          {celebrations(currentMemberRecord.id ? [currentMemberRecord] : [], 0).map((c, i) => (
            <div key={i} style={{ backgroundColor: '#fef3c7', border: '1px solid #fcd34d', borderRadius: '0.75rem', padding: '1rem 1.25rem', marginBottom: '1rem', color: '#92400e', fontWeight: 'bold' }}>
              {c.kind === 'Birthday' ? '🎉 Happy Birthday, ' + (currentMemberRecord.first_name || '') + '! May God bless you abundantly.' : '🎊 Happy ' + c.years + '-year ' + c.kind.toLowerCase() + ', ' + (currentMemberRecord.first_name || '') + '!'}
            </div>
          ))}
          </div>

          {saveError && (
            <div style={{ backgroundColor: '#fee2e2', color: '#991b1b', padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '1rem', fontSize: '0.85rem' }}>{saveError}</div>
          )}
          {role === 'member' && memberFinance === null && (
            <p style={{ fontSize: '0.85rem', color: '#64748b' }}>Loading your records...</p>
          )}

          {(() => {
            const L = role === 'member' ? board.leaders : leadersList;
            const R = role === 'member' ? board.rotas : rotasList;
            const V = role === 'member' ? board.videos : videosList;
            const FS = role === 'member' ? board.fellowships : fellowshipsList;
            const myFellowships = (FS || []).filter(f => (f.member_ids || []).map(String).includes(String(currentMemberRecord.id)));
            const first = String(currentMemberRecord.first_name || '').trim().toLowerCase();
            const today = todayStr();
            const upcoming = [...R].filter(r => !r.rota_date || r.rota_date >= today).sort((a, b) => String(a.rota_date || '').localeCompare(String(b.rota_date || ''))).slice(0, 8);
            const card = { backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '0.75rem', padding: '1.25rem 1.5rem', marginBottom: '1rem' };
            const h3s = { fontSize: '1.1rem', fontWeight: 'bold', color: themeColor, margin: '0 0 0.75rem 0' };
            return (
              <div>
                {memberPage === 'ministry' && myFellowships.length > 0 && (
                  <div style={card}>
                    <h3 style={h3s}>🏠 My House Fellowship</h3>
                    {myFellowships.map((f, i) => (
                      <div key={i} style={{ padding: '0.4rem 0', borderBottom: '1px dashed #e2e8f0', fontSize: '0.92rem' }}>
                        <strong>{f.name}</strong>
                        <div style={{ color: '#475569', fontSize: '0.85rem' }}>Leader: {f.leader_name || 'Not set'}</div>
                        <div style={{ color: '#475569', fontSize: '0.85rem' }}>{f.meeting_day}{f.meeting_time ? ' at ' + f.meeting_time : ''}{f.location ? ' - ' + f.location : ''}</div>
                      </div>
                    ))}
                  </div>
                )}
                {memberPage === 'ministry' && upcoming.length > 0 && (
                  <div style={card}>
                    <h3 style={h3s}>Duty Roster</h3>
                    {upcoming.map((r, i) => {
                      const mine = first && String(r.assigned || '').toLowerCase().includes(first);
                      return (
                        <div key={i} style={{ padding: '0.5rem 0', borderBottom: '1px dashed #e2e8f0', backgroundColor: mine ? '#fefce8' : 'transparent' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '600', color: '#0f172a' }}><span>{r.rota_name}{mine ? ' (you may be on duty)' : ''}</span><span style={{ fontSize: '0.8rem', color: '#64748b' }}>{r.rota_date}</span></div>
                          <div style={{ fontSize: '0.88rem', color: '#334155' }}>{r.service ? r.service + ' - ' : ''}{r.assigned}</div>
                        </div>
                      );
                    })}
                  </div>
                )}
                {memberPage === 'ministry' && L.length > 0 && (
                  <div style={card}>
                    <h3 style={h3s}>Church Leaders</h3>
                    {L.map((l, i) => (
                      <div key={i} style={{ padding: '0.5rem 0', borderBottom: '1px dashed #e2e8f0', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                        {l.photo_url ? (
                          <img src={l.photo_url} alt={l.leader_name} style={{ width: '2.8rem', height: '2.8rem', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                        ) : (
                          <div style={{ width: '2.8rem', height: '2.8rem', borderRadius: '50%', backgroundColor: '#cbd5e1', color: '#334155', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', flexShrink: 0 }}>{String(l.leader_name || '?').trim().charAt(0).toUpperCase()}</div>
                        )}
                        <div>
                          <div style={{ fontWeight: '600', color: '#0f172a' }}>{l.leader_name} <span style={{ fontWeight: 'normal', color: '#64748b' }}>- {l.position}{l.department ? ' (' + l.department + ')' : ''}</span></div>
                          {l.phone ? <div style={{ fontSize: '0.88rem' }}>📞 <a href={'tel:' + l.phone} style={{ color: themeColor }}>{l.phone}</a></div> : null}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {memberPage === 'spiritual' && <MemberSermons videos={V} user={user} theme={themeColor} />}
              </div>
            );
          })()}

          <div style={{ display: memberPage === 'dashboard' ? 'block' : 'none' }}>
          {(settings.phone || settings.address || settings.whatsapp || settings.email || settings.website || settings.facebook || settings.youtube || (settings.services || []).length > 0) && (
            <div style={{ backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '0.75rem', padding: '1.25rem 1.5rem', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: themeColor, margin: '0 0 0.75rem 0' }}>Church Information</h3>
              {settings.address ? <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: '#334155' }}>📍 {settings.address}</p> : null}
              {settings.phone ? <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem' }}>📞 <a href={'tel:' + settings.phone} style={{ color: themeColor }}>{settings.phone}</a></p> : null}
              {settings.whatsapp ? (
                <a href={settings.whatsapp} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', backgroundColor: '#16a34a', color: '#ffffff', textDecoration: 'none', padding: '0.5rem 0.9rem', borderRadius: '0.4rem', fontWeight: '600', fontSize: '0.88rem', marginBottom: '0.5rem' }}>Join our WhatsApp group</a>
              ) : null}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.25rem' }}>
                {settings.email ? <a href={'mailto:' + settings.email} style={{ color: themeColor, fontSize: '0.88rem' }}>✉️ {settings.email}</a> : null}
                {settings.website ? <a href={settings.website} target="_blank" rel="noopener noreferrer" style={{ color: themeColor, fontSize: '0.88rem' }}>🌐 Website</a> : null}
                {settings.facebook ? <a href={settings.facebook} target="_blank" rel="noopener noreferrer" style={{ color: themeColor, fontSize: '0.88rem' }}>Facebook</a> : null}
                {settings.youtube ? <a href={settings.youtube} target="_blank" rel="noopener noreferrer" style={{ color: themeColor, fontSize: '0.88rem' }}>YouTube</a> : null}
              </div>
              {(settings.services || []).length > 0 && (
                <div style={{ marginTop: '0.5rem' }}>
                  <div style={{ fontWeight: '600', color: '#0f172a', marginBottom: '0.25rem' }}>Service times</div>
                  {settings.services.map((sv, i) => (
                    <div key={i} style={{ fontSize: '0.88rem', color: '#334155', padding: '0.2rem 0' }}>{sv.activity} - {sv.days} - {sv.time}</div>
                  ))}
                </div>
              )}
            </div>
          )}

          {settings.bank && settings.bank.account_number ? (
            <div style={{ backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '0.75rem', padding: '1.25rem 1.5rem', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: themeColor, margin: '0 0 0.75rem 0' }}>Giving / Bank Details</h3>
              <div style={{ fontSize: '0.92rem', color: '#334155', lineHeight: 1.8 }}>
                <div><strong>Account number:</strong> {settings.bank.account_number}</div>
                {settings.bank.account_name ? <div><strong>Account name:</strong> {settings.bank.account_name}</div> : null}
                {settings.bank.bank_name ? <div><strong>Bank / Network:</strong> {settings.bank.bank_name}</div> : null}
                {settings.bank.account_type ? <div><strong>Account type:</strong> {settings.bank.account_type}</div> : null}
                {settings.bank.note ? <div style={{ color: '#64748b' }}>{settings.bank.note}</div> : null}
              </div>
              <button type="button" onClick={async () => { try { await navigator.clipboard.writeText(settings.bank.account_number); alert('Account number copied.'); } catch (e) { prompt('Copy the account number:', settings.bank.account_number); } }} style={{ marginTop: '0.75rem', backgroundColor: themeColor, color: '#ffffff', border: 'none', padding: '0.5rem 0.9rem', borderRadius: '0.4rem', fontWeight: '600', cursor: 'pointer', fontSize: '0.88rem' }}>Copy account number</button>
            </div>
          ) : null}
          </div>

          {(() => {
            const evs = role === 'member' ? board.events : eventsList;
            const anns = role === 'member' ? board.announcements : announcementsList;
            return (
              <div>
                <div style={{ display: memberPage === 'communication' ? 'block' : 'none', backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '0.75rem', padding: '1.25rem 1.5rem', marginBottom: '1rem' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: themeColor, margin: '0 0 0.75rem 0' }}>Announcements</h3>
                  {anns.length > 0 ? anns.slice(0, 10).map((a, i) => (
                    <div key={i} style={{ padding: '0.5rem 0', borderBottom: '1px dashed #e2e8f0' }}>
                      <div style={{ fontWeight: '600', color: '#0f172a' }}>{a.title}{a.posted ? <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 'normal' }}>  ({a.posted})</span> : null}</div>
                      <div style={{ fontSize: '0.9rem', color: '#334155' }}>{a.message}</div>
                    </div>
                  )) : <p style={{ margin: 0, fontSize: '0.9rem', color: '#64748b' }}>No announcements right now.</p>}
                </div>
                {memberPage === 'ministry' && <MemberEvents events={evs} user={user} member={currentMemberRecord} theme={themeColor} />}
              </div>
            );
          })()}

          {memberPage === 'prayer' && (
            <MemberPrayer user={user} member={currentMemberRecord} theme={themeColor} />
          )}
          {memberPage === 'welfare' && (
            <MemberWelfare user={user} member={currentMemberRecord} theme={themeColor} />
          )}
          {memberPage === 'volunteer' && (
            <MemberVolunteer user={user} member={currentMemberRecord} theme={themeColor} />
          )}

          <div style={{ display: memberPage === 'giving' ? 'block' : 'none' }}>
          <div style={{ backgroundColor: '#ffffff', border: '2px solid ' + themeColor, borderRadius: '0.75rem', padding: '1.25rem 1.5rem', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: themeColor, margin: '0 0 0.4rem 0' }}>💳 Give Online</h3>
            <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '0 0 0.8rem 0' }}>Pay securely with MTN MoMo, Vodafone Cash, AirtelTigo Money or a bank card through Hubtel. Your gift is added to your records automatically.</p>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#475569', marginBottom: '0.25rem' }}>What are you giving?</label>
            <select value={payForm.type} onChange={(e) => setPayForm({ ...payForm, type: e.target.value })} style={{ width: '100%', padding: '0.65rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1', boxSizing: 'border-box', backgroundColor: '#ffffff', marginBottom: '0.7rem' }}>
              {['Tithe', 'Offering', 'Seed Offering', 'Thanksgiving', 'Welfare', 'Building Fund', 'Missions', 'Pledge', 'Other'].map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#475569', marginBottom: '0.25rem' }}>Amount (GHS)</label>
            <input type="number" min="1" step="0.01" value={payForm.amount} onChange={(e) => setPayForm({ ...payForm, amount: e.target.value })} placeholder="0.00" style={{ width: '100%', padding: '0.65rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1', boxSizing: 'border-box', marginBottom: '0.5rem' }} />
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.8rem' }}>
              {[20, 50, 100, 200, 500].map(a => <button key={a} type="button" onClick={() => setPayForm({ ...payForm, amount: String(a) })} style={{ backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '2rem', padding: '0.3rem 0.8rem', cursor: 'pointer', fontSize: '0.85rem' }}>{a}</button>)}
            </div>
            <button type="button" disabled={payBusy} onClick={startPayment} style={{ width: '100%', backgroundColor: payBusy ? '#94a3b8' : '#f5a623', color: '#ffffff', border: 'none', padding: '0.8rem', borderRadius: '0.5rem', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer' }}>{payBusy ? 'Please wait...' : 'Give with Hubtel'}</button>
            {payMsg && <div style={{ marginTop: '0.7rem', padding: '0.7rem', borderRadius: '0.5rem', fontSize: '0.88rem', backgroundColor: /^(Could not|The payment was not|We could not)/.test(payMsg) ? '#fee2e2' : '#dcfce7', color: /^(Could not|The payment was not|We could not)/.test(payMsg) ? '#991b1b' : '#166534' }}>{payMsg}</div>}
          </div>

          <div style={{ backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '0.75rem', padding: '1.25rem 1.5rem', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: themeColor, margin: '0 0 0.75rem 0' }}>My Financial Summary (read-only)</h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem', padding: '0.25rem 0' }}><span>Total Tithes</span><strong>GHS {memberTitheTotal.toFixed(2)}</strong></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem', padding: '0.25rem 0' }}><span>Total Contributions &amp; Income</span><strong>GHS {memberContribTotal.toFixed(2)}</strong></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem', padding: '0.25rem 0' }}><span>Total Welfare</span><strong>GHS {memberWelfareTotal.toFixed(2)}</strong></div>
          </div>

          {(() => {
            const yrs = new Set([String(new Date().getFullYear())]);
            [...(mf.tithes || []), ...(mf.contributions || []), ...(mf.incomes || [])].forEach(x => { const y = String(x.date || '').slice(0, 4); if (/^\d{4}$/.test(y)) yrs.add(y); });
            const list = [...yrs].sort().reverse();
            return (
              <div style={{ backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '0.75rem', padding: '1.25rem 1.5rem', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: themeColor, margin: '0 0 0.4rem 0' }}>📄 Giving Statement</h3>
                <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '0 0 0.7rem 0' }}>Download your yearly giving statement as a PDF with the church logo.</p>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <select value={stmtYear} onChange={(e) => setStmtYear(e.target.value)} style={{ padding: '0.6rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1', backgroundColor: '#ffffff' }}>
                    {list.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                  <button type="button" onClick={() => printGivingStatement(currentMemberRecord, mf, stmtYear)} style={{ flex: 1, backgroundColor: themeColor, color: '#ffffff', border: 'none', padding: '0.65rem', borderRadius: '0.5rem', fontWeight: 'bold', cursor: 'pointer' }}>Download Statement (PDF)</button>
                </div>
              </div>
            );
          })()}

          <div style={{ backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '0.75rem', padding: '1.5rem', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: themeColor, marginBottom: '1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>My Tithes History</h3>
            {memberTithes.length > 0 ? (
              memberTithes.map((t, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px dashed #e2e8f0', fontSize: '0.9rem' }}>
                  <span>{t.date}</span>
                  <strong style={{ color: '#16a34a' }}>GHS {parseFloat(t.amount || 0).toFixed(2)}</strong>
                </div>
              ))
            ) : (
              <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>No tithe records found.</p>
            )}
          </div>

          <div style={{ backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '0.75rem', padding: '1.5rem', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: themeColor, marginBottom: '1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>My Contributions & General Income History</h3>
            {memberContributions.length > 0 ? (
              memberContributions.map((c, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px dashed #e2e8f0', fontSize: '0.9rem' }}>
                  <span>{c.type} ({c.date})</span>
                  <strong style={{ color: '#16a34a' }}>GHS {parseFloat(c.amount || 0).toFixed(2)}</strong>
                </div>
              ))
            ) : (
              <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>No contribution records found.</p>
            )}
          </div>

          <div style={{ backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '0.75rem', padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: themeColor, marginBottom: '1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>My Welfare Summary</h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem', fontWeight: 'bold' }}>
              <span>Total Welfare Paid:</span>
              <span style={{ color: themeColor }}>GHS {memberWelfareTotal.toFixed(2)}</span>
            </div>
            {Object.entries(memberWelfareMonths).filter(([, weeks]) => weeks.reduce((a, w) => a + w, 0) > 0).map(([month, weeks]) => (
              <div key={month} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px dashed #e2e8f0', fontSize: '0.9rem' }}>
                <span>{month}</span>
                <strong style={{ color: '#16a34a' }}>GHS {weeks.reduce((a, w) => a + w, 0).toFixed(2)}</strong>
              </div>
            ))}
          </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: 'system-ui, sans-serif', paddingBottom: '2.5rem' }}>
      
      <div style={{ backgroundColor: themeColor, color: '#ffffff', padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <img src={logoSrc} alt="Logo" style={{ width: '44px', height: '44px', borderRadius: '50%', background: '#ffffff', objectFit: 'contain', padding: '2px' }} />
          <div>
            <h1 style={{ fontSize: '1.15rem', fontWeight: 'bold', margin: 0, lineHeight: 1.2 }}>
              {churchName}
            </h1>
            <span style={{ fontSize: '0.75rem', opacity: 0.85 }}>{churchTagline}</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <button 
            type="button"
            onClick={handleLogout}
            style={{ backgroundColor: 'transparent', color: '#ffffff', border: '1px solid #ffffff', padding: '0.35rem 0.85rem', borderRadius: '0.375rem', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem' }}
          >
            Logout
          </button>
        </div>
      </div>

      <div style={{ maxWidth: '44rem', margin: '1.25rem auto', padding: '0 1rem' }}>
        
        <h2 style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#0f172a', marginBottom: '1rem' }}>
          {role === 'super_admin' ? 'Super Admin Dashboard' : 'Sub-Admin Dashboard'}
        </h2>

        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem' }}>
          <button type="button" onClick={() => setViewAsMember(true)} style={{ backgroundColor: '#4f46e5', color: '#ffffff', border: 'none', padding: '0.6rem 1.2rem', borderRadius: '0.375rem', fontWeight: '600', cursor: 'pointer', fontSize: '0.9rem' }}>
            My Portal
          </button>
          <button 
            type="button" 
            onClick={handleLogout} 
            style={{ backgroundColor: '#ef4444', color: '#ffffff', border: 'none', padding: '0.6rem 1.2rem', borderRadius: '0.375rem', fontWeight: '600', cursor: 'pointer', fontSize: '0.9rem' }}
          >
            Logout
          </button>
        </div>

        <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', marginBottom: '1.25rem' }} />

        {saveError && (
          <div style={{ backgroundColor: '#fee2e2', color: '#991b1b', padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '1rem', fontSize: '0.85rem' }}>{saveError}</div>
        )}

        {(() => {
          const groups = [
            { id: 'home', label: '🏠 Home', tabs: [['dashboard', 'Dashboard', true]] },
            { id: 'membership', label: '👥 Membership', tabs: [['members', 'Members', true], ['visitors', 'Visitors', can('record_visitors')], ['new_converts', 'New Converts', can('record_new_converts')], ['followup', 'Follow-up', can('record_visitors') || can('record_new_converts')], ['fellowships', 'House Fellowship', can('manage_fellowships')], ['groups', 'Groups & Classes', can('manage_fellowships')]] },
            { id: 'leadership', label: '🏛 Leadership', tabs: [['leaders', 'Leaders', can('manage_leaders')], ['branches', 'Branches', can('manage_fellowships')]] },
            { id: 'meetings', label: '📅 Meetings', tabs: [['attendance', 'Attendance', can('record_attendance')], ['checkin', 'QR Check-in', can('record_attendance')], ['services', 'Services', can('register_services')], ['events', 'Events', can('register_events')], ['rotas', 'Duty Rotas', can('manage_rotas')], ['volunteers', 'Volunteers', can('manage_rotas')], ['rsvps', 'Event RSVPs', can('register_events')], ['absentees', 'Absentees', can('record_attendance')]] },
            { id: 'finance', label: '💰 Finance', tabs: [['contributions', 'Contributions', can('access_finance') || can('view_balance_sheet')], ['pledges', 'Pledges', can('access_finance')], ['welfare', 'Welfare Requests', can('manage_welfare')]] },
            { id: 'facilities', label: '🏢 Facilities', tabs: [['facilities', 'Facilities', can('manage_facilities')]] },
            { id: 'communication', label: '📢 Communication', tabs: [['announcements', 'Announcements', can('post_announcements')], ['messages', 'Messages', can('send_messages')], ['prayer', 'Prayer Requests', can('manage_prayer')], ['reports', 'Reports', can('view_reports')]] },
            { id: 'media', label: '🎬 Videos', tabs: [['videos', 'Sermons & Videos', can('manage_videos')]] },
            { id: 'admin', label: '⚙️ Admin', tabs: [['permissions', '🔐 Admin Permissions', role === 'super_admin'], ['settings', '⚙️ Settings', role === 'super_admin'], ['activity', '📜 Activity Log', role === 'super_admin']] }
          ].map(g => ({ ...g, tabs: g.tabs.filter(t => t[2]) })).filter(g => g.tabs.length > 0);
          const activeGroup = groups.find(g => g.tabs.some(t => t[0] === activeTab)) || groups[0];
          const goTo = (id) => { setActiveTab(id); setFinanceView('hub'); setShowRegisterForm(false); };
          const pill = (on) => ({ backgroundColor: on ? themeColor : '#f1f5f9', color: on ? '#ffffff' : '#334155', border: 'none', padding: '0.65rem 1rem', borderRadius: '0.5rem', fontWeight: '600', cursor: 'pointer', fontSize: '0.9rem' });
          return (
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.6rem' }}>
                {groups.map(g => (
                  <button key={g.id} type="button" onClick={() => goTo(g.tabs[0][0])} style={pill(activeGroup && activeGroup.id === g.id)}>{g.label}</button>
                ))}
              </div>
              {activeGroup && activeGroup.tabs.length > 1 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', padding: '0.6rem', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '0.5rem' }}>
                  {activeGroup.tabs.map(t => (
                    <button key={t[0]} type="button" onClick={() => goTo(t[0])} style={{ ...pill(activeTab === t[0]), padding: '0.5rem 0.85rem', fontSize: '0.85rem' }}>{t[1]}</button>
                  ))}
                </div>
              )}
            </div>
          );
        })()}

        {/* Home dashboard */}
        {activeTab === 'dashboard' && (
          <HomeDashboard
            members={members}
            attendance={can('record_attendance') ? attendanceLogs : null}
            money={(can('access_finance') || can('view_balance_sheet')) ? { tithes, contributions, incomes } : null}
            followUps={(can('record_visitors') || can('record_new_converts')) ? ((can('record_visitors') ? visitorsList.filter(v => !v.followed_up).length : 0) + (can('record_new_converts') ? convertsList.filter(c => !c.followed_up && (c.follow_up || 'New') === 'New').length : 0)) : null}
            theme={themeColor}
            churchName={churchName}
            goTo={(id) => { setActiveTab(id); setFinanceView('hub'); setShowRegisterForm(false); }}
          />
        )}

        {/* Prayer requests */}
        {activeTab === 'prayer' && can('manage_prayer') && (
          <PrayerAdmin members={members} theme={themeColor} isSuper={role === 'super_admin'} />
        )}

        {activeTab === 'groups' && can('manage_fellowships') && (
          <GroupsTab items={groupsList} onChange={setGroupsList} members={members} theme={themeColor} canDelete={role === 'super_admin'} />
        )}
        {activeTab === 'absentees' && can('record_attendance') && (
          <AbsenteeTab members={members} theme={themeColor} churchName={churchName} canSms={can('send_messages')} />
        )}
        {activeTab === 'rsvps' && can('register_events') && (
          <RsvpAdmin events={eventsList} theme={themeColor} openPrint={openPrintWindow} churchName={churchName} />
        )}
        {activeTab === 'volunteers' && can('manage_rotas') && (
          <VolunteerAdmin members={members} rotas={rotasList} theme={themeColor} />
        )}
        {activeTab === 'welfare' && can('manage_welfare') && (
          <WelfareAdmin members={members} theme={themeColor} isSuper={role === 'super_admin'} onReceipt={can('access_finance') ? printReceipt : null} onRecordExpense={can('access_finance') ? ((d, amt) => setExpenses([{ description: d, amount: String(amt), date: todayISO(), department: 'Welfare' }, ...expenses])) : null} />
        )}

        {/* Admin Permissions Tab (Super Admin Only) */}
        {activeTab === 'permissions' && role === 'super_admin' && (() => {
          const selKey = String(selectedAdminEmail || '').trim().toLowerCase();
          const selMember = members.find(m => String(m.email || '').toLowerCase() === selKey);
          const selPerms = adminPermissions[selKey] || {};
          return (
          <div style={{ backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '0.75rem', padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#0f172a', marginBottom: '0.5rem' }}>Admin Permissions</h3>
            <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1.25rem' }}>Choose a person, make them a Sub-Admin, then tick exactly what they are allowed to do. Sub-admins can record entries but never edit or delete them.</p>

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#475569', marginBottom: '0.375rem' }}>Select person</label>
              <select
                value={selectedAdminEmail}
                onChange={(e) => { setSelectedAdminEmail(e.target.value); setPermMessage(''); }}
                style={{ width: '100%', padding: '0.75rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', boxSizing: 'border-box', fontSize: '0.95rem' }}
              >
                <option value="">-- Choose account --</option>
                {members.filter(m => m.email && m.role !== 'super_admin').map(m => (
                  <option key={m.id} value={m.email}>{displayName(m).trim()} - {m.email}{m.role && m.role !== 'member' ? ' (Sub-Admin)' : ''}</option>
                ))}
              </select>
            </div>

            {selMember && (
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#475569', marginBottom: '0.375rem' }}>Account type</label>
                <select
                  value={selMember.role && selMember.role !== 'member' ? 'admin' : 'member'}
                  onChange={(e) => changeAccountRole(e.target.value)}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', boxSizing: 'border-box', fontSize: '0.95rem' }}
                >
                  <option value="member">Member (no admin access)</option>
                  <option value="admin">Sub-Admin</option>
                </select>
              </div>
            )}

            {selMember && selMember.role && selMember.role !== 'member' && (
              <div>
                {Object.entries(permissionSchema).map(([category, perms]) => (
                  <div key={category} style={{ marginBottom: '1.25rem', border: '1px solid #e2e8f0', borderRadius: '0.5rem', overflow: 'hidden' }}>
                    <div style={{ backgroundColor: '#f1f5f9', padding: '0.75rem 1rem', fontWeight: 'bold', fontSize: '0.95rem', color: themeColor }}>{category}</div>
                    <div style={{ padding: '0.75rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', backgroundColor: '#ffffff' }}>
                      {perms.map(p => (
                        <label key={p.key} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.9rem', cursor: 'pointer', padding: '0.35rem 0.5rem' }}>
                          <input
                            type="checkbox"
                            checked={!!selPerms[p.key]}
                            onChange={(e) => setAdminPermissions({ ...adminPermissions, [selKey]: { ...selPerms, [p.key]: e.target.checked } })}
                            style={{ width: '1rem', height: '1rem', cursor: 'pointer' }}
                          />
                          <span>{p.label}{p.soon ? <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}> (screen not built yet)</span> : null}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={savePermissions}
                  style={{ width: '100%', backgroundColor: themeColor, color: '#ffffff', border: 'none', padding: '0.75rem', borderRadius: '0.375rem', fontWeight: 'bold', cursor: 'pointer', marginTop: '0.5rem' }}
                >
                  Save Permissions
                </button>
              </div>
            )}

            {permMessage && (
              <div style={{ marginTop: '1rem', padding: '0.75rem', borderRadius: '0.5rem', backgroundColor: permMessage.startsWith('Could not') ? '#fee2e2' : '#dcfce7', color: permMessage.startsWith('Could not') ? '#991b1b' : '#166534', fontSize: '0.85rem' }}>{permMessage}</div>
            )}
          </div>
          );
        })()}

        {/* Members Tab */}
        {activeTab === 'members' && (
          <div>
            {!showRegisterForm ? (
              <div>
                <div style={{ marginBottom: '0.75rem' }}>
                  <input 
                    type="text" 
                    placeholder="Search name or email..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', fontSize: '0.95rem', boxSizing: 'border-box', backgroundColor: '#ffffff' }}
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '0.6rem' }}>
                  <select value={fDept} onChange={(e) => setFDept(e.target.value)} style={{ padding: '0.55rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '0.85rem' }}>
                    <option value="">All core departments</option>
                    {CORE_DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                  <select value={fSub} onChange={(e) => setFSub(e.target.value)} style={{ padding: '0.55rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '0.85rem' }}>
                    <option value="">All sub-departments</option>
                    {SUB_DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                  <select value={fGender} onChange={(e) => setFGender(e.target.value)} style={{ padding: '0.55rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '0.85rem' }}>
                    <option value="">All genders</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                  <select value={fMarital} onChange={(e) => setFMarital(e.target.value)} style={{ padding: '0.55rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '0.85rem' }}>
                    <option value="">All marital statuses</option>
                    <option value="Single">Single</option>
                    <option value="Married">Married</option>
                    <option value="Divorced">Divorced</option>
                    <option value="Widowed">Widowed</option>
                  </select>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.9rem', fontSize: '0.85rem', color: '#475569' }}>
                  <span>Showing {filteredMembers.length} of {members.length} members</span>
                  {role === 'super_admin' && (shrinkMsg || members.some((m) => typeof m.photo_size === 'number' && m.photo_size > PHOTO_AUTOLOAD_LIMIT)) && (
                    <span style={{ flexBasis: '100%', background: '#fffbeb', border: '1px solid #fde68a', color: '#92400e', padding: '0.6rem 0.8rem', borderRadius: '0.5rem', fontWeight: 600 }}>
                      {shrinkMsg ? shrinkMsg + ' ' : (members.filter((m) => typeof m.photo_size === 'number' && m.photo_size > PHOTO_AUTOLOAD_LIMIT).length + ' member photo(s) are very large and are hidden to keep the list fast. ')}
                      {!shrinking && members.some((m) => typeof m.photo_size === 'number' && m.photo_size > PHOTO_AUTOLOAD_LIMIT) && (
                        <button type="button" onClick={shrinkMemberPhotos} style={{ background: 'none', border: 'none', color: '#92400e', fontWeight: 'bold', textDecoration: 'underline', cursor: 'pointer' }}>Tap to shrink photos</button>
                      )}
                    </span>
                  )}
                  {memberLoadError && members.length === 0 && (
                    <span style={{ flexBasis: '100%', background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', padding: '0.6rem 0.8rem', borderRadius: '0.5rem', fontWeight: 600 }}>
                      Couldn't load the members list ({memberLoadError}). Your members are safe.{' '}
                      <button type="button" onClick={() => fetchMembers()} style={{ background: 'none', border: 'none', color: '#991b1b', fontWeight: 'bold', textDecoration: 'underline', cursor: 'pointer' }}>Tap to try again</button>
                    </span>
                  )}
                  <span style={{ display: 'flex', gap: '0.5rem' }}>
                    {(fDept || fSub || fGender || fMarital || searchQuery) && <button type="button" onClick={() => { setFDept(''); setFSub(''); setFGender(''); setFMarital(''); setSearchQuery(''); }} style={{ background: 'none', border: 'none', color: themeColor, fontWeight: 'bold', cursor: 'pointer' }}>Clear filters</button>}
                    {can('register_members') && <button type="button" onClick={() => printIdCards(filteredMembers)} style={{ backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', padding: '0.35rem 0.7rem', borderRadius: '0.4rem', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.82rem' }}>🪪 Print ID cards</button>}
                  </span>
                </div>
                {can('register_members') && (
                <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '0.75rem' }}>
                  <button 
                    type="button" 
                    onClick={() => { setEditingMemberId(null); setFormData({ ...EMPTY_FORM }); setShowRegisterForm(true); }} 
                    style={{ flex: 1, backgroundColor: '#10b981', color: '#ffffff', border: 'none', padding: '0.75rem', borderRadius: '0.5rem', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer' }}
                  >
                    + Add New Member
                  </button>
                  <button 
                    type="button" 
                    onClick={async () => {
                      const link = window.location.origin + '/?register=1';
                      try { await navigator.clipboard.writeText(link); alert('Self-registration link copied. Share it with new members:\n' + link); }
                      catch (err) { prompt('Copy this self-registration link:', link); }
                    }} 
                    style={{ backgroundColor: '#4f46e5', color: '#ffffff', border: 'none', padding: '0.75rem 1rem', borderRadius: '0.5rem', fontWeight: 'bold', fontSize: '0.9rem', cursor: 'pointer' }}
                  >
                    🔗 Copy Self-Register Link
                  </button>
                </div>
                )}
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {filteredMembers.map((m, index) => {
                    const nameStr = displayName(m).trim() || m.email;
                    const initials = (`${m.first_name || ''} ${m.last_name || ''}`.trim() || m.email || '?').split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
                    return (
                      <div key={m.id || index} style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '0.75rem', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem' }}>
                          {m.photo_url ? (
                            <img src={m.photo_url} alt="Member" style={{ width: '3rem', height: '3rem', borderRadius: '50%', objectFit: 'cover' }} />
                          ) : (
                            <div style={{ width: '3rem', height: '3rem', borderRadius: '50%', backgroundColor: '#cbd5e1', color: '#334155', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                              {initials}
                            </div>
                          )}
                          <div>
                            <div style={{ fontSize: '1.05rem', fontWeight: 'bold', color: '#0f172a' }}>{nameStr}</div>
                            <div style={{ fontSize: '0.85rem', color: '#475569' }}>Email: {m.email} | Phone: {m.phone || 'N/A'}</div>
                            <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.2rem' }}>
                              <strong>Core Dept:</strong> {m.core_department || 'N/A'} | <strong>Sub-Depts:</strong> {m.sub_departments || 'None'}
                            </div>
                            <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.1rem' }}>
                              <strong>Address:</strong> {m.home_address || 'N/A'}, {m.home_town || 'N/A'}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.1rem' }}>
                              DOB: {m.date_of_birth || 'N/A'} | Baptism: {m.date_of_baptism || 'N/A'} | Joined: {m.date_joined || 'N/A'}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.1rem' }}>
                              {m.gender || 'Gender N/A'} | {m.marital_status || 'Marital N/A'} | Occupation: {m.occupation || 'N/A'} | Children: {m.number_of_children == null ? 'N/A' : m.number_of_children}
                            </div>
                          </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', alignItems: 'flex-end' }}>
{can('register_members') && (
                          <button type="button" onClick={() => printIdCards([m])} style={{ backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', padding: '0.3rem 0.6rem', borderRadius: '0.3rem', fontSize: '0.8rem', fontWeight: 'bold', cursor: 'pointer' }}>
                            🪪 ID Card
                          </button>
                          )}
{can('access_finance') && (
                          <button type="button" onClick={() => {
                            const y = prompt('Giving statement for which year?', String(new Date().getFullYear()));
                            if (!y) return;
                            const id = String(m.id);
                            printGivingStatement(m, { tithes: tithes.filter(x => String(x.member_id) === id), contributions: contributions.filter(x => String(x.member_id) === id), incomes: incomes.filter(x => x.member_id && String(x.member_id) === id), welfare: welfareRecords[id] || {} }, y.trim());
                          }} style={{ backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', padding: '0.3rem 0.6rem', borderRadius: '0.3rem', fontSize: '0.8rem', fontWeight: 'bold', cursor: 'pointer' }}>
                            📄 Statement
                          </button>
                          )}
{can('register_members') && (
                          <button type="button" onClick={() => handleStartEditMember(m)} style={{ backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', padding: '0.3rem 0.6rem', borderRadius: '0.3rem', fontSize: '0.8rem', fontWeight: 'bold', cursor: 'pointer', color: '#2563eb' }}>
                            ✏️ Edit
                          </button>
                          )}
                          {role === 'super_admin' && (
                            <button type="button" onClick={() => handleDeleteMember(m.id)} style={{ backgroundColor: '#fee2e2', border: 'none', padding: '0.3rem 0.6rem', borderRadius: '0.3rem', fontSize: '0.8rem', fontWeight: 'bold', cursor: 'pointer', color: '#dc2626' }}>
                              🗑️ Delete
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div style={{ backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '0.75rem', padding: '1.5rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#0f172a', margin: 0 }}>
                    {editingMemberId ? 'Edit Member Details' : 'Register New Member'}
                  </h3>
                  <button type="button" onClick={() => { setShowRegisterForm(false); setEditingMemberId(null); }} style={{ background: 'none', border: 'none', fontSize: '1rem', cursor: 'pointer', color: '#64748b', fontWeight: 'bold' }}>✕ Close</button>
                </div>

                {formError && <div style={{ backgroundColor: '#fee2e2', color: '#991b1b', padding: '0.75rem', borderRadius: '0.375rem', marginBottom: '1rem', fontSize: '0.875rem' }}>{formError}</div>}
                {formSuccess && <div style={{ backgroundColor: '#d1fae5', color: '#065f46', padding: '0.75rem', borderRadius: '0.375rem', marginBottom: '1rem', fontSize: '0.875rem' }}>{formSuccess}</div>}

                <form onSubmit={handleSaveMember} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#475569', marginBottom: '0.25rem' }}>Title</label>
                    <select value={formData.title || ''} onChange={(e) => setFormData({...formData, title: e.target.value})} style={{ width: '100%', padding: '0.65rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1', boxSizing: 'border-box', backgroundColor: '#ffffff' }}>
                      <option value="">-- Select title --</option>
                      {TITLES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#475569', marginBottom: '0.25rem' }}>First Name *</label>
                      <input type="text" required value={formData.first_name} onChange={(e) => setFormData({...formData, first_name: e.target.value})} style={{ width: '100%', padding: '0.65rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} placeholder="First name" />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#475569', marginBottom: '0.25rem' }}>Last Name *</label>
                      <input type="text" required value={formData.last_name} onChange={(e) => setFormData({...formData, last_name: e.target.value})} style={{ width: '100%', padding: '0.65rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} placeholder="Last name" />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#475569', marginBottom: '0.25rem' }}>Email Address *</label>
                      <input type="email" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} style={{ width: '100%', padding: '0.65rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} placeholder="Email" />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#475569', marginBottom: '0.25rem' }}>Phone Number</label>
                      <input type="text" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} style={{ width: '100%', padding: '0.65rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} placeholder="Phone" />
                    </div>
                  </div>

                  {!editingMemberId && (
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#475569', marginBottom: '0.25rem' }}>Password * (min. 6 characters)</label>
                      <input type="password" required minLength={6} autoComplete="new-password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} style={{ width: '100%', padding: '0.65rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} placeholder="Create a password for this member" />
                    </div>
                  )}

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#475569', marginBottom: '0.25rem' }}>Emergency Contact Person *</label>
                      <input type="text" required value={formData.emergency_contact_name} onChange={(e) => setFormData({...formData, emergency_contact_name: e.target.value})} style={{ width: '100%', padding: '0.65rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} placeholder="Full name" />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#475569', marginBottom: '0.25rem' }}>Emergency Contact Number *</label>
                      <input type="tel" required value={formData.emergency_contact_phone} onChange={(e) => setFormData({...formData, emergency_contact_phone: e.target.value})} style={{ width: '100%', padding: '0.65rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} placeholder="Phone number" />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#475569', marginBottom: '0.25rem' }}>Core Department (Compulsory - Select One) *</label>
                    <select value={formData.core_department} onChange={(e) => setFormData({...formData, core_department: e.target.value})} style={{ width: '100%', padding: '0.65rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', boxSizing: 'border-box' }}>
                      <option value="LOVE">LOVE</option>
                      <option value="UNITY">UNITY</option>
                      <option value="CARE">CARE</option>
                      <option value="RESPECT">RESPECT</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#475569', marginBottom: '0.25rem' }}>Sub-Departments (Select multiple as applicable)</label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', maxHeight: '10rem', overflowY: 'auto', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '0.375rem', backgroundColor: '#f8fafc' }}>
                      {subDeptList.map((dept) => (
                        <label key={dept} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', cursor: 'pointer' }}>
                          <input 
                            type="checkbox" 
                            checked={formData.sub_departments.includes(dept)} 
                            onChange={() => handleSubDeptToggle(dept)} 
                          />
                          {dept}
                        </label>
                      ))}
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', color: '#475569', marginBottom: '0.25rem' }}>Date of Birth</label>
                      <input type="date" value={formData.date_of_birth} onChange={(e) => setFormData({...formData, date_of_birth: e.target.value})} style={{ width: '100%', padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1', fontSize: '0.8rem', boxSizing: 'border-box' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', color: '#475569', marginBottom: '0.25rem' }}>Date of Baptism</label>
                      <input type="date" value={formData.date_of_baptism} onChange={(e) => setFormData({...formData, date_of_baptism: e.target.value})} style={{ width: '100%', padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1', fontSize: '0.8rem', boxSizing: 'border-box' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', color: '#475569', marginBottom: '0.25rem' }}>Date Joined</label>
                      <input type="date" value={formData.date_joined} onChange={(e) => setFormData({...formData, date_joined: e.target.value})} style={{ width: '100%', padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1', fontSize: '0.8rem', boxSizing: 'border-box' }} />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#475569', marginBottom: '0.25rem' }}>Home Address</label>
                      <input type="text" value={formData.home_address} onChange={(e) => setFormData({...formData, home_address: e.target.value})} style={{ width: '100%', padding: '0.65rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} placeholder="Home address" />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#475569', marginBottom: '0.25rem' }}>Home Town</label>
                      <input type="text" value={formData.home_town} onChange={(e) => setFormData({...formData, home_town: e.target.value})} style={{ width: '100%', padding: '0.65rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} placeholder="Home town" />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#475569', marginBottom: '0.25rem' }}>Gender</label>
                      <select value={formData.gender || ''} onChange={(e) => setFormData({...formData, gender: e.target.value})} style={{ width: '100%', padding: '0.65rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1', boxSizing: 'border-box', backgroundColor: '#ffffff' }}>
                        <option value="">-- Select --</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#475569', marginBottom: '0.25rem' }}>Marital Status</label>
                      <select value={formData.marital_status || ''} onChange={(e) => setFormData({...formData, marital_status: e.target.value})} style={{ width: '100%', padding: '0.65rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1', boxSizing: 'border-box', backgroundColor: '#ffffff' }}>
                        <option value="">-- Select --</option>
                        <option value="Single">Single</option>
                        <option value="Married">Married</option>
                        <option value="Divorced">Divorced</option>
                        <option value="Widowed">Widowed</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#475569', marginBottom: '0.25rem' }}>Occupation</label>
                      <input type="text" value={formData.occupation || ''} onChange={(e) => setFormData({...formData, occupation: e.target.value})} style={{ width: '100%', padding: '0.65rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1', boxSizing: 'border-box', backgroundColor: '#ffffff' }} placeholder="e.g. Teacher, Trader, Student" />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#475569', marginBottom: '0.25rem' }}>Number of Children</label>
                      <input type="number" min="0" value={formData.number_of_children} onChange={(e) => setFormData({...formData, number_of_children: e.target.value})} style={{ width: '100%', padding: '0.65rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1', boxSizing: 'border-box', backgroundColor: '#ffffff' }} placeholder="0" />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#475569', marginBottom: '0.25rem' }}>Upload Member Photo</label>
                    <input type="file" accept="image/*" onChange={handlePhotoUpload} style={{ width: '100%', padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', boxSizing: 'border-box' }} />
                    {formData.photo_url && <p style={{ fontSize: '0.75rem', color: '#16a34a', marginTop: '0.25rem' }}>Photo attached successfully!</p>}
                  </div>

                  <button type="submit" style={{ backgroundColor: themeColor, color: '#ffffff', border: 'none', padding: '0.75rem', borderRadius: '0.375rem', fontWeight: 'bold', fontSize: '0.95rem', cursor: 'pointer', marginTop: '0.5rem' }}>
                    {editingMemberId ? 'Update Member' : 'Save Member'}
                  </button>
                </form>
              </div>
            )}
          </div>
        )}

        {/* Contributions & Finance Tab */}
        {activeTab === 'contributions' && (
          <div>
            {financeView === 'hub' && (
              <div>
                {role === 'super_admin' && (
                  <div style={{ backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '0.75rem', padding: '1rem 1.25rem', marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '600' }}>Opening Balance</div>
                      <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: themeColor }}>GHS {openingBalance.toFixed(2)}</div>
                    </div>
                    <button type="button" onClick={() => { const val = prompt("Enter new opening balance:", openingBalance); if(val) setOpeningBalance(parseFloat(val) || 0); }} style={{ backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', padding: '0.5rem 0.85rem', borderRadius: '0.375rem', fontWeight: '600', fontSize: '0.85rem', cursor: 'pointer', color: themeColor }}>
                      ✏️ Edit Opening Balance
                    </button>
                  </div>
                )}

                <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#0f172a', margin: '0 0 0.25rem 0' }}>Finance Management Suite</h3>
                  <p style={{ fontSize: '0.875rem', color: '#64748b', margin: 0 }}>Select a finance module below.</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.85rem' }}>
                  {can('access_finance') && (
                  <div onClick={() => setFinanceView('income')} style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '0.75rem', padding: '1.25rem', textAlign: 'center', cursor: 'pointer' }}>
                    <div style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>➕</div>
                    <div style={{ fontSize: '1rem', fontWeight: 'bold', color: themeColor }}>Record Member General Income</div>
                  </div>
                  )}
                  {can('access_finance') && (
                  <div onClick={() => setFinanceView('tithes')} style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '0.75rem', padding: '1.25rem', textAlign: 'center', cursor: 'pointer' }}>
                    <div style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>🪙</div>
                    <div style={{ fontSize: '1rem', fontWeight: 'bold', color: themeColor }}>Record Member Tithes</div>
                  </div>
                  )}
                  {can('access_finance') && (
                  <div onClick={() => setFinanceView('contributions')} style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '0.75rem', padding: '1.25rem', textAlign: 'center', cursor: 'pointer' }}>
                    <div style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>📒</div>
                    <div style={{ fontSize: '1rem', fontWeight: 'bold', color: themeColor }}>Contributions Tracker</div>
                  </div>
                  )}
                  {can('access_finance') && (
                  <div onClick={() => setFinanceView('welfare')} style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '0.75rem', padding: '1.25rem', textAlign: 'center', cursor: 'pointer' }}>
                    <div style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>🤝</div>
                    <div style={{ fontSize: '1rem', fontWeight: 'bold', color: themeColor }}>Record Member Welfare Contributions</div>
                  </div>
                  )}
                  {role === 'super_admin' && (
                    <>
                      <div onClick={() => setFinanceView('expenses')} style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '0.75rem', padding: '1.25rem', textAlign: 'center', cursor: 'pointer' }}>
                        <div style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>➖</div>
                        <div style={{ fontSize: '1rem', fontWeight: 'bold', color: themeColor }}>Record Expenses</div>
                      </div>
                      <div onClick={() => setFinanceView('budgets')} style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '0.75rem', padding: '1.25rem', textAlign: 'center', cursor: 'pointer' }}>
                        <div style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>📊</div>
                        <div style={{ fontSize: '1rem', fontWeight: 'bold', color: themeColor }}>Record Budgets</div>
                      </div>
                      <div onClick={() => setFinanceView('approve_budgets')} style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '0.75rem', padding: '1.25rem', textAlign: 'center', cursor: 'pointer' }}>
                        <div style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>✅</div>
                        <div style={{ fontSize: '1rem', fontWeight: 'bold', color: themeColor }}>Approve Budgets</div>
                      </div>
                    </>
                  )}
                  {can('access_finance') && (
                  <div onClick={() => setFinanceView('deptbudget')} style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '0.75rem', padding: '1.25rem', textAlign: 'center', cursor: 'pointer' }}>
                    <div style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>🎯</div>
                    <div style={{ fontSize: '1rem', fontWeight: 'bold', color: themeColor }}>Budget vs Actual</div>
                  </div>
                  )}
                  {can('view_balance_sheet') && (
                  <div onClick={() => setFinanceView('reports')} style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '0.75rem', padding: '1.25rem', textAlign: 'center', cursor: 'pointer' }}>
                    <div style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>💳</div>
                    <div style={{ fontSize: '1rem', fontWeight: 'bold', color: themeColor }}>Account Report</div>
                  </div>
                  )}
                  {can('view_balance_sheet') && (
                    <div onClick={() => setFinanceView('balancesheet')} style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '0.75rem', padding: '1.25rem', textAlign: 'center', cursor: 'pointer' }}>
                      <div style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>⚖️</div>
                      <div style={{ fontSize: '1rem', fontWeight: 'bold', color: themeColor }}>Balance Sheet</div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {financeView === 'income' && can('access_finance') && (
              <div>
                <button type="button" onClick={() => { setFinanceView('hub'); setEditingIncomeIndex(null); }} style={{ backgroundColor: '#e2e8f0', border: 'none', padding: '0.5rem 1rem', borderRadius: '0.375rem', fontWeight: 'bold', cursor: 'pointer', marginBottom: '1rem' }}>
                  ← Back to Finance Hub
                </button>
                <div style={{ backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '0.75rem', padding: '1.25rem', marginBottom: '1.25rem' }}>
                  <h3 style={{ margin: '0 0 1rem 0', color: '#0f172a' }}>{editingIncomeIndex !== null ? 'Edit Income Entry' : 'Record Member General Income'}</h3>
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    if (editingIncomeIndex !== null) {
                      if (role !== 'super_admin') { alert('Permission denied. Only Super Admin can edit entries.'); return; }
                      const updated = [...incomes];
                      updated[editingIncomeIndex] = incomeForm;
                      setIncomes(updated);
                      setEditingIncomeIndex(null);
                      alert('Income updated successfully!');
                    } else {
                      setIncomes([incomeForm, ...incomes]);
                      alert('Member general income recorded successfully!');
                    }
                    setIncomeForm({ source: '', amount: '', date: '', member_id: '', member_name: '' });
                  }} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#475569', marginBottom: '0.25rem' }}>Income Source / Member Title</label>
                      <input type="text" required value={incomeForm.source} onChange={(e) => setIncomeForm({...incomeForm, source: e.target.value})} style={{ width: '100%', padding: '0.6rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} placeholder="e.g. Member General Offering" />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#475569', marginBottom: '0.25rem' }}>Member (optional - shows on that member's dashboard)</label>
                      <select value={incomeForm.member_id || ''} onChange={(e) => {
                        const mId = e.target.value;
                        const mem = members.find(m => m.id === mId);
                        setIncomeForm({ ...incomeForm, member_id: mId, member_name: mem ? displayName(mem).trim() : '' });
                      }} style={{ width: '100%', padding: '0.6rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', boxSizing: 'border-box' }}>
                        <option value="">-- Not linked to a member --</option>
                        {members.map(m => (
                          <option key={m.id} value={m.id}>{displayName(m).trim() || m.email}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#475569', marginBottom: '0.25rem' }}>Amount (GHS)</label>
                      <input type="number" required step="0.01" value={incomeForm.amount} onChange={(e) => setIncomeForm({...incomeForm, amount: e.target.value})} style={{ width: '100%', padding: '0.6rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} placeholder="0.00" />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#475569', marginBottom: '0.25rem' }}>Date</label>
                      <input type="date" required value={incomeForm.date} onChange={(e) => setIncomeForm({...incomeForm, date: e.target.value})} style={{ width: '100%', padding: '0.6rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
                    </div>
                    <button type="submit" style={{ backgroundColor: themeColor, color: '#ffffff', border: 'none', padding: '0.75rem', borderRadius: '0.375rem', fontWeight: 'bold', cursor: 'pointer', marginTop: '0.5rem' }}>
                      {editingIncomeIndex !== null ? 'Update Income' : 'Save Income Entry'}
                    </button>
                  </form>
                </div>
                <h4 style={{ color: '#0f172a' }}>Recorded Incomes ({incomes.length})</h4>
                {incomes.map((inc, i) => (
                  <div key={i} style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '0.5rem', padding: '0.75rem 1rem', marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span><strong>{inc.source}</strong> ({inc.date}) - <strong style={{ color: '#16a34a' }}>GHS {parseFloat(inc.amount || 0).toFixed(2)}</strong></span>
                    {role === 'super_admin' && (
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button type="button" onClick={() => { setIncomeForm(inc); setEditingIncomeIndex(i); }} style={{ backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', padding: '0.25rem 0.5rem', borderRadius: '0.25rem', cursor: 'pointer', fontSize: '0.8rem' }}>Edit</button>
                        <button type="button" onClick={() => setIncomes(incomes.filter((_, idx) => idx !== i))} style={{ backgroundColor: '#fee2e2', color: '#991b1b', border: 'none', padding: '0.25rem 0.5rem', borderRadius: '0.25rem', cursor: 'pointer', fontSize: '0.8rem' }}>Delete</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {financeView === 'expenses' && role === 'super_admin' && (
              <div>
                <button type="button" onClick={() => { setFinanceView('hub'); setEditingExpenseIndex(null); }} style={{ backgroundColor: '#e2e8f0', border: 'none', padding: '0.5rem 1rem', borderRadius: '0.375rem', fontWeight: 'bold', cursor: 'pointer', marginBottom: '1rem' }}>
                  ← Back to Finance Hub
                </button>
                <div style={{ backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '0.75rem', padding: '1.25rem', marginBottom: '1.25rem' }}>
                  <h3 style={{ margin: '0 0 1rem 0', color: '#0f172a' }}>{editingExpenseIndex !== null ? 'Edit Expense Entry' : 'Record Expense'}</h3>
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    if (editingExpenseIndex !== null) {
                      const updated = [...expenses];
                      updated[editingExpenseIndex] = expenseForm;
                      setExpenses(updated);
                      setEditingExpenseIndex(null);
                      alert('Expense updated successfully!');
                    } else {
                      setExpenses([expenseForm, ...expenses]);
                      alert('Expense recorded successfully!');
                    }
                    setExpenseForm({ description: '', amount: '', date: '', department: '' });
                  }} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#475569', marginBottom: '0.25rem' }}>Expense Description</label>
                      <input type="text" required value={expenseForm.description} onChange={(e) => setExpenseForm({...expenseForm, description: e.target.value})} style={{ width: '100%', padding: '0.6rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} placeholder="e.g. Utility bills" />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#475569', marginBottom: '0.25rem' }}>Amount (GHS)</label>
                      <input type="number" required step="0.01" value={expenseForm.amount} onChange={(e) => setExpenseForm({...expenseForm, amount: e.target.value})} style={{ width: '100%', padding: '0.6rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} placeholder="0.00" />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#475569', marginBottom: '0.25rem' }}>Date</label>
                      <input type="date" required value={expenseForm.date} onChange={(e) => setExpenseForm({...expenseForm, date: e.target.value})} style={{ width: '100%', padding: '0.6rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#475569', marginBottom: '0.25rem' }}>Department (for Budget vs Actual)</label>
                      <select value={expenseForm.department || ''} onChange={(e) => setExpenseForm({...expenseForm, department: e.target.value})} style={{ width: '100%', padding: '0.6rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1', boxSizing: 'border-box', backgroundColor: '#ffffff' }}>
                        <option value="">-- Not chosen --</option>
                        {BUDGET_DEPTS.map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </div>
                    <button type="submit" style={{ backgroundColor: themeColor, color: '#ffffff', border: 'none', padding: '0.75rem', borderRadius: '0.375rem', fontWeight: 'bold', cursor: 'pointer', marginTop: '0.5rem' }}>
                      {editingExpenseIndex !== null ? 'Update Expense' : 'Save Expense Entry'}
                    </button>
                  </form>
                </div>
                <h4 style={{ color: '#0f172a' }}>Recorded Expenses ({expenses.length})</h4>
                {expenses.map((exp, i) => (
                  <div key={i} style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '0.5rem', padding: '0.75rem 1rem', marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span><strong>{exp.description}</strong> ({exp.date}){exp.department ? <span style={{ color: '#64748b', fontSize: '0.8rem' }}> [{exp.department}]</span> : null} - <strong style={{ color: '#dc2626' }}>GHS {parseFloat(exp.amount || 0).toFixed(2)}</strong></span>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button type="button" onClick={() => { setExpenseForm(exp); setEditingExpenseIndex(i); }} style={{ backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', padding: '0.25rem 0.5rem', borderRadius: '0.25rem', cursor: 'pointer', fontSize: '0.8rem' }}>Edit</button>
                      <button type="button" onClick={() => setExpenses(expenses.filter((_, idx) => idx !== i))} style={{ backgroundColor: '#fee2e2', color: '#991b1b', border: 'none', padding: '0.25rem 0.5rem', borderRadius: '0.25rem', cursor: 'pointer', fontSize: '0.8rem' }}>Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {financeView === 'tithes' && can('access_finance') && (
              <div>
                <button type="button" onClick={() => { setFinanceView('hub'); setEditingTitheIndex(null); }} style={{ backgroundColor: '#e2e8f0', border: 'none', padding: '0.5rem 1rem', borderRadius: '0.375rem', fontWeight: 'bold', cursor: 'pointer', marginBottom: '1rem' }}>
                  ← Back to Finance Hub
                </button>
                <div style={{ backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '0.75rem', padding: '1.25rem', marginBottom: '1.25rem' }}>
                  <h3 style={{ margin: '0 0 1rem 0', color: '#0f172a' }}>{editingTitheIndex !== null ? 'Edit Tithe Entry' : 'Record Member Tithes'}</h3>
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    const selectedMember = members.find(m => m.id === titheForm.member_id);
                    const memberName = selectedMember ? displayName(selectedMember).trim() : titheForm.member_name;
                    const payload = { ...titheForm, member_name: memberName };

                    if (editingTitheIndex !== null) {
                      if (role !== 'super_admin') { alert('Permission denied. Only Super Admin can edit tithes.'); return; }
                      const updated = [...tithes];
                      updated[editingTitheIndex] = payload;
                      setTithes(updated);
                      setEditingTitheIndex(null);
                      alert('Tithe updated successfully!');
                    } else {
                      setTithes([payload, ...tithes]);
                      alert('Tithe recorded successfully!');
                    }
                    setTitheForm({ member_id: '', member_name: '', amount: '', date: '' });
                  }} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#475569', marginBottom: '0.25rem' }}>Select Member</label>
                      <select required value={titheForm.member_id} onChange={(e) => {
                        const mId = e.target.value;
                        const mem = members.find(m => m.id === mId);
                        setTitheForm({ ...titheForm, member_id: mId, member_name: mem ? displayName(mem) : '' });
                      }} style={{ width: '100%', padding: '0.6rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', boxSizing: 'border-box' }}>
                        <option value="">-- Choose Member --</option>
                        {members.map(m => (
                          <option key={m.id} value={m.id}>{displayName(m).trim() || m.email}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#475569', marginBottom: '0.25rem' }}>Amount (GHS)</label>
                      <input type="number" required step="0.01" value={titheForm.amount} onChange={(e) => setTitheForm({...titheForm, amount: e.target.value})} style={{ width: '100%', padding: '0.6rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} placeholder="0.00" />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#475569', marginBottom: '0.25rem' }}>Date</label>
                      <input type="date" required value={titheForm.date} onChange={(e) => setTitheForm({...titheForm, date: e.target.value})} style={{ width: '100%', padding: '0.6rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
                    </div>
                    <button type="submit" style={{ backgroundColor: themeColor, color: '#ffffff', border: 'none', padding: '0.75rem', borderRadius: '0.375rem', fontWeight: 'bold', cursor: 'pointer', marginTop: '0.5rem' }}>
                      {editingTitheIndex !== null ? 'Update Tithe' : 'Save Tithe Entry'}
                    </button>
                  </form>
                </div>
                <h4 style={{ color: '#0f172a' }}>Recorded Tithes ({tithes.length})</h4>
                {tithes.map((t, i) => (
                  <div key={i} style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '0.5rem', padding: '0.75rem 1rem', marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span><strong>{t.member_name}</strong> ({t.date}) - <strong style={{ color: '#16a34a' }}>GHS {parseFloat(t.amount || 0).toFixed(2)}</strong> <button type="button" onClick={() => printReceipt('Tithe', t)} style={{ marginLeft: '0.4rem', backgroundColor: '#ecfdf5', color: '#166534', border: '1px solid #86efac', padding: '0.2rem 0.5rem', borderRadius: '0.25rem', cursor: 'pointer', fontSize: '0.78rem' }}>Receipt</button></span>
                    {role === 'super_admin' && (
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button type="button" onClick={() => { setTitheForm(t); setEditingTitheIndex(i); }} style={{ backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', padding: '0.25rem 0.5rem', borderRadius: '0.25rem', cursor: 'pointer', fontSize: '0.8rem' }}>Edit</button>
                        <button type="button" onClick={() => setTithes(tithes.filter((_, idx) => idx !== i))} style={{ backgroundColor: '#fee2e2', color: '#991b1b', border: 'none', padding: '0.25rem 0.5rem', borderRadius: '0.25rem', cursor: 'pointer', fontSize: '0.8rem' }}>Delete</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {financeView === 'contributions' && can('access_finance') && (
              <div>
                <button type="button" onClick={() => { setFinanceView('hub'); setEditingContribIndex(null); }} style={{ backgroundColor: '#e2e8f0', border: 'none', padding: '0.5rem 1rem', borderRadius: '0.375rem', fontWeight: 'bold', cursor: 'pointer', marginBottom: '1rem' }}>
                  ← Back to Finance Hub
                </button>
                <div style={{ backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '0.75rem', padding: '1.25rem', marginBottom: '1.25rem' }}>
                  <h3 style={{ margin: '0 0 1rem 0', color: '#0f172a' }}>{editingContribIndex !== null ? 'Edit Contribution Entry' : 'Contributions Tracker - Record Contribution'}</h3>
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    const selectedMember = members.find(m => m.id === contribForm.member_id);
                    const contributorName = selectedMember ? displayName(selectedMember).trim() : contribForm.contributor;
                    const payload = { ...contribForm, contributor: contributorName };
                    if (editingContribIndex !== null) {
                      if (role !== 'super_admin') { alert('Permission denied. Only Super Admin can edit entries.'); return; }
                      const updated = [...contributions];
                      updated[editingContribIndex] = payload;
                      setContributions(updated);
                      setEditingContribIndex(null);
                      alert('Contribution updated successfully!');
                    } else {
                      setContributions([payload, ...contributions]);
                      alert('Contribution recorded successfully!');
                    }
                    setContribForm({ member_id: '', contributor: '', type: 'General', amount: '', date: '' });
                  }} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#475569', marginBottom: '0.25rem' }}>Select Member</label>
                      <select required value={contribForm.member_id} onChange={(e) => {
                        const mId = e.target.value;
                        const mem = members.find(m => m.id === mId);
                        setContribForm({ ...contribForm, member_id: mId, contributor: mem ? displayName(mem).trim() : '' });
                      }} style={{ width: '100%', padding: '0.6rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', boxSizing: 'border-box' }}>
                        <option value="">-- Choose Member --</option>
                        {members.map(m => (
                          <option key={m.id} value={m.id}>{displayName(m).trim() || m.email}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#475569', marginBottom: '0.25rem' }}>Contribution Type</label>
                      <select value={contribForm.type} onChange={(e) => setContribForm({...contribForm, type: e.target.value})} style={{ width: '100%', padding: '0.6rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', boxSizing: 'border-box' }}>
                        <option value="General">General</option>
                        <option value="Building Fund">Building Fund</option>
                        <option value="Thanksgiving">Thanksgiving</option>
                        <option value="Pledge">Pledge</option>
                        <option value="Missions">Missions</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#475569', marginBottom: '0.25rem' }}>Amount (GHS)</label>
                      <input type="number" required step="0.01" value={contribForm.amount} onChange={(e) => setContribForm({...contribForm, amount: e.target.value})} style={{ width: '100%', padding: '0.6rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} placeholder="0.00" />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#475569', marginBottom: '0.25rem' }}>Date</label>
                      <input type="date" required value={contribForm.date} onChange={(e) => setContribForm({...contribForm, date: e.target.value})} style={{ width: '100%', padding: '0.6rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
                    </div>
                    <button type="submit" style={{ backgroundColor: themeColor, color: '#ffffff', border: 'none', padding: '0.75rem', borderRadius: '0.375rem', fontWeight: 'bold', cursor: 'pointer', marginTop: '0.5rem' }}>
                      {editingContribIndex !== null ? 'Update Contribution' : 'Save Contribution Entry'}
                    </button>
                  </form>
                </div>
                <h4 style={{ color: '#0f172a' }}>Recorded Contributions ({contributions.length}) - Total: GHS {totalContribSum.toFixed(2)}</h4>
                {contributions.map((c, i) => (
                  <div key={i} style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '0.5rem', padding: '0.75rem 1rem', marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span><strong>{c.contributor}</strong> - {c.type} ({c.date}) - <strong style={{ color: '#16a34a' }}>GHS {parseFloat(c.amount || 0).toFixed(2)}</strong> <button type="button" onClick={() => printReceipt('Contribution', c)} style={{ marginLeft: '0.4rem', backgroundColor: '#ecfdf5', color: '#166534', border: '1px solid #86efac', padding: '0.2rem 0.5rem', borderRadius: '0.25rem', cursor: 'pointer', fontSize: '0.78rem' }}>Receipt</button></span>
                    {role === 'super_admin' && (
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button type="button" onClick={() => { setContribForm(c); setEditingContribIndex(i); }} style={{ backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', padding: '0.25rem 0.5rem', borderRadius: '0.25rem', cursor: 'pointer', fontSize: '0.8rem' }}>Edit</button>
                        <button type="button" onClick={() => setContributions(contributions.filter((_, idx) => idx !== i))} style={{ backgroundColor: '#fee2e2', color: '#991b1b', border: 'none', padding: '0.25rem 0.5rem', borderRadius: '0.25rem', cursor: 'pointer', fontSize: '0.8rem' }}>Delete</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {financeView === 'deptbudget' && can('access_finance') && (
              <div>
                <button type="button" onClick={() => setFinanceView('hub')} style={{ backgroundColor: '#e2e8f0', border: 'none', padding: '0.5rem 1rem', borderRadius: '0.375rem', fontWeight: 'bold', cursor: 'pointer', marginBottom: '1rem' }}>
                  ← Back to Finance Hub
                </button>
                <BudgetVsActual deptBudgets={deptBudgets} onChange={setDeptBudgets} expenses={expenses} theme={themeColor} canEdit={role === 'super_admin'} openPrint={openPrintWindow} />
              </div>
            )}

            {financeView === 'budgets' && role === 'super_admin' && (
              <div>
                <button type="button" onClick={() => setFinanceView('hub')} style={{ backgroundColor: '#e2e8f0', border: 'none', padding: '0.5rem 1rem', borderRadius: '0.375rem', fontWeight: 'bold', cursor: 'pointer', marginBottom: '1rem' }}>
                  ← Back to Finance Hub
                </button>
                <div style={{ backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '0.75rem', padding: '1.25rem', marginBottom: '1.25rem' }}>
                  <h3 style={{ margin: '0 0 1rem 0', color: '#0f172a' }}>Record Budget Item</h3>
                  <form onSubmit={(e) => { e.preventDefault(); setBudgets([budgetForm, ...budgets]); setBudgetForm({ item: '', estimated: '', status: 'Pending', date: todayStr() }); alert('Budget saved successfully!'); }} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#475569', marginBottom: '0.25rem' }}>Item / Project Name</label>
                      <input type="text" required value={budgetForm.item} onChange={(e) => setBudgetForm({...budgetForm, item: e.target.value})} style={{ width: '100%', padding: '0.6rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} placeholder="e.g. Sound System Upgrade" />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#475569', marginBottom: '0.25rem' }}>Budget Date</label>
                      <input type="date" required value={budgetForm.date || ''} onChange={(e) => setBudgetForm({...budgetForm, date: e.target.value})} style={{ width: '100%', padding: '0.6rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#475569', marginBottom: '0.25rem' }}>Estimated Cost (GHS)</label>
                      <input type="number" required step="0.01" value={budgetForm.estimated} onChange={(e) => setBudgetForm({...budgetForm, estimated: e.target.value})} style={{ width: '100%', padding: '0.6rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} placeholder="0.00" />
                    </div>
                    <button type="submit" style={{ backgroundColor: themeColor, color: '#ffffff', border: 'none', padding: '0.75rem', borderRadius: '0.375rem', fontWeight: 'bold', cursor: 'pointer', marginTop: '0.5rem' }}>
                      Submit Budget
                    </button>
                  </form>
                </div>
                <h4 style={{ color: '#0f172a' }}>Budgets List ({budgets.length})</h4>
                {budgets.map((b, i) => (
                  <div key={i} style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '0.5rem', padding: '0.75rem 1rem', marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span><strong>{b.item}</strong> (GHS {parseFloat(b.estimated || 0).toFixed(2)}){b.date ? <span style={{ color: '#64748b', fontSize: '0.8rem' }}> - {b.date}</span> : null}{b.approved_on ? <span style={{ color: '#16a34a', fontSize: '0.8rem' }}> - approved {b.approved_on}</span> : null}</span>
                    <span style={{ fontWeight: 'bold', color: b.status === 'Approved' ? '#16a34a' : '#d97706' }}>{b.status}</span>
                  </div>
                ))}
              </div>
            )}

            {financeView === 'approve_budgets' && role === 'super_admin' && (
              <div>
                <button type="button" onClick={() => setFinanceView('hub')} style={{ backgroundColor: '#e2e8f0', border: 'none', padding: '0.5rem 1rem', borderRadius: '0.375rem', fontWeight: 'bold', cursor: 'pointer', marginBottom: '1rem' }}>
                  ← Back to Finance Hub
                </button>
                <div style={{ backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '0.75rem', padding: '1.25rem', marginBottom: '1.25rem' }}>
                  <h3 style={{ margin: '0 0 0.5rem 0', color: '#0f172a' }}>Budget Approval Portal</h3>
                  <p style={{ fontSize: '0.85rem', color: '#64748b' }}>Review and approve submitted church budgets.</p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {budgets.length > 0 ? (
                    budgets.map((b, i) => (
                      <div key={i} style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '0.75rem', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontWeight: 'bold', fontSize: '1rem', color: '#0f172a' }}>{b.item}</div>
                          <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Amount: GHS {parseFloat(b.estimated || 0).toFixed(2)}{b.date ? ' - Date: ' + b.date : ''}{b.approved_on ? ' - Approved: ' + b.approved_on : ''}</div>
                        </div>
                        <div>
                          {b.status === 'Pending' ? (
                            <button 
                              type="button" 
                              onClick={() => {
                                setBudgets(budgets.map((x, idx) => (idx === i ? { ...x, status: 'Approved', approved_on: todayStr() } : x)));
                                alert(`Budget "${b.item}" approved successfully!`);
                              }} 
                              style={{ backgroundColor: '#10b981', color: '#ffffff', border: 'none', padding: '0.5rem 1rem', borderRadius: '0.375rem', fontWeight: 'bold', cursor: 'pointer' }}
                            >
                              Approve Budget
                            </button>
                          ) : (
                            <span style={{ backgroundColor: '#d1fae5', color: '#065f46', padding: '0.4rem 0.8rem', borderRadius: '0.375rem', fontWeight: 'bold', fontSize: '0.85rem' }}>
                              ✓ Approved
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '0.75rem', padding: '2rem', textAlign: 'center', color: '#64748b' }}>
                      <p style={{ margin: 0 }}>No budgets recorded yet.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {financeView === 'welfare' && can('access_finance') && (
              <div>
                <button type="button" onClick={() => { setFinanceView('hub'); setSelectedMemberForWelfare(null); }} style={{ backgroundColor: '#e2e8f0', border: 'none', padding: '0.5rem 1rem', borderRadius: '0.375rem', fontWeight: 'bold', cursor: 'pointer', marginBottom: '1rem' }}>
                  ← Back to Finance Hub
                </button>

                {!selectedMemberForWelfare ? (
                  <div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#0f172a', marginBottom: '1rem' }}>Welfare Contribution - Select Member</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                      {members.map((m, index) => {
                        const nameStr = displayName(m).trim() || m.email;
                        const initials = (`${m.first_name || ''} ${m.last_name || ''}`.trim() || m.email || '?').split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
                        return (
                          <div key={m.id || index} onClick={() => { const rec = welfareRecords[m.id || 'default'] || {}; const locked = {}; if (role !== 'super_admin') { Object.entries(rec).forEach(([mo, wks]) => wks.forEach((v, i) => { if (v) locked[mo + '-' + i] = true; })); } setWelfareLocked(locked); setSelectedMemberForWelfare(m); }} style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '0.75rem', padding: '1rem', textAlign: 'center', cursor: 'pointer' }}>
                            {m.photo_url ? (
                              <img src={m.photo_url} alt={nameStr} style={{ width: '3rem', height: '3rem', borderRadius: '50%', objectFit: 'cover', display: 'block', margin: '0 auto 0.5rem auto' }} />
                            ) : (
                              <div style={{ width: '3rem', height: '3rem', borderRadius: '50%', backgroundColor: '#cbd5e1', color: '#334155', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', margin: '0 auto 0.5rem auto' }}>
                                {initials}
                              </div>
                            )}
                            <div style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#0f172a' }}>{nameStr}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div style={{ backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '0.75rem', padding: '1.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        {selectedMemberForWelfare.photo_url ? <img src={selectedMemberForWelfare.photo_url} alt="Member" style={{ width: '2.4rem', height: '2.4rem', borderRadius: '50%', objectFit: 'cover' }} /> : null}
                        {displayName(selectedMemberForWelfare).trim() || selectedMemberForWelfare.email}
                      </h3>
                      <button type="button" onClick={() => setSelectedMemberForWelfare(null)} style={{ background: 'none', border: 'none', fontSize: '1rem', cursor: 'pointer', fontWeight: 'bold' }}>✕</button>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1rem' }}>Compulsory weekly welfare contributions with auto-calculated month and year grand total column:{role !== 'super_admin' ? ' Amounts already recorded are locked. Only the Super Admin can change them.' : ''}</p>
                    
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                        <thead>
                          <tr style={{ backgroundColor: '#4f46e5', color: '#ffffff' }}>
                            <th style={{ padding: '0.5rem', border: '1px solid #cbd5e1' }}>Months</th>
                            <th style={{ padding: '0.5rem', border: '1px solid #cbd5e1' }}>1st Wk</th>
                            <th style={{ padding: '0.5rem', border: '1px solid #cbd5e1' }}>2nd Wk</th>
                            <th style={{ padding: '0.5rem', border: '1px solid #cbd5e1' }}>3rd Wk</th>
                            <th style={{ padding: '0.5rem', border: '1px solid #cbd5e1' }}>4th Wk</th>
                            <th style={{ padding: '0.5rem', border: '1px solid #cbd5e1', backgroundColor: '#3730a3' }}>Year Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((month) => {
                            const memberRec = welfareRecords[selectedMemberForWelfare.id || 'default'] || {};
                            const weeks = memberRec[month] || [0,0,0,0];
                            const monthTotal = weeks.reduce((sum, w) => sum + w, 0);
                            return (
                              <tr key={month}>
                                <td style={{ padding: '0.5rem', border: '1px solid #cbd5e1', fontWeight: 'bold', backgroundColor: '#f1f5f9' }}>{month}</td>
                                {weeks.map((val, idx) => (
                                  <td key={idx} style={{ padding: '0.5rem', border: '1px solid #cbd5e1', textAlign: 'center' }}>
                                    <input 
                                      type="number" 
                                      step="0.01" 
                                      value={val === 0 ? '' : val} 
                                      disabled={!!welfareLocked[month + '-' + idx]} onChange={(e) => handleWelfareChange(selectedMemberForWelfare.id || 'default', month, idx, e.target.value)} 
                                      placeholder="0"
                                      style={{ width: '3rem', padding: '0.25rem', textAlign: 'center', border: '1px solid #cbd5e1', borderRadius: '0.25rem' }} 
                                    />
                                  </td>
                                ))}
                                <td style={{ padding: '0.5rem', border: '1px solid #cbd5e1', textAlign: 'center', fontWeight: 'bold', backgroundColor: '#eef2ff', color: themeColor }}>
                                  {monthTotal.toFixed(2)}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                        <tfoot>
                          <tr style={{ backgroundColor: themeColor, color: '#ffffff', fontWeight: 'bold' }}>
                            <td colSpan="5" style={{ padding: '0.75rem', textAlign: 'right', border: '1px solid #cbd5e1' }}>Annual Grand Total:</td>
                            <td style={{ padding: '0.75rem', textAlign: 'center', border: '1px solid #cbd5e1' }}>
                              {Object.values(welfareRecords[selectedMemberForWelfare.id || 'default'] || {}).reduce((gSum, weeks) => gSum + weeks.reduce((wSum, w) => wSum + w, 0), 0).toFixed(2)}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>

                    <button type="button" onClick={() => { alert('Welfare records saved successfully!'); setFinanceView('hub'); setSelectedMemberForWelfare(null); }} style={{ width: '100%', backgroundColor: '#4f46e5', color: '#ffffff', border: 'none', padding: '0.75rem', borderRadius: '0.5rem', fontWeight: 'bold', marginTop: '1.25rem', cursor: 'pointer' }}>
                      Save Welfare Records
                    </button>
                  </div>
                )}
              </div>
            )}

            {financeView === 'reports' && can('view_balance_sheet') && (
              <div style={{ backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '0.75rem', padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <button type="button" onClick={() => setFinanceView('hub')} style={{ backgroundColor: '#e2e8f0', border: 'none', padding: '0.5rem 1rem', borderRadius: '0.375rem', fontWeight: 'bold', cursor: 'pointer' }}>
                    ← Back to Hub
                  </button>
                  <button type="button" onClick={() => downloadPDFReport('Account Report')} style={{ backgroundColor: '#10b981', color: '#ffffff', border: 'none', padding: '0.5rem 1rem', borderRadius: '0.375rem', fontWeight: 'bold', cursor: 'pointer' }}>
                    📥 Download Official PDF Report
                  </button>
                </div>

                <div style={{ textAlign: 'center', marginBottom: '1.25rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                  <img src={logoSrc} alt="Church Logo" style={{ width: '60px', height: '60px', objectFit: 'contain' }} />
                  <div>
                    <h3 style={{ margin: '0 0 0.25rem 0', color: themeColor }}>{churchName.toUpperCase()}</h3>
                    <div style={{ fontSize: '0.85rem', color: '#64748b', fontStyle: 'italic' }}>{churchTagline}</div>
                    <h4 style={{ margin: '0.5rem 0 0 0', color: '#0f172a' }}>Account Report</h4>
                  </div>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #e2e8f0' }}>
                    <span>Opening Balance:</span>
                    <strong>GHS {openingBalance.toFixed(2)}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #e2e8f0' }}>
                    <span>Total General Incomes:</span>
                    <strong style={{ color: '#16a34a' }}>+ GHS {totalIncomeSum.toFixed(2)}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #e2e8f0' }}>
                    <span>Total Tithes:</span>
                    <strong style={{ color: '#16a34a' }}>+ GHS {totalTitheSum.toFixed(2)}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #e2e8f0' }}>
                    <span>Total Contributions:</span>
                    <strong style={{ color: '#16a34a' }}>+ GHS {totalContribSum.toFixed(2)}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #e2e8f0' }}>
                    <span>Total Welfare Contributions:</span>
                    <strong style={{ color: '#16a34a' }}>+ GHS {totalWelfareSum.toFixed(2)}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #e2e8f0' }}>
                    <span>Total Expenses:</span>
                    <strong style={{ color: '#dc2626' }}>- GHS {totalExpenseSum.toFixed(2)}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #e2e8f0' }}>
                    <span>Approved Budgets (Allocated):</span>
                    <strong style={{ color: '#dc2626' }}>- GHS {approvedBudgetsSum.toFixed(2)}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', fontSize: '1.1rem', backgroundColor: '#f8fafc', fontWeight: 'bold' }}>
                    <span>Net Balance:</span>
                    <span style={{ color: themeColor }}>GHS {netBalance.toFixed(2)}</span>
                  </div>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <h4 style={{ color: themeColor, borderBottom: '1px solid #cbd5e1', paddingBottom: '0.3rem' }}>Member Financial Contributions, Tithes & Welfare Tracking</h4>
                  
                  {tithes.length > 0 && (
                    <div style={{ marginTop: '0.75rem' }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#475569' }}>Member Tithes:</div>
                      {tithes.map((t, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', padding: '0.3rem 0', borderBottom: '1px dashed #e2e8f0' }}>
                          <span><strong>{t.member_name}</strong> (Paid on {t.date})</span>
                          <span style={{ color: '#16a34a', fontWeight: 'bold' }}>+GHS {parseFloat(t.amount || 0).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {contributions.length > 0 && (
                    <div style={{ marginTop: '0.75rem' }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#475569' }}>Member Contributions:</div>
                      {contributions.map((c, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', padding: '0.3rem 0', borderBottom: '1px dashed #e2e8f0' }}>
                          <span><strong>{c.contributor}</strong> ({c.type} - Paid on {c.date})</span>
                          <span style={{ color: '#16a34a', fontWeight: 'bold' }}>+GHS {parseFloat(c.amount || 0).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {incomes.length > 0 && (
                    <div style={{ marginTop: '0.75rem' }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#475569' }}>Member General Incomes:</div>
                      {incomes.map((inc, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', padding: '0.3rem 0', borderBottom: '1px dashed #e2e8f0' }}>
                          <span><strong>{inc.source}</strong> (Paid on {inc.date})</span>
                          <span style={{ color: '#16a34a', fontWeight: 'bold' }}>+GHS {parseFloat(inc.amount || 0).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {Object.keys(welfareRecords).length > 0 && (
                    <div style={{ marginTop: '0.75rem' }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#475569' }}>Member Welfare Tracking:</div>
                      {Object.entries(welfareRecords).map(([mId, monthsData], i) => {
                        const memObj = members.find(m => (m.id || 'default') === mId) || { first_name: 'Member', last_name: '' };
                        const memName = displayName(memObj).trim() || 'Member';
                        const memTotal = Object.values(monthsData).reduce((mSum, weeks) => mSum + weeks.reduce((wSum, w) => wSum + w, 0), 0);
                        const paidDate = welfareDates[mId] || new Date().toISOString().split('T')[0];
                        if (memTotal <= 0) return null;
                        return (
                          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', padding: '0.3rem 0', borderBottom: '1px dashed #e2e8f0' }}>
                            <span><strong>{memName}</strong> (Welfare - Updated: {paidDate})</span>
                            <span style={{ color: '#16a34a', fontWeight: 'bold' }}>+GHS {memTotal.toFixed(2)}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#475569', marginBottom: '0.375rem' }}>Super Admin Editable Notes / Audit Remarks</label>
                  <textarea 
                    readOnly={role !== 'super_admin'}
                    value={accountReportNotes} 
                    onChange={(e) => setAccountReportNotes(e.target.value)} 
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1', minHeight: '5rem', boxSizing: 'border-box' }} 
                  />
                  {role === 'super_admin' && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.6rem', flexWrap: 'wrap' }}>
                      <button type="button" onClick={saveNotesNow} style={{ backgroundColor: themeColor, color: '#ffffff', border: 'none', padding: '0.6rem 1.1rem', borderRadius: '0.5rem', fontWeight: 'bold', cursor: 'pointer' }}>💾 Save Remarks</button>
                      {notesMsg && <span style={{ fontSize: '0.85rem', color: notesMsg.startsWith('Could not') ? '#991b1b' : '#166534' }}>{notesMsg}</span>}
                    </div>
                  )}
                </div>
              </div>
            )}

            {financeView === 'balancesheet' && can('view_balance_sheet') && (
              <div style={{ backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '0.75rem', padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <button type="button" onClick={() => setFinanceView('hub')} style={{ backgroundColor: '#e2e8f0', border: 'none', padding: '0.5rem 1rem', borderRadius: '0.375rem', fontWeight: 'bold', cursor: 'pointer' }}>
                    ← Back to Hub
                  </button>
                  <button type="button" onClick={() => downloadPDFReport('Balance Sheet')} style={{ backgroundColor: '#10b981', color: '#ffffff', border: '1px solid #cbd5e1', padding: '0.5rem 1rem', borderRadius: '0.375rem', fontWeight: 'bold', cursor: 'pointer' }}>
                    📥 Download Official PDF Report
                  </button>
                </div>

                <div style={{ textAlign: 'center', marginBottom: '1.25rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                  <img src={logoSrc} alt="Church Logo" style={{ width: '60px', height: '60px', objectFit: 'contain' }} />
                  <div>
                    <h3 style={{ margin: '0 0 0.25rem 0', color: themeColor }}>{churchName.toUpperCase()}</h3>
                    <div style={{ fontSize: '0.85rem', color: '#64748b', fontStyle: 'italic' }}>{churchTagline}</div>
                    <h4 style={{ margin: '0.5rem 0 0 0', color: '#0f172a' }}>Balance Sheet</h4>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
                  <div style={{ backgroundColor: '#f1f5f9', padding: '0.5rem', fontWeight: 'bold', color: themeColor }}>ASSETS</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #e2e8f0' }}>
                    <span>Cash & Bank (Net Fund Balance):</span>
                    <strong>GHS {netBalance.toFixed(2)}</strong>
                  </div>
                  <div style={{ backgroundColor: '#f1f5f9', padding: '0.5rem', fontWeight: 'bold', color: themeColor, marginTop: '0.5rem' }}>LIABILITIES & EQUITY</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #e2e8f0' }}>
                    <span>Total Liabilities:</span>
                    <strong>GHS 0.00</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', fontSize: '1.1rem', backgroundColor: '#f8fafc', fontWeight: 'bold' }}>
                    <span>Total Equity / Fund:</span>
                    <span style={{ color: themeColor }}>GHS {netBalance.toFixed(2)}</span>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#475569', marginBottom: '0.375rem' }}>Super Admin Editable Balance Sheet Remarks</label>
                  <textarea 
                    readOnly={role !== 'super_admin'}
                    value={balanceSheetNotes} 
                    onChange={(e) => setBalanceSheetNotes(e.target.value)} 
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1', minHeight: '5rem', boxSizing: 'border-box' }} 
                  />
                  {role === 'super_admin' && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.6rem', flexWrap: 'wrap' }}>
                      <button type="button" onClick={saveNotesNow} style={{ backgroundColor: themeColor, color: '#ffffff', border: 'none', padding: '0.6rem 1.1rem', borderRadius: '0.5rem', fontWeight: 'bold', cursor: 'pointer' }}>💾 Save Remarks</button>
                      {notesMsg && <span style={{ fontSize: '0.85rem', color: notesMsg.startsWith('Could not') ? '#991b1b' : '#166534' }}>{notesMsg}</span>}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Updated Attendance Tab with Service Type & Men/Women/Children Breakdown */}
        {activeTab === 'attendance' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#0f172a', margin: 0 }}>Service Attendance & Demographics</h3>
              <button type="button" onClick={() => setShowAttendanceForm(!showAttendanceForm)} style={{ backgroundColor: '#10b981', color: '#ffffff', border: 'none', padding: '0.65rem 1rem', borderRadius: '0.5rem', fontWeight: 'bold', fontSize: '0.9rem', cursor: 'pointer' }}>
                {showAttendanceForm ? 'Cancel' : '+ Log Attendance'}
              </button>
            </div>

            {showAttendanceForm && (
              <form onSubmit={(e) => { 
                e.preventDefault(); 
                setAttendanceLogs([attendanceForm, ...attendanceLogs]); 
                setAttendanceForm({ service_date: '', service_type: 'Sunday Service', department: 'General', men_count: '', women_count: '', children_count: '', status: 'Present' }); 
                setShowAttendanceForm(false); 
              }} style={{ backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '0.75rem', padding: '1.25rem', marginBottom: '1.25rem' }}>
                <h4 style={{ margin: '0 0 1rem 0', color: '#0f172a' }}>Log Service Attendance</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#475569', marginBottom: '0.25rem' }}>Service Date *</label>
                    <input type="date" required value={attendanceForm.service_date} onChange={(e) => setAttendanceForm({...attendanceForm, service_date: e.target.value})} style={{ width: '100%', padding: '0.6rem', border: '1px solid #cbd5e1', borderRadius: '0.375rem', boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#475569', marginBottom: '0.25rem' }}>Service Type *</label>
                    <select value={attendanceForm.service_type} onChange={(e) => setAttendanceForm({...attendanceForm, service_type: e.target.value})} style={{ width: '100%', padding: '0.6rem', border: '1px solid #cbd5e1', borderRadius: '0.375rem', backgroundColor: '#ffffff', boxSizing: 'border-box' }}>
                      <option value="Sunday Service">Sunday Service</option>
                      <option value="Midweek Service">Midweek Service</option>
                      <option value="Prayer Meeting">Prayer Meeting</option>
                      <option value="All Night Service">All Night Service</option>
                      <option value="Special Revival">Special Revival</option>
                    </select>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', color: '#475569', marginBottom: '0.2rem' }}>Men Count</label>
                      <input type="number" min="0" value={attendanceForm.men_count} onChange={(e) => setAttendanceForm({...attendanceForm, men_count: e.target.value})} placeholder="0" style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '0.375rem', boxSizing: 'border-box' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', color: '#475569', marginBottom: '0.2rem' }}>Women Count</label>
                      <input type="number" min="0" value={attendanceForm.women_count} onChange={(e) => setAttendanceForm({...attendanceForm, women_count: e.target.value})} placeholder="0" style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '0.375rem', boxSizing: 'border-box' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', color: '#475569', marginBottom: '0.2rem' }}>Children Count</label>
                      <input type="number" min="0" value={attendanceForm.children_count} onChange={(e) => setAttendanceForm({...attendanceForm, children_count: e.target.value})} placeholder="0" style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '0.375rem', boxSizing: 'border-box' }} />
                    </div>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#475569', marginBottom: '0.25rem' }}>Department</label>
                    <select value={attendanceForm.department} onChange={(e) => setAttendanceForm({...attendanceForm, department: e.target.value})} style={{ width: '100%', padding: '0.6rem', border: '1px solid #cbd5e1', borderRadius: '0.375rem', backgroundColor: '#ffffff', boxSizing: 'border-box' }}>
                      <option value="General">General</option>
                      <option value="LOVE">LOVE</option>
                      <option value="UNITY">UNITY</option>
                      <option value="CARE">CARE</option>
                      <option value="RESPECT">RESPECT</option>
                    </select>
                  </div>
                  <button type="submit" style={{ backgroundColor: themeColor, color: '#ffffff', border: 'none', padding: '0.65rem', borderRadius: '0.375rem', fontWeight: 'bold', cursor: 'pointer', marginTop: '0.5rem' }}>
                    Save Attendance Log
                  </button>
                </div>
              </form>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {attendanceLogs.length > 0 ? (
                attendanceLogs.map((log, i) => {
                  const men = parseInt(log.men_count || 0);
                  const women = parseInt(log.women_count || 0);
                  const children = parseInt(log.children_count || 0);
                  const total = men + women + children;
                  return (
                    <div key={i} style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '0.75rem', padding: '1rem 1.25rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontWeight: 'bold', color: themeColor }}>
                        <span>{log.service_type} ({log.service_date})</span>
                        <span style={{ backgroundColor: '#eff6ff', color: '#2563eb', padding: '0.2rem 0.6rem', borderRadius: '0.25rem', fontSize: '0.85rem' }}>Total Attendance: {total > 0 ? total : 'N/A'}</span>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', fontSize: '0.85rem', color: '#475569', backgroundColor: '#f8fafc', padding: '0.5rem', borderRadius: '0.375rem' }}>
                        <span>👨 Men: <strong>{men}</strong></span>
                        <span>👩 Women: <strong>{women}</strong></span>
                        <span>👶 Children: <strong>{children}</strong></span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '0.75rem', padding: '2rem', textAlign: 'center', color: '#64748b' }}>
                  <p style={{ margin: 0 }}>No attendance logs recorded yet.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* QR Check-in Tab */}
        {activeTab === 'checkin' && can('record_attendance') && (
          <CheckinTab
            members={members}
            serviceOptions={Array.from(new Set(['Sunday Service', 'Midweek Service', 'Prayer Meeting', 'Special Service', ...(settings.services || []).map(sv => sv.activity).filter(Boolean)]))}
            date={checkinDate}
            setDate={setCheckinDate}
            service={checkinService}
            setService={setCheckinService}
            checkins={checkins}
            onCheckin={checkInMember}
            onDelete={deleteCheckin}
            canDelete={role === 'super_admin'}
            theme={themeColor}
            message={checkinMsg}
          />
        )}

        {/* House Fellowship */}
        {activeTab === 'fellowships' && can('manage_fellowships') && (
          <FellowshipsTab items={fellowshipsList} onChange={setFellowshipsList} members={members} theme={themeColor} canDelete={role === 'super_admin'} />
        )}

        {/* Branches */}
        {activeTab === 'branches' && can('manage_fellowships') && (
          <RecordTab
            title="Church Branches"
            addLabel="+ Add Branch"
            titleKey="name"
            emptyText="No branches added yet."
            canDelete={role === 'super_admin'}
            theme={themeColor}
            items={branchesList}
            onAdd={(item) => setBranchesList([item, ...branchesList])}
            onDelete={(i) => setBranchesList(branchesList.filter((_, idx) => idx !== i))}
            fields={[
              { key: 'name', label: 'Branch name', required: true },
              { key: 'pastor', label: 'Resident pastor / overseer' },
              { key: 'phone', label: 'Phone number', type: 'tel' },
              { key: 'location', label: 'Town / location' },
              { key: 'address', label: 'Address' },
              { key: 'established', label: 'Date established', type: 'date' },
              { key: 'notes', label: 'Notes', type: 'textarea' }
            ]}
          />
        )}

        {/* Follow-up */}
        {activeTab === 'followup' && (can('record_visitors') || can('record_new_converts')) && (
          <FollowUpTab
            visitors={can('record_visitors') ? visitorsList : null}
            converts={can('record_new_converts') ? convertsList : null}
            setVisitors={setVisitorsList}
            setConverts={setConvertsList}
            theme={themeColor}
          />
        )}

        {/* Pledges */}
        {activeTab === 'pledges' && can('access_finance') && (
          <PledgesTab items={pledgesList} onChange={setPledgesList} members={members} theme={themeColor} isSuper={role === 'super_admin'} onReceipt={printReceipt} />
        )}

        {/* Activity Log */}
        {activeTab === 'activity' && role === 'super_admin' && (
          <ActivityTab theme={themeColor} />
        )}

        {/* Leaders Tab */}
        {activeTab === 'leaders' && can('manage_leaders') && (
          <LeadersTab
            items={leadersList}
            members={members}
            canDelete={role === 'super_admin'}
            theme={themeColor}
            onAdd={(item) => setLeadersList([item, ...leadersList])}
            onDelete={(i) => setLeadersList(leadersList.filter((_, idx) => idx !== i))}
          />
        )}

        {/* Duty Rotas Tab */}
        {activeTab === 'rotas' && can('manage_rotas') && (
          <RecordTab
            title="Duty Rotas"
            addLabel="+ Add Duty"
            titleKey="rota_name"
            emptyText="No duties scheduled yet."
            canDelete={role === 'super_admin'}
            theme={themeColor}
            items={rotasList}
            onAdd={(item) => setRotasList([item, ...rotasList])}
            onDelete={(i) => setRotasList(rotasList.filter((_, idx) => idx !== i))}
            fields={[
              { key: 'rota_name', label: 'Duty (e.g. Ushering, Choir, Cleaning)', required: true },
              { key: 'rota_date', label: 'Date', type: 'date', required: true },
              { key: 'service', label: 'Service / Meeting' },
              { key: 'assigned', label: 'Assigned people (names)', type: 'textarea', required: true },
              { key: 'notes', label: 'Notes', type: 'textarea' }
            ]}
          />
        )}

        {/* Videos Tab */}
        {activeTab === 'videos' && can('manage_videos') && (
          <RecordTab
            title="Sermons & Videos"
            addLabel="+ Add Video"
            titleKey="title"
            emptyText="No videos added yet."
            canDelete={role === 'super_admin'}
            theme={themeColor}
            items={videosList}
            onAdd={(item) => setVideosList([item, ...videosList])}
            onDelete={(i) => setVideosList(videosList.filter((_, idx) => idx !== i))}
            fields={[
              { key: 'title', label: 'Title', required: true },
              { key: 'video_url', label: 'Video link (YouTube, Facebook...)', type: 'url', required: true },
              { key: 'video_date', label: 'Date', type: 'date' },
              { key: 'speaker', label: 'Speaker / Minister' },
              { key: 'series', label: 'Series (e.g. Faith Series) - optional' },
              { key: 'topic', label: 'Topic / key scripture - optional' },
              { key: 'notes', label: 'Summary / key points (members see this)', type: 'textarea' },
              { key: 'description', label: 'Description', type: 'textarea' }
            ]}
          />
        )}

        {/* Reports Tab */}
        {activeTab === 'reports' && can('view_reports') && (
          <ReportsTab
            members={members}
            fin={(can('access_finance') || can('view_balance_sheet')) ? { tithes, contributions, incomes, expenses } : null}
            attendance={can('record_attendance') ? attendanceLogs : null}
            assets={can('manage_facilities') ? assetsList : null}
            visitors={can('record_visitors') ? visitorsList : null}
            converts={can('record_new_converts') ? convertsList : null}
            services={can('register_services') ? servicesList : null}
            fellowships={can('manage_fellowships') ? fellowshipsList : null}
            branches={can('manage_fellowships') ? branchesList : null}
            pledges={can('access_finance') ? pledgesList : null}
            onBackupExcel={role === 'super_admin' ? downloadBackupExcel : null}
            onBackupJson={role === 'super_admin' ? downloadBackupJson : null}
            events={can('register_events') ? eventsList : null}
            theme={themeColor}
            openPrint={openPrintWindow}
            churchName={churchName}
          />
        )}

        {/* Messages Tab */}
        {activeTab === 'messages' && can('send_messages') && (
          <MessagesTab members={members} theme={themeColor} churchName={churchName} />
        )}

        {/* Settings Tab (Super Admin only) */}
        {activeTab === 'settings' && role === 'super_admin' && (
          <SettingsPanel settings={settings} onSave={saveSettings} onUploadLogo={uploadLogo} message={settingsMsg} theme={themeColor} />
        )}

        {/* Facilities Tab */}
        {activeTab === 'facilities' && can('manage_facilities') && (
          <AssetsTab
            items={assetsList}
            isSuper={role === 'super_admin'}
            theme={themeColor}
            onPrint={printAssetRegister}
            onAdd={(item) => setAssetsList([item, ...assetsList])}
            onUpdate={(i, item) => setAssetsList(assetsList.map((x, idx) => (idx === i ? item : x)))}
            onDelete={(i) => setAssetsList(assetsList.filter((_, idx) => idx !== i))}
          />
        )}

        {/* Services Tab */}
        {activeTab === 'services' && can('register_services') && (
          <RecordTab
            title="Church Services"
            addLabel="+ Register Service"
            titleKey="service_name"
            emptyText="No services registered yet."
            canDelete={role === 'super_admin'}
            theme={themeColor}
            items={servicesList}
            onAdd={(item) => setServicesList([item, ...servicesList])}
            onDelete={(i) => setServicesList(servicesList.filter((_, idx) => idx !== i))}
            fields={[
              { key: 'service_name', label: 'Service name', required: true },
              { key: 'service_date', label: 'Date', type: 'date', required: true },
              { key: 'service_type', label: 'Type', options: ['Sunday Service', 'Midweek Service', 'Prayer Meeting', 'Special Service', 'Other'] },
              { key: 'preacher', label: 'Preacher / Minister' },
              { key: 'theme', label: 'Theme / Topic' },
              { key: 'notes', label: 'Notes', type: 'textarea' }
            ]}
          />
        )}

        {/* Visitors Tab */}
        {activeTab === 'visitors' && can('record_visitors') && (
          <RecordTab
            title="Visitors"
            addLabel="+ Record Visitor"
            titleKey="visitor_name"
            emptyText="No visitors recorded yet."
            canDelete={role === 'super_admin'}
            theme={themeColor}
            items={visitorsList}
            onAdd={(item) => setVisitorsList([item, ...visitorsList])}
            onDelete={(i) => setVisitorsList(visitorsList.filter((_, idx) => idx !== i))}
            fields={[
              { key: 'visitor_name', label: 'Visitor name', required: true },
              { key: 'phone', label: 'Phone number', type: 'tel' },
              { key: 'date_visited', label: 'Date visited', type: 'date', required: true },
              { key: 'invited_by', label: 'Invited by' },
              { key: 'address', label: 'Address / Area' },
              { key: 'notes', label: 'Notes', type: 'textarea' }
            ]}
          />
        )}

        {/* New Converts Tab */}
        {activeTab === 'new_converts' && can('record_new_converts') && (
          <RecordTab
            title="New Converts"
            addLabel="+ Record New Convert"
            titleKey="convert_name"
            emptyText="No new converts recorded yet."
            canDelete={role === 'super_admin'}
            theme={themeColor}
            items={convertsList}
            onAdd={(item) => setConvertsList([item, ...convertsList])}
            onDelete={(i) => setConvertsList(convertsList.filter((_, idx) => idx !== i))}
            fields={[
              { key: 'convert_name', label: 'Full name', required: true },
              { key: 'phone', label: 'Phone number', type: 'tel' },
              { key: 'date_of_conversion', label: 'Date of conversion', type: 'date', required: true },
              { key: 'follow_up', label: 'Follow-up status', options: ['New', 'Contacted', 'In discipleship', 'Joined as member'] },
              { key: 'address', label: 'Address / Area' },
              { key: 'notes', label: 'Notes', type: 'textarea' }
            ]}
          />
        )}

        {/* Events Tab */}
        {activeTab === 'events' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#0f172a', margin: 0 }}>Church Events</h3>
              <button type="button" onClick={() => setShowEventForm(!showEventForm)} style={{ backgroundColor: '#10b981', color: '#ffffff', border: 'none', padding: '0.65rem 1rem', borderRadius: '0.5rem', fontWeight: 'bold', fontSize: '0.9rem', cursor: 'pointer' }}>
                {showEventForm ? 'Cancel' : '+ Add Event'}
              </button>
            </div>

            {showEventForm && (
              <form onSubmit={(e) => { e.preventDefault(); setEventsList([eventForm, ...eventsList]); setEventForm({ title: '', date: '', description: '' }); setShowEventForm(false); }} style={{ backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '0.75rem', padding: '1.25rem', marginBottom: '1.25rem' }}>
                <h4 style={{ margin: '0 0 1rem 0', color: '#0f172a' }}>Create New Event</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#475569', marginBottom: '0.25rem' }}>Event Title</label>
                    <input type="text" required value={eventForm.title} onChange={(e) => setEventForm({...eventForm, title: e.target.value})} style={{ width: '100%', padding: '0.6rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} placeholder="Event title" />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#475569', marginBottom: '0.25rem' }}>Event Date</label>
                    <input type="date" required value={eventForm.date} onChange={(e) => setEventForm({...eventForm, date: e.target.value})} style={{ width: '100%', padding: '0.6rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#475569', marginBottom: '0.25rem' }}>Description</label>
                    <textarea value={eventForm.description} onChange={(e) => setEventForm({...eventForm, description: e.target.value})} style={{ width: '100%', padding: '0.6rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1', boxSizing: 'border-box', height: '4rem' }} placeholder="Event details..." />
                  </div>
                  <button type="submit" style={{ backgroundColor: themeColor, color: '#ffffff', border: 'none', padding: '0.65rem', borderRadius: '0.375rem', fontWeight: 'bold', cursor: 'pointer', marginTop: '0.5rem' }}>
                    Publish Event
                  </button>
                </div>
              </form>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {eventsList.length > 0 ? (
                eventsList.map((ev, i) => (
                  <div key={i} style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '0.75rem', padding: '1.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <h4 style={{ margin: 0, color: themeColor, fontSize: '1rem' }}>{ev.title}</h4>
                      <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '600' }}>{ev.date}</span>
                    </div>
                    <p style={{ margin: 0, fontSize: '0.9rem', color: '#334155' }}>{ev.description}</p>
                    {role === 'super_admin' && (
                      <button type="button" onClick={() => { if (window.confirm('Delete this event?')) setEventsList(eventsList.filter((_, idx) => idx !== i)); }} style={{ marginTop: '0.6rem', backgroundColor: '#fee2e2', color: '#991b1b', border: 'none', padding: '0.25rem 0.6rem', borderRadius: '0.25rem', cursor: 'pointer', fontSize: '0.8rem' }}>Delete</button>
                    )}
                  </div>
                ))
              ) : (
                <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '0.75rem', padding: '2rem', textAlign: 'center', color: '#64748b' }}>
                  <p style={{ margin: 0 }}>No upcoming events scheduled yet.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Announcements Tab */}
        {activeTab === 'announcements' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#0f172a', margin: 0 }}>Church Announcements</h3>
              <button type="button" onClick={() => setShowAnnounceForm(!showAnnounceForm)} style={{ backgroundColor: '#10b981', color: '#ffffff', border: 'none', padding: '0.65rem 1rem', borderRadius: '0.5rem', fontWeight: 'bold', fontSize: '0.9rem', cursor: 'pointer' }}>
                {showAnnounceForm ? 'Cancel' : '+ Post Announcement'}
              </button>
            </div>

            {showAnnounceForm && (
              <form onSubmit={(e) => { e.preventDefault(); setAnnouncementsList([{ ...announceForm, posted: new Date().toISOString().slice(0, 10) }, ...announcementsList]); setAnnounceForm({ title: '', message: '' }); setShowAnnounceForm(false); }} style={{ backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '0.75rem', padding: '1.25rem', marginBottom: '1.25rem' }}>
                <h4 style={{ margin: '0 0 1rem 0', color: '#0f172a' }}>New Announcement</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#475569', marginBottom: '0.25rem' }}>Title</label>
                    <input type="text" required value={announceForm.title} onChange={(e) => setAnnounceForm({...announceForm, title: e.target.value})} style={{ width: '100%', padding: '0.6rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} placeholder="Announcement title" />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#475569', marginBottom: '0.25rem' }}>Message</label>
                    <textarea required value={announceForm.message} onChange={(e) => setAnnounceForm({...announceForm, message: e.target.value})} style={{ width: '100%', padding: '0.6rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1', boxSizing: 'border-box', height: '4rem' }} placeholder="Broadcast message..." />
                  </div>
                  <button type="submit" style={{ backgroundColor: themeColor, color: '#ffffff', border: 'none', padding: '0.65rem', borderRadius: '0.375rem', fontWeight: 'bold', cursor: 'pointer', marginTop: '0.5rem' }}>
                    Broadcast Announcement
                  </button>
                </div>
              </form>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {announcementsList.length > 0 ? (
                announcementsList.map((ann, i) => (
                  <div key={i} style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '0.75rem', padding: '1.25rem' }}>
                    <h4 style={{ margin: '0 0 0.5rem 0', color: themeColor, fontSize: '1rem' }}>{ann.title}{ann.posted ? <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 'normal' }}>  ({ann.posted})</span> : null}</h4>
                    <p style={{ margin: 0, fontSize: '0.9rem', color: '#334155' }}>{ann.message}</p>
                    {role === 'super_admin' && (
                      <button type="button" onClick={() => { if (window.confirm('Delete this announcement?')) setAnnouncementsList(announcementsList.filter((_, idx) => idx !== i)); }} style={{ marginTop: '0.6rem', backgroundColor: '#fee2e2', color: '#991b1b', border: 'none', padding: '0.25rem 0.6rem', borderRadius: '0.25rem', cursor: 'pointer', fontSize: '0.8rem' }}>Delete</button>
                    )}
                  </div>
                ))
              ) : (
                <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '0.75rem', padding: '2rem', textAlign: 'center', color: '#64748b' }}>
                  <p style={{ margin: 0 }}>No announcements broadcasted yet.</p>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </main>
  );
}
