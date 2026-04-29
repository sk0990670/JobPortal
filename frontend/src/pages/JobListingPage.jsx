import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, SlidersHorizontal, X, ChevronDown } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { jobService } from '../services/jobService';
import JobCard from '../components/common/JobCard';
import Pagination from '../components/common/Pagination';

const JOB_TYPES = ['Full-time', 'Internship', 'Part-time', 'Contract', 'Remote'];
const LOCATIONS = ['Bangalore', 'Chennai', 'Hyderabad', 'Pune', 'Mumbai', 'Delhi'];
const BATCHES = ['2024', '2025', '2026', '2027', '2028 and above'];

// Each category expands into a set of keywords sent to the backend
const SKILL_CATEGORIES = {
  'Backend Development':    ['Node.js', 'Express', 'Spring Boot', 'Django', 'Flask', 'Java', 'PHP', 'Ruby on Rails', 'Go', 'FastAPI', 'NestJS', 'ASP.NET', 'Laravel'],
  'Frontend Development':  ['React', 'Angular', 'Vue.js', 'Next.js', 'TypeScript', 'JavaScript', 'HTML', 'CSS', 'Tailwind', 'Svelte', 'Redux'],
  'Cloud Computing':       ['AWS', 'Azure', 'GCP', 'Google Cloud', 'Cloud', 'S3', 'EC2', 'Lambda', 'Azure DevOps', 'Kubernetes', 'Terraform', 'CloudFormation'],
  'DevOps':                ['Docker', 'Kubernetes', 'Jenkins', 'CI/CD', 'Ansible', 'Terraform', 'Linux', 'Bash', 'GitHub Actions', 'ArgoCD', 'Helm', 'Prometheus', 'Grafana'],
  'Data Science':          ['Python', 'Pandas', 'NumPy', 'Matplotlib', 'Scikit-learn', 'SQL', 'R', 'Tableau', 'Power BI', 'Statistics', 'Data Analysis', 'Jupyter'],
  'Machine Learning':      ['TensorFlow', 'PyTorch', 'Keras', 'Scikit-learn', 'NLP', 'Deep Learning', 'Computer Vision', 'LLM', 'Hugging Face', 'OpenCV', 'BERT', 'GPT'],
  'MLOps':                 ['MLflow', 'Kubeflow', 'Airflow', 'DVC', 'Model Deployment', 'Feature Store', 'BentoML', 'Seldon', 'SageMaker', 'Vertex AI'],
  'Cyber Security':        ['Penetration Testing', 'SIEM', 'SOC', 'Ethical Hacking', 'Network Security', 'Cryptography', 'Vulnerability Assessment', 'Splunk', 'Wireshark', 'Kali Linux'],
  'Mobile App Development':['Flutter', 'React Native', 'Kotlin', 'Swift', 'Android', 'iOS', 'Dart', 'Ionic', 'Xamarin'],
  'Salesforce':            ['Salesforce', 'Apex', 'LWC', 'SOQL', 'Salesforce Admin', 'Sales Cloud', 'Service Cloud', 'CPQ', 'Einstein Analytics'],
  'ServiceNow':            ['ServiceNow', 'ITSM', 'ITOM', 'Flow Designer', 'Service Catalog', 'GlideScript', 'ServiceNow Admin', 'CSM'],
};

const FilterCheckbox = ({ label, checked, onChange }) => (
  <label className="flex items-center gap-2.5 cursor-pointer group">
    <input type="checkbox" checked={checked} onChange={onChange}
      className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-400 cursor-pointer" />
    <span className="text-sm text-gray-700 group-hover:text-gray-900">{label}</span>
  </label>
);

const JobListingPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [location, setLocation] = useState(searchParams.get('location') || '');
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [selectedBatches, setSelectedBatches] = useState([]);
  const [salary, setSalary] = useState([0, 150000]);
  const [sort, setSort] = useState('-createdAt');
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  // Expand selected categories into their full keyword lists
  const expandedKeywords = selectedSkills.flatMap(cat => SKILL_CATEGORIES[cat] ?? []);

  const queryParams = {
    search, location, sort, page, limit: 10,
    ...(selectedTypes.length && { jobType: selectedTypes.join(',') }),
    ...(expandedKeywords.length && { skills: expandedKeywords.join(',') }),
    ...(selectedBatches.length && { batch: selectedBatches.join(',') }),
    ...(salary[0] > 0 && { minSalary: salary[0] }),
    ...(salary[1] < 150000 && { maxSalary: salary[1] }),
  };

  const { data, isLoading, error } = useQuery({
    queryKey: ['jobs', queryParams],
    queryFn: () => jobService.getJobs(queryParams).then(r => r.data),
    keepPreviousData: true,
    staleTime: 2 * 60 * 1000,
  });

  const toggleType = (type) => setSelectedTypes(prev => prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]);
  const toggleSkill = (skill) => setSelectedSkills(prev => prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]);
  const toggleBatch = (batch) => setSelectedBatches(prev => prev.includes(batch) ? prev.filter(b => b !== batch) : [...prev, batch]);
  const clearAll = () => { setSelectedTypes([]); setSelectedSkills([]); setSelectedBatches([]); setSalary([0, 150000]); setLocation(''); setSearch(''); setPage(1); };

  return (
    <div className="page-container py-6 animate-fade-in">
      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex-1 flex items-center gap-2 input">
          <Search size={16} className="text-gray-400 flex-shrink-0" />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by title, role or keyword"
            className="flex-1 outline-none text-sm bg-transparent" />
        </div>
        <div className="flex items-center gap-2 input sm:w-56">
          <span className="text-gray-400">📍</span>
          <input value={location} onChange={e => { setLocation(e.target.value); setPage(1); }}
            placeholder="Location"
            className="flex-1 outline-none text-sm bg-transparent" />
        </div>
        <div className="relative">
          <select value={sort} onChange={e => setSort(e.target.value)}
            className="input appearance-none pr-8 cursor-pointer w-full sm:w-44">
            <option value="-createdAt">Most Recent</option>
            <option value="-salary.min">Highest Salary</option>
            <option value="title">A-Z</option>
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
        <button onClick={() => setShowFilters(!showFilters)}
          className="btn-secondary gap-2">
          <SlidersHorizontal size={16} />All Filters
        </button>
      </div>

      <div className="flex gap-6">
        {/* Sidebar Filters */}
        <aside className="w-52 flex-shrink-0 hidden lg:block">
          <div className="card-p sticky top-20">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Filters</h3>
              <button onClick={clearAll} className="text-xs text-primary-600 hover:text-primary-700 font-medium">Clear all</button>
            </div>

            {/* Job Type */}
            <div className="mb-5">
              <h4 className="text-sm font-semibold text-gray-700 mb-2.5">Job Type</h4>
              <div className="space-y-2">
                {JOB_TYPES.map(t => <FilterCheckbox key={t} label={t} checked={selectedTypes.includes(t)} onChange={() => toggleType(t)} />)}
              </div>
            </div>

            {/* Location */}
            <div className="mb-5">
              <h4 className="text-sm font-semibold text-gray-700 mb-2.5">Location</h4>
              <input value={location} onChange={e => setLocation(e.target.value)}
                placeholder="Search location..." className="input mb-2" />
              <div className="space-y-2">
                {LOCATIONS.map(l => <FilterCheckbox key={l} label={l} checked={location === l} onChange={() => setLocation(l === location ? '' : l)} />)}
              </div>
            </div>

            {/* Salary */}
            <div className="mb-5">
              <h4 className="text-sm font-semibold text-gray-700 mb-2.5">Stipend (Monthly)</h4>
              <input type="range" min={0} max={150000} step={5000} value={salary[1]}
                onChange={e => setSalary([salary[0], Number(e.target.value)])}
                className="w-full accent-primary-600" />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>₹0</span><span>₹{salary[1].toLocaleString()}+</span>
              </div>
            </div>

            {/* Skill Categories */}
            <div className="mb-5">
              <h4 className="text-sm font-semibold text-gray-700 mb-2.5">Skills</h4>
              <div className="space-y-3">
                {Object.entries(SKILL_CATEGORIES).map(([category, keywords]) => (
                  <div key={category}>
                    <FilterCheckbox
                      label={category}
                      checked={selectedSkills.includes(category)}
                      onChange={() => toggleSkill(category)}
                    />
                    {selectedSkills.includes(category) && (
                      <p className="text-xs text-gray-400 mt-1 ml-6 leading-relaxed">
                        {keywords.slice(0, 5).join(', ')}{keywords.length > 5 ? ` +${keywords.length - 5} more` : ''}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Batch */}
            <div className="mb-5">
              <h4 className="text-sm font-semibold text-gray-700 mb-2.5">Batch</h4>
              <div className="space-y-2">
                {BATCHES.map(b => <FilterCheckbox key={b} label={b} checked={selectedBatches.includes(b)} onChange={() => toggleBatch(b)} />)}
              </div>
            </div>

            <button onClick={() => setPage(1)} className="btn-primary w-full mt-2">
              Show {data?.total || 0} Jobs
            </button>
          </div>
        </aside>

        {/* Job List */}
        <div className="flex-1 min-w-0">
          {!isLoading && (
            <p className="text-sm text-gray-600 mb-4 font-medium">
              <span className="font-bold text-gray-900">{data?.total || 0}</span> jobs found
            </p>
          )}

          {isLoading ? (
            <div className="space-y-4">
              {Array(6).fill(0).map((_, i) => (
                <div key={i} className="card p-4 animate-pulse">
                  <div className="flex gap-3">
                    <div className="skeleton w-12 h-12 rounded-xl" />
                    <div className="flex-1 space-y-2">
                      <div className="skeleton h-4 w-2/3 rounded" />
                      <div className="skeleton h-3 w-1/3 rounded" />
                      <div className="skeleton h-3 w-1/2 rounded" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-12 text-red-500">Failed to load jobs. Please try again.</div>
          ) : data?.data?.length === 0 ? (
            <div className="text-center py-16 card-p">
              <Search size={40} className="text-gray-300 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-700 mb-1">No jobs found</h3>
              <p className="text-sm text-gray-500">Try adjusting your filters or search terms.</p>
              <button onClick={clearAll} className="btn-primary mt-4">Clear Filters</button>
            </div>
          ) : (
            <div className="space-y-3">
              {data?.data?.map(job => <JobCard key={job._id} job={job} />)}
            </div>
          )}

          <Pagination page={page} pages={data?.pages} onPageChange={setPage} />
        </div>
      </div>
    </div>
  );
};

export default JobListingPage;
