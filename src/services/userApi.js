import api from './api';

export const userApi = {
  register: (data) => api.post('/api/users/register', data),
};
