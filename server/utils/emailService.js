const nodemailer = require('nodemailer');

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
};

// Send email
const sendEmail = async (to, subject, html, text) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"KGP MessHub" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
      text
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Email sending failed:', error);
    return { success: false, error: error.message };
  }
};

// Send registration approval email
const sendRegistrationApprovalEmail = async (user) => {
  const subject = 'KGP MessHub - Registration Approved';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #3b82f6;">Registration Approved!</h2>
      <p>Dear ${user.name},</p>
      <p>Your registration for KGP MessHub has been approved. You can now access the mess management system for <strong>${user.hallName}</strong>.</p>
      <p>You can login using your email: <strong>${user.email}</strong></p>
      <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #374151;">Your Access Keys:</h3>
        <p><strong>Secret Access Key:</strong> ${user.secretAccessKey}</p>
        <p><strong>Master Key:</strong> ${user.masterKey}</p>
        <p><strong>Complaint Token:</strong> ${user.complaintToken}</p>
        <p style="color: #dc2626; font-size: 14px;"><strong>Important:</strong> Keep these keys secure and do not share them with unauthorized personnel.</p>
      </div>
      <p>Best regards,<br>KGP MessHub Team</p>
    </div>
  `;
  const text = `Registration Approved! Dear ${user.name}, your registration for KGP MessHub has been approved for ${user.hallName}.`;
  
  return await sendEmail(user.email, subject, html, text);
};

// Send registration rejection email
const sendRegistrationRejectionEmail = async (user, reason) => {
  const subject = 'KGP MessHub - Registration Rejected';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #dc2626;">Registration Rejected</h2>
      <p>Dear ${user.name},</p>
      <p>We regret to inform you that your registration for KGP MessHub has been rejected.</p>
      ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
      <p>If you believe this is an error, please contact the administrator.</p>
      <p>Best regards,<br>KGP MessHub Team</p>
    </div>
  `;
  const text = `Registration Rejected. Dear ${user.name}, your registration for KGP MessHub has been rejected.`;
  
  return await sendEmail(user.email, subject, html, text);
};

// Send password reset email
const sendPasswordResetEmail = async (user, resetToken) => {
  const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;
  const subject = 'KGP MessHub - Password Reset';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #3b82f6;">Password Reset Request</h2>
      <p>Dear ${user.name},</p>
      <p>You have requested to reset your password for KGP MessHub.</p>
      <p>Click the link below to reset your password:</p>
      <a href="${resetUrl}" style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Reset Password</a>
      <p>This link will expire in 1 hour.</p>
      <p>If you didn't request this, please ignore this email.</p>
      <p>Best regards,<br>KGP MessHub Team</p>
    </div>
  `;
  const text = `Password Reset Request. Click this link to reset your password: ${resetUrl}`;
  
  return await sendEmail(user.email, subject, html, text);
};

// Send complaint notification email
const sendComplaintNotificationEmail = async (manager, complaint) => {
  const subject = `KGP MessHub - New Complaint: ${complaint.complaintId}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #f59e0b;">New Complaint Received</h2>
      <p>Dear ${manager.name},</p>
      <p>A new complaint has been submitted for your hall: <strong>${manager.hallName}</strong></p>
      <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3>Complaint Details:</h3>
        <p><strong>Complaint ID:</strong> ${complaint.complaintId}</p>
        <p><strong>Student:</strong> ${complaint.studentRollNumber}</p>
        <p><strong>Order ID:</strong> ${complaint.orderBatchId}</p>
        <p><strong>Type:</strong> ${complaint.complaintType}</p>
        <p><strong>Requested Refund:</strong> ₹${complaint.requestedRefund}</p>
        <p><strong>Description:</strong> ${complaint.description}</p>
      </div>
      <p>Please review and take appropriate action.</p>
      <p>Best regards,<br>KGP MessHub Team</p>
    </div>
  `;
  const text = `New Complaint: ${complaint.complaintId} for ${complaint.studentRollNumber}`;
  
  return await sendEmail(manager.email, subject, html, text);
};

module.exports = {
  sendEmail,
  sendRegistrationApprovalEmail,
  sendRegistrationRejectionEmail,
  sendPasswordResetEmail,
  sendComplaintNotificationEmail
};
