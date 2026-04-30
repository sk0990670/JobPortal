import { useState } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { User, Bell, Shield, Lock, Sliders, Link as LinkIcon, Trash2, Edit2, ToggleLeft, ToggleRight, Mail, ClipboardList, Megaphone, Calendar } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { selectUser, updateUser } from '../store/slices/authSlice';
import { userService } from '../services/userService';
import { authService } from '../services/authService';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

const SETTINGS_TABS = [
  { id: 'account', label: 'Account Settings', icon: User },
  { id: 'notifications', label: 'Email & Notifications', icon: Bell },
  { id: 'privacy', label: 'Privacy Settings', icon: Shield },
  { id: 'password', label: 'Password & Security', icon: Lock },
  { id: 'preferences', label: 'Application Preferences', icon: Sliders },
  { id: 'connected', label: 'Connected Accounts', icon: LinkIcon },
  { id: 'deactivate', label: 'Deactivate Account', icon: Trash2 },
];

const Toggle = ({ checked, onChange }) => (
  <button onClick={() => onChange(!checked)}
    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${checked ? 'bg-primary-600' : 'bg-gray-200'}`}>
    <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
  </button>
);

const SettingsPage = () => {
  const user = useSelector(selectUser);
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  const { data: profileData } = useQuery({
    queryKey: ['profile'],
    queryFn: () => userService.getProfile().then(r => r.data),
    staleTime: 2 * 60 * 1000,
  });
  const profile = profileData?.data || user;

  const [activeTab, setActiveTab] = useState('password');
  const [editingAccount, setEditingAccount] = useState(false);
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [twoFaSecret, setTwoFaSecret] = useState('');
  const [twoFaCode, setTwoFaCode] = useState('');
  const [isSettingUp2FA, setIsSettingUp2FA] = useState(false);
  const [notifications, setNotifications] = useState({
    jobAlerts: profile?.settings?.emailNotifications?.jobAlerts ?? true,
    applicationUpdates: profile?.settings?.emailNotifications?.applicationUpdates ?? true,
    marketingEmails: profile?.settings?.emailNotifications?.marketingEmails ?? false,
    weeklySummary: profile?.settings?.emailNotifications?.weeklySummary ?? true,
  });

  const [privacy, setPrivacy] = useState({
    profileVisibility: profile?.settings?.profileVisibility ?? true,
    showEmail: profile?.settings?.showEmail ?? false,
    showPhone: profile?.settings?.showPhone ?? false,
  });

  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    values: { fullName: profile?.fullName || '', email: profile?.email || '', phone: profile?.phone || '', location: profile?.location || '' },
  });
  const { register: regPwd, handleSubmit: handlePwd, formState: { errors: pwdErrors }, reset: resetPwd, watch: watchPwd } = useForm();

  const updateProfileMutation = useMutation({
    mutationFn: (data) => userService.updateProfile(data),
    onSuccess: ({ data }) => { 
      dispatch(updateUser(data.data)); 
      queryClient.invalidateQueries(['profile']);
      toast.success('Account settings updated!'); 
      setEditingAccount(false); 
    },
    onError: () => toast.error('Update failed'),
  });

  const updateSettingsMutation = useMutation({
    mutationFn: (newSettings) => userService.updateSettings({ ...profile.settings, ...newSettings }),
    onSuccess: (res) => {
      const updatedSettings = res.data?.data || res.data;
      dispatch(updateUser({ ...profile, settings: updatedSettings }));
      queryClient.invalidateQueries(['profile']);
      toast.success('Settings saved!');
    },
    onError: () => toast.error('Failed to save settings'),
  });

  const changePasswordMutation = useMutation({
    mutationFn: (data) => authService.changePassword ? authService.changePassword(data) : userService.updateProfile(data),
    onSuccess: () => { toast.success('Password changed successfully!'); resetPwd(); },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to change password'),
  });

  const handleToggle = (type, key) => {
    if (type === 'notifications') {
      const updated = { ...notifications, [key]: !notifications[key] };
      setNotifications(updated);
      updateSettingsMutation.mutate({ emailNotifications: updated });
    } else if (type === 'privacy') {
      const updated = { ...privacy, [key]: !privacy[key] };
      setPrivacy(updated);
      updateSettingsMutation.mutate(updated);
    }
  };

  const notificationItems = [
    { key: 'jobAlerts', label: 'Job Alerts', desc: 'Receive email alerts for new jobs matching your preferences.', icon: Mail },
    { key: 'applicationUpdates', label: 'Application Updates', desc: 'Get notified about your application status updates.', icon: ClipboardList },
    { key: 'marketingEmails', label: 'Marketing Emails', desc: 'Receive emails about new features, tips and offers.', icon: Megaphone },
    { key: 'weeklySummary', label: 'Weekly Summary', desc: 'Get a weekly summary of relevant jobs and opportunities.', icon: Calendar },
  ];

  return (
    <div className="animate-fade-in max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500 mt-0.5">Manage your account preferences and application settings.</p>
      </div>

      <div className="grid lg:grid-cols-4 gap-5">
        {/* Tabs Sidebar */}
        <div className="lg:col-span-1">
          <div className="card-p">
            <nav className="space-y-0.5">
              {SETTINGS_TABS.map(({ id, label, icon: Icon }) => (
                <button key={id} onClick={() => setActiveTab(id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium text-left transition-colors ${
                    activeTab === id ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:bg-gray-50'
                  }`}>
                  <Icon size={15} className={id === 'deactivate' ? 'text-red-500' : ''} />
                  <span className="leading-tight">{label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="lg:col-span-3 space-y-5">
          {/* Account Settings */}
          {activeTab === 'account' && (
            <div className="card-p">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="font-bold text-gray-900">Account Settings</h2>
                  <p className="text-xs text-gray-500 mt-0.5">Update your personal information and account details.</p>
                </div>
                {!editingAccount && (
                  <button onClick={() => setEditingAccount(true)} className="btn-secondary btn-sm gap-1.5">
                    <Edit2 size={13} />Edit
                  </button>
                )}
              </div>
              {editingAccount ? (
                <form onSubmit={handleSubmit(data => updateProfileMutation.mutate(data))} className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-2xl">
                  <div>
                    <label className="label">Full Name</label>
                    <input {...register('fullName', { required: true })} className={`input ${errors.fullName ? 'input-error' : ''}`} />
                  </div>
                  <div>
                    <label className="label">Email Address</label>
                    <input {...register('email')} type="email" className="input bg-gray-50 text-gray-500 cursor-not-allowed" disabled />
                  </div>
                  <div>
                    <label className="label">Phone Number</label>
                    <input {...register('phone')} className="input" />
                  </div>
                  <div>
                    <label className="label">Location</label>
                    <input {...register('location')} className="input" />
                  </div>
                  <div className="col-span-1 sm:col-span-2 flex items-center gap-3 pt-2">
                    <button type="button" onClick={() => { setEditingAccount(false); reset(); }} className="btn-secondary">
                      Cancel
                    </button>
                    <button type="submit" disabled={updateProfileMutation.isLoading} className="btn-primary">
                      {updateProfileMutation.isLoading ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8 text-sm max-w-2xl">
                  {[
                    { label: 'Full Name', value: profile?.fullName },
                    { label: 'Email Address', value: profile?.email },
                    { label: 'Phone Number', value: profile?.phone || '—' },
                    { label: 'Location', value: profile?.location || '—' },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <p className="text-xs text-gray-500 mb-1">{label}</p>
                      <p className="font-semibold text-gray-900 text-base">{value}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Email & Notifications */}
          {activeTab === 'notifications' && (
            <div className="card-p">
              <div className="mb-6">
                <h2 className="font-bold text-gray-900">Email & Notifications</h2>
                <p className="text-xs text-gray-500 mt-0.5">Choose what you want to be notified about.</p>
              </div>
              <div className="space-y-4">
                {notificationItems.map(({ key, label, desc, icon: Icon }) => (
                  <div key={key} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                    <div className="flex items-center gap-4">
                      <div className="p-2.5 bg-primary-50 text-primary-600 rounded-full">
                        <Icon size={18} />
                      </div>
                      <div className="flex flex-col justify-center">
                        <p className="font-medium text-gray-900 text-sm leading-tight">{label}</p>
                        <p className="text-xs text-gray-500 mt-0.5 leading-tight">{desc}</p>
                      </div>
                    </div>
                    <Toggle checked={notifications[key]} onChange={() => handleToggle('notifications', key)} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Password & Security */}
          {activeTab === 'password' && (
            <div className="card-p space-y-5">
              <div>
                <h2 className="font-bold text-gray-900 mb-1">Password & Security</h2>
                <p className="text-xs text-gray-500">Change your password and manage account security.</p>
              </div>
              <form onSubmit={handlePwd(data => changePasswordMutation.mutate(data))} className="max-w-sm flex flex-col gap-4">
                <div>
                  <label className="label">Current Password</label>
                  <input {...regPwd('currentPassword', { required: 'Required' })} type="password"
                    placeholder="••••••••••••" className={`input ${pwdErrors.currentPassword ? 'input-error' : ''}`} />
                </div>
                <div>
                  <label className="label">New Password</label>
                  <input {...regPwd('newPassword', { 
                    required: 'Required', 
                    minLength: { value: 8, message: 'Min 8 chars' },
                    pattern: {
                      value: /^(?=.*[A-Z])(?=.*[!@#$%^&*_=+-])/,
                      message: 'Needs 1 uppercase & 1 symbol'
                    }
                  })} type="password"
                    placeholder="New password" className={`input ${pwdErrors.newPassword ? 'input-error' : ''}`} />
                  {pwdErrors.newPassword ? (
                    <p className="text-xs text-red-500 mt-1">{pwdErrors.newPassword.message}</p>
                  ) : (
                    <p className="text-[11px] text-gray-500 mt-1.5 font-medium">Minimum 8 characters, 1 uppercase, 1 symbol</p>
                  )}
                </div>
                <div>
                  <label className="label">Confirm New Password</label>
                  <input {...regPwd('confirmPassword', { 
                    required: 'Required', 
                    validate: val => val === watchPwd('newPassword') || 'Passwords do not match' 
                  })} type="password"
                    placeholder="Confirm password" className={`input ${pwdErrors.confirmPassword ? 'input-error' : ''}`} />
                  {pwdErrors.confirmPassword && <p className="text-xs text-red-500 mt-1">{pwdErrors.confirmPassword.message}</p>}
                </div>
                <button type="submit" disabled={changePasswordMutation.isLoading} className="btn-primary mt-3">
                  {changePasswordMutation.isLoading ? 'Changing...' : 'Change Password'}
                </button>
              </form>
              <hr className="border-gray-100" />
              <div className="flex items-center justify-between border border-gray-200 rounded-xl p-4 bg-gray-50/50">
                <div className="flex flex-col gap-1 items-start">
                  <p className="font-medium text-gray-900 text-sm">Two-Factor Authentication</p>
                  <p className="text-xs text-gray-500 mb-1">Add an extra layer of security to your account.</p>
                  <span className={`inline-flex text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-bold ${profile?.settings?.twoFactorAuth ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>
                    {profile?.settings?.twoFactorAuth ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
                <button 
                  onClick={async () => {
                    if (profile?.settings?.twoFactorAuth) {
                      if(window.confirm('Are you sure you want to disable 2FA?')) {
                        try {
                          await authService.disable2FA();
                          dispatch(updateUser({ ...profile, settings: { ...profile.settings, twoFactorAuth: false } }));
                          queryClient.invalidateQueries(['profile']);
                          toast.success('2FA Disabled');
                        } catch(e) {
                          toast.error('Failed to disable 2FA');
                        }
                      }
                    } else {
                      try {
                        const { data } = await authService.generate2FA();
                        setQrCodeUrl(data.qrCodeUrl);
                        setTwoFaSecret(data.secret);
                        setShow2FAModal(true);
                      } catch(e) {
                        toast.error('Failed to start 2FA setup');
                      }
                    }
                  }}
                  className={`btn-sm ${profile?.settings?.twoFactorAuth ? 'btn-danger' : 'btn-secondary'}`}
                >
                  {profile?.settings?.twoFactorAuth ? 'Disable 2FA' : 'Enable 2FA'}
                </button>
              </div>
            </div>
          )}

          {/* Privacy Settings */}
          {activeTab === 'privacy' && (
            <div className="card-p">
              <div className="mb-6">
                <h2 className="font-bold text-gray-900 mb-1">Privacy Settings</h2>
                <p className="text-xs text-gray-500">Adjusting these settings affects how recruiters can find and contact you on the platform.</p>
              </div>
              <div className="space-y-4 max-w-3xl">
                {[
                  { key: 'profileVisibility', label: 'Profile Visibility', desc: 'Make your profile visible to recruiters and companies.' },
                  { key: 'showEmail', label: 'Show Email', desc: 'Allow recruiters to see your email address.' },
                  { key: 'showPhone', label: 'Show Phone', desc: 'Allow recruiters to see your phone number.' },
                ].map(({ key, label, desc }) => (
                  <div key={key} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                    <div className="flex flex-col justify-center">
                      <p className="font-medium text-gray-900 text-sm leading-tight">{label}</p>
                      <p className="text-xs text-gray-500 mt-0.5 leading-tight">{desc}</p>
                    </div>
                    <Toggle checked={privacy[key]} onChange={() => handleToggle('privacy', key)} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Deactivate Account */}
          {activeTab === 'deactivate' && (
            <div className="card-p border-red-100 bg-red-50">
              <h2 className="font-bold text-red-700 mb-2">Deactivate Account</h2>
              <p className="text-sm text-red-600 mb-4">
                Once you deactivate your account, all your data will be hidden. This action can be reversed by contacting support.
              </p>
              <button onClick={() => {
                if (window.confirm('Are you sure you want to deactivate your account?')) {
                  userService.deactivateAccount().then(() => { toast.success('Account deactivated.'); });
                }
              }} className="btn-danger">Deactivate My Account</button>
            </div>
          )}
        </div>
      </div>
      {/* 2FA Setup Modal */}
      {show2FAModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 overflow-hidden">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Set up Two-Factor Authentication</h2>
            <p className="text-sm text-gray-500 mb-4">
              1. Scan this QR code with your authenticator app (like Google Authenticator, Authy, or AWS MFA).
            </p>
            <div className="flex justify-center mb-4 p-4 bg-gray-50 rounded-xl">
              {qrCodeUrl ? <img src={qrCodeUrl} alt="2FA QR Code" className="w-48 h-48" /> : <div className="w-48 h-48 animate-pulse bg-gray-200"></div>}
            </div>
            <p className="text-sm text-gray-500 mb-4">
              2. Enter the 6-digit code generated by the app to confirm.
            </p>
            <input 
              type="text" 
              maxLength="6"
              className="input text-center text-xl tracking-[0.5em] font-mono h-14"
              placeholder="000000"
              value={twoFaCode}
              onChange={(e) => setTwoFaCode(e.target.value.replace(/\D/g, ''))}
              onKeyDown={async (e) => {
                if (e.key === 'Enter' && twoFaCode.length === 6 && !isSettingUp2FA) {
                  setIsSettingUp2FA(true);
                  try {
                    await authService.verify2FA({ token: twoFaCode });
                    dispatch(updateUser({ ...profile, settings: { ...profile.settings, twoFactorAuth: true } }));
                    queryClient.invalidateQueries(['profile']);
                    toast.success('2FA successfully enabled! 🎉');
                    setShow2FAModal(false);
                    setTwoFaCode('');
                  } catch (err) {
                    toast.error(err.response?.data?.message || 'Invalid code. Try again.');
                  } finally {
                    setIsSettingUp2FA(false);
                  }
                }
              }}
            />
            <div className="flex gap-3 mt-6">
              <button onClick={() => { setShow2FAModal(false); setTwoFaCode(''); }} className="btn-secondary flex-1">Cancel</button>
              <button 
                disabled={twoFaCode.length !== 6 || isSettingUp2FA}
                onClick={async () => {
                  setIsSettingUp2FA(true);
                  try {
                    await authService.verify2FA({ token: twoFaCode });
                    dispatch(updateUser({ ...profile, settings: { ...profile.settings, twoFactorAuth: true } }));
                    queryClient.invalidateQueries(['profile']);
                    toast.success('2FA successfully enabled! 🎉');
                    setShow2FAModal(false);
                    setTwoFaCode('');
                  } catch (e) {
                    toast.error(e.response?.data?.message || 'Invalid code. Try again.');
                  } finally {
                    setIsSettingUp2FA(false);
                  }
                }} 
                className="btn-primary flex-1"
              >
                {isSettingUp2FA ? 'Verifying...' : 'Verify & Enable'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;
