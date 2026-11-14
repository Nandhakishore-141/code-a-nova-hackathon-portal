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

export const isValidHttpUrl = (value) => {
  if (typeof value !== 'string' || !value.trim()) return false;
  try {
    const url = new URL(value.trim());
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
};

