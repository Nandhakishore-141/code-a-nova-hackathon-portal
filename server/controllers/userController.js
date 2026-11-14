const bcrypt = require('bcrypt');
const User = require('../models/User');
const { isValidFullName, isValidIndianMobile } = require('../utils/validation');

/**
 * GET /api/user/me
 * Returns the authenticated user's profile.
 */
const getMyProfile = async (req, res) => {
  return res.status(200).json({
    success: true,
    user: req.user.toSafeObject(),
  });
};

/**
 * PUT /api/user/update
 * Updates authenticated user profile fields (and optionally password).
 */
const updateProfile = async (req, res, next) => {
  try {
    const { fullName, collegeName, mobileNumber, currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id).select('+passwordHash');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User account not found.',
      });
    }

    if (fullName !== undefined) {
      if (!isValidFullName(fullName)) {
        return res.status(400).json({
          success: false,
          message: 'Full name must be at least 3 characters and contain letters only.',
        });
      }
      user.fullName = fullName.trim();
    }

    if (collegeName !== undefined) {
      user.collegeName = String(collegeName).trim();
    }

    if (mobileNumber !== undefined) {
      const cleanedMobile = String(mobileNumber).trim();
      if (cleanedMobile && !isValidIndianMobile(cleanedMobile)) {
        return res.status(400).json({
          success: false,
          message: 'Mobile number must be a valid 10-digit Indian number.',
        });
      }
      user.mobileNumber = cleanedMobile;
    }

    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({
          success: false,
          message: 'Current password is required to set a new password.',
        });
      }

      const isCurrentValid = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!isCurrentValid) {
        return res.status(401).json({
          success: false,
          message: 'Current password is incorrect.',
        });
      }

      if (typeof newPassword !== 'string' || newPassword.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'New password must be at least 6 characters long.',
        });
      }

      user.passwordHash = await bcrypt.hash(newPassword, 10);
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      user: user.toSafeObject(),
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getMyProfile,
  updateProfile,
};

