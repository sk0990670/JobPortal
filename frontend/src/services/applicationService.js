import api from './api';

export const applicationService = {
  apply: (jobId, data) => api.post(`/applications/${jobId}/apply`, data),
  getMyApplications: (params) => api.get('/applications/my', { params }),
  getApplicationById: (id) => api.get(`/applications/${id}`),
  updateStatus: (id, data) => api.put(`/applications/${id}/status`, data),
  withdraw: (id) => api.delete(`/applications/${id}/withdraw`),
  getJobApplications: (jobId, params) => api.get(`/applications/job/${jobId}`, { params }),
};

export const companyService = {
  getCompanies: (params) => api.get('/companies', { params }),
  getFeaturedCompanies: () => api.get('/companies/featured'),
  getCompanyById: (id) => api.get(`/companies/${id}`),
  createCompany: (data) => api.post('/companies', data),
};

export const resourceService = {
  getResources: (params) => api.get('/resources', { params }),
  getFeaturedResources: () => api.get('/resources/featured'),
  getResourceById: (id) => api.get(`/resources/${id}`),
  toggleBookmark: (id) => api.post(`/resources/${id}/bookmark`),
};
