import nodemailer from 'nodemailer';

let transporter;

function currentCreds() {
  const RAW_MAIL_USER = process.env.MAIL_USER || 'localhands.services@gmail.com';
  const RAW_MAIL_PASS = process.env.MAIL_PASS || '';
  const MAIL_USER = RAW_MAIL_USER.trim();
  const MAIL_PASS = RAW_MAIL_PASS.replace(/\s+/g, '');
  return { MAIL_USER, MAIL_PASS, RAW_MAIL_PASS_LENGTH: RAW_MAIL_PASS.length };
}

export async function sendMail({ to, subject, html, text }) {
  const { MAIL_USER, MAIL_PASS, RAW_MAIL_PASS_LENGTH } = currentCreds();
  if (!MAIL_PASS) {
    console.warn('[mailer] MAIL_PASS missing at send time (raw length=%d) – simulating email', RAW_MAIL_PASS_LENGTH);
    console.log('[mailer:simulate]', { to, subject, text, htmlSnippet: html?.slice(0,120) });
    return { simulated: true };
  }
  if (!transporter) {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: MAIL_USER, pass: MAIL_PASS }
    });
    try {
      await transporter.verify();
      console.log('[mailer] Transport verified with Gmail as %s', MAIL_USER);
    } catch (err) {
      console.error('[mailer] Transport verification failed:', err.message);
    }
  }
  return transporter.sendMail({ from: `LocalHands <${MAIL_USER}>`, to, subject, text, html });
}

export function buildOtpEmail(otp) {
  return {
    subject: 'Your LocalHands Password Reset OTP',
    html: `<div style="font-family:Arial,sans-serif;padding:16px;">
      <h2>Password Reset Request</h2>
      <p>Use the following One-Time Password (OTP) to reset your password. It is valid for <strong>10 minutes</strong>.</p>
      <div style="font-size:32px;font-weight:700;letter-spacing:6px;background:#f5f5f5;padding:12px 20px;display:inline-block;border-radius:8px;">${otp}</div>
      <p style="margin-top:24px;font-size:12px;color:#555;">If you did not request this, you can safely ignore this email.</p>
      <p style="font-size:12px;color:#777;">© ${new Date().getFullYear()} LocalHands</p>
    </div>`,
    text: `Your LocalHands password reset OTP is ${otp} (valid 10 minutes).`
  };
}
