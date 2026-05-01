import { Link } from 'react-router-dom';
import { MapPin, Clock, Briefcase, Bookmark, BookmarkCheck } from 'lucide-react';
import { formatSalary, formatRelativeDate, formatLocation, getAvatarUrl } from '../../utils/formatters';
import { useState } from 'react';
import { userService } from '../../services/userService';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated, selectUser } from '../../store/slices/authSlice';
import toast from 'react-hot-toast';

const JobCard = ({ job, compact = false }) => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectUser);
  const [isSaved, setIsSaved] = useState(user?.savedJobs?.includes(job?._id));
  const [saving, setSaving] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) { toast.error('Please login to save jobs'); return; }
    setSaving(true);
    try {
      const { data } = await userService.toggleSaveJob(job._id);
      setIsSaved(data.isSaved);
      toast.success(data.message);
    } catch {
      toast.error('Something went wrong');
    } finally {
      setSaving(false);
    }
  };

  if (!job) return null;

  const logoUrl = job.companyLogo || (job.company?.logo ? getAvatarUrl(job.company.logo) : null);

  return (
    <Link to={`/jobs/${job._id}`} className="block">
      <div className="card p-4 hover:border-primary-300 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
        <div className="flex items-start gap-3">
          {/* Company Logo */}
          <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0 overflow-hidden border border-gray-200">
            {logoUrl ? (
              <img src={logoUrl} alt={job.company?.name || 'Company'} className="w-full h-full object-contain p-1" />
            ) : (
              <span className="text-lg font-bold text-gray-400">{(job.company?.name || 'U')[0]}</span>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-semibold text-gray-900 text-sm group-hover:text-primary-600 transition-colors truncate">
                  {job.title || 'Untitled Role'}
                </h3>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="text-sm text-gray-600">{job.company?.name || 'Unknown Company'}</span>
                  {job.company?.isVerified && (
                    <span className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center">
                      <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                {(() => {
                  const salaryText = formatSalary(job.salary);
                  const isNotDisclosed = salaryText === 'Not disclosed';
                  return (
                    <span className={`text-sm ${isNotDisclosed ? 'text-gray-500 font-medium' : 'font-semibold text-primary-600'}`}>
                      {salaryText}
                    </span>
                  );
                })()}
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                  title={isSaved ? 'Remove from saved' : 'Save job'}
                >
                  {isSaved
                    ? <BookmarkCheck size={16} className="text-primary-600" />
                    : <Bookmark size={16} className="text-gray-400 hover:text-primary-500" />
                  }
                </button>
              </div>
            </div>

            <div className="flex items-center flex-wrap gap-x-3 gap-y-1 mt-2 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <MapPin size={11} />{job.companyLocation || 'Not specified'}
              </span>
              <span className="flex items-center gap-1">
                <Briefcase size={11} />{job.workMode}
              </span>
              <span className="flex items-center gap-1">
                <Clock size={11} />{formatRelativeDate(job.createdAt)}
              </span>
            </div>

            <div className="flex items-center gap-1.5 mt-2 flex-wrap">
              <span className="badge-purple">{job.jobType}</span>
              {job.workMode && <span className="badge-gray">{job.workMode}</span>}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default JobCard;
