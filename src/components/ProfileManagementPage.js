import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { profileApi } from '../services/profileApi';
import { validatePassword } from '../utils/passwordValidation';
import PasswordStrength from './PasswordStrength';
import './ProfileManagementPage.css';

const emptyEducation = () => ({ institution: '', degree: '', field: '', start_date: '', end_date: '', description: '' });
const emptyWork = () => ({ company: '', role: '', start_date: '', end_date: '', description: '', is_current: false });
const emptyPortfolio = () => ({ title: '', description: '', images: [''], tech_stack: [] });

const parseAddress = (addr) => {
  if (!addr) return { street: '', apt: '', city: '', state: '', zip: '' };
  try {
    const o = JSON.parse(addr);
    return { street: o.street || '', apt: o.apt || '', city: o.city || '', state: o.state || '', zip: o.zip || '' };
  } catch {
    return { street: addr || '', apt: '', city: '', state: '', zip: '' };
  }
};

const stringifyAddress = (a) => (a.street || a.city ? JSON.stringify(a) : null);

const COUNTRY_OPTIONS = [
  'Brazil', 'United States', 'United Kingdom', 'Canada', 'Australia', 'Germany', 'France', 'India',
  'Japan', 'China', 'Mexico', 'Spain', 'Italy', 'Netherlands', 'South Korea', 'Argentina', 'Colombia',
  'Portugal', 'Poland', 'South Africa', 'Nigeria', 'Egypt', 'Philippines', 'Vietnam', 'Pakistan',
  'Bangladesh', 'Indonesia', 'Thailand', 'Malaysia', 'Singapore', 'Israel', 'Turkey', 'Ukraine',
  'Russia', 'Sweden', 'Norway', 'Denmark', 'Finland', 'Ireland', 'New Zealand', 'Chile', 'Peru',
];

const ProfileManagementPage = ({ onBack }) => {
  const { user } = useAuth();
  const toast = useToast();
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    image_url: '',
    birthday: '',
    address: '',
    street_address: '',
    apt_suite: '',
    city: '',
    state_province: '',
    zip_postal: '',
    phone_number: '',
    country: '',
    title: '',
    summary: '',
    education: [emptyEducation()],
    work_experience: [emptyWork()],
    portfolios: [emptyPortfolio()],
  });
  const [passwordData, setPasswordData] = useState({ current: '', new: '', confirm: '' });
  const [activeSection, setActiveSection] = useState('identity');

  useEffect(() => {
    if (user?.id) {
      profileApi.getProfile(user.id).then((p) => {
        const addr = parseAddress(p.address);
        setForm({
          full_name: p.full_name || '',
          email: p.email || user?.email || '',
          image_url: p.image_url || '',
          birthday: p.birthday ? p.birthday.slice(0, 10) : '',
          address: p.address || '',
          street_address: addr.street,
          apt_suite: addr.apt,
          city: addr.city,
          state_province: addr.state,
          zip_postal: addr.zip,
          phone_number: p.phone_number || '',
          country: p.country || '',
          title: p.title || '',
          summary: p.summary || '',
          education: (p.education?.length ? p.education : [emptyEducation()]).map((e) => ({
            institution: e.institution || '',
            degree: e.degree || '',
            field: e.field || '',
            start_date: e.start_date ? e.start_date.slice(0, 10) : '',
            end_date: e.end_date ? e.end_date.slice(0, 10) : '',
            description: e.description || '',
          })),
          work_experience: (p.work_experience?.length ? p.work_experience : [emptyWork()]).map((w) => ({
            company: w.company || '',
            role: w.role || '',
            start_date: w.start_date ? w.start_date.slice(0, 10) : '',
            end_date: w.end_date ? w.end_date.slice(0, 10) : '',
            description: w.description || '',
            is_current: w.is_current || false,
          })),
          portfolios: (p.portfolios?.length ? p.portfolios : [emptyPortfolio()]).map((pf) => ({
            title: pf.title || '',
            description: pf.description || '',
            images: pf.images?.length ? pf.images : [''],
            tech_stack: pf.tech_stack || [],
          })),
        });
      }).catch(console.error).finally(() => setLoading(false));
    }
  }, [user?.id, user?.email]);

  const update = (path, value) => setForm((f) => ({ ...f, [path]: value }));

  const updateArray = (key, index, field, value) => {
    setForm((f) => {
      const arr = [...(f[key] || [])];
      arr[index] = { ...arr[index], [field]: value };
      return { ...f, [key]: arr };
    });
  };

  const addItem = (key, empty) => setForm((f) => ({ ...f, [key]: [...(f[key] || []), empty()] }));
  const removeItem = (key, index) => setForm((f) => ({ ...f, [key]: f[key].filter((_, i) => i !== index) }));

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const url = await profileApi.uploadImage(user.id, file);
      update('image_url', url);
      toast.success('Image uploaded');
    } catch (err) {
      const msg = err?.message || err?.response?.data?.error || '';
      const setupUrl = msg.includes('BUCKET_REQUIRED') ? msg.split('BUCKET_REQUIRED: ')[1] : msg.match(/https:\/\/[^\s]+/)?.[0];
      if (setupUrl) window.open(setupUrl.trim(), '_blank');
      toast.error('Image upload failed. Create the "avatars" bucket in Supabase Storage (link opened), or paste an image URL instead.');
    }
    e.target.value = '';
  };

  const handlePortfolioImage = (pfIdx, imgIdx, value) => {
    setForm((f) => {
      const pfs = [...f.portfolios];
      const imgs = [...(pfs[pfIdx].images || [''])];
      imgs[imgIdx] = value;
      pfs[pfIdx] = { ...pfs[pfIdx], images: imgs };
      return { ...f, portfolios: pfs };
    });
  };

  const addPortfolioImage = (pfIdx) => {
    setForm((f) => {
      const pfs = [...f.portfolios];
      pfs[pfIdx] = { ...pfs[pfIdx], images: [...(pfs[pfIdx].images || []), ''] };
      return { ...f, portfolios: pfs };
    });
  };

  const removePortfolioImage = (pfIdx, imgIdx) => {
    setForm((f) => {
      const pfs = [...f.portfolios];
      const imgs = pfs[pfIdx].images.filter((_, i) => i !== imgIdx);
      pfs[pfIdx] = { ...pfs[pfIdx], images: imgs.length ? imgs : [''] };
      return { ...f, portfolios: pfs };
    });
  };

  const handleTechStack = (pfIdx, value) => {
    const tags = value.split(',').map((t) => t.trim()).filter(Boolean);
    setForm((f) => {
      const pfs = [...f.portfolios];
      pfs[pfIdx] = { ...pfs[pfIdx], tech_stack: tags };
      return { ...f, portfolios: pfs };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const addrObj = { street: form.street_address, apt: form.apt_suite, city: form.city, state: form.state_province, zip: form.zip_postal };
      const payload = {
        full_name: form.full_name,
        image_url: form.image_url || null,
        birthday: form.birthday || null,
        address: stringifyAddress(addrObj),
        phone_number: form.phone_number || null,
        country: form.country || null,
        title: form.title || null,
        summary: form.summary || null,
        education: form.education.filter((e) => e.institution || e.degree).map((e) => ({
          ...e,
          start_date: e.start_date || null,
          end_date: e.end_date || null,
        })),
        work_experience: form.work_experience.filter((w) => w.company || w.role).map((w) => ({
          ...w,
          start_date: w.start_date || null,
          end_date: w.end_date || null,
        })),
        portfolios: form.portfolios.filter((p) => p.title || p.description).map((p) => ({
          ...p,
          images: p.images.filter(Boolean),
        })),
      };
      await profileApi.updateProfile(user.id, payload, user);
      toast.success('Profile saved');
      if (onBack) onBack();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordData.new !== passwordData.confirm) {
      toast.error('New passwords do not match');
      return;
    }
    const pwdErrors = validatePassword(passwordData.new);
    if (pwdErrors.length > 0) {
      toast.error(`Password: ${pwdErrors.join('. ')}`);
      return;
    }
    try {
      await profileApi.updatePassword(passwordData.new);
      toast.success('Password updated');
      setPasswordData({ current: '', new: '', confirm: '' });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update password');
    }
  };

  if (loading) {
    return (
      <div className="profile-mgmt loading">
        <div className="spinner" aria-hidden="true" />
        <span>Loading...</span>
      </div>
    );
  }

  const fg = (label, id, type = 'text', value, onChange, placeholder = '', required = false) => (
    <div className="form-group" key={id}>
      <label htmlFor={id}>{label}{required && ' *'}</label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );

  const fgSelect = (label, id, value, onChange, options, required = false) => (
    <div className="form-group" key={id}>
      <label htmlFor={id}>{label}{required && ' *'}</label>
      <select id={id} value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">Select...</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    </div>
  );

  return (
    <div className="profile-management-page">
      <form onSubmit={handleSubmit} className="profile-mgmt-form">
        <div className="profile-section-tabs" role="tablist" aria-label="Profile sections">
          {[
            { id: 'identity', label: 'Identity Information' },
            { id: 'upwork', label: 'Upwork Profile' },
            { id: 'portfolios', label: 'Portfolios' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={activeSection === tab.id}
              aria-controls={`panel-${tab.id}`}
              id={`tab-${tab.id}`}
              className={`profile-tab ${activeSection === tab.id ? 'active' : ''}`}
              onClick={() => setActiveSection(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeSection === 'identity' && (
        <section className="profile-form-section identity-section" id="panel-identity" role="tabpanel" aria-labelledby="tab-identity">
          <div className="identity-layout">
            <div className="identity-left">
              <div className="profile-avatar-block">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  style={{ display: 'none' }}
                />
                <div
                  className="profile-avatar-with-badge"
                  onClick={() => fileInputRef.current?.click()}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
                  aria-label="Change profile photo"
                >
                  {form.image_url ? (
                    <img src={form.image_url} alt="Profile" />
                  ) : (
                    <div className="profile-avatar-placeholder">
                      {(form.full_name || form.email || '?')[0].toUpperCase()}
                    </div>
                  )}
                  <span className="avatar-add-badge" aria-hidden>+</span>
                </div>
                <button type="button" className="btn btn-outline btn-upload" onClick={() => fileInputRef.current?.click()}>
                  <span className="btn-icon">+</span> Upload photo
                </button>
              </div>
            </div>
            <div className="identity-right">
              {fg('Full Name', 'full_name', 'text', form.full_name, (v) => update('full_name', v), '', true)}
              {fg('Date of Birth', 'birthday', 'date', form.birthday, (v) => update('birthday', v), '', true)}
              {fgSelect('Country', 'country', form.country, (v) => update('country', v), form.country && !COUNTRY_OPTIONS.includes(form.country) ? [form.country, ...COUNTRY_OPTIONS] : COUNTRY_OPTIONS, true)}
              <div className="form-row-2">
                <div className="form-group">
                  <label htmlFor="street_address">Street address *</label>
                  <input id="street_address" type="text" value={form.street_address} onChange={(e) => update('street_address', e.target.value)} placeholder="Street address" />
                </div>
                <div className="form-group">
                  <label htmlFor="apt_suite">Apt/Suite <span className="label-optional">(Optional)</span></label>
                  <input id="apt_suite" type="text" value={form.apt_suite} onChange={(e) => update('apt_suite', e.target.value)} placeholder="Apt/Suite (Optional)" />
                </div>
              </div>
              <div className="form-row-3">
                <div className="form-group">
                  <label htmlFor="city">City *</label>
                  <input id="city" type="text" value={form.city} onChange={(e) => update('city', e.target.value)} placeholder="City" />
                </div>
                <div className="form-group">
                  <label htmlFor="state_province">State/Province</label>
                  <input id="state_province" type="text" value={form.state_province} onChange={(e) => update('state_province', e.target.value)} placeholder="State/Province" />
                </div>
                <div className="form-group">
                  <label htmlFor="zip_postal">ZIP/Postal code</label>
                  <input id="zip_postal" type="text" value={form.zip_postal} onChange={(e) => update('zip_postal', e.target.value)} placeholder="ZIP/Postal code" />
                </div>
              </div>
              {fg('Phone', 'phone_number', 'tel', form.phone_number, (v) => update('phone_number', v), '+1 234 567 8900', true)}
            </div>
          </div>
        </section>
        )}

        {activeSection === 'upwork' && (
        <section className="profile-form-section" id="panel-upwork" role="tabpanel" aria-labelledby="tab-upwork">
          <h2>Upwork Profile</h2>
          <div className="form-group">
            <label>Email</label>
            <input type="email" value={form.email} disabled className="input-disabled" />
            <span className="form-hint">Email is managed by your account settings</span>
          </div>
          <div className="password-form">
            <h3 className="subsection-title">Change Password</h3>
            <div className="form-group">
              <label htmlFor="new_password">New Password</label>
              <input
                id="new_password"
                type="password"
                value={passwordData.new}
                onChange={(e) => setPasswordData((p) => ({ ...p, new: e.target.value }))}
                placeholder="Min 8 chars, uppercase, lowercase, number, special character"
              />
              <PasswordStrength password={passwordData.new} showRequirements />
            </div>
            {fg('Confirm New Password', 'confirm_password', 'password', passwordData.confirm, (v) => setPasswordData((p) => ({ ...p, confirm: v })))}
            <button type="button" className="btn btn-secondary" onClick={handlePasswordChange}>Update Password</button>
          </div>
          {fg('Title', 'title', 'text', form.title, (v) => update('title', v), 'e.g. Software Engineer')}
          <div className="form-group">
            <label htmlFor="summary">Summary</label>
            <textarea
              id="summary"
              value={form.summary}
              onChange={(e) => update('summary', e.target.value)}
              rows={4}
              placeholder="Brief bio or about you"
            />
          </div>
          <div className="subsection-block">
            <div className="section-header-row">
              <h3 className="subsection-title">Education</h3>
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => addItem('education', emptyEducation)}>
                + Add
              </button>
            </div>
          {form.education.map((ed, i) => (
            <div key={i} className="array-item">
              <div className="array-item-header">
                <span>Education #{i + 1}</span>
                <button type="button" className="btn-remove" onClick={() => removeItem('education', i)}>Remove</button>
              </div>
              <div className="array-item-fields">
                {fg('Institution', `ed_inst_${i}`, 'text', ed.institution, (v) => updateArray('education', i, 'institution', v))}
                {fg('Degree', `ed_deg_${i}`, 'text', ed.degree, (v) => updateArray('education', i, 'degree', v))}
                {fg('Field', `ed_field_${i}`, 'text', ed.field, (v) => updateArray('education', i, 'field', v))}
                <div className="form-row">
                  {fg('Start', `ed_start_${i}`, 'date', ed.start_date, (v) => updateArray('education', i, 'start_date', v))}
                  {fg('End', `ed_end_${i}`, 'date', ed.end_date, (v) => updateArray('education', i, 'end_date', v))}
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea value={ed.description} onChange={(e) => updateArray('education', i, 'description', e.target.value)} rows={2} />
                </div>
              </div>
            </div>
          ))}
            <div className="section-header-row subsection-header">
              <h3 className="subsection-title">Work Experience</h3>
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => addItem('work_experience', emptyWork)}>
                + Add
              </button>
            </div>
          {form.work_experience.map((we, i) => (
            <div key={i} className="array-item">
              <div className="array-item-header">
                <span>Experience #{i + 1}</span>
                <button type="button" className="btn-remove" onClick={() => removeItem('work_experience', i)}>Remove</button>
              </div>
              <div className="array-item-fields">
                {fg('Company', `we_comp_${i}`, 'text', we.company, (v) => updateArray('work_experience', i, 'company', v))}
                {fg('Role', `we_role_${i}`, 'text', we.role, (v) => updateArray('work_experience', i, 'role', v))}
                <div className="form-row">
                  {fg('Start', `we_start_${i}`, 'date', we.start_date, (v) => updateArray('work_experience', i, 'start_date', v))}
                  {fg('End', `we_end_${i}`, 'date', we.end_date, (v) => updateArray('work_experience', i, 'end_date', v))}
                </div>
                <label className="checkbox-label">
                  <input type="checkbox" checked={we.is_current} onChange={(e) => updateArray('work_experience', i, 'is_current', e.target.checked)} />
                  Current role
                </label>
                <div className="form-group">
                  <label>Description</label>
                  <textarea value={we.description} onChange={(e) => updateArray('work_experience', i, 'description', e.target.value)} rows={2} />
                </div>
              </div>
            </div>
          ))}
          </div>
        </section>
        )}

        {activeSection === 'portfolios' && (
        <section className="profile-form-section" id="panel-portfolios" role="tabpanel" aria-labelledby="tab-portfolios">
          <div className="section-header-row">
            <h2>Portfolios</h2>
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => addItem('portfolios', emptyPortfolio)}>
              + Add
            </button>
          </div>
          {form.portfolios.map((pf, i) => (
            <div key={i} className="array-item">
              <div className="array-item-header">
                <span>Portfolio #{i + 1}</span>
                <button type="button" className="btn-remove" onClick={() => removeItem('portfolios', i)}>Remove</button>
              </div>
              <div className="array-item-fields">
                {fg('Title', `pf_title_${i}`, 'text', pf.title, (v) => updateArray('portfolios', i, 'title', v))}
                <div className="form-group">
                  <label>Description</label>
                  <textarea value={pf.description} onChange={(e) => updateArray('portfolios', i, 'description', e.target.value)} rows={2} />
                </div>
                <div className="form-group">
                  <label>Image URLs (one per line or comma-separated)</label>
                  {pf.images.map((img, j) => (
                    <div key={j} className="url-row">
                      <input
                        type="url"
                        value={img}
                        onChange={(e) => handlePortfolioImage(i, j, e.target.value)}
                        placeholder="https://..."
                      />
                      {pf.images.length > 1 && (
                        <button type="button" className="btn-remove" onClick={() => removePortfolioImage(i, j)}>×</button>
                      )}
                    </div>
                  ))}
                  <button type="button" className="btn-link" onClick={() => addPortfolioImage(i)}>+ Add image</button>
                </div>
                <div className="form-group">
                  <label>Tech Stack (comma-separated)</label>
                  <input
                    type="text"
                    value={(pf.tech_stack || []).join(', ')}
                    onChange={(e) => handleTechStack(i, e.target.value)}
                    placeholder="React, Node.js, Python"
                  />
                </div>
              </div>
            </div>
          ))}
        </section>
        )}

        <div className="form-actions">
          <button type="button" className="btn btn-secondary" onClick={onBack}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save Profile'}</button>
        </div>
      </form>
    </div>
  );
};

export default ProfileManagementPage;
