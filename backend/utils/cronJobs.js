const cron = require('node-cron');
const User = require('../models/User');
const { sendBatchJobAlertEmail } = require('./emailService');

const initCronJobs = () => {
  // Run every hour at minute 0
  cron.schedule('0 * * * *', async () => {
    console.log('[Cron] Running batch job alert email processor...');
    try {
      // Find users who have pending job alerts
      const users = await User.find({
        'pendingJobAlerts.0': { $exists: true }
      }).populate('pendingJobAlerts', 'title companyName companyLogo');

      if (users.length === 0) return;

      for (const user of users) {
        if (user.pendingJobAlerts && user.pendingJobAlerts.length > 0) {
          try {
            await sendBatchJobAlertEmail(user.email, user.fullName, user.pendingJobAlerts);
            // Clear the alerts after sending
            user.pendingJobAlerts = [];
            await user.save();
          } catch (emailErr) {
            console.error(`[Cron] Failed to send batch email to ${user.email}:`, emailErr);
          }
        }
      }
      console.log(`[Cron] Processed batch emails for ${users.length} users.`);
    } catch (err) {
      console.error('[Cron] Error processing batch emails:', err);
    }
  });
};

module.exports = initCronJobs;
