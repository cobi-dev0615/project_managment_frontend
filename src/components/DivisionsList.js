import React, { useState, useEffect } from 'react';
import { divisionsAPI } from '../services/api';
import { useToast } from '../contexts/ToastContext';
import ConfirmModal from './ConfirmModal';
import './TypesList.css';

const DivisionsList = () => {
  const toast = useToast();
  const [divisions, setDivisions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [newName, setNewName] = useState('');
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    loadDivisions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadDivisions = async () => {
    try {
      setLoading(true);
      const response = await divisionsAPI.getAll();
      setDivisions(response.data);
    } catch (error) {
      console.error('Error loading divisions:', error);
      toast.error('Failed to load divisions. Please check your connection.');
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
      toast.success('Division added successfully');
    } catch (error) {
      console.error('Error creating division:', error);
      toast.error(error.response?.data?.error || 'Failed to create division');
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
      toast.success('Division updated');
    } catch (error) {
      console.error('Error updating division:', error);
      toast.error(error.response?.data?.error || 'Failed to update division');
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditName('');
  };

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    try {
      await divisionsAPI.delete(deleteId);
      loadDivisions();
      toast.success('Division deleted');
      setDeleteId(null);
    } catch (error) {
      console.error('Error deleting division:', error);
      toast.error(error.response?.data?.error || 'Failed to delete division');
      setDeleteId(null);
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner" aria-hidden="true" />
        <span>Loading divisions...</span>
      </div>
    );
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
            <div className="empty-state-icon" aria-hidden="true">📂</div>
            <h3 className="empty-state-title">No divisions yet</h3>
            <p className="empty-state-text">Create divisions like education, fitness, or healthcare.</p>
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
                      onClick={() => setDeleteId(division.id)}
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
        title="Delete Division"
        message="Are you sure? This will fail if any projects use this division."
        confirmLabel="Delete"
        variant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
};

export default DivisionsList;
