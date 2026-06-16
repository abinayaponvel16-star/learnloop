import api from './api';

export const sessionService = {
  create: (payload) => api.post('/sessions', payload),
  list: (params) => api.get('/sessions', { params }),
  get: (id) => api.get(`/sessions/${id}`),
  update: (id, payload) => api.put(`/sessions/${id}`, payload),
  start: (id) => api.put(`/sessions/${id}/start`),
  end: (id) => api.put(`/sessions/${id}/end`),
  complete: (id) => api.put(`/sessions/${id}/complete`),
  cancel: (id) => api.put(`/sessions/${id}/cancel`),
  delete: (id) => api.delete(`/sessions/${id}`),
};
