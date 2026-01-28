import React, { useState, useEffect } from 'react';
import { divisionsAPI } from '../services/api';
import './TypesList.css';

const DivisionsList = () => {
  const [divisions, setDivisions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [newName, setNewName] = useState('');

  useEffect(() => {
    loadDivisions();
  }, []);

  const loadDivisions = async () => {
    try {
      setLoading(true);
      const response = await divisionsAPI.getAll();
      setDivisions(response.data);
    } catch (error) {
      console.error('Error loading divisions:', error);
      alert('Failed to load divisions. Please check if the backend server is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    
    try {
      await divisionsAPI.create({ name: newName.trim() });
      setNewName('');
      loadDivisions();
    } catch (error) {
      console.error('Error creating division:', error);
      alert(error.response?.data?.error || 'Failed to create division');
    }
  };

  const handleEdit = (division) => {
    setEditingId(division.id);
    setEditName(division.name);
  };

  const handleUpdate = async (id) => {
    if (!editName.trim()) return;
    
    try {
      await divisionsAPI.update(id, { name: editName.trim() });
      setEditingId(null);
      setEditName('');
      loadDivisions();
    } catch (error) {
      console.error('Error updating division:', error);
      alert(error.response?.data?.error || 'Failed to update division');
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditName('');
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this division? This will fail if there are projects using it.')) {
      try {
        await divisionsAPI.delete(id);
        loadDivisions();
      } catch (error) {
        console.error('Error deleting division:', error);
        alert(error.response?.data?.error || 'Failed to delete division');
      }
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="types-list">
      <div className="section-header">
        <h2>Manage Divisions</h2>
        <p className="section-description">Create and manage project divisions (e.g., education, fitness)</p>
      </div>

      <form onSubmit={handleCreate} className="create-form">
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Enter new division name"
          className="input-field"
          required
        />
        <button type="submit" className="btn btn-primary">Add Division</button>
      </form>

      <div className="items-grid">
        {divisions.length === 0 ? (
          <div className="empty-state">
            <p>No divisions found. Create your first division!</p>
          </div>
        ) : (
          divisions.map(division => (
            <div key={division.id} className="item-card">
              {editingId === division.id ? (
                <div className="edit-form">
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="input-field"
                    autoFocus
                  />
                  <div className="edit-actions">
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => handleUpdate(division.id)}
                    >
                      Save
                    </button>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={handleCancel}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="item-content">
                    <h3>{division.name}</h3>
                  </div>
                  <div className="item-actions">
                    <button
                      className="btn-icon"
                      onClick={() => handleEdit(division)}
                      title="Edit"
                    >
                      ✏️
                    </button>
                    <button
                      className="btn-icon"
                      onClick={() => handleDelete(division.id)}
                      title="Delete"
                    >
                      🗑️
                    </button>
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default DivisionsList;
