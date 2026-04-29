import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Filter, MapPin, Clock, Bookmark, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { jobService } from '../services/jobService';
import { formatSalary, formatRelativeDate, formatLocation, getAvatarUrl } from '../utils/formatters';
import Pagination from '../components/common/Pagination';
import { Briefcase } from 'lucide-react';

const CATEGORIES = ['All Categories', 'Software Engineering', 'Data Science', 'Product Management', 'Design', 'Marketing', 'Finance'];
const LOCATIONS = ['All Locations', 'Bangalore', 'Chennai', 'Hyderabad', 'Mumbai', 'Delhi', 'Pune'];
const DURATIONS = ['All Durations', '1-3 Months', '3-6 Months', '6-12 Months', '12+ Months'];

const InternshipPage = () => {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState('');
  const [duration, setDuration] = useState('');
  const [sort, setSort] = useState('-createdAt');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['internships', search, category, location, duration, sort, page],
    queryFn: () => jobService.getInternships({ search, location, duration, sort, page, limit: 10 }).then(r => r.data),
    keepPreviousData: true,
  });

  const { data: featuredData } = useQuery({
    queryKey: ['featured-internships'],
    queryFn: () => jobService.getInternships({ limit: 3, isFeatured: true }).then(r => r.data),
    staleTime: 5 * 60 * 1000,
  });

  return (
    <div className="page-container py-6 animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Internships</h1>
        <p className="text-gray-500 mt-0.5">Discover and apply to the best internships to kickstart your career.</p>
      </div>

      {/* Search + Filter Bar */}
      <div className="flex gap-3 mb-5">
        <div className="flex-1 flex items-center gap-2 input">
          <Search size={16} className="text-gray-400 flex-shrink-0" />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search internships by role, skills or company..."
            className="flex-1 outline-none text-sm bg-transparent" />
        </div>
        <button className="btn-secondary gap-2"><Filter size={16} />Filter</button>
      </div>

      {/* Filter Dropdowns */}
      <div className="flex gap-3 mb-5 flex-wrap">
        {[
          { label: 'Category', options: CATEGORIES, value: category, onChange: setCategory },
          { label: 'Location', options: LOCATIONS, value: location, onChange: setLocation },
          { label: 'Duration', options: DURATIONS, value: duration, onChange: setDuration },
        ].map(({ label, options, value, onChange }) => (
          <div key={label} className="relative">
            <select value={value} onChange={e => { onChange(e.target.value); setPage(1); }}
              className="input pr-7 appearance-none cursor-pointer text-sm min-w-36">
              {options.map(o => <option key={o} value={o === `All ${label}s` || o.startsWith('All') ? '' : o}>{o}</option>)}
            </select>
            <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        ))}
        <div className="relative">
          <select value={sort} onChange={e => setSort(e.target.value)}
            className="input pr-7 appearance-none cursor-pointer text-sm min-w-28">
            <option value="-createdAt">Newest</option>
            <option value="-salary.min">Highest Salary</option>
            <option value="title">A-Z</option>
          </select>
          <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
      </div>

      <p className="text-sm text-gray-600 mb-4 font-medium">
        Showing <span className="font-bold text-gray-900">{data?.total || 0}</span> internships
      </p>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main List */}
        <div className="lg:col-span-2">
          {isLoading ? (
            <div className="space-y-4">
              {Array(5).fill(0).map((_, i) => <div key={i} className="card p-5 h-28 skeleton animate-pulse" />)}
            </div>
          ) : data?.data?.length === 0 ? (
            <div className="card-p text-center py-12">
              <Briefcase size={36} className="text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500">No internships found. Try different filters.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {data?.data?.map(job => {
                const logoUrl = job.companyLogo || (job.company?.logo ? getAvatarUrl(job.company.logo) : null);
                return (
                  <Link key={job._id} to={`/jobs/${job._id}`}>
                    <div className="card p-5 hover:border-primary-200 hover:shadow-card-hover transition-all">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                          {logoUrl ? <img src={logoUrl} alt="" className="w-full h-full object-contain p-1" /> : <Briefcase size={20} className="text-gray-400" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <h3 className="font-semibold text-gray-900 hover:text-primary-600 transition-colors">{job.title}</h3>
                              <p className="text-sm text-gray-600">{job.company?.name}</p>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <p className="font-bold text-primary-600 text-sm">{formatSalary(job.salary)}</p>
                              <p className="text-xs text-gray-400">Posted {formatRelativeDate(job.createdAt)}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                            <span className="flex items-center gap-1"><MapPin size={11} />{formatLocation(job.location)}</span>
                            {job.duration && <span className="flex items-center gap-1"><Clock size={11} />{job.duration}</span>}
                            <span>{job.workMode}</span>
                          </div>
                          <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                            {job.skills?.slice(0, 3).map((s, i) => <span key={i} className="badge-blue">{s}</span>)}
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-end mt-3">
                        <button className="btn-primary btn-sm">Apply Now</button>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
          <Pagination page={page} pages={data?.pages} onPageChange={setPage} />
        </div>

        {/* Right Sidebar */}
        <div className="space-y-5">
          {/* Featured */}
          <div className="card-p">
            <div className="section-header mb-3">
              <h3 className="font-semibold text-gray-900">Featured Internships</h3>
              <button className="section-link text-xs">View all</button>
            </div>
            <div className="space-y-3">
              {(featuredData?.data || []).slice(0, 3).map(job => {
                const logoUrl = job.companyLogo || (job.company?.logo ? getAvatarUrl(job.company.logo) : null);
                return (
                  <Link key={job._id} to={`/jobs/${job._id}`}
                    className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors">
                    <div className="w-9 h-9 rounded-lg bg-gray-100 border flex items-center justify-center overflow-hidden flex-shrink-0">
                      {logoUrl ? <img src={logoUrl} alt="" className="w-full h-full object-contain p-0.5" /> : <Briefcase size={14} className="text-gray-400" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{job.title}</p>
                      <p className="text-xs text-gray-500">{job.company?.name}</p>
                      <div className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
                        <MapPin size={10} />{formatLocation(job.location)}
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-primary-600 flex-shrink-0">{formatSalary(job.salary)}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Why Intern */}
          <div className="card-p bg-primary-50 border-primary-100">
            <h3 className="font-semibold text-primary-900 mb-3">Why Intern with Us?</h3>
            {['Learn from industry experts', 'Work on real-world projects', 'Certificate of completion', 'Pre-placement opportunities'].map((item, i) => (
              <div key={i} className="flex items-center gap-2 mb-2 text-sm text-primary-800">
                <span className="w-4 h-4 rounded-full bg-primary-500 flex-shrink-0 flex items-center justify-center">
                  <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </span>
                {item}
              </div>
            ))}
          </div>

          {/* Internship Guide */}
          <div className="card-p">
            <div className="section-header mb-3">
              <h3 className="font-semibold text-gray-900">Internship Guide</h3>
              <button className="section-link text-xs">View all</button>
            </div>
            {[
              { title: 'How to Find the Right Internship', time: '5 min read' },
              { title: 'Resume Tips for Internship Applications', time: '7 min read' },
              { title: 'Ace Your Internship Interview', time: '6 min read' },
            ].map((g, i) => (
              <Link key={i} to="/resources" className="flex items-center gap-2 py-2 hover:text-primary-600 transition-colors group">
                <div className="w-1.5 h-1.5 rounded-full bg-primary-400 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm text-gray-700 group-hover:text-primary-600">{g.title}</p>
                  <p className="text-xs text-gray-400">{g.time}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InternshipPage;
