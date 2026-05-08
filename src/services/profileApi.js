import api from './api';

export const profileApi = {
  getProfiles: () => api.get('/api/profiles'),
  createProfile: (data) => api.post('/api/profiles', data),
  updateProfile: (id, data) => api.put(`/api/profiles/${id}`, data),
  deleteProfile: (id, pin) => api.delete(`/api/profiles/${id}`, { data: pin ? { pin } : {} }),
  switchProfile: (id, pin) => {
    const body = pin ? { pin } : {};
    return api.post(`/api/profiles/${id}/switch`, body);
  },
};
