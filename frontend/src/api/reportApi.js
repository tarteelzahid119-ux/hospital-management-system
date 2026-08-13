import api from './axiosInstance';

export const getSummaryReport = (period = 'daily') => api.get('/reports/summary', { params: { period } });
