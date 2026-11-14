const crypto = require('crypto');
const mongoose = require('mongoose');
const HackathonRegistration = require('../models/HackathonRegistration');
const {
  isValidFullName,
  isValidEmail,
  isValidIndianMobile,
  isValidHttpUrl,
  normalizeUrl,
} = require('../utils/validation');
const { sendRegistrationConfirmationEmail } = require('../utils/mailer');

/**
 * Generates a readable unique Code-a-Nova registration reference ID.
 */
const generateRegistrationCode = () =>
  `CAN-2026-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

/**
 * POST /api/hackathon/register
 * Validates all 14 registration fields, persists the team entry, and sends confirmation email via Nodemailer.
 */
const registerHackathon = async (req, res, next) => {
  try {
    const existingEntry = await HackathonRegistration.findOne({ userId: req.user._id });
    if (existingEntry) {
      return res.status(409).json({
        success: false,
        message: 'You have already submitted a hackathon registration. View it on your dashboard.',
      });
    }

    const {
      fullName,
      email,
      mobileNumber,
      collegeName,
      course,
      branch,
      yearOfStudy,
      domain,
      projectName,
      pptLink,
      prototypeLink,
      demoVideoLink,
      teamSize,
      teamMembers,
    } = req.body;

    if (!isValidFullName(fullName)) {
      return res.status(400).json({
        success: false,
        message: 'Full name must be at least 3 characters and contain letters only.',
      });
    }

    const resolvedEmail = (email ? String(email) : req.user.email).trim().toLowerCase();
    if (!isValidEmail(resolvedEmail)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address.',
      });
    }

    if (!isValidIndianMobile(mobileNumber)) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid 10-digit Indian mobile number.',
      });
    }

    const requiredDropdowns = [
      { key: 'collegeName', label: 'College name', value: collegeName },
      { key: 'course', label: 'Course', value: course },
      { key: 'branch', label: 'Branch', value: branch },
      { key: 'yearOfStudy', label: 'Year of study', value: yearOfStudy },
      { key: 'domain', label: 'Domain / Track', value: domain },
    ];

    for (const field of requiredDropdowns) {
      if (!field.value || !String(field.value).trim()) {
        return res.status(400).json({
          success: false,
          message: `${field.label} is required.`,
        });
      }
    }

    if (!projectName || String(projectName).trim().length < 5) {
      return res.status(400).json({
        success: false,
        message: 'Project name must be at least 5 characters long.',
      });
    }

    if (!isValidHttpUrl(pptLink)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid link for the PPT (e.g. drive.google.com/...).',
      });
    }

    if (!isValidHttpUrl(prototypeLink)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid link for the Prototype (e.g. github.com/...).',
      });
    }

    const cleanedDemoLink = demoVideoLink ? String(demoVideoLink).trim() : '';
    if (cleanedDemoLink && !isValidHttpUrl(cleanedDemoLink)) {
      return res.status(400).json({
        success: false,
        message: 'Demo video link must be a valid link when provided (e.g. youtube.com/...).',
      });
    }

    const parsedTeamSize = Number(teamSize);
    if (!Number.isInteger(parsedTeamSize) || parsedTeamSize < 1 || parsedTeamSize > 5) {
      return res.status(400).json({
        success: false,
        message: 'Team size must be a whole number between 1 and 5.',
      });
    }

    const expectedTeammateCount = parsedTeamSize - 1;
    const rawMembers = Array.isArray(teamMembers) ? teamMembers : [];

    if (rawMembers.length !== expectedTeammateCount) {
      return res.status(400).json({
        success: false,
        message:
          parsedTeamSize === 1
            ? 'Solo registration (Team Size 1) cannot include additional team members.'
            : `Team size ${parsedTeamSize} requires details for ${expectedTeammateCount} additional teammate(s).`,
      });
    }

    const seenEmails = new Set([resolvedEmail]);
    const sanitizedMembers = [];

    for (let index = 0; index < rawMembers.length; index += 1) {
      const member = rawMembers[index] || {};
      const memberLabel = `Teammate ${index + 1}`;

      if (!isValidFullName(member.memberName)) {
        return res.status(400).json({
          success: false,
          message: `${memberLabel} name must be at least 3 characters and contain letters only.`,
        });
      }

      if (!isValidEmail(member.memberEmail)) {
        return res.status(400).json({
          success: false,
          message: `Please provide a valid email address for ${memberLabel}.`,
        });
      }

      const normalizedMemberEmail = member.memberEmail.trim().toLowerCase();
      if (seenEmails.has(normalizedMemberEmail)) {
        return res.status(400).json({
          success: false,
          message: `Duplicate email detected for ${memberLabel} (${normalizedMemberEmail}). Each team member must use a unique email.`,
        });
      }
      seenEmails.add(normalizedMemberEmail);

      sanitizedMembers.push({
        memberName: member.memberName.trim(),
        memberEmail: normalizedMemberEmail,
      });
    }

    const registration = await HackathonRegistration.create({
      userId: req.user._id,
      registrationCode: generateRegistrationCode(),
      fullName: fullName.trim(),
      email: resolvedEmail,
      mobileNumber: String(mobileNumber).trim(),
      collegeName: String(collegeName).trim(),
      course: String(course).trim(),
      branch: String(branch).trim(),
      yearOfStudy: String(yearOfStudy).trim(),
      domain: String(domain).trim(),
      projectName: String(projectName).trim(),
      pptLink: normalizeUrl(pptLink),
      prototypeLink: normalizeUrl(prototypeLink),
      demoVideoLink: cleanedDemoLink ? normalizeUrl(cleanedDemoLink) : '',
      teamSize: parsedTeamSize,
      teamMembers: sanitizedMembers,
    });

    let emailSent = true;
    try {
      await sendRegistrationConfirmationEmail({
        to: resolvedEmail,
        registration,
      });
    } catch (mailError) {
      emailSent = false;
      console.error('[Mailer] Registration confirmation email failed:', mailError.message);
    }

    return res.status(201).json({
      success: true,
      message: emailSent
        ? 'Hackathon registration submitted! A confirmation email has been sent.'
        : 'Hackathon registration saved, though the confirmation email could not be delivered right now.',
      emailSent,
      registration,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * GET /api/hackathon/my-entry
 * Fetches the authenticated user's hackathon registration if present.
 */
const getMyEntry = async (req, res, next) => {
  try {
    const registration = await HackathonRegistration.findOne({ userId: req.user._id });
    return res.status(200).json({
      success: true,
      registration: registration || null,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * DELETE /api/hackathon/:id
 * Withdraws/deletes a hackathon registration owned by the authenticated user.
 */
const deleteRegistration = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid registration ID.',
      });
    }

    const registration = await HackathonRegistration.findById(id);
    if (!registration) {
      return res.status(404).json({
        success: false,
        message: 'Hackathon registration not found.',
      });
    }

    if (registration.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this registration.',
      });
    }

    await registration.deleteOne();

    return res.status(200).json({
      success: true,
      message: 'Hackathon registration withdrawn successfully.',
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  registerHackathon,
  getMyEntry,
  deleteRegistration,
};

