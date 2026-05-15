import api from './api';

export const adminService = {
  getStats: async (params = {}) => {
    // If we want date ranges, we can pass start/end
    const response = await api.get('/admin/stats', { params });
    return response.data;
  },
  getUsers: async () => {
    const response = await api.get('/admin/users');
    return response.data;
  },
  getSystemStatus: async () => {
    const response = await api.get('/admin/system-status');
    return response.data;
  },
};
