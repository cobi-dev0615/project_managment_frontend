import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import ThemeToggle from './ThemeToggle';
import './Header.css';

const Header = ({ activeTab, onTabChange }) => {
  const { user, logout } = useAuth();

  const displayName = user?.user_metadata?.full_name
    || user?.user_metadata?.username
    || user?.email
    || 'User';

  const tabs = [
    { id: 'projects', label: 'Projects' },
    { id: 'types', label: 'Types' },
    { id: 'divisions', label: 'Divisions' },
    { id: 'clients', label: 'Clients' },
  ];

  return (
    <aside className="sidebar">
      <h1 className="sidebar-title">Project Management System</h1>
      <nav className="sidebar-nav" role="navigation">
        {tabs.map(tab => (
          <button
            key={tab.id}
            type="button"
            className={`sidebar-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => onTabChange(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </nav>
      <div className="sidebar-footer">
        <span className="sidebar-user" title={displayName}>{displayName}</span>
        <ThemeToggle />
        <button
          type="button"
          className="btn-logout"
          onClick={logout}
          title="Sign out"
        >
          Sign Out
        </button>
      </div>
    </aside>
  );
};

export default Header;
