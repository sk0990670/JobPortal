import api from './api';

export const authService = {
  register:       (data) => api.post('/auth/register', data),
  login:          (data) => api.post('/auth/login', data),
  getMe:          ()     => api.get('/auth/me'),
  logout:         ()     => api.post('/auth/logout'),
  changePassword: (data) => api.put('/auth/change-password', data),
  verifyOTP:      (data) => api.post('/auth/verify-otp', data),
  resendOTP:      (data) => api.post('/auth/resend-otp', data),
};
