import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Filter, MapPin, Clock, Bookmark, ChevronDown, Briefcase } from 'lucide-react';
import { Link } from 'react-router-dom';
import { jobService } from '../services/jobService';
import { formatSalary, formatRelativeDate, formatLocation, getAvatarUrl } from '../utils/formatters';
import Pagination from '../components/common/Pagination';

const LOCATIONS = ['All Locations', 'Bangalore', 'Chennai', 'Hyderabad', 'Mumbai', 'Delhi', 'Pune'];
const STIPEND_TYPES = ['All Stipend Types', 'Paid', 'Unpaid'];
const PPO_OPTIONS = ['All PPO Options', 'PPO Available'];

const InternshipPage = () => {
  const [search, setSearch] = useState('');
  const [location, setLocation] = useState('');
  const [isPaid, setIsPaid] = useState('');
  const [ppo, setPpo] = useState('');
  const [sort, setSort] = useState('-createdAt');
  const [page, setPage] = useState(1);

  const queryParams = {
    search, 
    page, 
    limit: 10, 
    sort,
    isFeatured: false, // Ensure organic search results only
    ...(location && { location }),
    ...(isPaid === 'Paid' ? { minSalary: 1 } : isPaid === 'Unpaid' ? { maxSalary: 0 } : {}),
    ...(ppo === 'PPO Available' && { ppoAvailable: true }),
  };

  const { data, isLoading } = useQuery({
    queryKey: ['internships', queryParams],
    queryFn: () => jobService.getInternships(queryParams).then(r => r.data),
    keepPreviousData: true,
    staleTime: 2 * 60 * 1000, // 2 minutes — show cached data instantly on revisit
  });

  const { data: featuredData } = useQuery({
    queryKey: ['featured-internships'],
    queryFn: () => jobService.getInternships({ limit: 4, isFeatured: true }).then(r => r.data),
    staleTime: 5 * 60 * 1000,
  });

  const { data: resourceData } = useQuery({
    queryKey: ['resources-public'],
    queryFn: async () => {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/resources?limit=10`);
      return res.json();
    },
    staleTime: 5 * 60 * 1000,
  });
  const internshipGuides = resourceData?.data?.filter(r => r.isPublished).slice(0, 3) || [];

  return (
    <div className="page-container py-6 animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Internships</h1>
        <p className="text-gray-500 mt-0.5">Discover and apply to the best internships to kickstart your career.</p>
      </div>

      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="flex-1 flex items-center gap-2 input py-2">
          <Search size={16} className="text-gray-400 flex-shrink-0" />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search internships by role, skills or company..."
            className="flex-1 outline-none text-sm bg-transparent py-0 leading-none h-full" />
        </div>
      </div>

      {/* Filter Dropdowns Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6 w-full">
        {[
          { label: 'Location', options: LOCATIONS, value: location, onChange: setLocation },
          { label: 'Stipend Type', options: STIPEND_TYPES, value: isPaid, onChange: setIsPaid },
          { label: 'PPO Option', options: PPO_OPTIONS, value: ppo, onChange: setPpo },
        ].map(({ label, options, value, onChange }) => (
          <div key={label} className="relative">
            <select value={value} onChange={e => { onChange(e.target.value); setPage(1); }}
              className="input pr-7 appearance-none cursor-pointer text-sm w-full">
              {options.map(o => <option key={o} value={o === `All ${label}s` || o.startsWith('All') ? '' : o}>{o}</option>)}
            </select>
            <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        ))}
      </div>

      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-gray-600 font-medium">
          Showing <span className="font-bold text-gray-900">{data?.total || 0}</span> internships
        </p>
        <div className="relative">
          <select value={sort} onChange={e => setSort(e.target.value)}
            className="input pr-7 py-1.5 appearance-none cursor-pointer text-sm w-36">
            <option value="-createdAt">Newest</option>
            <option value="-salary.min">Highest Salary</option>
            <option value="title">A-Z</option>
          </select>
          <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
      </div>

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
                    <div className="card p-5 hover:border-primary-300 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                          {logoUrl ? (
                            <img src={logoUrl} alt={job.company?.name || 'Company'} className="w-full h-full object-contain p-1" />
                          ) : (
                            <span className="text-lg font-bold text-gray-400">{(job.company?.name || 'U')[0]}</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <div className="flex items-center flex-wrap gap-2 mb-0.5">
                                <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                                  {job.title || 'Internship Role'}
                                </h3>
                                {job.ppoAvailable && (
                                  <span className="badge bg-green-100 text-green-700 text-[10px] font-bold tracking-wide uppercase px-1.5">
                                    PPO Available
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-gray-600">{job.company?.name || 'Unknown Company'}</p>
                            </div>
                            <div className="text-right flex-shrink-0">
                              {(() => {
                                const salaryText = formatSalary(job.salary);
                                const isNotDisclosed = salaryText === 'Not disclosed';
                                return (
                                  <p className={`text-sm ${isNotDisclosed ? 'text-gray-500 font-medium' : 'font-bold text-primary-600'}`}>
                                    {salaryText}
                                  </p>
                                );
                              })()}
                              <p className="text-xs text-gray-400 mt-0.5">Posted {formatRelativeDate(job.createdAt)}</p>
                            </div>
                          </div>
                          <div className="flex items-center flex-wrap gap-x-4 gap-y-2 mt-2 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <MapPin size={11} />{formatLocation(job.companyLocation) || 'Not specified'}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock size={11} />{job.duration || 'Flexible duration'}
                            </span>
                            <span className="flex items-center gap-1">
                              <Briefcase size={11} />{job.workMode || 'Work mode not specified'}
                            </span>
                          </div>

                        </div>
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
              {(featuredData?.data || []).length > 0 ? (
                featuredData.data.slice(0, 4).map(job => {
                  const logoUrl = job.companyLogo || (job.company?.logo ? getAvatarUrl(job.company.logo) : null);
                  return (
                    <Link key={job._id} to={`/jobs/${job._id}`}
                      className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors group">
                      <div className="w-9 h-9 rounded-lg bg-gray-100 border flex items-center justify-center overflow-hidden flex-shrink-0">
                        {logoUrl ? (
                          <img src={logoUrl} alt="" className="w-full h-full object-contain p-0.5" />
                        ) : (
                          <span className="text-sm font-bold text-gray-400">{(job.company?.name || 'U')[0]}</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate group-hover:text-primary-600 transition-colors">
                          {job.title || 'Featured Role'}
                        </p>
                        <p className="text-xs text-gray-500 truncate">{job.company?.name || 'Unknown Company'}</p>
                        <div className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
                          <MapPin size={10} />{formatLocation(job.companyLocation) || 'Not specified'}
                        </div>
                      </div>
                    </Link>
                  );
                })
              ) : (
                <p className="text-xs text-gray-500 py-2">No featured internships currently.</p>
              )}
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
              <Link to="/resources" className="section-link text-xs">View all</Link>
            </div>
            {internshipGuides.length > 0 ? (
              internshipGuides.map((guide) => (
                <Link key={guide._id} to="/resources" className="flex items-center gap-2 py-2 hover:text-primary-600 transition-colors group">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary-400 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-700 group-hover:text-primary-600 line-clamp-1">{guide.title}</p>
                    <p className="text-xs text-gray-400">{guide.readTime} min read</p>
                  </div>
                </Link>
              ))
            ) : (
              <p className="text-xs text-gray-500 py-2">No guides available currently.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InternshipPage;
