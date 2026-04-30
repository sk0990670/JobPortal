import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, MapPin, Building2, ChevronDown, Briefcase } from 'lucide-react';
import { Link } from 'react-router-dom';
import { companyService } from '../services/applicationService';
import { getAvatarUrl, getInitials } from '../utils/formatters';

const INDUSTRIES = ['Software Development', 'Internet Services', 'Aerospace & Defense', 'Data & Analytics', 'E-commerce', 'IT Services', 'Finance'];
const SORT_OPTIONS = [
  { label: 'Most Openings', value: '-openings' },
  { label: 'A - Z', value: 'name' },
  { label: 'Z - A', value: '-name' },
  { label: 'Recently Added', value: '-createdAt' },
];

const CompaniesPage = () => {
  const [search, setSearch] = useState('');
  const [location, setLocation] = useState('');
  const [industry, setIndustry] = useState('');
  const [sort, setSort] = useState('-openings');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['companies', search, location, industry, sort, page],
    queryFn: () => companyService.getCompanies({
      search, location, industry, sort, page, limit: 12,
    }).then(r => r.data),
    keepPreviousData: true,
  });


  return (
    <div className="page-container py-6 animate-fade-in">
      <div className="flex gap-6">
        {/* Sidebar Filters */}
        <aside className="w-52 flex-shrink-0 hidden lg:block">
          <div className="card-p sticky top-20">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Filters</h3>
              <button onClick={() => { setIndustry(''); setLocation(''); }}
                className="text-xs text-primary-600 font-medium hover:text-primary-700">Clear all</button>
            </div>

            <div className="mb-5">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Search Companies</h4>
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search by company name" className="input text-sm" />
            </div>

            <div className="mb-5">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Location</h4>
              <div className="relative">
                <select value={location} onChange={e => setLocation(e.target.value)} className="input pr-7 appearance-none cursor-pointer text-sm">
                  <option value="">All Locations</option>
                  <option>Bangalore, India</option>
                  <option>Chennai, India</option>
                  <option>Mumbai, India</option>
                  <option>USA</option>
                  <option>France</option>
                </select>
                <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>


            <div className="mb-5">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Industry</h4>
              <div className="relative">
                <select value={industry} onChange={e => setIndustry(e.target.value)} className="input pr-7 appearance-none cursor-pointer text-sm">
                  <option value="">All Industries</option>
                  {INDUSTRIES.map(i => <option key={i}>{i}</option>)}
                </select>
                <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <div className="mb-5">
              <h4 className="text-sm font-semibold text-gray-700 mb-2.5">Sort By</h4>
              <div className="space-y-2">
                {SORT_OPTIONS.map(o => (
                  <label key={o.value} className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="sort" value={o.value} checked={sort === o.value} onChange={() => setSort(o.value)}
                      className="w-4 h-4 text-primary-600 focus:ring-primary-400" />
                    <span className="text-sm text-gray-700">{o.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <button className="btn-primary w-full">Apply Filters</button>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-600">
              <span className="font-bold text-gray-900">{data?.total || 0}</span> companies found
            </p>
            <div className="relative">
              <select value={sort} onChange={e => setSort(e.target.value)} className="input pr-7 appearance-none cursor-pointer text-sm">
                {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Array(8).fill(0).map((_, i) => <div key={i} className="card-p h-52 skeleton animate-pulse" />)}
            </div>
          ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {(data?.data || []).map((company, idx) => {
                const logoUrl = company.logo ? getAvatarUrl(company.logo) : null;
                const colors = [
                  'bg-blue-100 text-blue-600', 'bg-purple-100 text-purple-600',
                  'bg-green-100 text-green-600', 'bg-orange-100 text-orange-600',
                  'bg-pink-100 text-pink-600', 'bg-indigo-100 text-indigo-600',
                ];
                const colorClass = colors[idx % colors.length];
                const websiteUrl = company.website
                  ? (company.website.startsWith('http') ? company.website : `https://${company.website}`)
                  : null;
                return (
                  <div key={company._id}
                    className="card-p flex flex-col items-center text-center hover:border-primary-200 hover:shadow-card-hover transition-all group">
                    <div className={`w-16 h-16 rounded-2xl border border-gray-200 flex items-center justify-center overflow-hidden mb-3 ${logoUrl ? 'bg-gray-100' : colorClass}`}>
                      {logoUrl
                        ? <img src={logoUrl} alt={company.name} className="w-full h-full object-contain p-2" />
                        : <span className="text-xl font-bold">{getInitials(company.name)}</span>
                      }
                    </div>
                    <h3 className="font-bold text-gray-900 text-sm group-hover:text-primary-600 transition-colors">{company.name}</h3>
                    <p className="text-xs text-gray-500 mt-0.5">{company.industry}</p>
                    <p className="text-xs text-gray-400 flex items-center gap-0.5 mt-0.5 justify-center">
                      <MapPin size={10} />{company.headquarters?.city && `${company.headquarters.city}, `}{company.headquarters?.country}
                    </p>
                    <div className="flex items-center justify-center mt-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1"><Briefcase size={11} />{company.openings} Openings</span>
                    </div>
                    <Link to={`/jobs?search=${encodeURIComponent(company.name)}`}
                      className="mt-3 text-xs font-medium text-primary-600 hover:text-primary-700 transition-colors inline-flex items-center gap-1">
                      View Openings →
                    </Link>
                  </div>
                );
              })}
            </div>
          )}

          {/* CTA Banner */}
          <div className="card-p mt-6 flex items-center justify-between bg-gradient-to-r from-primary-50 to-indigo-50 border-primary-100">
            <div>
              <h3 className="font-bold text-gray-900">Don't find your dream company?</h3>
              <p className="text-sm text-gray-600">Get notified when new companies post jobs.</p>
            </div>
            <button className="btn-primary gap-2">🔔 Create Job Alert</button>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-center gap-2 mt-6">
            {Array.from({ length: Math.min(data?.pages || 1, 5) }, (_, i) => i + 1).map(p => (
              <button key={p} onClick={() => setPage(p)}
                className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors border ${
                  p === page ? 'bg-primary-600 text-white border-primary-600' : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}>{p}</button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompaniesPage;
