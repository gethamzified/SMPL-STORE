import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Gmail requires sending from the authenticated email address
// Use a display name but keep the authenticated email as the actual sender
export function getFromAddress(displayName: string = 'SMPL') {
  const email = process.env.SMTP_USER;
  if (!email) return undefined;
  return `"${displayName}" <${email}>`;
}

export default transporter;
