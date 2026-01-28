import React, { useState, useEffect } from 'react';
import { typesAPI } from '../services/api';
import './TypesList.css';

const TypesList = () => {
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [newName, setNewName] = useState('');

  useEffect(() => {
    loadTypes();
  }, []);

  const loadTypes = async () => {
    try {
      setLoading(true);
      const response = await typesAPI.getAll();
      setTypes(response.data);
    } catch (error) {
      console.error('Error loading types:', error);
      alert('Failed to load types. Please check if the backend server is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    
    try {
      await typesAPI.create({ name: newName.trim() });
      setNewName('');
      loadTypes();
    } catch (error) {
      console.error('Error creating type:', error);
      alert(error.response?.data?.error || 'Failed to create type');
    }
  };

  const handleEdit = (type) => {
    setEditingId(type.id);
    setEditName(type.name);
  };

  const handleUpdate = async (id) => {
    if (!editName.trim()) return;
    
    try {
      await typesAPI.update(id, { name: editName.trim() });
      setEditingId(null);
      setEditName('');
      loadTypes();
    } catch (error) {
      console.error('Error updating type:', error);
      alert(error.response?.data?.error || 'Failed to update type');
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditName('');
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this type? This will fail if there are projects using it.')) {
      try {
        await typesAPI.delete(id);
        loadTypes();
      } catch (error) {
        console.error('Error deleting type:', error);
        alert(error.response?.data?.error || 'Failed to delete type');
      }
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="types-list">
      <div className="section-header">
        <h2>Manage Types</h2>
        <p className="section-description">Create and manage project types (e.g., mobile, web, automation)</p>
      </div>

      <form onSubmit={handleCreate} className="create-form">
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Enter new type name"
          className="input-field"
          required
        />
        <button type="submit" className="btn btn-primary">Add Type</button>
      </form>

      <div className="items-grid">
        {types.length === 0 ? (
          <div className="empty-state">
            <p>No types found. Create your first type!</p>
          </div>
        ) : (
          types.map(type => (
            <div key={type.id} className="item-card">
              {editingId === type.id ? (
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
                      onClick={() => handleUpdate(type.id)}
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
                    <h3>{type.name}</h3>
                  </div>
                  <div className="item-actions">
                    <button
                      className="btn-icon"
                      onClick={() => handleEdit(type)}
                      title="Edit"
                    >
                      ✏️
                    </button>
                    <button
                      className="btn-icon"
                      onClick={() => handleDelete(type.id)}
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

export default TypesList;
