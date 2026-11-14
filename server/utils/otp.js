const crypto = require('crypto');

const OTP_EXPIRY_MINUTES = 10;
const OTP_EXPIRY_MS = OTP_EXPIRY_MINUTES * 60 * 1000;
const OTP_RESEND_COOLDOWN_MS = 30 * 1000;
const MAX_OTP_ATTEMPTS = 5;

/**
 * Generates a cryptographically random 6-digit numeric OTP string.
 */
const generateOtp = () => crypto.randomInt(100000, 1000000).toString();

/**
 * Hashes an OTP using SHA-256 so raw OTP codes are never stored in MongoDB.
 */
const hashOtp = (otp) => crypto.createHash('sha256').update(String(otp).trim()).digest('hex');

module.exports = {
  OTP_EXPIRY_MINUTES,
  OTP_EXPIRY_MS,
  OTP_RESEND_COOLDOWN_MS,
  MAX_OTP_ATTEMPTS,
  generateOtp,
  hashOtp,
};

