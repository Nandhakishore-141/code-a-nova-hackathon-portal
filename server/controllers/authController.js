const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { getJwtSecret } = require('../middleware/authMiddleware');
const { isValidEmail, isValidFullName } = require('../utils/validation');
const {
  OTP_EXPIRY_MS,
  OTP_RESEND_COOLDOWN_MS,
  MAX_OTP_ATTEMPTS,
  generateOtp,
  hashOtp,
} = require('../utils/otp');
const { sendOtpEmail } = require('../utils/mailer');

/**
 * POST /api/auth/signup
 * Creates an unverified user account (or refreshes OTP for an unverified email) and emails a 6-digit OTP.
 */
const signup = async (req, res, next) => {
  try {
    const { fullName, email, password, confirmPassword } = req.body;

    if (!isValidFullName(fullName)) {
      return res.status(400).json({
        success: false,
        message: 'Full name must be at least 3 characters and contain letters only.',
      });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address.',
      });
    }

    if (typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.',
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Password and confirm password do not match.',
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser && existingUser.isVerified) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email is already verified. Please log in.',
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const otp = generateOtp();
    const otpHash = hashOtp(otp);
    const otpExpiresAt = new Date(Date.now() + OTP_EXPIRY_MS);
    const now = new Date();

    if (existingUser) {
      existingUser.fullName = fullName.trim();
      existingUser.passwordHash = passwordHash;
      existingUser.otpHash = otpHash;
      existingUser.otpExpiresAt = otpExpiresAt;
      existingUser.otpAttempts = 0;
      existingUser.lastOtpSentAt = now;
      await existingUser.save();
    } else {
      await User.create({
        fullName: fullName.trim(),
        email: normalizedEmail,
        passwordHash,
        isVerified: false,
        otpHash,
        otpExpiresAt,
        otpAttempts: 0,
        lastOtpSentAt: now,
      });
    }

    let mailResult = { delivered: false };
    try {
      mailResult = await sendOtpEmail({ to: normalizedEmail, otp });
    } catch (mailErr) {
      console.error('[Auth] Failed to send OTP email:', mailErr.message);
    }

    return res.status(201).json({
      success: true,
      message: mailResult?.delivered
        ? 'Account created. A 6-digit OTP has been sent to your email (valid for 10 minutes).'
        : `Account created. (Note: Render free tier blocks outbound SMTP. Your verification OTP is: ${otp})`,
      email: normalizedEmail,
      devOtp: mailResult?.delivered ? undefined : otp,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * POST /api/auth/verify-otp
 * Verifies the 6-digit OTP (10-minute expiry), activates the user account, and invalidates the OTP.
 */
const verifyOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    if (!isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address.',
      });
    }

    const cleanedOtp = String(otp || '').trim();
    if (!/^\d{6}$/.test(cleanedOtp)) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid 6-digit numeric OTP.',
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail }).select(
      '+otpHash +otpExpiresAt +otpAttempts'
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No account found for this email address.',
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: 'This account is already verified. Please proceed to login.',
      });
    }

    if (!user.otpHash || !user.otpExpiresAt) {
      return res.status(400).json({
        success: false,
        message: 'No active OTP found. Please request a new OTP.',
      });
    }

    if (user.otpExpiresAt.getTime() < Date.now()) {
      user.otpHash = undefined;
      user.otpExpiresAt = undefined;
      user.otpAttempts = 0;
      await user.save();

      return res.status(400).json({
        success: false,
        message: 'This OTP has expired (10-minute limit). Please request a new OTP.',
      });
    }

    if (user.otpAttempts >= MAX_OTP_ATTEMPTS) {
      user.otpHash = undefined;
      user.otpExpiresAt = undefined;
      user.otpAttempts = 0;
      await user.save();

      return res.status(429).json({
        success: false,
        message: 'Too many invalid attempts. Please request a new OTP.',
      });
    }

    if (hashOtp(cleanedOtp) !== user.otpHash) {
      user.otpAttempts += 1;
      await user.save();

      return res.status(400).json({
        success: false,
        message: 'Incorrect OTP code. Please verify and try again.',
      });
    }

    // Activate account and invalidate OTP immediately so it cannot be reused
    user.isVerified = true;
    user.otpHash = undefined;
    user.otpExpiresAt = undefined;
    user.otpAttempts = 0;
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Email verified successfully. You can now log in to your account.',
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * POST /api/auth/resend-otp
 * Generates and emails a fresh 6-digit OTP for unverified accounts with cooldown protection.
 */
const resendOtp = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address.',
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail }).select('+lastOtpSentAt');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No account found for this email address.',
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: 'Your account is already verified. Please log in.',
      });
    }

    if (user.lastOtpSentAt) {
      const elapsedMs = Date.now() - user.lastOtpSentAt.getTime();
      if (elapsedMs < OTP_RESEND_COOLDOWN_MS) {
        const waitSeconds = Math.ceil((OTP_RESEND_COOLDOWN_MS - elapsedMs) / 1000);
        return res.status(429).json({
          success: false,
          message: `Please wait ${waitSeconds} seconds before requesting another OTP.`,
        });
      }
    }

    const otp = generateOtp();
    user.otpHash = hashOtp(otp);
    user.otpExpiresAt = new Date(Date.now() + OTP_EXPIRY_MS);
    user.otpAttempts = 0;
    user.lastOtpSentAt = new Date();
    await user.save();

    let mailResult = { delivered: false };
    try {
      mailResult = await sendOtpEmail({ to: normalizedEmail, otp });
    } catch (mailErr) {
      console.error('[Auth] Failed to send OTP email:', mailErr.message);
    }

    return res.status(200).json({
      success: true,
      message: mailResult?.delivered
        ? 'A fresh 6-digit OTP has been sent to your email address.'
        : `A fresh OTP was generated. (Note: Render free tier blocks outbound SMTP. OTP: ${otp})`,
      devOtp: mailResult?.delivered ? undefined : otp,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * POST /api/auth/login
 * Authenticates verified users with bcrypt.compare() and issues a signed JWT.
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!isValidEmail(email) || typeof password !== 'string' || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.',
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail }).select('+passwordHash');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        code: 'ACCOUNT_NOT_VERIFIED',
        message: 'Account not verified. Please verify your email using the 6-digit OTP.',
        email: user.email,
      });
    }

    const token = jwt.sign(
      { id: user._id.toString(), email: user.email },
      getJwtSecret(),
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    return res.status(200).json({
      success: true,
      message: 'Login successful.',
      token,
      user: user.toSafeObject(),
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  signup,
  verifyOtp,
  resendOtp,
  login,
};

