import React, { useState, useEffect, useMemo } from 'react';
import { projectsAPI, typesAPI, divisionsAPI } from '../services/api';
import ProjectCard from './ProjectCard';
import ProjectsTable from './ProjectsTable';
import ProjectModal from './ProjectModal';
import ProjectViewModal from './ProjectViewModal';
import SearchableSelect from './SearchableSelect';
import './ProjectsList.css';

const ProjectsList = () => {
  const [projects, setProjects] = useState([]);
  const [types, setTypes] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [viewingProject, setViewingProject] = useState(null);
  const [filterType, setFilterType] = useState('');
  const [filterDivision, setFilterDivision] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [activeSearchQuery, setActiveSearchQuery] = useState('');
  const [activeFilterType, setActiveFilterType] = useState('');
  const [activeFilterDivision, setActiveFilterDivision] = useState('');
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'table'
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    setCurrentPage(1); // Reset to first page when active filters change
  }, [activeFilterType, activeFilterDivision, activeSearchQuery]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [projectsRes, typesRes, divisionsRes] = await Promise.all([
        projectsAPI.getAll(),
        typesAPI.getAll(),
        divisionsAPI.getAll(),
      ]);
      setProjects(projectsRes.data);
      setTypes(typesRes.data);
      setDivisions(divisionsRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
      alert('Failed to load data. Please check if the backend server is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingProject(null);
    setIsModalOpen(true);
  };

  const handleView = (project) => {
    setViewingProject(project);
    setIsViewModalOpen(true);
  };

  const handleEdit = (project) => {
    setEditingProject(project);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        await projectsAPI.delete(id);
        loadData();
      } catch (error) {
        console.error('Error deleting project:', error);
        alert('Failed to delete project');
      }
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingProject(null);
  };

  const handleViewModalClose = () => {
    setIsViewModalOpen(false);
    setViewingProject(null);
  };

  const handleModalSave = () => {
    loadData();
    handleModalClose();
  };

  const handleSearch = () => {
    setActiveFilterType(filterType);
    setActiveFilterDivision(filterDivision);
    setActiveSearchQuery(searchInput);
    setCurrentPage(1);
  };

  const handleClearSearch = () => {
    setFilterType('');
    setFilterDivision('');
    setSearchInput('');
    setActiveFilterType('');
    setActiveFilterDivision('');
    setActiveSearchQuery('');
    setCurrentPage(1);
  };

  // Filter and search projects based on active criteria
  const filteredProjects = useMemo(() => {
    return projects.filter(project => {
      const matchesType = !activeFilterType || project.typeId === parseInt(activeFilterType);
      const matchesDivision = !activeFilterDivision || project.divisionId === parseInt(activeFilterDivision);
      
      // Search in description and features
      const searchLower = activeSearchQuery.toLowerCase();
      const matchesSearch = !activeSearchQuery || 
        (project.description && project.description.toLowerCase().includes(searchLower)) ||
        (project.feature && project.feature.toLowerCase().includes(searchLower));
      
      return matchesType && matchesDivision && matchesSearch;
    });
  }, [projects, activeFilterType, activeFilterDivision, activeSearchQuery]);

  // Pagination
  const totalPages = Math.ceil(filteredProjects.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedProjects = filteredProjects.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="projects-list">
      <div className="projects-header">
        <SearchableSelect
          value={filterType}
          onChange={setFilterType}
          options={types}
          placeholder="All Types"
          allowEmpty
          emptyLabel="All Types"
          className="filter-select"
        />
        
        <SearchableSelect
          value={filterDivision}
          onChange={setFilterDivision}
          options={divisions}
          placeholder="All Divisions"
          allowEmpty
          emptyLabel="All Divisions"
          className="filter-select"
        />

        <div className="search-container">
          <input
            type="text"
            placeholder="Search in description and features..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            className="search-input"
          />
        </div>

        <button className="btn btn-search" onClick={handleSearch} title="Search">
          🔍 Search
        </button>

        <div className="view-toggle">
          <button
            className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => setViewMode('list')}
            title="List view"
          >
            ☰
          </button>
          <button
            className={`view-btn ${viewMode === 'table' ? 'active' : ''}`}
            onClick={() => setViewMode('table')}
            title="Table view"
          >
            ⧉
          </button>
        </div>

        <button className="btn btn-primary" onClick={handleCreate}>
          + New Project
        </button>

        {(activeFilterType || activeFilterDivision || activeSearchQuery) && (
          <button className="btn btn-clear" onClick={handleClearSearch} title="Clear all filters">
            ✕ Clear
          </button>
        )}
      </div>

      {filteredProjects.length === 0 ? (
        <div className="empty-state">
          <p>No projects found. {activeSearchQuery || activeFilterType || activeFilterDivision ? 'Try adjusting your search or filters.' : 'Create your first project!'}</p>
        </div>
      ) : (
        <>
          {viewMode === 'list' ? (
            <div className="projects-grid">
              {paginatedProjects.map(project => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onView={handleView}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          ) : (
            <ProjectsTable
              projects={paginatedProjects}
              onView={handleView}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          )}

          {totalPages > 1 && (
            <div className="pagination">
              <button
                className="pagination-btn"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                ← Previous
              </button>
              <div className="pagination-info">
                Page {currentPage} of {totalPages} ({filteredProjects.length} projects)
              </div>
              <button
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

      {isViewModalOpen && (
        <ProjectViewModal
          project={viewingProject}
          onClose={handleViewModalClose}
          onEdit={handleEdit}
        />
      )}

      {isModalOpen && (
        <ProjectModal
          project={editingProject}
          types={types}
          divisions={divisions}
          onClose={handleModalClose}
          onSave={handleModalSave}
        />
      )}
    </div>
  );
};

export default ProjectsList;
