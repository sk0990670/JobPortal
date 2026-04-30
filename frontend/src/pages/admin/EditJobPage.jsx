import { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Upload, X, Building2, MapPin } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery } from '@tanstack/react-query';
import { jobService } from '../../services/jobService';
import { getAvatarUrl } from '../../utils/formatters';
import toast from 'react-hot-toast';

const EditJobPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [logoPreview, setLogoPreview] = useState(null);
  const [logoUrl, setLogoUrl] = useState('');
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [salaryMin, setSalaryMin] = useState('');
  const [salaryMax, setSalaryMax] = useState('');
  const logoRef = useRef(null);
  const descRef = useRef(null); // for auto-height after reset()

  const formatNum = (val) => String(val).replace(/\D/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const parseNum  = (val) => String(val).replace(/,/g, '');

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm();

  // Fetch existing job
  const { data, isLoading } = useQuery({
    queryKey: ['job-edit', id],
    queryFn: () => jobService.getJobById(id).then(r => r.data),
    enabled: !!id,
  });

  // Pre-fill form once data loads
  useEffect(() => {
    const job = data?.data;
    if (!job) return;
    reset({
      companyName:     job.companyName || job.company?.name || '',
      companyWebsite:  job.companyWebsite || job.company?.website || '',
      companyLocation: job.companyLocation || job.city || job.location?.city || '',
      title:           job.title || '',
      jobType:         job.jobType || 'Internship',
      experienceLevel: job.experienceLevel || 'Fresher',
      jobFunction:     job.jobFunction || 'Software Engineering',
      workMode:        job.workMode || 'On-site',
      currency:        job.salary?.currency || 'INR',
      salaryPeriod:    job.salary?.period || 'month',
      description:     job.description || '',
      status:          job.status || 'active',
      batch:           job.batch || '',
      postedDate:      job.postedDate ? job.postedDate.slice(0,10) : new Date().toISOString().slice(0,10),
      applyLink:       job.applyLink || '',
      contactEmail:    job.contactEmail || '',
      contactPhone:    job.contactPhone || '',
    });
    // Salary
    if (job.salary?.min) setSalaryMin(formatNum(job.salary.min));
    if (job.salary?.max) setSalaryMax(formatNum(job.salary.max));
    // Logo
    if (job.companyLogo) { setLogoPreview(job.companyLogo); setLogoUrl(job.companyLogo); }
    else if (job.company?.logo) { const url = getAvatarUrl(job.company.logo); setLogoPreview(url); setLogoUrl(url); }
    // Auto-expand textarea to show all pre-filled content
    setTimeout(() => {
      if (descRef.current) {
        descRef.current.style.height = 'auto';
        descRef.current.style.height = descRef.current.scrollHeight + 'px';
      }
    }, 50);
  }, [data]);

  const handleLogoUpload = async (file) => {
    if (!file) return;
    setLogoPreview(URL.createObjectURL(file));
    setUploadingLogo(true);
    try {
      const { data } = await jobService.uploadLogo(file);
      setLogoUrl(data.data.url);
    } catch { toast.error('Logo upload failed'); }
    finally { setUploadingLogo(false); }
  };

  const updateMutation = useMutation({
    mutationFn: (payload) => jobService.updateJob(id, payload),
    onSuccess: () => {
      toast.success('Job updated successfully! ✅');
      navigate('/admin/jobs');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Update failed'),
  });

  const onSubmit = (formData) => {
    updateMutation.mutate({
      ...formData,
      city: formData.companyLocation,
      companyLogo: logoUrl,
      'salary.min': parseNum(salaryMin),
      'salary.max': parseNum(salaryMax),
      'salary.period': formData.salaryPeriod,
    });
  };

  const preview = watch(['companyName', 'title', 'jobType', 'experienceLevel', 'workMode', 'companyLocation']);

  if (isLoading) return (
    <div className="page-container py-10 flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="animate-fade-in">
      <div className="py-4">
        <Link to="/admin/jobs" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-5 transition-colors">
          <ArrowLeft size={16} /> Back to Manage Jobs
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Edit Job</h1>
        <p className="text-sm text-gray-500 mb-6">Update the details for this job listing.</p>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Main Form */}
            <div className="lg:col-span-2 space-y-5">
              {/* Company */}
              <div className="card-p">
                <h2 className="font-bold text-gray-900 mb-4">Company Information</h2>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="label">Company Name *</label>
                    <input {...register('companyName', { required: true })} className={`input ${errors.companyName ? 'input-error' : ''}`} />
                  </div>
                  {/* Logo */}
                  <div>
                    <label className="label">Company Logo</label>
                    <div onClick={() => logoRef.current?.click()}
                      className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center cursor-pointer hover:border-primary-300 hover:bg-primary-50 transition-all flex flex-col items-center justify-center min-h-[80px]">
                      {logoPreview ? (
                        <div className="relative">
                          <img src={logoPreview} alt="" className="h-12 w-12 object-contain rounded" />
                          <button type="button" onClick={e => { e.stopPropagation(); setLogoPreview(null); setLogoUrl(''); }}
                            className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white">
                            <X size={10} />
                          </button>
                        </div>
                      ) : (
                        <>
                          <Upload size={20} className="text-gray-300 mb-1" />
                          <p className="text-xs text-gray-500">Click to change logo</p>
                        </>
                      )}
                    </div>
                    <input ref={logoRef} type="file" accept="image/*" className="hidden"
                      onChange={e => { if (e.target.files[0]) handleLogoUpload(e.target.files[0]); }} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Company Website</label>
                    <input {...register('companyWebsite')} className="input" />
                  </div>
                  <div>
                    <label className="label">Company Location</label>
                    <input {...register('companyLocation')} className="input" />
                  </div>
                </div>
              </div>

              {/* Job Info */}
              <div className="card-p">
                <h2 className="font-bold text-gray-900 mb-4">Job Information</h2>
                <div className="space-y-4">
                  <div>
                    <label className="label">Role *</label>
                    <input {...register('title', { required: 'Role is required' })}
                      className={`input ${errors.title ? 'input-error' : ''}`} />
                    {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title.message}</p>}
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="label">Employment Type *</label>
                      <select {...register('jobType')} className="input">
                        {['Full-time','Part-time','Internship','Contract','Remote'].map(t => <option key={t}>{t}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="label">Experience Level</label>
                      <select {...register('experienceLevel')} className="input">
                        {['Fresher','Junior','Mid-level','Senior','Lead'].map(l => <option key={l}>{l}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="label">Job Function</label>
                      <select {...register('jobFunction')} className="input">
                        {['Software Engineering','Data Science','Product Management','Design','Marketing','Analytics','Machine Learning','DevOps','Other'].map(f => <option key={f}>{f}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="label">Work Mode</label>
                      <div className="flex gap-3 mt-1">
                        {['On-site','Remote','Hybrid'].map(mode => (
                          <label key={mode} className="flex items-center gap-1.5 cursor-pointer">
                            <input type="radio" {...register('workMode')} value={mode} className="w-4 h-4 text-primary-600" />
                            <span className="text-sm text-gray-700">{mode}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="label">Status</label>
                      <div className="flex gap-3 mt-1">
                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <input type="radio" {...register('status')} value="active" className="w-4 h-4 text-primary-600" />
                          <span className="text-sm text-gray-700">Active</span>
                        </label>
                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <input type="radio" {...register('status')} value="closed" className="w-4 h-4 text-primary-600" />
                          <span className="text-sm text-gray-700">Inactive</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Salary */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="label mb-0">Salary Range</label>
                      <div className="flex bg-gray-100 p-1 rounded-lg w-fit">
                        <button type="button" onClick={() => setValue('salaryPeriod', 'month')} className={`px-4 py-1 text-xs rounded-md transition-colors ${watch('salaryPeriod') === 'month' ? 'bg-white shadow-sm font-medium text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>Monthly</button>
                        <button type="button" onClick={() => setValue('salaryPeriod', 'year')} className={`px-4 py-1 text-xs rounded-md transition-colors ${watch('salaryPeriod') === 'year' ? 'bg-white shadow-sm font-medium text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>LPA</button>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <input type="text" value={salaryMin} onChange={e => setSalaryMin(formatNum(e.target.value))} placeholder="e.g. 30,000" className="input flex-1" />
                      <span className="text-gray-400 flex-shrink-0">to</span>
                      <input type="text" value={salaryMax} onChange={e => setSalaryMax(formatNum(e.target.value))} placeholder="e.g. 50,000" className="input flex-1" />
                      <select {...register('currency')} className="input w-24">
                        <option>INR</option><option>USD</option><option>EUR</option>
                      </select>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="label mb-0">Job Description *</label>
                      <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded font-mono">Ctrl+B = <b>bold</b></span>
                    </div>
                    <textarea
                      {...register('description', { required: true })}
                      ref={(el) => { register('description').ref(el); descRef.current = el; }}
                      onInput={e => { e.target.style.height = 'auto'; e.target.style.height = e.target.scrollHeight + 'px'; }}
                      className={`input desc-textarea font-mono text-sm ${errors.description ? 'input-error' : ''}`} />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="label">Batch</label>
                      <input {...register('batch')} placeholder="2025/2026" className="input" />
                    </div>
                    <div>
                      <label className="label">Posting Date</label>
                      <input {...register('postedDate')} type="date" className="input" />
                    </div>
                  </div>

                  {/* How to Apply */}
                  <div className="border-t border-gray-100 pt-4">
                    <h3 className="text-sm font-bold text-gray-800 mb-3">How to Apply</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="label">Application Link *</label>
                        <input {...register('applyLink', { required: 'Application link is required' })}
                          className={`input ${errors.applyLink ? 'input-error' : ''}`} />
                        {errors.applyLink && <p className="text-xs text-red-500 mt-1">{errors.applyLink.message}</p>}
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="label">Contact Email</label>
                          <input {...register('contactEmail')} type="email" className="input" />
                        </div>
                        <div>
                          <label className="label">Contact Phone</label>
                          <input {...register('contactPhone')} type="tel" className="input" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Preview + Submit */}
            <div className="lg:col-span-1">
              <div className="sticky top-20 space-y-4">
                <div className="card-p">
                  <h3 className="font-semibold text-gray-900 mb-4">Job Preview</h3>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center overflow-hidden">
                      {logoPreview ? <img src={logoPreview} alt="" className="w-full h-full object-contain p-1" />
                        : <Building2 size={18} className="text-gray-400" />}
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-gray-700">{preview[0] || 'Company Name'}</p>
                      <div className="flex items-center gap-1 text-xs text-gray-400">
                        <MapPin size={10} />{preview[5] || 'Location'}
                      </div>
                    </div>
                  </div>
                  <h2 className="font-bold text-gray-900 mb-2">{preview[1] || 'Job Title'}</h2>
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    <span className="badge-blue">{preview[2] || 'Full-time'}</span>
                    <span className="badge-gray">{preview[3] || 'Fresher'}</span>
                    <span className="badge-purple">{preview[4] || 'On-site'}</span>
                    {preview[5] && <span className="badge-green">{preview[5]}</span>}
                  </div>
                </div>

                <button type="submit" disabled={updateMutation.isLoading} className="btn-primary w-full justify-center">
                  {updateMutation.isLoading ? 'Saving…' : '💾 Save Changes'}
                </button>
                <Link to="/admin/jobs" className="btn-secondary w-full justify-center block text-center">Cancel</Link>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditJobPage;
