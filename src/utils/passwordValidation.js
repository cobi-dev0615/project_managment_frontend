const MIN_LENGTH = 8;
const HAS_UPPERCASE = /[A-Z]/;
const HAS_LOWERCASE = /[a-z]/;
const HAS_NUMBER = /\d/;
const HAS_SPECIAL = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/;

export const passwordRequirements = {
  minLength: MIN_LENGTH,
  hasUppercase: 'At least one uppercase letter',
  hasLowercase: 'At least one lowercase letter',
  hasNumber: 'At least one number',
  hasSpecial: 'At least one special character (!@#$%^&*...)',
};

export function validatePassword(password) {
  const errors = [];
  if (!password || password.length < MIN_LENGTH) {
    errors.push(`Minimum ${MIN_LENGTH} characters`);
  }
  if (!HAS_UPPERCASE.test(password)) {
    errors.push(passwordRequirements.hasUppercase);
  }
  if (!HAS_LOWERCASE.test(password)) {
    errors.push(passwordRequirements.hasLowercase);
  }
  if (!HAS_NUMBER.test(password)) {
    errors.push(passwordRequirements.hasNumber);
  }
  if (!HAS_SPECIAL.test(password)) {
    errors.push(passwordRequirements.hasSpecial);
  }
  return errors;
}

export function getPasswordStrength(password) {
  if (!password) return { score: 0, label: '', percent: 0 };
  let score = 0;
  if (password.length >= MIN_LENGTH) score++;
  if (password.length >= 12) score++;
  if (HAS_UPPERCASE.test(password)) score++;
  if (HAS_LOWERCASE.test(password)) score++;
  if (HAS_NUMBER.test(password)) score++;
  if (HAS_SPECIAL.test(password)) score++;

  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong'];
  const percent = Math.min(100, (score / 6) * 100);
  return { score, label: labels[score], percent };
}

export function isPasswordStrong(password) {
  return validatePassword(password).length === 0;
}
