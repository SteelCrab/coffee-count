import axios, { AxiosInstance, AxiosResponse } from 'axios';

// API Base Configuration
const AUTH_API_BASE_URL = process.env.REACT_APP_AUTH_API_BASE_URL || 'http://localhost:3001';
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080';

// Create axios instances
const authApi: AxiosInstance = axios.create({
  baseURL: AUTH_API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token for both instances
const addAuthToken = (config: any) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
};

authApi.interceptors.request.use(addAuthToken, (error) => Promise.reject(error));
api.interceptors.request.use(addAuthToken, (error) => Promise.reject(error));

// Response interceptor to handle token refresh
const handleTokenRefresh = async (error: any) => {
  const originalRequest = error.config;

  if (error.response?.status === 401 && !originalRequest._retry) {
    originalRequest._retry = true;

    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        const response = await axios.post(`${AUTH_API_BASE_URL}/api/auth/refresh`, {
          refreshToken,
        });

        const { accessToken } = response.data;
        localStorage.setItem('accessToken', accessToken);

        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return originalRequest.baseURL === AUTH_API_BASE_URL ? authApi(originalRequest) : api(originalRequest);
      }
    } catch (refreshError) {
      // Refresh failed, redirect to login
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      window.location.href = '/login';
    }
  }

  return Promise.reject(error);
};

authApi.interceptors.response.use((response) => response, handleTokenRefresh);
api.interceptors.response.use((response) => response, handleTokenRefresh);

// Types
export interface User {
  id: string;
  email: string;
  displayName: string;
  isActive: boolean;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
}

export interface Category {
  id: string;
  userId: string;
  name: string;
  icon: string;
  color: string;
  unit: string;
  defaultAmount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CounterData {
  id: string;
  userId: string;
  categoryId: string;
  date: string;
  count: number;
  amounts: number[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  displayName: string;
}

// Auth API (uses auth service on port 3001)
export const authAPI = {
  register: (data: RegisterRequest): Promise<AxiosResponse<AuthResponse>> =>
    authApi.post('/api/auth/register', data),

  login: (data: LoginRequest): Promise<AxiosResponse<AuthResponse>> =>
    authApi.post('/api/auth/login', data),

  refresh: (refreshToken: string): Promise<AxiosResponse<{ accessToken: string }>> =>
    authApi.post('/api/auth/refresh', { refreshToken }),

  logout: (): Promise<AxiosResponse<void>> =>
    authApi.post('/api/auth/logout'),

  verify: (): Promise<AxiosResponse<{ user: User }>> =>
    authApi.post('/api/auth/verify'),
};

// User API (uses auth service on port 3001)
export const userAPI = {
  getProfile: (): Promise<AxiosResponse<User>> =>
    authApi.get('/api/users/profile'),

  updateProfile: (data: Partial<User>): Promise<AxiosResponse<User>> =>
    authApi.put('/api/users/profile', data),

  getSessions: (): Promise<AxiosResponse<any[]>> =>
    authApi.get('/api/users/sessions'),

  revokeSession: (sessionId: string): Promise<AxiosResponse<void>> =>
    authApi.delete(`/api/users/sessions/${sessionId}`),

  deleteAccount: (): Promise<AxiosResponse<void>> =>
    authApi.delete('/api/users/account'),
};

// Categories API (uses Rust API service on port 8080)
export const categoriesAPI = {
  getAll: (): Promise<AxiosResponse<Category[]>> =>
    api.get('/api/categories'),

  create: (data: Omit<Category, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<AxiosResponse<Category>> =>
    api.post('/api/categories', data),

  getById: (id: string): Promise<AxiosResponse<Category>> =>
    api.get(`/api/categories/${id}`),

  update: (id: string, data: Partial<Category>): Promise<AxiosResponse<Category>> =>
    api.put(`/api/categories/${id}`, data),

  delete: (id: string): Promise<AxiosResponse<void>> =>
    api.delete(`/api/categories/${id}`),
};

// Counters API (uses Rust API service on port 8080)
export const countersAPI = {
  getAll: (): Promise<AxiosResponse<CounterData[]>> =>
    api.get('/api/counters'),

  create: (data: Omit<CounterData, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<AxiosResponse<CounterData>> =>
    api.post('/api/counters', data),

  getRange: (startDate: string, endDate: string): Promise<AxiosResponse<CounterData[]>> =>
    api.get(`/api/counters/range?start=${startDate}&end=${endDate}`),

  getByDate: (date: string): Promise<AxiosResponse<CounterData[]>> =>
    api.get(`/api/counters/${date}`),
};

export default api;
