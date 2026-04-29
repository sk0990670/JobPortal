import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, MapPin, BriefcaseBusiness, Briefcase, Star, ChevronRight, Building2, TrendingUp, Users, Award, ChevronDown } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { jobService } from '../services/jobService';
import { companyService } from '../services/applicationService';
import JobCard from '../components/common/JobCard';
import { formatSalary, formatRelativeDate, getAvatarUrl, formatLocation } from '../utils/formatters';
import heroIllustration from '../assets/hero-illustration.png';

const POPULAR_SEARCHES = ['Software Engineer', 'AI/ML Intern', 'Data Analyst', 'Flutter Developer', 'Product Intern'];

const StatCard = ({ icon: Icon, color, value, label }) => (
  <div className="flex items-center gap-4 p-5 card-p">
    <div className={`w-12 h-12 rounded-full ${color} flex items-center justify-center`}>
      <Icon size={22} className="text-white" />
    </div>
    <div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-500">{label}</p>
    </div>
  </div>
);

const LandingPage = () => {
  const [search, setSearch]         = useState('');
  const [location, setLocation]     = useState('');
  const [jobType, setJobType]       = useState('');
  const [jobTypeOpen, setJobTypeOpen] = useState(false);
  const closeTimer = useRef(null);
  const navigate = useNavigate();

  const handleMenuLeave  = () => { closeTimer.current = setTimeout(() => setJobTypeOpen(false), 400); };
  const handleMenuEnter  = () => { if (closeTimer.current) clearTimeout(closeTimer.current); };

  const { data: featuredData } = useQuery({
    queryKey: ['featured-jobs'],
    queryFn: () => jobService.getFeaturedJobs().then(r => r.data),
    staleTime: 5 * 60 * 1000,
  });

  const { data: companiesData } = useQuery({
    queryKey: ['featured-companies'],
    queryFn: () => companyService.getFeaturedCompanies().then(r => r.data),
    staleTime: 5 * 60 * 1000,
  });

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (location) params.set('location', location);
    if (jobType) params.set('jobType', jobType);
    navigate(`/jobs?${params.toString()}`);
  };

  return (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-10 sm:py-16 px-4">
        <div className="page-container">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white rounded-full border border-gray-200 shadow-sm text-xs text-gray-600 mb-5">
                <Star size={12} className="text-yellow-400 fill-yellow-400" />
                Find the right opportunity
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 leading-tight mb-4">
                Find Opportunities.<br />
                Kickstart <span className="text-gradient">Your Career</span>
              </h1>
              <p className="text-base sm:text-lg text-gray-600 mb-6 sm:mb-8">
                Discover internships and entry-level jobs from top companies and build your future.
              </p>

              {/* Search Bar */}
              <form onSubmit={handleSearch} className="mb-5">
                {/* Mobile: stacked layout | Desktop: single-row pill */}
                <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-2 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-0">
                  {/* Job title */}
                  <div className="flex items-center gap-2 sm:flex-[1.5] min-w-0 px-3 py-2">
                    <Search size={16} className="text-gray-400 flex-shrink-0" />
                    <input
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                      placeholder="Job title, role or keyword"
                      className="flex-1 min-w-0 text-sm outline-none bg-transparent placeholder-gray-400"
                    />
                  </div>
                  {/* Divider (desktop only) */}
                  <div className="hidden sm:block w-px h-6 bg-gray-200 flex-shrink-0" />
                  <div className="block sm:hidden h-px bg-gray-100 mx-3" />
                  {/* Location */}
                  <div className="flex items-center gap-2 sm:flex-1 min-w-0 px-3 py-2">
                    <MapPin size={16} className="text-gray-400 flex-shrink-0" />
                    <input
                      value={location}
                      onChange={e => setLocation(e.target.value)}
                      placeholder="Location"
                      className="flex-1 min-w-0 text-sm outline-none bg-transparent placeholder-gray-400"
                    />
                  </div>
                  {/* Divider (desktop only) */}
                  <div className="hidden sm:block w-px h-6 bg-gray-200 flex-shrink-0" />
                  <div className="block sm:hidden h-px bg-gray-100 mx-3" />
                  {/* Job Type — custom dropdown */}
                  <div className="flex items-center gap-2 flex-shrink-0 px-3 py-2 relative">
                    <BriefcaseBusiness size={16} className="text-gray-400 flex-shrink-0" />
                    <div className="relative flex-1 sm:flex-none" onMouseLeave={handleMenuLeave} onMouseEnter={handleMenuEnter}>
                      <button
                        type="button"
                        onClick={() => setJobTypeOpen(o => !o)}
                        className="flex items-center gap-2 text-sm outline-none bg-transparent cursor-pointer w-full sm:w-36 text-left"
                      >
                        <span className={jobType ? 'text-gray-900 font-medium' : 'text-gray-400'}>
                          {jobType || 'Select Job Type'}
                        </span>
                        <ChevronDown size={14} className="text-gray-400 flex-shrink-0 ml-auto" />
                      </button>

                      {jobTypeOpen && (
                        <div className="absolute top-full left-0 mt-2 w-44 bg-white border border-gray-200 rounded-xl shadow-lg z-50 py-1 animate-fade-in">
                          {['Full-time', 'Internship', 'Part-time', 'Remote'].map(type => (
                            <button
                              key={type}
                              type="button"
                              onClick={() => { setJobType(type); setJobTypeOpen(false); }}
                              className={`w-full text-left px-4 py-2.5 text-sm font-medium text-gray-900 hover:bg-gray-50 transition-colors ${jobType === type ? 'bg-primary-50 text-primary-700' : ''}`}
                            >
                              {type}
                            </button>
                          ))}
                          {jobType && (
                            <button
                              type="button"
                              onClick={() => { setJobType(''); setJobTypeOpen(false); }}
                              className="w-full text-left px-4 py-2 text-xs text-gray-400 hover:text-red-500 border-t border-gray-100 mt-1"
                            >
                              Clear selection
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  {/* Search Button */}
                  <button type="submit" className="btn-primary sm:ml-1 px-6 rounded-xl flex-shrink-0 w-full sm:w-auto py-3 sm:py-2">
                    Search Jobs
                  </button>
                </div>
              </form>

              {/* Popular searches */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm text-gray-500 font-medium">Popular Searches:</span>
                {POPULAR_SEARCHES.map(s => (
                  <button key={s} onClick={() => navigate(`/jobs?search=${s}`)}
                    className="text-xs px-2.5 py-1 rounded-full bg-white border border-gray-200 text-gray-600 hover:border-primary-300 hover:text-primary-600 transition-colors shadow-sm">
                    {s}
                  </button>
                ))}
                <button onClick={() => navigate('/jobs')} className="text-xs text-primary-600 font-medium hover:underline">View all</button>
              </div>
            </div>

            {/* Hero illustration */}
            <div className="hidden lg:flex items-center justify-center">
              <img
                src={heroIllustration}
                alt="Find your dream job illustration"
                className="w-full max-w-xl object-contain drop-shadow-xl"
                style={{ maxHeight: '550px' }}
                fetchpriority="high"
                loading="eager"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-8 bg-white border-b border-gray-100">
        <div className="page-container grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard icon={BriefcaseBusiness} color="bg-primary-500" value="10K+" label="Active Jobs" />
          <StatCard icon={Building2} color="bg-green-500" value="500+" label="Top Companies" />
          <StatCard icon={Users} color="bg-orange-400" value="50K+" label="Students Placed" />
          <StatCard icon={Star} color="bg-blue-500" value="4.8/5" label="User Rating" />
        </div>
      </section>

      {/* Top Companies */}
      <section className="py-10 bg-white">
        <div className="page-container">
          <div className="section-header">
            <h2 className="section-title text-xl">Top Companies Hiring</h2>
            <Link to="/companies" className="section-link flex items-center gap-1">View all companies <ChevronRight size={14} /></Link>
          </div>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            {(companiesData?.data || []).slice(0, 5).map(company => (
              <Link key={company._id} to={`/companies/${company._id}`}
                className="card p-4 flex items-center justify-center hover:border-primary-200 transition-all">
                {company.logo ? (
                  <img src={getAvatarUrl(company.logo)} alt={company.name} className="h-8 object-contain" />
                ) : (
                  <span className="font-bold text-gray-700 text-sm">{company.name}</span>
                )}
              </Link>
            ))}
            <Link to="/companies" className="card p-4 flex flex-col items-center justify-center text-primary-600 hover:bg-primary-50 transition-colors">
              <Building2 size={20} className="mb-1" />
              <span className="text-xs font-medium">View all</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Jobs */}
      <section className="py-10 bg-gray-50">
        <div className="page-container">
          <div className="section-header">
            <h2 className="section-title text-xl">Featured Opportunities</h2>
            <Link to="/jobs" className="section-link flex items-center gap-1">View all jobs <ChevronRight size={14} /></Link>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {(featuredData?.data || Array(4).fill(null)).map((job, i) => (
              job ? <JobCard key={job._id} job={job} />
              : <div key={i} className="card p-4 animate-pulse h-40 bg-gray-200 rounded-xl" />
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-10 sm:py-14 bg-gradient-to-r from-primary-600 to-indigo-600">
        <div className="page-container text-center text-white">
          <TrendingUp size={40} className="mx-auto mb-4 opacity-80" />
          <h2 className="text-2xl sm:text-3xl font-bold mb-3">Ready to Kickstart Your Career?</h2>
          <p className="text-primary-100 mb-6 max-w-md mx-auto text-sm sm:text-base">Join thousands of students finding internships and jobs at top companies.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to="/signup" className="btn bg-white text-primary-700 hover:bg-primary-50 font-semibold px-6 py-3 rounded-xl w-full sm:w-auto">
              Get Started Free
            </Link>
            <Link to="/jobs" className="btn border border-white/50 text-white hover:bg-white/10 font-semibold px-6 py-3 rounded-xl w-full sm:w-auto">
              Browse Jobs
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
