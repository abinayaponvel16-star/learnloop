import api from './api';

export const resourceService = {
  list: (params) => api.get('/resources', { params }),
  get: (id) => api.get(`/resources/${id}`),
  upload: (payload) => api.post('/resources/upload', payload),
  delete: (id) => api.delete(`/resources/${id}`),
  download: (id) => api.patch(`/resources/${id}/download`),
};
