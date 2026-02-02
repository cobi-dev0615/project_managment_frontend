import React, { useState } from 'react';
import { validatePassword } from '../utils/passwordValidation';
import PasswordStrength from './PasswordStrength';
import './Auth.css';

const RegisterForm = ({ onSuccess, onSwitchToLogin }) => {
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    const pwdErrors = validatePassword(password);
    if (pwdErrors.length > 0) {
      setError(`Password: ${pwdErrors.join('. ')}`);
      return;
    }

    const usernameTrimmed = username.trim().toLowerCase();
    if (!/^[a-z0-9_]+$/.test(usernameTrimmed)) {
      setError('Username can only contain letters, numbers, and underscores');
      return;
    }

    setLoading(true);

    try {
      await onSuccess(fullName, usernameTrimmed, email, password);
      setSuccess('Account created! Check your email to confirm (if enabled) or sign in.');
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="auth-form">
      <div className="form-group">
        <label htmlFor="register-fullName">Full Name</label>
        <input
          id="register-fullName"
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Enter your full name"
          required
          autoComplete="name"
        />
      </div>

      <div className="form-group">
        <label htmlFor="register-username">Username</label>
        <input
          id="register-username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Choose a username"
          required
          autoComplete="username"
        />
      </div>

      <div className="form-group">
        <label htmlFor="register-email">Email</label>
        <input
          id="register-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          required
          autoComplete="email"
        />
      </div>

      <div className="form-group">
        <label htmlFor="register-password">Password</label>
        <input
          id="register-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Min 8 chars, uppercase, lowercase, number, special character"
          required
          minLength={8}
          autoComplete="new-password"
        />
        <PasswordStrength password={password} showRequirements />
      </div>

      <div className="form-group">
        <label htmlFor="register-confirm">Confirm Password</label>
        <input
          id="register-confirm"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Confirm your password"
          required
          minLength={8}
          autoComplete="new-password"
        />
      </div>

      {error && <div className="auth-error">{error}</div>}
      {success && <div className="auth-success">{success}</div>}

      <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
        {loading ? 'Creating account...' : 'Create Account'}
      </button>

      <p className="auth-switch">
        Already have an account?{' '}
        <button type="button" className="auth-link" onClick={onSwitchToLogin}>
          Sign In
        </button>
      </p>
    </form>
  );
};

export default RegisterForm;
