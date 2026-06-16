import axios from 'axios';
import toast from 'react-hot-toast';
import { storage } from '../utils/storage';

const API_URL = import.meta.env.VITE_API_URL || '/api/v1';

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

const unwrapApiResponse = (payload) => {
  if (!payload || typeof payload !== 'object' || !('success' in payload) || !('data' in payload)) {
    return payload;
  }

  const data = payload.data;
  const normalized = data && typeof data === 'object' && !Array.isArray(data)
    ? { ...data }
    : { data };

  return {
    ...normalized,
    success: payload.success,
    message: payload.message,
    ...(payload.meta ? { meta: payload.meta } : {}),
  };
};

api.interceptors.request.use((config) => {
  const token = storage.get('learnloop_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;

  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
    delete config.headers['content-type'];
  }

  return config;
});

api.interceptors.response.use(
  (response) => unwrapApiResponse(response.data),
  async (error) => {
    const original = error.config;
    const status = error.response?.status;
    const message = error.response?.data?.message || 'Something went wrong';

    if (status === 401) {
      storage.remove('learnloop_token');
      storage.remove('learnloop_user');
    }

    if (!original?.silent) toast.error(message);
    return Promise.reject(error.response?.data || error);
  },
);

export default api;
