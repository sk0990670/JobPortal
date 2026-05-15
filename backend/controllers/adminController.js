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
    Job.countDocuments({ ...dateFilter, status: 'active' }), // Changed from 'Active' to 'active'
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

  // Parallelize the heavy queries to improve load time
  const [jobsByDayRaw, recentJobsRaw, latestJobs, latestApps] = await Promise.all([
    Job.aggregate([
      { $match: { createdAt: { $gte: chartStartDate, $lte: chartEndDate } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
    ]),
    Job.find(dateFilter)
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('company', 'name logo')
      .lean(),
    Job.find(dateFilter).sort({ createdAt: -1 }).limit(3).populate('company', 'name').lean(),
    Application.find(dateFilter).sort({ createdAt: -1 }).limit(3).populate('applicant', 'fullName').populate('job', 'title').lean(),
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

  // Fetch application counts for recent jobs in parallel
  const recentJobs = await Promise.all(recentJobsRaw.map(async (job) => {
    job.appCount = await Application.countDocuments({ job: job._id });
    return job;
  }));

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

// @desc    Get all users for admin
// @route   GET /api/admin/users
// @access  Private/Admin
const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find({ role: 'user' })
    .select('-password')
    .sort({ createdAt: -1 })
    .lean();

  // Apply privacy settings: mask email/phone if user hasn't allowed them
  const maskedUsers = users.map(user => {
    const showEmail = user.settings?.showEmail === true;
    const showPhone = user.settings?.showPhone === true;
    
    return {
      ...user,
      email: showEmail ? user.email : 'Hidden by user',
      phone: showPhone ? (user.phone || 'N/A') : 'Hidden by user',
    };
  });

  res.json({
    success: true,
    data: maskedUsers,
  });
});

// @desc    Get real system status for admin dashboard
// @route   GET /api/admin/system-status
// @access  Private/Admin
const getSystemStatus = asyncHandler(async (req, res) => {
  const mongoose = require('mongoose');

  // ── Database ──────────────────────────────────────────────────────────────
  const dbState = mongoose.connection.readyState;
  // 0=disconnected, 1=connected, 2=connecting, 3=disconnecting
  const dbStateMap = { 0: 'Disconnected', 1: 'Connected', 2: 'Connecting', 3: 'Disconnecting' };
  const dbStatus   = dbStateMap[dbState] || 'Unknown';
  const dbHealthy  = dbState === 1;

  // Measure a lightweight DB ping for latency
  let dbLatencyMs = null;
  if (dbHealthy) {
    const t0 = Date.now();
    await mongoose.connection.db.admin().ping();
    dbLatencyMs = Date.now() - t0;
  }

  // ── Process / Runtime ─────────────────────────────────────────────────────
  const uptimeSeconds = Math.floor(process.uptime());
  const uptimeHuman = uptimeSeconds < 60
    ? `${uptimeSeconds}s`
    : uptimeSeconds < 3600
      ? `${Math.floor(uptimeSeconds / 60)}m ${uptimeSeconds % 60}s`
      : `${Math.floor(uptimeSeconds / 3600)}h ${Math.floor((uptimeSeconds % 3600) / 60)}m`;

  // ── Memory ────────────────────────────────────────────────────────────────
  const mem = process.memoryUsage();
  const toMB = (bytes) => `${(bytes / 1024 / 1024).toFixed(1)} MB`;

  // ── Environment / K8s awareness ───────────────────────────────────────────
  // On K8s, HOSTNAME = pod name; REPLICAS can be set via ConfigMap
  const environment  = process.env.NODE_ENV || 'development';
  const podName      = process.env.HOSTNAME || 'local';
  const replicas     = process.env.REPLICAS || '1';   // set via K8s ConfigMap
  const deployTarget = process.env.DEPLOY_TARGET || 'vercel'; // 'vercel' | 'k8s'

  // ── API Latency (measured by this request itself) ─────────────────────────
  // req._startTime is set by express if trust proxy is on; fallback to Date.now
  const apiLatencyMs = req._startTime ? Date.now() - req._startTime : null;

  // ── Overall health ────────────────────────────────────────────────────────
  const healthy = dbHealthy;

  res.json({
    success: true,
    data: {
      overall: healthy ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      database: {
        status:    dbStatus,
        healthy:   dbHealthy,
        latencyMs: dbLatencyMs,
        host:      mongoose.connection.host || 'N/A',
      },
      server: {
        uptime:      uptimeHuman,
        uptimeRaw:   uptimeSeconds,
        nodeVersion: process.version,
        environment,
        deployTarget,
        podName,
        replicas,
      },
      memory: {
        heapUsed:  toMB(mem.heapUsed),
        heapTotal: toMB(mem.heapTotal),
        rss:       toMB(mem.rss),
        external:  toMB(mem.external),
        heapPct:   Math.round((mem.heapUsed / mem.heapTotal) * 100),
      },
      api: {
        latencyMs: apiLatencyMs,
      },
    },
  });
});

module.exports = { getDashboardStats, getAllUsers, getSystemStatus };
