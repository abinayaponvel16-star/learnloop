import api from './api';

export const notificationService = {
  list: (params) => api.get('/notifications', { params }),
  read: (id) => api.patch(`/notifications/${id}/read`),
};
