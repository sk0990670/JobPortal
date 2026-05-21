import { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Upload, X, Building2, MapPin, DollarSign } from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { jobService } from '../services/jobService';
import toast from 'react-hot-toast';

const PostJobPage = () => {
  const navigate = useNavigate();
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [logoUrl, setLogoUrl] = useState('');
  const [isDraft, setIsDraft] = useState(false);
  const logoRef = useRef(null);

  const { register, handleSubmit, watch, control, setValue, formState: { errors } } = useForm({
    defaultValues: { currency: 'INR', salaryPeriod: 'month', jobType: 'Internship', experienceLevel: 'Fresher', postedDate: new Date().toISOString().split('T')[0] },
  });

  // Salary comma formatting
  const [salaryMin, setSalaryMin] = useState('');
  const [salaryMax, setSalaryMax] = useState('');
  const formatNum = (val) => val.replace(/\D/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const parseNum  = (val) => val.replace(/,/g, '');

  // Bold toolbar for description
  const descRef = useRef(null);
  const handleDescKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
      e.preventDefault();
      const el = descRef.current;
      const start = el.selectionStart;
      const end   = el.selectionEnd;
      const selected = el.value.substring(start, end);
      const newVal = el.value.substring(0, start) + '**' + selected + '**' + el.value.substring(end);
      setValue('description', newVal);
      setTimeout(() => { el.selectionStart = start + 2; el.selectionEnd = end + 2; el.focus(); }, 0);
    }
  };

  const preview = watch(['companyName', 'title', 'jobType', 'experienceLevel', 'workMode', 'companyLocation']);

  const createMutation = useMutation({
    mutationFn: (data) => jobService.createJob(data),
    onSuccess: ({ data }) => {
      toast.success(isDraft ? 'Job saved as draft!' : 'Job published successfully! 🎉');
      navigate(`/jobs/${data.data._id}`);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to post job'),
  });

  const handleLogoUpload = async (file) => {
    if (!file) return;
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
    setUploadingLogo(true);
    try {
      const { data } = await jobService.uploadLogo(file);
      setLogoUrl(data.data.url);
    } catch { toast.error('Logo upload failed'); }
    finally { setUploadingLogo(false); }
  };

  const onSubmit = (data) => {
    if (!data.applyLink && !data.contactEmail && !data.extraEmail && !data.contactPhone) {
      toast.error('Please provide at least one contact method or an application link.');
      return;
    }
    
    createMutation.mutate({
      ...data,
      companyLocation: data.companyLocation || '',
      companyLogo: logoUrl,
      status: isDraft ? 'draft' : data.status,
      'salary.min': parseNum(salaryMin),
      'salary.max': parseNum(salaryMax),
      'salary.period': data.salaryPeriod,
    });
  };

  return (
    <div className="animate-fade-in">
      <div className="page-container py-6">
        <Link to="/jobs" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-5 transition-colors">
          <ArrowLeft size={16} /> Back to Jobs
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Post a New Job</h1>
        <p className="text-sm text-gray-500 mb-6">Fill in the details to post a job and connect with the right candidates.</p>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid lg:grid-cols-3 gap-6 items-start">
            {/* Main Form */}
            <div className="lg:col-span-2 space-y-8">
              {/* Company Information */}
              <div className="card-p">
                <h2 className="font-bold text-gray-900 mb-4">Company Information</h2>
                <div className="mb-4">
                  <label className="label">Company Name <span className="text-red-500">*</span></label>
                  <input {...register('companyName', { required: 'Company name is required' })}
                    placeholder="Enter company name"
                    className={`input ${errors.companyName ? 'input-error' : ''}`} />
                  {errors.companyName && <p className="text-xs text-red-500 mt-1">{errors.companyName.message}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="label">Company Website</label>
                    <input {...register('companyWebsite')} placeholder="https://www.example.com" className="input" />
                  </div>
                  <div>
                    <label className="label">Company Location</label>
                    <input {...register('companyLocation')} placeholder="Enter company location" className="input" />
                  </div>
                </div>

                <div>
                  <label className="label">Upload Company Logo <span className="text-red-500">*</span></label>
                  <div
                    onClick={() => logoRef.current?.click()}
                    className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center cursor-pointer hover:border-primary-300 hover:bg-primary-50 transition-all flex flex-col items-center justify-center min-h-[120px]"
                  >
                    {logoPreview ? (
                      <div className="relative">
                        <img src={logoPreview} alt="Logo preview" className="h-16 w-16 object-contain rounded" />
                        <button type="button" onClick={e => { e.stopPropagation(); setLogoFile(null); setLogoPreview(null); setLogoUrl(''); }}
                          className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white">
                          <X size={10} />
                        </button>
                      </div>
                    ) : (
                      <>
                        <Upload size={24} className="text-gray-400 mb-2" />
                        <p className="text-sm text-gray-600 font-medium">Click to upload or drag and drop</p>
                        <p className="text-xs text-gray-400 mt-1">PNG, JPG, SVG (Max. 2MB)</p>
                      </>
                    )}
                  </div>
                  <input ref={logoRef} type="file" accept="image/*" className="hidden"
                    onChange={e => { if (e.target.files[0]) handleLogoUpload(e.target.files[0]); }} />
                </div>
              </div>

              {/* Job Information */}
              <div className="card-p">
                <h2 className="font-bold text-gray-900 mb-4">Job Information</h2>
                <div className="space-y-4">
                  <div>
                    <label className="label">Role <span className="text-red-500">*</span></label>
                    <input {...register('title', { required: 'Role is required' })}
                      placeholder="e.g. AI/ML Intern, Full Stack Developer"
                      className={`input ${errors.title ? 'input-error' : ''}`} />
                    {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title.message}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="label">Employment Type <span className="text-red-500">*</span></label>
                      <select {...register('jobType', { required: true })} className="input">
                        {['Full-time', 'Part-time', 'Internship', 'Contract', 'Remote'].map(t => <option key={t}>{t}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="label">Experience Level <span className="text-red-500">*</span></label>
                      <select {...register('experienceLevel')} className="input">
                        {['Fresher', 'Junior', 'Mid-level', 'Senior', 'Lead'].map(l => <option key={l}>{l}</option>)}
                      </select>
                    </div>
                  </div>
                  
                  {watch('jobType') === 'Internship' && (
                    <div className="flex items-center gap-2 mt-2 p-3 bg-primary-50 rounded-lg border border-primary-100 animate-fade-in">
                      <input 
                        type="checkbox" 
                        {...register('ppoAvailable')} 
                        id="ppoAvailable" 
                        className="w-4 h-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500 cursor-pointer"
                      />
                      <label htmlFor="ppoAvailable" className="text-sm font-bold text-primary-900 cursor-pointer select-none">
                        PPO Available (Pre-Placement Offer)
                      </label>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="label">Job Function <span className="text-red-500">*</span></label>
                      <select {...register('jobFunction')} className="input">
                        {['Software Engineering', 'Data Science', 'Product Management', 'Design', 'Marketing', 'Analytics', 'Machine Learning', 'DevOps', 'Other'].map(f => <option key={f}>{f}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="label">Work Mode <span className="text-red-500">*</span></label>
                      <div className="flex gap-3 mt-1">
                        {['On-site', 'Remote', 'Hybrid'].map(mode => (
                          <label key={mode} className="flex items-center gap-1.5 cursor-pointer">
                            <input type="radio" {...register('workMode', { required: 'Work mode is required' })} value={mode}
                              className={`w-4 h-4 text-primary-600 focus:ring-primary-400 ${errors.workMode ? 'border-red-500' : ''}`} />
                            <span className="text-sm text-gray-700">{mode}</span>
                          </label>
                        ))}
                      </div>
                      {errors.workMode && <p className="text-xs text-red-500 mt-1">{errors.workMode.message}</p>}
                    </div>
                  </div>

                  {/* Salary Range */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="label mb-0">Salary Range (Optional)</label>
                      <div className="flex bg-gray-100 p-1 rounded-lg w-fit">
                        <button type="button" onClick={() => setValue('salaryPeriod', 'month')} className={`px-4 py-1 text-xs rounded-md transition-colors ${watch('salaryPeriod') === 'month' ? 'bg-white shadow-sm font-medium text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>Monthly</button>
                        <button type="button" onClick={() => setValue('salaryPeriod', 'year')} className={`px-4 py-1 text-xs rounded-md transition-colors ${watch('salaryPeriod') === 'year' ? 'bg-white shadow-sm font-medium text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>LPA</button>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <input
                        type="text"
                        value={salaryMin}
                        onChange={e => setSalaryMin(formatNum(e.target.value))}
                        placeholder="e.g. 30,000"
                        className="input flex-1"
                      />
                      <span className="text-gray-400 flex-shrink-0">to</span>
                      <input
                        type="text"
                        value={salaryMax}
                        onChange={e => setSalaryMax(formatNum(e.target.value))}
                        placeholder="e.g. 50,000"
                        className="input flex-1"
                      />
                      <select {...register('currency')} className="input w-24">
                        <option>INR</option><option>USD</option><option>EUR</option>
                      </select>
                    </div>
                  </div>

                  {/* Job Description */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="label mb-0">Job Description <span className="text-red-500">*</span></label>
                      <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded font-mono">Ctrl+B = <b>bold</b></span>
                    </div>
                    <textarea
                      {...register('description', { required: 'Description is required' })}
                      ref={(e) => { register('description').ref(e); descRef.current = e; }}
                      onKeyDown={handleDescKeyDown}
                      onInput={e => { e.target.style.height = 'auto'; e.target.style.height = e.target.scrollHeight + 'px'; }}
                      placeholder="Write a detailed job description... (Select text and press Ctrl+B to bold)"
                      className={`input desc-textarea font-mono text-sm ${errors.description ? 'input-error' : ''}`}
                    />
                    {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description.message}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="label">Status <span className="text-red-500">*</span></label>
                      <div className="flex gap-3 mt-1">
                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <input type="radio" {...register('status', { required: 'Status is required' })} value="active" className={`w-4 h-4 text-primary-600 focus:ring-primary-400 ${errors.status ? 'border-red-500' : ''}`} />
                          <span className="text-sm text-gray-700">Active</span>
                        </label>
                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <input type="radio" {...register('status', { required: 'Status is required' })} value="closed" className={`w-4 h-4 text-primary-600 focus:ring-primary-400 ${errors.status ? 'border-red-500' : ''}`} />
                          <span className="text-sm text-gray-700">Inactive</span>
                        </label>
                      </div>
                      {errors.status && <p className="text-xs text-red-500 mt-1">{errors.status.message}</p>}
                    </div>
                    <div>
                      <label className="label">Batch</label>
                      <input {...register('batch')} placeholder="2025/2026" className="input" />
                    </div>
                  </div>

                  <div>
                    <label className="label">Posting Date</label>
                    <input {...register('postedDate')} type="date" className="input lg:w-1/2 pr-4" />
                  </div>

                  {/* ── How to Apply ── */}
                  <div className="border-t border-gray-100 pt-4">
                    <h3 className="text-sm font-bold text-gray-800 mb-1">How to Apply</h3>
                    <p className="text-xs text-gray-500 mb-3">
                      Candidates will see an external link to apply. The site also records who applied.
                      Provide the apply link <strong>and</strong> at least one contact method.
                    </p>

                    <div className="space-y-3">
                      {/* Apply Link */}
                      <div>
                        <label className="label">Application Link</label>
                        <input
                          {...register('applyLink')}
                          placeholder="https://careers.example.com/apply/job-id"
                          className="input"
                        />
                        <p className="text-xs text-gray-400 mt-1">Candidates will click this link to apply on your platform.</p>
                      </div>

                      {/* Contact — Email OR Phone */}
                      <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Contact</p>
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <label className="label">Contact Email</label>
                          <input
                            {...register('contactEmail', {
                              pattern: { value: /^\S+@\S+$/, message: 'Invalid email' },
                            })}
                            type="email"
                            placeholder="hr@company.com"
                            className={`input ${errors.contactEmail ? 'input-error' : ''}`}
                          />
                          {errors.contactEmail && <p className="text-xs text-red-500 mt-1">{errors.contactEmail.message}</p>}
                        </div>
                        <div>
                          <label className="label">Extra Email (Optional)</label>
                          <input
                            {...register('extraEmail', {
                              pattern: { value: /^\S+@\S+$/, message: 'Invalid email' },
                            })}
                            type="email"
                            placeholder="extra@company.com"
                            className={`input ${errors.extraEmail ? 'input-error' : ''}`}
                          />
                          {errors.extraEmail && <p className="text-xs text-red-500 mt-1">{errors.extraEmail.message}</p>}
                        </div>
                        <div>
                          <label className="label">Contact Phone</label>
                          <input
                            {...register('contactPhone')}
                            type="tel"
                            placeholder="+91 98765 43210"
                            className="input"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Job Preview */}
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
                    <span className="badge-gray">{preview[3] || '0-2 yrs'}</span>
                    <span className="badge-purple">{preview[4] || 'Work Mode'}</span>
                    {preview[5] && <span className="badge-green">{preview[5]}</span>}
                  </div>
                  {watch('description') && (
                    <>
                      <h4 className="text-xs font-semibold text-gray-700 mb-1">About the Role</h4>
                      <p className="text-xs text-gray-600 line-clamp-3">{watch('description')}</p>
                    </>
                  )}
                </div>

                <div className="flex gap-3">
                  <button type="button" onClick={() => { setIsDraft(true); handleSubmit(onSubmit)(); }}
                    className="btn-secondary flex-1">Save Draft</button>
                  <button type="submit" onClick={() => setIsDraft(false)}
                    disabled={createMutation.isLoading}
                    className="btn-primary flex-1">
                    {createMutation.isLoading ? 'Publishing...' : 'Publish Job'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PostJobPage;
