import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authAPI = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  register: (email: string, password: string, name: string) =>
    api.post('/auth/register', { email, password, name }),
};

// Tickets API
export const ticketsAPI = {
  getAll: (filters?: any) => api.get('/tickets', { params: filters }),
  getOne: (id: string) => api.get(`/tickets/${id}`),
  create: (data: any) => api.post('/tickets', data),
  update: (id: string, data: any) => api.put(`/tickets/${id}`, data),
  delete: (id: string) => api.delete(`/tickets/${id}`),
  getMetrics: () => api.get('/tickets/metrics'),
};

// Comments API
export const commentsAPI = {
  getByTicket: (ticketId: string) => api.get(`/comments/ticket/${ticketId}`),
  create: (data: any) => api.post('/comments', data),
};

// Notifications API
export const notificationsAPI = {
  getAll: (unreadOnly?: boolean) =>
    api.get('/notifications', { params: { unreadOnly } }),
  getUnreadCount: () => api.get('/notifications/unread-count'),
  markAsRead: (id: string) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
};

// Users API
export const usersAPI = {
  search: (query: string) => api.get('/users/search', { params: { q: query } }),
};
