import api from './api';

export const adminService = {
  dashboard: () => api.get('/admin/dashboard'),
  users: (params) => api.get('/admin/users', { params }),
  sessions: (params) => api.get('/admin/sessions', { params }),
  ratings: (params) => api.get('/admin/ratings', { params }),
  resources: (params) => api.get('/admin/resources', { params }),
  skills: (params) => api.get('/admin/skills', { params }),
  createSkill: (payload) => api.post('/admin/skills', payload),
  updateSkill: (id, payload) => api.put(`/admin/skills/${id}`, payload),
};
