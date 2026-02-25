import axios from 'axios';

const api = axios.create({
    baseURL: '/api',
    withCredentials: true,
});

export default api;
export const AUTH_URL = '/auth';
export const DOC_URL = '/documents';
export const ADMIN_URL = '/admin';
