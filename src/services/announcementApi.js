import api from './api';

export const announcementApi = {
  // Public
  getActive: () => api.get('/api/announcements/active'),

  // Mod/Admin
  getAll: (params) => api.get('/api/announcements', { params }),
  getById: (id) => api.get(`/api/announcements/${id}`),
  create: (data) => api.post('/api/announcements', data),
  update: (id, data) => api.put(`/api/announcements/${id}`, data),
  publish: (id) => api.patch(`/api/announcements/${id}/publish`),
  unpublish: (id) => api.patch(`/api/announcements/${id}/unpublish`),
  delete: (id) => api.delete(`/api/announcements/${id}`),
};
