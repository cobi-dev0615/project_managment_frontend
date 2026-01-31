import React, { useState, useEffect } from 'react';
import { projectsAPI } from '../services/api';
import SearchableSelect from './SearchableSelect';
import './Modal.css';

const ProjectModal = ({ project, types, divisions, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    typeId: '',
    divisionId: '',
    urls: [''],
    shortDescription: '',
    description: '',
    feature: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (project) {
      setFormData({
        typeId: project.typeId,
        divisionId: project.divisionId,
        urls: project.urls && project.urls.length > 0 ? project.urls : [''],
        shortDescription: project.shortDescription || '',
        description: project.description || '',
        feature: project.feature || '',
      });
    }
  }, [project]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleUrlChange = (index, value) => {
    const newUrls = [...formData.urls];
    newUrls[index] = value;
    setFormData(prev => ({ ...prev, urls: newUrls }));
  };

  const handleAddUrl = () => {
    setFormData(prev => ({ ...prev, urls: [...prev.urls, ''] }));
  };

  const handleRemoveUrl = (index) => {
    const newUrls = formData.urls.filter((_, i) => i !== index);
    if (newUrls.length === 0) {
      newUrls.push('');
    }
    setFormData(prev => ({ ...prev, urls: newUrls }));
  };

  const validateURL = (url) => {
    if (!url || url.trim() === '') return true; // URL is optional
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate type and division
    if (!formData.typeId || !formData.divisionId) {
      alert('Type and Division are required');
      return;
    }

    // Validate all URLs
    for (const url of formData.urls) {
      if (url && url.trim() !== '' && !validateURL(url)) {
        alert(`Please enter a valid URL (e.g., https://example.com): ${url}`);
        return;
      }
    }

    // Filter out empty URLs
    const validUrls = formData.urls.filter(url => url && url.trim() !== '');
    const submitData = {
      ...formData,
      urls: validUrls
    };

    setLoading(true);
    try {
      if (project) {
        await projectsAPI.update(project.id, submitData);
      } else {
        await projectsAPI.create(submitData);
      }
      onSave();
    } catch (error) {
      console.error('Error saving project:', error);
      alert(error.response?.data?.error || 'Failed to save project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{project ? 'Edit Project' : 'Create New Project'}</h2>
          <button className="btn-close" onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="typeId">Type *</label>
            <SearchableSelect
              id="typeId"
              name="typeId"
              value={formData.typeId}
              onChange={(val) => setFormData(prev => ({ ...prev, typeId: val }))}
              options={types}
              placeholder="Select a type"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="divisionId">Division *</label>
            <SearchableSelect
              id="divisionId"
              name="divisionId"
              value={formData.divisionId}
              onChange={(val) => setFormData(prev => ({ ...prev, divisionId: val }))}
              options={divisions}
              placeholder="Select a division"
              required
            />
          </div>

          <div className="form-group">
            <div className="form-group-header">
              <label>URLs</label>
              <button
                type="button"
                className="btn-add-url"
                onClick={handleAddUrl}
                title="Add another URL"
              >
                + Add URL
              </button>
            </div>
            {formData.urls.map((url, index) => (
              <div key={index} className="url-input-group">
                <input
                  type="text"
                  value={url}
                  onChange={(e) => handleUrlChange(index, e.target.value)}
                  placeholder="https://example.com"
                  className="url-input"
                />
                {formData.urls.length > 1 && (
                  <button
                    type="button"
                    className="btn-remove-url"
                    onClick={() => handleRemoveUrl(index)}
                    title="Remove URL"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="form-group">
            <label htmlFor="shortDescription">Short Description</label>
            <input
              type="text"
              id="shortDescription"
              name="shortDescription"
              value={formData.shortDescription}
              onChange={handleChange}
              placeholder="Brief project title"
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              placeholder="Detailed project description"
            />
          </div>

          <div className="form-group">
            <label htmlFor="feature">Features</label>
            <textarea
              id="feature"
              name="feature"
              value={formData.feature}
              onChange={handleChange}
              rows="4"
              placeholder="List of project features"
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : project ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProjectModal;
