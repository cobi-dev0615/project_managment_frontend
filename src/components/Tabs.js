import React from 'react';
import './Tabs.css';

const Tabs = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'projects', label: 'Projects' },
    { id: 'types', label: 'Types' },
    { id: 'divisions', label: 'Divisions' },
  ];

  return (
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
  );
};

export default Tabs;
