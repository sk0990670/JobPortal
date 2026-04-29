import api from './api';

export const userService = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
  uploadResume: (file) => {
    const formData = new FormData();
    formData.append('resume', file);
    return api.post('/users/upload-resume', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
  uploadAvatar: (file) => {
    const formData = new FormData();
    formData.append('avatar', file);
    return api.post('/users/upload-avatar', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
  toggleSaveJob: (jobId) => api.post(`/users/save-job/${jobId}`),
  getSavedJobs: (params) => api.get('/users/saved-jobs', { params }),
  updateSettings: (settings) => api.put('/users/settings', { settings }),
  getDashboard: () => api.get('/users/dashboard'),
  deactivateAccount: () => api.delete('/users/deactivate'),
};
