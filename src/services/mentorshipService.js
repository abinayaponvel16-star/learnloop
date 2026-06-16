import api from './api';

export const mentorshipService = {
  list: (params) => api.get('/mentorships', { params }),
  request: (payload) => api.post('/mentorships/request', payload),
  get: (id) => api.get(`/mentorships/${id}`),
  accept: (id, payload) => api.put(`/mentorships/${id}/accept`, payload),
  reject: (id) => api.put(`/mentorships/${id}/reject`),
  complete: (id) => api.put(`/mentorships/${id}/complete`),
};
