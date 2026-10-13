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
  finance: ['incomes', 'expenses', 'tithes', 'budgets', 'contributions', 'welfareRecords', 'welfareDates', 'openingBalance', 'accountReportNotes', 'balanceSheetNotes'],
  attendance: ['attendanceLogs'],
  events: ['eventsList'],
  announcements: ['announcementsList'],
  services: ['servicesList'],
  visitors: ['visitorsList'],
  converts: ['convertsList'],
  assets: ['assetsList'],
  leaders: ['leadersList'],
  rotas: ['rotasList'],
  videos: ['videosList']
};
const SECTION_WRITE_PERM = {
  finance: 'access_finance', attendance: 'record_attendance', events: 'register_events',
  announcements: 'post_announcements', services: 'register_services', visitors: 'record_visitors',
  converts: 'record_new_converts', assets: 'manage_facilities',
  leaders: 'manage_leaders', rotas: 'manage_rotas', videos: 'manage_videos'
};
const FIELD_DEFAULTS = {
  incomes: [], expenses: [], tithes: [], budgets: [], contributions: [],
  welfareRecords: {}, welfareDates: {}, openingBalance: 2484.32,
  accountReportNotes: DEFAULT_ACCOUNT_NOTES, balanceSheetNotes: DEFAULT_BALANCE_NOTES,
  attendanceLogs: [], eventsList: [], announcementsList: [], servicesList: [],
  visitorsList: [], convertsList: [], assetsList: [], leadersList: [], rotasList: [], videosList: []
};

const pickSection = (vals, key) => {
  const o = {};
  SECTION_DEFS[key].forEach(f => { o[f] = vals[f] === undefined ? FIELD_DEFAULTS[f] : vals[f]; });
  return o;
};
const canWriteSectionFn = (key, isSuper, perms) => !!isSuper || !!(perms && perms[SECTION_WRITE_PERM[key]]);
const canReadSectionFn = (key, isSuper, perms) =>
  !!isSuper || ['events', 'announcements', 'leaders', 'rotas', 'videos'].includes(key) ||
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

function ReportsTab({ members, fin, attendance, assets, visitors, converts, services, events, theme, openPrint, churchName }) {
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
  return (
    <div>
      <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#0f172a', margin: '0 0 0.5rem 0' }}>Messages</h3>
      <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: 0 }}>Write one message, pick who gets it, then send it with your phone's SMS, email or WhatsApp. (The church's phone credit or data is used. For bulk SMS from the app itself, a paid SMS service would be needed.)</p>

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
  const [activeTab, setActiveTab] = useState('members');
  const [financeView, setFinanceView] = useState('hub');
  
  const [members, setMembers] = useState([]);
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
  const [rotasList, setRotasList] = useState([]);
  const [videosList, setVideosList] = useState([]);
  const [servicesList, setServicesList] = useState([]);
  const [visitorsList, setVisitorsList] = useState([]);
  const [convertsList, setConvertsList] = useState([]);
  const [board, setBoard] = useState({ events: [], announcements: [], leaders: [], rotas: [], videos: [] });
  const baseRef = useRef({});

  // Financial Data State with Edit/Delete restricted to Super Admin
  const [incomes, setIncomes] = useState([]);
  const [incomeForm, setIncomeForm] = useState({ source: '', amount: '', date: '', member_id: '', member_name: '' });
  const [editingIncomeIndex, setEditingIncomeIndex] = useState(null);

  const [expenses, setExpenses] = useState([]);
  const [expenseForm, setExpenseForm] = useState({ description: '', amount: '', date: '' });
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
      { key: 'manage_leaders', label: 'Manage church leaders directory' }
    ],
    'Reports & Communication': [
      { key: 'view_reports', label: 'View reports' },
      { key: 'send_messages', label: 'Send messages to members' }
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
      { key: 'view_balance_sheet', label: 'View Account Report & Balance Sheet (read-only)' }
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
        const { data: memberData } = await supabase
          .from('members')
          .select('*')
          .eq('email', session.user.email)
          .single();

        if (memberData) {
          if (memberData.role) setRole(memberData.role);
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
    leadersList: setLeadersList, rotasList: setRotasList, videosList: setVideosList
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
    const { data, error } = await supabase
      .from('member_finance')
      .select('data')
      .eq('member_email', String(email || '').trim().toLowerCase())
      .maybeSingle();
    if (error) setSaveError('Could not load your records: ' + error.message);
    setMemberFinance((data && data.data) || { tithes: [], contributions: [], incomes: [], welfare: {} });
    const { data: rows } = await supabase.from('app_data').select('key, data').in('key', ['events', 'announcements', 'leaders', 'rotas', 'videos']);
    const get = (k, f) => { const r = (rows || []).find(x => x.key === k); return (r && r.data && r.data[f]) || []; };
    setBoard({ events: get('events', 'eventsList'), announcements: get('announcements', 'announcementsList'), leaders: get('leaders', 'leadersList'), rotas: get('rotas', 'rotasList'), videos: get('videos', 'videosList') });
  }

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
    setPayMsg('Opening the secure Flutterwave checkout...');
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

  // When Flutterwave sends the member back to the app, confirm the payment and refresh their records
  useEffect(() => {
    if (!user || typeof window === 'undefined') return;
    const p = new URLSearchParams(window.location.search);
    const txRef = p.get('tx_ref'), txId = p.get('transaction_id'), st = p.get('status');
    if (!txRef || !String(txRef).startsWith('GPC-')) return;
    window.history.replaceState({}, '', window.location.pathname);
    const tell = (m) => { setPayMsg(m); setMemberPage('giving'); try { alert(m); } catch (e) {} };
    if (st === 'cancelled' || !txId) { tell('The payment was not completed. Nothing was charged.'); return; }
    setPayMsg('Confirming your payment...');
    (async () => {
      try {
        const res = await fetch('/api/pay?transaction_id=' + encodeURIComponent(txId) + '&tx_ref=' + encodeURIComponent(txRef));
        const out = await res.json().catch(() => ({}));
        if (res.ok && out.ok) { tell('Payment of GHS ' + Number(out.amount).toFixed(2) + ' (' + out.type + ') received. Thank you and God bless you!'); await loadMemberData(user.email); }
        else tell(out.error || out.message || 'We could not confirm the payment yet. If money left your account, please tell the church admin.');
      } catch (e) { tell('Could not confirm the payment: ' + e.message); }
    })();
  }, [user]);

  const saveNotesNow = async () => {
    setNotesMsg('Saving...');
    const err = await saveSection('finance', { incomes, expenses, tithes, budgets, contributions, welfareRecords, welfareDates, openingBalance, accountReportNotes, balanceSheetNotes });
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
      servicesList, visitorsList, convertsList, assetsList, leadersList, rotasList, videosList
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
  }, [financeLoaded, user, role, myPermissions, members, incomes, expenses, tithes, budgets, contributions, welfareRecords, welfareDates, openingBalance, accountReportNotes, balanceSheetNotes, attendanceLogs, eventsList, announcementsList, servicesList, visitorsList, convertsList, assetsList, leadersList, rotasList, videosList]);

  // Pick up other admins' latest entries when a records screen is opened
  useEffect(() => {
    if (['contributions', 'attendance', 'events', 'announcements', 'services', 'visitors', 'new_converts', 'facilities', 'leaders', 'rotas', 'reports', 'messages', 'videos'].includes(activeTab) && financeLoaded && role !== 'member' && !pendingSaveRef.current) {
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
    setPermMessage(error ? 'Could not save permissions: ' + error.message : 'Permissions saved. They apply the next time that admin opens the app.');
  };

  const changeAccountRole = async (newRole) => {
    setPermMessage('');
    const email = String(selectedAdminEmail || '').trim().toLowerCase();
    const target = members.find(m => String(m.email || '').toLowerCase() === email);
    if (!target || target.role === 'super_admin') return;
    const { error } = await supabase.from('members').update({ role: newRole }).eq('id', target.id);
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
    </style></head><body>
      <div class="head"><img src="${logo}" alt="Logo" /><div><h2>${esc(churchName)}</h2><div class="sub">${esc(churchTagline)}</div><div class="sub"><strong>${esc(title.toUpperCase())}</strong> - ${new Date().toLocaleDateString()}</div></div></div>
      ${bodyHtml}
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
    </style></head><body>
      <div class="head"><img id="lg" src="${logo}" alt="Logo" /><div><h2>${esc(churchName)}</h2><div class="sub">${esc(churchTagline)}</div><div class="sub"><strong>FACILITIES &amp; ASSET REGISTER</strong> - ${new Date().toLocaleDateString()}</div></div></div>
      <table><thead><tr><th>Tag</th><th>Item</th><th>Category</th><th>Qty</th><th>Condition</th><th>Location</th><th>Out on loan</th><th>Total value (GHS)</th></tr></thead><tbody>${rows || '<tr><td colspan="8">No items</td></tr>'}</tbody></table>
      <div class="tot">Estimated total value: GHS ${totalValue.toFixed(2)}</div>
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

  async function fetchMembers() {
    const { data: allMembers } = await supabase
      .from('members')
      .select('*');

    if (allMembers) {
      setMembers(allMembers);
    }
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
      reader.onloadend = () => {
        setFormData({ ...formData, photo_url: reader.result });
      };
      reader.readAsDataURL(file);
    }
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
      const { error } = await supabase.from('members').delete().eq('id', id);
      if (error) {
        alert('Error deleting member: ' + error.message);
      } else {
        fetchMembers();
      }
    }
  };

  const handleStartEditMember = (m) => {
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
      photo_url: m.photo_url || '',
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
          </style>
        </head>
        <body>
          <div class="header">
            <img src="${logoSrc.startsWith('http') ? logoSrc : window.location.origin + logoSrc}" alt="Church Logo" class="logo" />
            <div class="header-text">
              <h2 class="church-name">${churchName.toUpperCase()}</h2>
              <div class="subtitle">${churchTagline}</div>
              <span class="report-title-badge">${title}</span>
            </div>
            <div class="meta-date">
              <strong>Date:</strong> ${new Date().toLocaleDateString()}
            </div>
          </div>
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
    return fullName.includes(query) || email.includes(query);
  });

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
    const currentMemberRecord = members.find(m => String(m.email || '').toLowerCase() === String(user.email || '').toLowerCase()) || {};
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
            ['EVENTS & MINISTRY', [['ministry', '⛪ Events, Duty Roster & Leaders']]],
            ['SPIRITUAL CORNER', [['spiritual', '🎬 Sermons & Videos']]]
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
            const first = String(currentMemberRecord.first_name || '').trim().toLowerCase();
            const today = todayStr();
            const upcoming = [...R].filter(r => !r.rota_date || r.rota_date >= today).sort((a, b) => String(a.rota_date || '').localeCompare(String(b.rota_date || ''))).slice(0, 8);
            const card = { backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '0.75rem', padding: '1.25rem 1.5rem', marginBottom: '1rem' };
            const h3s = { fontSize: '1.1rem', fontWeight: 'bold', color: themeColor, margin: '0 0 0.75rem 0' };
            return (
              <div>
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
                {memberPage === 'spiritual' && V.length > 0 && (
                  <div style={card}>
                    <h3 style={h3s}>Sermons &amp; Videos</h3>
                    {V.slice(0, 8).map((v, i) => (
                      <div key={i} style={{ padding: '0.5rem 0', borderBottom: '1px dashed #e2e8f0' }}>
                        <div style={{ fontWeight: '600', color: '#0f172a' }}>{v.title}{v.video_date ? <span style={{ fontWeight: 'normal', fontSize: '0.8rem', color: '#64748b' }}>  ({v.video_date})</span> : null}</div>
                        {v.speaker ? <div style={{ fontSize: '0.85rem', color: '#64748b' }}>{v.speaker}</div> : null}
                        <a href={v.video_url} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', marginTop: '0.3rem', backgroundColor: themeColor, color: '#ffffff', textDecoration: 'none', padding: '0.35rem 0.8rem', borderRadius: '0.35rem', fontSize: '0.85rem', fontWeight: '600' }}>▶ Watch</a>
                      </div>
                    ))}
                  </div>
                )}
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
                <div style={{ display: memberPage === 'ministry' ? 'block' : 'none', backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '0.75rem', padding: '1.25rem 1.5rem', marginBottom: '1rem' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: themeColor, margin: '0 0 0.75rem 0' }}>Church Events</h3>
                  {evs.length > 0 ? evs.slice(0, 10).map((ev, i) => (
                    <div key={i} style={{ padding: '0.5rem 0', borderBottom: '1px dashed #e2e8f0' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '600', color: '#0f172a' }}><span>{ev.title}</span><span style={{ fontSize: '0.8rem', color: '#64748b' }}>{ev.date}</span></div>
                      {ev.description ? <div style={{ fontSize: '0.9rem', color: '#334155' }}>{ev.description}</div> : null}
                    </div>
                  )) : <p style={{ margin: 0, fontSize: '0.9rem', color: '#64748b' }}>No upcoming events right now.</p>}
                </div>
              </div>
            );
          })()}

          <div style={{ display: memberPage === 'giving' ? 'block' : 'none' }}>
          <div style={{ backgroundColor: '#ffffff', border: '2px solid ' + themeColor, borderRadius: '0.75rem', padding: '1.25rem 1.5rem', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: themeColor, margin: '0 0 0.4rem 0' }}>💳 Give Online</h3>
            <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '0 0 0.8rem 0' }}>Pay securely with MTN MoMo, Vodafone Cash, AirtelTigo Money or a bank card through Flutterwave. Your gift is added to your records automatically.</p>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#475569', marginBottom: '0.25rem' }}>What are you giving?</label>
            <select value={payForm.type} onChange={(e) => setPayForm({ ...payForm, type: e.target.value })} style={{ width: '100%', padding: '0.65rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1', boxSizing: 'border-box', backgroundColor: '#ffffff', marginBottom: '0.7rem' }}>
              {['Tithe', 'Offering', 'Seed Offering', 'Thanksgiving', 'Welfare', 'Building Fund', 'Missions', 'Pledge', 'Other'].map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#475569', marginBottom: '0.25rem' }}>Amount (GHS)</label>
            <input type="number" min="1" step="0.01" value={payForm.amount} onChange={(e) => setPayForm({ ...payForm, amount: e.target.value })} placeholder="0.00" style={{ width: '100%', padding: '0.65rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1', boxSizing: 'border-box', marginBottom: '0.5rem' }} />
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.8rem' }}>
              {[20, 50, 100, 200, 500].map(a => <button key={a} type="button" onClick={() => setPayForm({ ...payForm, amount: String(a) })} style={{ backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '2rem', padding: '0.3rem 0.8rem', cursor: 'pointer', fontSize: '0.85rem' }}>{a}</button>)}
            </div>
            <button type="button" disabled={payBusy} onClick={startPayment} style={{ width: '100%', backgroundColor: payBusy ? '#94a3b8' : '#f5a623', color: '#ffffff', border: 'none', padding: '0.8rem', borderRadius: '0.5rem', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer' }}>{payBusy ? 'Please wait...' : 'Pay with Flutterwave'}</button>
            {payMsg && <div style={{ marginTop: '0.7rem', padding: '0.7rem', borderRadius: '0.5rem', fontSize: '0.88rem', backgroundColor: /^(Could not|The payment was not|We could not)/.test(payMsg) ? '#fee2e2' : '#dcfce7', color: /^(Could not|The payment was not|We could not)/.test(payMsg) ? '#991b1b' : '#166534' }}>{payMsg}</div>}
          </div>

          <div style={{ backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '0.75rem', padding: '1.25rem 1.5rem', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: themeColor, margin: '0 0 0.75rem 0' }}>My Financial Summary (read-only)</h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem', padding: '0.25rem 0' }}><span>Total Tithes</span><strong>GHS {memberTitheTotal.toFixed(2)}</strong></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem', padding: '0.25rem 0' }}><span>Total Contributions &amp; Income</span><strong>GHS {memberContribTotal.toFixed(2)}</strong></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem', padding: '0.25rem 0' }}><span>Total Welfare</span><strong>GHS {memberWelfareTotal.toFixed(2)}</strong></div>
          </div>

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
            { id: 'membership', label: '👥 Membership', tabs: [['members', 'Members', true], ['visitors', 'Visitors', can('record_visitors')], ['new_converts', 'New Converts', can('record_new_converts')]] },
            { id: 'leadership', label: '🏛 Leadership', tabs: [['leaders', 'Leaders', can('manage_leaders')]] },
            { id: 'meetings', label: '📅 Meetings', tabs: [['attendance', 'Attendance', can('record_attendance')], ['checkin', 'QR Check-in', can('record_attendance')], ['services', 'Services', can('register_services')], ['events', 'Events', can('register_events')], ['rotas', 'Duty Rotas', can('manage_rotas')]] },
            { id: 'finance', label: '💰 Finance', tabs: [['contributions', 'Contributions', can('access_finance') || can('view_balance_sheet')]] },
            { id: 'facilities', label: '🏢 Facilities', tabs: [['facilities', 'Facilities', can('manage_facilities')]] },
            { id: 'communication', label: '📢 Communication', tabs: [['announcements', 'Announcements', can('post_announcements')], ['messages', 'Messages', can('send_messages')], ['reports', 'Reports', can('view_reports')]] },
            { id: 'media', label: '🎬 Videos', tabs: [['videos', 'Sermons & Videos', can('manage_videos')]] },
            { id: 'admin', label: '⚙️ Admin', tabs: [['permissions', '🔐 Admin Permissions', role === 'super_admin'], ['settings', '⚙️ Settings', role === 'super_admin']] }
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
                          </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', alignItems: 'flex-end' }}>
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
                    setExpenseForm({ description: '', amount: '', date: '' });
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
                    <button type="submit" style={{ backgroundColor: themeColor, color: '#ffffff', border: 'none', padding: '0.75rem', borderRadius: '0.375rem', fontWeight: 'bold', cursor: 'pointer', marginTop: '0.5rem' }}>
                      {editingExpenseIndex !== null ? 'Update Expense' : 'Save Expense Entry'}
                    </button>
                  </form>
                </div>
                <h4 style={{ color: '#0f172a' }}>Recorded Expenses ({expenses.length})</h4>
                {expenses.map((exp, i) => (
                  <div key={i} style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '0.5rem', padding: '0.75rem 1rem', marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span><strong>{exp.description}</strong> ({exp.date}) - <strong style={{ color: '#dc2626' }}>GHS {parseFloat(exp.amount || 0).toFixed(2)}</strong></span>
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
                    <span><strong>{t.member_name}</strong> ({t.date}) - <strong style={{ color: '#16a34a' }}>GHS {parseFloat(t.amount || 0).toFixed(2)}</strong></span>
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
                    <span><strong>{c.contributor}</strong> - {c.type} ({c.date}) - <strong style={{ color: '#16a34a' }}>GHS {parseFloat(c.amount || 0).toFixed(2)}</strong></span>
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
