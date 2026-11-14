const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const LETTERS_ONLY_REGEX = /^[A-Za-z\s]+$/;
const INDIAN_MOBILE_REGEX = /^[6-9]\d{9}$/;

export const isValidEmail = (value) =>
  typeof value === 'string' && EMAIL_REGEX.test(value.trim());

export const isValidFullName = (value) => {
  if (typeof value !== 'string') return false;
  const trimmed = value.trim();
  if (!LETTERS_ONLY_REGEX.test(trimmed)) return false;
  return trimmed.replace(/\s+/g, '').length >= 3;
};

export const isValidIndianMobile = (value) =>
  typeof value === 'string' && INDIAN_MOBILE_REGEX.test(value.trim());

export const normalizeUrl = (value) => {
  if (typeof value !== 'string') return '';
  const trimmed = value.trim();
  if (!trimmed) return '';
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  return `https://${trimmed}`;
};

export const isValidHttpUrl = (value) => {
  if (typeof value !== 'string' || !value.trim()) return false;
  const normalized = normalizeUrl(value);
  try {
    const url = new URL(normalized);
    return (
      (url.protocol === 'http:' || url.protocol === 'https:') &&
      url.hostname.includes('.') &&
      url.hostname.length >= 3
    );
  } catch {
    return false;
  }
};

