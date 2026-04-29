const asyncHandler = require('express-async-handler');
const Job = require('../models/Job');
const Application = require('../models/Application');
const User = require('../models/User');
const Resource = require('../models/Resource');

// @desc    Get dashboard statistics
// @route   GET /api/admin/stats
// @access  Private/Admin
const getDashboardStats = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;
  
  let dateFilter = {};
  if (startDate && endDate) {
    dateFilter = {
      createdAt: {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      }
    };
  }

  const [totalJobs, totalApps, totalUsers, activeJobs] = await Promise.all([
    Job.countDocuments(dateFilter),
    Application.countDocuments(dateFilter),
    User.countDocuments(dateFilter),
    Job.countDocuments({ ...dateFilter, status: 'Active' }), // Assume 'Active' is the status string
  ]);

  // For the chart: jobs posted per day
  const { chartFilter } = req.query; // 'week', 'month', 'quarter'
  
  let chartStartDate = new Date();
  chartStartDate.setHours(0, 0, 0, 0);
  let chartEndDate = new Date();

  // If a specific filter is provided, use that for the chart
  if (chartFilter === 'month') {
    chartStartDate.setDate(chartStartDate.getDate() - 29); // Last 30 days
  } else if (chartFilter === 'quarter') {
    chartStartDate.setDate(chartStartDate.getDate() - 89); // Last 90 days
  } else if (chartFilter === 'week') {
    chartStartDate.setDate(chartStartDate.getDate() - 6);  // Last 7 days
  } else {
    // Default fallback: if global date filter exists, use it, else default to week
    if (startDate && endDate) {
      chartStartDate = new Date(startDate);
      chartEndDate = new Date(endDate);
    } else {
      chartStartDate.setDate(chartStartDate.getDate() - 6);
    }
  }

  const jobsByDayRaw = await Job.aggregate([
    { $match: { createdAt: { $gte: chartStartDate, $lte: chartEndDate } } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        count: { $sum: 1 },
      },
    },
  ]);

  // Determine number of days to show
  const diffTime = Math.abs(chartEndDate - chartStartDate);
  const diffDays = Math.min(Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1, 90); 

  // Fill in missing days
  const chartData = [];
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  for (let i = 0; i < diffDays; i++) {
    const d = new Date(chartStartDate);
    d.setDate(d.getDate() + i);
    if (d > new Date() && !endDate) break; // don't go into future unless explicitly asked
    
    const dateStr = d.toISOString().slice(0, 10);
    let dayName = days[d.getDay()];
    
    // Format label based on range
    if (diffDays > 31) {
      // For quarter, only show a few labels, or format as "15 Jan"
      dayName = `${d.getDate()} ${monthNames[d.getMonth()]}`;
    } else if (diffDays > 7) {
      // For month
      dayName = `${d.getDate()} ${monthNames[d.getMonth()]}`;
    }

    const match = jobsByDayRaw.find((x) => x._id === dateStr);
    chartData.push({ day: dayName, count: match ? match.count : 0 });
  }

  // Recent Jobs
  const recentJobs = await Job.find(dateFilter)
    .sort({ createdAt: -1 })
    .limit(5)
    .populate('company', 'name logo')
    .lean();

  // For recent jobs, we also want the number of applications
  for (let job of recentJobs) {
    job.appCount = await Application.countDocuments({ job: job._id });
  }

  // Recent Activity (mix of latest jobs and applications)
  const latestJobs = await Job.find(dateFilter).sort({ createdAt: -1 }).limit(3).populate('company', 'name').lean();
  const latestApps = await Application.find(dateFilter).sort({ createdAt: -1 }).limit(3).populate('user', 'fullName').populate('job', 'title').lean();

  const activity = [];
  latestJobs.forEach((job) => {
    activity.push({
      type: 'job',
      title: `New job posted: ${job.title} at ${job.companyName || job.company?.name || 'Unknown'}`,
      time: job.createdAt,
    });
  });
  latestApps.forEach((app) => {
    activity.push({
      type: 'application',
      title: `New application received for ${app.job?.title || 'a job'}`,
      time: app.createdAt,
    });
  });

  activity.sort((a, b) => new Date(b.time) - new Date(a.time));

  res.json({
    success: true,
    data: {
      stats: { totalJobs, totalApps, totalUsers, activeJobs },
      chartData,
      recentJobs,
      activity: activity.slice(0, 5),
    },
  });
});

module.exports = { getDashboardStats };
