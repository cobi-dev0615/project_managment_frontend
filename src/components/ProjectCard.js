import React, { useState } from 'react';
import './ProjectCard.css';

const ProjectCard = ({ project, onView, onEdit, onDelete }) => {
  const [copiedField, setCopiedField] = useState(null);

  const handleCopy = async (text, fieldName) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
      alert('Failed to copy to clipboard');
    }
  };

  return (
    <div className="project-card">
      <div className="project-card-header">
        <div className="project-badges">
          <span className="badge badge-type">{project.type?.name}</span>
          <span className="badge badge-division">{project.division?.name}</span>
        </div>
        <div className="project-actions">
          <button className="btn-icon" onClick={() => onView(project)} title="View">
            👁️
          </button>
          <button className="btn-icon" onClick={() => onEdit(project)} title="Edit">
            ✏️
          </button>
          <button className="btn-icon" onClick={() => onDelete(project.id)} title="Delete">
            🗑️
          </button>
        </div>
      </div>
      
      <div className="project-card-body">
        {project.shortDescription && (
          <h3 className="project-title">{project.shortDescription}</h3>
        )}
        {project.description && (
          <div className="project-copyable">
            <p className="project-description">{project.description}</p>
            <button
              type="button"
              className="btn-copy"
              onClick={(e) => { e.stopPropagation(); handleCopy(project.description, 'description'); }}
              title="Copy description"
            >
              {copiedField === 'description' ? '✓ Copied' : '📋 Copy'}
            </button>
          </div>
        )}
        {project.urls && project.urls.length > 0 && (
          <div className="project-urls">
            {project.urls.map((url, index) => (
              <div key={index} className="project-url-row">
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="project-url"
                >
                  🔗 Visit {project.urls.length > 1 ? `(${index + 1})` : 'Project'}
                </a>
                <button
                  type="button"
                  className="btn-copy"
                  onClick={(e) => { e.stopPropagation(); handleCopy(url, `url-${index}`); }}
                  title="Copy URL"
                >
                  {copiedField === `url-${index}` ? '✓ Copied' : '📋 Copy'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {project.feature && (
        <div className="project-card-footer">
          <div className="project-feature">
            <strong>Features:</strong>
            <div className="project-copyable">
              <p>{project.feature}</p>
              <button
                type="button"
                className="btn-copy"
                onClick={(e) => { e.stopPropagation(); handleCopy(project.feature, 'feature'); }}
                title="Copy features"
              >
                {copiedField === 'feature' ? '✓ Copied' : '📋 Copy'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectCard;
