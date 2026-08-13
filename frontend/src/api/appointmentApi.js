import api from './axiosInstance';

export const getAppointments = (params) => api.get('/appointments', { params });
export const getAppointment = (id) => api.get(`/appointments/${id}`);
export const createAppointment = (payload) => api.post('/appointments', payload);
export const updateAppointment = (id, payload) => api.put(`/appointments/${id}`, payload);
export const updateAppointmentStatus = (id, status) => api.patch(`/appointments/${id}/status`, { status });
export const deleteAppointment = (id) => api.delete(`/appointments/${id}`);
