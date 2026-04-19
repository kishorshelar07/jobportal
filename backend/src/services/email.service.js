const { getTransporter } = require('../config/email');

const emailTemplates = {
  verifyEmail: (name, otp) => ({
    subject: 'Verify Your JobPortal Account',
    html: `
      <div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; padding: 40px 20px;">
        <div style="background: white; border-radius: 16px; padding: 40px; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
          <div style="text-align: center; margin-bottom: 32px;">
            <div style="width: 60px; height: 60px; background: #1558D6; border-radius: 16px; display: inline-flex; align-items: center; justify-content: center; font-size: 28px; color: white; font-weight: 700;">J</div>
            <h1 style="margin: 16px 0 0; color: #0D2137; font-size: 24px; font-weight: 700;">JobPortal</h1>
          </div>
          <h2 style="color: #0D2137; font-size: 20px; margin-bottom: 8px;">Verify your email address</h2>
          <p style="color: #64748b; margin-bottom: 24px;">Hi ${name}, use the OTP below to verify your account. It expires in <strong>10 minutes</strong>.</p>
          <div style="background: #F0F6FF; border: 2px dashed #1558D6; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 24px;">
            <span style="font-size: 40px; font-weight: 700; letter-spacing: 12px; color: #1558D6;">${otp}</span>
          </div>
          <p style="color: #94a3b8; font-size: 13px;">If you didn't create an account, you can safely ignore this email.</p>
        </div>
      </div>
    `,
  }),

  resetPassword: (name, resetLink) => ({
    subject: 'Reset Your JobPortal Password',
    html: `
      <div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; padding: 40px 20px;">
        <div style="background: white; border-radius: 16px; padding: 40px; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
          <h2 style="color: #0D2137;">Reset Password Request</h2>
          <p style="color: #64748b;">Hi ${name}, click the button below to reset your password. This link is valid for <strong>30 minutes</strong>.</p>
          <a href="${resetLink}" style="display: inline-block; background: #1558D6; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 24px 0;">Reset Password</a>
          <p style="color: #94a3b8; font-size: 13px;">If you didn't request a password reset, please ignore this email.</p>
          <p style="color: #94a3b8; font-size: 12px; word-break: break-all;">Or copy this link: ${resetLink}</p>
        </div>
      </div>
    `,
  }),

  applicationStatusChange: (seekerName, jobTitle, company, newStatus, note) => ({
    subject: `Application Update: ${jobTitle} at ${company}`,
    html: `
      <div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; padding: 40px 20px;">
        <div style="background: white; border-radius: 16px; padding: 40px; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
          <h2 style="color: #0D2137;">Application Status Updated</h2>
          <p style="color: #64748b;">Hi ${seekerName}, your application for <strong>${jobTitle}</strong> at <strong>${company}</strong> has been updated.</p>
          <div style="background: #f0fdf4; border-left: 4px solid #16A34A; padding: 16px 20px; border-radius: 8px; margin: 24px 0;">
            <p style="margin: 0; color: #166534; font-weight: 600;">New Status: ${newStatus.toUpperCase()}</p>
            ${note ? `<p style="margin: 8px 0 0; color: #4b7a4f;">${note}</p>` : ''}
          </div>
          <a href="${process.env.FRONTEND_URL}/applications" style="display: inline-block; background: #1558D6; color: white; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: 600;">View Application</a>
        </div>
      </div>
    `,
  }),
};

const sendEmail = async ({ to, subject, html }) => {
  try {
    const transporter = getTransporter();
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html,
    });
    console.log(`📧 Email sent: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`❌ Email send failed: ${error.message}`);
    return { success: false, error: error.message };
  }
};

const sendVerificationEmail = async (user, otp) => {
  const template = emailTemplates.verifyEmail(user.name, otp);
  return sendEmail({ to: user.email, ...template });
};

const sendPasswordResetEmail = async (user, token) => {
  const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
  const template = emailTemplates.resetPassword(user.name, resetLink);
  return sendEmail({ to: user.email, ...template });
};

const sendStatusChangeEmail = async (seeker, jobTitle, company, newStatus, note) => {
  const template = emailTemplates.applicationStatusChange(seeker.name, jobTitle, company, newStatus, note);
  return sendEmail({ to: seeker.email, ...template });
};

module.exports = {
  sendEmail,
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendStatusChangeEmail,
};
