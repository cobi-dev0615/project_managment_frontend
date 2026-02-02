import React, { useState } from 'react';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import AuthPage from './components/AuthPage';
import Header from './components/Header';
import ProjectsList from './components/ProjectsList';
import TypesList from './components/TypesList';
import DivisionsList from './components/DivisionsList';
import ClientsList from './components/ClientsList';
import './App.css';

function AppContent() {
  const [activeTab, setActiveTab] = useState('projects');
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="App">
        <div className="loading-screen">
          <div className="spinner" aria-hidden="true" />
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthPage />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'projects':
        return <ProjectsList />;
      case 'types':
        return <TypesList />;
      case 'divisions':
        return <DivisionsList />;
      case 'clients':
        return <ClientsList />;
      default:
        return <ProjectsList />;
    }
  };

  return (
    <div className="App">
      <Header activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="app-body">
        <main className="main-content">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <AppContent />
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
