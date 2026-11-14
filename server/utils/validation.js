/**
 * Shared validation and sanitization helpers used across backend controllers.
 */

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const LETTERS_ONLY_REGEX = /^[A-Za-z\s]+$/;
const INDIAN_MOBILE_REGEX = /^[6-9]\d{9}$/;

/**
 * Validates standard email format.
 */
const isValidEmail = (value) => {
  if (typeof value !== 'string') return false;
  return EMAIL_REGEX.test(value.trim());
};

/**
 * Validates full name: letters and spaces only, containing at least 3 alphabetic characters.
 */
const isValidFullName = (value) => {
  if (typeof value !== 'string') return false;
  const trimmed = value.trim();
  if (!LETTERS_ONLY_REGEX.test(trimmed)) return false;
  const alphaCount = trimmed.replace(/\s+/g, '').length;
  return alphaCount >= 3;
};

/**
 * Validates a 10-digit Indian mobile number starting with 6, 7, 8, or 9.
 */
const isValidIndianMobile = (value) => {
  if (typeof value !== 'string' && typeof value !== 'number') return false;
  return INDIAN_MOBILE_REGEX.test(String(value).trim());
};

/**
 * Normalizes user-entered URLs so that if 'https://' or 'http://' is omitted,
 * it is automatically prepended without burdening the user.
 */
const normalizeUrl = (value) => {
  if (typeof value !== 'string') return '';
  const trimmed = value.trim();
  if (!trimmed) return '';
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  return `https://${trimmed}`;
};

/**
 * Validates an HTTP or HTTPS URL (with or without leading http(s):// scheme).
 */
const isValidHttpUrl = (value) => {
  if (typeof value !== 'string' || !value.trim()) return false;
  const normalized = normalizeUrl(value);
  try {
    const parsed = new URL(normalized);
    return (
      (parsed.protocol === 'http:' || parsed.protocol === 'https:') &&
      parsed.hostname.includes('.') &&
      parsed.hostname.length >= 3
    );
  } catch {
    return false;
  }
};

/**
 * Escapes HTML special characters before interpolating user values into email HTML templates.
 */
const escapeHtml = (value) => {
  if (value === null || value === undefined) return '';
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
};

module.exports = {
  isValidEmail,
  isValidFullName,
  isValidIndianMobile,
  isValidHttpUrl,
  normalizeUrl,
  escapeHtml,
};

