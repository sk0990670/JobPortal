import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  Briefcase, BookOpen, PlusCircle, Edit3, Users,
  TrendingUp, TrendingDown, MoreHorizontal, FileText, Loader2, Calendar, Server, CheckCircle2
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import { getAvatarUrl, formatRelativeDate } from '../../utils/formatters';

const AdminDashboard = () => {
  // Default to Last 30 Days
  const [startDate, setStartDate] = useState(() => {
    const d = new Date(); d.setDate(d.getDate() - 30); return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);
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
    <div className="animate-fade-in space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Dashboard</h1>
          <p className="text-gray-500 mt-1 font-medium">Welcome back! Here's what's happening with your portal.</p>
        </div>
        
        {/* Global Date Filter */}
        <div className="flex items-center gap-3 bg-white border border-gray-200 px-4 py-2.5 rounded-xl text-sm shadow-sm hover:shadow-md hover:border-primary-300 transition-all">
          <Calendar size={18} className="text-primary-500" />
          <div className="flex items-center gap-3">
            <div className="relative">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 absolute -top-3 left-1 bg-white px-1">Start</span>
              <input 
                type="date" 
                value={startDate} 
                onChange={e => setStartDate(e.target.value)}
                className="bg-transparent border-none outline-none text-gray-800 text-[13px] font-bold cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-50 hover:[&::-webkit-calendar-picker-indicator]:opacity-100"
              />
            </div>
            <span className="text-gray-300 font-bold">-</span>
            <div className="relative">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 absolute -top-3 left-1 bg-white px-1">End</span>
              <input 
                type="date" 
                value={endDate} 
                onChange={e => setEndDate(e.target.value)}
                className="bg-transparent border-none outline-none text-gray-800 text-[13px] font-bold cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-50 hover:[&::-webkit-calendar-picker-indicator]:opacity-100"
              />
            </div>
          </div>
          {(startDate || endDate) && (
            <button 
              onClick={() => { setStartDate(''); setEndDate(''); }}
              className="ml-2 px-2.5 py-1 bg-red-50 text-red-600 rounded-md text-[11px] font-extrabold hover:bg-red-100 transition-colors"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="py-32 flex justify-center items-center">
          <Loader2 className="animate-spin text-primary-500" size={40} />
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
            {[
              { label: 'Jobs Posted', value: stats.totalJobs, change: '12%', trend: 'up', icon: Briefcase, color: 'text-primary-600', bg: 'bg-primary-50' },
              { label: 'Applications', value: stats.totalApps, change: '18%', trend: 'up', icon: Users, color: 'text-green-600', bg: 'bg-green-50' },
              { label: 'Active Jobs', value: stats.activeJobs, change: '2%', trend: 'down', icon: BarChartIcon, color: 'text-orange-600', bg: 'bg-orange-50' },
              { label: 'Total Users', value: stats.totalUsers, change: '10%', trend: 'up', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
            ].map((stat, i) => (
              <div key={i} className="card-p flex flex-col justify-center gap-4 hover:shadow-lg transition-shadow bg-white rounded-2xl border border-gray-100">
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center flex-shrink-0 shadow-sm`}>
                    <stat.icon size={26} strokeWidth={2.5} />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-gray-500 mb-1 uppercase tracking-wider">{stat.label}</p>
                    <div className="flex items-end gap-3">
                      <h3 className="text-3xl font-extrabold text-gray-900 leading-none">{stat.value}</h3>
                    </div>
                  </div>
                </div>
                <div className="pt-3 border-t border-gray-50 flex items-center">
                  <p className={`text-[12px] font-bold flex items-center gap-1 ${stat.trend === 'up' ? 'text-green-600' : 'text-red-500'}`}>
                    {stat.trend === 'up' ? <TrendingUp size={14} /> : <TrendingDown size={14} />} 
                    {stat.change} <span className="text-gray-400 font-medium ml-1">vs last month</span>
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Middle Grid */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Chart Section */}
            <div className="lg:col-span-2 card-p flex flex-col shadow-sm border border-gray-100 rounded-2xl">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-lg font-extrabold text-gray-900 tracking-tight">Jobs Overview</h2>
                <select 
                  value={chartFilter}
                  onChange={e => setChartFilter(e.target.value)}
                  className="text-xs font-bold text-gray-700 border border-gray-200 rounded-lg px-3 py-2 outline-none cursor-pointer hover:bg-gray-50 transition-colors shadow-sm"
                >
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                </select>
              </div>
              
              <div className="flex-1 relative min-h-[220px] w-full flex items-end">
                {/* Chart container */}
                <div className="absolute inset-0 flex items-end justify-between px-2 pb-8">
                  {/* Grid Lines and Y-Axis Labels */}
                  {(() => {
                    // Dynamic Scaling: Minimum Y-axis bound of 100
                    const rawMaxCount = Math.max(...chartData.map(d => d.count), 100);
                    const upperBound = rawMaxCount <= 100 ? 100 : Math.ceil(rawMaxCount / 20) * 20;
                    
                    return [1, 0.8, 0.6, 0.4, 0.2, 0].map((multiplier, i) => {
                      const val = Math.round(upperBound * multiplier);
                      const bottomPercent = multiplier * 100;
                      return (
                        <div key={i} className="absolute left-0 right-0 border-b border-gray-100 flex items-center" style={{ bottom: `${bottomPercent}%` }}>
                          <span className="text-[10px] font-medium text-gray-400 absolute -left-2 bg-white pr-2 -translate-y-1/2">{val}</span>
                        </div>
                      );
                    });
                  })()}
                  
                  {/* Dynamic Chart Lines */}
                  {chartData.length > 0 && (
                    <div className="absolute inset-0 pl-8 pt-4 pb-8 z-10 pointer-events-none">
                      <div className="relative w-full h-full">
                        {/* SVG Line and Area */}
                        <svg viewBox={`0 0 100 100`} className="absolute inset-0 w-full h-full overflow-visible preserve-3d" preserveAspectRatio="none">
                          <defs>
                            <linearGradient id="chartBg" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="rgba(99, 102, 241, 0.2)" />
                              <stop offset="100%" stopColor="rgba(99, 102, 241, 0)" />
                            </linearGradient>
                          </defs>
                        
                        {(() => {
                          const rawMaxCount = Math.max(...chartData.map(d => d.count), 100);
                          const upperBound = rawMaxCount <= 100 ? 100 : Math.ceil(rawMaxCount / 20) * 20;
                          
                          const points = chartData.map((d, i) => {
                            const x = (i / (chartData.length - 1 || 1)) * 100;
                            const y = 100 - (d.count / upperBound) * 100;
                            return { x, y, val: d.count };
                          });
                          
                          const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
                          const fillD = `${pathD} L 100 100 L 0 100 Z`;
                          
                          return (
                            <>
                              <path d={pathD} fill="none" stroke="#6366f1" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" className="drop-shadow-sm" />
                              <path d={fillD} fill="url(#chartBg)" />
                            </>
                          );
                        })()}
                      </svg>

                      {/* HTML Points to avoid SVG stretching */}
                      {(() => {
                        const rawMaxCount = Math.max(...chartData.map(d => d.count), 100);
                        const upperBound = rawMaxCount <= 100 ? 100 : Math.ceil(rawMaxCount / 20) * 20;
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
                              className="absolute w-3 h-3 bg-white border-[3px] border-primary-500 rounded-full shadow-sm hover:scale-150 transition-transform cursor-pointer"
                              style={{ 
                                left: `${pt.x}%`, 
                                top: `${pt.y}%`,
                                transform: 'translate(-50%, -50%)'
                              }} 
                            >
                               <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] font-bold px-2 py-0.5 rounded opacity-0 hover:opacity-100 transition-opacity">
                                 {pt.val}
                               </span>
                            </div>
                          );
                        });
                      })()}
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="w-full flex justify-between px-8 pl-14 text-[10px] font-semibold text-gray-400 mt-auto pt-3 z-20 bg-white overflow-hidden border-t border-gray-100">
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
            </div>

            {/* Quick Actions */}
            <div className="lg:col-span-1 card-p flex flex-col shadow-sm border border-gray-100 rounded-2xl">
              <h2 className="text-lg font-extrabold text-gray-900 mb-5 tracking-tight">Quick Actions</h2>
              <div className="grid grid-cols-1 gap-3 flex-1">
                {[
                  { title: 'Post a New Job', desc: 'Create and publish a new job listing', icon: PlusCircle, bg: 'bg-primary-50', color: 'text-primary-600', link: '/post-job' },
                  { title: 'Manage Jobs', desc: 'Edit or delete existing jobs', icon: Edit3, bg: 'bg-green-50', color: 'text-green-600', link: '/admin/jobs' },
                  { title: 'Add Resource', desc: 'Publish a new article or guide', icon: BookOpen, bg: 'bg-orange-50', color: 'text-orange-600', link: '/admin/resources' },
                  { title: 'Manage Resources', desc: 'Edit or delete resources', icon: FileText, bg: 'bg-blue-50', color: 'text-blue-600', link: '/admin/resources' },
                ].map((action, i) => (
                  <Link key={i} to={action.link} className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 hover:border-primary-300 hover:shadow-md hover:-translate-y-0.5 bg-white transition-all group">
                    <div className={`w-12 h-12 rounded-xl ${action.bg} ${action.color} flex items-center justify-center flex-shrink-0`}>
                      <action.icon size={20} strokeWidth={2.5} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-gray-900 group-hover:text-primary-600 transition-colors">{action.title}</h4>
                      <p className="text-[12px] text-gray-500 font-medium leading-tight mt-1">{action.desc}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Grid */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Recent Jobs */}
            <div className="lg:col-span-2 card-p shadow-sm border border-gray-100 rounded-2xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-extrabold text-gray-900 tracking-tight">Recent Jobs</h2>
                <Link to="/admin/jobs" className="text-sm font-bold text-primary-600 flex items-center gap-1 hover:text-primary-700 bg-primary-50 px-3 py-1.5 rounded-lg transition-colors">
                  View all &rarr;
                </Link>
              </div>
              
              <div className="overflow-x-auto rounded-xl border border-gray-100">
                <table className="w-full text-left border-collapse bg-white">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                      <th className="px-5 py-4">Job Title</th>
                      <th className="px-5 py-4">Company</th>
                      <th className="px-5 py-4">Applications</th>
                      <th className="px-5 py-4">Status</th>
                      <th className="px-5 py-4">Posted</th>
                      <th className="px-5 py-4"></th>
                    </tr>
                  </thead>
                  <tbody className="text-sm divide-y divide-gray-50">
                    {recentJobs.length === 0 && (
                      <tr><td colSpan="6" className="py-8 text-center text-gray-500 font-medium">No jobs found in this period.</td></tr>
                    )}
                    {recentJobs.map((job, i) => (
                      <tr key={job._id || i} className="hover:bg-gray-50/80 transition-colors group">
                        <td className="px-5 py-4 font-bold text-gray-900">
                          <Link to={`/jobs/${job._id}`} className="hover:text-primary-600">{job.title}</Link>
                        </td>
                        <td className="px-5 py-4 text-gray-600 flex items-center gap-3">
                          <div className="w-8 h-8 bg-white shadow-sm border border-gray-200 rounded-lg flex items-center justify-center text-xs font-bold text-gray-500 overflow-hidden">
                            {job.companyLogo || job.company?.logo ? (
                              <img src={job.companyLogo || getAvatarUrl(job.company?.logo)} alt="" className="w-full h-full object-cover" />
                            ) : (
                              (job.companyName || job.company?.name || 'C')[0].toUpperCase()
                            )}
                          </div>
                          <span className="truncate max-w-[140px] font-medium">{job.companyName || job.company?.name}</span>
                        </td>
                        <td className="px-5 py-4 text-gray-600 font-bold">{job.appCount || 0}</td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex px-2.5 py-1 text-[11px] font-extrabold rounded-md capitalize tracking-wide ${
                            job.status?.toLowerCase() === 'active' 
                              ? 'bg-green-100 text-green-700 border border-green-200/50' 
                              : 'bg-gray-100 text-gray-600 border border-gray-200/50'
                          }`}>
                            {job.status || 'Active'}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-gray-500 text-xs font-medium">{formatRelativeDate(job.createdAt)}</td>
                        <td className="px-5 py-4 text-right">
                          <Link to={`/admin/jobs/${job._id}/edit`} className="inline-flex p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"><Edit3 size={16}/></Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Right Column: System Status + Recent Activity */}
            <div className="lg:col-span-1 flex flex-col gap-6">
              
              {/* System Status / Automation Health */}
              <div className="card-p bg-white rounded-2xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="font-extrabold text-gray-900 flex items-center gap-2">
                    <Server size={18} className="text-primary-600" /> System Status
                  </h2>
                  <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold border uppercase tracking-wider ${
                    data?.systemStatus?.health === 'Healthy' 
                      ? 'bg-green-50 text-green-700 border-green-200/60' 
                      : 'bg-orange-50 text-orange-700 border-orange-200/60'
                  }`}>
                    <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${
                      data?.systemStatus?.health === 'Healthy' ? 'bg-green-500' : 'bg-orange-500'
                    }`}></div>
                    {data?.systemStatus?.health || 'Unknown'}
                  </span>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-sm gap-4">
                    <span className="text-gray-600 font-medium whitespace-nowrap">Environment</span>
                    <span className="font-bold text-gray-900 whitespace-nowrap">
                      {data?.systemStatus?.environment || 'Loading...'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm border-t border-gray-100 pt-4 gap-4">
                    <span className="text-gray-600 font-medium whitespace-nowrap">Database (Atlas)</span>
                    <span className={`font-bold whitespace-nowrap flex items-center gap-1.5 ${
                      data?.systemStatus?.database === 'Connected' ? 'text-green-600' : 'text-orange-600'
                    }`}>
                      {data?.systemStatus?.database === 'Connected' && <CheckCircle2 size={14} />}
                      {data?.systemStatus?.database || 'Pending'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm border-t border-gray-100 pt-4 gap-4">
                    <span className="text-gray-600 font-medium whitespace-nowrap">Process Uptime</span>
                    <span className="font-bold text-gray-900 whitespace-nowrap">
                      {data?.systemStatus?.uptime || '--'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm border-t border-gray-100 pt-4 gap-4">
                    <span className="text-gray-600 font-medium whitespace-nowrap">Memory Usage</span>
                    <span className="font-bold text-gray-900 whitespace-nowrap">
                      {data?.systemStatus?.memory || '--'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="card-p flex-1 shadow-sm border border-gray-100 rounded-2xl">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-extrabold text-gray-900 tracking-tight">Recent Activity</h2>
                </div>
                
                <div className="space-y-5">
                  {activity.length === 0 && (
                    <p className="text-center text-gray-500 text-sm py-4 font-medium">No recent activity found.</p>
                  )}
                  {activity.map((act, i) => {
                    const isJob = act.type === 'job';
                    const Icon = isJob ? Briefcase : Users;
                    const color = isJob ? 'text-green-600' : 'text-blue-600';
                    const bg = isJob ? 'bg-green-50 border border-green-100' : 'bg-blue-50 border border-blue-100';

                    return (
                      <div key={i} className="flex gap-4">
                        <div className={`w-10 h-10 rounded-xl ${bg} ${color} flex items-center justify-center flex-shrink-0 shadow-sm`}>
                          <Icon size={18} strokeWidth={2.5} />
                        </div>
                        <div className="pt-0.5">
                          <p className="text-sm font-bold text-gray-900 leading-snug">{act.title}</p>
                          <p className="text-[12px] font-medium text-gray-500 mt-1">{formatRelativeDate(act.time)}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// Helper icon
const BarChartIcon = ({ size, strokeWidth = 2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="20" x2="12" y2="10"></line>
    <line x1="18" y1="20" x2="18" y2="4"></line>
    <line x1="6" y1="20" x2="6" y2="16"></line>
  </svg>
);

export default AdminDashboard;
