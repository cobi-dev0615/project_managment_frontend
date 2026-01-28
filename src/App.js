import React, { useState } from 'react';
import { ThemeProvider } from './contexts/ThemeContext';
import Header from './components/Header';
import ProjectsList from './components/ProjectsList';
import TypesList from './components/TypesList';
import DivisionsList from './components/DivisionsList';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('projects');

  const renderContent = () => {
    switch (activeTab) {
      case 'projects':
        return <ProjectsList />;
      case 'types':
        return <TypesList />;
      case 'divisions':
        return <DivisionsList />;
      default:
        return <ProjectsList />;
    }
  };

  return (
    <ThemeProvider>
      <div className="App">
        <Header activeTab={activeTab} onTabChange={setActiveTab} />
        <main className="main-content">
          {renderContent()}
        </main>
      </div>
    </ThemeProvider>
  );
}

export default App;
