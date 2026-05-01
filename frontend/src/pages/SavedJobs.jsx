import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, ChevronDown, Bookmark, BookmarkCheck, MapPin, Briefcase } from 'lucide-react';
import { Link } from 'react-router-dom';
import { userService } from '../services/userService';
import { formatSalary, formatLocation, formatRelativeDate, getAvatarUrl } from '../utils/formatters';
import Pagination from '../components/common/Pagination';
import toast from 'react-hot-toast';

const SavedJobs = () => {
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('-createdAt');
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['saved-jobs', search, sort, page],
    queryFn: () => userService.getSavedJobs({ search, sort, page, limit: 10 }).then(r => r.data),
  });

  const unsaveMutation = useMutation({
    mutationFn: (jobId) => userService.toggleSaveJob(jobId),
    onSuccess: () => {
      toast.success('Job removed from saved list');
      queryClient.invalidateQueries(['saved-jobs']);
    },
  });

  const jobs = data?.data || [];

  return (
    <div className="animate-fade-in max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            Saved Jobs
            <span className="bg-primary-100 text-primary-700 text-sm px-2.5 py-0.5 rounded-full font-bold">
              {data?.count || 0}
            </span>
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">Jobs you've saved for later</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 input w-56">
            <Search size={15} className="text-gray-400 flex-shrink-0" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search saved jobs" className="flex-1 outline-none text-sm bg-transparent" />
          </div>
          <div className="relative">
            <select value={sort} onChange={e => setSort(e.target.value)}
              className="input pr-7 appearance-none cursor-pointer text-sm">
              <option value="-createdAt">Newest First</option>
              <option value="createdAt">Oldest First</option>
              <option value="-salary.min">Highest Salary</option>
            </select>
            <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array(5).fill(0).map((_, i) => <div key={i} className="card p-5 h-24 skeleton animate-pulse" />)}
        </div>
      ) : jobs.length === 0 ? (
        <div className="card-p text-center py-16">
          <Bookmark size={40} className="text-gray-300 mx-auto mb-3" />
          <h3 className="font-semibold text-gray-700 mb-1">No saved jobs</h3>
          <p className="text-sm text-gray-500 mb-4">Bookmark jobs you're interested in to view them here.</p>
          <Link to="/jobs" className="btn-primary">Browse Jobs</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {jobs.map(job => {
            const logoUrl = job?.company?.logo ? getAvatarUrl(job.company.logo) : null;
            return (
              <div key={job._id} className="card p-5 hover:border-primary-200 hover:shadow-card-hover transition-all">
                <div className="flex items-start gap-4">
                  <Link to={`/jobs/${job._id}`} className="w-12 h-12 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0 mt-1">
                    {logoUrl ? <img src={logoUrl} alt="" className="w-full h-full object-contain p-1" /> : <Briefcase size={20} className="text-gray-400" />}
                  </Link>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div className="min-w-0">
                        <Link to={`/jobs/${job._id}`}>
                          <h3 className="font-semibold text-gray-900 hover:text-primary-600 transition-colors truncate">{job.title}</h3>
                        </Link>
                        <p className="text-sm text-gray-600">{job.company?.name}</p>
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                          <span className="badge-purple">{job.jobType}</span>
                          {job.workMode && <span className="badge-gray">{job.workMode}</span>}
                        </div>
                      </div>
                      <div className="flex flex-col sm:items-end gap-3 flex-shrink-0 mt-2 sm:mt-0">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-bold text-gray-700">{formatSalary(job.salary)}</span>
                          <button onClick={() => unsaveMutation.mutate(job._id)}
                            disabled={unsaveMutation.isLoading}
                            className="p-1.5 rounded-lg text-primary-600 hover:text-red-600 hover:bg-red-50 transition-colors group relative"
                            title="Remove from saved">
                            <BookmarkCheck size={18} className="block group-hover:hidden" />
                            <Bookmark size={18} className="hidden group-hover:block" />
                          </button>
                        </div>
                        <Link to={`/jobs/${job._id}`} className="btn-primary py-1.5 px-4 text-xs w-full text-center justify-center sm:w-auto">
                          Apply Now
                        </Link>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-100 text-xs text-gray-500 font-medium flex-wrap">
                      <span className="flex items-center gap-1"><MapPin size={12} /> {formatLocation(job.companyLocation)}</span>
                      <span className="text-gray-300">&bull;</span>
                      <span>{job.jobType}</span>
                      <span className="text-gray-300">&bull;</span>
                      <span>Saved {formatRelativeDate(job.createdAt)}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      <Pagination page={page} pages={Math.ceil((data?.count || 0) / 10)} onPageChange={setPage} />
    </div>
  );
};

export default SavedJobs;
