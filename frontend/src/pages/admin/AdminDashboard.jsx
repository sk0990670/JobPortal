import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  Briefcase, BookOpen, PlusCircle, Edit3, Users,
  TrendingUp, MoreHorizontal, FileText, Loader2, Calendar
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import { getAvatarUrl, formatRelativeDate } from '../../utils/formatters';

const AdminDashboard = () => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [chartFilter, setChartFilter] = useState('week');

  const { data: statsRes, isLoading } = useQuery({
    queryKey: ['admin-stats', startDate, endDate, chartFilter],
    queryFn: () => adminService.getStats({ startDate, endDate, chartFilter }),
  });

  const data = statsRes?.data;
  const stats = data?.stats || { totalJobs: 0, totalApps: 0, totalUsers: 0, activeJobs: 0 };
  const chartData = data?.chartData || [];
  const recentJobs = data?.recentJobs || [];
  const activity = data?.activity || [];

  return (
    <div className="animate-fade-in space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">Welcome back! Here's what's happening with your portal.</p>
        </div>
        
        {/* Global Date Filter */}
        <div className="flex items-center gap-2 bg-white border border-gray-200 px-3 py-1.5 rounded-lg text-sm shadow-sm">
          <Calendar size={15} className="text-gray-400" />
          <div className="flex items-center">
            <input 
              type="date" 
              value={startDate} 
              onChange={e => setStartDate(e.target.value)}
              onClick={e => e.target.showPicker && e.target.showPicker()}
              className="bg-transparent border-none outline-none text-gray-700 text-xs font-medium cursor-pointer [&::-webkit-calendar-picker-indicator]:hidden"
            />
            <span className="text-gray-400 mx-1">-</span>
            <input 
              type="date" 
              value={endDate} 
              onChange={e => setEndDate(e.target.value)}
              onClick={e => e.target.showPicker && e.target.showPicker()}
              className="bg-transparent border-none outline-none text-gray-700 text-xs font-medium cursor-pointer [&::-webkit-calendar-picker-indicator]:hidden"
            />
          </div>
          {(startDate || endDate) && (
            <button 
              onClick={() => { setStartDate(''); setEndDate(''); }}
              className="ml-2 text-[10px] text-red-500 hover:underline"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="py-20 flex justify-center items-center">
          <Loader2 className="animate-spin text-primary-500" size={32} />
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Jobs Posted', value: stats.totalJobs, change: '12%', icon: Briefcase, color: 'text-primary-600', bg: 'bg-primary-50' },
              { label: 'Applications', value: stats.totalApps, change: '18%', icon: Users, color: 'text-green-600', bg: 'bg-green-50' },
              { label: 'Active Jobs', value: stats.activeJobs, change: '5%', icon: BarChartIcon, color: 'text-orange-600', bg: 'bg-orange-50' },
              { label: 'Total Users', value: stats.totalUsers, change: '10%', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
            ].map((stat, i) => (
              <div key={i} className="card-p flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center flex-shrink-0`}>
                  <stat.icon size={22} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 mb-0.5">{stat.label}</p>
                  <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
                  {/* Fake change metric since we don't have historical comparison data yet */}
                  <p className="text-[11px] font-medium text-green-600 flex items-center gap-0.5 mt-0.5">
                    <TrendingUp size={12} /> {stat.change} vs prior
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Middle Grid */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Chart Section */}
            <div className="lg:col-span-2 card-p flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-bold text-gray-900">Jobs Overview</h2>
                <select 
                  value={chartFilter}
                  onChange={e => setChartFilter(e.target.value)}
                  className="text-xs font-medium text-gray-600 border border-gray-200 rounded-lg px-2.5 py-1.5 outline-none cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                </select>
              </div>
              
              <div className="flex-1 relative min-h-[180px] w-full flex items-end">
                {/* Chart container */}
                <div className="absolute inset-0 flex items-end justify-between px-2 pb-6">
                  {/* Grid Lines and Y-Axis Labels */}
                  {(() => {
                    const maxVal = Math.max(...chartData.map(d => d.count), 100);
                    const upperBound = maxVal <= 100 ? 100 : Math.ceil(maxVal / 10) * 10;
                    
                    return [1, 0.8, 0.6, 0.4, 0.2, 0].map((multiplier, i) => {
                      const val = Math.round(upperBound * multiplier);
                      const bottomPercent = multiplier * 100;
                      return (
                        <div key={i} className="absolute left-0 right-0 border-b border-gray-100 flex items-center" style={{ bottom: `${bottomPercent}%` }}>
                          <span className="text-[10px] text-gray-400 absolute -left-1 bg-white pr-2 -translate-y-1/2">{val}</span>
                        </div>
                      );
                    });
                  })()}
                  
                  {/* Dynamic Chart Lines */}
                  {chartData.length > 0 && (
                    <div className="absolute inset-0 pl-6 pt-4 pb-6 z-10 pointer-events-none">
                      <div className="relative w-full h-full">
                        {/* SVG Line and Area */}
                        <svg viewBox={`0 0 100 100`} className="absolute inset-0 w-full h-full overflow-visible preserve-3d" preserveAspectRatio="none">
                          <defs>
                            <linearGradient id="chartBg" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="rgba(99, 102, 241, 0.15)" />
                              <stop offset="100%" stopColor="rgba(99, 102, 241, 0)" />
                            </linearGradient>
                          </defs>
                        
                        {(() => {
                          const rawMaxCount = Math.max(...chartData.map(d => d.count), 100);
                          const upperBound = rawMaxCount <= 100 ? 100 : Math.ceil(rawMaxCount / 10) * 10;
                          
                          const points = chartData.map((d, i) => {
                            const x = (i / (chartData.length - 1 || 1)) * 100;
                            const y = 100 - (d.count / upperBound) * 100;
                            return { x, y, val: d.count };
                          });
                          
                          const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
                          const fillD = `${pathD} L 100 100 L 0 100 Z`;
                          
                          return (
                            <>
                              <path d={pathD} fill="none" stroke="#6366f1" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
                              <path d={fillD} fill="url(#chartBg)" />
                            </>
                          );
                        })()}
                      </svg>

                      {/* HTML Points to avoid SVG stretching */}
                      {(() => {
                        const rawMaxCount = Math.max(...chartData.map(d => d.count), 100);
                        const upperBound = rawMaxCount <= 100 ? 100 : Math.ceil(rawMaxCount / 10) * 10;
                        const points = chartData.map((d, i) => {
                          const x = (i / (chartData.length - 1 || 1)) * 100;
                          const y = 100 - (d.count / upperBound) * 100;
                          return { x, y, val: d.count };
                        });
                        
                        return points.map((pt, i) => {
                          const showPoint = chartFilter === 'week' || (chartFilter === 'month' && i % 3 === 0) || i === points.length - 1;
                          if (!showPoint) return null;
                          return (
                            <div 
                              key={i} 
                              className="absolute w-2 h-2 bg-white border-2 border-primary-500 rounded-full shadow-sm"
                              style={{ 
                                left: `${pt.x}%`, 
                                top: `${pt.y}%`,
                                transform: 'translate(-50%, -50%)'
                              }} 
                            />
                          );
                        });
                      })()}
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="w-full flex justify-between px-6 pl-12 text-[10px] text-gray-400 mt-auto pt-2 z-20 bg-white overflow-hidden">
                  {chartData.map((d, i) => {
                    let showLabel = true;
                    if (chartFilter === 'month' && i % 3 !== 0 && i !== chartData.length - 1) showLabel = false;
                    
                    return (
                      <span key={i} className={`truncate px-1 ${showLabel ? 'opacity-100' : 'opacity-0'}`}>
                        {d.day}
                      </span>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4 mt-6 pt-4 border-t border-gray-100">
                {[
                  { val: stats.totalJobs, label: 'Jobs Posted', color: 'bg-primary-500' },
                  { val: stats.activeJobs, label: 'Active Jobs', color: 'bg-green-500' },
                  { val: stats.totalApps, label: 'Applications', color: 'bg-blue-500' },
                  { val: stats.totalUsers, label: 'Users', color: 'bg-orange-500' },
                ].map(item => (
                  <div key={item.label}>
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <div className={`w-2 h-2 rounded-full ${item.color}`}></div>
                      <span className="font-bold text-gray-900">{item.val}</span>
                    </div>
                    <p className="text-[10px] text-gray-500">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="lg:col-span-1 card-p flex flex-col">
              <h2 className="font-bold text-gray-900 mb-5">Quick Actions</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3 flex-1">
                {[
                  { title: 'Post a New Job', desc: 'Create and publish a new job listing', icon: PlusCircle, bg: 'bg-primary-50', color: 'text-primary-600', link: '/post-job' },
                  { title: 'Manage Jobs', desc: 'Edit or delete existing jobs', icon: Edit3, bg: 'bg-green-50', color: 'text-green-600', link: '/admin/jobs' },
                  { title: 'Add Resource', desc: 'Publish a new article or guide', icon: BookOpen, bg: 'bg-orange-50', color: 'text-orange-600', link: '/admin/resources' },
                  { title: 'Manage Resources', desc: 'Edit or delete resources', icon: FileText, bg: 'bg-blue-50', color: 'text-blue-600', link: '/admin/resources' },
                ].map((action, i) => (
                  <Link key={i} to={action.link} className="flex items-start gap-3 p-3 rounded-xl border border-gray-100 hover:border-primary-200 hover:bg-gray-50 transition-all group">
                    <div className={`w-10 h-10 rounded-xl ${action.bg} ${action.color} flex items-center justify-center flex-shrink-0`}>
                      <action.icon size={18} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-gray-900 group-hover:text-primary-600 transition-colors">{action.title}</h4>
                      <p className="text-[11px] text-gray-500 leading-tight mt-0.5">{action.desc}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Grid */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Recent Jobs */}
            <div className="lg:col-span-2 card-p">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-gray-900">Recent Jobs</h2>
                <Link to="/admin/jobs" className="text-xs font-medium text-primary-600 flex items-center gap-1 hover:underline">
                  View all &rarr;
                </Link>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-100 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                      <th className="pb-3 font-medium">Job Title</th>
                      <th className="pb-3 font-medium">Company</th>
                      <th className="pb-3 font-medium">Applications</th>
                      <th className="pb-3 font-medium">Status</th>
                      <th className="pb-3 font-medium">Posted</th>
                      <th className="pb-3"></th>
                    </tr>
                  </thead>
                  <tbody className="text-sm divide-y divide-gray-50">
                    {recentJobs.length === 0 && (
                      <tr><td colSpan="6" className="py-4 text-center text-gray-500 text-sm">No jobs found in this period.</td></tr>
                    )}
                    {recentJobs.map((job, i) => (
                      <tr key={job._id || i} className="hover:bg-gray-50 transition-colors group">
                        <td className="py-3 font-semibold text-gray-900">
                          <Link to={`/jobs/${job._id}`} className="hover:text-primary-600">{job.title}</Link>
                        </td>
                        <td className="py-3 text-gray-600 flex items-center gap-2">
                          <div className="w-6 h-6 bg-gray-100 border border-gray-200 rounded-md flex items-center justify-center text-[10px] font-bold text-gray-500 overflow-hidden">
                            {job.companyLogo || job.company?.logo ? (
                              <img src={job.companyLogo || getAvatarUrl(job.company?.logo)} alt="" className="w-full h-full object-cover" />
                            ) : (
                              (job.companyName || job.company?.name || 'C')[0].toUpperCase()
                            )}
                          </div>
                          <span className="truncate max-w-[120px]">{job.companyName || job.company?.name}</span>
                        </td>
                        <td className="py-3 text-gray-600 font-medium">{job.appCount || 0}</td>
                        <td className="py-3">
                          <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md ${job.status === 'Active' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                            {job.status || 'Active'}
                          </span>
                        </td>
                        <td className="py-3 text-gray-500 text-xs">{formatRelativeDate(job.createdAt)}</td>
                        <td className="py-3 text-right">
                          <Link to={`/admin/jobs/${job._id}/edit`} className="text-gray-400 hover:text-primary-600"><Edit3 size={14}/></Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="lg:col-span-1 card-p">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-bold text-gray-900">Recent Activity</h2>
              </div>
              
              <div className="space-y-4">
                {activity.length === 0 && (
                  <p className="text-center text-gray-500 text-sm py-4">No recent activity found.</p>
                )}
                {activity.map((act, i) => {
                  const isJob = act.type === 'job';
                  const Icon = isJob ? Briefcase : Users;
                  const color = isJob ? 'text-green-600' : 'text-blue-600';
                  const bg = isJob ? 'bg-green-50' : 'bg-blue-50';

                  return (
                    <div key={i} className="flex gap-3">
                      <div className={`w-8 h-8 rounded-full ${bg} ${color} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                        <Icon size={14} />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-900 leading-snug">{act.title}</p>
                        <p className="text-[11px] text-gray-500 mt-0.5">{formatRelativeDate(act.time)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// Helper icon
const BarChartIcon = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="20" x2="12" y2="10"></line>
    <line x1="18" y1="20" x2="18" y2="4"></line>
    <line x1="6" y1="20" x2="6" y2="16"></line>
  </svg>
);

export default AdminDashboard;
