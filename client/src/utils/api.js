/**
 * API Utility
 * Axios instance with base URL configuration
 * In production (Vercel), frontend and API share the same domain so baseURL is '/api'
 * In development, Vite proxy forwards '/api' to localhost:5000
 */
import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || '/api',
    headers: {
        'Content-Type': 'application/json'
    }
});

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const message = error.response?.data?.message || 'Something went wrong';
        console.error('API Error:', message);
        return Promise.reject(error);
    }
);

export default api;
