import api from './api';

export const jobService = {
  getJobs: (params) => api.get('/jobs', { params }),
  getFeaturedJobs: () => api.get('/jobs/featured'),
  getInternships: (params) => api.get('/jobs/internships', { params }),
  getJobById: (id) => api.get(`/jobs/${id}`),
  createJob: (data) => api.post('/jobs', data),
  updateJob: (id, data) => api.put(`/jobs/${id}`, data),
  deleteJob: (id) => api.delete(`/jobs/${id}`),
  uploadLogo: (file) => {
    const formData = new FormData();
    formData.append('logo', file);
    return api.post('/jobs/upload-logo', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
};
