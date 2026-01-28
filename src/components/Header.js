import React from 'react';
import ThemeToggle from './ThemeToggle';
import './Header.css';

const Header = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'projects', label: 'Projects' },
    { id: 'types', label: 'Types' },
    { id: 'divisions', label: 'Divisions' },
  ];

  return (
    <header className="header">
      <div className="header-content">
        <div className="header-left">
          <h1 className="header-title">Project Management System</h1>
          <div className="tabs">
            {tabs.map(tab => (
              <button
                key={tab.id}
                className={`tab ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => onTabChange(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
        <ThemeToggle />
      </div>
    </header>
  );
};

export default Header;
