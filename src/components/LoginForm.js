import React, { useState } from 'react';
import './Auth.css';

const LoginForm = ({ onSuccess, onSwitchToRegister }) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await onSuccess(identifier, password);
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="auth-form">
      <div className="form-group">
        <label htmlFor="login-identifier">Username or Email</label>
        <input
          id="login-identifier"
          type="text"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          placeholder="Enter username or email"
          required
          autoComplete="username"
        />
      </div>

      <div className="form-group">
        <label htmlFor="login-password">Password</label>
        <input
          id="login-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter password"
          required
          autoComplete="current-password"
        />
      </div>

      {error && <div className="auth-error">{error}</div>}

      <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
        {loading ? 'Signing in...' : 'Sign In'}
      </button>

      <p className="auth-switch">
        Don't have an account?{' '}
        <button type="button" className="auth-link" onClick={onSwitchToRegister}>
          Register
        </button>
      </p>
    </form>
  );
};

export default LoginForm;
