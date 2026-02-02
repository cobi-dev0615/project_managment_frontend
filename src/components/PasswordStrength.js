import React from 'react';
import { getPasswordStrength } from '../utils/passwordValidation';
import './PasswordStrength.css';

const PasswordStrength = ({ password, showRequirements = false }) => {
  const { score, label, percent } = getPasswordStrength(password);
  const levels = ['', 'weak', 'fair', 'good', 'strong', 'very-strong'];

  return (
    <div className="password-strength">
      {password && (
        <div className="password-strength-bar">
          <div
            className={`password-strength-fill ${levels[score]}`}
            style={{ width: `${percent}%` }}
            role="progressbar"
            aria-valuenow={percent}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        </div>
      )}
      {password && label && (
        <span className={`password-strength-label ${levels[score]}`}>{label}</span>
      )}
      {showRequirements && (
        <ul className="password-requirements">
          <li className={password?.length >= 8 ? 'met' : ''}>Minimum 8 characters</li>
          <li className={/[A-Z]/.test(password || '') ? 'met' : ''}>Uppercase letter</li>
          <li className={/[a-z]/.test(password || '') ? 'met' : ''}>Lowercase letter</li>
          <li className={/\d/.test(password || '') ? 'met' : ''}>Number</li>
          <li className={/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/.test(password || '') ? 'met' : ''}>Special character</li>
        </ul>
      )}
    </div>
  );
};

export default PasswordStrength;
