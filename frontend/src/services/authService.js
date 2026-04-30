import api from './api';

export const authService = {
  register:       (data) => api.post('/auth/register', data),
  login:          (data) => api.post('/auth/login', data),
  getMe:          ()     => api.get('/auth/me'),
  logout:         ()     => api.post('/auth/logout'),
  changePassword: (data) => api.put('/auth/change-password', data),
  verifyOTP:      (data) => api.post('/auth/verify-otp', data),
  resendOTP:      (data) => api.post('/auth/resend-otp', data),
  generate2FA:    ()     => api.get('/auth/2fa/generate'),
  verify2FA:      (data) => api.post('/auth/2fa/verify', data),
  disable2FA:     ()     => api.post('/auth/2fa/disable'),
  verify2FALogin: (data) => api.post('/auth/verify-2fa-login', data),
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
  resetPassword:  (data) => api.post('/auth/reset-password', data),
};
