import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { userService } from '../services/userService';
import { jobService } from '../services/jobService';
import { Briefcase, Users, Calendar, Bookmark, Clock, ChevronRight, CheckCircle2 } from 'lucide-react';
import { formatSalary, formatLocation, formatRelativeDate, getAvatarUrl, getStatusColor } from '../utils/formatters';
import { useSelector } from 'react-redux';
import { selectUser } from '../store/slices/authSlice';

const StatCard = ({ to, icon: Icon, color, value, label, disabled }) => (
  <Link to={disabled ? '#' : to} className={`card-p flex items-center gap-4 relative transition-all duration-200 ${disabled ? 'cursor-not-allowed opacity-90' : 'hover:-translate-y-0.5 hover:shadow-md'}`}>
    {disabled && (
      <span className="absolute top-3 right-3 bg-yellow-100 text-yellow-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
        Coming Soon
      </span>
    )}
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${disabled ? 'bg-gray-100' : color}`}>
      <Icon size={20} className={disabled ? 'text-gray-400' : 'text-white'} />
    </div>
    <div>
      <p className={`text-2xl font-bold ${disabled ? 'text-gray-400' : 'text-gray-900'}`}>{disabled ? '—' : value}</p>
      <p className="text-sm text-gray-500 font-medium">{label}</p>
    </div>
  </Link>
);

const Dashboard = () => {
  const user = useSelector(selectUser);

  const { data, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => userService.getDashboard().then(r => r.data),
    staleTime: 2 * 60 * 1000,
  });

  const { data: jobsData } = useQuery({
    queryKey: ['recommendedJobs'],
    queryFn: () => jobService.getJobs().then(r => r.data),
    staleTime: 5 * 60 * 1000,
  });

  const stats        = data?.data?.stats || {};
  const applications = data?.data?.recentApplications || [];
  
  // Filter out applied jobs from recommendations
  const appliedJobIds = new Set(applications.map(app => app.job?._id));
  const recommendedJobs = (jobsData?.data || []).filter(job => !appliedJobIds.has(job._id)).slice(0, 3);

  return (
    <div className="animate-fade-in space-y-6 max-w-7xl">

      {/* Header */}
      <div className="bg-gradient-to-r from-primary-50 to-indigo-50/50 rounded-2xl p-6 border border-primary-100/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user?.fullName?.split(' ')[0]}! 👋</h1>
          <p className="text-gray-600 mt-1">Track your progress and find the right opportunities for you.</p>
        </div>
      </div>

      {/* Stats Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array(4).fill(0).map((_, i) => <div key={i} className="card-p h-24 skeleton" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard to="/applications" icon={Briefcase} color="bg-primary-500" value={stats.totalApplications || 0} label="Applications" />
          <StatCard to="#" icon={Users} color="bg-green-500" value={0} label="Shortlisted" disabled />
          <StatCard to="#" icon={Calendar} color="bg-orange-400" value={0} label="Interviews" disabled />
          <StatCard to="/saved-jobs" icon={Bookmark} color="bg-blue-500" value={stats.savedJobs || 0} label="Saved Jobs" />
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">

        {/* Recommended / Applied Jobs */}
        <div className="lg:col-span-2 space-y-4">
          <div className="section-header">
            <h2 className="section-title">Recommended for you</h2>
            <Link to="/jobs" className="section-link flex items-center gap-1">View all <ChevronRight size={14} /></Link>
          </div>

          {recommendedJobs.length === 0 ? (
            <div className="card-p text-center py-8">
              <Briefcase size={32} className="text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500 text-sm">No new recommendations at the moment. Keep exploring!</p>
              <Link to="/jobs" className="btn-primary mt-3">Browse Jobs</Link>
            </div>
          ) : (
            recommendedJobs.map(job => {
              const logoUrl = job?.company?.logo ? getAvatarUrl(job.company.logo) : null;
              return (
                <div key={job._id} className="card-p flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                    {logoUrl ? <img src={logoUrl} alt="" className="w-full h-full object-contain p-1" /> : <Briefcase size={20} className="text-gray-400" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 text-sm truncate">{job.title}</h3>
                    <p className="text-xs text-gray-500">{job?.company?.name}</p>
                    <div className="flex flex-wrap items-center gap-2 mt-2 text-xs">
                      <span className="bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full">📍 {formatLocation(job.location)}</span>
                      <span className="bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full">📋 {job.jobType}</span>
                      <span className="bg-green-50 text-green-700 px-2.5 py-1 rounded-full font-semibold">{formatSalary(job.salary)}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Link to={`/jobs/${job._id}`} className="btn-primary btn-sm">View Job</Link>
                  </div>
                </div>
              );
            })
          )}
          <Link to="/jobs" className="btn-secondary w-full justify-center mt-2">View all recommended jobs →</Link>
        </div>

        {/* Right Column — Recent Activity ONLY (real data) */}
        <div className="space-y-5">
          <div className="card-p">
            <div className="section-header mb-3">
              <h2 className="section-title text-base">Recent Activity</h2>
              <Link to="/applications" className="section-link text-xs">View all</Link>
            </div>

            {applications.length === 0 ? (
              <div className="text-center py-6">
                <CheckCircle2 size={28} className="text-gray-200 mx-auto mb-2" />
                <p className="text-xs text-gray-400">No activity yet.<br />Apply to jobs to see them here.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {applications.slice(0, 5).map((app, i) => (
                  <div key={app._id || i} className="flex items-start gap-2.5">
                    <span className="text-base flex-shrink-0">✅</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-700 leading-relaxed">
                        Applied to <span className="font-medium">{app.job?.title || 'a job'}</span>
                        {app.job?.company?.name ? ` at ${app.job.company.name}` : ''}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {app.appliedAt ? formatRelativeDate(app.appliedAt) : formatRelativeDate(app.createdAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Job Alerts — future feature */}
          <div className="card-p">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-primary-50 flex items-center justify-center">
                <Clock size={18} className="text-primary-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-sm">Job Alerts</h3>
                <p className="text-xs text-gray-500">Get notified for new jobs matching your preferences.</p>
              </div>
            </div>
            <button disabled className="btn-secondary w-full text-sm opacity-50 cursor-not-allowed">
              Manage Alerts <span className="text-xs ml-1 text-gray-400">(Coming Soon)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
