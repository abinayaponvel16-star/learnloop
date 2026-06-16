import api from './api';

export const userService = {
  list: (params) => api.get('/admin/users', { params }),
  mentors: (params) => api.get('/users/mentors', { params }),
  stats: () => api.get('/users/stats', { silent: true }),
  updateProfile: (payload) => api.put('/auth/profile', payload),
  delete: (id) => api.delete(`/admin/users/${id}`),
};
