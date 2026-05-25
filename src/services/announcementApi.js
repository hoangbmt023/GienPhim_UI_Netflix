import api from './api';

export const announcementApi = {
  // Public
  getActive: () => api.get('/api/announcements/active'),

  // Mod/Admin
  getAll: (params) => api.get('/api/announcements', { params }),
  getDeleted: (params) => api.get('/api/announcements', { params: { ...params, deleted: 'true' } }),
  getById: (id) => api.get(`/api/announcements/${id}`),
  create: (data) => api.post('/api/announcements', data),
  update: (id, data) => api.put(`/api/announcements/${id}`, data),
  publish: (id) => api.patch(`/api/announcements/${id}/publish`),
  unpublish: (id) => api.patch(`/api/announcements/${id}/unpublish`),

  // Admin only - soft delete
  delete: (id) => api.delete(`/api/announcements/${id}`),
  restore: (id) => api.patch(`/api/announcements/${id}/restore`),
  forceDelete: (id) => api.delete(`/api/announcements/${id}/force`),
};
