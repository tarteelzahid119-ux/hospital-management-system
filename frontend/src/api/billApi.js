import api from './axiosInstance';

export const getBills = (params) => api.get('/bills', { params });
export const getBill = (id) => api.get(`/bills/${id}`);
export const createBill = (payload) => api.post('/bills', payload);
export const updatePaymentStatus = (id, paymentStatus) => api.patch(`/bills/${id}/payment`, { paymentStatus });
export const deleteBill = (id) => api.delete(`/bills/${id}`);
