import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { User, Bell, Shield, Lock, Sliders, Link as LinkIcon, Trash2, Edit2, ToggleLeft, ToggleRight } from 'lucide-react';
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
  const [activeTab, setActiveTab] = useState('account');
  const [editingAccount, setEditingAccount] = useState(false);
  const [notifications, setNotifications] = useState({
    jobAlerts: user?.settings?.emailNotifications?.jobAlerts ?? true,
    applicationUpdates: user?.settings?.emailNotifications?.applicationUpdates ?? true,
    marketingEmails: user?.settings?.emailNotifications?.marketingEmails ?? false,
    weeklySummary: user?.settings?.emailNotifications?.weeklySummary ?? true,
  });

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: { fullName: user?.fullName, email: user?.email, phone: user?.phone, location: user?.location },
  });
  const { register: regPwd, handleSubmit: handlePwd, formState: { errors: pwdErrors }, reset: resetPwd } = useForm();

  const updateProfileMutation = useMutation({
    mutationFn: (data) => userService.updateProfile(data),
    onSuccess: ({ data }) => { dispatch(updateUser(data.data)); toast.success('Account settings updated!'); setEditingAccount(false); },
    onError: () => toast.error('Update failed'),
  });

  const updateNotificationsMutation = useMutation({
    mutationFn: (settings) => userService.updateSettings({ emailNotifications: settings }),
    onSuccess: () => toast.success('Notification settings saved!'),
  });

  const changePasswordMutation = useMutation({
    mutationFn: (data) => authService.changePassword ? authService.changePassword(data) : userService.updateProfile(data),
    onSuccess: () => { toast.success('Password changed successfully!'); resetPwd(); },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to change password'),
  });

  const handleToggle = (key) => {
    const updated = { ...notifications, [key]: !notifications[key] };
    setNotifications(updated);
    updateNotificationsMutation.mutate(updated);
  };

  const notificationItems = [
    { key: 'jobAlerts', label: 'Job Alerts', desc: 'Receive email alerts for new jobs matching your preferences.', icon: '📧' },
    { key: 'applicationUpdates', label: 'Application Updates', desc: 'Get notified about your application status updates.', icon: '📋' },
    { key: 'marketingEmails', label: 'Marketing Emails', desc: 'Receive emails about new features, tips and offers.', icon: '📣' },
    { key: 'weeklySummary', label: 'Weekly Summary', desc: 'Get a weekly summary of relevant jobs and opportunities.', icon: '📅' },
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
                  } ${id === 'deactivate' ? 'text-red-500 hover:bg-red-50' : ''}`}>
                  <Icon size={15} />
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
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="font-bold text-gray-900">Account Settings</h2>
                  <p className="text-xs text-gray-500 mt-0.5">Update your personal information and account details.</p>
                </div>
                <button onClick={() => setEditingAccount(!editingAccount)} className="btn-secondary btn-sm gap-1.5">
                  <Edit2 size={13} />{editingAccount ? 'Cancel' : 'Edit'}
                </button>
              </div>
              {editingAccount ? (
                <form onSubmit={handleSubmit(data => updateProfileMutation.mutate(data))} className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Full Name</label>
                    <input {...register('fullName', { required: true })} className={`input ${errors.fullName ? 'input-error' : ''}`} />
                  </div>
                  <div>
                    <label className="label">Email Address</label>
                    <input {...register('email')} type="email" className="input" disabled />
                  </div>
                  <div>
                    <label className="label">Phone Number</label>
                    <input {...register('phone')} className="input" />
                  </div>
                  <div>
                    <label className="label">Location</label>
                    <input {...register('location')} className="input" />
                  </div>
                  <div className="col-span-2">
                    <button type="submit" disabled={updateProfileMutation.isLoading} className="btn-primary">
                      {updateProfileMutation.isLoading ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {[
                    { label: 'Full Name', value: user?.fullName },
                    { label: 'Email Address', value: user?.email },
                    { label: 'Phone Number', value: user?.phone || '—' },
                    { label: 'Location', value: user?.location || '—' },
                  ].map(({ label, value }) => (
                    <div key={label} className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-400 mb-0.5">{label}</p>
                      <p className="font-medium text-gray-900">{value}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Email & Notifications */}
          {activeTab === 'notifications' && (
            <div className="card-p">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="font-bold text-gray-900">Email & Notifications</h2>
                  <p className="text-xs text-gray-500">Choose what you want to be notified about.</p>
                </div>
                <button className="btn-secondary btn-sm"><Edit2 size={13} /> Edit</button>
              </div>
              <div className="space-y-4">
                {notificationItems.map(({ key, label, desc, icon }) => (
                  <div key={key} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{icon}</span>
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{label}</p>
                        <p className="text-xs text-gray-500">{desc}</p>
                      </div>
                    </div>
                    <Toggle checked={notifications[key]} onChange={() => handleToggle(key)} />
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
              <hr className="border-gray-100" />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900 text-sm">Two-Factor Authentication</p>
                  <p className="text-xs text-gray-500">Add an extra layer of security to your account.</p>
                  <span className="badge-gray mt-1">Disabled</span>
                </div>
                <button className="btn-secondary btn-sm">Enable 2FA</button>
              </div>
            </div>
          )}

          {/* Privacy Settings */}
          {activeTab === 'privacy' && (
            <div className="card-p">
              <h2 className="font-bold text-gray-900 mb-4">Privacy Settings</h2>
              <div className="space-y-4">
                {[
                  { label: 'Profile Visibility', desc: 'Make your profile visible to recruiters and companies.', value: true },
                  { label: 'Show Email', desc: 'Allow recruiters to see your email address.', value: false },
                  { label: 'Show Phone', desc: 'Allow recruiters to see your phone number.', value: false },
                ].map(({ label, desc, value }) => (
                  <div key={label} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{label}</p>
                      <p className="text-xs text-gray-500">{desc}</p>
                    </div>
                    <Toggle checked={value} onChange={() => {}} />
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
    </div>
  );
};

export default SettingsPage;
