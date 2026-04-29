const Subscriber = require('../models/Subscriber');
const nodemailer = require('nodemailer');

/* ── Nodemailer transporter ── */
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/* ── POST /api/subscribers/subscribe ── */
exports.subscribe = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'Email is required.' });

    const existing = await Subscriber.findOne({ email });
    if (existing) {
      if (existing.active) return res.status(200).json({ success: true, message: 'Already subscribed!' });
      existing.active = true;
      await existing.save();
      return res.status(200).json({ success: true, message: 'Re-subscribed successfully!' });
    }

    await Subscriber.create({ email });

    /* Welcome email */
    await transporter.sendMail({
      from: `"JobPortal Resources" <${process.env.EMAIL_FROM}>`,
      to: email,
      subject: '🎉 You\'re subscribed to JobPortal Resources!',
      html: `
        <div style="font-family:Inter,sans-serif;max-width:560px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;">
          <div style="background:linear-gradient(135deg,#6366f1,#8b5cf6);padding:32px 24px;text-align:center;">
            <h1 style="color:#fff;margin:0;font-size:24px;">Welcome aboard! 🚀</h1>
            <p style="color:#e0e7ff;margin:8px 0 0;">You're now subscribed to JobPortal Resources</p>
          </div>
          <div style="padding:28px 24px;">
            <p style="color:#374151;font-size:15px;">Hi there! 👋</p>
            <p style="color:#6b7280;font-size:14px;line-height:1.6;">
              You'll receive email notifications whenever our admin publishes new resources — career guides, resume tips, interview prep, and more.
            </p>
            <div style="background:#f5f3ff;border-radius:8px;padding:16px;margin:20px 0;">
              <p style="color:#7c3aed;font-weight:600;margin:0 0 4px;">What to expect:</p>
              <ul style="color:#6b7280;font-size:13px;margin:0;padding-left:18px;">
                <li>New article notifications</li>
                <li>Career tips &amp; guides</li>
                <li>Interview prep resources</li>
                <li>Industry insights</li>
              </ul>
            </div>
            <p style="color:#9ca3af;font-size:12px;margin-top:24px;">
              Don't want emails? <a href="${process.env.FRONTEND_URL}/resources?unsubscribe=${email}" style="color:#6366f1;">Unsubscribe</a>
            </p>
          </div>
        </div>
      `,
    });

    res.status(201).json({ success: true, message: 'Subscribed! Check your email for confirmation.' });
  } catch (err) {
    console.error('Subscribe error:', err);
    res.status(500).json({ success: false, message: 'Subscription failed. Please try again.' });
  }
};

/* ── POST /api/subscribers/unsubscribe ── */
exports.unsubscribe = async (req, res) => {
  try {
    const { email } = req.body;
    const sub = await Subscriber.findOne({ email });
    if (!sub) return res.status(404).json({ success: false, message: 'Email not found.' });
    sub.active = false;
    await sub.save();
    res.json({ success: true, message: 'Unsubscribed successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to unsubscribe.' });
  }
};

/* ── Notify all active subscribers (called by resource controller) ── */
exports.notifySubscribers = async (resource) => {
  try {
    const subscribers = await Subscriber.find({ active: true });
    if (!subscribers.length) return;

    const emails = subscribers.map(s => s.email);

    await transporter.sendMail({
      from: `"JobPortal Resources" <${process.env.EMAIL_FROM}>`,
      to: process.env.EMAIL_USER,        // sender as "from"
      bcc: emails,                        // all subscribers in BCC (privacy)
      subject: `📚 New Resource: ${resource.title}`,
      html: `
        <div style="font-family:Inter,sans-serif;max-width:560px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;">
          <div style="background:linear-gradient(135deg,#6366f1,#8b5cf6);padding:32px 24px;text-align:center;">
            <h1 style="color:#fff;margin:0;font-size:22px;">New Resource Published! 📚</h1>
          </div>
          <div style="padding:28px 24px;">
            <span style="background:#ede9fe;color:#7c3aed;font-size:12px;font-weight:600;padding:4px 10px;border-radius:20px;">${resource.category || 'Resource'}</span>
            <h2 style="color:#111827;font-size:20px;margin:16px 0 8px;">${resource.title}</h2>
            <p style="color:#6b7280;font-size:14px;line-height:1.6;">${resource.description || resource.summary || ''}</p>
            <a href="${process.env.FRONTEND_URL}/resources/${resource._id}"
               style="display:inline-block;margin-top:20px;background:#6366f1;color:#fff;text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:600;font-size:14px;">
              Read Now →
            </a>
            <p style="color:#9ca3af;font-size:12px;margin-top:28px;border-top:1px solid #f3f4f6;padding-top:16px;">
              You're receiving this because you subscribed to JobPortal Resources.<br/>
              <a href="${process.env.FRONTEND_URL}/resources?unsubscribe=true" style="color:#6366f1;">Unsubscribe</a>
            </p>
          </div>
        </div>
      `,
    });

    console.log(`✉️  Notified ${emails.length} subscriber(s) about: ${resource.title}`);
  } catch (err) {
    console.error('Notify subscribers error:', err.message);
  }
};

/* ── GET /api/subscribers (admin only) ── */
exports.listSubscribers = async (req, res) => {
  try {
    const subs = await Subscriber.find({ active: true }).select('email createdAt').sort({ createdAt: -1 });
    res.json({ success: true, count: subs.length, data: subs });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch subscribers.' });
  }
};
