const ContactMessage = require('../models/ContactMessage');
const { isValidEmail } = require('../utils/validation');
const { sendContactNotificationEmail } = require('../utils/mailer');

/**
 * POST /api/contact
 * Stores a contact inquiry in MongoDB and notifies the Code-a-Nova team via Nodemailer.
 */
const submitContactForm = async (req, res, next) => {
  try {
    const { name, email, message } = req.body;

    if (!name || String(name).trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Please enter your name (at least 2 characters).',
      });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address.',
      });
    }

    if (!message || String(message).trim().length < 10) {
      return res.status(400).json({
        success: false,
        message: 'Message must be at least 10 characters long.',
      });
    }

    const savedMessage = await ContactMessage.create({
      name: String(name).trim(),
      email: String(email).trim().toLowerCase(),
      message: String(message).trim(),
    });

    try {
      await sendContactNotificationEmail({
        name: savedMessage.name,
        email: savedMessage.email,
        message: savedMessage.message,
      });
    } catch (mailError) {
      console.error('[Mailer] Contact notification email failed:', mailError.message);
    }

    return res.status(201).json({
      success: true,
      message: 'Thank you for reaching out. The Code-a-Nova team has received your message.',
      contactId: savedMessage._id,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  submitContactForm,
};

