import api from './axiosInstance';

export const getPatients = (params) => api.get('/patients', { params });
export const getPatient = (id) => api.get(`/patients/${id}`);
export const createPatient = (payload) => api.post('/patients', payload);
export const updatePatient = (id, payload) => api.put(`/patients/${id}`, payload);
export const deletePatient = (id) => api.delete(`/patients/${id}`);
