import api from './api';

export const authApi = {
  login: (data) => api.post('/api/auth/login', data),
  logout: () => api.post('/api/auth/logout'),
  sendActivateOtp: (email) => api.post('/api/auth/send-activate-otp', { email }),
  activateAccount: (email, otp) => api.post('/api/auth/activate-account', { email, otp }),
  forgotPassword: (email) => api.post('/api/auth/forgot-password', { email }),
  verifyForgotPassword: (email, otp) => api.post('/api/auth/verify-forgot-password', { email, otp }),
  resetPassword: (data) => api.post('/api/auth/reset-password', data),
};
