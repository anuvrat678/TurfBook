import nodemailer from 'nodemailer';

const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

// In services/emailService.js
export const sendVerificationEmail = async (email, token, name) => {
  try {
    const transporter = createTransporter();
    
    const verificationUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/verify-email?token=${encodeURIComponent(token)}`;
    
    console.log('📧 Sending verification email to:', email);
    console.log('🔗 Original token:', token);
    console.log('🔗 Token in URL:', encodeURIComponent(token));
    console.log('🔗 Full verification URL:', verificationUrl);

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Verify Your Email - TurfBook',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #10B981, #059669); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0;">TurfBook</h1>
          </div>
          <div style="padding: 30px; background: #f9fafb;">
            <h2 style="color: #1F2937;">Hi ${name},</h2>
            <p style="color: #6B7280; font-size: 16px; line-height: 1.6;">
              Welcome to TurfBook! Please verify your email address to start booking sports grounds.
            </p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" 
                 style="background: #10B981; color: white; padding: 12px 30px; 
                        text-decoration: none; border-radius: 8px; font-weight: bold;
                        display: inline-block;">
                Verify Email Address
              </a>
            </div>
            <p style="color: #6B7280; font-size: 14px;">
              Or copy and paste this link in your browser:<br>
              <a href="${verificationUrl}" style="color: #10B981;">${verificationUrl}</a>
            </p>
            <p style="color: #6B7280; font-size: 14px;">
              This link will expire in 24 hours.
            </p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('✅ Verification email sent to:', email);
  } catch (error) {
    console.error('❌ Error sending verification email:', error);
    throw new Error('Failed to send verification email');
  }
};
export const sendPasswordResetEmail = async (email, token, name) => {
  try {
    const transporter = createTransporter();
    const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${token}`;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Reset Your Password - TurfBook',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #10B981, #059669); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0;">TurfBook</h1>
          </div>
          <div style="padding: 30px; background: #f9fafb;">
            <h2 style="color: #1F2937;">Hi ${name},</h2>
            <p style="color: #6B7280; font-size: 16px; line-height: 1.6;">
              You requested to reset your password. Click the button below to create a new password.
            </p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" 
                 style="background: #10B981; color: white; padding: 12px 30px; 
                        text-decoration: none; border-radius: 8px; font-weight: bold;
                        display: inline-block;">
                Reset Password
              </a>
            </div>
            <p style="color: #6B7280; font-size: 14px;">
              Or copy and paste this link in your browser:<br>
              <a href="${resetUrl}" style="color: #10B981;">${resetUrl}</a>
            </p>
            <p style="color: #6B7280; font-size: 14px;">
              This link will expire in 1 hour. If you didn't request this, please ignore this email.
            </p>
          </div>
          <div style="background: #1F2937; padding: 20px; text-align: center;">
            <p style="color: #9CA3AF; margin: 0; font-size: 14px;">
              © 2024 TurfBook. All rights reserved.
            </p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('Password reset email sent to:', email);
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw new Error('Failed to send password reset email');
  }
};