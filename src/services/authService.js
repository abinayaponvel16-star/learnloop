import api from './api';

export const authService = {
  register: (payload) => api.post('/auth/register', payload),
  login: (payload) => api.post('/auth/login', payload),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
  updateProfile: (payload) => api.put('/auth/profile', payload),
  updateAvatar: (payload) => api.put('/auth/profile/avatar', payload),
  changePassword: (payload) => api.put('/auth/change-password', payload),
};
