import api from './api';

export const ratingService = {
  create: (payload) => api.post('/ratings', payload),
  list: (params) => api.get('/ratings', { params }),
  get: (id) => api.get(`/ratings/${id}`),
};
