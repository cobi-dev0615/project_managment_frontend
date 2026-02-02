import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { profileApi } from '../services/profileApi';
import './ProfileViewPage.css';

const ProfileViewPage = ({ onEdit }) => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      profileApi.getProfile(user.id).then(setProfile).catch(console.error).finally(() => setLoading(false));
    }
  }, [user?.id]);

  if (loading) {
    return (
      <div className="profile-page loading">
        <div className="spinner" aria-hidden="true" />
        <span>Loading profile...</span>
      </div>
    );
  }

  const p = profile || {};
  const formatDate = (d) => (d ? new Date(d).toLocaleDateString() : null);
  const formatAddress = (addr) => {
    if (!addr) return null;
    try {
      const o = typeof addr === 'string' ? JSON.parse(addr) : addr;
      const parts = [o.street, o.apt, o.city, o.state, o.zip].filter(Boolean);
      return parts.length ? parts.join(', ') : null;
    } catch {
      return addr;
    }
  };

  return (
    <div className="profile-view-page">
      <div className="profile-view-header">
        <h1>My Profile</h1>
        {onEdit && (
          <button className="btn btn-primary" onClick={onEdit}>
            Edit Profile
          </button>
        )}
      </div>

      <div className="profile-view-card">
        <div className="profile-view-hero">
          <div className="profile-avatar">
            {p.image_url ? (
              <img src={p.image_url} alt={p.full_name || 'Profile'} />
            ) : (
              <div className="profile-avatar-placeholder">
                {(p.full_name || p.email || '?')[0].toUpperCase()}
              </div>
            )}
          </div>
          <div className="profile-hero-info">
            <h2>{p.full_name || 'No name'}</h2>
            {p.title && <p className="profile-title">{p.title}</p>}
            {p.email && <p className="profile-email">{p.email}</p>}
          </div>
        </div>

        {p.summary && (
          <section className="profile-section">
            <h3>Summary</h3>
            <p className="profile-summary">{p.summary}</p>
          </section>
        )}

        <div className="profile-details-grid">
          {p.birthday && (
            <div className="profile-detail">
              <span className="detail-label">Birthday</span>
              <span className="detail-value">{formatDate(p.birthday)}</span>
            </div>
          )}
          {p.phone_number && (
            <div className="profile-detail">
              <span className="detail-label">Phone</span>
              <a href={`tel:${p.phone_number}`} className="detail-value">{p.phone_number}</a>
            </div>
          )}
          {p.country && (
            <div className="profile-detail">
              <span className="detail-label">Country</span>
              <span className="detail-value">{p.country}</span>
            </div>
          )}
          {formatAddress(p.address) && (
            <div className="profile-detail full-width">
              <span className="detail-label">Address</span>
              <span className="detail-value">{formatAddress(p.address)}</span>
            </div>
          )}
        </div>

        {p.education?.length > 0 && (
          <section className="profile-section">
            <h3>Education</h3>
            <div className="profile-list">
              {p.education.map((ed, i) => (
                <div key={i} className="profile-list-item">
                  <strong>{ed.institution}</strong>
                  {ed.degree && <span> — {ed.degree}{ed.field ? ` in ${ed.field}` : ''}</span>}
                  {(ed.start_date || ed.end_date) && (
                    <span className="profile-date">
                      {formatDate(ed.start_date)} – {ed.end_date ? formatDate(ed.end_date) : 'Present'}
                    </span>
                  )}
                  {ed.description && <p>{ed.description}</p>}
                </div>
              ))}
            </div>
          </section>
        )}

        {p.work_experience?.length > 0 && (
          <section className="profile-section">
            <h3>Work Experience</h3>
            <div className="profile-list">
              {p.work_experience.map((we, i) => (
                <div key={i} className="profile-list-item">
                  <strong>{we.company}</strong> — {we.role}
                  {(we.start_date || we.end_date) && (
                    <span className="profile-date">
                      {formatDate(we.start_date)} – {we.is_current ? 'Present' : formatDate(we.end_date)}
                    </span>
                  )}
                  {we.description && <p>{we.description}</p>}
                </div>
              ))}
            </div>
          </section>
        )}

        {p.portfolios?.length > 0 && (
          <section className="profile-section">
            <h3>Portfolio</h3>
            <div className="profile-portfolios">
              {p.portfolios.map((pf, i) => (
                <div key={i} className="portfolio-item">
                  {pf.images?.length > 0 && (
                    <div className="portfolio-images">
                      {pf.images.map((img, j) => (
                        <img key={j} src={img} alt={pf.title || 'Portfolio'} />
                      ))}
                    </div>
                  )}
                  <h4>{pf.title}</h4>
                  {pf.description && <p>{pf.description}</p>}
                  {pf.tech_stack?.length > 0 && (
                    <div className="portfolio-tech">
                      {pf.tech_stack.map((t, j) => (
                        <span key={j} className="tech-tag">{t}</span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {!p.summary && !p.birthday && !p.phone_number && !p.country && !p.address &&
         (!p.education || p.education.length === 0) &&
         (!p.work_experience || p.work_experience.length === 0) &&
         (!p.portfolios || p.portfolios.length === 0) && (
          <div className="profile-empty">
            <p>Your profile is empty. Add details to showcase your experience and portfolio.</p>
            {onEdit && (
              <button className="btn btn-primary" onClick={onEdit}>
                Complete Profile
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileViewPage;
