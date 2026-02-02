import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { clientsApi } from '../services/clientsApi';
import TechStackSelect from './TechStackSelect';
import PhoneWithCountry from './PhoneWithCountry';
import './ProfileManagementPage.css';

const emptyPortfolio = () => ({ title: '', description: '', images: [''], tech_stack: [] });

const educationToText = (edu) => {
  if (!edu || !Array.isArray(edu)) return '';
  if (typeof edu[0] === 'string') return edu[0];
  return (edu[0]?.description || edu[0]?.text || '') || (edu.map((e) => e.description || e.institution || '').filter(Boolean).join('\n\n') || '');
};

const workToText = (work) => {
  if (!work || !Array.isArray(work)) return '';
  if (typeof work[0] === 'string') return work[0];
  return (work[0]?.description || work[0]?.text || '') || (work.map((w) => w.description || `${w.company} - ${w.role}`).filter(Boolean).join('\n\n') || '');
};

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

const ACCOUNT_STATE_OPTIONS = [
  'Active',
  'Suspended',
  'Verify',
  'JSS',
  'Rising Talent',
  'Top Rated',
  'Top Rated Plus',
];

const ClientFormPage = ({ clientId, onSave, onCancel }) => {
  const { user } = useAuth();
  const toast = useToast();

  const handleCopy = async (text, label) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${label} copied`);
    } catch {
      toast.error('Failed to copy');
    }
  };
  const fileInputRef = useRef(null);
  const portfolioFileRef = useRef(null);
  const portfolioUploadTarget = useRef({ pfIdx: 0, imgIdx: 0 });
  const [loading, setLoading] = useState(!!clientId);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    image_url: '',
    birthday: '',
    street_address: '',
    apt_suite: '',
    city: '',
    state_province: '',
    zip_postal: '',
    phone_number: '',
    country: '',
    title: '',
    description: '',
    summary: '',
    password: '',
    education: '',
    work_experience: '',
    tech_stack: '',
    comment: '',
    portfolios: [emptyPortfolio()],
    account_state: '',
    proxy_type: '',
    proxy_timeline: '',
    proxy_ip: '',
    proxy_port: '',
    proxy_username: '',
    proxy_password: '',
  });
  const [activeSection, setActiveSection] = useState('identity');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (user?.id && clientId) {
      clientsApi.getById(user.id, clientId).then((p) => {
        const addr = parseAddress(p.address);
        setForm({
          full_name: p.full_name || '',
          email: p.email || '',
          image_url: p.image_url || '',
          birthday: p.birthday ? p.birthday.slice(0, 10) : '',
          street_address: addr.street,
          apt_suite: addr.apt,
          city: addr.city,
          state_province: addr.state,
          zip_postal: addr.zip,
          phone_number: p.phone_number || '',
          country: p.country || '',
          title: p.title || '',
          description: p.description || '',
          summary: p.summary || '',
          password: p.password || '',
          education: educationToText(p.education),
          work_experience: workToText(p.work_experience),
          tech_stack: Array.isArray(p.tech_stack) ? p.tech_stack.join(', ') : '',
          comment: p.comment ?? p.summary ?? '',
          account_state: p.account_state || '',
          proxy_type: p.proxy_info?.type || '',
          proxy_timeline: p.proxy_info?.timeline || '',
          proxy_ip: p.proxy_info?.ip || '',
          proxy_port: p.proxy_info?.port || '',
          proxy_username: p.proxy_info?.username || '',
          proxy_password: p.proxy_info?.password || '',
          portfolios: (p.portfolios?.length ? p.portfolios : [emptyPortfolio()]).map((pf) => ({
            title: pf.title || '',
            description: pf.description || '',
            images: pf.images?.length ? pf.images : [''],
            tech_stack: pf.tech_stack || [],
          })),
        });
      }).catch(console.error).finally(() => setLoading(false));
    } else if (!clientId) {
      setLoading(false);
    }
  }, [user?.id, clientId]);

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
    if (!clientId) return;
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const url = await clientsApi.uploadImage(user.id, clientId, file);
      update('image_url', url);
      toast.success('Image uploaded');
    } catch (err) {
      const msg = err?.message || err?.response?.data?.error || '';
      const setupUrl = msg.includes('BUCKET_REQUIRED') ? msg.split('BUCKET_REQUIRED: ')[1] : msg.match(/https:\/\/[^\s]+/)?.[0];
      if (setupUrl) window.open(setupUrl.trim(), '_blank');
      toast.error('Image upload failed. Create the avatars bucket in Supabase Storage, or use image URL.');
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

  const triggerPortfolioUpload = (pfIdx, imgIdx) => {
    portfolioUploadTarget.current = { pfIdx, imgIdx };
    portfolioFileRef.current?.click();
  };

  const handlePortfolioFileChange = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !user?.id) return;
    const { pfIdx, imgIdx } = portfolioUploadTarget.current;
    try {
      const url = await clientsApi.uploadPortfolioImage(user.id, clientId, pfIdx, file);
      setForm((f) => {
        const pfs = [...f.portfolios];
        const imgs = [...(pfs[pfIdx].images || [''])];
        imgs[imgIdx] = url;
        pfs[pfIdx] = { ...pfs[pfIdx], images: imgs };
        return { ...f, portfolios: pfs };
      });
      toast.success('Image uploaded');
    } catch (err) {
      const msg = err?.message || err?.response?.data?.error || '';
      const setupUrl = msg.includes('BUCKET_REQUIRED') ? msg.split('BUCKET_REQUIRED: ')[1] : msg.match(/https:\/\/[^\s]+/)?.[0];
      if (setupUrl) window.open(setupUrl.trim(), '_blank');
      toast.error('Upload failed. Ensure avatars bucket exists in Supabase Storage.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const addrObj = { street: form.street_address, apt: form.apt_suite, city: form.city, state: form.state_province, zip: form.zip_postal };
      const payload = {
        full_name: form.full_name,
        email: form.email || null,
        image_url: form.image_url || null,
        birthday: form.birthday || null,
        address: stringifyAddress(addrObj),
        phone_number: form.phone_number || null,
        country: form.country || null,
        title: form.title || null,
        description: form.description || null,
        summary: form.summary || null,
        comment: form.comment || null,
        password: form.password || null,
        education: form.education?.trim() ? [form.education.trim()] : [],
        work_experience: form.work_experience?.trim() ? [form.work_experience.trim()] : [],
        tech_stack: form.tech_stack ? form.tech_stack.split(',').map((t) => t.trim()).filter(Boolean) : [],
        account_state: form.account_state || null,
        proxy_info: (form.proxy_type || form.proxy_timeline || form.proxy_ip || form.proxy_port || form.proxy_username || form.proxy_password)
          ? {
              type: form.proxy_type || null,
              timeline: form.proxy_timeline || null,
              ip: form.proxy_ip || null,
              port: form.proxy_port || null,
              username: form.proxy_username || null,
              password: form.proxy_password || null,
            }
          : null,
        portfolios: form.portfolios.filter((p) => p.title || p.description).map((p) => ({
          ...p,
          images: p.images.filter(Boolean),
        })),
      };
      if (clientId) {
        await clientsApi.update(user.id, clientId, payload);
        toast.success('Client updated');
      } else {
        await clientsApi.create(user.id, payload);
        toast.success('Client added');
      }
      onSave();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save client');
    } finally {
      setSaving(false);
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
        <div className="profile-section-tabs" role="tablist" aria-label="Client sections">
          {[
            { id: 'identity', label: 'Identity Information' },
            { id: 'upwork', label: 'Upwork Profile' },
            { id: 'portfolios', label: 'Portfolios' },
            { id: 'summary', label: 'Commet' },
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
        <section className="profile-form-section identity-section" id="panel-identity" role="tabpanel">
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
                  className="profile-avatar-with-edit"
                  onClick={() => fileInputRef.current?.click()}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
                  aria-label="Change photo"
                >
                  {form.image_url ? (
                    <img src={form.image_url} alt="Client" />
                  ) : (
                    <div className="profile-avatar-placeholder">
                      {(form.full_name || form.email || '?')[0].toUpperCase()}
                    </div>
                  )}
                  <span className="profile-avatar-edit-overlay">Edit</span>
                </div>
                <button type="button" className="btn btn-outline btn-upload" onClick={() => fileInputRef.current?.click()}>
                  <span className="btn-icon">+</span> Upload photo
                </button>
              </div>
            </div>
            <div className="identity-right">
              {fg('Full Name', 'full_name', 'text', form.full_name, (v) => update('full_name', v), '', true)}
              {fg('Date of Birth', 'birthday', 'date', form.birthday, (v) => update('birthday', v))}
              <div className="form-group" key="phone-country">
                <label htmlFor="phone_number">Phone</label>
                <PhoneWithCountry
                  id="phone_number"
                  phoneNumber={form.phone_number}
                  country={form.country}
                  onPhoneChange={(v) => update('phone_number', v)}
                  onCountryChange={(v) => update('country', v)}
                  placeholder="Select country, then enter number"
                />
              </div>
              <div className="address-group">
                <div className="address-group-title">Address</div>
                <div className="form-row-2">
                  <div className="form-group">
                    <label htmlFor="street_address">Street</label>
                    <input id="street_address" type="text" value={form.street_address} onChange={(e) => update('street_address', e.target.value)} placeholder="Street address" />
                  </div>
                  <div className="form-group">
                    <label htmlFor="apt_suite">Apt/Suite</label>
                    <input id="apt_suite" type="text" value={form.apt_suite} onChange={(e) => update('apt_suite', e.target.value)} placeholder="Optional" />
                  </div>
                </div>
                <div className="form-row-3">
                  <div className="form-group">
                    <label htmlFor="city">City</label>
                    <input id="city" type="text" value={form.city} onChange={(e) => update('city', e.target.value)} placeholder="City" />
                  </div>
                  <div className="form-group">
                    <label htmlFor="state_province">State/Province</label>
                    <input id="state_province" type="text" value={form.state_province} onChange={(e) => update('state_province', e.target.value)} placeholder="State" />
                  </div>
                  <div className="form-group">
                    <label htmlFor="zip_postal">ZIP/Postal</label>
                    <input id="zip_postal" type="text" value={form.zip_postal} onChange={(e) => update('zip_postal', e.target.value)} placeholder="ZIP" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        )}

        {activeSection === 'upwork' && (
        <section className="profile-form-section" id="panel-upwork" role="tabpanel">
          <h2>Upwork Profile</h2>
          <div className="form-row-2">
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <div className="input-with-icon-btn">
                <input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => update('email', e.target.value)}
                  placeholder="client@example.com"
                />
                <button type="button" className="btn-copy" onClick={() => handleCopy(form.email, 'Email')} title="Copy email">📋</button>
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="input-with-icon-btn">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => update('password', e.target.value)}
                  placeholder="Upwork account password"
                  autoComplete="off"
                />
                <button type="button" className="btn-copy" onClick={() => setShowPassword((s) => !s)} title={showPassword ? 'Hide password' : 'Show password'}>
                  {showPassword ? '🙈' : '👁'}
                </button>
                <button type="button" className="btn-copy" onClick={() => handleCopy(form.password, 'Password')} title="Copy password">📋</button>
              </div>
            </div>
          </div>
          <div className="form-group" key="account_state">
            <label htmlFor="account_state">Account State</label>
            <select
              id="account_state"
              value={form.account_state}
              onChange={(e) => update('account_state', e.target.value)}
            >
              <option value="">Select...</option>
              {ACCOUNT_STATE_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
          {fg('Title', 'title', 'text', form.title, (v) => update('title', v), 'e.g. Software Engineer')}
          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              value={form.description}
              onChange={(e) => update('description', e.target.value)}
              rows={5}
              placeholder="Profile description or overview..."
            />
          </div>
          <div className="form-group">
            <label htmlFor="education">Education</label>
            <textarea
              id="education"
              value={form.education}
              onChange={(e) => update('education', e.target.value)}
              rows={5}
              placeholder="Institution, degree, dates, description..."
            />
          </div>
          <div className="form-group">
            <label htmlFor="work_experience">Work Experience</label>
            <textarea
              id="work_experience"
              value={form.work_experience}
              onChange={(e) => update('work_experience', e.target.value)}
              rows={5}
              placeholder="Company, role, dates, description..."
            />
          </div>
          <div className="proxy-info-group">
            <div className="address-group-title">Proxy Info</div>
            <div className="form-row-2">
              <div className="form-group">
                <label htmlFor="proxy_type">Type</label>
                <input id="proxy_type" type="text" value={form.proxy_type} onChange={(e) => update('proxy_type', e.target.value)} placeholder="e.g. HTTP, SOCKS5" />
              </div>
              <div className="form-group">
                <label htmlFor="proxy_timeline">Timeline</label>
                <input id="proxy_timeline" type="text" value={form.proxy_timeline} onChange={(e) => update('proxy_timeline', e.target.value)} placeholder="Timeline" />
              </div>
            </div>
            <div className="form-row-2">
              <div className="form-group">
                <label htmlFor="proxy_ip">IP</label>
                <input id="proxy_ip" type="text" value={form.proxy_ip} onChange={(e) => update('proxy_ip', e.target.value)} placeholder="IP address" />
              </div>
              <div className="form-group">
                <label htmlFor="proxy_port">Port</label>
                <input id="proxy_port" type="text" value={form.proxy_port} onChange={(e) => update('proxy_port', e.target.value)} placeholder="Port" />
              </div>
            </div>
            <div className="form-row-2">
              <div className="form-group">
                <label htmlFor="proxy_username">Username</label>
                <input id="proxy_username" type="text" value={form.proxy_username} onChange={(e) => update('proxy_username', e.target.value)} placeholder="Username" />
              </div>
              <div className="form-group">
                <label htmlFor="proxy_password">Password</label>
                <input id="proxy_password" type="password" value={form.proxy_password} onChange={(e) => update('proxy_password', e.target.value)} placeholder="Password" autoComplete="off" />
              </div>
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="tech_stack">Tech Stack</label>
            <TechStackSelect
              id="tech_stack"
              value={form.tech_stack ? form.tech_stack.split(',').map((t) => t.trim()).filter(Boolean) : []}
              onChange={(arr) => update('tech_stack', arr.join(', '))}
              placeholder="Search or type to add technologies..."
            />
          </div>
        </section>
        )}

        {activeSection === 'summary' && (
        <section className="profile-form-section" id="panel-summary" role="tabpanel">
          <h2>My Opinion</h2>
          <div className="form-group">
            <label htmlFor="comment">My opinion about this account</label>
            <textarea
              id="comment"
              value={form.comment}
              onChange={(e) => update('comment', e.target.value)}
              rows={8}
              placeholder="Add your opinion about this account..."
            />
          </div>
        </section>
        )}

        {activeSection === 'portfolios' && (
        <section className="profile-form-section" id="panel-portfolios" role="tabpanel">
          <input
            ref={portfolioFileRef}
            type="file"
            accept="image/*"
            onChange={handlePortfolioFileChange}
            style={{ display: 'none' }}
          />
          <div className="section-header-row">
            <h2>Portfolios</h2>
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => addItem('portfolios', emptyPortfolio)}>+ Add</button>
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
                  <label>Images</label>
                  <div className="portfolio-images-grid">
                    {pf.images.map((img, j) => (
                      <div key={j} className="portfolio-image-slot">
                        {img ? (
                          <div className="portfolio-image-preview">
                            <img src={img} alt="" />
                            <button type="button" className="portfolio-image-remove" onClick={() => removePortfolioImage(i, j)} title="Remove">×</button>
                          </div>
                        ) : (
                          <button type="button" className="portfolio-upload-slot" onClick={() => triggerPortfolioUpload(i, j)}>
                            + Upload
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  <button type="button" className="btn-link" onClick={() => addPortfolioImage(i)}>+ Add image</button>
                </div>
                <div className="form-group">
                  <label>Tech Stack</label>
                  <TechStackSelect
                    value={pf.tech_stack || []}
                    onChange={(arr) => updateArray('portfolios', i, 'tech_stack', arr)}
                    placeholder="Search or type to add technologies..."
                  />
                </div>
              </div>
            </div>
          ))}
        </section>
        )}

        <div className="form-actions">
          <button type="button" className="btn btn-secondary" onClick={onCancel}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save Client'}</button>
        </div>
      </form>
    </div>
  );
};

export default ClientFormPage;
