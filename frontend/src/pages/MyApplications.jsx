import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Filter, ChevronRight, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { applicationService } from '../services/applicationService';
import { formatSalary, formatLocation, formatRelativeDate, getStatusColor, getAvatarUrl } from '../utils/formatters';
import Pagination from '../components/common/Pagination';
import { Briefcase } from 'lucide-react';

const STATUS_TABS = ['All', 'Applied', 'Shortlisted', 'Interview', 'Rejected'];

const MyApplications = () => {
  const [activeStatus, setActiveStatus] = useState('All');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['my-applications', activeStatus, search, page],
    queryFn: () => applicationService.getMyApplications({
      status: activeStatus === 'All' ? undefined : activeStatus,
      search, page, limit: 10,
    }).then(r => r.data),
    keepPreviousData: true,
  });

  const statusCounts = data?.statusCounts || {};

  return (
    <div className="animate-fade-in max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Applications</h1>
          <p className="text-sm text-gray-500 mt-0.5">Track all your job applications</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 input w-64">
            <Search size={15} className="text-gray-400 flex-shrink-0" />
            <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search applications..."
              className="flex-1 outline-none text-sm bg-transparent" />
          </div>
        </div>
      </div>

      {/* Status Tabs */}
      <div className="flex gap-1 border-b border-gray-200 mb-6 overflow-x-auto hide-scrollbar">
        {STATUS_TABS.map(status => (
          <button key={status} onClick={() => { setActiveStatus(status); setPage(1); }}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors -mb-px whitespace-nowrap ${
              activeStatus === status
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}>
            {status}
            {statusCounts[status] !== undefined && (
              <span className={`inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-bold rounded-full ${
                activeStatus === status ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-600'
              }`}>
                {statusCounts[status]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Applications List */}
      {isLoading ? (
        <div className="space-y-3">
          {Array(5).fill(0).map((_, i) => (
            <div key={i} className="card p-5 animate-pulse flex gap-4">
              <div className="skeleton w-12 h-12 rounded-xl" />
              <div className="flex-1 space-y-2">
                <div className="skeleton h-4 w-1/2 rounded" />
                <div className="skeleton h-3 w-1/3 rounded" />
                <div className="skeleton h-3 w-1/4 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : data?.data?.length === 0 ? (
        <div className="text-center py-16 card-p">
          <Briefcase size={40} className="text-gray-300 mx-auto mb-3" />
          <h3 className="font-semibold text-gray-700 mb-1">No applications found</h3>
          <p className="text-sm text-gray-500 mb-4">
            {activeStatus === 'All' ? 'Start applying to jobs to track them here.' : `No ${activeStatus.toLowerCase()} applications.`}
          </p>
          <Link to="/jobs" className="btn-primary">Browse Jobs</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {data?.data?.map(app => {
            const job = app.job;
            const logoUrl = job?.company?.logo ? getAvatarUrl(job.company.logo) : null;
            return (
              <Link to={`/applications/${app._id}`} key={app._id} className="block card p-5 hover:shadow-card-hover transition-all duration-200 relative group hover:border-primary-200">
                <div className="flex items-center gap-4 pr-8">
                  <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                    {logoUrl ? <img src={logoUrl} alt="" className="w-full h-full object-contain p-1" /> : <Briefcase size={20} className="text-gray-400" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors truncate">{job?.title}</h3>
                        <p className="text-sm text-gray-600">{job?.company?.name}</p>
                      </div>
                      <div className="flex items-center flex-shrink-0">
                        <span className={getStatusColor(app.status)}>{app.status}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-500">
                      <span>📍 {formatLocation(job?.location)}</span>
                      <span>📋 {job?.jobType}</span>
                      <span className="font-semibold text-gray-700">{formatSalary(job?.salary)}</span>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                  <p className="text-xs text-gray-400 font-medium">
                    {app.status === 'Interview' && app.interviewDate
                      ? `Interview on ${new Date(app.interviewDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`
                      : app.status === 'Rejected'
                      ? `Rejected on ${formatRelativeDate(app.lastUpdated)}`
                      : `Applied on ${new Date(app.appliedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}`}
                  </p>
                </div>

                {/* Chevron */}
                <div className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-300 group-hover:text-primary-500 transition-colors">
                  <ChevronRight size={20} />
                </div>
              </Link>
            );
          })}
        </div>
      )}

      <Pagination page={page} pages={data?.pages} onPageChange={setPage} />
    </div>
  );
};

export default MyApplications;
