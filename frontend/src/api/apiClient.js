import axios from 'axios';

const API_BASE_URL = 'https://product-rest-api-drab.vercel.app';

// Create axios instance
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Token expired or invalid
            localStorage.removeItem('accessToken');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Auth API
export const authAPI = {
    register: (data) => apiClient.post('/api/auth/register', data),
    login: (data) => apiClient.post('/api/auth/login', data),
    logout: () => apiClient.post('/api/auth/logout'),
    getMe: () => apiClient.get('/api/auth/me'),
};

// Products API
export const productsAPI = {
    getAll: (params) => apiClient.get('/api/products', { params }),
    getById: (id) => apiClient.get(`/api/products/${id}`),
    create: (data) => apiClient.post('/api/products', data),
    update: (id, data) => apiClient.put(`/api/products/${id}`, data),
    delete: (id) => apiClient.delete(`/api/products/${id}`),
    getCategories: () => apiClient.get('/api/products/categories/list'),
};

export default apiClient;
