import api from './axiosInstance';

export const getNotifications = (limit = 20) => api.get('/notifications', { params: { limit } });
