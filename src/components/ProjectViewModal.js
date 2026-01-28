import React, { useState } from 'react';
import './ProjectViewModal.css';

const ProjectViewModal = ({ project, onClose, onEdit }) => {
  const [copiedField, setCopiedField] = useState(null);

  if (!project) return null;

  const handleCopy = async (text, fieldName) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
      alert('Failed to copy to clipboard');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content view-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Project Details</h2>
          <button className="btn-close" onClick={onClose}>×</button>
        </div>
        
        <div className="view-modal-body">
          <div className="view-section">
            {project.urls && project.urls.length > 0 && (
              <div className="view-row">
                <div className="view-label-row">
                  <div className="view-label">URLs</div>
                </div>
                <div className="view-urls-list">
                  {project.urls.map((url, index) => (
                    <div key={index} className="view-url-item">
                      <div className="view-url-content">
                        <a
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="view-url"
                        >
                          {url}
                        </a>
                      </div>
                      <button
                        className="copy-btn"
                        onClick={() => handleCopy(url, `url-${index}`)}
                        title="Copy URL"
                      >
                        {copiedField === `url-${index}` ? '✓ Copied' : '📋 Copy'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {project.description && (
              <div className="view-row">
                <div className="view-label-row">
                  <div className="view-label">Description</div>
                  <button
                    className="copy-btn"
                    onClick={() => handleCopy(project.description, 'description')}
                    title="Copy description"
                  >
                    {copiedField === 'description' ? '✓ Copied' : '📋 Copy'}
                  </button>
                </div>
                <div className="view-value view-text">{project.description}</div>
              </div>
            )}

            {project.feature && (
              <div className="view-row">
                <div className="view-label-row">
                  <div className="view-label">Features</div>
                  <button
                    className="copy-btn"
                    onClick={() => handleCopy(project.feature, 'feature')}
                    title="Copy features"
                  >
                    {copiedField === 'feature' ? '✓ Copied' : '📋 Copy'}
                  </button>
                </div>
                <div className="view-value view-text">{project.feature}</div>
              </div>
            )}
          </div>
        </div>

        <div className="modal-actions">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
          {onEdit && (
            <button type="button" className="btn btn-primary" onClick={() => {
              onClose();
              onEdit(project);
            }}>
              Edit Project
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectViewModal;
