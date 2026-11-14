const nodemailer = require('nodemailer');
const { escapeHtml } = require('./validation');

const SENDER_NAME = 'Code-a-Nova';

/**
 * Determines whether real Gmail SMTP credentials are configured in environment variables.
 */
const hasConfiguredSmtpCredentials = () => {
  const user = process.env.EMAIL_USER?.trim() || '';
  const pass = process.env.EMAIL_PASS?.trim() || '';
  if (!user || !pass) return false;

  const isPlaceholder =
    user.startsWith('your_') ||
    pass.startsWith('your_') ||
    user.includes('example.com') ||
    pass === 'replace_me';

  return !isPlaceholder;
};

/**
 * Creates a Nodemailer transporter using Gmail SMTP when configured,
 * with connection timeouts so requests never hang indefinitely.
 */
const createTransporter = () => {
  if (hasConfiguredSmtpCredentials()) {
    return {
      isLiveSmtp: true,
      transporter: nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER.trim(),
          pass: process.env.EMAIL_PASS.trim(),
        },
        connectionTimeout: 7000, // 7 seconds connection timeout
        greetingTimeout: 7000,
        socketTimeout: 8000,   // 8 seconds socket timeout
      }),
    };
  }

  return {
    isLiveSmtp: false,
    transporter: nodemailer.createTransport({
      jsonTransport: true,
    }),
  };
};

/**
 * Returns the formatted sender header strictly using Code-a-Nova as the sender name.
 */
const getFromHeader = () => {
  const senderAddress = hasConfiguredSmtpCredentials()
    ? process.env.EMAIL_USER.trim()
    : process.env.CONTACT_EMAIL?.trim() || 'noreply@codeanova.dev';
  return `"${SENDER_NAME}" <${senderAddress}>`;
};

/**
 * Wraps email body content in a clean, neutral editorial HTML layout with zero personal developer signatures.
 */
const buildEmailLayout = ({ heading, bodyHtml }) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(heading)}</title>
</head>
<body style="margin:0;padding:24px;background-color:#F8FAFC;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#0F172A;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;margin:0 auto;background-color:#FFFFFF;border:1px solid #E2E8F0;border-radius:8px;overflow:hidden;">
    <tr>
      <td style="padding:20px 28px;border-bottom:1px solid #E2E8F0;background-color:#FFFFFF;">
        <span style="font-size:18px;font-weight:700;letter-spacing:-0.02em;color:#0F172A;">Code-a-Nova</span>
        <span style="display:inline-block;margin-left:8px;padding:2px 8px;font-size:11px;font-weight:600;color:#2563EB;background-color:#EFF6FF;border:1px solid #BFDBFE;border-radius:4px;">Hackathon 2026</span>
      </td>
    </tr>
    <tr>
      <td style="padding:28px;">
        <h1 style="margin:0 0 16px;font-size:20px;font-weight:600;color:#0F172A;">${escapeHtml(heading)}</h1>
        ${bodyHtml}
      </td>
    </tr>
    <tr>
      <td style="padding:16px 28px;border-top:1px solid #E2E8F0;background-color:#F8FAFC;font-size:12px;color:#64748B;line-height:1.5;">
        This is an automated message from <strong>Code-a-Nova</strong>. Please do not reply directly unless specified.
      </td>
    </tr>
  </table>
</body>
</html>
`;

/**
 * Dispatches an email and safely catches timeouts or SMTP failures without crashing requests.
 */
const dispatchMail = async (mailOptions, devSummary) => {
  const { isLiveSmtp, transporter } = createTransporter();

  if (devSummary) {
    console.log(`\n[Mailer] Processing email to: ${mailOptions.to} (${devSummary})`);
  }

  try {
    const info = await transporter.sendMail({
      from: getFromHeader(),
      ...mailOptions,
    });

    if (isLiveSmtp) {
      console.log(`[Mailer] Live email sent to ${mailOptions.to} (Message ID: ${info.messageId})`);
    } else {
      console.log('[Mailer:DevPreview] Live SMTP not configured. OTP printed above.');
    }

    return { isLiveSmtp, messageId: info.messageId, delivered: true };
  } catch (err) {
    console.error(`[Mailer Warning] SMTP delivery failed (${err.message}).`);
    if (devSummary) {
      console.log(`[Mailer Backup] ${devSummary}`);
    }
    return { isLiveSmtp: false, messageId: null, delivered: false, error: err.message };
  }
};

/**
 * Sends a 6-digit verification OTP email with 10-minute validity notice.
 */
const sendOtpEmail = async ({ to, otp }) => {
  const subject = 'Code-a-Nova — Your 6-Digit Verification OTP';
  const text = [
    'Code-a-Nova Email Verification',
    '',
    `Your One-Time Password (OTP) is: ${otp}`,
    'This OTP is valid for 10 minutes and can only be used once.',
    '',
    'If you did not initiate this request, you can safely ignore this email.',
    '',
    '— Code-a-Nova',
  ].join('\n');

  const html = buildEmailLayout({
    heading: 'Verify your email address',
    bodyHtml: `
      <p style="margin:0 0 16px;font-size:14px;line-height:1.6;color:#334155;">
        Use the 6-digit verification code below to activate your <strong>Code-a-Nova</strong> account.
      </p>
      <div style="margin:20px 0;padding:16px 20px;background-color:#F8FAFC;border:1px solid #CBD5E1;border-radius:6px;text-align:center;">
        <span style="font-family:'Courier New',Courier,monospace;font-size:28px;font-weight:700;letter-spacing:8px;color:#0F172A;">${escapeHtml(otp)}</span>
      </div>
      <p style="margin:0 0 8px;font-size:13px;line-height:1.6;color:#475569;">
        This code expires in <strong>10 minutes</strong> and becomes invalid immediately after its first use.
      </p>
      <p style="margin:0;font-size:13px;line-height:1.6;color:#64748B;">
        If you did not create a Code-a-Nova account, no action is required.
      </p>
    `,
  });

  return dispatchMail({ to, subject, text, html }, `OTP Code: ${otp}`);
};

/**
 * Sends a hackathon registration confirmation email containing participant, event, team, domain, and project details.
 */
const sendRegistrationConfirmationEmail = async ({ to, registration }) => {
  const subject = `Code-a-Nova 2026 — Registration Confirmed (${registration.registrationCode})`;

  const teamMemberLines =
    registration.teamSize === 1 || !registration.teamMembers?.length
      ? 'Solo Participant (Team Size: 1)'
      : registration.teamMembers
          .map((m, idx) => `${idx + 1}. ${m.memberName} (${m.memberEmail})`)
          .join('\n');

  const teamMemberRowsHtml =
    registration.teamSize === 1 || !registration.teamMembers?.length
      ? '<p style="margin:0;font-size:13px;color:#334155;">Solo Participation (Team Size: 1)</p>'
      : `<ul style="margin:6px 0 0;padding-left:18px;font-size:13px;color:#334155;line-height:1.6;">
          ${registration.teamMembers
            .map(
              (m) =>
                `<li>${escapeHtml(m.memberName)} &mdash; <span style="color:#475569;">${escapeHtml(m.memberEmail)}</span></li>`
            )
            .join('')}
        </ul>`;

  const text = [
    'Code-a-Nova 2026 — Hackathon Registration Confirmation',
    '',
    `Participant Name: ${registration.fullName}`,
    `Registration ID: ${registration.registrationCode}`,
    'Event: Code-a-Nova Hackathon 2026',
    `Domain / Track: ${registration.domain}`,
    `Project Name: ${registration.projectName}`,
    `College: ${registration.collegeName} (${registration.course}, ${registration.branch}, ${registration.yearOfStudy})`,
    `Team Size: ${registration.teamSize}`,
    'Team Members:',
    teamMemberLines,
    '',
    `PPT Link: ${registration.pptLink}`,
    `Prototype Link: ${registration.prototypeLink}`,
    registration.demoVideoLink ? `Demo Video Link: ${registration.demoVideoLink}` : null,
    '',
    'We look forward to seeing your submission at Code-a-Nova 2026.',
    '— Code-a-Nova',
  ]
    .filter(Boolean)
    .join('\n');

  const html = buildEmailLayout({
    heading: 'Hackathon Registration Confirmed',
    bodyHtml: `
      <p style="margin:0 0 16px;font-size:14px;line-height:1.6;color:#334155;">
        Hello <strong>${escapeHtml(registration.fullName)}</strong>, your entry for <strong>Code-a-Nova Hackathon 2026</strong> has been received and recorded.
      </p>
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;margin:16px 0;border:1px solid #E2E8F0;border-radius:6px;">
        <tr>
          <td style="padding:10px 14px;border-bottom:1px solid #E2E8F0;background-color:#F8FAFC;font-size:12px;font-weight:600;color:#475569;width:36%;">Registration ID</td>
          <td style="padding:10px 14px;border-bottom:1px solid #E2E8F0;font-size:13px;font-family:'Courier New',Courier,monospace;font-weight:600;color:#0F172A;">${escapeHtml(registration.registrationCode)}</td>
        </tr>
        <tr>
          <td style="padding:10px 14px;border-bottom:1px solid #E2E8F0;background-color:#F8FAFC;font-size:12px;font-weight:600;color:#475569;">Event</td>
          <td style="padding:10px 14px;border-bottom:1px solid #E2E8F0;font-size:13px;color:#0F172A;">Code-a-Nova Hackathon 2026</td>
        </tr>
        <tr>
          <td style="padding:10px 14px;border-bottom:1px solid #E2E8F0;background-color:#F8FAFC;font-size:12px;font-weight:600;color:#475569;">Participant Name</td>
          <td style="padding:10px 14px;border-bottom:1px solid #E2E8F0;font-size:13px;color:#0F172A;">${escapeHtml(registration.fullName)}</td>
        </tr>
        <tr>
          <td style="padding:10px 14px;border-bottom:1px solid #E2E8F0;background-color:#F8FAFC;font-size:12px;font-weight:600;color:#475569;">Domain / Track</td>
          <td style="padding:10px 14px;border-bottom:1px solid #E2E8F0;font-size:13px;color:#0F172A;">${escapeHtml(registration.domain)}</td>
        </tr>
        <tr>
          <td style="padding:10px 14px;border-bottom:1px solid #E2E8F0;background-color:#F8FAFC;font-size:12px;font-weight:600;color:#475569;">Project Name</td>
          <td style="padding:10px 14px;border-bottom:1px solid #E2E8F0;font-size:13px;font-weight:600;color:#0F172A;">${escapeHtml(registration.projectName)}</td>
        </tr>
        <tr>
          <td style="padding:10px 14px;border-bottom:1px solid #E2E8F0;background-color:#F8FAFC;font-size:12px;font-weight:600;color:#475569;">Team Size</td>
          <td style="padding:10px 14px;border-bottom:1px solid #E2E8F0;font-size:13px;color:#0F172A;">${escapeHtml(registration.teamSize)}</td>
        </tr>
        <tr>
          <td style="padding:10px 14px;background-color:#F8FAFC;font-size:12px;font-weight:600;color:#475569;vertical-align:top;">Team Details</td>
          <td style="padding:10px 14px;">${teamMemberRowsHtml}</td>
        </tr>
      </table>
      <p style="margin:16px 0 0;font-size:13px;line-height:1.6;color:#475569;">
        You can review your submission status anytime from your <strong>Code-a-Nova</strong> dashboard.
      </p>
    `,
  });

  return dispatchMail(
    { to, subject, text, html },
    `Confirmation sent for ${registration.registrationCode} (${registration.projectName})`
  );
};

/**
 * Sends contact form inquiries to the configured Code-a-Nova project email.
 */
const sendContactNotificationEmail = async ({ name, email, message }) => {
  const recipient =
    (hasConfiguredSmtpCredentials() ? process.env.EMAIL_USER?.trim() : null) ||
    process.env.CONTACT_EMAIL?.trim() ||
    'contact@codeanova.dev';

  const subject = `Code-a-Nova Contact Inquiry from ${name}`;
  const text = [
    'New Contact Form Message — Code-a-Nova',
    '',
    `Sender Name: ${name}`,
    `Sender Email: ${email}`,
    '',
    'Message:',
    message,
  ].join('\n');

  const html = buildEmailLayout({
    heading: 'New Contact Inquiry',
    bodyHtml: `
      <p style="margin:0 0 12px;font-size:14px;color:#334155;">
        <strong>From:</strong> ${escapeHtml(name)} (${escapeHtml(email)})
      </p>
      <div style="padding:14px 16px;background-color:#F8FAFC;border:1px solid #E2E8F0;border-radius:6px;font-size:14px;line-height:1.6;color:#0F172A;white-space:pre-wrap;">${escapeHtml(message)}</div>
    `,
  });

  return dispatchMail(
    { to: recipient, replyTo: email, subject, text, html },
    `Contact inquiry from ${name} <${email}>`
  );
};

module.exports = {
  sendOtpEmail,
  sendRegistrationConfirmationEmail,
  sendContactNotificationEmail,
};

