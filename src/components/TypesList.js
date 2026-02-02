import React, { useState, useEffect } from 'react';
import { typesAPI } from '../services/api';
import { useToast } from '../contexts/ToastContext';
import ConfirmModal from './ConfirmModal';
import './TypesList.css';

const TypesList = () => {
  const toast = useToast();
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [newName, setNewName] = useState('');
  const [deleteId, setDeleteId] = useState(null);

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
      toast.error('Failed to load types. Please check your connection.');
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
      toast.success('Type added successfully');
    } catch (error) {
      console.error('Error creating type:', error);
      toast.error(error.response?.data?.error || 'Failed to create type');
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
      toast.success('Type updated');
    } catch (error) {
      console.error('Error updating type:', error);
      toast.error(error.response?.data?.error || 'Failed to update type');
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditName('');
  };

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    try {
      await typesAPI.delete(deleteId);
      loadTypes();
      toast.success('Type deleted');
      setDeleteId(null);
    } catch (error) {
      console.error('Error deleting type:', error);
      toast.error(error.response?.data?.error || 'Failed to delete type');
      setDeleteId(null);
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner" aria-hidden="true" />
        <span>Loading types...</span>
      </div>
    );
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
            <div className="empty-state-icon" aria-hidden="true">🏷️</div>
            <h3 className="empty-state-title">No types yet</h3>
            <p className="empty-state-text">Create project types like mobile, web, or automation.</p>
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
                      onClick={() => setDeleteId(type.id)}
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

      <ConfirmModal
        isOpen={!!deleteId}
        title="Delete Type"
        message="Are you sure? This will fail if any projects use this type."
        confirmLabel="Delete"
        variant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
};

export default TypesList;
