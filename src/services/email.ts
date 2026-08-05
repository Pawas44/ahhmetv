import nodemailer from 'nodemailer';

const getTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: process.env.SMTP_PORT === '465',
    auth: {
      user: process.env.SMTP_USER || '',
      pass: process.env.SMTP_PASS || '',
    },
  });
};

export async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
  try {
    const transporter = getTransporter();
    await transporter.sendMail({
      from: `"AHHHMETV" <${process.env.EMAIL_FROM || 'noreply@ahhhmetv.com'}>`,
      to,
      subject,
      html,
    });
  } catch (error) {
    console.error('Email sending error:', error);
    throw error;
  }
}

export async function sendVerificationEmail(email: string, token: string) {
  const url = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/verify?token=${token}`;
  const html = `
    <div style="font-family: sans-serif; background-color: #0a0a0f; color: #fff; padding: 40px; border-radius: 12px;">
      <h2 style="color: #7c3aed;">Welcome to AHHHMETV!</h2>
      <p>Confirm your registration by clicking the button below:</p>
      <a href="${url}" style="background-color: #7c3aed; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block; margin-top: 10px;">Verify Account</a>
    </div>
  `;
  await sendEmail({ to: email, subject: 'Verify your AHHHMETV Account', html });
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const url = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`;
  const html = `
    <div style="font-family: sans-serif; background-color: #0a0a0f; color: #fff; padding: 40px; border-radius: 12px;">
      <h2 style="color: #7c3aed;">Reset Your Password</h2>
      <p>Click the link below to change your password:</p>
      <a href="${url}" style="background-color: #7c3aed; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block; margin-top: 10px;">Reset Password</a>
    </div>
  `;
  await sendEmail({ to: email, subject: 'Reset your AHHHMETV Password', html });
}

export async function sendDeleteAccountOTPEmail(email: string, otp: string) {
  const html = `
    <div style="font-family: sans-serif; background-color: #0a0a0f; color: #fff; padding: 40px; border-radius: 12px;">
      <h2 style="color: #ef4444;">Account Deletion Request</h2>
      <p>We received a request to permanently delete your AHHHMETV account.</p>
      <p>Your One-Time Password (OTP) to confirm deletion is:</p>
      <h1 style="color: #ef4444; letter-spacing: 4px; font-size: 32px;">${otp}</h1>
      <p style="color: #9ca3af; font-size: 14px;">If you did not request this, please ignore this email and change your password.</p>
    </div>
  `;
  await sendEmail({ to: email, subject: 'Account Deletion OTP - AHHHMETV', html });
}
