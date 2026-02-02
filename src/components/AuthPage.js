import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import ThemeToggle from './ThemeToggle';
import './Auth.css';

const AuthPage = () => {
  const [activeTab, setActiveTab] = useState('login');
  const { login, register } = useAuth();

  const handleLogin = async (identifier, password) => {
    await login(identifier, password);
  };

  const handleRegister = async (fullName, username, email, password) => {
    await register(fullName, username, email, password);
  };

  return (
    <div className="auth-page">
      <div className="auth-header-absolute">
        <ThemeToggle />
      </div>
      <div className="auth-card">
        <div className="auth-card-header">
          <h1 className="auth-title">Project Management System</h1>
          <div className="auth-tabs">
            <button
              type="button"
              className={`auth-tab ${activeTab === 'login' ? 'active' : ''}`}
              onClick={() => setActiveTab('login')}
            >
              Sign In
            </button>
            <button
              type="button"
              className={`auth-tab ${activeTab === 'register' ? 'active' : ''}`}
              onClick={() => setActiveTab('register')}
            >
              Register
            </button>
          </div>
        </div>
        <div className="auth-card-body">
          {activeTab === 'login' ? (
            <LoginForm
              onSuccess={handleLogin}
              onSwitchToRegister={() => setActiveTab('register')}
            />
          ) : (
            <RegisterForm
              onSuccess={handleRegister}
              onSwitchToLogin={() => setActiveTab('login')}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
