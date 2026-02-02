import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { clientsApi } from '../services/clientsApi';
import ConfirmModal from './ConfirmModal';
import ClientFormPage from './ClientFormPage';
import ClientsTable from './ClientsTable';
import './ClientsList.css';

const ClientsList = () => {
  const { user } = useAuth();
  const toast = useToast();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'add' | 'edit' | 'view'
  const [selectedClientId, setSelectedClientId] = useState(null);
  const [newDraftId, setNewDraftId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [adding, setAdding] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const totalPages = Math.max(1, Math.ceil(clients.length / itemsPerPage));
  const paginatedClients = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return clients.slice(start, start + itemsPerPage);
  }, [clients, currentPage, itemsPerPage]);

  const handlePageChange = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const loadClients = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const data = await clientsApi.getAll(user.id);
      setClients(data);
    } catch (error) {
      toast.error('Failed to load clients');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) loadClients();
  }, [user?.id]);

  useEffect(() => {
    const maxPage = Math.max(1, Math.ceil(clients.length / itemsPerPage));
    if (currentPage > maxPage) setCurrentPage(maxPage);
  }, [clients.length, currentPage, itemsPerPage]);

  const handleAdd = async () => {
    if (!user?.id) return;
    setAdding(true);
    try {
      const client = await clientsApi.create(user.id, { full_name: '' });
      setSelectedClientId(client.id);
      setViewMode('edit');
      setNewDraftId(client.id);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create client');
    } finally {
      setAdding(false);
    }
  };

  const handleEdit = (client) => {
    setSelectedClientId(client.id);
    setViewMode('edit');
  };

  const handleView = (client) => {
    setSelectedClientId(client.id);
    setViewMode('view');
  };

  const handleBack = () => {
    setViewMode('list');
    setSelectedClientId(null);
    setNewDraftId(null);
    setCurrentPage(1);
    loadClients();
  };

  const handleDeleteConfirm = async () => {
    if (!deleteId || !user?.id) return;
    try {
      await clientsApi.delete(user.id, deleteId);
      loadClients();
      toast.success('Client deleted');
      setDeleteId(null);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to delete client');
      setDeleteId(null);
    }
  };

  if (viewMode === 'edit' && selectedClientId) {
    return (
      <ClientFormPage
        clientId={selectedClientId}
        onSave={handleBack}
        onCancel={async () => {
          if (newDraftId === selectedClientId) {
            try {
              await clientsApi.delete(user.id, selectedClientId);
            } catch (e) { /* ignore */ }
          }
          handleBack();
        }}
      />
    );
  }

  if (viewMode === 'view' && selectedClientId) {
    return (
      <ClientViewPage
        clientId={selectedClientId}
        onEdit={() => setViewMode('edit')}
        onBack={handleBack}
      />
    );
  }

  if (loading) {
    return (
      <div className="clients-list loading">
        <div className="spinner" aria-hidden="true" />
        <span>Loading clients...</span>
      </div>
    );
  }

  return (
    <div className="clients-list">
      <div className="section-header">
        <h2>Clients</h2>
        <p className="section-description">Manage your clients' information</p>
        <button type="button" className="btn btn-primary" onClick={handleAdd} disabled={adding}>
          {adding ? 'Creating...' : '+ Add Client'}
        </button>
      </div>

      {clients.length === 0 ? (
        <div className="clients-empty-state">
          <div className="empty-state-icon" aria-hidden="true">👥</div>
          <h3 className="empty-state-title">No clients yet</h3>
          <p className="empty-state-text">Add clients to store their contact details, profiles, and portfolios.</p>
          <button type="button" className="btn btn-primary" onClick={handleAdd}>
            Add your first client
          </button>
        </div>
      ) : (
        <>
          <ClientsTable
            clients={paginatedClients}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={setDeleteId}
          />
          {totalPages > 1 && (
            <div className="clients-pagination">
              <button
                type="button"
                className="pagination-btn"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                ← Previous
              </button>
              <span className="pagination-info">
                Page {currentPage} of {totalPages} ({clients.length} clients)
              </span>
              <button
                type="button"
                className="pagination-btn"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}

      <ConfirmModal
        isOpen={!!deleteId}
        title="Delete Client"
        message="Are you sure you want to delete this client? All their information will be removed."
        confirmLabel="Delete"
        variant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
};

const ClientViewPage = ({ clientId, onEdit, onBack }) => {
  const { user } = useAuth();
  const toast = useToast();
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id && clientId) {
      clientsApi.getById(user.id, clientId).then(setClient).catch(console.error).finally(() => setLoading(false));
    }
  }, [user?.id, clientId]);

  if (loading || !client) {
    return (
      <div className="clients-list loading">
        <div className="spinner" aria-hidden="true" />
        <span>Loading...</span>
      </div>
    );
  }

  const formatDate = (d) => (d ? new Date(d).toLocaleDateString() : null);
  const formatEducationText = (edu) => {
    if (!edu || !Array.isArray(edu)) return null;
    if (typeof edu[0] === 'string') return edu[0];
    return edu.map((e) => e.description || `${e.institution || ''} ${e.degree || ''}`.trim() || '').filter(Boolean).join('\n\n') || null;
  };
  const formatWorkText = (work) => {
    if (!work || !Array.isArray(work)) return null;
    if (typeof work[0] === 'string') return work[0];
    return work.map((w) => w.description || `${w.company || ''} - ${w.role || ''}`.trim() || '').filter(Boolean).join('\n\n') || null;
  };
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

  const hasContactInfo =
    client.birthday ||
    client.phone_number ||
    client.country ||
    formatAddress(client.address);
  const hasSidebarContact = client.phone_number || client.country;

  return (
    <div className="client-view-page">
      <header className="client-view-header">
        <button type="button" className="btn btn-secondary" onClick={onBack}>
          ← Back
        </button>
        <button type="button" className="btn btn-primary" onClick={onEdit}>
          Edit
        </button>
      </header>

      <div className="client-view-layout">
        <aside className="client-view-sidebar">
          <div className="client-view-profile-card">
            <div className="client-avatar">
              {client.image_url ? (
                <img src={client.image_url} alt={client.full_name || 'Client'} />
              ) : (
                <div className="avatar-placeholder">
                  {(client.full_name || client.email || '?')[0].toUpperCase()}
                </div>
              )}
            </div>
            <h2 className="client-name">{client.full_name || 'No name'}</h2>
            {client.title && <p className="client-title">{client.title}</p>}
            {client.email && (
              <a href={`mailto:${client.email}`} className="client-email">
                {client.email}
              </a>
            )}
            {client.password && (
              <div className="client-password-row">
                <span className="password-masked">••••••••</span>
                <button
                  type="button"
                  className="btn btn-sm btn-copy"
                  onClick={() => {
                    navigator.clipboard.writeText(client.password);
                    toast.success('Password copied');
                  }}
                  title="Copy password"
                >
                  📋
                </button>
              </div>
            )}
            {client.account_state && (
              <div className="client-account-state">
                <span className="account-state-badge">{client.account_state}</span>
              </div>
            )}
            {hasSidebarContact && (
              <div className="client-sidebar-contact">
                {client.phone_number && (
                  <a href={`tel:${client.phone_number}`} className="contact-link">
                    📞 {client.phone_number}
                  </a>
                )}
                {client.country && (
                  <span className="contact-item">📍 {client.country}</span>
                )}
              </div>
            )}
          </div>
        </aside>

        <main className="client-view-main">
          {client.title && (
            <section className="client-view-section">
              <h3>Title</h3>
              <p className="client-text-block">{client.title}</p>
            </section>
          )}

          {client.description && (
            <section className="client-view-section">
              <h3>Description</h3>
              <p className="client-text-block">{client.description}</p>
            </section>
          )}

          {hasContactInfo && (
            <section className="client-view-section">
              <h3>Contact Details</h3>
              <div className="client-details-grid">
                {client.birthday && (
                  <div className="client-detail">
                    <span className="detail-label">Birthday</span>
                    <span className="detail-value">{formatDate(client.birthday)}</span>
                  </div>
                )}
                {client.phone_number && (
                  <div className="client-detail">
                    <span className="detail-label">Phone</span>
                    <a href={`tel:${client.phone_number}`} className="detail-value">
                      {client.phone_number}
                    </a>
                  </div>
                )}
                {client.country && (
                  <div className="client-detail">
                    <span className="detail-label">Country</span>
                    <span className="detail-value">{client.country}</span>
                  </div>
                )}
                {formatAddress(client.address) && (
                  <div className="client-detail full-width">
                    <span className="detail-label">Address</span>
                    <span className="detail-value">{formatAddress(client.address)}</span>
                  </div>
                )}
              </div>
            </section>
          )}

          {formatEducationText(client.education) && (
            <section className="client-view-section">
              <h3>Education</h3>
              <p className="client-text-block">{formatEducationText(client.education)}</p>
            </section>
          )}

          {formatWorkText(client.work_experience) && (
            <section className="client-view-section">
              <h3>Work Experience</h3>
              <p className="client-text-block">{formatWorkText(client.work_experience)}</p>
            </section>
          )}

          {client.tech_stack?.length > 0 && (
            <section className="client-view-section">
              <h3>Tech Stack</h3>
              <div className="client-tech-stack">
                {client.tech_stack.map((t, j) => (
                  <span key={j} className="tech-tag">{t}</span>
                ))}
              </div>
            </section>
          )}

          {client.portfolios?.length > 0 && (
            <section className="client-view-section">
              <h3>Portfolio</h3>
              <div className="client-portfolios">
                {client.portfolios.map((pf, i) => (
                  <div key={i} className="portfolio-item">
                    {pf.images?.length > 0 && (
                      <div className="portfolio-images">
                        {pf.images.map((img, j) => (
                          <img key={j} src={img} alt={pf.title || 'Portfolio'} />
                        ))}
                      </div>
                    )}
                    {pf.title && <h4>{pf.title}</h4>}
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

          {client.proxy_info && (client.proxy_info.type || client.proxy_info.ip || client.proxy_info.username) && (
            <section className="client-view-section">
              <h3>Proxy Info</h3>
              <div className="client-details-grid">
                {client.proxy_info.type && (
                  <div className="client-detail">
                    <span className="detail-label">Type</span>
                    <span className="detail-value">{client.proxy_info.type}</span>
                  </div>
                )}
                {client.proxy_info.timeline && (
                  <div className="client-detail">
                    <span className="detail-label">Timeline</span>
                    <span className="detail-value">{client.proxy_info.timeline}</span>
                  </div>
                )}
                {client.proxy_info.ip && (
                  <div className="client-detail">
                    <span className="detail-label">IP</span>
                    <span className="detail-value">{client.proxy_info.ip}</span>
                  </div>
                )}
                {client.proxy_info.port && (
                  <div className="client-detail">
                    <span className="detail-label">Port</span>
                    <span className="detail-value">{client.proxy_info.port}</span>
                  </div>
                )}
                {client.proxy_info.username && (
                  <div className="client-detail">
                    <span className="detail-label">Username</span>
                    <span className="detail-value">{client.proxy_info.username}</span>
                  </div>
                )}
                {client.proxy_info.password && (
                  <div className="client-detail client-password-detail">
                    <span className="detail-label">Password</span>
                    <span className="detail-value password-masked">••••••••</span>
                    <button
                      type="button"
                      className="btn btn-sm btn-copy"
                      onClick={() => {
                        navigator.clipboard.writeText(client.proxy_info.password);
                        toast.success('Proxy password copied');
                      }}
                      title="Copy"
                    >
                      📋
                    </button>
                  </div>
                )}
              </div>
            </section>
          )}

          {(client.comment || client.summary) && (
            <section className="client-view-section">
              <h3>My Opinion</h3>
              <p className="client-summary-text">{client.comment || client.summary}</p>
            </section>
          )}
        </main>
      </div>
    </div>
  );
};

export default ClientsList;
