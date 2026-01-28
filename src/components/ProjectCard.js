import React from 'react';
import './ProjectCard.css';

const ProjectCard = ({ project, onView, onEdit, onDelete }) => {
  return (
    <div className="project-card">
      <div className="project-card-header">
        <div className="project-badges">
          <span className="badge badge-type">{project.type.name}</span>
          <span className="badge badge-division">{project.division.name}</span>
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
          <p className="project-description">{project.description}</p>
        )}
        {project.urls && project.urls.length > 0 && (
          <div className="project-urls">
            {project.urls.map((url, index) => (
              <a
                key={index}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="project-url"
              >
                🔗 Visit {project.urls.length > 1 ? `(${index + 1})` : 'Project'}
              </a>
            ))}
          </div>
        )}
      </div>
      
      {project.feature && (
        <div className="project-card-footer">
          <div className="project-feature">
            <strong>Features:</strong>
            <p>{project.feature}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectCard;
