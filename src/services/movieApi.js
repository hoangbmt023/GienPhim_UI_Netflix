import api from './api';

export const movieApi = {
  // Favorites
  getFavorites: (page = 1, size = 20) => api.get(`/api/movies/favorites?page=${page}&size=${size}`),
  addFavorite: (slug) => api.post('/api/movies/favorites', { slug }),
  checkFavorite: (slug) => api.get(`/api/movies/favorites/check/${slug}`),
  removeFavorite: (favoriteId) => api.delete('/api/movies/favorites', { data: { favoriteId } }),
  removeFavorites: (favoriteIds) => api.delete('/api/movies/favorites', { data: { favoriteIds } }),

  // History
  getHistory: (page = 1, size = 20) => api.get(`/api/movies/history?page=${page}&size=${size}`),
  saveHistory: (slug, episode, episodeSlug, server, timePos) => api.post('/api/movies/history', { slug, episode, episodeSlug, server, timePos }),
  removeHistory: (historyId) => api.delete('/api/movies/history', { data: { historyId } }),
  removeHistories: (historyIds) => api.delete('/api/movies/history', { data: { historyIds } }),
  clearAllHistory: () => api.delete('/api/movies/history', { data: { deleteAll: true } }),
};
