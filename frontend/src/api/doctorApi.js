import api from './axiosInstance';

export const getDoctors = (params) => api.get('/doctors', { params });
export const getDoctor = (id) => api.get(`/doctors/${id}`);
export const createDoctor = (payload) => api.post('/doctors', payload);
export const updateDoctor = (id, payload) => api.put(`/doctors/${id}`, payload);
export const deleteDoctor = (id) => api.delete(`/doctors/${id}`);
