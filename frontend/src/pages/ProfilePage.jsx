import { useState, useRef, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Camera, Edit2, ExternalLink, Upload, Plus, X, CheckCircle, Crop, Briefcase, Calendar, MapPin } from 'lucide-react';
import { userService } from '../services/userService';
import { useDispatch, useSelector } from 'react-redux';
import { selectUser, updateUser } from '../store/slices/authSlice';
import { getInitials, getAvatarUrl, formatDate } from '../utils/formatters';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { authService } from '../services/authService';
import ReactCrop, { centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { SkillsTab, EducationTab, ExperienceTab, ProjectsTab, CertificatesTab, PreferencesTab } from '../components/profile/ProfileTabs';

// Brand SVG logos
const LinkedInLogo = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="#0A66C2">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
);

const GitHubLogo = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="#181717">
    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
  </svg>
);

const PortfolioLogo = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="2" y1="12" x2="22" y2="12"/>
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
  </svg>
);

// Helper to get cropped image as a File
async function getCroppedFile(image, crop, fileName) {
  const canvas = document.createElement('canvas');
  const scaleX = image.naturalWidth  / image.width;
  const scaleY = image.naturalHeight / image.height;
  canvas.width  = crop.width;
  canvas.height = crop.height;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(image, crop.x * scaleX, crop.y * scaleY, crop.width * scaleX, crop.height * scaleY, 0, 0, crop.width, crop.height);
  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(new File([blob], fileName, { type: 'image/jpeg' }));
    }, 'image/jpeg', 0.95);
  });
}

const ALL_PROFILE_TABS = ['Personal Information', 'Education', 'Skills', 'Experience', 'Projects', 'Certificates', 'Resume', 'Preferences'];
const ADMIN_TABS = ['Personal Information', 'Change Password'];

const ProfilePage = () => {
  const user = useSelector(selectUser);
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('Personal Information');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const resumeInputRef = useRef(null);
  const avatarInputRef = useRef(null);
  const imgRef = useRef(null);

  // Crop modal state
  const [cropSrc, setCropSrc]     = useState(null);
  const [crop, setCrop]           = useState();
  const [completedCrop, setCompletedCrop] = useState(null);
  const [cropFileName, setCropFileName]   = useState('avatar.jpg');

  const { data: profileData, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: () => userService.getProfile().then(r => r.data),
    staleTime: 2 * 60 * 1000,
  });

  const profile = profileData?.data || user;

  const updateMutation = useMutation({
    mutationFn: (data) => userService.updateProfile(data),
    onSuccess: ({ data }) => {
      dispatch(updateUser(data.data));
      queryClient.invalidateQueries(['profile']);
      toast.success('Profile updated successfully!');
      setIsEditing(false);
    },
    onError: () => toast.error('Failed to update profile'),
  });

  const resumeMutation = useMutation({
    mutationFn: (file) => userService.uploadResume(file),
    onSuccess: () => { toast.success('Resume uploaded!'); queryClient.invalidateQueries(['profile']); },
    onError: () => toast.error('Resume upload failed'),
  });

  const avatarMutation = useMutation({
    mutationFn: (file) => userService.uploadAvatar(file),
    onSuccess: ({ data }) => {
      dispatch(updateUser({ avatar: data.data.url }));   // → updates navbar + sidebar instantly
      queryClient.invalidateQueries(['profile']);          // → updates middle profile card instantly
      toast.success('Avatar updated!');
    },
    onError: () => toast.error('Avatar upload failed'),
  });

  const { register: regPwd, handleSubmit: handlePwd, formState: { errors: pwdErrors }, reset: resetPwd } = useForm();
  
  const changePasswordMutation = useMutation({
    mutationFn: (data) => authService.changePassword ? authService.changePassword(data) : userService.updateProfile(data),
    onSuccess: () => { toast.success('Password changed successfully!'); resetPwd(); },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to change password'),
  });

  // Open crop modal when file is chosen
  const handleAvatarFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCropFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => setCropSrc(reader.result);
    reader.readAsDataURL(file);
    e.target.value = ''; // reset so same file can be re-selected
  };

  const onImageLoad = useCallback((e) => {
    const { width, height } = e.currentTarget;
    const c = centerCrop(makeAspectCrop({ unit: '%', width: 80 }, 1, width, height), width, height);
    setCrop(c);
  }, []);

  const handleCropConfirm = async () => {
    if (!completedCrop || !imgRef.current) return;
    const file = await getCroppedFile(imgRef.current, completedCrop, cropFileName);
    avatarMutation.mutate(file);
    setCropSrc(null);
    setCrop(undefined);
    setCompletedCrop(null);
  };

  const handleEdit = () => {
    setFormData({
      fullName: profile?.fullName || '',
      phone: profile?.phone || '',
      location: profile?.location || '',
      headline: profile?.headline || '',
      summary: profile?.summary || '',
      experienceLevel: profile?.experienceLevel || 'Fresher',
      currentStatus: profile?.currentStatus || 'Actively looking',
      noticePeriod: profile?.noticePeriod || 'Immediate',
      profiles: profile?.profiles || {},
    });
    setIsEditing(true);
  };

  const handleSave = () => updateMutation.mutate(formData);

  const avatarUrl = getAvatarUrl(profile?.avatar);
  const resumeUrl = profile?.resume?.url ? `${import.meta.env.VITE_API_URL?.replace('/api', '')}${profile.resume.url}` : null;

  return (
    <>
      <div className="animate-fade-in max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage your personal information and professional details.</p>
        </div>
      </div>

      {/* Profile Header Card */}
      <div className="card-p mb-5">
        <div className="flex items-start gap-5">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div className="w-20 h-20 rounded-full bg-primary-100 flex items-center justify-center overflow-hidden border-2 border-primary-200">
              {avatarUrl ? <img src={avatarUrl} alt={profile?.fullName} className="w-full h-full object-cover" />
                : <span className="text-2xl font-bold text-primary-700">{getInitials(profile?.fullName)}</span>}
            </div>
            <button onClick={() => avatarInputRef.current?.click()}
              className="absolute bottom-0 right-0 w-8 h-8 bg-primary-600 border-2 border-white rounded-full flex items-center justify-center text-white hover:bg-primary-700 transition-colors shadow-md z-10 translate-x-1/4 translate-y-1/4">
              <Camera size={14} />
            </button>
            <input ref={avatarInputRef} type="file" accept="image/*" className="hidden"
              onChange={handleAvatarFileChange} />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">{profile?.fullName}</h2>
                {user?.role !== 'admin' && <p className="text-gray-600">{profile?.headline || 'Add a headline'}</p>}
                <div className="flex items-center gap-5 mt-3 text-sm text-gray-500">
                  <span className="flex items-center gap-1.5"><Briefcase size={14} className="text-gray-400" /> {user?.role === 'admin' ? 'Administrator' : profile?.experienceLevel || 'Professional'}</span>
                  {profile?.location && <span className="flex items-center gap-1.5"><MapPin size={14} className="text-gray-400" /> {profile.location}</span>}
                  <span className="flex items-center gap-1.5"><Calendar size={14} className="text-gray-400" /> Joined {formatDate(profile?.createdAt || user?.createdAt || new Date())}</span>
                </div>
              </div>
            </div>
            {/* Meta info */}
            {user?.role !== 'admin' && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-5 text-sm">
                {[
                  { label: 'Experience Level', value: profile?.experienceLevel, icon: Briefcase },
                  { label: 'Current Status', value: profile?.currentStatus, icon: CheckCircle },
                  { label: 'Notice Period', value: profile?.noticePeriod, icon: Calendar },
                ].map(({ label, value, icon: Icon }) => (
                  <div key={label} className="bg-slate-50 border border-slate-100 rounded-xl p-3 flex items-start gap-3">
                    <div className="mt-0.5"><Icon size={14} className="text-primary-500" /></div>
                    <div>
                      <p className="text-xs text-gray-500">{label}</p>
                      <p className="font-semibold text-gray-900 text-sm mt-0.5">{value || '—'}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Profile completion */}
        {user?.role !== 'admin' && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="font-medium text-gray-700">Profile Strength</span>
              <span className={`font-semibold ${profile?.profileCompletion >= 80 ? 'text-green-600' : profile?.profileCompletion >= 50 ? 'text-orange-500' : 'text-red-500'}`}>
                {profile?.profileCompletion >= 80 ? 'Strong' : profile?.profileCompletion >= 50 ? 'Medium' : 'Weak'}
              </span>
            </div>
            <div className="w-full h-2 bg-gray-100 rounded-full">
              <div className={`h-2 rounded-full transition-all ${profile?.profileCompletion >= 80 ? 'bg-green-500' : profile?.profileCompletion >= 50 ? 'bg-orange-400' : 'bg-red-400'}`}
                style={{ width: `${profile?.profileCompletion || 0}%` }} />
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto scrollbar-thin pb-1 border-b border-gray-200 mb-5">
        {(user?.role === 'admin' ? ADMIN_TABS : ALL_PROFILE_TABS).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium whitespace-nowrap border-b-2 transition-colors -mb-px ${
              activeTab === tab ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}>{tab}</button>
        ))}
      </div>

      <div className={`grid gap-5 ${user?.role === 'admin' ? 'lg:grid-cols-1' : 'lg:grid-cols-3'}`}>
        {/* Main Content */}
        <div className={user?.role === 'admin' ? '' : 'lg:col-span-2'}>
          {activeTab === 'Personal Information' && (
            <div className="card-p">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-gray-900">Personal Information</h3>
                <button onClick={isEditing ? handleSave : handleEdit}
                  className={isEditing ? 'btn-primary btn-sm gap-1.5' : 'btn-secondary btn-sm gap-1.5'}>
                  <Edit2 size={14} />
                  {isEditing ? (updateMutation.isLoading ? 'Saving...' : 'Save') : 'Edit'}
                </button>
              </div>
              {isEditing ? (
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: 'Full Name', key: 'fullName', type: 'text' },
                    { label: 'Phone Number', key: 'phone', type: 'tel' },
                    ...(user?.role !== 'admin' ? [
                      { label: 'Location', key: 'location', type: 'text' },
                      { label: 'Headline', key: 'headline', type: 'text' },
                    ] : [])
                  ].map(({ label, key, type }) => (
                    <div key={key}>
                      <label className="label">{label}</label>
                      <input type={type} value={formData[key] || ''}
                        onChange={e => setFormData(p => ({ ...p, [key]: e.target.value }))}
                        className="input" />
                    </div>
                  ))}
                  {user?.role !== 'admin' && (
                    <>
                      <div className="col-span-2">
                        <label className="label">Summary</label>
                        <textarea value={formData.summary || ''} rows={4}
                          onChange={e => setFormData(p => ({ ...p, summary: e.target.value }))}
                          className="input resize-none" />
                      </div>
                      <div>
                        <label className="label">Experience Level</label>
                        <select value={formData.experienceLevel || ''} onChange={e => setFormData(p => ({ ...p, experienceLevel: e.target.value }))} className="input">
                          {['Fresher', 'Junior', 'Mid-level', 'Senior', 'Lead'].map(l => <option key={l}>{l}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="label">Current Status</label>
                        <select value={formData.currentStatus || ''} onChange={e => setFormData(p => ({ ...p, currentStatus: e.target.value }))} className="input">
                          {['Actively looking', 'Open to opportunities', 'Not looking'].map(s => <option key={s}>{s}</option>)}
                        </select>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8 text-sm">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Full Name</p>
                    <p className="font-semibold text-gray-900 text-base">{profile?.fullName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Email Address</p>
                    <p className="font-semibold text-gray-900 text-base">{profile?.email}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Phone Number</p>
                    <p className="font-semibold text-gray-900 text-base">{profile?.phone || '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Role / Title</p>
                    <p className="font-semibold text-gray-900 text-base">{user?.role === 'admin' ? 'Administrator' : profile?.headline || '—'}</p>
                  </div>
                  {user?.role !== 'admin' && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Location</p>
                      <p className="font-semibold text-gray-900 text-base">{profile?.location || '—'}</p>
                    </div>
                  )}
                  {user?.role !== 'admin' && profile?.summary && (
                    <div className="col-span-1 sm:col-span-2">
                      <p className="text-xs text-gray-500 mb-1">Summary</p>
                      <p className="font-medium text-gray-800 leading-relaxed text-base">{profile.summary}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'Change Password' && (
            <div className="card-p space-y-5">
              <div>
                <h2 className="font-bold text-gray-900 mb-1">Change Password</h2>
                <p className="text-xs text-gray-500">Update your account password.</p>
              </div>
              <form onSubmit={handlePwd(data => changePasswordMutation.mutate(data))} className="space-y-4 max-w-sm">
                <div>
                  <label className="label">Current Password</label>
                  <input {...regPwd('currentPassword', { required: 'Required' })} type="password"
                    placeholder="••••••••••••" className={`input ${pwdErrors.currentPassword ? 'input-error' : ''}`} />
                </div>
                <div>
                  <label className="label">New Password</label>
                  <input {...regPwd('newPassword', { required: 'Required', minLength: { value: 8, message: 'Min 8 chars' } })} type="password"
                    placeholder="New password" className={`input ${pwdErrors.newPassword ? 'input-error' : ''}`} />
                  {pwdErrors.newPassword && <p className="text-xs text-red-500 mt-1">{pwdErrors.newPassword.message}</p>}
                </div>
                <button type="submit" disabled={changePasswordMutation.isLoading} className="btn-primary">
                  {changePasswordMutation.isLoading ? 'Changing...' : 'Change Password'}
                </button>
              </form>
            </div>
          )}

          {/* ── SKILLS ── */}
          {activeTab === 'Skills' && (
            <SkillsTab profile={profile} formData={formData} setFormData={setFormData} isEditing={isEditing} />
          )}

          {/* ── EDUCATION ── */}
          {activeTab === 'Education' && (
            <EducationTab profile={profile} formData={formData} setFormData={setFormData} isEditing={isEditing} />
          )}

          {/* ── EXPERIENCE ── */}
          {activeTab === 'Experience' && (
            <ExperienceTab profile={profile} formData={formData} setFormData={setFormData} isEditing={isEditing} />
          )}

          {/* ── PROJECTS ── */}
          {activeTab === 'Projects' && (
            <ProjectsTab profile={profile} formData={formData} setFormData={setFormData} isEditing={isEditing} />
          )}

          {/* ── CERTIFICATES ── */}
          {activeTab === 'Certificates' && (
            <CertificatesTab profile={profile} formData={formData} setFormData={setFormData} isEditing={isEditing} />
          )}

          {/* ── PREFERENCES ── */}
          {activeTab === 'Preferences' && (
            <PreferencesTab profile={profile} formData={formData} setFormData={setFormData} isEditing={isEditing} />
          )}

          {/* ── RESUME ── */}
          {activeTab === 'Resume' && (
            <div className="card-p">
              <h3 className="font-semibold text-gray-900 mb-4">Resume</h3>
              {profile?.resume?.url ? (
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                    <span className="text-red-600 font-bold text-xs">PDF</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 text-sm">{profile.resume.filename || 'Resume.pdf'}</p>
                    {profile.resume.updatedAt && <p className="text-xs text-gray-400">Updated on {formatDate(profile.resume.updatedAt)}</p>}
                  </div>
                  <div className="flex gap-2">
                    {resumeUrl && <a href={resumeUrl} target="_blank" rel="noopener noreferrer" className="btn-secondary btn-sm">View</a>}
                    <button onClick={() => resumeInputRef.current?.click()} className="btn-primary btn-sm">Update</button>
                  </div>
                </div>
              ) : (
                <div onClick={() => resumeInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center cursor-pointer hover:border-primary-300 hover:bg-primary-50 transition-all">
                  <Upload size={32} className="text-gray-300 mx-auto mb-2" />
                  <p className="font-medium text-gray-600">Click to upload your resume</p>
                  <p className="text-xs text-gray-400 mt-1">PDF, DOC, DOCX (Max 5MB)</p>
                </div>
              )}
              <input ref={resumeInputRef} type="file" accept=".pdf,.doc,.docx" className="hidden"
                onChange={e => { if (e.target.files[0]) resumeMutation.mutate(e.target.files[0]); }} />
              {resumeMutation.isLoading && <p className="text-sm text-primary-600 mt-2 text-center">Uploading...</p>}
            </div>
          )}
        </div>

        {/* Right Sidebar */}
        {user?.role !== 'admin' && (
          <div className="space-y-4">
            {/* Resume quick view */}
            <div className="card-p">
              <h3 className="font-semibold text-gray-900 mb-3">Resume</h3>
              {profile?.resume?.url ? (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-600 text-xs font-bold">PDF</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{profile.resume.filename || 'Resume.pdf'}</p>
                    {profile.resume.updatedAt && <p className="text-xs text-gray-400">Updated {formatDate(profile.resume.updatedAt)}</p>}
                  </div>
                </div>
              ) : <p className="text-sm text-gray-400">No resume uploaded.</p>}
              <button onClick={() => resumeInputRef.current?.click()} className="btn-secondary w-full mt-3 text-sm">
                {profile?.resume?.url ? 'Update Resume' : 'Upload Resume'}
              </button>
            </div>

            {/* Social Profiles */}
            <div className="card-p">
              <h3 className="font-semibold text-gray-900 mb-3">Profiles</h3>
              {[
                { label: 'LinkedIn',  key: 'linkedin',  Logo: LinkedInLogo },
                { label: 'GitHub',    key: 'github',    Logo: GitHubLogo   },
                { label: 'Portfolio', key: 'portfolio', Logo: PortfolioLogo },
              ].map(({ label, key, Logo }) => (
                <div key={key} className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center flex-shrink-0">
                    <Logo />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-400">{label}</p>
                    {isEditing ? (
                      <input value={formData.profiles?.[key] || ''}
                        onChange={e => setFormData(p => ({ ...p, profiles: { ...p.profiles, [key]: e.target.value } }))}
                        placeholder={`${label} URL`} className="input text-xs py-1" />
                    ) : profile?.profiles?.[key] ? (
                      <a href={profile.profiles[key]} target="_blank" rel="noopener noreferrer"
                        className="text-sm font-semibold text-primary-600 hover:text-primary-700 transition-colors truncate block">
                        {(key === 'linkedin' || key === 'github') 
                          ? profile.profiles[key].split('/').filter(Boolean).pop() 
                          : `View ${label}`}
                      </a>
                    ) : (
                      <span className="text-sm text-gray-400">Not added</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>

      {/* ── Crop Modal ── */}
      {cropSrc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Crop size={18} className="text-primary-600" />
                <h3 className="font-semibold text-gray-900">Crop Profile Photo</h3>
              </div>
              <button onClick={() => setCropSrc(null)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
                <X size={18} />
              </button>
            </div>

            {/* Crop area */}
            <div className="p-5 flex justify-center bg-gray-50">
              <ReactCrop
                crop={crop}
                onChange={(_, pct) => setCrop(pct)}
                onComplete={(c) => setCompletedCrop(c)}
                aspect={1}
                circularCrop
                className="max-h-80"
              >
                <img
                  ref={imgRef}
                  src={cropSrc}
                  alt="Crop preview"
                  onLoad={onImageLoad}
                  className="max-h-80 object-contain"
                />
              </ReactCrop>
            </div>

            {/* Actions */}
            <div className="flex gap-3 px-5 py-4 border-t border-gray-100">
              <button onClick={() => setCropSrc(null)} className="btn-secondary flex-1 justify-center">
                Cancel
              </button>
              <button
                onClick={handleCropConfirm}
                disabled={!completedCrop || avatarMutation.isLoading}
                className="btn-primary flex-1 justify-center"
              >
                {avatarMutation.isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Uploading…
                  </span>
                ) : 'Apply & Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProfilePage;
