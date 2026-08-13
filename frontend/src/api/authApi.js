import api from './axiosInstance';

export const signup = (payload) => api.post('/auth/signup', payload);
export const login = (payload) => api.post('/auth/login', payload);
export const getMe = () => api.get('/auth/me');
