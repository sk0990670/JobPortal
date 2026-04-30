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

const sendJobAlertEmail = async (to, fullName, jobTitle, companyName, jobUrl) => {
  const html = `
    <div style="font-family:Inter,Arial,sans-serif;max-width:520px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;border:1px solid #e5e7eb;">
      <div style="background:linear-gradient(135deg,#4F46E5,#7C3AED);padding:32px;text-align:center;">
        <h1 style="color:#fff;margin:0;font-size:24px;font-weight:800;">JobPortal Alert</h1>
        <p style="color:#c7d2fe;margin:8px 0 0;font-size:14px;">A new job matching your preferences!</p>
      </div>
      <div style="padding:32px;">
        <p style="color:#374151;font-size:16px;margin:0 0 8px;">Hi <strong>${fullName}</strong>,</p>
        <p style="color:#6b7280;font-size:14px;margin:0 0 24px;">We found a new job that matches your profile preferences.</p>
        <div style="background:#f3f4f6;border-radius:12px;padding:24px;text-align:center;margin-bottom:24px;">
          <p style="color:#4F46E5;font-size:20px;font-weight:800;margin:0 0 4px;">${jobTitle}</p>
          <p style="color:#6b7280;font-size:14px;margin:0 0 16px;">at ${companyName}</p>
          <a href="${jobUrl}" style="display:inline-block;background:#4F46E5;color:#fff;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:600;font-size:14px;">View Job Details</a>
        </div>
        <p style="color:#9ca3af;font-size:12px;text-align:center;margin:0;">You can update your email preferences in your account settings.</p>
      </div>
    </div>
  `;

  await transporter.sendMail({
    from: `"JobPortal Alerts" <${process.env.EMAIL_FROM}>`,
    to,
    subject: `New Job Match: ${jobTitle} at ${companyName}`,
    html,
  });
};

const sendSubscriptionEmail = async (to, fullName) => {
  const html = `
    <div style="font-family:Inter,Arial,sans-serif;max-width:520px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;border:1px solid #e5e7eb;">
      <div style="background:linear-gradient(135deg,#4F46E5,#7C3AED);padding:32px;text-align:center;">
        <h1 style="color:#fff;margin:0;font-size:24px;font-weight:800;">Job Alerts Subscribed!</h1>
        <p style="color:#c7d2fe;margin:8px 0 0;font-size:14px;">You'll now receive matches directly in your inbox.</p>
      </div>
      <div style="padding:32px;">
        <p style="color:#374151;font-size:16px;margin:0 0 8px;">Hi <strong>${fullName}</strong>,</p>
        <p style="color:#6b7280;font-size:14px;margin:0 0 24px;">You have successfully subscribed to Job Alerts on JobPortal based on your profile preferences.</p>
        <div style="background:#f3f4f6;border-radius:12px;padding:24px;text-align:center;margin-bottom:24px;">
          <p style="color:#4F46E5;font-size:16px;font-weight:700;margin:0;">Whenever companies post jobs matching your skills, locations, or preferred roles, we'll send them to you!</p>
        </div>
        <p style="color:#9ca3af;font-size:12px;text-align:center;margin:0;">You can change your preferences or unsubscribe at any time in your account settings.</p>
      </div>
    </div>
  `;

  await transporter.sendMail({
    from: `"JobPortal Alerts" <${process.env.EMAIL_FROM}>`,
    to,
    subject: `You're Subscribed! Job Alerts Activated 🚀`,
    html,
  });
};

const sendBatchJobAlertEmail = async (to, fullName, jobs) => {
  const numJobs = jobs.length;
  const headline = numJobs > 1 ? `${numJobs}+ New Jobs Matching Your Profile` : `New Job Matching Your Profile`;

  const jobCards = jobs.slice(0, 3).map(job => `
    <div style="background:#f3f4f6;border-radius:12px;padding:20px;text-align:left;margin-bottom:16px;display:flex;align-items:center;gap:16px;">
      ${job.companyLogo ? `<img src="${job.companyLogo}" alt="${job.companyName}" style="width:48px;height:48px;border-radius:8px;object-fit:contain;background:#fff;padding:4px;" />` : ''}
      <div>
        <h3 style="color:#4F46E5;font-size:18px;font-weight:700;margin:0 0 4px;">${job.title}</h3>
        <p style="color:#4b5563;font-size:14px;margin:0;">${job.companyName}</p>
      </div>
    </div>
  `).join('');

  const extraMsg = numJobs > 3 ? `<p style="text-align:center;color:#6b7280;font-size:14px;margin-bottom:16px;">and ${numJobs - 3} more jobs...</p>` : '';

  const html = `
    <div style="font-family:Inter,Arial,sans-serif;max-width:520px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;border:1px solid #e5e7eb;">
      <div style="background:linear-gradient(135deg,#4F46E5,#7C3AED);padding:32px;text-align:center;">
        <h1 style="color:#fff;margin:0;font-size:24px;font-weight:800;">JobPortal Alerts</h1>
        <p style="color:#c7d2fe;margin:8px 0 0;font-size:14px;">${headline}</p>
      </div>
      <div style="padding:32px;">
        <p style="color:#374151;font-size:16px;margin:0 0 24px;">Hi <strong>${fullName}</strong>,</p>
        
        ${jobCards}
        ${extraMsg}

        <div style="text-align:center;margin-top:24px;">
          <a href="${process.env.FRONTEND_URL}/dashboard" style="display:inline-block;background:#4F46E5;color:#fff;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:600;font-size:14px;">View All Matches</a>
        </div>
        <p style="color:#9ca3af;font-size:12px;text-align:center;margin-top:32px;">You can update your email preferences in your account settings.</p>
      </div>
    </div>
  `;

  await transporter.sendMail({
    from: `"JobPortal Alerts" <${process.env.EMAIL_FROM}>`,
    to,
    subject: `🔥 ${headline}`,
    html,
  });
};

module.exports = { sendOTPEmail, sendJobAlertEmail, sendSubscriptionEmail, sendBatchJobAlertEmail };
