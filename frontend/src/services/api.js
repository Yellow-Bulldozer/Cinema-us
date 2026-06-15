import axios from 'axios';

export const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: `${API_BASE}/api`,
});

export const assetUrl = (path) => {
  if (!path) return '';
  return path.startsWith('http') ? path : `${API_BASE}${path}`;
};

export const watchlistApi = {
  list: (params) => api.get('/watchlist', { params }).then((res) => res.data.data),
  create: (formData) => api.post('/watchlist', formData).then((res) => res.data.data),
  update: (id, formData) => api.put(`/watchlist/${id}`, formData).then((res) => res.data.data),
  remove: (id) => api.delete(`/watchlist/${id}`).then((res) => res.data),
  status: (id, status) => api.patch(`/watchlist/${id}/status`, { status }).then((res) => res.data.data),
  favorite: (id) => api.patch(`/watchlist/${id}/favorite`).then((res) => res.data.data),
};

export const metaApi = {
  stats: () => api.get('/stats').then((res) => res.data.data),
  timeline: () => api.get('/timeline').then((res) => res.data.data),
  settings: () => api.get('/settings').then((res) => res.data.data),
  updateSettings: (payload) => api.put('/settings', payload).then((res) => res.data.data),
  clearAll: () => api.delete('/settings/clear-all').then((res) => res.data),
  shareStatus: () => api.get('/share/status').then((res) => res.data.data),
  toggleShare: () => api.post('/share/toggle').then((res) => res.data.data),
  shared: (token) => api.get(`/share/${token}`).then((res) => res.data.data),
};

export const transferApi = {
  importJson: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/import/json', formData).then((res) => res.data.data);
  },
  downloadUrl: (type) => `${API_BASE}/api/export/${type}`,
};

export default api;
