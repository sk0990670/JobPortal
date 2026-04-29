import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { userService } from '../services/userService';
import { Briefcase, Users, Calendar, Bookmark, ArrowUp, Clock, ChevronRight, CheckCircle2 } from 'lucide-react';
import { formatSalary, formatLocation, formatRelativeDate, getAvatarUrl, getStatusColor } from '../utils/formatters';
import { useSelector } from 'react-redux';
import { selectUser } from '../store/slices/authSlice';

/* ── Stat card — disabled ones are greyed out ── */
const StatCard = ({ icon: Icon, color, value, label, delta, disabled }) => (
  <div className={`card-p flex items-center gap-4 ${disabled ? 'opacity-50 cursor-not-allowed select-none' : ''}`}>
    <div className={`w-12 h-12 rounded-xl ${disabled ? 'bg-gray-300' : color} flex items-center justify-center`}>
      <Icon size={20} className="text-white" />
    </div>
    <div>
      <p className="text-2xl font-bold text-gray-900">{disabled ? '—' : value}</p>
      <p className="text-sm text-gray-500">{label}</p>
      {!disabled && delta && (
        <p className="text-xs text-green-600 font-medium flex items-center gap-0.5 mt-0.5">
          <ArrowUp size={10} />{delta}
        </p>
      )}
      {disabled && <p className="text-xs text-gray-400 mt-0.5">Coming soon</p>}
    </div>
  </div>
);

const Dashboard = () => {
  const user = useSelector(selectUser);

  const { data, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => userService.getDashboard().then(r => r.data),
    staleTime: 2 * 60 * 1000,
  });

  const stats        = data?.data?.stats || {};
  const applications = data?.data?.recentApplications || [];

  return (
    <div className="animate-fade-in space-y-6 max-w-7xl">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user?.fullName?.split(' ')[0]}! 👋</h1>
          <p className="text-gray-500 mt-0.5">Track your progress and find the right opportunities for you.</p>
        </div>
        {user?.profileCompletion < 100 && (
          <div className="card-p text-sm max-w-xs">
            <p className="font-semibold text-gray-900 mb-1">Your Profile is {user?.profileCompletion}% complete</p>
            <p className="text-gray-500 text-xs mb-2">Add skills, projects and experience to improve your profile.</p>
            <Link to="/profile" className="btn-primary btn-sm">Improve Now</Link>
          </div>
        )}
      </div>

      {/* Stats Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array(4).fill(0).map((_, i) => <div key={i} className="card-p h-24 skeleton" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={Briefcase} color="bg-primary-500" value={stats.totalApplications || 0} label="Applications" delta={stats.totalApplications > 0 ? `${stats.totalApplications} total` : null} />
          <StatCard icon={Users}     color="bg-green-500"  value={0}                    label="Shortlisted" disabled />
          <StatCard icon={Calendar}  color="bg-orange-400" value={0}                    label="Interviews"  disabled />
          <StatCard icon={Bookmark}  color="bg-blue-500"   value={stats.savedJobs || 0} label="Saved Jobs"  delta={stats.savedJobs > 0 ? `${stats.savedJobs} saved` : null} />
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">

        {/* Recommended / Applied Jobs */}
        <div className="lg:col-span-2 space-y-4">
          <div className="section-header">
            <h2 className="section-title">Recommended for you</h2>
            <Link to="/jobs" className="section-link flex items-center gap-1">View all <ChevronRight size={14} /></Link>
          </div>

          {applications.length === 0 ? (
            <div className="card-p text-center py-8">
              <Briefcase size={32} className="text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500 text-sm">No applications yet. Start exploring!</p>
              <Link to="/jobs" className="btn-primary mt-3">Browse Jobs</Link>
            </div>
          ) : (
            applications.slice(0, 3).map(app => {
              const job = app.job;
              if (!job) return null;
              const logoUrl = job?.company?.logo ? getAvatarUrl(job.company.logo) : null;
              return (
                <div key={app._id} className="card-p flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                    {logoUrl ? <img src={logoUrl} alt="" className="w-full h-full object-contain p-1" /> : <Briefcase size={20} className="text-gray-400" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 text-sm truncate">{job.title}</h3>
                    <p className="text-xs text-gray-500">{job?.company?.name}</p>
                    <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                      <span>📍 {formatLocation(job.location)}</span>
                      <span>📋 {job.jobType}</span>
                      <span className="text-primary-600 font-semibold">{formatSalary(job.salary)}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className={getStatusColor(app.status)}>{app.status}</span>
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
              <Link to="/my-applications" className="section-link text-xs">View all</Link>
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
