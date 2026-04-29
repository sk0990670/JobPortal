const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host:   process.env.EMAIL_HOST,
  port:   Number(process.env.EMAIL_PORT),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Send OTP email for signup verification
 */
const sendOTPEmail = async (to, fullName, otp) => {
  const html = `
    <div style="font-family:Inter,Arial,sans-serif;max-width:520px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;border:1px solid #e5e7eb;">
      <div style="background:linear-gradient(135deg,#4F46E5,#7C3AED);padding:32px;text-align:center;">
        <h1 style="color:#fff;margin:0;font-size:24px;font-weight:800;">JobPortal</h1>
        <p style="color:#c7d2fe;margin:8px 0 0;font-size:14px;">Verify your email to get started</p>
      </div>
      <div style="padding:32px;">
        <p style="color:#374151;font-size:16px;margin:0 0 8px;">Hi <strong>${fullName}</strong>,</p>
        <p style="color:#6b7280;font-size:14px;margin:0 0 24px;">Use the OTP below to verify your email address. It expires in <strong>10 minutes</strong>.</p>
        <div style="background:#f3f4f6;border-radius:12px;padding:24px;text-align:center;margin-bottom:24px;">
          <p style="color:#6b7280;font-size:12px;font-weight:600;letter-spacing:2px;margin:0 0 8px;text-transform:uppercase;">Your OTP Code</p>
          <p style="color:#4F46E5;font-size:40px;font-weight:800;letter-spacing:12px;margin:0;">${otp}</p>
        </div>
        <p style="color:#9ca3af;font-size:12px;text-align:center;margin:0;">If you didn't create a JobPortal account, you can safely ignore this email.</p>
      </div>
    </div>
  `;

  await transporter.sendMail({
    from: `"JobPortal" <${process.env.EMAIL_FROM}>`,
    to,
    subject: `${otp} is your JobPortal verification code`,
    html,
  });
};

module.exports = { sendOTPEmail };
