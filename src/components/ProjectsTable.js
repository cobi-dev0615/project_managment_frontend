import React from 'react';
import './ProjectsTable.css';

const ProjectsTable = ({ projects, onView, onEdit, onDelete }) => {
  if (projects.length === 0) {
    return (
      <div className="empty-state">
        <p>No projects found.</p>
      </div>
    );
  }

  return (
    <div className="projects-table-container">
      <table className="projects-table">
        <thead>
          <tr>
            <th>Type</th>
            <th>Division</th>
            <th>Short Description</th>
            <th>Description</th>
            <th>Features</th>
            <th>URL</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {projects.map(project => (
            <tr key={project.id}>
              <td>
                <span className="badge badge-type">{project.type.name}</span>
              </td>
              <td>
                <span className="badge badge-division">{project.division.name}</span>
              </td>
              <td>{project.shortDescription || '-'}</td>
              <td className="table-description">
                {project.description ? (
                  <div className="truncate-text" title={project.description}>
                    {project.description}
                  </div>
                ) : '-'}
              </td>
              <td className="table-features">
                {project.feature ? (
                  <div className="truncate-text" title={project.feature}>
                    {project.feature}
                  </div>
                ) : '-'}
              </td>
              <td>
                {project.urls && project.urls.length > 0 ? (
                  <div className="table-urls">
                    {project.urls.map((url, index) => (
                      <a
                        key={index}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="table-url"
                      >
                        🔗 {project.urls.length > 1 ? `${index + 1}` : 'Visit'}
                      </a>
                    ))}
                  </div>
                ) : '-'}
              </td>
              <td>
                <div className="table-actions">
                  <button
                    className="btn-icon"
                    onClick={() => onView(project)}
                    title="View"
                  >
                    👁️
                  </button>
                  <button
                    className="btn-icon"
                    onClick={() => onEdit(project)}
                    title="Edit"
                  >
                    ✏️
                  </button>
                  <button
                    className="btn-icon"
                    onClick={() => onDelete(project.id)}
                    title="Delete"
                  >
                    🗑️
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProjectsTable;
