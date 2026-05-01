import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MapPin, Clock, Briefcase, Globe, Share2, ChevronLeft, Bookmark, BookmarkCheck, ExternalLink, Building2 } from 'lucide-react';
import { jobService } from '../services/jobService';
import { applicationService } from '../services/applicationService';
import { formatSalary, formatRelativeDate, formatLocation, getAvatarUrl, getStatusColor } from '../utils/formatters';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated, selectUser } from '../store/slices/authSlice';
import { userService } from '../services/userService';
import toast from 'react-hot-toast';

const JobDetailPage = () => {
  const { id } = useParams();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectUser);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('description');
  const [isSaved, setIsSaved] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [showApplyModal, setShowApplyModal] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ['job', id],
    queryFn: () => jobService.getJobById(id).then(r => r.data),
    enabled: !!id,
  });

  const applyMutation = useMutation({
    mutationFn: () => applicationService.apply(id, { coverLetter: '' }),
    onSuccess: () => {
      toast.success('Application recorded! Redirecting to external link… 🎉');
      queryClient.invalidateQueries(['applications']);
      // Open external link after recording
      if (job?.applyLink) {
        window.open(job.applyLink, '_blank', 'noopener,noreferrer');
      }
      setShowApplyModal(false);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to apply'),
  });

  const handleApply = () => {
    if (!isAuthenticated) { navigate('/login'); return; }
    setShowApplyModal(true);
  };

  const handleSave = async () => {
    if (!isAuthenticated) { toast.error('Please login to save jobs'); return; }
    try {
      const { data: res } = await userService.toggleSaveJob(id);
      setIsSaved(res.isSaved);
      toast.success(res.message);
    } catch { toast.error('Something went wrong'); }
  };

  if (isLoading) return (
    <div className="page-container py-8 animate-pulse">
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="card p-6 space-y-3">
            <div className="skeleton h-8 w-2/3 rounded" />
            <div className="skeleton h-5 w-1/3 rounded" />
            <div className="skeleton h-4 w-1/2 rounded" />
          </div>
          <div className="card p-6 h-64 skeleton" />
        </div>
        <div className="space-y-4">
          <div className="card p-5 h-40 skeleton" />
          <div className="card p-5 h-40 skeleton" />
        </div>
      </div>
    </div>
  );

  if (error) return (
    <div className="page-container py-16 text-center">
      <p className="text-red-500 mb-4">Job not found or an error occurred.</p>
      <Link to="/jobs" className="btn-primary">← Back to Jobs</Link>
    </div>
  );

  const job = data?.data;
  const similarJobs = data?.similarJobs || [];
  // Logo: use direct companyLogo field (from PostJobPage form) OR company.logo
  const logoUrl = job?.companyLogo
    ? job.companyLogo
    : job?.company?.logo
    ? getAvatarUrl(job.company.logo)
    : null;

  // Parse **bold** within a single line
  const parseBold = (text, keyPrefix) =>
    text.split(/(\*\*[^*]+\*\*)/).map((part, j) =>
      part.startsWith('**') && part.endsWith('**')
        ? <strong key={`${keyPrefix}-b${j}`}>{part.slice(2, -2)}</strong>
        : <span key={`${keyPrefix}-s${j}`}>{part}</span>
    );

  // Renders full description: blank lines → paragraph gaps, • lines → bullets, text → paragraph
  const renderDescription = (text) => {
    if (!text) return null;
    // Split into "blocks" by one or more blank lines
    const blocks = text.split(/\n{2,}/);
    return blocks.map((block, bi) => {
      const lines = block.split('\n').filter(l => l.trim() !== '');
      if (!lines.length) return null;

      // If ALL lines in the block are bullets → render as <ul>
      const allBullets = lines.every(l => l.trimStart().startsWith('•'));
      if (allBullets) {
        return (
          <ul key={bi} className="space-y-1 mb-3">
            {lines.map((line, li) => (
              <li key={li} className="flex gap-2 text-gray-700">
                <span className="mt-1 text-primary-500 flex-shrink-0">•</span>
                <span>{parseBold(line.replace(/^•\s*/, ''), `${bi}-${li}`)}</span>
              </li>
            ))}
          </ul>
        );
      }

      // Mixed block (e.g. a header line + bullets) — render line by line
      return (
        <div key={bi} className="mb-3">
          {lines.map((line, li) => {
            const isBullet = line.trimStart().startsWith('•');
            if (isBullet) {
              return (
                <div key={li} className="flex gap-2 text-gray-700 mb-1">
                  <span className="mt-1 text-primary-500 flex-shrink-0">•</span>
                  <span>{parseBold(line.replace(/^•\s*/, ''), `${bi}-${li}`)}</span>
                </div>
              );
            }
            // Plain text line (section header or paragraph)
            return (
              <p key={li} className="text-gray-700 mb-1 font-medium">
                {parseBold(line, `${bi}-${li}`)}
              </p>
            );
          })}
        </div>
      );
    });
  };


  return (
    <div className="page-container py-6 animate-fade-in">
      <Link to="/jobs" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-4 transition-colors">
        <ChevronLeft size={16} /> Back to jobs
      </Link>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-5">
          {/* Job Header */}
          <div className="card-p">
            <div className="flex items-start gap-4 mb-5">
              <div className="w-16 h-16 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center flex-shrink-0 overflow-hidden">
                {logoUrl ? (
                  <img src={logoUrl} alt={job.company?.name} className="w-full h-full object-contain p-1" />
                ) : (
                  <Building2 size={28} className="text-gray-400" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <h1 className="text-2xl font-bold text-gray-900">{job.title}</h1>
                  <span className="badge-purple">{job.jobType}</span>
                </div>
                <div className="flex items-center gap-1.5 text-gray-600">
                  <span className="font-medium">{job.company?.name}</span>
                  {job.company?.isVerified && (
                    <span className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center">
                      <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500 mt-0.5 flex items-center gap-2">
                  <MapPin size={13} />{job.companyLocation} • <Briefcase size={13} />{job.workMode}
                </p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <button onClick={handleApply} className="btn-primary px-6">Apply Now</button>
                <button onClick={handleSave}
                  className="btn-secondary gap-1.5 text-sm">
                  {isSaved ? <BookmarkCheck size={15} className="text-primary-600" /> : <Bookmark size={15} />}
                  {isSaved ? 'Saved' : 'Save Job'}
                </button>
              </div>
            </div>

            {/* Metadata grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 border-t border-b border-gray-100">
              {[
                { label: 'Stipend', value: formatSalary(job.salary) },
                { label: 'Job Type', value: job.jobType },
                { label: 'Batch', value: job.batch || 'Any' },
                { label: 'Posted', value: formatRelativeDate(job.createdAt) },
              ].map(({ label, value }) => (
                <div key={label} className="text-center">
                  <p className="text-xs text-gray-500 mb-0.5">{label}</p>
                  <p className="text-sm font-semibold text-gray-900">{value}</p>
                </div>
              ))}
            </div>

            {/* Tabs */}
            <div className="flex gap-4 mt-4 border-b border-gray-100">
              {['description', 'company', 'reviews', 'faqs'].map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className={`pb-2 text-sm font-medium capitalize border-b-2 transition-colors ${
                    activeTab === tab ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}>
                  {tab === 'description' ? 'Job Description' : tab === 'company' ? 'About Company' : tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === 'description' && (
            <div className="card-p space-y-5 text-sm text-gray-700 leading-relaxed">
              {job.description && (
                <div>
                  <h2 className="font-semibold text-gray-900 mb-3">About the Role</h2>
                  <div className="space-y-1 text-sm text-gray-700 leading-relaxed">
                    {renderDescription(job.description)}
                  </div>
                </div>
              )}
            </div>
          )}
          {activeTab === 'company' && (
            <div className="card-p">
              <h2 className="font-semibold text-gray-900 mb-3">About {job.company?.name}</h2>
              <p className="text-sm text-gray-700 mb-4">{job.company?.description || 'No description available.'}</p>
              {job.company?.website && (
                <a href={job.company.website} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-primary-600 text-sm hover:underline">
                  <Globe size={14} /> Visit Website <ExternalLink size={12} />
                </a>
              )}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* How to Apply */}
          <div className="card-p">
            <h3 className="font-semibold text-gray-900 mb-3">How to Apply</h3>
            <div className="space-y-3">
              {job.applyLink ? (
                <>
                  <p className="text-sm text-gray-500">Apply using the link below</p>
                  <a
                    href={job.applyLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary-600 hover:underline truncate block"
                  >
                    {job.applyLink}
                  </a>
                  <button
                    onClick={handleApply}
                    className="btn-primary w-full justify-center gap-2"
                  >
                    Apply Now <ExternalLink size={14} />
                  </button>
                  <a
                    href={job.applyLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-outline w-full justify-center gap-1.5 text-sm"
                  >
                    View Full Link <ExternalLink size={13} />
                  </a>
                </>
              ) : (
                <button onClick={handleApply} className="btn-primary w-full justify-center">Apply via Portal</button>
              )}

              {/* Contact info */}
              {(job.contactEmail || job.contactPhone || job.extraEmail) && (
                <div className="border-t border-gray-100 pt-3 space-y-2 mt-2">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Contact Details</p>
                  {job.contactEmail && (
                    <a href={`mailto:${job.contactEmail}`} className="flex items-center gap-2 text-sm text-gray-700 hover:text-primary-600">
                      <span className="text-base">✉️</span> {job.contactEmail}
                    </a>
                  )}
                  {job.extraEmail && (
                    <a href={`mailto:${job.extraEmail}`} className="flex items-center gap-2 text-sm text-gray-700 hover:text-primary-600">
                      <span className="text-base">✉️</span> {job.extraEmail}
                    </a>
                  )}
                  {job.contactPhone && (
                    <a href={`https://wa.me/${job.contactPhone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-gray-700 hover:text-green-600">
                      <span className="text-base">💬</span> {job.contactPhone}
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* About Company */}
          <div className="card-p">
            <h3 className="font-semibold text-gray-900 mb-3">About {job.company?.name}</h3>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-200">
                {logoUrl ? <img src={logoUrl} className="w-full h-full object-contain p-1" alt="" /> : <Building2 size={16} className="text-gray-400" />}
              </div>
              <p className="text-sm text-gray-700">{job.company?.description || 'A leading company in its industry.'}</p>
            </div>
            {job.companyWebsite || job.company?.website ? (
              <a href={job.companyWebsite || job.company?.website} target="_blank" rel="noopener noreferrer" className="text-sm text-primary-600 hover:underline">View Company Profile →</a>
            ) : (
              <Link to={`/companies/${job.company?._id}`} className="text-sm text-primary-600 hover:underline">View Company Profile →</Link>
            )}
          </div>

          {/* Similar Jobs */}
          {similarJobs.length > 0 && (
            <div className="card-p">
              <h3 className="font-semibold text-gray-900 mb-3">Similar Jobs</h3>
              <div className="space-y-3">
                {similarJobs.slice(0, 3).map(sj => (
                  <Link key={sj._id} to={`/jobs/${sj._id}`} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors">
                    <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                      {sj.company?.logo ? (
                        <img src={getAvatarUrl(sj.company.logo)} alt="" className="w-full h-full object-contain p-0.5 rounded-lg" />
                      ) : <Building2 size={12} className="text-gray-400" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{sj.title}</p>
                      <p className="text-xs text-gray-500">{sj.company?.name}</p>
                    </div>
                    <span className="text-xs font-semibold text-primary-600 flex-shrink-0">{formatSalary(sj.salary)}</span>
                  </Link>
                ))}
              </div>
              <Link to="/jobs" className="text-sm text-primary-600 hover:underline mt-3 block text-center">View all similar jobs →</Link>
            </div>
          )}
        </div>
      </div>

      {/* Apply Confirmation Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-6">
              <h3 className="font-bold text-xl text-gray-900 mb-1">Apply for {job.title}</h3>
              <p className="text-sm text-gray-500 mb-5">{job.company?.name}</p>

              {/* External link */}
              {job.applyLink && (
                <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 mb-4">
                  <p className="text-xs font-semibold text-indigo-700 mb-1 uppercase tracking-wide">External Application Link</p>
                  <a
                    href={job.applyLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-indigo-600 hover:underline break-all"
                  >
                    {job.applyLink}
                  </a>
                </div>
              )}

              {/* Contact */}
              {(job.contactEmail || job.contactPhone || job.extraEmail) && (
                <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 mb-4 space-y-2">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Contact</p>
                  {job.contactEmail && (
                    <a href={`mailto:${job.contactEmail}`} className="flex items-center gap-2 text-sm text-gray-700 hover:text-primary-600">
                      <span>✉️</span> {job.contactEmail}
                    </a>
                  )}
                  {job.extraEmail && (
                    <a href={`mailto:${job.extraEmail}`} className="flex items-center gap-2 text-sm text-gray-700 hover:text-primary-600">
                      <span>✉️</span> {job.extraEmail}
                    </a>
                  )}
                  {job.contactPhone && (
                    <a href={`https://wa.me/${job.contactPhone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-gray-700 hover:text-green-600">
                      <span>💬</span> {job.contactPhone}
                    </a>
                  )}
                </div>
              )}

              <p className="text-xs text-gray-400 mb-5">
                Clicking <strong>Confirm &amp; Apply</strong> will record your application on JobPortal
                and open the external link in a new tab.
              </p>

              <div className="flex gap-3">
                <button onClick={() => setShowApplyModal(false)} className="btn-secondary flex-1">Cancel</button>
                <button
                  onClick={() => applyMutation.mutate()}
                  disabled={applyMutation.isLoading}
                  className="btn-primary flex-1 gap-2"
                >
                  {applyMutation.isLoading ? 'Recording…' : <><span>Confirm & Apply</span> <ExternalLink size={14} /></>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobDetailPage;
